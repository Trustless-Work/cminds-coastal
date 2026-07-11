---
description: Env vars and API keys must be mapped through @repo/config (clientEnv / serverEnv / networkConfig)
alwaysApply: true
---

# Environment config — `@repo/config`

All environment variables and API keys are read through **`@repo/config`**. Do not use `process.env` directly in apps, features, or providers.

## Source of truth

| Surface | Class / singleton | File |
| --- | --- | --- |
| Browser / Next client | `ClientEnv` / `clientEnv` | `packages/config/src/client-env.ts` |
| NestJS / API routes / scripts | `ServerEnv` / `serverEnv` | `packages/config/src/server-env.ts` |
| Stellar network (testnet/mainnet) | `NetworkConfig` / `networkConfig` | `packages/config/src/network-config.ts` |
| Shared helpers | `EnvConfig` | `packages/config/src/env-config.ts` |
| Core API HTTP client | `http` / `setAuthToken` / `clearAuthToken` | `packages/config/src/http.ts` |
| API error normalization | `ApiError` / `handleApiError` | `packages/config/src/handle-errors.ts` |

Import:

```ts
import {
  clientEnv,
  serverEnv,
  networkConfig,
  http,
  setAuthToken,
  clearAuthToken,
  ApiError,
  handleApiError,
} from "@repo/config";
```

## Network switch (`NEXT_PUBLIC_USE_MAINNET`)

`ClientEnv.useMainnet` reads `NEXT_PUBLIC_USE_MAINNET`. **`networkConfig`** is the public API for anything network-dependent — do not branch on `clientEnv.useMainnet` outside `@repo/config`.

| Consumer | Use |
| --- | --- |
| Trustless Work base URL | `networkConfig.isMainnet` → `mainNet` / `development` |
| Pollar | `networkConfig.pollarNetwork` (`"testnet"` \| `"mainnet"`) |
| Freighter / Wallet Kit | `networkConfig.walletKitNetwork` (`"TESTNET"` \| `"PUBLIC"`) |
| USDC / EURC issuers | `networkConfig.usdcIssuer`, `getTrustlineOptions()` |
| UI labels | `networkConfig.label` |

API keys stay separate env vars; the operator must supply the key that matches the selected network (`pub_testnet_` / `pub_mainnet_`, TW testnet vs mainnet key).

## Core API HTTP (`http`)

Browser / feature packages call Core API through the shared Axios instance — do not use raw `fetch` or construct `Authorization` headers in services.

| Export | Role |
| --- | --- |
| `http` | Axios instance with `baseURL: clientEnv.coreApiUrl` |
| `setAuthToken(token)` | Store Bearer token for the request interceptor |
| `clearAuthToken()` | Clear the stored token |
| `ApiError` | Typed error with `status` + normalized `message` |
| `handleApiError(error)` | Normalize NestJS / Axios / unknown failures into `ApiError` |

```ts
// ✅ set token once (e.g. in a hook), then call thin service methods
setAuthToken(accessToken);
const { data } = await http.post<UserProfile>("/users/sync", payload);

// ✅ catch normalized errors
catch (err) {
  if (err instanceof ApiError) {
    // err.status, err.message
  }
}

// ❌ do not
await fetch(`${clientEnv.coreApiUrl}/users/sync`, { headers: { Authorization: `Bearer ${token}` } });
```

Failed responses are rejected as `ApiError` via the response interceptor (Nest `message: string | string[]` is flattened).

## When adding a new API key or env var

1. Add it to the relevant app `.env.example` (and document the name).
2. Map it on the correct class:
   - **Public / browser** → `ClientEnv` with a `NEXT_PUBLIC_*` name
   - **Secret / server-only** → `ServerEnv` (never prefix with `NEXT_PUBLIC_`)
   - **Network-derived values** → getters on `NetworkConfig` (not scattered literals)
3. Consume only via the typed getter (`clientEnv.foo` / `serverEnv.bar` / `networkConfig.*`).
4. Never read `process.env` outside `packages/config`.

## Client vs server

- **Client**: only `NEXT_PUBLIC_*`. Getters must use a **static literal** (`process.env.NEXT_PUBLIC_FOO`), not `process.env[key]` — Next.js will not inline dynamic access.
- **Server**: secrets, DB URLs, ports, webhook secrets, etc. Safe to use dynamic keys if needed.

## Examples

```ts
// ✅ client
const key = clientEnv.pollarApiKey;

// ✅ network
const issuer = networkConfig.usdcIssuer;

// ✅ server
const url = serverEnv.databaseUrl;

// ❌ do not
const key = process.env.NEXT_PUBLIC_POLLAR_API_KEY;
const net = clientEnv.useMainnet ? "mainnet" : "testnet"; // use networkConfig.id
```

## Checklist for new keys

- [ ] `.env.example` updated
- [ ] Getter added to `ClientEnv` or `ServerEnv` (or derived on `NetworkConfig`)
- [ ] Call sites use `clientEnv` / `serverEnv` / `networkConfig`
- [ ] Secrets are not under `NEXT_PUBLIC_`
- [ ] Next apps list `@repo/config` in `transpilePackages` if not already
