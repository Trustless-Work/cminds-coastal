import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { UserRole } from "../../generated/prisma/enums";
import { UserRole as UserRoleEnum } from "../../generated/prisma/enums";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user";
import { AuthIdentityService } from "../services/auth-identity.service";

type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthIdentityService)
    private readonly authIdentityService: AuthIdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authUser = request.user;

    if (!authUser) {
      throw new ForbiddenException("Authentication required for this resource");
    }

    if (
      requiredRoles.includes(UserRoleEnum.ADMIN) &&
      authUser.supabaseUserId &&
      authUser.aal !== "aal2"
    ) {
      throw new ForbiddenException(
        "Multi-factor authentication (AAL2) is required for admin access",
      );
    }

    const user =
      await this.authIdentityService.findUserByAuthIdentity(authUser);

    if (!user || !user.is_active) {
      throw new ForbiddenException(
        "No active ADMIN user matches this Supabase account. Create the Auth user in Supabase and ensure a users row exists with the same email and role ADMIN.",
      );
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException("Insufficient role for this resource");
    }

    return true;
  }
}
