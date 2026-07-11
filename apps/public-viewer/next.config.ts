import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@repo/config",
    "@repo/features",
    "@repo/helpers",
    "@repo/providers",
    "@repo/tw-blocks",
    "@repo/ui",
  ],
};

export default nextConfig;
