import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
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

  const cmindsOperator = {
    user_id: '22222222-2222-2222-2222-222222222222',
    roles: [UserRole.CMINDS_OPERATOR],
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
      update: jest.fn(),
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

  describe('findParticipating', () => {
    it('should list escrows for initializer', async () => {
      prismaMock.escrow.findMany.mockResolvedValue([]);

      await service.findParticipating(authUser, 'initializer');

      expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { initializer_user_id: initializer.user_id },
          orderBy: { created_at: 'desc' },
        }),
      );
    });

    it('should list escrows for approver', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findMany.mockResolvedValue([]);

      await service.findParticipating(authUser, 'approver');

      expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { approver_user_id: cmindsOperator.user_id },
        }),
      );
    });

    it('should list escrows for release signer', async () => {
      prismaMock.escrow.findMany.mockResolvedValue([]);

      await service.findParticipating(authUser, 'release_signer');

      expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { release_signer_user_id: initializer.user_id },
        }),
      );
    });

    it('should throw ForbiddenException when funder lists as approver', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue({
        ...initializer,
        roles: [UserRole.FUNDER],
      });

      await expect(
        service.findParticipating(authUser, 'approver'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when operator lists as initializer', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);

      await expect(
        service.findParticipating(authUser, 'initializer'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow RELEASE_SIGNER role for release_signer list', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue({
        user_id: '33333333-3333-3333-3333-333333333333',
        roles: [UserRole.RELEASE_SIGNER],
        is_active: true,
      });
      prismaMock.escrow.findMany.mockResolvedValue([]);

      await service.findParticipating(authUser, 'release_signer');

      expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            release_signer_user_id: '33333333-3333-3333-3333-333333333333',
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    const baseEscrow = {
      escrow_id: 'C-ESCROW',
      initializer_user_id: initializer.user_id,
      approver_user_id: cmindsOperator.user_id,
      release_signer_user_id: '33333333-3333-3333-3333-333333333333',
    };

    it('should allow assigned approver to view escrow', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(service.findOne(authUser, 'C-ESCROW')).resolves.toEqual(
        baseEscrow,
      );
    });

    it('should allow assigned release signer to view escrow', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue({
        user_id: '33333333-3333-3333-3333-333333333333',
        roles: [UserRole.RELEASE_SIGNER],
        is_active: true,
      });
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(service.findOne(authUser, 'C-ESCROW')).resolves.toEqual(
        baseEscrow,
      );
    });

    it('should forbid unrelated funder', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue({
        user_id: '99999999-9999-9999-9999-999999999999',
        roles: [UserRole.FUNDER],
        is_active: true,
      });
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(service.findOne(authUser, 'C-ESCROW')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when missing', async () => {
      prismaMock.escrow.findUnique.mockResolvedValue(null);

      await expect(service.findOne(authUser, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMetadata', () => {
    const baseEscrow = {
      escrow_id: 'C-ESCROW',
      title: 'Old',
      description: 'Old description',
      engagement_id: 'ENG-OLD',
      initializer_user_id: initializer.user_id,
      approver_user_id: cmindsOperator.user_id,
      release_signer_user_id: '33333333-3333-3333-3333-333333333333',
    };

    it('should update title, description, and engagement_id for CMinds operator', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);
      const updated = { ...baseEscrow, title: 'New', description: 'New desc', engagement_id: 'ENG-NEW' };
      prismaMock.escrow.update.mockResolvedValue(updated);

      await expect(
        service.updateMetadata(authUser, 'C-ESCROW', {
          title: 'New',
          description: 'New desc',
          engagement_id: 'ENG-NEW',
        }),
      ).resolves.toEqual(updated);

      expect(prismaMock.escrow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { escrow_id: 'C-ESCROW' },
          data: {
            title: 'New',
            description: 'New desc',
            engagement_id: 'ENG-NEW',
          },
        }),
      );
    });

    it('should forbid unrelated user', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue({
        user_id: '99999999-9999-9999-9999-999999999999',
        roles: [UserRole.FUNDER],
        is_active: true,
      });
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(
        service.updateMetadata(authUser, 'C-ESCROW', { title: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    const baseEscrow = {
      escrow_id: 'C-ESCROW',
      status: EscrowStatus.INITIALIZED,
      initializer_user_id: initializer.user_id,
      approver_user_id: cmindsOperator.user_id,
      release_signer_user_id: '33333333-3333-3333-3333-333333333333',
    };

    it('should allow CMinds operator to cancel', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);
      const updated = { ...baseEscrow, status: EscrowStatus.CANCELLED };
      prismaMock.escrow.update.mockResolvedValue(updated);

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.CANCELLED),
      ).resolves.toEqual(updated);

      expect(prismaMock.escrow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { escrow_id: 'C-ESCROW' },
          data: { status: EscrowStatus.CANCELLED },
        }),
      );
    });

    it('should forbid community implementer from cancelling', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(initializer);
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.CANCELLED),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow owner community implementer to mark completed', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(initializer);
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);
      const updated = { ...baseEscrow, status: EscrowStatus.COMPLETED };
      prismaMock.escrow.update.mockResolvedValue(updated);

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.COMPLETED),
      ).resolves.toEqual(updated);
    });

    it('should forbid non-owner community implementer from completing', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue({
        user_id: '99999999-9999-9999-9999-999999999999',
        roles: [UserRole.COMMUNITY_IMPLEMENTER],
        is_active: true,
      });
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.COMPLETED),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject cancelling a completed escrow', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue({
        ...baseEscrow,
        status: EscrowStatus.COMPLETED,
      });

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.CANCELLED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject completing a cancelled escrow', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue({
        ...baseEscrow,
        status: EscrowStatus.CANCELLED,
      });

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow CMinds operator to restore a cancelled escrow', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue({
        ...baseEscrow,
        status: EscrowStatus.CANCELLED,
      });
      const updated = { ...baseEscrow, status: EscrowStatus.INITIALIZED };
      prismaMock.escrow.update.mockResolvedValue(updated);

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.INITIALIZED),
      ).resolves.toEqual(updated);

      expect(prismaMock.escrow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { escrow_id: 'C-ESCROW' },
          data: { status: EscrowStatus.INITIALIZED },
        }),
      );
    });

    it('should forbid community implementer from restoring', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(initializer);
      prismaMock.escrow.findUnique.mockResolvedValue({
        ...baseEscrow,
        status: EscrowStatus.CANCELLED,
      });

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.INITIALIZED),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject restoring a non-cancelled escrow', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue(baseEscrow);

      await expect(
        service.updateStatus(authUser, 'C-ESCROW', EscrowStatus.INITIALIZED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when missing', async () => {
      usersServiceMock.requireSyncedUser.mockResolvedValue(cmindsOperator);
      prismaMock.escrow.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(authUser, 'missing', EscrowStatus.CANCELLED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
