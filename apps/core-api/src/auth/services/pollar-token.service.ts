import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { serverEnv } from '@repo/config';
import { decodeJwt, type JWTPayload } from 'jose';

export type VerifiedPollarToken = {
  pollarUserId: string;
  email?: string;
  payload: JWTPayload;
};

export type VerifyAccessTokenOptions = {
  /** Browser Origin from the incoming request (must be in Pollar Domains). */
  origin?: string;
};

type PollarSessionResumeResponse = {
  code?: string;
  success?: boolean;
  message?: string;
  content?: {
    mail?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
  };
};

@Injectable()
export class PollarTokenService {
  private readonly logger = new Logger(PollarTokenService.name);

  async verifyAccessToken(
    accessToken: string,
    options: VerifyAccessTokenOptions = {},
  ): Promise<VerifiedPollarToken> {
    if (!accessToken.trim()) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = this.decodeAndValidateExpiry(accessToken);
    const pollarUserId = this.extractUserId(payload);

    if (!pollarUserId) {
      throw new UnauthorizedException('Token missing user id claim');
    }

    const sessionProfile = await this.assertSessionActive(
      accessToken,
      options.origin,
    );
    const email =
      this.extractEmail(payload) ??
      (typeof sessionProfile?.mail === 'string' && sessionProfile.mail.length > 0
        ? sessionProfile.mail
        : undefined);

    return {
      pollarUserId,
      email,
      payload,
    };
  }

  private resolvePollarOrigin(requestOrigin?: string): string | undefined {
    const candidates = [
      requestOrigin?.trim(),
      serverEnv.pollarOrigin,
      serverEnv.corsOrigins[0],
    ];
    for (const value of candidates) {
      if (value && value.length > 0) {
        return value;
      }
    }
    return undefined;
  }

  private async assertSessionActive(
    accessToken: string,
    requestOrigin?: string,
  ): Promise<PollarSessionResumeResponse['content'] | undefined> {
    const apiKey = serverEnv.pollarApiKey;
    if (!apiKey) {
      throw new UnauthorizedException(
        'POLLAR_API_KEY is not configured; set the Pollar publishable key on the server',
      );
    }

    const origin = this.resolvePollarOrigin(requestOrigin);
    if (!origin) {
      throw new UnauthorizedException(
        'No Origin available for Pollar verification; set POLLAR_ORIGIN to a domain allowed in Pollar Dashboard → Domains',
      );
    }

    const base = serverEnv.pollarSdkBaseUrl.replace(/\/$/, '');
    const url = `${base}/auth/session/resume`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-pollar-api-key': apiKey,
          Accept: 'application/json',
          Origin: origin,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Pollar session resume request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException(
        'Unable to verify access token with Pollar',
      );
    }

    if (response.status === 401) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!response.ok) {
      let detail = '';
      try {
        const body = (await response.json()) as PollarSessionResumeResponse;
        detail = body.code ? ` (${body.code})` : '';
        if (body.code === 'ORIGIN_NOT_ALLOWED') {
          this.logger.warn(
            `Pollar rejected Origin "${origin}". Add it under Dashboard → Configuration → Domains.`,
          );
          throw new UnauthorizedException(
            `Pollar origin not allowed: ${origin}. Add this domain in Pollar Dashboard → Configuration → Domains`,
          );
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
      }
      this.logger.warn(
        `Pollar session resume returned ${response.status}${detail} from ${url}`,
      );
      throw new UnauthorizedException(
        'Unable to verify access token with Pollar',
      );
    }

    try {
      const body = (await response.json()) as PollarSessionResumeResponse;
      return body.content;
    } catch {
      return undefined;
    }
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
