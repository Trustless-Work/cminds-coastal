import axios, { type AxiosInstance } from "axios";
import { clientEnv } from "./client-env";
import { handleApiError } from "./handle-errors";

let authToken: string | undefined;

export function setAuthToken(token: string | undefined): void {
  authToken = token;
}

export function clearAuthToken(): void {
  authToken = undefined;
}

export const http: AxiosInstance = axios.create({
  baseURL: clientEnv.coreApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(handleApiError(error)),
);
