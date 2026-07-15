import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EscrowStatus, UserRole } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { PrismaService } from '../../database';
import { UsersService } from '../users/users.service';
import type { CreateEscrowDto } from './dto/create-escrow.dto';

@Injectable()
export class EscrowsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async create(authUser: AuthenticatedUser, dto: CreateEscrowDto) {
    const initializer = await this.usersService.requireSyncedUser(authUser);

    if (!initializer.roles.includes(UserRole.COMMUNITY_IMPLEMENTER)) {
      throw new ForbiddenException(
        'Only community implementers can create escrows',
      );
    }

    const [approver, releaseSigner] = await Promise.all([
      this.prisma.user.findUnique({
        where: { user_id: dto.approver_user_id },
        include: { wallets: true },
      }),
      this.prisma.user.findUnique({
        where: { user_id: dto.release_signer_user_id },
        include: { wallets: true },
      }),
    ]);

    if (
      !approver?.is_active ||
      !approver.roles.includes(UserRole.CMINDS_OPERATOR)
    ) {
      throw new BadRequestException(
        'approver_user_id must be an active CMINDS_OPERATOR',
      );
    }

    if (
      !releaseSigner?.is_active ||
      !releaseSigner.roles.includes(UserRole.COMMUNITY_IMPLEMENTER)
    ) {
      throw new BadRequestException(
        'release_signer_user_id must be an active COMMUNITY_IMPLEMENTER',
      );
    }

    if (approver.wallets.length === 0 || releaseSigner.wallets.length === 0) {
      throw new BadRequestException(
        'Approver and release signer must have a linked wallet',
      );
    }

    const taskIds = dto.milestones.map((m) => m.task_id);
    const uniqueTaskIds = new Set(taskIds);
    if (uniqueTaskIds.size !== taskIds.length) {
      throw new BadRequestException('Duplicate task_id in milestones');
    }

    const tasks = await this.prisma.task.findMany({
      where: { task_id: { in: taskIds }, is_active: true },
    });
    if (tasks.length !== taskIds.length) {
      throw new BadRequestException('One or more task_ids are invalid');
    }

    const existing = await this.prisma.escrow.findUnique({
      where: { escrow_id: dto.escrow_id },
    });
    if (existing) {
      throw new BadRequestException(
        'Escrow with this escrow_id already exists',
      );
    }

    return this.prisma.escrow.create({
      data: {
        escrow_id: dto.escrow_id,
        title: dto.title.trim(),
        community_name: dto.community_name.trim(),
        description: dto.description.trim(),
        geographic_area: dto.geographic_area?.trim() || null,
        image_url: dto.image_url?.trim() || null,
        engagement_id: dto.engagement_id.trim(),
        status: EscrowStatus.INITIALIZED,
        initializer_user_id: initializer.user_id,
        approver_user_id: approver.user_id,
        release_signer_user_id: releaseSigner.user_id,
        milestones: {
          create: dto.milestones.map((milestone) => ({
            task_id: milestone.task_id,
            milestone_index: milestone.milestone_index,
            amount: milestone.amount,
            deadline: milestone.deadline ? new Date(milestone.deadline) : null,
            custom_description: milestone.custom_description?.trim() || null,
          })),
        },
      },
      include: {
        milestones: {
          include: { task: true },
          orderBy: { milestone_index: 'asc' },
        },
        approver: {
          select: { user_id: true, email: true, display_name: true },
        },
        release_signer: {
          select: { user_id: true, email: true, display_name: true },
        },
      },
    });
  }

  async findMine(authUser: AuthenticatedUser) {
    const user = await this.usersService.requireSyncedUser(authUser);

    return this.prisma.escrow.findMany({
      where: { initializer_user_id: user.user_id },
      include: {
        milestones: {
          include: { task: true },
          orderBy: { milestone_index: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(authUser: AuthenticatedUser, escrowId: string) {
    const user = await this.usersService.requireSyncedUser(authUser);
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrow_id: escrowId },
      include: {
        milestones: {
          include: { task: true },
          orderBy: { milestone_index: 'asc' },
        },
        approver: {
          select: { user_id: true, email: true, display_name: true },
        },
        release_signer: {
          select: { user_id: true, email: true, display_name: true },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException(`Escrow ${escrowId} not found`);
    }

    const isOwner = escrow.initializer_user_id === user.user_id;
    const isCminds = user.roles.includes(UserRole.CMINDS_OPERATOR);
    if (!isOwner && !isCminds) {
      throw new ForbiddenException('Not allowed to view this escrow');
    }

    return escrow;
  }

  /**
   * Public funding catalog — initialized (and later) escrows only.
   * No PII beyond community-facing escrow fields.
   */
  async findFundingPublic() {
    return this.prisma.escrow.findMany({
      where: {
        status: {
          notIn: [EscrowStatus.DRAFT, EscrowStatus.CANCELLED],
        },
      },
      include: {
        milestones: {
          include: { task: true },
          orderBy: { milestone_index: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findFundingPublicByContract(contractId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrow_id: contractId },
      include: {
        milestones: {
          include: { task: true },
          orderBy: { milestone_index: 'asc' },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException(`Escrow ${contractId} not found`);
    }

    if (
      escrow.status === EscrowStatus.DRAFT ||
      escrow.status === EscrowStatus.CANCELLED
    ) {
      throw new NotFoundException(`Escrow ${contractId} not found`);
    }

    return escrow;
  }
}
