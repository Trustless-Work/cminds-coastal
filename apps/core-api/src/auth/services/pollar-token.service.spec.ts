import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

const mockServerEnv: {
  pollarApiKey: string | undefined;
  pollarSdkBaseUrl: string;
} = {
  pollarApiKey: 'pub_testnet_test',
  pollarSdkBaseUrl: 'https://sdk.api.pollar.xyz/v1',
};

jest.mock('@repo/config', () => ({
  serverEnv: mockServerEnv,
}));

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
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    mockServerEnv.pollarApiKey = 'pub_testnet_test';
    mockServerEnv.pollarSdkBaseUrl = 'https://sdk.api.pollar.xyz/v1';

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        code: 'SDK_SESSION_RESUMED',
        success: true,
        content: { mail: 'from-pollar@example.com' },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PollarTokenService],
    }).compile();
    service = module.get(PollarTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a non-expired JWT when Pollar session resume returns 200', async () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      email: 'a@b.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const verified = await service.verifyAccessToken(token);
    expect(verified.pollarUserId).toBe('usr_abc');
    expect(verified.email).toBe('a@b.com');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sdk.api.pollar.xyz/v1/auth/session/resume',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
          'x-pollar-api-key': 'pub_testnet_test',
        }),
      }),
    );
  });

  it('uses Pollar profile email when JWT has no email claim', async () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const verified = await service.verifyAccessToken(token);
    expect(verified.email).toBe('from-pollar@example.com');
  });

  it('rejects when Pollar session resume returns 401', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when Pollar session resume request fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when POLLAR_API_KEY is not configured', async () => {
    mockServerEnv.pollarApiKey = undefined;

    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects expired tokens before calling Pollar', async () => {
    const token = makeUnsignedJwt({
      sub: 'usr_abc',
      exp: Math.floor(Date.now() / 1000) - 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects malformed tokens', async () => {
    await expect(service.verifyAccessToken('not-a-jwt')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects tokens without a user id claim', async () => {
    const token = makeUnsignedJwt({
      email: 'a@b.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    await expect(service.verifyAccessToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
