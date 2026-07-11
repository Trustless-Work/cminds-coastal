import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@repo/config', () => ({
  serverEnv: {
    pollarJwksUrl: undefined,
    pollarSdkBaseUrl: 'https://sdk.api.pollar.xyz/v1',
  },
}));

jest.mock('jose', () => {
  class JoseDecodeError extends Error {}
  return {
    createRemoteJWKSet: jest.fn(() => jest.fn()),
    jwtVerify: jest.fn(() => {
      throw new Error('JWKS unavailable in tests');
    }),
    decodeJwt: (token: string) => {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new JoseDecodeError('Invalid Compact JWS');
      }
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
      return payload;
    },
  };
});

import { PollarTokenService } from './pollar-token.service';

function encodeSegment(value: object): string {
  return Buffer.from(JSON.stringify(value))
    .toString('base64url')
    .replace(/=+$/, '');
}

function makeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = encodeSegment({ alg: 'none', typ: 'JWT' });
  const body = encodeSegment(payload);
  return `${header}.${body}.`;
}

describe('PollarTokenService', () => {
  let service: PollarTokenService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    const module: TestingModule = await Test.createTestingModule({
      providers: [PollarTokenService],
    }).compile();
    service = module.get(PollarTokenService);
  });

  it('accepts a non-expired JWT payload in non-production when JWKS is unavailable', async () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      email: 'a@b.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const verified = await service.verifyAccessToken(token);
    expect(verified.pollarUserId).toBe('usr_abc');
    expect(verified.email).toBe('a@b.com');
  });

  it('rejects expired tokens', async () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) - 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects malformed tokens', async () => {
    await expect(service.verifyAccessToken('not-a-jwt')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects tokens without a user id claim', async () => {
    const token = makeUnsignedJwt({
      email: 'a@b.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
