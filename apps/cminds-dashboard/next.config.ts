import { securityHeaders } from "@repo/shared/security-headers";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@repo/config",
    "@repo/features",
    "@repo/helpers",
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

export default nextConfig;
