import { EnvConfig } from "./env-config";

const DEFAULT_POLLAR_SDK_BASE_URL = "https://sdk.api.pollar.xyz/v1";
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
];

/**
 * Server-only environment variables (NestJS, API routes, scripts).
 * Never import this module from client components.
 */
export class ServerEnv extends EnvConfig {
  get databaseUrl(): string {
    return this.getRequired(process.env.DATABASE_URL, "DATABASE_URL");
  }

  get directUrl(): string | undefined {
    return this.getOptional(process.env.DIRECT_URL);
  }

  get port(): number {
    const raw = this.getOptional(process.env.PORT);
    if (!raw) {
      return 3000;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`PORT must be a number, received: ${raw}`);
    }
    return parsed;
  }

  get pollarSecretKey(): string | undefined {
    return this.getOptional(process.env.POLLAR_SECRET_KEY);
  }

  /**
   * Pollar publishable key (`pub_…`) used server-side to call SDK APIs
   * (e.g. session resume). Same value as NEXT_PUBLIC_POLLAR_API_KEY on frontends.
   */
  get pollarApiKey(): string | undefined {
    return this.getOptional(process.env.POLLAR_API_KEY);
  }

  get pollarSdkBaseUrl(): string {
    return (
      this.getOptional(process.env.POLLAR_SDK_BASE_URL) ??
      DEFAULT_POLLAR_SDK_BASE_URL
    );
  }

  /**
   * Origin sent to Pollar SDK APIs when the incoming request has none.
   * Must match a domain in Pollar Dashboard → Configuration → Domains.
   */
  get pollarOrigin(): string | undefined {
    return this.getOptional(process.env.POLLAR_ORIGIN);
  }

  get corsOrigins(): string[] {
    const raw = this.getOptional(process.env.CORS_ORIGINS);
    if (!raw) {
      return DEFAULT_CORS_ORIGINS;
    }
    return raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get supabaseUrl(): string | undefined {
    return this.getOptional(process.env.SUPABASE_URL);
  }

  get supabaseServiceRoleKey(): string | undefined {
    return this.getOptional(process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * JWT secret from Supabase Project Settings → API → JWT Secret.
   * Used to verify access tokens issued by Supabase Auth (admin app).
   */
  get supabaseJwtSecret(): string | undefined {
    return this.getOptional(process.env.SUPABASE_JWT_SECRET);
  }

  get supabaseEscrowImagesBucket(): string {
    return (
      this.getOptional(process.env.SUPABASE_ESCROW_IMAGES_BUCKET) ??
      "escrow-images"
    );
  }
}

export const serverEnv = new ServerEnv();
