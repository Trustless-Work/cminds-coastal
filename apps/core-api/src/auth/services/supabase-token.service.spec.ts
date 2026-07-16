import { UnauthorizedException } from '@nestjs/common';

jest.mock('@repo/config', () => ({
  serverEnv: {
    supabaseJwtSecret: 'test-supabase-jwt-secret-at-least-32-chars',
    supabaseUrl: 'https://example.supabase.co',
  },
}));

jest.mock('jose', () => {
  class JoseDecodeError extends Error {}
  return {
    decodeJwt: (token: string) => {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new JoseDecodeError('Invalid Compact JWS');
      }
      return JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
    },
    decodeProtectedHeader: (token: string) => {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new JoseDecodeError('Invalid Compact JWS');
      }
      return JSON.parse(
        Buffer.from(parts[0], 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
    },
    createRemoteJWKSet: () => Symbol('jwks'),
    jwtVerify: (token: string) => {
      const parts = token.split('.');
      if (parts.length < 2) {
        return Promise.reject(new JoseDecodeError('Invalid Compact JWS'));
      }
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
      if (payload.invalid === true) {
        return Promise.reject(new Error('signature verification failed'));
      }
      return Promise.resolve({ payload });
    },
  };
});

import { SupabaseTokenService } from './supabase-token.service';

function encodeSegment(value: object): string {
  return Buffer.from(JSON.stringify(value))
    .toString('base64url')
    .replace(/=+$/, '');
}

function makeUnsignedJwt(
  payload: Record<string, unknown>,
  alg: string = 'HS256',
): string {
  const header = encodeSegment({ alg, typ: 'JWT' });
  const body = encodeSegment(payload);
  return `${header}.${body}.sig`;
}

describe('SupabaseTokenService', () => {
  const service = new SupabaseTokenService();

  it('should verify a valid HS256 Supabase access token', async () => {
    const token = makeUnsignedJwt({
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'admin@example.com',
      aal: 'aal2',
      iss: 'https://example.supabase.co/auth/v1',
    });

    const verified = await service.verifyAccessToken(token);

    expect(verified.supabaseUserId).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
    expect(verified.email).toBe('admin@example.com');
    expect(verified.aal).toBe('aal2');
  });

  it('should verify a valid ES256 Supabase access token via JWKS', async () => {
    const token = makeUnsignedJwt(
      {
        sub: '22222222-2222-2222-2222-222222222222',
        email: 'admin@example.com',
        aal: 'aal2',
        iss: 'https://example.supabase.co/auth/v1',
      },
      'ES256',
    );

    const verified = await service.verifyAccessToken(token);

    expect(verified.supabaseUserId).toBe(
      '22222222-2222-2222-2222-222222222222',
    );
    expect(verified.aal).toBe('aal2');
  });

  it('should reject non-supabase issuers', async () => {
    const token = makeUnsignedJwt({
      sub: '11111111-1111-1111-1111-111111111111',
      iss: 'https://other.example/auth',
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should detect supabase tokens from issuer', () => {
    const token = makeUnsignedJwt({
      sub: '11111111-1111-1111-1111-111111111111',
      iss: 'https://example.supabase.co/auth/v1',
    });

    expect(service.isSupabaseAccessToken(token)).toBe(true);
    expect(service.isSupabaseAccessToken('not-a-jwt')).toBe(false);
  });
});
