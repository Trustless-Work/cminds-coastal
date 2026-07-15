import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('jose', () => {
  class JoseDecodeError extends Error {}
  return {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [PollarTokenService],
    }).compile();
    service = module.get(PollarTokenService);
  });

  it('accepts a non-expired JWT with a user id claim', () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      email: 'a@b.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const verified = service.verifyAccessToken(token);
    expect(verified.pollarUserId).toBe('usr_abc');
    expect(verified.email).toBe('a@b.com');
  });

  it('rejects expired tokens', () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) - 3600,
    });

    expect(() => service.verifyAccessToken(token)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects malformed tokens', () => {
    expect(() => service.verifyAccessToken('not-a-jwt')).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects tokens without a user id claim', () => {
    const token = makeUnsignedJwt({
      email: 'a@b.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(() => service.verifyAccessToken(token)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects empty tokens', () => {
    expect(() => service.verifyAccessToken('   ')).toThrow(
      UnauthorizedException,
    );
  });
});
