import { EnvConfig } from "./env-config";

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
}

export const serverEnv = new ServerEnv();
