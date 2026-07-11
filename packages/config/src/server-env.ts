import { EnvConfig } from "./env-config";

const DEFAULT_POLLAR_SDK_BASE_URL = "https://sdk.api.pollar.xyz/v1";
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
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

  get pollarSdkBaseUrl(): string {
    return (
      this.getOptional(process.env.POLLAR_SDK_BASE_URL) ??
      DEFAULT_POLLAR_SDK_BASE_URL
    );
  }

  get pollarJwksUrl(): string | undefined {
    return this.getOptional(process.env.POLLAR_JWKS_URL);
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
}

export const serverEnv = new ServerEnv();
