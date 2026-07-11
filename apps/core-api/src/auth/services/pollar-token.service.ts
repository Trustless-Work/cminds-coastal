import {
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { serverEnv } from "@repo/config";
import {
  createRemoteJWKSet,
  decodeJwt,
  jwtVerify,
  type JWTPayload,
} from "jose";

export type VerifiedPollarToken = {
  pollarUserId: string;
  email?: string;
  payload: JWTPayload;
};

@Injectable()
export class PollarTokenService {
  private readonly logger = new Logger(PollarTokenService.name);
  private readonly jwksByUrl = new Map<
    string,
    ReturnType<typeof createRemoteJWKSet>
  >();

  async verifyAccessToken(accessToken: string): Promise<VerifiedPollarToken> {
    if (!accessToken.trim()) {
      throw new UnauthorizedException("Missing access token");
    }

    const payload = await this.verifyOrDecode(accessToken);
    const pollarUserId = this.extractUserId(payload);

    if (!pollarUserId) {
      throw new UnauthorizedException("Token missing user id claim");
    }

    const email = this.extractEmail(payload);

    return {
      pollarUserId,
      email,
      payload,
    };
  }

  private async verifyOrDecode(accessToken: string): Promise<JWTPayload> {
    const jwksUrl = this.resolveJwksUrl(accessToken);

    if (jwksUrl) {
      try {
        const jwks = this.getJwks(jwksUrl);
        const { payload } = await jwtVerify(accessToken, jwks, {
          clockTolerance: 30,
        });
        return payload;
      } catch (error) {
        this.logger.warn(
          `JWKS verification failed (${jwksUrl}): ${error instanceof Error ? error.message : String(error)}`,
        );
        if (this.isProduction()) {
          throw new UnauthorizedException("Invalid access token");
        }
      }
    } else if (this.isProduction()) {
      throw new UnauthorizedException(
        "Pollar JWKS is not configured; set POLLAR_JWKS_URL for production",
      );
    } else {
      this.logger.warn(
        "POLLAR_JWKS_URL unset — accepting decoded Pollar JWT in non-production only",
      );
    }

    return this.decodeAndValidateExpiry(accessToken);
  }

  private decodeAndValidateExpiry(accessToken: string): JWTPayload {
    let payload: JWTPayload;
    try {
      payload = decodeJwt(accessToken);
    } catch {
      throw new UnauthorizedException("Malformed access token");
    }

    if (typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now - 30) {
        throw new UnauthorizedException("Access token expired");
      }
    }

    return payload;
  }

  private resolveJwksUrl(accessToken: string): URL | null {
    const configured = serverEnv.pollarJwksUrl;
    if (configured) {
      return new URL(configured);
    }

    try {
      const payload = decodeJwt(accessToken);
      if (typeof payload.iss === "string" && payload.iss.length > 0) {
        const issuer = payload.iss.replace(/\/$/, "");
        return new URL(`${issuer}/.well-known/jwks.json`);
      }
    } catch {
      // ignore — caller will handle malformed tokens
    }

    const base = serverEnv.pollarSdkBaseUrl.replace(/\/v1\/?$/, "");
    return new URL(`${base}/.well-known/jwks.json`);
  }

  private getJwks(jwksUrl: URL): ReturnType<typeof createRemoteJWKSet> {
    const key = jwksUrl.toString();
    const existing = this.jwksByUrl.get(key);
    if (existing) {
      return existing;
    }
    const jwks = createRemoteJWKSet(jwksUrl);
    this.jwksByUrl.set(key, jwks);
    return jwks;
  }

  private extractUserId(payload: JWTPayload): string | undefined {
    const candidates = [
      payload.sub,
      payload.userId,
      payload.user_id,
      payload.uid,
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    }

    return undefined;
  }

  private extractEmail(payload: JWTPayload): string | undefined {
    if (typeof payload.email === "string" && payload.email.length > 0) {
      return payload.email;
    }
    if (typeof payload.mail === "string" && payload.mail.length > 0) {
      return payload.mail;
    }
    return undefined;
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }
}
