import { http } from "@repo/config";

export type AllowedEmailDomainsResponse = {
  domains: string[];
};

export async function fetchAllowedEmailDomains(): Promise<string[]> {
  const { data } = await http.get<AllowedEmailDomainsResponse>(
    "/allowed-email-domains",
  );
  return data.domains;
}

export function extractEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) {
    return null;
  }
  return normalized.slice(at + 1);
}

export function isEmailDomainInAllowlist(
  email: string,
  allowedDomains: string[],
): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) {
    return false;
  }
  const normalizedAllowlist = allowedDomains.map((item) =>
    item.trim().toLowerCase(),
  );
  return normalizedAllowlist.includes(domain);
}
