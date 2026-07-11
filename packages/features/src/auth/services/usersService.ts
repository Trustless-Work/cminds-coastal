import { clientEnv } from "@repo/config";
import type { SyncUserPayload, UserProfile } from "../types";

export class UsersApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UsersApiError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      (typeof (body as { message: unknown }).message === "string" ||
        Array.isArray((body as { message: unknown }).message))
    ) {
      const message = (body as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join(", ") : message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "Request failed";
}

export async function syncUser(
  accessToken: string,
  payload: SyncUserPayload,
): Promise<UserProfile> {
  const response = await fetch(`${clientEnv.coreApiUrl}/users/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new UsersApiError(await parseError(response), response.status);
  }

  return (await response.json()) as UserProfile;
}

export async function getMe(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${clientEnv.coreApiUrl}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new UsersApiError(await parseError(response), response.status);
  }

  return (await response.json()) as UserProfile;
}
