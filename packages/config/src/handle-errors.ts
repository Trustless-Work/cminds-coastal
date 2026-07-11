import axios from "axios";

type NestErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function normalizeMessage(message: string | string[] | undefined): string | undefined {
  if (message === undefined) {
    return undefined;
  }
  return Array.isArray(message) ? message.join(", ") : message;
}

function extractNestMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }
  const body = data as NestErrorBody;
  return normalizeMessage(body.message);
}

/**
 * Normalize Axios / unknown failures into a typed {@link ApiError}
 * suitable for NestJS Core API responses (`message: string | string[]`).
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const fromBody = extractNestMessage(error.response?.data);
    const message =
      fromBody ||
      error.response?.statusText ||
      error.message ||
      "Request failed";
    return new ApiError(message, status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError("Request failed", 500);
}
