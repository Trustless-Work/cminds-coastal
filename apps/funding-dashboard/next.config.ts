import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@repo/providers", "@repo/ui"],
};

export default nextConfig;
