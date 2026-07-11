import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import type { UserRole } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import type { SyncUserDto } from './dto/sync-user.dto';

export type UserWallet = {
  wallet_id: string;
  user_id: string;
  pollar_wallet_id: string | null;
  address: string;
  created_at: Date;
  updated_at: Date;
};

export type UserProfile = {
  user_id: string;
  pollar_user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  wallets: UserWallet[];
};

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async sync(
    authUser: AuthenticatedUser,
    dto: SyncUserDto,
  ): Promise<UserProfile> {
    const email = (authUser.email ?? dto.email).trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Email is required to sync user');
    }

    const displayName = dto.display_name?.trim() || null;
    const avatarUrl = dto.avatar_url?.trim() || null;
    const walletAddress = dto.wallet_address.trim();
    const pollarWalletId = dto.pollar_wallet_id?.trim() || null;

    type UserRecord = Omit<UserProfile, 'wallets'>;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { pollar_user_id: authUser.pollarUserId },
        include: { wallets: true },
      });

      let user: UserRecord;

      if (existing) {
        const roles = this.mergeRole(existing.roles, dto.role);
        user = await tx.user.update({
          where: { user_id: existing.user_id },
          data: {
            email,
            display_name: displayName ?? existing.display_name,
            avatar_url: avatarUrl ?? existing.avatar_url,
            roles,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            pollar_user_id: authUser.pollarUserId,
            email,
            display_name: displayName,
            avatar_url: avatarUrl,
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
        include: { wallets: true },
      });
    });
  }

  async findMe(authUser: AuthenticatedUser): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { pollar_user_id: authUser.pollarUserId },
      include: { wallets: true },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found — call POST /users/sync after Pollar login',
      );
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  private mergeRole(existing: UserRole[], role: UserRole): UserRole[] {
    if (existing.includes(role)) {
      return existing;
    }
    return [...existing, role];
  }
}
