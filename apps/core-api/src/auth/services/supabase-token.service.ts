import { Injectable, UnauthorizedException } from '@nestjs/common';
import { serverEnv } from '@repo/config';
import {
  createRemoteJWKSet,
  decodeJwt,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import type { AuthenticatorAssuranceLevel } from '../interfaces/authenticated-user';

export type VerifiedSupabaseToken = {
  supabaseUserId: string;
  email?: string;
  aal?: AuthenticatorAssuranceLevel;
  payload: JWTPayload;
};

const ASYMMETRIC_ALGS = ['ES256', 'RS256', 'EdDSA'] as const;

@Injectable()
export class SupabaseTokenService {
  private jwks: JWTVerifyGetKey | null = null;

  async verifyAccessToken(accessToken: string): Promise<VerifiedSupabaseToken> {
    if (!accessToken.trim()) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: JWTPayload;
    try {
      payload = await this.verifyJwtPayload(accessToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Invalid or expired Supabase access token',
      );
    }

    if (!this.isSupabaseIssuer(payload.iss)) {
      throw new UnauthorizedException('Token is not a Supabase access token');
    }

    const supabaseUserId =
      typeof payload.sub === 'string' && payload.sub.length > 0
        ? payload.sub
        : undefined;

    if (!supabaseUserId) {
      throw new UnauthorizedException('Token missing user id claim');
    }

    return {
      supabaseUserId,
      email: this.extractEmail(payload),
      aal: this.extractAal(payload),
      payload,
    };
  }

  isSupabaseAccessToken(accessToken: string): boolean {
    try {
      const payload = decodeJwt(accessToken);
      return this.isSupabaseIssuer(payload.iss);
    } catch {
      return false;
    }
  }

  private async verifyJwtPayload(accessToken: string): Promise<JWTPayload> {
    const { alg } = decodeProtectedHeader(accessToken);

    if (alg === 'HS256') {
      const secret = serverEnv.supabaseJwtSecret;
      if (!secret) {
        throw new UnauthorizedException(
          'Supabase auth is not configured (SUPABASE_JWT_SECRET)',
        );
      }

      const verified = await jwtVerify(
        accessToken,
        new TextEncoder().encode(secret),
        { algorithms: ['HS256'] },
      );
      return verified.payload;
    }

    if (alg && (ASYMMETRIC_ALGS as readonly string[]).includes(alg)) {
      const verified = await jwtVerify(accessToken, this.getJwks(), {
        algorithms: [...ASYMMETRIC_ALGS],
      });
      return verified.payload;
    }

    throw new UnauthorizedException(
      `Unsupported Supabase JWT algorithm: ${alg ?? 'unknown'}`,
    );
  }

  private getJwks(): JWTVerifyGetKey {
    if (this.jwks) {
      return this.jwks;
    }

    const baseUrl = serverEnv.supabaseUrl?.replace(/\/$/, '');
    if (!baseUrl) {
      throw new UnauthorizedException(
        'Supabase auth is not configured (SUPABASE_URL)',
      );
    }

    this.jwks = createRemoteJWKSet(
      new URL(`${baseUrl}/auth/v1/.well-known/jwks.json`),
    );
    return this.jwks;
  }

  private isSupabaseIssuer(iss: unknown): boolean {
    return typeof iss === 'string' && iss.includes('/auth/v1');
  }

  private extractEmail(payload: JWTPayload): string | undefined {
    if (typeof payload.email === 'string' && payload.email.length > 0) {
      return payload.email;
    }

    const metadata = payload.user_metadata;
    if (
      metadata &&
      typeof metadata === 'object' &&
      'email' in metadata &&
      typeof (metadata as { email: unknown }).email === 'string' &&
      (metadata as { email: string }).email.length > 0
    ) {
      return (metadata as { email: string }).email;
    }

    return undefined;
  }

  private extractAal(
    payload: JWTPayload,
  ): AuthenticatorAssuranceLevel | undefined {
    if (payload.aal === 'aal1' || payload.aal === 'aal2') {
      return payload.aal;
    }
    return undefined;
  }
}
