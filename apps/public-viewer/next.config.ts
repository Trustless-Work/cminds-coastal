import { securityHeaders } from "@repo/shared/security-headers";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@repo/config",
    "@repo/features",
    "@repo/helpers",
    "@repo/i18n",
    "@repo/providers",
    "@repo/shared",
    "@repo/tw-blocks",
    "@repo/ui",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          coreApiUrl: process.env.NEXT_PUBLIC_CORE_API_URL,
        }),
      },
    ];
  },
};

export default withNextIntl(nextConfig);
