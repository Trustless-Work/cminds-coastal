import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_OPTIONAL_AUTH_KEY } from "../decorators/optional-auth.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user";
import { PollarTokenService } from "../services/pollar-token.service";

type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class PollarAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly pollarTokenService: PollarTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractBearerToken(request);

    if (!token) {
      if (isOptional) {
        return true;
      }
      throw new UnauthorizedException("Missing Authorization bearer token");
    }

    try {
      const verified = await this.pollarTokenService.verifyAccessToken(token);
      request.user = {
        pollarUserId: verified.pollarUserId,
        email: verified.email,
        accessToken: token,
      };
      return true;
    } catch (error) {
      if (isOptional) {
        return true;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid access token");
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header) {
      return undefined;
    }
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return undefined;
    }
    return token.trim();
  }
}
