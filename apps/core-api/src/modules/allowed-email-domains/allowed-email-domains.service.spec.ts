import { Test, TestingModule } from '@nestjs/testing';
import { AllowedEmailDomainsService } from './allowed-email-domains.service';

jest.mock('../../database', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../database';

describe('AllowedEmailDomainsService', () => {
  let service: AllowedEmailDomainsService;

  const prismaMock = {
    allowedEmailDomain: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllowedEmailDomainsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AllowedEmailDomainsService);
  });

  describe('listActiveDomains', () => {
    it('returns active domain strings', async () => {
      prismaMock.allowedEmailDomain.findMany.mockResolvedValueOnce([
        { domain: 'trustlesswork.com' },
      ]);

      await expect(service.listActiveDomains()).resolves.toEqual([
        'trustlesswork.com',
      ]);
    });
  });

  describe('isEmailDomainAllowed', () => {
    it('returns true when the domain is allowlisted', async () => {
      prismaMock.allowedEmailDomain.findFirst.mockResolvedValueOnce({
        domain_id: '11111111-1111-1111-1111-111111111111',
      });

      await expect(
        service.isEmailDomainAllowed('Ops@TrustlessWork.com'),
      ).resolves.toBe(true);
      expect(prismaMock.allowedEmailDomain.findFirst).toHaveBeenCalledWith({
        where: { domain: 'trustlesswork.com', is_active: true },
        select: { domain_id: true },
      });
    });

    it('returns false for unknown domains', async () => {
      prismaMock.allowedEmailDomain.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.isEmailDomainAllowed('user@gmail.com'),
      ).resolves.toBe(false);
    });

    it('returns false for malformed emails', async () => {
      await expect(service.isEmailDomainAllowed('not-an-email')).resolves.toBe(
        false,
      );
      expect(prismaMock.allowedEmailDomain.findFirst).not.toHaveBeenCalled();
    });
  });
});
