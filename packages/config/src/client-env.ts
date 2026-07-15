import { EnvConfig } from "./env-config";

/**
 * Public (browser-safe) environment variables.
 * Next.js only inlines NEXT_PUBLIC_* when accessed with a static literal.
 */
export class ClientEnv extends EnvConfig {
  get pollarApiKey(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_POLLAR_API_KEY);
  }

  get coreApiUrl(): string {
    return (
      this.getOptional(process.env.NEXT_PUBLIC_CORE_API_URL) ??
      "http://localhost:4000"
    );
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

  /** Reown / WalletConnect Cloud project id (Stellar Wallets Kit). */
  get walletConnectProjectId(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
  }

  /** Supabase project URL (admin app Auth + core-api token verification). */
  get supabaseUrl(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_SUPABASE_URL);
  }

  /** Supabase anon / publishable key (browser Auth client). */
  get supabaseAnonKey(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
}

export const clientEnv = new ClientEnv();
