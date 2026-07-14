import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { AllowedEmailDomainsService } from '../allowed-email-domains/allowed-email-domains.service';
import { UsersService } from './users.service';

jest.mock('../../database', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../database';

describe('UsersService', () => {
  let service: UsersService;

  const authUser: AuthenticatedUser = {
    pollarUserId: 'usr_test_1',
    email: 'test@example.com',
    accessToken: 'token',
  };

  const mockUser = {
    user_id: '11111111-1111-1111-1111-111111111111',
    pollar_user_id: 'usr_test_1',
    email: 'test@example.com',
    display_name: null,
    avatar_url: null,
    roles: [UserRole.COMMUNITY_IMPLEMENTER],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    wallets: [
      {
        wallet_id: '22222222-2222-2222-2222-222222222222',
        user_id: '11111111-1111-1111-1111-111111111111',
        pollar_wallet_id: 'wal_1',
        address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const allowedEmailDomainsMock = {
    isEmailDomainAllowed: jest.fn(),
    listActiveDomains: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: typeof prismaMock) => Promise<unknown>) => fn(prismaMock),
    );
    allowedEmailDomainsMock.isEmailDomainAllowed.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: AllowedEmailDomainsService,
          useValue: allowedEmailDomainsMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('sync', () => {
    it('creates a new user with the app role and wallet', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        ...mockUser,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(null);
      prismaMock.wallet.create.mockResolvedValueOnce(mockUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(mockUser);

      const result = await service.sync(authUser, {
        email: 'test@example.com',
        wallet_address:
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        pollar_wallet_id: 'wal_1',
        role: UserRole.COMMUNITY_IMPLEMENTER,
      });

      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(prismaMock.wallet.create).toHaveBeenCalled();
      expect(result.roles).toContain(UserRole.COMMUNITY_IMPLEMENTER);
      expect(
        allowedEmailDomainsMock.isEmailDomainAllowed,
      ).not.toHaveBeenCalled();
    });

    it('reuses an existing user matched by email when pollar id differs', async () => {
      const priorUser = {
        ...mockUser,
        pollar_user_id: 'usr_old_google',
        roles: [UserRole.CMINDS_OPERATOR],
      };
      const linkedUser = {
        ...priorUser,
        pollar_user_id: 'usr_test_1',
        roles: [UserRole.CMINDS_OPERATOR, UserRole.COMMUNITY_IMPLEMENTER],
      };

      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(priorUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...linkedUser,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.wallet.update.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(linkedUser);

      const result = await service.sync(authUser, {
        email: 'test@example.com',
        wallet_address:
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        role: UserRole.COMMUNITY_IMPLEMENTER,
      });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { user_id: priorUser.user_id },
        data: expect.objectContaining({
          pollar_user_id: 'usr_test_1',
          email: 'test@example.com',
          roles: [UserRole.CMINDS_OPERATOR, UserRole.COMMUNITY_IMPLEMENTER],
        }),
      });
      expect(result.roles).toEqual([
        UserRole.CMINDS_OPERATOR,
        UserRole.COMMUNITY_IMPLEMENTER,
      ]);
    });

    it('rejects CMINDS_OPERATOR sync when email domain is not allowlisted', async () => {
      allowedEmailDomainsMock.isEmailDomainAllowed.mockResolvedValueOnce(false);

      await expect(
        service.sync(
          { ...authUser, email: 'ops@gmail.com' },
          {
            email: 'ops@gmail.com',
            wallet_address:
              'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
            role: UserRole.CMINDS_OPERATOR,
          },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('allows CMINDS_OPERATOR sync when email domain is allowlisted', async () => {
      const operatorUser = {
        ...mockUser,
        email: 'ops@trustlesswork.com',
        roles: [UserRole.CMINDS_OPERATOR],
      };
      allowedEmailDomainsMock.isEmailDomainAllowed.mockResolvedValueOnce(true);
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        ...operatorUser,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(null);
      prismaMock.wallet.create.mockResolvedValueOnce(operatorUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(operatorUser);

      await service.sync(
        { ...authUser, email: 'ops@trustlesswork.com' },
        {
          email: 'ops@trustlesswork.com',
          wallet_address:
            'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          role: UserRole.CMINDS_OPERATOR,
        },
      );

      expect(allowedEmailDomainsMock.isEmailDomainAllowed).toHaveBeenCalledWith(
        'ops@trustlesswork.com',
      );
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('adds a missing role on an existing user without duplicating', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.COMMUNITY_IMPLEMENTER],
      });
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.COMMUNITY_IMPLEMENTER, UserRole.FUNDER],
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(mockUser.wallets[0]);
      prismaMock.wallet.update.mockResolvedValueOnce(mockUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.COMMUNITY_IMPLEMENTER, UserRole.FUNDER],
      });

      const result = await service.sync(authUser, {
        email: 'test@example.com',
        wallet_address:
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        role: UserRole.FUNDER,
      });

      expect(prismaMock.user.update).toHaveBeenCalled();
      const [[updateArg]] = prismaMock.user.update.mock.calls as [
        [{ data: { roles: UserRole[] } }],
      ];
      expect(updateArg.data.roles).toEqual([
        UserRole.COMMUNITY_IMPLEMENTER,
        UserRole.FUNDER,
      ]);
      expect(result.roles).toEqual([
        UserRole.COMMUNITY_IMPLEMENTER,
        UserRole.FUNDER,
      ]);
    });
  });

  describe('findMe', () => {
    it('returns the user profile when synced', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      await expect(service.findMe(authUser)).resolves.toEqual(mockUser);
    });

    it('throws NotFoundException when user was never synced', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.findMe(authUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        is_active: false,
      });
      await expect(service.findMe(authUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('searchByRoleAndEmail', () => {
    it('returns users with wallets matching role and email', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([
        {
          ...mockUser,
          roles: [UserRole.CMINDS_OPERATOR],
        },
      ]);

      await expect(
        service.searchByRoleAndEmail({
          role: UserRole.CMINDS_OPERATOR,
          q: 'test',
        }),
      ).resolves.toEqual([
        {
          user_id: mockUser.user_id,
          email: mockUser.email,
          display_name: mockUser.display_name,
          wallet_address: mockUser.wallets[0].address,
        },
      ]);
    });

    it('throws ForbiddenException for non-searchable roles', async () => {
      await expect(
        service.searchByRoleAndEmail({ role: UserRole.FUNDER }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('searches all roles when role is omitted', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([mockUser]);

      await expect(
        service.searchByRoleAndEmail({ q: 'test' }),
      ).resolves.toEqual([
        {
          user_id: mockUser.user_id,
          email: mockUser.email,
          display_name: mockUser.display_name,
          wallet_address: mockUser.wallets[0].address,
        },
      ]);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
            email: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      );
      expect(prismaMock.user.findMany.mock.calls[0][0].where.roles).toBeUndefined();
    });
  });
});
