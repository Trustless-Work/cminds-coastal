import { Injectable, UnauthorizedException } from '@nestjs/common';
import { decodeJwt, type JWTPayload } from 'jose';

export type VerifiedPollarToken = {
  pollarUserId: string;
  email?: string;
  payload: JWTPayload;
};

/**
 * Verifies Pollar access tokens for core-api.
 *
 * Pollar does not publish a JWKS endpoint, and session tokens are DPoP-bound
 * (only the browser can prove possession). Server-side session resume with a
 * bare Bearer token is rejected by Pollar. For this pilot we validate structure
 * and expiry from the JWT claims — the same trust model that already worked
 * locally before the broken JWKS / resume gates.
 */
@Injectable()
export class PollarTokenService {
  async verifyAccessToken(accessToken: string): Promise<VerifiedPollarToken> {
    if (!accessToken.trim()) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = this.decodeAndValidateExpiry(accessToken);
    const pollarUserId = this.extractUserId(payload);

    if (!pollarUserId) {
      throw new UnauthorizedException('Token missing user id claim');
    }

    return {
      pollarUserId,
      email: this.extractEmail(payload),
      payload,
    };
  }

  private decodeAndValidateExpiry(accessToken: string): JWTPayload {
    let payload: JWTPayload;
    try {
      payload = decodeJwt(accessToken);
    } catch {
      throw new UnauthorizedException('Malformed access token');
    }

    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now - 30) {
        throw new UnauthorizedException('Access token expired');
      }
    }

    return payload;
  }

  private extractUserId(payload: JWTPayload): string | undefined {
    const candidates = [
      payload.sub,
      payload.userId,
      payload.user_id,
      payload.uid,
    ];

    for (const value of candidates) {
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return undefined;
  }

  private extractEmail(payload: JWTPayload): string | undefined {
    if (typeof payload.email === 'string' && payload.email.length > 0) {
      return payload.email;
    }
    if (typeof payload.mail === 'string' && payload.mail.length > 0) {
      return payload.mail;
    }
    return undefined;
  }
}
