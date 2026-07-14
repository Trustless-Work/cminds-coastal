import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';

@Injectable()
export class AllowedEmailDomainsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listActiveDomains(): Promise<string[]> {
    const rows = await this.prisma.allowedEmailDomain.findMany({
      where: { is_active: true },
      select: { domain: true },
      orderBy: { domain: 'asc' },
    });
    return rows.map((row) => row.domain);
  }

  async isEmailDomainAllowed(email: string): Promise<boolean> {
    const domain = extractEmailDomain(email);
    if (!domain) {
      return false;
    }

    const match = await this.prisma.allowedEmailDomain.findFirst({
      where: {
        domain,
        is_active: true,
      },
      select: { domain_id: true },
    });

    return match !== null;
  }
}

export function extractEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) {
    return null;
  }
  return normalized.slice(at + 1);
}
