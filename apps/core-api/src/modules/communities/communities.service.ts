import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import type { CreateCommunityDto } from './dto/create-community.dto';
import type { UpdateCommunityDto } from './dto/update-community.dto';

export type CommunityRecord = {
  community_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type CommunityUpdateData = {
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}

@Injectable()
export class CommunitiesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findActive(): Promise<CommunityRecord[]> {
    return this.prisma.community.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAllAdmin(): Promise<CommunityRecord[]> {
    return this.prisma.community.findMany({
      orderBy: [{ is_active: 'desc' }, { name: 'asc' }],
    });
  }

  async create(dto: CreateCommunityDto): Promise<CommunityRecord> {
    const name = dto.name.trim();
    try {
      return await this.prisma.community.create({
        data: {
          name,
          description: dto.description?.trim() || null,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(`Community name "${name}" already exists`);
      }
      throw error;
    }
  }

  async update(
    communityId: string,
    dto: UpdateCommunityDto,
  ): Promise<CommunityRecord> {
    await this.requireCommunity(communityId);

    const data: CommunityUpdateData = {};
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      data.description =
        dto.description === null ? null : dto.description.trim() || null;
    }
    if (dto.is_active !== undefined) {
      data.is_active = dto.is_active;
    }

    try {
      return await this.prisma.community.update({
        where: { community_id: communityId },
        data,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Community name "${dto.name?.trim()}" already exists`,
        );
      }
      throw error;
    }
  }

  async softDelete(communityId: string): Promise<CommunityRecord> {
    await this.requireCommunity(communityId);
    return this.prisma.community.update({
      where: { community_id: communityId },
      data: { is_active: false },
    });
  }

  private async requireCommunity(
    communityId: string,
  ): Promise<CommunityRecord> {
    const community = await this.prisma.community.findUnique({
      where: { community_id: communityId },
    });
    if (!community) {
      throw new NotFoundException(`Community ${communityId} not found`);
    }
    return community;
  }
}
