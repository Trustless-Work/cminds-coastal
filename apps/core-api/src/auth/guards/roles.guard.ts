import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { PrismaService } from "../../database";
import type { UserRole } from "../../generated/prisma/enums";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user";

type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
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

    const user = await this.prisma.user.findUnique({
      where: { pollar_user_id: authUser.pollarUserId },
      select: { roles: true, is_active: true },
    });

    if (!user || !user.is_active) {
      throw new ForbiddenException("User is not registered or inactive");
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException("Insufficient role for this resource");
    }

    return true;
  }
}
