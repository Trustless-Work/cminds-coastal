import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import type { UserRole } from '../../generated/prisma/enums';
import { UserRole as UserRoleEnum } from '../../generated/prisma/enums';
import type { AuthenticatedUser } from '../interfaces/authenticated-user';

type UserAuthFields = {
  user_id: string;
  roles: UserRole[];
  is_active: boolean;
  supabase_user_id: string | null;
};

@Injectable()
export class AuthIdentityService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * Resolve an existing DB user from a verified token identity.
   * Never creates users — admins are provisioned manually in Supabase Auth
   * and linked to an existing `user` row with role ADMIN.
   */
  async findUserByAuthIdentity(
    authUser: AuthenticatedUser,
  ): Promise<UserAuthFields | null> {
    if (authUser.supabaseUserId) {
      return this.findAdminBySupabaseIdentity(authUser);
    }

    if (authUser.pollarUserId) {
      return this.prisma.user.findUnique({
        where: { pollar_user_id: authUser.pollarUserId },
        select: {
          user_id: true,
          roles: true,
          is_active: true,
          supabase_user_id: true,
        },
      });
    }

    return null;
  }

  private async findAdminBySupabaseIdentity(
    authUser: AuthenticatedUser,
  ): Promise<UserAuthFields | null> {
    const supabaseUserId = authUser.supabaseUserId;
    if (!supabaseUserId) {
      return null;
    }

    const bySupabaseId = await this.prisma.user.findUnique({
      where: { supabase_user_id: supabaseUserId },
      select: {
        user_id: true,
        roles: true,
        is_active: true,
        supabase_user_id: true,
      },
    });

    if (bySupabaseId) {
      return bySupabaseId;
    }

    const email = authUser.email?.trim();
    if (!email) {
      return null;
    }

    const byEmail = await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        is_active: true,
        roles: { has: UserRoleEnum.ADMIN },
        OR: [{ supabase_user_id: null }, { supabase_user_id: supabaseUserId }],
      },
      select: {
        user_id: true,
        roles: true,
        is_active: true,
        supabase_user_id: true,
      },
    });

    if (!byEmail) {
      return null;
    }

    if (byEmail.supabase_user_id === supabaseUserId) {
      return byEmail;
    }

    // First successful MFA login: link Auth user id to the existing ADMIN row.
    return this.prisma.user.update({
      where: { user_id: byEmail.user_id },
      data: { supabase_user_id: supabaseUserId },
      select: {
        user_id: true,
        roles: true,
        is_active: true,
        supabase_user_id: true,
      },
    });
  }
}
