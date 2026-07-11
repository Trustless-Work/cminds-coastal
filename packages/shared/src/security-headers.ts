export type SecurityHeader = {
  key: string;
  value: string;
};

/**
 * Pragmatic CSP for Next.js App Router + Pollar SDK + Core API.
 * Tighten further once production origins are fixed.
 */
export function buildContentSecurityPolicy(options?: {
  coreApiUrl?: string;
}): string {
  const coreApiOrigin = originFromUrl(
    options?.coreApiUrl ?? "http://localhost:4000",
  );

  const directives: string[] = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    [
      "script-src",
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://sdk.api.pollar.xyz",
      "https://*.pollar.xyz",
    ].join(" "),
    [
      "style-src",
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ].join(" "),
    ["font-src", "'self'", "data:", "https://fonts.gstatic.com"].join(" "),
    ["img-src", "'self'", "data:", "blob:", "https:"].join(" "),
    [
      "connect-src",
      "'self'",
      coreApiOrigin,
      "https://sdk.api.pollar.xyz",
      "https://*.pollar.xyz",
      "https://*.stellar.org",
      "wss:",
      "https:",
    ].join(" "),
    [
      "frame-src",
      "'self'",
      "https://accounts.google.com",
      "https://*.pollar.xyz",
    ].join(" "),
    "worker-src 'self' blob:",
  ];

  return directives.join("; ");
}

export function securityHeaders(options?: {
  coreApiUrl?: string;
}): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
  ];
}

function originFromUrl(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}
