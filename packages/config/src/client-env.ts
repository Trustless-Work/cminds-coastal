import { EnvConfig } from "./env-config";

/**
 * Public (browser-safe) environment variables.
 * Next.js only inlines NEXT_PUBLIC_* when accessed with a static literal.
 */
export class ClientEnv extends EnvConfig {
  get pollarApiKey(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_POLLAR_API_KEY);
  }

  get trustlessWorkApiKey(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY);
  }

  get useMainnet(): boolean {
    return (
      this.getOptional(process.env.NEXT_PUBLIC_USE_MAINNET)?.toLowerCase() ===
      "true"
    );
  }
}

export const clientEnv = new ClientEnv();
