import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, UserRole } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { AuthIdentityService } from '../../auth/services/auth-identity.service';
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
    supabase_user_id: null as string | null,
    email: 'test@example.com',
    display_name: null,
    avatar_url: null,
    auth_providers: [] as AuthProvider[],
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
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    community: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const allowedEmailDomainsMock = {
    isEmailDomainAllowed: jest.fn(),
    listActiveDomains: jest.fn(),
  };

  const authIdentityMock = {
    findUserByAuthIdentity: jest.fn(),
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
        {
          provide: AuthIdentityService,
          useValue: authIdentityMock,
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
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: priorUser.user_id },
          data: expect.objectContaining({
            pollar_user_id: 'usr_test_1',
            email: 'test@example.com',
            roles: [UserRole.CMINDS_OPERATOR, UserRole.COMMUNITY_IMPLEMENTER],
          }) as Record<string, unknown>,
        }),
      );
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

    it('links email user to Google and unions auth_providers', async () => {
      const priorUser = {
        ...mockUser,
        pollar_user_id: 'usr_email_only',
        auth_providers: [AuthProvider.EMAIL],
      };
      const linkedUser = {
        ...priorUser,
        pollar_user_id: 'usr_test_1',
        auth_providers: [AuthProvider.EMAIL, AuthProvider.GOOGLE],
        avatar_url: 'https://lh3.googleusercontent.com/a/photo',
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
        auth_providers: [AuthProvider.GOOGLE],
        avatar_url: 'https://lh3.googleusercontent.com/a/photo',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: priorUser.user_id },
          data: expect.objectContaining({
            pollar_user_id: 'usr_test_1',
            auth_providers: [AuthProvider.EMAIL, AuthProvider.GOOGLE],
            avatar_url: 'https://lh3.googleusercontent.com/a/photo',
          }) as Record<string, unknown>,
        }),
      );
      expect(result.auth_providers).toEqual([
        AuthProvider.EMAIL,
        AuthProvider.GOOGLE,
      ]);
    });

    it('keeps existing avatar when incoming avatar is empty', async () => {
      const priorUser = {
        ...mockUser,
        avatar_url: 'https://lh3.googleusercontent.com/a/photo',
        auth_providers: [AuthProvider.GOOGLE],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(priorUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...priorUser,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.wallet.update.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(priorUser);

      await service.sync(authUser, {
        email: 'test@example.com',
        wallet_address:
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        role: UserRole.COMMUNITY_IMPLEMENTER,
        auth_providers: [AuthProvider.EMAIL],
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: priorUser.user_id },
          data: expect.objectContaining({
            avatar_url: 'https://lh3.googleusercontent.com/a/photo',
          }) as Record<string, unknown>,
        }),
      );
    });

    it('fills null avatar when Google provides an avatar url', async () => {
      const priorUser = {
        ...mockUser,
        avatar_url: null,
        auth_providers: [AuthProvider.EMAIL],
      };
      const googleAvatar = 'https://lh3.googleusercontent.com/a/new-photo';

      prismaMock.user.findUnique.mockResolvedValueOnce(priorUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...priorUser,
        avatar_url: googleAvatar,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.wallet.update.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
        ...priorUser,
        avatar_url: googleAvatar,
      });

      await service.sync(authUser, {
        email: 'test@example.com',
        wallet_address:
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        role: UserRole.COMMUNITY_IMPLEMENTER,
        auth_providers: [AuthProvider.GOOGLE],
        avatar_url: googleAvatar,
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: priorUser.user_id },
          data: expect.objectContaining({
            avatar_url: googleAvatar,
          }) as Record<string, unknown>,
        }),
      );
    });

    it('does not drop GOOGLE when a later EMAIL-only sync arrives', async () => {
      const priorUser = {
        ...mockUser,
        auth_providers: [AuthProvider.EMAIL, AuthProvider.GOOGLE],
        avatar_url: 'https://lh3.googleusercontent.com/a/photo',
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(priorUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...priorUser,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.wallet.update.mockResolvedValueOnce(priorUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(priorUser);

      await service.sync(authUser, {
        email: 'test@example.com',
        wallet_address:
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        role: UserRole.COMMUNITY_IMPLEMENTER,
        auth_providers: [AuthProvider.EMAIL],
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: priorUser.user_id },
          data: expect.objectContaining({
            auth_providers: [AuthProvider.EMAIL, AuthProvider.GOOGLE],
          }) as Record<string, unknown>,
        }),
      );
    });
  });

  describe('findMe', () => {
    it('returns the user profile when synced', async () => {
      authIdentityMock.findUserByAuthIdentity.mockResolvedValueOnce({
        user_id: mockUser.user_id,
        roles: mockUser.roles,
        is_active: true,
        supabase_user_id: null,
      });
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      await expect(service.findMe(authUser)).resolves.toEqual(mockUser);
    });

    it('throws NotFoundException when user was never synced', async () => {
      authIdentityMock.findUserByAuthIdentity.mockResolvedValueOnce(null);
      await expect(service.findMe(authUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      authIdentityMock.findUserByAuthIdentity.mockResolvedValueOnce({
        user_id: mockUser.user_id,
        roles: mockUser.roles,
        is_active: false,
        supabase_user_id: null,
      });
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
      prismaMock.user.count.mockResolvedValueOnce(1);
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
      ).resolves.toEqual({
        items: [
          {
            user_id: mockUser.user_id,
            email: mockUser.email,
            display_name: mockUser.display_name,
            avatar_url: mockUser.avatar_url,
            wallet_address: mockUser.wallets[0].address,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
        hasMore: false,
      });
    });

    it('throws ForbiddenException for non-searchable roles', async () => {
      await expect(
        service.searchByRoleAndEmail({ role: UserRole.FUNDER }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('searches all roles when role is omitted', async () => {
      prismaMock.user.count.mockResolvedValueOnce(1);
      prismaMock.user.findMany.mockResolvedValueOnce([mockUser]);

      await expect(
        service.searchByRoleAndEmail({ q: 'test' }),
      ).resolves.toEqual({
        items: [
          {
            user_id: mockUser.user_id,
            email: mockUser.email,
            display_name: mockUser.display_name,
            avatar_url: mockUser.avatar_url,
            wallet_address: mockUser.wallets[0].address,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
        hasMore: false,
      });

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
            wallets: { some: {} },
            email: { contains: 'test', mode: 'insensitive' },
          }) as Record<string, unknown>,
          skip: 0,
          take: 20,
        }),
      );
      const findManyCalls = prismaMock.user.findMany.mock.calls as Array<
        [{ where: { roles?: unknown } }]
      >;
      expect(findManyCalls[0]?.[0].where.roles).toBeUndefined();
    });

    it('paginates browse results without a query', async () => {
      prismaMock.user.count.mockResolvedValueOnce(45);
      prismaMock.user.findMany.mockResolvedValueOnce([mockUser]);

      await expect(
        service.searchByRoleAndEmail({ page: 2, pageSize: 20 }),
      ).resolves.toEqual({
        items: [
          {
            user_id: mockUser.user_id,
            email: mockUser.email,
            display_name: mockUser.display_name,
            avatar_url: mockUser.avatar_url,
            wallet_address: mockUser.wallets[0].address,
          },
        ],
        page: 2,
        pageSize: 20,
        total: 45,
        hasMore: true,
      });

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        }),
      );
    });
  });

  describe('updateProfile', () => {
    const communityId = '33333333-3333-3333-3333-333333333333';

    function mockCurrentUser(roles: UserRole[]): void {
      authIdentityMock.findUserByAuthIdentity.mockResolvedValueOnce({
        user_id: mockUser.user_id,
        roles,
        is_active: true,
        supabase_user_id: null,
      });
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        roles,
      });
    }

    it('updates the scalar profile fields', async () => {
      mockCurrentUser([UserRole.FUNDER]);
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUser,
        first_name: 'Ada',
        last_name: 'Lovelace',
        country: 'Costa Rica',
      });

      await service.updateProfile(authUser, {
        first_name: 'Ada',
        last_name: 'Lovelace',
        country: 'Costa Rica',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: mockUser.user_id },
          data: {
            first_name: 'Ada',
            last_name: 'Lovelace',
            country: 'Costa Rica',
          },
        }),
      );
    });

    it('throws NotFoundException when the user was never synced', async () => {
      authIdentityMock.findUserByAuthIdentity.mockResolvedValueOnce(null);

      await expect(
        service.updateProfile(authUser, { first_name: 'Ada' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('lets a community implementer link an existing community', async () => {
      mockCurrentUser([UserRole.COMMUNITY_IMPLEMENTER]);
      prismaMock.community.findUnique.mockResolvedValueOnce({
        community_id: communityId,
        is_active: true,
      });
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUser,
        community_id: communityId,
        community: { community_id: communityId, name: 'Playa Azul' },
      });

      const result = await service.updateProfile(authUser, {
        community_id: communityId,
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { community_id: communityId },
        }),
      );
      expect(result.community).toEqual({
        community_id: communityId,
        name: 'Playa Azul',
      });
    });

    it('throws ForbiddenException when a non-implementer sends a community', async () => {
      mockCurrentUser([UserRole.FUNDER]);

      await expect(
        service.updateProfile(authUser, { community_id: communityId }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.community.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the community does not exist', async () => {
      mockCurrentUser([UserRole.COMMUNITY_IMPLEMENTER]);
      prismaMock.community.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateProfile(authUser, { community_id: communityId }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getPublicProfile', () => {
    it('returns the full profile projection without wallet balance', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        first_name: 'Ada',
        last_name: 'Lovelace',
        phone_number: '+50688887777',
        country: 'Costa Rica',
        city: 'Puntarenas',
        bio: 'Coastal lead',
        community: { community_id: 'c1', name: 'Playa Azul' },
      });

      const result = await service.getPublicProfile(mockUser.user_id);

      expect(result).toEqual({
        user_id: mockUser.user_id,
        display_name: mockUser.display_name,
        first_name: 'Ada',
        last_name: 'Lovelace',
        avatar_url: mockUser.avatar_url,
        email: mockUser.email,
        phone_number: '+50688887777',
        country: 'Costa Rica',
        city: 'Puntarenas',
        bio: 'Coastal lead',
        roles: mockUser.roles,
        community: { community_id: 'c1', name: 'Playa Azul' },
        wallet_address: mockUser.wallets[0].address,
        created_at: mockUser.created_at,
      });
      expect(result).not.toHaveProperty('is_active');
      expect(result).not.toHaveProperty('supabase_user_id');
    });

    it('throws NotFoundException for an unknown user', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getPublicProfile('missing-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException for an inactive user', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        is_active: false,
      });

      await expect(
        service.getPublicProfile(mockUser.user_id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
