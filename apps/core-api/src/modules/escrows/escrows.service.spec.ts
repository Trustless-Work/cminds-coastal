import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EscrowStatus, UserRole } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { UsersService } from '../users/users.service';
import { EscrowsService } from './escrows.service';

jest.mock('../../database', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../database';

describe('EscrowsService', () => {
  let service: EscrowsService;

  const authUser: AuthenticatedUser = {
    pollarUserId: 'usr_1',
    email: 'community@example.com',
    accessToken: 'token',
  };

  const initializer = {
    user_id: '11111111-1111-1111-1111-111111111111',
    roles: [UserRole.COMMUNITY_IMPLEMENTER],
    is_active: true,
  };

  const prismaMock = {
    user: { findUnique: jest.fn() },
    task: { findMany: jest.fn() },
    community: { findUnique: jest.fn(), findMany: jest.fn() },
    escrow: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const usersServiceMock = {
    requireSyncedUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    usersServiceMock.requireSyncedUser.mockResolvedValue(initializer);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = module.get(EscrowsService);
  });

  it('should throw ForbiddenException when user is not community implementer', async () => {
    usersServiceMock.requireSyncedUser.mockResolvedValue({
      ...initializer,
      roles: [UserRole.FUNDER],
    });

    await expect(
      service.create(authUser, {
        escrow_id:
          'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
        title: 'Test',
        community_id: '55555555-5555-5555-5555-555555555555',
        description: 'Desc',
        engagement_id: 'ENG-1',
        approver_user_id: '22222222-2222-2222-2222-222222222222',
        release_signer_user_id: '33333333-3333-3333-3333-333333333333',
        milestones: [
          {
            task_id: '44444444-4444-4444-4444-444444444444',
            milestone_index: 0,
            amount: 100,
          },
        ],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException when approver is not CMINDS_OPERATOR', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        user_id: '22222222-2222-2222-2222-222222222222',
        roles: [UserRole.FUNDER],
        is_active: true,
        wallets: [{ address: 'GAAA' }],
      })
      .mockResolvedValueOnce({
        user_id: '33333333-3333-3333-3333-333333333333',
        roles: [UserRole.COMMUNITY_IMPLEMENTER],
        is_active: true,
        wallets: [{ address: 'GBBB' }],
      });

    await expect(
      service.create(authUser, {
        escrow_id:
          'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
        title: 'Test',
        community_id: '55555555-5555-5555-5555-555555555555',
        description: 'Desc',
        engagement_id: 'ENG-1',
        approver_user_id: '22222222-2222-2222-2222-222222222222',
        release_signer_user_id: '33333333-3333-3333-3333-333333333333',
        milestones: [
          {
            task_id: '44444444-4444-4444-4444-444444444444',
            milestone_index: 0,
            amount: 100,
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should list public funding escrows excluding draft and cancelled', async () => {
    prismaMock.escrow.findMany.mockResolvedValue([]);

    const result = await service.findFundingPublic({});

    expect(result).toEqual({ items: [], nextCursor: null, hasMore: false });
    expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              status: {
                notIn: [EscrowStatus.DRAFT, EscrowStatus.CANCELLED],
              },
            },
          ],
        },
        take: 13,
        orderBy: [{ created_at: 'desc' }, { escrow_id: 'desc' }],
      }),
    );
  });

  it('should paginate funding escrows with cursor and hasMore', async () => {
    const older = new Date('2026-01-01T00:00:00.000Z');
    const newer = new Date('2026-01-02T00:00:00.000Z');
    prismaMock.escrow.findMany.mockResolvedValue([
      {
        escrow_id: 'C-NEW',
        created_at: newer,
        status: EscrowStatus.INITIALIZED,
      },
      {
        escrow_id: 'C-OLD',
        created_at: older,
        status: EscrowStatus.INITIALIZED,
      },
      {
        escrow_id: 'C-EXTRA',
        created_at: older,
        status: EscrowStatus.FUNDED,
      },
    ]);

    const result = await service.findFundingPublic({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3 }),
    );
  });

  it('should coerce string limit to int for Prisma take', async () => {
    prismaMock.escrow.findMany.mockResolvedValue([]);

    await service.findFundingPublic({
      limit: '12' as unknown as number,
    });

    expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 13 }),
    );
  });

  it('should filter funding escrows by status and search query', async () => {
    prismaMock.escrow.findMany.mockResolvedValue([]);

    await service.findFundingPublic({
      status: EscrowStatus.FUNDED,
      community_id: '55555555-5555-5555-5555-555555555555',
      q: 'mangrove',
    });

    expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            { status: EscrowStatus.FUNDED },
            { community_id: '55555555-5555-5555-5555-555555555555' },
            {
              OR: [
                { title: { contains: 'mangrove', mode: 'insensitive' } },
                {
                  community: {
                    name: {
                      contains: 'mangrove',
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  geographic_area: {
                    contains: 'mangrove',
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: 'mangrove',
                    mode: 'insensitive',
                  },
                },
                {
                  escrow_id: {
                    contains: 'mangrove',
                    mode: 'insensitive',
                  },
                },
              ],
            },
          ],
        },
      }),
    );
  });

  it('should return public funding facets from active communities', async () => {
    prismaMock.community.findMany.mockResolvedValue([
      { community_id: 'c1', name: 'Alpha' },
      { community_id: 'c2', name: 'Beta' },
    ]);

    const result = await service.findFundingPublicFacets();

    expect(result.communities).toEqual([
      { community_id: 'c1', name: 'Alpha' },
      { community_id: 'c2', name: 'Beta' },
    ]);
    expect(result.statuses).toEqual([
      EscrowStatus.INITIALIZED,
      EscrowStatus.FUNDED,
      EscrowStatus.IN_PROGRESS,
      EscrowStatus.PAUSED,
      EscrowStatus.COMPLETED,
    ]);
  });

  it('should throw BadRequestException for invalid cursor', async () => {
    await expect(
      service.findFundingPublic({ cursor: 'not-a-valid-cursor' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException for cancelled public funding escrow', async () => {
    prismaMock.escrow.findUnique.mockResolvedValue({
      escrow_id: 'C123',
      status: EscrowStatus.CANCELLED,
    });

    await expect(service.findFundingPublicByContract('C123')).rejects.toThrow(
      'Escrow C123 not found',
    );
  });
});
