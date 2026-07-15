import axios, { type AxiosInstance } from "axios";
import { clientEnv } from "./client-env";
import { handleApiError } from "./handle-errors";

export type AuthTokenProvider = () => string | undefined;

let getAccessToken: AuthTokenProvider | undefined;

export function setAuthTokenProvider(
  provider: AuthTokenProvider | undefined,
): void {
  getAccessToken = provider;
}

export function setAuthToken(token: string | undefined): void {
  getAccessToken = token ? () => token : undefined;
}

export function clearAuthToken(): void {
  getAccessToken = undefined;
}

export const http: AxiosInstance = axios.create({
  baseURL: clientEnv.coreApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set multipart boundaries for FormData uploads.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(handleApiError(error)),
);
