import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import type { AuthProvider, UserRole } from '../../generated/prisma/enums';
import { UserRole as UserRoleEnum } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { AuthIdentityService } from '../../auth/services/auth-identity.service';
import { AllowedEmailDomainsService } from '../allowed-email-domains/allowed-email-domains.service';
import type { SyncUserDto } from './dto/sync-user.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

/** Shared include so every UserProfile query returns the same shape. */
const USER_PROFILE_INCLUDE = {
  wallets: true,
  community: { select: { community_id: true, name: true } },
} as const;

export type UserWallet = {
  wallet_id: string;
  user_id: string;
  pollar_wallet_id: string | null;
  address: string;
  created_at: Date;
  updated_at: Date;
};

export type UserCommunitySummary = {
  community_id: string;
  name: string;
};

export type UserProfile = {
  user_id: string;
  pollar_user_id: string | null;
  supabase_user_id: string | null;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  community_id: string | null;
  auth_providers: AuthProvider[];
  roles: UserRole[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  wallets: UserWallet[];
  community: UserCommunitySummary | null;
};

export type PublicUserProfile = {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  roles: UserRole[];
  community: UserCommunitySummary | null;
  wallet_address: string | null;
  created_at: Date;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AllowedEmailDomainsService)
    private readonly allowedEmailDomainsService: AllowedEmailDomainsService,
    @Inject(AuthIdentityService)
    private readonly authIdentityService: AuthIdentityService,
  ) {}

  async sync(
    authUser: AuthenticatedUser,
    dto: SyncUserDto,
  ): Promise<UserProfile> {
    const pollarUserId = authUser.pollarUserId;
    if (!pollarUserId) {
      throw new UnauthorizedException(
        'Pollar identity is required for user sync',
      );
    }

    const email = (authUser.email ?? dto.email).trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Email is required to sync user');
    }

    if (dto.role === UserRoleEnum.CMINDS_OPERATOR) {
      const allowed =
        await this.allowedEmailDomainsService.isEmailDomainAllowed(email);
      if (!allowed) {
        throw new ForbiddenException(
          'Email domain is not allowed for CMinds operators',
        );
      }
    }

    const displayName = dto.display_name?.trim() || null;
    const avatarUrl = this.normalizeAvatarUrl(dto.avatar_url);
    const walletAddress = dto.wallet_address.trim();
    const pollarWalletId = dto.pollar_wallet_id?.trim() || null;
    const incomingProviders = dto.auth_providers ?? [];

    type UserRecord = Omit<UserProfile, 'wallets' | 'community'>;

    return this.prisma.$transaction(async (tx) => {
      const byPollarId = await tx.user.findUnique({
        where: { pollar_user_id: pollarUserId },
        include: { wallets: true },
      });

      const byEmail =
        byPollarId === null
          ? await tx.user.findUnique({
              where: { email },
              include: { wallets: true },
            })
          : null;

      const existing = byPollarId ?? byEmail;

      let user: UserRecord;

      if (existing) {
        const roles = this.mergeRole(existing.roles, dto.role);
        const authProviders = this.mergeAuthProviders(
          existing.auth_providers,
          incomingProviders,
        );
        user = await tx.user.update({
          where: { user_id: existing.user_id },
          data: {
            pollar_user_id: pollarUserId,
            email,
            display_name: displayName ?? existing.display_name,
            avatar_url: avatarUrl ?? existing.avatar_url,
            auth_providers: authProviders,
            roles,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            pollar_user_id: pollarUserId,
            email,
            display_name: displayName,
            avatar_url: avatarUrl,
            auth_providers: this.mergeAuthProviders([], incomingProviders),
            roles: [dto.role],
          },
        });
      }

      const existingWallet = await tx.wallet.findUnique({
        where: { address: walletAddress },
      });

      if (existingWallet && existingWallet.user_id !== user.user_id) {
        throw new UnauthorizedException(
          'Wallet address is already linked to another user',
        );
      }

      if (existingWallet) {
        await tx.wallet.update({
          where: { wallet_id: existingWallet.wallet_id },
          data: {
            pollar_wallet_id: pollarWalletId ?? existingWallet.pollar_wallet_id,
          },
        });
      } else {
        await tx.wallet.create({
          data: {
            user_id: user.user_id,
            address: walletAddress,
            pollar_wallet_id: pollarWalletId,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { user_id: user.user_id },
        include: USER_PROFILE_INCLUDE,
      });
    });
  }

  async findMe(authUser: AuthenticatedUser): Promise<UserProfile> {
    const user = await this.findByAuthIdentity(authUser);

    if (!user) {
      throw new NotFoundException(
        authUser.supabaseUserId
          ? 'Admin user not provisioned — create Auth user + ADMIN role via ops'
          : 'User not found — call POST /users/sync after Pollar login',
      );
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  private async findByAuthIdentity(
    authUser: AuthenticatedUser,
  ): Promise<UserProfile | null> {
    if (!authUser.supabaseUserId && !authUser.pollarUserId) {
      throw new UnauthorizedException('Token missing user identity');
    }

    const identity =
      await this.authIdentityService.findUserByAuthIdentity(authUser);

    if (!identity) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: { user_id: identity.user_id },
      include: USER_PROFILE_INCLUDE,
    });
  }

  async requireSyncedUser(authUser: AuthenticatedUser): Promise<UserProfile> {
    return this.findMe(authUser);
  }

  async updateProfile(
    authUser: AuthenticatedUser,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const user = await this.findByAuthIdentity(authUser);

    if (!user) {
      throw new NotFoundException(
        'User not found — call POST /users/sync after Pollar login',
      );
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    if (dto.community_id) {
      if (!user.roles.includes(UserRoleEnum.COMMUNITY_IMPLEMENTER)) {
        throw new ForbiddenException(
          'Only community implementers can belong to a community',
        );
      }

      const community = await this.prisma.community.findUnique({
        where: { community_id: dto.community_id },
        select: { community_id: true, is_active: true },
      });

      if (!community || !community.is_active) {
        throw new BadRequestException('Community does not exist');
      }
    }

    const data: {
      first_name?: string | null;
      last_name?: string | null;
      phone_number?: string | null;
      country?: string | null;
      city?: string | null;
      bio?: string | null;
      community_id?: string | null;
    } = {};

    if (dto.first_name !== undefined) data.first_name = dto.first_name;
    if (dto.last_name !== undefined) data.last_name = dto.last_name;
    if (dto.phone_number !== undefined) data.phone_number = dto.phone_number;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.community_id !== undefined) data.community_id = dto.community_id;

    return this.prisma.user.update({
      where: { user_id: user.user_id },
      data,
      include: USER_PROFILE_INCLUDE,
    });
  }

  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: USER_PROFILE_INCLUDE,
    });

    if (!user || !user.is_active) {
      throw new NotFoundException('User not found');
    }

    return {
      user_id: user.user_id,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      email: user.email,
      phone_number: user.phone_number,
      country: user.country,
      city: user.city,
      bio: user.bio,
      roles: user.roles,
      community: user.community,
      wallet_address: user.wallets[0]?.address ?? null,
      created_at: user.created_at,
    };
  }

  async searchByRoleAndEmail(params: {
    role?: UserRole;
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<UserSearchPage> {
    const allowedSearchRoles: UserRole[] = [
      UserRoleEnum.CMINDS_OPERATOR,
      UserRoleEnum.COMMUNITY_IMPLEMENTER,
    ];
    if (params.role && !allowedSearchRoles.includes(params.role)) {
      throw new ForbiddenException(
        'Only CMINDS_OPERATOR and COMMUNITY_IMPLEMENTER can be filtered by role',
      );
    }

    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize =
      params.pageSize && params.pageSize > 0
        ? Math.min(params.pageSize, 50)
        : 20;
    const query = params.q?.trim().toLowerCase();

    const where = {
      is_active: true,
      wallets: { some: {} },
      ...(params.role ? { roles: { has: params.role } } : {}),
      ...(query
        ? {
            email: { contains: query, mode: 'insensitive' as const },
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { wallets: true },
        orderBy: { email: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const items: UserSearchResult[] = [];
    for (const user of users) {
      const wallet = user.wallets[0];
      if (!wallet) {
        continue;
      }
      items.push({
        user_id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        wallet_address: wallet.address,
      });
    }

    return {
      items,
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
    };
  }

  private normalizeAvatarUrl(avatarUrl: string | undefined): string | null {
    const trimmed = avatarUrl?.trim();
    return trimmed || null;
  }

  private mergeAuthProviders(
    existing: AuthProvider[],
    incoming: AuthProvider[],
  ): AuthProvider[] {
    const merged = new Set<AuthProvider>(existing);
    for (const provider of incoming) {
      merged.add(provider);
    }
    return [...merged];
  }

  private mergeRole(existing: UserRole[], role: UserRole): UserRole[] {
    if (existing.includes(role)) {
      return existing;
    }
    return [...existing, role];
  }
}

export type UserSearchResult = {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  wallet_address: string;
};

export type UserSearchPage = {
  items: UserSearchResult[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
