import { EnvConfig } from "./env-config";

/**
 * Public (browser-safe) environment variables.
 * Next.js only inlines NEXT_PUBLIC_* when accessed with a static literal.
 */
export class ClientEnv extends EnvConfig {
  get pollarApiKey(): string | undefined {
    return this.getOptional(process.env.NEXT_PUBLIC_POLLAR_API_KEY);
  }
}

export const clientEnv = new ClientEnv();
