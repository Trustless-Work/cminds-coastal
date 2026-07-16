import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { EscrowStatus, UserRole } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { PrismaService } from '../../database';
import { UsersService } from '../users/users.service';
import type { CreateEscrowDto } from './dto/create-escrow.dto';
import {
  PUBLIC_FUNDING_STATUSES,
  type ListFundingEscrowsQueryDto,
} from './dto/list-funding-escrows-query.dto';
import type { ParticipatingRole } from './dto/list-participating-escrows-query.dto';

type FundingCursorPayload = {
  createdAt: string;
  escrowId: string;
};

const DEFAULT_FUNDING_PAGE_SIZE = 12;
const FUNDING_EXCLUDED_STATUSES: EscrowStatus[] = [
  EscrowStatus.DRAFT,
  EscrowStatus.CANCELLED,
];

const COMMUNITY_SELECT = {
  community_id: true,
  name: true,
  description: true,
  is_active: true,
} as const;

const FUNDING_LIST_INCLUDE = {
  community: { select: COMMUNITY_SELECT },
  milestones: {
    include: { task: true },
    orderBy: { milestone_index: 'asc' as const },
  },
} satisfies Prisma.EscrowInclude;

const PARTICIPATING_LIST_INCLUDE = {
  community: { select: COMMUNITY_SELECT },
  milestones: {
    include: { task: true },
    orderBy: { milestone_index: 'asc' as const },
  },
} satisfies Prisma.EscrowInclude;

const DETAIL_INCLUDE = {
  community: { select: COMMUNITY_SELECT },
  milestones: {
    include: { task: true },
    orderBy: { milestone_index: 'asc' as const },
  },
  approver: {
    select: { user_id: true, email: true, display_name: true },
  },
  release_signer: {
    select: { user_id: true, email: true, display_name: true },
  },
} satisfies Prisma.EscrowInclude;

function encodeFundingCursor(createdAt: Date, escrowId: string): string {
  const payload: FundingCursorPayload = {
    createdAt: createdAt.toISOString(),
    escrowId,
  };
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeFundingCursor(cursor: string): FundingCursorPayload {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('createdAt' in parsed) ||
      !('escrowId' in parsed)
    ) {
      throw new Error('Invalid shape');
    }
    const { createdAt, escrowId } = parsed as FundingCursorPayload;
    if (typeof createdAt !== 'string' || typeof escrowId !== 'string') {
      throw new Error('Invalid fields');
    }
    if (Number.isNaN(Date.parse(createdAt)) || escrowId.length === 0) {
      throw new Error('Invalid values');
    }
    return { createdAt, escrowId };
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}

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

    const community = await this.prisma.community.findUnique({
      where: { community_id: dto.community_id },
    });
    if (!community?.is_active) {
      throw new BadRequestException(
        'community_id must reference an active community',
      );
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
        community_id: dto.community_id,
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
        community: { select: COMMUNITY_SELECT },
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
    return this.findParticipating(authUser, 'initializer');
  }

  async findParticipating(
    authUser: AuthenticatedUser,
    as: ParticipatingRole,
  ) {
    const user = await this.usersService.requireSyncedUser(authUser);
    this.assertParticipatingRole(user.roles, as);

    const where = this.buildParticipatingWhere(user.user_id, as);

    return this.prisma.escrow.findMany({
      where,
      include: PARTICIPATING_LIST_INCLUDE,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(authUser: AuthenticatedUser, escrowId: string) {
    const user = await this.usersService.requireSyncedUser(authUser);
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrow_id: escrowId },
      include: {
        community: { select: COMMUNITY_SELECT },
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
    const isAssignedApprover = escrow.approver_user_id === user.user_id;
    const isAssignedReleaseSigner =
      escrow.release_signer_user_id === user.user_id;
    const isCminds = user.roles.includes(UserRole.CMINDS_OPERATOR);

    if (
      !isOwner &&
      !isAssignedApprover &&
      !isAssignedReleaseSigner &&
      !isCminds
    ) {
      throw new ForbiddenException('Not allowed to view this escrow');
    }

    return escrow;
  }

  async updateMetadata(
    authUser: AuthenticatedUser,
    escrowId: string,
    dto: {
      title?: string;
      description?: string;
      engagement_id?: string;
    },
  ) {
    const user = await this.usersService.requireSyncedUser(authUser);
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrow_id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException(`Escrow ${escrowId} not found`);
    }

    const isOwner = escrow.initializer_user_id === user.user_id;
    const isAssignedApprover = escrow.approver_user_id === user.user_id;
    const isCminds = user.roles.includes(UserRole.CMINDS_OPERATOR);

    if (!isOwner && !isAssignedApprover && !isCminds) {
      throw new ForbiddenException('Not allowed to update this escrow');
    }

    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.engagement_id === undefined
    ) {
      throw new BadRequestException('At least one field is required');
    }

    const data: {
      title?: string;
      description?: string;
      engagement_id?: string;
    } = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }
    if (dto.engagement_id !== undefined) {
      data.engagement_id = dto.engagement_id.trim();
    }

    return this.prisma.escrow.update({
      where: { escrow_id: escrowId },
      data,
      include: DETAIL_INCLUDE,
    });
  }

  async updateStatus(
    authUser: AuthenticatedUser,
    escrowId: string,
    status: EscrowStatus.CANCELLED | EscrowStatus.COMPLETED,
  ) {
    const user = await this.usersService.requireSyncedUser(authUser);
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrow_id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException(`Escrow ${escrowId} not found`);
    }

    const isOwner = escrow.initializer_user_id === user.user_id;
    const isCminds = user.roles.includes(UserRole.CMINDS_OPERATOR);
    const isCommunityImplementer = user.roles.includes(
      UserRole.COMMUNITY_IMPLEMENTER,
    );

    if (status === EscrowStatus.CANCELLED) {
      if (!isCminds) {
        throw new ForbiddenException(
          'Only CMINDS_OPERATOR can cancel an escrow',
        );
      }
      if (escrow.status === EscrowStatus.CANCELLED) {
        throw new BadRequestException('Escrow is already cancelled');
      }
      if (escrow.status === EscrowStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed escrow');
      }
    }

    if (status === EscrowStatus.COMPLETED) {
      if (!isCminds && !(isCommunityImplementer && isOwner)) {
        throw new ForbiddenException(
          'Not allowed to mark this escrow as completed',
        );
      }
      if (escrow.status === EscrowStatus.COMPLETED) {
        throw new BadRequestException('Escrow is already completed');
      }
      if (escrow.status === EscrowStatus.CANCELLED) {
        throw new BadRequestException('Cannot complete a cancelled escrow');
      }
    }

    return this.prisma.escrow.update({
      where: { escrow_id: escrowId },
      data: { status },
      include: DETAIL_INCLUDE,
    });
  }

  private assertParticipatingRole(
    roles: UserRole[],
    as: ParticipatingRole,
  ): void {
    if (as === 'approver') {
      if (!roles.includes(UserRole.CMINDS_OPERATOR)) {
        throw new ForbiddenException(
          'Only CMINDS_OPERATOR can list escrows as approver',
        );
      }
      return;
    }

    if (as === 'initializer') {
      if (!roles.includes(UserRole.COMMUNITY_IMPLEMENTER)) {
        throw new ForbiddenException(
          'Only COMMUNITY_IMPLEMENTER can list escrows as initializer',
        );
      }
      return;
    }

    const canRelease =
      roles.includes(UserRole.COMMUNITY_IMPLEMENTER) ||
      roles.includes(UserRole.RELEASE_SIGNER);
    if (!canRelease) {
      throw new ForbiddenException(
        'Only COMMUNITY_IMPLEMENTER or RELEASE_SIGNER can list escrows as release signer',
      );
    }
  }

  private buildParticipatingWhere(
    userId: string,
    as: ParticipatingRole,
  ): Prisma.EscrowWhereInput {
    switch (as) {
      case 'initializer':
        return { initializer_user_id: userId };
      case 'approver':
        return { approver_user_id: userId };
      case 'release_signer':
        return { release_signer_user_id: userId };
    }
  }

  /**
   * Public funding catalog — initialized (and later) escrows only.
   * Cursor-based pagination with optional status / community / text filters.
   */
  async findFundingPublic(query: ListFundingEscrowsQueryDto = {}) {
    const limit = this.resolveFundingPageSize(query.limit);
    const where = this.buildFundingPublicWhere(query);

    const rows = await this.prisma.escrow.findMany({
      where,
      include: FUNDING_LIST_INCLUDE,
      orderBy: [{ created_at: 'desc' }, { escrow_id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeFundingCursor(last.created_at, last.escrow_id)
        : null;

    return { items, nextCursor, hasMore };
  }

  async findFundingPublicFacets() {
    const communities = await this.prisma.community.findMany({
      where: { is_active: true },
      select: { community_id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return {
      statuses: [...PUBLIC_FUNDING_STATUSES],
      communities,
    };
  }

  private resolveFundingPageSize(limit: number | undefined): number {
    const parsed =
      typeof limit === 'number' ? limit : Number(limit ?? Number.NaN);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      return DEFAULT_FUNDING_PAGE_SIZE;
    }
    return Math.min(50, Math.max(1, parsed));
  }

  private buildFundingPublicWhere(
    query: ListFundingEscrowsQueryDto,
  ): Prisma.EscrowWhereInput {
    const and: Prisma.EscrowWhereInput[] = [
      query.status
        ? { status: query.status }
        : { status: { notIn: FUNDING_EXCLUDED_STATUSES } },
    ];

    if (query.community_id) {
      and.push({ community_id: query.community_id });
    }

    if (query.q) {
      const q = query.q.trim();
      and.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          {
            community: {
              name: { contains: q, mode: 'insensitive' },
            },
          },
          { geographic_area: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { escrow_id: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (query.cursor) {
      const { createdAt, escrowId } = decodeFundingCursor(query.cursor);
      const cursorDate = new Date(createdAt);
      and.push({
        OR: [
          { created_at: { lt: cursorDate } },
          {
            AND: [
              { created_at: cursorDate },
              { escrow_id: { lt: escrowId } },
            ],
          },
        ],
      });
    }

    return { AND: and };
  }

  async findFundingPublicByContract(contractId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrow_id: contractId },
      include: {
        community: { select: COMMUNITY_SELECT },
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
