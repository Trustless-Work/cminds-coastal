import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
        community_name: 'Community',
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
        community_name: 'Community',
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

    await service.findFundingPublic();

    expect(prismaMock.escrow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: {
            notIn: [EscrowStatus.DRAFT, EscrowStatus.CANCELLED],
          },
        },
      }),
    );
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
