# Pollar Documentation

**Pollar** is the onboarding-to-payment infrastructure layer for consumer apps on Stellar. The full stack from social login to USDC payments — without exposing users to blockchain complexity.

- [dashboard.pollar.xyz](https://dashboard.pollar.xyz) — Create an app and get your API keys

- [github.com/pollar-xyz/pollar](https://github.com/pollar-xyz/pollar) — Open source SDK

- [Telegram](https://t.me/+R76f1BarXSUxMTQx) — Pollar community

Getting Started [#getting-started]

| <br />                                            | <br />                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| [Overview](./docs/getting-started/overview)       | What Pollar is and the problem it solves        |
| [API Keys](./docs/getting-started/api-keys)       | Publishable vs secret keys, testnet vs mainnet  |
| [Quickstart](./docs/getting-started/quickstart)   | Install, configure, and send your first payment |
| [Example App](./docs/getting-started/example-app) | Clone and run a full working integration        |

---

Core Concepts [#core-concepts]

| <br />                                                          | <br />                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| [Architecture](./docs/core-concepts/architecture)               | How the SDK, Pollar Server, and Dashboard work together |
| [Funding Modes](./docs/core-concepts/funding-modes)             | Immediate, Deferred, and Manual wallet activation       |
| [Stellar Primitives](./docs/core-concepts/stellar-primitives)   | Fee-bumps, reserves, trustlines, SEP-10, SEP-24         |
| [Security Model](./docs/core-concepts/security-model)           | AWS KMS, Passkeys, BYOK, and MPC                        |
| [Transaction History](./docs/core-concepts/transaction-history) | Two-layer history architecture and pagination           |

---

SDK Reference [#sdk-reference]

| <br />                                               | <br />                                          |
| ---------------------------------------------------- | ----------------------------------------------- |
| [@pollar/react](./docs/sdk-reference/pollar-react)   | Hooks and pre-built UI components               |
| [@pollar/core](./docs/sdk-reference/pollar-core)     | Full TypeScript client API                      |
| [Pollar Server API](./docs/sdk-reference/server-api) | REST endpoints for backend use                  |
| [Webhooks](./docs/sdk-reference/webhooks)            | Events, HMAC authentication, and retry behavior |
| [Error Codes](./docs/sdk-reference/error-codes)      | All error codes with causes and fixes           |

---

Operator Guide [#operator-guide]

| <br />                                                                                 | <br />                                                |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [Dashboard Overview](./docs/operator-guide/dashboard-overview)                         | Navigation, get started checklist, testnet vs mainnet |
| [App Settings](./docs/operator-guide/configuration/app-settings)                       | App name, allowed origins, network                    |
| [App Wallets](./docs/operator-guide/configuration/app-wallets)                         | Funding, gas, and distribution wallets                |
| [Funding Mode](./docs/operator-guide/configuration/funding-mode)                       | Immediate, Deferred, and Manual                       |
| [API Keys](./docs/operator-guide/configuration/api-keys)                               | Generate, rotate, and manage keys                     |
| [Domains](./docs/operator-guide/configuration/domains)                                 | Allowed origins for SDK requests                      |
| [Branding & UI](./docs/operator-guide/configuration/branding-ui)                       | Customize the WalletButton modal                      |
| [Webhooks](./docs/operator-guide/configuration/webhooks)                               | Configure event delivery endpoints                    |
| [Alerts](./docs/operator-guide/configuration/alerts)                                   | Low-balance notifications                             |
| [Integrations](./docs/operator-guide/configuration/integrations)                       | SEP-24 fiat ramps and anchors                         |
| [Wallets](./docs/operator-guide/wallet-infrastructure/wallets)                         | Browse and manage user wallets                        |
| [Tokens / Trustlines](./docs/operator-guide/wallet-infrastructure/tokens-trustlines)   | Configure assets for user wallets                     |
| [Gas Sponsorship](./docs/operator-guide/wallet-infrastructure/gas-sponsorship)         | Transaction sponsorship rules                         |
| [Distribution Wallet](./docs/operator-guide/wallet-infrastructure/distribution-wallet) | Configure fund() behavior                             |
| [Users](./docs/operator-guide/user-management/users)                                   | Browse and manage app users                           |
| [Authentication](./docs/operator-guide/user-management/authentication)                 | OAuth providers and email OTP                         |
| [Transactions](./docs/operator-guide/observability/transactions)                       | On-chain transaction log                              |
| [Logs](./docs/operator-guide/observability/logs)                                       | API request and webhook delivery logs                 |

---

Guides [#guides]

| <br />                                                   | <br />                                    |
| -------------------------------------------------------- | ----------------------------------------- |
| [Deferred Flow Guide](./docs/guides/deferred-flow-guide) | KYC-gated wallet activation with webhooks |
| [Passkeys Guide](./docs/guides/passkeys-guide)           | Biometric auth with Face ID and Touch ID  |
| [Payments UI](./docs/guides/payments-ui)                 | Send, receive, and history components     |
| [Mainnet Checklist](./docs/guides/mainnet-checklist)     | Everything to verify before going live    |

# Architecture

Pollar sits between your app and the Stellar network. This page explains how the three components interact and how requests flow from your frontend to the blockchain.

---

The three components [#the-three-components]

<Mermaid
chart="flowchart TD
A(&#x22;Your App\nRemittances · Neobank · Wallet&#x22;):::external

    subgraph pollar[&#x22;Pollar&#x22;]
        B(&#x22;1. SDK\n@pollar/core · @pollar/react&#x22;):::sdk
        C(&#x22;2. Pollar Server\napi.pollar.xyz&#x22;):::server
        D(&#x22;3. Dashboard\ndashboard.pollar.xyz&#x22;):::dashboard
    end

    E(&#x22;Stellar Network\nTestnet · Mainnet&#x22;):::external
    F(&#x22;AWS KMS\nKey management&#x22;):::infra
    G(&#x22;PostgreSQL\nTransaction history&#x22;):::infra

    A -->|&#x22;calls&#x22;| B
    B -->|&#x22;HTTP&#x22;| C
    C -->|&#x22;submits transactions&#x22;| E
    C -->|&#x22;encrypts / decrypts keys&#x22;| F
    C -->|&#x22;persists tx history&#x22;| G
    D -.->|&#x22;configures&#x22;| C

    classDef external fill:#f1efe8,stroke:#b4b2a9,color:#444441
    classDef sdk fill:#e1f5ee,stroke:#1d9e75,color:#085041
    classDef server fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef dashboard fill:#faeeda,stroke:#ba7517,color:#633806
    classDef infra fill:#e6f1fb,stroke:#378add,color:#0c447c"

/>

| Component                                 | Runs where                                 | Your responsibility                                                |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| **SDK** (`@pollar/core`, `@pollar/react`) | Your frontend                              | Install and configure with your publishable key                    |
| **Pollar Server**                         | Hosted by Pollar at `api.pollar.xyz`       | Nothing — you call it via the SDK or REST API                      |
| **Dashboard**                             | Hosted by Pollar at `dashboard.pollar.xyz` | Configure your app settings, funding mode, and sponsorship wallets |

---

Networks [#networks]

| Network     | Notes                                               |
| ----------- | --------------------------------------------------- |
| **Testnet** | Development and testing. Free, resets periodically. |
| **Mainnet** | Production. Real XLM required.                      |

Futurenet is not supported by default. If your project requires it, [contact us](mailto:hello@pollar.xyz).

Each network has its own set of API keys — see [API Keys](../getting-started/api-keys) for prefixes and usage rules.

> Full details on Stellar networks at [developers.stellar.org/docs/networks](https://developers.stellar.org/docs/networks).

---

App wallets [#app-wallets]

When you create an app in the Dashboard, Pollar provisions a set of Stellar accounts
that cover costs on behalf of your users — not user funds, but the infrastructure
costs of running wallets on Stellar. There are three distinct roles:

| Wallet                  | Covers                                       | Charged when               |
| ----------------------- | -------------------------------------------- | -------------------------- |
| **Funding wallet**      | XLM reserve for new user wallets             | Once per wallet activation |
| **Gas wallet**          | Transaction fees for all on-chain operations | Every transaction          |
| **Distribution wallet** | Assets sent via `fund()`                     | Every `fund()` call        |

By default a single wallet is created when you create your app and covers all three
roles. This is fine for development and early-stage apps.

As your app scales, separating them into three distinct wallets gives you independent
balance tracking, separate funding schedules, and tighter control over each cost
center. For example, your gas wallet gets topped up frequently in small amounts while
your funding wallet is replenished in larger batches tied to user growth. Mixing them
in a single wallet makes it harder to monitor and plan each cost independently.

For configuration and recommended minimum balances see
[Operator guide/Configuration/App Wallets](../operator-guide/configuration/app-wallets).

---

Request lifecycle [#request-lifecycle]

What happens from the moment a user calls `login()` to the moment their wallet is ready:

<Mermaid
chart="sequenceDiagram
participant App as Your App
participant SDK as Pollar SDK
participant Server as Pollar Server
participant KMS as AWS KMS
participant Stellar as Stellar Network

    App->>SDK: login({ provider: 'google' })
    SDK->>Server: POST /wallets/create
    Server->>KMS: generateDataKey()
    KMS-->>Server: encryptedKey
    Server->>Stellar: createAccount + changeTrust
    Note over Server,Stellar: Fees and XLM reserve paid by your sponsorship wallet(s)
    Stellar-->>Server: G-address confirmed
    Server-->>SDK: { address, status }
    SDK-->>App: wallet available in usePollar()"

/>

For the deferred funding flow see [Funding Modes](./funding-modes.md).

---

Security boundary [#security-boundary]

All private keys — user wallets and your app's sponsorship wallets — are managed through AWS KMS and never stored in plaintext anywhere in Pollar's infrastructure.

When the Pollar Server needs to sign a transaction, it requests a decryption from KMS. Every request leaves an immutable CloudTrail audit record.

By design, the Pollar Server can only:

- Sign fee-bump transactions (to cover transaction fees on behalf of users)

- Execute account sponsorship sequences (to fund new wallets)

The Pollar Server cannot move user funds — the sponsorship wallet only covers fees and XLM reserves and has no authority to transfer a user's assets.

For the full security model see [Security Model](./security-model).

---

Data persistence [#data-persistence]

| Data                         | Where it lives    | Retention         |
| ---------------------------- | ----------------- | ----------------- |
| Transaction history (recent) | Stellar RPC       | 7 days            |
| Transaction history (full)   | Pollar PostgreSQL | Indefinite        |
| Encrypted private keys       | AWS KMS           | Per key lifecycle |
| App configuration            | Pollar PostgreSQL | Per app lifecycle |

The Pollar Server intercepts every fee-bump transaction it signs and persists it to PostgreSQL. Because Pollar processes all fee-bumps for your app, it has full visibility into your transaction history without indexing the entire blockchain.

For details on querying history see [Transaction History](./transaction-history).

# Funding Modes

Every Stellar account requires a minimum XLM reserve to exist on-chain. Pollar gives you two modes to control exactly when that reserve is funded — so you only pay for users who matter to your app.

Configure the funding mode from **Dashboard → Configuration → Funding Mode**. No code changes required.

---

The two modes [#the-two-modes]

<Mermaid
chart="flowchart TD
A(&#x22;User registers&#x22;):::neutral
A --> B{&#x22;Funding mode&#x22;}:::decision
B -->|&#x22;Immediate&#x22;| C(&#x22;Wallet funded on registration\n~2 XLM charged at login&#x22;):::immediate
B -->|&#x22;Deferred&#x22;| D(&#x22;G-address created, no reserve\nActivated via webhook from your backend&#x22;):::deferred
C --> E(&#x22;Wallet ready&#x22;):::ready
D --> F(&#x22;Wallet pending&#x22;):::pending
F -->|&#x22;POST /activate\nor Dashboard button&#x22;| E

    classDef neutral fill:#f1efe8,stroke:#b4b2a9,color:#444441
    classDef decision fill:#faeeda,stroke:#ba7517,color:#633806
    classDef immediate fill:#eaf3de,stroke:#639922,color:#3b6d11
    classDef deferred fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef ready fill:#eaf3de,stroke:#639922,color:#3b6d11
    classDef pending fill:#e6f1fb,stroke:#378add,color:#0c447c"

/>

| Mode          | XLM cost                    | Activation trigger        | Best for                                      |
| ------------- | --------------------------- | ------------------------- | --------------------------------------------- |
| **Immediate** | \~2 XLM per registration    | Automatic on login        | Apps without compliance requirements          |
| **Deferred**  | \~2 XLM per activation only | Webhook from your backend | Neobanks, remittance apps, KYC-gated products |

In both modes, any individual wallet can also be activated manually from **Dashboard → Wallet Infrastructure → Wallets → Activate**. This is useful as a fallback or for support workflows.

> **How the \~2 XLM is calculated:** Every Stellar account requires a base reserve of **1 XLM**. Each trustline (asset) you configure in the Dashboard adds **0.5 XLM**:
>
> `1 XLM + (number of configured assets × 0.5 XLM)`
>
> | Assets configured    | Reserve required |
> | -------------------- | ---------------- |
> | 0                    | 1 XLM            |
> | 1 (e.g. USDC)        | 1.5 XLM          |
> | 2 (e.g. USDC + EURC) | 2 XLM            |
> | 3                    | 2.5 XLM          |
>
> Pollar does not charge extra — the full amount is consumed from your funding wallet.
>
> References: [Minimum Balance](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) · [Trustlines](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines)

---

Immediate [#immediate]

The wallet is funded atomically at the moment the user logs in. Ready in under 3 seconds. No additional setup required.

**Cost:** \~2 XLM per registration, including users who abandon onboarding.

```tsx
const { login, wallet } = usePollar();
await login({ provider: "google" });
// wallet is funded and ready immediately
```

---

Deferred [#deferred]

The G-address is created on-chain at registration but without an XLM reserve. The wallet exists but cannot transact until it is activated.

**Cost:** \~2 XLM only for users who complete activation. Zero cost for users who abandon.

This mode solves a problem unique to Stellar: every account needs a minimum XLM reserve to exist on-chain. Without deferred funding, an app with 10,000 users who abandon onboarding burns 20,000 XLM for nothing.

Activating via webhook [#activating-via-webhook]

Your backend calls `POST /activate` when a business event occurs — KYC approved, first deposit, email verified, or any trigger you define.

```bash
POST https://api.pollar.xyz/wallets/activate
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "walletId": "wal_abc123"
}
```

The Pollar Server retries until it receives a `200` response.

> Never call `POST /activate` from the client. It requires your secret key and must run on your backend.

**Response codes:**

| Code                      | Meaning                                              |
| ------------------------- | ---------------------------------------------------- |
| `200 OK`                  | Wallet activated. XLM reserve funded on-chain.       |
| `400 Bad Request`         | Missing or malformed `walletId`.                     |
| `402 Payment Required`    | Funding wallet has insufficient XLM.                 |
| `404 Not Found`           | `walletId` does not exist in your app.               |
| `409 Conflict`            | Wallet is already active. Safe to ignore.            |
| `503 Service Unavailable` | Stellar network issue. Pollar retries automatically. |

Activating manually from the Dashboard [#activating-manually-from-the-dashboard]

Any wallet in `pending` status can be activated from **Dashboard → Wallet Infrastructure → Wallets → Activate**. This works in both Immediate and Deferred mode and is useful for support workflows or one-off overrides.

Checking wallet status [#checking-wallet-status]

```tsx
const { wallet } = usePollar();

if (wallet?.status === "pending") {
  // wallet exists but is not yet funded — show KYC flow
}

if (wallet?.status === "active") {
  // wallet is funded and ready to transact
}
```

---

Switching modes [#switching-modes]

You can switch funding modes at any time from the Dashboard without changing any code. The new mode applies to all wallets created after the switch. Existing wallets are not affected.

---

Cost comparison [#cost-comparison]

For an app with 10,000 registered users where 30% complete activation:

| Mode        | XLM spent        | Cost basis           |
| ----------- | ---------------- | -------------------- |
| Immediate   | \~20,000 XLM     | Every registration   |
| Deferred    | \~6,000 XLM      | Only activated users |
| **Savings** | **\~14,000 XLM** | <br />               |

The Dashboard shows a real-time cost breakdown per mode so you can optimize as your app grows.

# Security Model

Pollar manages private keys on behalf of your users and your app. This page explains exactly how keys are stored, who can access them, and how the system prevents unauthorized access.

---

Key management models [#key-management-models]

| Model                         | Who holds the key                                       | Status        |
| ----------------------------- | ------------------------------------------------------- | ------------- |
| **AWS KMS**                   | KMS — no Pollar employee can access keys silently       | Available     |
| **Passkeys (WebAuthn)**       | The user's device Secure Enclave — Pollar never sees it | `coming soon` |
| **BYOK (Bring Your Own KMS)** | Your own KMS instance — full operator control           | `coming soon` |
| **MPC**                       | No single actor holds the full key                      | `coming soon` |

---

AWS KMS [#aws-kms]

All private keys — user wallets and your app's sponsorship wallets (funding, gas, distribution) — are managed through AWS KMS using envelope encryption. No key is ever stored in plaintext anywhere in Pollar's infrastructure.

```
Private key (plaintext)
  └── Encrypted with a data key (AES-256-GCM)
        └── Data key encrypted by AWS KMS master key
              └── Master key never leaves AWS KMS hardware
```

**The flow for every signing operation:**

1. Pollar Server calls `KMS.generateDataKey()` at wallet creation
2. KMS returns a plaintext data key and an encrypted copy
3. Pollar Server encrypts the private key, then immediately discards the plaintext data key
4. Only ciphertext is stored in the database — useless without KMS access
5. To sign a transaction, Pollar Server calls `KMS.decrypt()`, decrypts the key in memory, signs, and discards

Every `KMS.decrypt()` call is logged to AWS CloudTrail with an immutable audit trail. No Pollar employee can access a key without leaving a permanent record.

---

Passkeys / WebAuthn `coming soon` [#passkeys--webauthn-coming-soon]

When Passkeys are enabled, the private key is generated on the user's device and stored in the **Secure Enclave** — the hardware security module built into iOS and Android devices.

```
Private key generated on device
  └── Stored in Secure Enclave (Face ID / Touch ID protected)
        └── Pollar never receives or stores the private key
              └── Transactions signed on-device — only the signature is sent to the server
```

Users authenticate with biometrics to sign transactions. Pollar has zero custody of the key.

**Account recovery (3 layers):**

| Layer | Mechanism                                                     | Covers             |
| ----- | ------------------------------------------------------------- | ------------------ |
| 1     | Native cloud sync (iCloud Keychain / Google Password Manager) | \~80% of cases     |
| 2     | Secondary Passkey registered on a backup device               | Multi-device users |
| 3     | Social re-keying via OAuth re-auth + Stellar `setOptions`     | Total device loss  |

---

BYOK — Bring Your Own KMS `coming soon` [#byok--bring-your-own-kms-coming-soon]

By default, Pollar manages the AWS KMS master keys. With BYOK, you configure your own KMS instance from the Dashboard — Pollar's server calls your KMS instead of its own.

For compliance requirements that mandate operator control over root encryption keys.

---

MPC — Multi-Party Computation `coming soon` [#mpc--multi-party-computation-coming-soon]

With MPC, the private key is split using Shamir Secret Sharing. No single actor — not Pollar, not the user, not your app — holds the complete key. Signing requires a threshold of parties to cooperate, enabling social recovery without any dependency on Pollar.

---

Pollar Server boundaries [#pollar-server-boundaries]

The Pollar Server is designed with minimum privileges:

| Operation                             | Allowed                                 |
| ------------------------------------- | --------------------------------------- |
| Sign fee-bump transactions            | Yes — to cover fees on behalf of users  |
| Execute account sponsorship sequences | Yes — to fund new wallets               |
| Move a user's own funds independently | **No**                                  |
| Access user private keys without KMS  | **No** — all keys are encrypted at rest |

Why the Pollar Server cannot move a user's own funds — technically [#why-the-pollar-server-cannot-move-a-users-own-funds--technically]

A fee-bump transaction has two layers: an inner transaction (signed by the user's key) and an outer wrapper (signed by the Pollar sponsor). The outer signature only authorizes paying the fee — it has no authority over the inner transaction's operations. Moving a user's funds requires a `payment` or `pathPayment` operation inside the inner transaction, which must be signed by the user's own private key. The sponsor keypair Pollar holds can never produce that signature.

In other words: Pollar's sponsor key is structurally limited to "I'll pay the fee for this transaction" — the contents of the transaction are entirely controlled by the user's key, which Pollar only accesses via KMS to sign operations the user initiates.

Operator wallets (funding, gas, distribution) [#operator-wallets-funding-gas-distribution]

These wallets are also managed via AWS KMS — Pollar holds the encrypted keys and signs on their behalf. The distinction from user wallets is that these are _your_ wallets, funded by you, and exist specifically so Pollar can operate them for a defined set of tasks: funding XLM reserves, paying transaction fees, and distributing assets via `fund()`. Every signing operation is logged to AWS CloudTrail. Pollar cannot use these wallets outside of those operations, and no action goes unrecorded.

Fee-bump policy enforcement [#fee-bump-policy-enforcement]

Before signing any fee-bump, the Pollar Server validates:

- Fee does not exceed `max_fee_per_tx` configured in Dashboard
- User has not exceeded their `daily_ops_cap`
- Asset is in the app's `approved_assets` list
- Gas wallet balance is above the minimum reserve threshold

These rules are enforced server-side and cannot be bypassed from the client SDK.

---

Attack surface [#attack-surface]

| Vector                    | Risk                             | Mitigation                                                            |
| ------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| Database compromised      | Key exposure                     | Only ciphertext stored — useless without KMS                          |
| Insider threat            | Pollar employee accesses keys    | Every KMS decrypt logged to immutable CloudTrail                      |
| Pollar Server compromised | Unauthorized fee-bumps           | Sponsor keypair has fee-bump privileges only — cannot move user funds |
| Webhook spoofing          | Unauthorized wallet activations  | Secret key required — server-side validation                          |
| Client-side bypass        | SDK manipulated to skip policies | All policy enforcement is server-side                                 |
| Device loss (Passkeys)    | Passkey inaccessible             | Three-layer recovery                                                  |

# Stellar Primitives

Pollar is built on top of specific Stellar protocol features. You don't need to know Stellar deeply to use Pollar — but understanding these primitives helps you make better decisions about funding modes, security, and fiat ramps.

---

Account model [#account-model]

Stellar accounts are identified by a **G-address** (a public key starting with `G`). Every account must hold a minimum **XLM reserve** to exist on-chain — currently 1 XLM base reserve plus 0.5 XLM per entry (trustlines, offers, etc.).

This is different from EVM chains, where an address exists as soon as someone sends funds to it.

**What Pollar does:** Creates the G-address for your user and manages the XLM reserve on their behalf, so users never need to know what a reserve is or where to get XLM.

---

Fee-bump transactions [#fee-bump-transactions]

Every Stellar transaction requires a small XLM fee paid by the submitter. Without fee-bumps, users would need XLM before they can do anything — a problem for new users who have never held crypto.

Fee-bump transactions solve this: a third party (the sponsor) wraps the user's transaction and pays the fee on their behalf. The user's transaction is valid, the sponsor pays, and the user needs zero XLM.

**What Pollar does:** The Pollar Server maintains a sponsor keypair for your app. Every transaction submitted through the SDK is automatically wrapped in a fee-bump, paid from your app's gas wallet.

```
User transaction (inner tx)
└── Fee-bump wrapper (outer tx)
    └── Signed by Pollar sponsor
    └── Fee paid from your gas wallet
```

---

Account sponsorship [#account-sponsorship]

Beyond fee-bumps, Stellar has a native sponsorship model for account reserves. A sponsor can cover the XLM reserve of another account using `beginSponsoringFutureReserves` / `endSponsoringFutureReserves`.

This is what enables Pollar's Deferred mode: the G-address exists on-chain with no reserve until activation, at which point Pollar executes the sponsorship sequence atomically.

```
beginSponsoringFutureReserves(userAddress)
  createAccount(userAddress, startingBalance: 0)
  changeTrust(USDC, source: userAddress)
endSponsoringFutureReserves(source: userAddress)
```

If any operation fails, the entire transaction reverts — no partial states.

---

Trustlines [#trustlines]

In Stellar, an account must explicitly opt in to hold an asset by creating a **trustline**. Without a trustline for USDC, an account cannot receive or hold it.

**What Pollar does:** Automatically enables trustlines for all assets configured in your Dashboard at wallet creation or activation. If no assets are configured, no trustlines are set up. Users never see a trustline prompt.

---

SEP-10 — Stellar Web Authentication [#sep-10--stellar-web-authentication]

SEP-10 is a Stellar standard for authenticating ownership of a Stellar account using a challenge-response mechanism — no passwords, no email, just a signed Stellar transaction.

**What Pollar uses it for:** Authenticating operators in the Dashboard. When you sign in to `dashboard.pollar.xyz`, your Stellar wallet signs a challenge proving you own the account.

---

SEP-24 — Hosted Deposit and Withdrawal [#sep-24--hosted-deposit-and-withdrawal]

SEP-24 is a Stellar standard for fiat on/off-ramps. It defines a protocol between a wallet app and an **anchor** (a licensed financial institution) for depositing and withdrawing fiat currency in exchange for Stellar assets like USDC.

**What Pollar uses it for:** Embedding fiat deposit and withdrawal flows directly in your app via a modal. Activate SEP-24 with a single flag in the Dashboard.

---

SEP-7 — Payment Request URIs `coming soon` [#sep-7--payment-request-uris-coming-soon]

SEP-7 defines a URI scheme for Stellar payment requests — similar to Bitcoin's `bitcoin:` URIs. A SEP-7 URI encodes destination, asset, amount, and memo so any compatible wallet can pre-fill a payment form by scanning a QR code or opening a link.

**What Pollar will use it for:** The receive flow — QR codes and shareable payment links that work with any SEP-7 compatible Stellar wallet.

---

Quick reference [#quick-reference]

| Primitive               | Used in Pollar for                                 |
| ----------------------- | -------------------------------------------------- |
| G-address + XLM reserve | Wallet creation, funding modes                     |
| Fee-bump transactions   | Gas sponsorship — users pay zero XLM               |
| Account sponsorship     | Deferred and Manual funding modes                  |
| Trustlines              | Automatic asset enablement on activation           |
| SEP-10                  | Dashboard authentication                           |
| SEP-24                  | Fiat deposit and withdrawal                        |
| SEP-7                   | Receive QR codes and payment links (`coming soon`) |

# Transaction History

Pollar provides complete transaction history for every wallet through two complementary layers — one from the Stellar network and one from Pollar's own database.

---

Two-layer architecture [#two-layer-architecture]

<Mermaid
chart="flowchart LR
subgraph sources[&#x22;Data sources&#x22;]
A(&#x22;Stellar RPC\nLast 7 days&#x22;):::stellar
B(&#x22;Pollar PostgreSQL\nFull history&#x22;):::db
end

    C(&#x22;Pollar Server&#x22;):::server
    D(&#x22;Your App\nSDK · REST API&#x22;):::app

    A -->|&#x22;recent txs&#x22;| C
    B -->|&#x22;full history&#x22;| C
    C -->|&#x22;merged, paginated&#x22;| D

    classDef stellar fill:#faeeda,stroke:#ba7517,color:#633806
    classDef db fill:#e6f1fb,stroke:#378add,color:#0c447c
    classDef server fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef app fill:#e1f5ee,stroke:#1d9e75,color:#085041"

/>

| Layer  | Source            | Retention  |
| ------ | ----------------- | ---------- |
| Recent | Stellar RPC       | 7 days     |
| Full   | Pollar PostgreSQL | Indefinite |

The Pollar Server captures every transaction at fee-bump signing time and persists it to PostgreSQL. Because Pollar processes all fee-bumps for your app, it has full visibility without indexing the entire blockchain.

> Horizon (the older Stellar API) is formally deprecated by SDF. Pollar uses Stellar RPC exclusively.

---

SDK — React hook [#sdk--react-hook]

```tsx
"use client";
import { usePollar } from "@pollar/react";

export function TxHistory() {
  const { txHistory, loadingHistory, fetchMoreHistory, hasMore } = usePollar();

  return (
    <div>
      <ul>
        {txHistory.map((tx) => (
          <li key={tx.hash}>
            {tx.type === "send" ? "↑" : "↓"} {tx.amount} {tx.asset}
            <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button onClick={fetchMoreHistory} disabled={loadingHistory}>
          {loadingHistory ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
```

SDK — Core client [#sdk--core-client]

```typescript
const { transactions, nextCursor, hasMore } = await pollar.getHistory({
  walletId: "wal_abc123",
  limit: 20, // default: 20, max: 100
  cursor: undefined, // pass nextCursor from previous response to paginate
});
```

---

REST API [#rest-api]

Available for backend use with your secret key.

```bash
GET https://api.pollar.xyz/wallets/:walletId/transactions
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

**Query parameters:**

| Parameter | Type     | Default | Description                                   |
| --------- | -------- | ------- | --------------------------------------------- |
| `limit`   | `number` | `20`    | Transactions per page. Max `100`.             |
| `cursor`  | `string` | —       | Pagination cursor from previous response.     |
| `type`    | `string` | —       | Filter: `payment`, `activation`, `trustline`. |
| `asset`   | `string` | —       | Filter by asset code, e.g. `USDC`.            |
| `from`    | ISO 8601 | —       | Start date.                                   |
| `to`      | ISO 8601 | —       | End date.                                     |

**Response:**

```json
{
  "transactions": [
    {
      "hash": "a1b2c3d4...",
      "type": "payment",
      "asset": "USDC",
      "amount": "10.00",
      "from": "GABC...",
      "to": "GXYZ...",
      "feeSponsored": true,
      "ledger": 1234567,
      "timestamp": "2026-03-15T10:30:00Z"
    }
  ],
  "cursor": "eyJsZWRnZXIiOjEyMzQ1NjZ9",
  "hasMore": true
}
```

---

Pagination [#pagination]

Pollar uses cursor-based pagination. Cursors are stable — new transactions don't shift existing pages.

```typescript
async function getAllTransactions(walletId: string) {
  const all = [];
  let cursor: string | undefined;

  do {
    const page = await pollar.getHistory({ walletId, limit: 100, cursor });
    all.push(...page.transactions);
    cursor = page.nextCursor;
  } while (page.hasMore);

  return all;
}
```

---

Transaction types [#transaction-types]

| Type         | Description                             |
| ------------ | --------------------------------------- |
| `payment`    | Asset transfer between wallets          |
| `activation` | Wallet funded — XLM reserve established |
| `trustline`  | Asset trustline enabled                 |
| `receive`    | Incoming payment from outside Pollar    |

---

`TxRecord` type [#txrecord-type]

```typescript
type TxRecord = {
  hash: string;
  type: "payment" | "activation" | "trustline" | "receive";
  asset: string;
  amount: string;
  from: string;
  to: string;
  feeSponsored: boolean;
  ledger: number;
  timestamp: string; // ISO 8601
};
```

# API Keys

---

Pollar issues two types of keys per environment. Understanding the difference is important before writing any code.

---

Key types [#key-types]

| Type        | Prefix         | Network | Use                                     |
| ----------- | -------------- | ------- | --------------------------------------- |
| Publishable | `pub_testnet_` | Testnet | Frontend only (safe to expose)          |
| Publishable | `pub_mainnet_` | Mainnet | Frontend only (safe to expose)          |
| Secret      | `sec_testnet_` | Testnet | Backend only (never expose client-side) |
| Secret      | `sec_mainnet_` | Mainnet | Backend only (never expose client-side) |

The **publishable key** is passed to `@pollar/core` or `@pollar/react` in your frontend. The **secret key** stays on your backend and is used for privileged operations like triggering wallet activation via `POST /activate`.

> For details on Stellar networks (Testnet vs Mainnet) see the [Stellar Networks docs](https://developers.stellar.org/docs/networks).

---

Generating a key [#generating-a-key]

1. Go to [dashboard.pollar.xyz](https://dashboard.pollar.xyz) and sign in with Google, GitHub, or email OTP
2. Navigate to **Configuration → API Keys → Generate**
3. Select the key type and network
4. Copy and store it securely — secret keys are only shown once

Start with `pub_testnet_` for development. Switch to `pub_mainnet_` when ready for production.

> **Testnet rate limit:** Testnet keys are limited to 1,000 requests per day. This is enough for active development — if you hit the limit, wait until the next UTC day or [contact us](mailto:hello@pollar.xyz) for a temporary increase.

---

Environment variables [#environment-variables]

Store keys in environment variables — never hardcode them or commit them to version control.

Next.js [#nextjs]

```bash
# .env.local
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx
POLLAR_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`NEXT_PUBLIC_` prefix makes the publishable key available client-side. Never apply this prefix to the secret key.

Vite / CRA [#vite--cra]

```bash
# .env.local
VITE_POLLAR_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx
POLLAR_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`VITE_` prefix exposes the variable to the browser bundle. Never apply it to the secret key.

---

Security rules [#security-rules]

- The publishable key is safe to expose in frontend code — it can only initiate user-authenticated operations

- The secret key must never appear in client-side code, browser bundles, or public repositories

- For mainnet, use build-time environment injection or a backend proxy — never hardcode `pub_mainnet_` in source

- Rotate a compromised key immediately from **Dashboard → Configuration → API Keys**

# Example App

A fully working Next.js demo that shows Pollar's complete onboarding-to-payment flow. Clone it, run it in under 5 minutes, and use it as a starting point for your own integration

**Repository:** [https://github.com/pollar-xyz/demo-nextjs](https://github.com/pollar-xyz/demo-nextjs)

---

What it demonstrates [#what-it-demonstrates]

| Feature                        | Description                                                                                                              | Status        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------- |
| Social login                   | Google, GitHub, and email OTP via `usePollar().login()`                                                                  | ✓             |
| Wallet creation                | Stellar G-address created and encrypted with AWS KMS on login                                                            | ✓             |
| Deferred mode — KYC simulation | A button triggers a Next.js API route that calls `POST /activate` with the secret key, simulating a backend KYC approval | ✓             |
| Send USDC                      | Transfer USDC to any Stellar address with zero fee UX                                                                    | ✓             |
| Receive                        | QR code (SEP-7 format) and shareable payment link                                                                        | `coming soon` |
| Transaction history            | Full paginated history via `txHistory` hook                                                                              | ✓             |
| Testnet funding                | `fund()` hook requests configured assets from the distribution wallet                                                    | `coming soon` |
| Passkeys                       | Biometric auth with Face ID / Touch ID                                                                                   | `coming soon` |
| SEP-24 fiat deposit            | Fiat on-ramp via Anclap testnet                                                                                          | `coming soon` |

---

Live demo [#live-demo]

[demo-nextjs.pollar.xyz](https://demo-nextjs.pollar.xyz) — runs on Stellar testnet. Complete a full onboarding flow and test every feature without touching mainnet funds.

---

Run locally [#run-locally]

```bash
git clone https://github.com/pollar-xyz/demo-nextjs
cd template-nextjs
npm install
cp .env.example .env.local
```

Add your keys to `.env.local`:

```bash
# Publishable — used in the frontend
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx

# Secret — used only in API routes, never exposed to the browser
POLLAR_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

App structure [#app-structure]

```
template-nextjs/
├── app/
│   ├── layout.tsx              # PollarProvider wraps the app
│   ├── page.tsx                # Route: login vs wallet view
│   │
│   ├── api/
│   │   └── activate/
│   │       └── route.ts        # POST /api/activate — calls Pollar Server with secret key
│   │
│   └── components/
│       ├── LoginButton.tsx     # OAuth + email OTP
│       ├── WalletCard.tsx      # Balance and address display
│       ├── SendPaymentForm.tsx # sendPayment()
│       ├── ReceiveView.tsx     # QR code + shareable link
│       ├── TxHistoryList.tsx   # txHistory hook
│       └── KycGate.tsx         # Calls /api/activate to simulate KYC approval
│
├── .env.example
└── package.json
```

---

Key patterns [#key-patterns]

Provider setup [#provider-setup]

```tsx
// app/layout.tsx
import { PollarProvider } from "@pollar/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <PollarProvider
          publishableKey={process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY!}
        >
          {children}
        </PollarProvider>
      </body>
    </html>
  );
}
```

Deferred mode — KYC simulation [#deferred-mode--kyc-simulation]

The demo includes a Next.js API route that simulates a KYC provider calling your backend after a user is verified. The frontend calls this route — the route calls Pollar's `POST /activate` using the secret key server-side.

```ts
// app/api/activate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { walletId } = await req.json();

  const response = await fetch("https://api.pollar.xyz/wallets/activate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.POLLAR_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletId }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(error, { status: response.status });
  }

  return NextResponse.json({ activated: true });
}
```

The frontend `KycGate` component calls this route — the secret key never leaves the server:

```tsx
// app/components/KycGate.tsx
"use client";
import { usePollar } from "@pollar/react";

export function KycGate() {
  const { wallet } = usePollar();

  if (wallet?.status !== "pending") return null;

  async function handleActivate() {
    await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletId: wallet!.id }),
    });
  }

  return (
    <div>
      <p>Complete identity verification to activate your wallet.</p>
      <button onClick={handleActivate}>Simulate KYC approval</button>
    </div>
  );
}
```

In a real app, `/api/activate` would be called by your KYC provider's webhook — not by a button in the UI. See [Deferred Flow Guide](../guides/deferred-flow-guide) for the full production setup.

Testnet funding with `fund()` [#testnet-funding-with-fund]

The demo exposes a **Fund wallet** button that calls `fund()` from the `usePollar()` hook. This requests assets from your app's distribution wallet — a separate wallet configured in the Dashboard for this purpose.

```tsx
"use client";
import { usePollar } from "@pollar/react";

export function FundButton() {
  const { fund } = usePollar();

  return (
    <div>
      {/* Fund with XLM (default) */}
      <button onClick={() => fund()}>Fund with XLM</button>

      {/* Fund with a specific asset */}
      <button onClick={() => fund({ asset: "USDC" })}>Fund with USDC</button>
    </div>
  );
}
```

`fund()` behavior:

- Called without arguments, funds with XLM by default

- Pass `{ asset: 'USDC' }` (or any configured asset) to fund with a specific token

- Only assets configured in **Dashboard → Distribution Wallet** are accepted — throws an error otherwise

- Works on testnet by default

- Requires mainnet to be explicitly enabled in **Dashboard → Distribution Wallet → Allow fund() on mainnet**

- Throws an error if called on mainnet without that setting enabled

- Amount and rate limits (daily / weekly / monthly) are configured per asset in the Dashboard

- Debits the app's **distribution wallet** — separate from the funding and gas wallets

Receive — QR code and shareable link [#receive--qr-code-and-shareable-link]

```tsx
"use client";
import { usePollar } from "@pollar/react";

export function ReceiveView() {
  const { wallet } = usePollar();

  // coming soon: SEP-7 payment request URI
  // web+stellar:pay?destination=GXXX&asset_code=USDC&asset_issuer=GXXX
  const paymentLink = `https://pay.pollar.xyz/${wallet?.address}`;

  return (
    <div>
      {/* QR code component renders wallet.address */}
      <QRCode value={paymentLink} />
      <button onClick={() => navigator.clipboard.writeText(paymentLink)}>
        Copy payment link
      </button>
    </div>
  );
}
```

The QR code currently encodes the user's G-address as a payment link. SEP-7 support (which allows pre-filling asset, amount, and memo in any compatible Stellar wallet) is coming soon.

---

Funding modes in the demo [#funding-modes-in-the-demo]

Switch from **Dashboard → Settings → Funding Mode** — no code changes needed.

| Mode          | Behavior in the demo                                      |
| ------------- | --------------------------------------------------------- |
| **Immediate** | Wallet funded on login. KYC gate hidden.                  |
| **Deferred**  | Wallet unfunded until "Simulate KYC approval" is clicked. |
| **Manual**    | Wallet unfunded. Activate from the Dashboard.             |

---

Other templates [#other-templates]

| Template            | Repository                                                                  |
| ------------------- | --------------------------------------------------------------------------- |
| Next.js             | [pollar-xyz/template-nextjs](https://github.com/pollar-xyz/template-nextjs) |
| Expo / React Native | `coming soon`                                                               |
| TrueLayer           | `coming soon`                                                               |

---

Deploy [#deploy]

```bash
npx vercel
```

Set `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` and `POLLAR_SECRET_KEY` in Vercel environment variables. The secret key is used only in API routes and is never exposed to the browser.

# Overview

**Pollar** is the onboarding-to-payment infrastructure layer for consumer apps on Stellar. The full stack that takes a new user from clicking **Continue with Google** to sending USDC — without ever showing them a seed phrase, a wallet address, a transaction fee, or a trustline prompt.

---

The problem [#the-problem]

Every team building a consumer product on Stellar hits the same infrastructure wall before writing a single line of their actual product:

- Creating or linking a Stellar account for each user

- Handling XLM reserve funding

- Configuring trustlines for each asset

- Abstracting transaction fees from users unfamiliar with blockchain

- Building an onboarding flow that works for people with zero crypto experience

Pollar handles all of this so you can skip straight to building your product.

---

The solution [#the-solution]

```tsx
import { PollarProvider, usePollar } from "@pollar/react";

function App() {
  const { login, wallet, sendPayment } = usePollar();

  if (!wallet) {
    return (
      <button onClick={() => login({ provider: "google" })}>
        Continue with Google
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        sendPayment({ to: "GXXX...", amount: "10", asset: "USDC" })
      }
    >
      Send 10 USDC
    </button>
  );
}

export default function Root() {
  return (
    <PollarProvider publishableKey="pub_testnet_...">
      <App />
    </PollarProvider>
  );
}
```

In 20 lines: OAuth authentication, a funded Stellar wallet, and USDC payments. No seed phrases. No fee prompts. No trustline configuration.

---

How it compares [#how-it-compares]

| <br />                | Crossmint       | Privy | Dynamic | Stellar Wallets Kit  | **Pollar**       |
| --------------------- | --------------- | ----- | ------- | -------------------- | ---------------- |
| Stellar native        | Partial         | No    | No      | Yes (connector only) | **Yes**          |
| Deferred funding      | No              | N/A   | N/A     | No                   | **Yes (unique)** |
| Fee-bump native       | No              | N/A   | N/A     | No                   | **Yes**          |
| Built for startups    | No (enterprise) | Yes   | Yes     | Partial              | **Yes**          |
| Full onboarding stack | No              | No    | No      | No                   | **Yes**          |

# Quickstart

Get from zero to a working Stellar wallet with USDC payments in under 10 minutes.

**Requirements:** Node.js 18+ · React 18+ · A publishable key from [dashboard.pollar.xyz](https://dashboard.pollar.xyz)

> Testnet keys are rate-limited to 1,000 requests/day — plenty for development.

---

1\. Install [#1-install]

```bash
npm install @pollar/react
```

This includes `@pollar/core` as a peer dependency. If you are not using React:

```bash
npm install @pollar/core
```

---

2\. Add `PollarProvider` [#2-add-pollarprovider]

Wrap your app root once. Every child component can then call `usePollar()`.

```tsx
import { PollarProvider } from "@pollar/react";

export default function Root() {
  return (
    <PollarProvider
      publishableKey={process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY}
    >
      <App />
    </PollarProvider>
  );
}
```

`PollarProvider` already includes `"use client"` internally. Components that call `usePollar()` need `"use client"` because they use React hooks — that is a React requirement, not specific to Pollar.

Options [#options]

| Prop             | Type                           | Default | Description                                |
| ---------------- | ------------------------------ | ------- | ------------------------------------------ |
| `publishableKey` | `string`                       | —       | **Required.** Your Pollar publishable key. |
| `onError`        | `(error: PollarError) => void` | —       | Global error handler.                      |

Not using React? [#not-using-react]

```typescript
import { PollarClient } from "@pollar/core";

const pollar = new PollarClient({
  publishableKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY,
  network: "testnet",
});
```

---

3\. Login and create a wallet [#3-login-and-create-a-wallet]

```tsx
"use client";

import { usePollar } from "@pollar/react";

export function LoginButton() {
  const { login, wallet, loading } = usePollar();

  if (loading) return <p>Loading...</p>;
  if (wallet) return <p>✓ Wallet ready</p>;

  return (
    <button onClick={() => login({ provider: "google" })}>
      Continue with Google
    </button>
  );
}
```

When `login()` is called, Pollar:

1. Authenticates the user via OAuth (Google, GitHub, Discord) or email OTP
2. Creates a Stellar G-address on-chain
3. Encrypts the private key with AWS KMS
4. Enables trustlines for all assets configured in your Dashboard (if none configured, no trustlines are set up)
5. Funds the wallet based on your configured [funding mode](../core-concepts/funding-modes)

The user never sees a seed phrase, a wallet address, or a trustline prompt.

---

4\. Send USDC [#4-send-usdc]

```tsx
"use client";

import { usePollar } from "@pollar/react";

export function SendButton() {
  const { sendPayment } = usePollar();

  return (
    <button
      onClick={() =>
        sendPayment({
          to: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          amount: "10.00",
          asset: "USDC",
        })
      }
    >
      Send 10 USDC
    </button>
  );
}
```

Transaction fees are paid from your app's sponsorship wallet configured in the Dashboard. Users pay zero XLM.

---

5\. Transaction history [#5-transaction-history]

```tsx
"use client";

import { usePollar } from "@pollar/react";

export function History() {
  const { txHistory, loadingHistory } = usePollar();

  if (loadingHistory) return <p>Loading...</p>;

  return (
    <ul>
      {txHistory.map((tx) => (
        <li key={tx.hash}>
          {tx.type === "send" ? "↑" : "↓"} {tx.amount} {tx.asset}
        </li>
      ))}
    </ul>
  );
}
```

---

Complete example [#complete-example]

```tsx
"use client";

import { PollarProvider, usePollar } from "@pollar/react";

function WalletDemo() {
  const { login, wallet, sendPayment, txHistory, loading } = usePollar();

  if (loading) return <p>Loading...</p>;

  if (!wallet) {
    return (
      <button onClick={() => login({ provider: "google" })}>
        Continue with Google
      </button>
    );
  }

  return (
    <div>
      <p>✓ Wallet active</p>
      <button
        onClick={() =>
          sendPayment({ to: "GXXX...", amount: "5.00", asset: "USDC" })
        }
      >
        Send 5 USDC
      </button>
      <ul>
        {txHistory.map((tx) => (
          <li key={tx.hash}>
            {tx.amount} {tx.asset} · {tx.type}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <PollarProvider
      publishableKey={process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY}
    >
      <WalletDemo />
    </PollarProvider>
  );
}
```

---

> Both `@pollar/core` and `@pollar/react` ship with full TypeScript types — no `@types/` package needed.

# Deferred Flow Guide

Deferred mode creates user wallets on-chain without funding them immediately. The XLM reserve is only charged when your backend calls `POST /activate` — typically after a business event like KYC approval or a first deposit.

This guide walks through the full implementation end-to-end.

---

Prerequisites [#prerequisites]

- Funding mode set to **Deferred** in **Dashboard → Configuration → Funding Mode**
- A secret key from **Dashboard → Configuration → API Keys**
- That's it — no additional dashboard configuration required

---

How it works [#how-it-works]

<Mermaid
chart="sequenceDiagram
participant User
participant Frontend as Your Frontend
participant Backend as Your Backend
participant Pollar as Pollar Server
participant Stellar as Stellar Network

    User->>Frontend: login()
    Frontend->>Pollar: POST /wallets/create
    Pollar->>Stellar: createAccount (no reserve)
    Pollar-->>Frontend: { status: 'pending' }
    Frontend-->>User: Show KYC flow

    Note over User,Backend: User completes KYC / first deposit / your trigger

    Backend->>Pollar: POST /wallets/activate
    Note over Backend,Pollar: Uses secret key — never from client
    Pollar->>Stellar: beginSponsoringFutureReserves
    Stellar-->>Pollar: Reserve funded (~2s)
    Pollar-->>Backend: 200 { status: 'active' }
    Frontend-->>User: Wallet ready"

/>

---

Step 1 — Detect pending wallets in the frontend [#step-1--detect-pending-wallets-in-the-frontend]

After login, check the wallet status. If `pending`, show your KYC or onboarding flow instead of the wallet UI.

```tsx
"use client";
import { usePollar } from "@pollar/react";

export function WalletGate() {
  const { wallet, loading } = usePollar();

  if (loading) return <p>Loading...</p>;

  if (!wallet) return <LoginButton />;

  if (wallet.status === "pending") {
    return <KycFlow walletId={wallet.id} />;
  }

  return <WalletDashboard />;
}
```

---

Step 2 — Trigger activation from your backend [#step-2--trigger-activation-from-your-backend]

When the business event occurs (KYC approved, first deposit confirmed, etc.), your backend calls `POST /activate` using the **secret key**.

```typescript
// Your backend — e.g. Next.js API route, Express handler, webhook receiver
async function activateWallet(walletId: string) {
  const response = await fetch("https://api.pollar.xyz/wallets/activate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.POLLAR_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Activation failed: ${error.error.code}`);
  }

  return response.json();
  // { walletId, address, status: 'active', activatedAt }
}
```

> Never call `POST /activate` from the client. It requires your secret key — exposing it client-side compromises your entire app.

---

Step 3 — Handle the response [#step-3--handle-the-response]

| Code                      | Meaning                             | Action                                                 |
| ------------------------- | ----------------------------------- | ------------------------------------------------------ |
| `200 OK`                  | Wallet activated successfully       | Proceed — wallet is funded on-chain                    |
| `400 Bad Request`         | Missing or malformed `walletId`     | Check the request payload                              |
| `402 Payment Required`    | Funding wallet has insufficient XLM | Top up via **Dashboard → Configuration → App Wallets** |
| `404 Not Found`           | `walletId` does not exist           | Verify the wallet ID                                   |
| `409 Conflict`            | Wallet already active               | Safe to ignore — treat as success                      |
| `503 Service Unavailable` | Stellar network issue               | Pollar retries automatically                           |

---

Step 4 — Notify the frontend [#step-4--notify-the-frontend]

After activation, notify your frontend so the UI updates. The simplest approach is polling `wallet.status`. For real-time updates, use a websocket or server-sent event from your backend.

```tsx
"use client";
import { usePollar } from "@pollar/react";
import { useEffect } from "react";

export function KycFlow({ walletId }: { walletId: string }) {
  const { wallet, refetchWallet } = usePollar();

  // Poll every 2 seconds until wallet is active
  useEffect(() => {
    if (wallet?.status === "active") return;
    const interval = setInterval(refetchWallet, 2000);
    return () => clearInterval(interval);
  }, [wallet?.status]);

  if (wallet?.status === "active") {
    return <p>✓ Wallet activated</p>;
  }

  return <p>Complete KYC to activate your wallet...</p>;
}
```

---

Full Next.js example [#full-nextjs-example]

The [template-nextjs](https://github.com/pollar-xyz/template-nextjs) demo includes a working implementation:

- `app/api/activate/route.ts` — the API route that calls `POST /activate`
- `app/components/KycGate.tsx` — the frontend component that triggers it

---

Testing on testnet [#testing-on-testnet]

1. Set funding mode to **Deferred** in the Dashboard
2. Log in — the wallet is created with `status: 'pending'`
3. Call your activate endpoint manually (e.g. with curl or Postman)
4. Verify the wallet moves to `status: 'active'`
5. Verify the G-address on [Stellar Expert testnet](https://testnet.stellar.expert)

```bash
curl -X POST https://api.pollar.xyz/wallets/activate \
  -H "Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{ "walletId": "wal_abc123" }'
```

# Mainnet Checklist

Before switching your app to Mainnet, verify every item in this checklist. There are no approval requirements from Pollar — this is a technical checklist you verify independently.

---

Dashboard configuration [#dashboard-configuration]

- [ ] Created a separate Mainnet app in the Dashboard (do not reuse your Testnet app)

- [ ] Generated `pub_mainnet_` and `sec_mainnet_` keys

- [ ] Added your production domain(s) in **Dashboard → Configuration → Domains**

- [ ] Funding mode configured correctly for your use case

- [ ] At least one asset configured in **Tokens / Trustlines**

- [ ] Branding & UI configured with your production logo and colors

---

App Wallets [#app-wallets]

- [ ] Funding wallet active on Stellar Mainnet with sufficient XLM
  - Recommended minimum: 50 XLM to start

  - Calculate based on expected activations: `activations × (1 + assets × 0.5) XLM`

- [ ] Gas wallet active and funded
  - Recommended minimum: 10 XLM

- [ ] Distribution wallet funded (if using `fund()` on mainnet)

- [ ] Low-balance alerts configured in **Dashboard → Configuration → Alerts**
  - At minimum: email alert for funding wallet below 20 XLM

---

Environment variables [#environment-variables]

- [ ] `pub_mainnet_` key set in your production environment

- [ ] `sec_mainnet_` key set in your backend production environment

- [ ] No testnet keys present in production environment variables

- [ ] Keys not committed to version control

---

Backend (Deferred mode only) [#backend-deferred-mode-only]

- [ ] `POST /activate` endpoint deployed to production

- [ ] Endpoint uses `sec_mainnet_` secret key

- [ ] Endpoint validates input before calling Pollar

- [ ] `409 Conflict` response handled as success (wallet already active)

- [ ] `402 Payment Required` triggers an alert — your funding wallet needs a top-up

---

SDK integration [#sdk-integration]

- [ ] `PollarProvider` uses production publishable key

- [ ] No hardcoded testnet addresses or amounts

- [ ] Error handling implemented for `sendPayment()` failures

- [ ] Wallet `status: 'pending'` handled in the UI (Deferred / Manual mode)

- [ ] `fund()` on mainnet explicitly enabled in Dashboard if used

---

Testing [#testing]

- [ ] Full onboarding flow tested end-to-end on Mainnet with a real user account

- [ ] At least one real USDC payment sent and confirmed

- [ ] Transaction appears in **Dashboard → Observability → Transactions**

- [ ] Wallet visible on [Stellar Expert](https://stellar.expert)

- [ ] Webhook events received correctly (if configured)

---

Observability [#observability]

- [ ] **Dashboard → Observability → Logs** monitored after first real users

- [ ] Error alerting set up (Sentry, Datadog, or similar) for your backend

- [ ] Sponsorship wallet balances checked after first day of real usage

---

Stellar network reference [#stellar-network-reference]

- Mainnet passphrase: `Public Global Stellar Network ; September 2015`

- Mainnet Stellar Expert: [stellar.expert](https://stellar.expert)

- Network status: [status.stellar.org](https://status.stellar.org)

> Full network details at [developers.stellar.org/docs/networks](https://developers.stellar.org/docs/networks).

# Passkeys Guide `coming soon`

Passkeys let your users sign transactions with Face ID or Touch ID instead of a password or seed phrase. The private key is generated and stored in the device's Secure Enclave — Pollar never sees it.

---

How it works [#how-it-works]

With the default AWS KMS model, Pollar encrypts and manages the user's private key server-side. When a user enables a Passkey, the key migrates from KMS to their device's Secure Enclave:

```
Before Passkeys (KMS model)
  Private key → encrypted with AWS KMS → stored server-side
  Signing → Pollar Server decrypts key → signs → discards

After Passkeys (WebAuthn model)
  Private key → generated on device → stored in Secure Enclave
  Signing → user authenticates with Face ID / Touch ID → device signs locally
  Pollar receives only the signature — never the key
```

This means Pollar has zero custody of the key after Passkey setup. No KMS call, no audit trail needed — the key never touches Pollar infrastructure.

---

User flow [#user-flow]

1. User logs in with Google, GitHub, or email OTP as usual
2. After login, your app prompts: \*\*"Enable Face ID for faster sign-in"\*\*
3. User taps the button — device generates a keypair in the Secure Enclave
4. Pollar updates the wallet to use the new Passkey-backed key
5. All future transaction signatures happen on-device via biometrics

---

Implementation `coming soon` [#implementation-coming-soon]

```tsx
"use client";
import { usePollarPasskey } from "@pollar/react";

export function PasskeySetup() {
  const { setupPasskey, passkeyStatus, loading } = usePollarPasskey();

  if (passkeyStatus === "active") {
    return <p>✓ Face ID / Touch ID active</p>;
  }

  return (
    <button onClick={() => setupPasskey()} disabled={loading}>
      Enable Face ID
    </button>
  );
}
```

`setupPasskey()` triggers the WebAuthn registration flow:

1. Pollar Server generates a challenge
2. Device's Secure Enclave signs the challenge with a new keypair
3. Public key is sent to Pollar Server and associated with the wallet
4. Private key never leaves the device

---

Account recovery [#account-recovery]

If the user loses their device, Pollar provides three recovery layers:

| Layer | Mechanism                                                     | Covers             |
| ----- | ------------------------------------------------------------- | ------------------ |
| 1     | Native cloud sync (iCloud Keychain / Google Password Manager) | \~80% of cases     |
| 2     | Secondary Passkey registered on a backup device               | Multi-device users |
| 3     | Social re-keying via OAuth re-auth + Stellar `setOptions`     | Total device loss  |

---

Security properties [#security-properties]

| Property                    | KMS model             | Passkeys model     |
| --------------------------- | --------------------- | ------------------ |
| Key stored server-side      | Yes (encrypted)       | No                 |
| Pollar can access key       | With CloudTrail audit | Never              |
| Requires biometrics to sign | No                    | Yes                |
| Works offline               | No                    | Yes (signing only) |
| Recovery if device lost     | N/A                   | 3-layer recovery   |

---

Browser and device support [#browser-and-device-support]

WebAuthn (the underlying standard) is supported on:

- iOS 16+ (Face ID, Touch ID)
- Android 9+ (fingerprint, face unlock)
- macOS with Touch ID
- Windows Hello
- Any device with a FIDO2 hardware key

---

Enabling Passkeys for your app [#enabling-passkeys-for-your-app]

When available, Passkeys can be enabled per-app from **Dashboard → Configuration → App Settings → Key Management**. The feature is opt-in — existing users are not affected until they set up a Passkey themselves.

# Payments UI

This guide covers how to implement send, receive, and transaction history flows in your app using Pollar's hooks and pre-built components.

---

Send [#send]

Using `sendPayment()` [#using-sendpayment]

```tsx
"use client";
import { usePollarPayments } from "@pollar/react";
import { useState } from "react";

export function SendForm() {
  const { sendPayment, sending } = usePollarPayments();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSend() {
    const result = await sendPayment({
      to,
      amount,
      asset: "USDC",
    });
    console.log("Confirmed:", result.txHash);
  }

  return (
    <div>
      <input
        placeholder="Recipient G-address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "Send USDC"}
      </button>
    </div>
  );
}
```

With memo [#with-memo]

Memos are useful for identifying payments on the recipient's side — common in remittance and payroll apps.

```tsx
await sendPayment({
  to: "GXXX...",
  amount: "100.00",
  asset: "USDC",
  memo: "Payroll March 2026",
});
```

Pre-built `<SendPayment />` component `coming soon` [#pre-built-sendpayment--component-coming-soon]

A pre-built component with address input, asset selector, amount field, and confirmation step. Customizable from **Dashboard → Configuration → Branding & UI**.

---

Receive [#receive]

Showing the user's address [#showing-the-users-address]

```tsx
"use client";
import { usePollarWallet } from "@pollar/react";

export function ReceiveView() {
  const { wallet } = usePollarWallet();

  async function copyAddress() {
    await navigator.clipboard.writeText(wallet!.address);
  }

  return (
    <div>
      <p>{wallet?.address}</p>
      <button onClick={copyAddress}>Copy address</button>
    </div>
  );
}
```

QR code [#qr-code]

Generate a QR code from the wallet address using any QR library:

```tsx
import QRCode from "qrcode.react";
import { usePollarWallet } from "@pollar/react";

export function ReceiveQR() {
  const { wallet } = usePollarWallet();

  return <QRCode value={wallet?.address ?? ""} size={200} />;
}
```

SEP-7 payment request URI `coming soon` [#sep-7-payment-request-uri-coming-soon]

SEP-7 encodes destination, asset, amount, and memo into a single URI that any compatible Stellar wallet can scan to pre-fill a payment form:

```
web+stellar:pay?destination=GXXX&asset_code=USDC&asset_issuer=GXXX&amount=10
```

When available, Pollar will generate SEP-7 URIs automatically via `wallet.paymentRequestUri()`.

Pre-built `<ReceivePayment />` component `coming soon` [#pre-built-receivepayment--component-coming-soon]

A pre-built component with QR code display, copyable address, and shareable payment link.

---

Transaction history [#transaction-history]

Using `usePollarHistory()` [#using-usepollarhistory]

```tsx
"use client";
import { usePollarHistory } from "@pollar/react";

export function TxHistory() {
  const { txHistory, loadingHistory, fetchMoreHistory, hasMore } =
    usePollarHistory();

  if (loadingHistory && txHistory.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {txHistory.map((tx) => (
          <li key={tx.hash}>
            <span>{tx.type === "send" ? "↑" : "↓"}</span>
            <span>
              {tx.amount} {tx.asset}
            </span>
            <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button onClick={fetchMoreHistory} disabled={loadingHistory}>
          {loadingHistory ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
```

Filtering by type or asset [#filtering-by-type-or-asset]

```tsx
// Only payments
const payments = txHistory.filter((tx) => tx.type === "payment");

// Only USDC
const usdcTxs = txHistory.filter((tx) => tx.asset === "USDC");
```

For server-side filtering with date ranges, use the REST API directly — see [Transaction History](../core-concepts/transaction-history).

Pre-built `<PaymentHistory />` component `coming soon` [#pre-built-paymenthistory--component-coming-soon]

A pre-built paginated history component with type icons, asset labels, and date grouping.

---

Asset balances [#asset-balances]

Reading balances from the wallet [#reading-balances-from-the-wallet]

```tsx
"use client";
import { usePollarWallet } from "@pollar/react";

export function Balances() {
  const { wallet } = usePollarWallet();

  return (
    <ul>
      {wallet?.balances.map((b) => (
        <li key={b.asset}>
          {b.amount} {b.asset}
        </li>
      ))}
    </ul>
  );
}
```

Pre-built `<AssetBalance />` component `coming soon` [#pre-built-assetbalance--component-coming-soon]

A pre-built component for displaying a single asset balance with formatting and asset icon.

```tsx
// coming soon
<AssetBalance asset="USDC" />
```

---

Fiat on/off-ramp [#fiat-onoff-ramp]

Enable SEP-24 in **Dashboard → Configuration → Integrations** to add a deposit/withdrawal button:

```tsx
"use client";
import { usePollar } from "@pollar/react";

export function FiatButtons() {
  const { openFiatRamp } = usePollar();

  return (
    <div>
      <button onClick={() => openFiatRamp({ type: "deposit", asset: "USDC" })}>
        Deposit USD
      </button>
      <button
        onClick={() => openFiatRamp({ type: "withdrawal", asset: "USDC" })}
      >
        Withdraw USD
      </button>
    </div>
  );
}
```

See [Fiat Ramps](../operator-guide/configuration/integrations) for setup.

# Dashboard Overview

The Pollar Dashboard at [dashboard.pollar.xyz](https://dashboard.pollar.xyz) is the control panel for your app's configuration. Sign in with Google or email OTP — no Stellar wallet required.

Each app you create is isolated with its own API keys, wallets, and configuration. You can switch between apps and networks (Testnet / Mainnet) from the top navigation bar.

---

Navigation [#navigation]

Configuration [#configuration]

| Section           | What you do here                                                                |
| ----------------- | ------------------------------------------------------------------------------- |
| **App Settings**  | App name, allowed domains (CORS), and general configuration                     |
| **App Wallets**   | View and fund your operator wallets (funding, gas, distribution)                |
| **Funding Mode**  | Select Immediate, Deferred, or Manual wallet activation                         |
| **API Keys**      | Generate and manage publishable and secret keys                                 |
| **Domains**       | Configure allowed origins so the SDK can make requests from your app            |
| **Branding & UI** | Customize the `WalletButton` modal — colors, logo, and supported auth providers |
| **Webhooks**      | Configure inbound webhook URLs and view event logs                              |
| **Alerts**        | Set up low-balance alerts via email or webhook                                  |
| **Integrations**  | Enable SEP-24 fiat ramps and configure anchors                                  |

Wallet Infrastructure [#wallet-infrastructure]

| Section                 | What you do here                                                              |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Wallets**             | Browse and manage user wallets — view status, balances, and activate manually |
| **Tokens / Trustlines** | Configure which assets are automatically enabled on new user wallets          |
| **Gas Sponsorship**     | Set rules for which transaction types are sponsored and per-user limits       |
| **Distribution Wallet** | Configure `fund()` — assets, amounts, and rate limits                         |

User Management [#user-management]

| Section            | What you do here                                      |
| ------------------ | ----------------------------------------------------- |
| **Users**          | Browse users, view wallet status, and manage accounts |
| **Authentication** | Configure supported OAuth providers and email OTP     |

Observability [#observability]

| Section          | What you do here                                       |
| ---------------- | ------------------------------------------------------ |
| **Transactions** | View all on-chain transactions across your app         |
| **Logs**         | API request logs, errors, and webhook delivery history |

---

Get started checklist [#get-started-checklist]

When you create a new app, the Dashboard shows a checklist of required steps before you can go live:

1. **Configure API keys** — generate a publishable key to connect your SDK
2. **Configure domains** — add allowed origins so the SDK can make requests
3. **App wallet created and funded** — your funding wallet must be active on Stellar with enough XLM to cover wallet creation
4. **Enable trustlines** — configure at least one asset so user wallets can hold it
5. **Install the SDK and create your first wallet** — confirms the integration is working end-to-end

---

Testnet vs Mainnet [#testnet-vs-mainnet]

Every app has independent Testnet and Mainnet environments. Switch between them from the network selector in the top navigation bar. API keys, wallets, and configuration are completely separate between environments.

Start on Testnet — it's free and resets periodically. Move to Mainnet when you're ready for production. See [Mainnet Checklist](../guides/mainnet-checklist) before switching.

# Error Codes

All errors from the Pollar SDK and Server follow a consistent structure.

---

Error structure [#error-structure]

**SDK (`PollarError`):**

```typescript
{
  code: 'INSUFFICIENT_FUNDING_BALANCE',
  message: 'The funding wallet does not have enough XLM to activate this wallet.',
  status: 402,
  meta?: { ... }
}
```

**Server (REST API):**

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDING_BALANCE",
    "message": "The funding wallet does not have enough XLM to activate this wallet.",
    "status": 402
  }
}
```

---

Authentication [#authentication]

| Code                   | Status | Description                                  | Resolution                                                                                      |
| ---------------------- | ------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `UNAUTHORIZED`         | 401    | Missing or invalid API key                   | Check that you are passing the correct publishable or secret key                                |
| `KEY_NETWORK_MISMATCH` | 401    | Key prefix does not match the target network | Use `pub_testnet_` / `sec_testnet_` for testnet and `pub_mainnet_` / `sec_mainnet_` for mainnet |
| `KEY_REVOKED`          | 401    | API key has been revoked                     | Generate a new key from **Dashboard → API Keys**                                                |
| `SESSION_EXPIRED`      | 401    | User session has expired                     | Call `login()` again                                                                            |

---

Wallet [#wallet]

| Code                     | Status | Description                          | Resolution                                        |
| ------------------------ | ------ | ------------------------------------ | ------------------------------------------------- |
| `WALLET_NOT_FOUND`       | 404    | Wallet ID does not exist in your app | Verify the `walletId`                             |
| `WALLET_ALREADY_ACTIVE`  | 409    | Wallet is already active             | Safe to ignore — idempotent activation            |
| `WALLET_PENDING`         | 422    | Wallet exists but is not yet funded  | Activate the wallet before attempting to transact |
| `WALLET_CREATION_FAILED` | 500    | Failed to create wallet on Stellar   | Retry — transient Stellar network issue           |

---

Funding & Sponsorship [#funding--sponsorship]

| Code                                | Status | Description                                                             | Resolution                                                                  |
| ----------------------------------- | ------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `INSUFFICIENT_FUNDING_BALANCE`      | 402    | Funding wallet does not have enough XLM to cover the activation reserve | Top up your funding wallet from **Dashboard → Configuration → App Wallets** |
| `INSUFFICIENT_GAS_BALANCE`          | 402    | Gas wallet does not have enough XLM to pay transaction fees             | Top up your gas wallet from **Dashboard → Sponsorship Budget**              |
| `INSUFFICIENT_DISTRIBUTION_BALANCE` | 402    | Distribution wallet does not have enough of the requested asset         | Top up your distribution wallet from **Dashboard → Distribution Wallet**    |
| `FUND_NOT_ENABLED_ON_MAINNET`       | 403    | `fund()` was called on mainnet without explicit enablement              | Enable from **Dashboard → Distribution Wallet → Allow fund() on mainnet**   |
| `FUND_ASSET_NOT_CONFIGURED`         | 422    | The requested asset is not configured for distribution                  | Add the asset from **Dashboard → Distribution Wallet → Configured assets**  |
| `FUND_RATE_LIMIT_EXCEEDED`          | 429    | User has exceeded the configured funding rate limit                     | Configured in **Dashboard → Distribution Wallet → Rate limits**             |

---

Payments [#payments]

| Code                        | Status | Description                                                 | Resolution                                                    |
| --------------------------- | ------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `INVALID_DESTINATION`       | 400    | Recipient G-address is invalid or does not exist on Stellar | Verify the destination address                                |
| `INVALID_AMOUNT`            | 400    | Amount is not a valid decimal string or is zero or negative | Use a positive decimal string, e.g. `'10.00'`                 |
| `ASSET_NOT_SUPPORTED`       | 422    | Asset is not in the app's approved assets list              | Add the asset from **Dashboard → Settings → Approved assets** |
| `INSUFFICIENT_USER_BALANCE` | 422    | User wallet does not have enough of the asset               | Check `wallet.balances` before sending                        |
| `NO_TRUSTLINE`              | 422    | Recipient does not have a trustline for the asset           | Cannot send to an account without a trustline for this asset  |
| `TRANSACTION_FAILED`        | 500    | Transaction was rejected by Stellar                         | Check the `meta` field for the Stellar result code            |
| `FEE_BUMP_FAILED`           | 500    | Fee-bump signing failed                                     | Retry — contact support if it persists                        |

---

Trustlines [#trustlines]

| Code                        | Status | Description                             | Resolution                      |
| --------------------------- | ------ | --------------------------------------- | ------------------------------- |
| `TRUSTLINE_ALREADY_EXISTS`  | 409    | Trustline for this asset already exists | Safe to ignore                  |
| `TRUSTLINE_CREATION_FAILED` | 500    | Failed to create trustline on Stellar   | Retry — transient network issue |

---

Stellar Network [#stellar-network]

| Code                  | Status | Description                                            | Resolution                                                                           |
| --------------------- | ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `STELLAR_UNAVAILABLE` | 503    | Stellar network is unreachable                         | Pollar retries automatically. Check [status.stellar.org](https://status.stellar.org) |
| `STELLAR_TIMEOUT`     | 504    | Transaction submitted but not confirmed within timeout | Check Stellar Explorer with the `txHash` — the transaction may have landed           |
| `LEDGER_FULL`         | 503    | Ledger is full — surge pricing in effect               | Pollar retries with a higher fee automatically                                       |

---

Server [#server]

| Code              | Status | Description                                       | Resolution                                                                     |
| ----------------- | ------ | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `INVALID_REQUEST` | 400    | Malformed request body or missing required fields | Check the request payload against the API reference                            |
| `NOT_FOUND`       | 404    | Endpoint or resource does not exist               | Verify the URL and resource ID                                                 |
| `RATE_LIMITED`    | 429    | Too many requests                                 | Back off and retry. Testnet keys are limited to 1,000 req/day                  |
| `INTERNAL_ERROR`  | 500    | Unexpected server error                           | Retry. If it persists, contact support with the request ID from `X-Request-Id` |

---

Handling errors in the SDK [#handling-errors-in-the-sdk]

```typescript
import { PollarError } from "@pollar/core";

try {
  await pollar.sendPayment({ to: "GXXX...", amount: "10.00", asset: "USDC" });
} catch (err) {
  if (err instanceof PollarError) {
    switch (err.code) {
      case "INSUFFICIENT_USER_BALANCE":
        // show balance error to user
        break;
      case "STELLAR_UNAVAILABLE":
        // show retry UI
        break;
      default:
        console.error(err.code, err.message);
    }
  }
}
```

Using the global error handler:

```tsx
<PollarProvider
  publishableKey="pub_testnet_..."
  onError={(err) => {
    console.error(`[Pollar] ${err.code}: ${err.message}`);
  }}
>
  <App />
</PollarProvider>
```

# @pollar/core

Framework-agnostic TypeScript client for Pollar. Use this package directly if you are not using React, or to build custom integrations on top of the Pollar platform.

```bash
npm install @pollar/core
```

---

`PollarClient` [#pollarclient]

```typescript
import { PollarClient } from "@pollar/core";

const pollar = new PollarClient({
  apiKey: "pub_testnet_xxxxxxxxxxxxxxxxxxxx",
});
```

**Constructor options:**

| Option           | Type             | Default                        | Description                                                           |
| ---------------- | ---------------- | ------------------------------ | --------------------------------------------------------------------- |
| `apiKey`         | `string`         | —                              | **Required.** Your Pollar publishable key.                            |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                    | Target Stellar network: `'testnet'` or `'mainnet'`.                   |
| `baseUrl`        | `string`         | `'https://sdk.api.pollar.xyz'` | Override the Pollar API base URL. Useful for self-hosted deployments. |

---

Authentication [#authentication]

Pollar supports four authentication providers: Google OAuth, GitHub OAuth, Email OTP, and external Stellar wallets (Freighter and Albedo). All flows update `AuthState`, which can be observed via `onAuthStateChange`.

---

`pollar.login(options)` [#pollarloginoptions]

Unified entry point for starting an authentication flow. For email, this initiates the session and sends the OTP code in a single call. For wallet providers, it connects and authenticates the wallet.

```typescript
// OAuth providers
pollar.login({ provider: "google" });
pollar.login({ provider: "github" });

// Email OTP (sends code automatically)
pollar.login({ provider: "email", email: "user@example.com" });

// External wallet
pollar.login({ provider: "wallet", type: WalletType.FREIGHTER });
pollar.login({ provider: "wallet", type: WalletType.ALBEDO });
```

| Option     | Type                                          | Description                             |
| ---------- | --------------------------------------------- | --------------------------------------- |
| `provider` | `'google' \| 'github' \| 'email' \| 'wallet'` | Authentication provider.                |
| `email`    | `string`                                      | Required when `provider` is `'email'`.  |
| `type`     | `WalletType`                                  | Required when `provider` is `'wallet'`. |

---

Email OTP — step-by-step flow [#email-otp--step-by-step-flow]

For use cases that require manual control over each step of the email OTP flow (e.g. custom UI), the following methods are available individually:

`pollar.beginEmailLogin()` [#pollarbeginemaillogin]

Initializes a new email session. Transitions `AuthState` to `entering_email`.

```typescript
pollar.beginEmailLogin();
```

`pollar.sendEmailCode(email)` [#pollarsendemailcodeemail]

Sends the OTP code to the provided email address. Must be called when `AuthState.step === 'entering_email'`.

```typescript
pollar.sendEmailCode("user@example.com");
```

`pollar.verifyEmailCode(code)` [#pollarverifyemailcodecode]

Verifies the OTP code entered by the user and completes authentication. Must be called when `AuthState.step === 'entering_code'`.

```typescript
pollar.verifyEmailCode("123456");
```

---

`pollar.loginWallet(type)` [#pollarloginwallettype]

Directly initiates a wallet connection and authentication flow. Equivalent to `login({ provider: 'wallet', type })`.

```typescript
import { WalletType } from "@pollar/core";

pollar.loginWallet(WalletType.FREIGHTER);
pollar.loginWallet(WalletType.ALBEDO);
```

| Parameter | Type         | Description                                    |
| --------- | ------------ | ---------------------------------------------- |
| `type`    | `WalletType` | `WalletType.FREIGHTER` or `WalletType.ALBEDO`. |

---

`pollar.cancelLogin()` [#pollarcancellogin]

Cancels any in-progress authentication flow and resets `AuthState` to `idle`.

```typescript
pollar.cancelLogin();
```

---

`pollar.logout()` [#pollarlogout]

Signs out the current user, clears the session from storage, and resets all client state.

```typescript
pollar.logout();
```

---

`pollar.getAuthState()` [#pollargetauthstate]

Returns the current authentication state synchronously.

```typescript
const state = pollar.getAuthState();

if (state.step === "authenticated") {
  console.log(state.session);
}
```

---

`pollar.onAuthStateChange(callback)` [#pollaronauthstatechangecallback]

Subscribes to authentication state changes. The callback is invoked immediately with the current state, and on every subsequent change. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onAuthStateChange((state) => {
  if (state.step === "authenticated") {
    console.log("Logged in:", state.session);
  }
});

// Later:
unsubscribe();
```

**`AuthState` steps:**

| Step                    | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `idle`                  | No active session or flow.                            |
| `creating_session`      | Creating a client session on the server.              |
| `entering_email`        | Waiting for the user to provide their email address.  |
| `sending_email`         | Sending the OTP code to the user's email.             |
| `entering_code`         | Waiting for the user to enter the OTP code.           |
| `verifying_email_code`  | Verifying the submitted OTP code.                     |
| `opening_oauth`         | Opening the OAuth provider window.                    |
| `connecting_wallet`     | Connecting to the external wallet extension.          |
| `wallet_not_installed`  | The requested wallet extension is not installed.      |
| `authenticating_wallet` | Authenticating with the connected wallet.             |
| `authenticating`        | Finalizing authentication with the Pollar server.     |
| `authenticated`         | User is authenticated. `session` is available.        |
| `error`                 | An error occurred. `message` and `errorCode` are set. |

---

Network [#network]

`pollar.getNetwork()` [#pollargetnetwork]

Returns the currently active Stellar network.

```typescript
const network = pollar.getNetwork(); // 'testnet' | 'mainnet'
```

---

`pollar.setNetwork(network)` [#pollarsetnetworknetwork]

Switches the active Stellar network.

```typescript
pollar.setNetwork("mainnet");
```

---

`pollar.onNetworkStateChange(callback)` [#pollaronnetworkstatechangecallback]

Subscribes to network state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onNetworkStateChange((state) => {
  if (state.step === "connected") {
    console.log("Network:", state.network);
  }
});
```

---

Transactions [#transactions]

Pollar handles transaction building and signing through a state machine. Use `onTransactionStateChange` to observe progress in your UI.

`pollar.buildTx(operation, params, options?)` [#pollarbuildtxoperation-params-options]

Builds an unsigned Stellar transaction on the server. Transitions `TransactionState` through `building` → `built` (or `error`).

```typescript
await pollar.buildTx("payment", {
  destination: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  amount: "10.00",
  asset: { type: "credit_alphanum4", code: "USDC", issuer: "GABC..." },
});
```

| Parameter   | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `operation` | `string` | Stellar operation type (e.g. `payment`). |
| `params`    | `object` | Operation-specific parameters.           |
| `options`   | `object` | Optional build-time overrides.           |

---

`pollar.signAndSubmitTx(unsignedXdr)` [#pollarsignandsubmittxunsignedxdr]

Signs and submits a previously built transaction. For custodial wallets (social/email login), signing is performed server-side. For external wallets (Freighter/Albedo), signing is performed client-side and submitted directly to Horizon.

Must be called when `TransactionState.step === 'built'`.

```typescript
const state = pollar.getTransactionState();

if (state?.step === "built") {
  await pollar.signAndSubmitTx(state.buildData.unsignedXdr);
}
```

---

`pollar.getTransactionState()` [#pollargettransactionstate]

Returns the current transaction state synchronously, or `null` if no transaction is in progress.

```typescript
const state = pollar.getTransactionState();
```

---

`pollar.onTransactionStateChange(callback)` [#pollarontransactionstatechangecallback]

Subscribes to transaction state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onTransactionStateChange((state) => {
  if (state.step === "success") {
    console.log("Transaction hash:", state.hash);
  }
});
```

**`TransactionState` steps:**

| Step       | Description                                              |
| ---------- | -------------------------------------------------------- |
| `idle`     | No transaction in progress.                              |
| `building` | Building the transaction on the server.                  |
| `built`    | Transaction built. `buildData.unsignedXdr` is available. |
| `signing`  | Signing and submitting the transaction.                  |
| `success`  | Transaction confirmed. `hash` is available.              |
| `error`    | Transaction failed. `details` may contain the error.     |

---

Wallet Balance [#wallet-balance]

`pollar.refreshBalance(publicKey?)` [#pollarrefreshbalancepublickey]

Fetches the current balances for the given public key. If omitted, uses the authenticated wallet's public key.

```typescript
await pollar.refreshBalance();
```

---

`pollar.getWalletBalanceState()` [#pollargetwalletbalancestate]

Returns the current wallet balance state synchronously.

```typescript
const state = pollar.getWalletBalanceState();

if (state.step === "loaded") {
  console.log(state.data.balances);
}
```

---

`pollar.onWalletBalanceStateChange(callback)` [#pollaronwalletbalancestatechangecallback]

Subscribes to wallet balance state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onWalletBalanceStateChange((state) => {
  if (state.step === "loaded") {
    console.log(state.data.balances);
  }
});
```

---

Transaction History [#transaction-history]

`pollar.fetchTxHistory(params?)` [#pollarfetchtxhistoryparams]

Fetches paginated transaction history for the authenticated wallet.

```typescript
await pollar.fetchTxHistory({
  limit: 20,
  type: "payment",
  asset: "USDC",
});
```

| Option   | Type     | Default | Description                                                                  |
| -------- | -------- | ------- | ---------------------------------------------------------------------------- |
| `limit`  | `number` | —       | Number of records to return.                                                 |
| `cursor` | `string` | —       | Pagination cursor from a previous response.                                  |
| `type`   | `string` | —       | Filter by transaction type: `payment`, `activation`, `trustline`, `receive`. |
| `asset`  | `string` | —       | Filter by asset code.                                                        |

---

`pollar.getTxHistoryState()` [#pollargettxhistorystate]

Returns the current transaction history state synchronously.

```typescript
const state = pollar.getTxHistoryState();

if (state.step === "loaded") {
  console.log(state.data.records);
}
```

---

`pollar.onTxHistoryStateChange(callback)` [#pollarontxhistorystatechangecallback]

Subscribes to transaction history state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onTxHistoryStateChange((state) => {
  if (state.step === "loaded") {
    console.log(state.data.records);
  }
});
```

---

KYC [#kyc]

Pollar provides a KYC (Know Your Customer) flow that integrates with third-party identity verification providers.

`pollar.getKycProviders(country)` [#pollargetkycproviderscountry]

Returns the list of available KYC providers for the given country code.

```typescript
const providers = await pollar.getKycProviders("US");
```

---

`pollar.getKycStatus(providerId?)` [#pollargetkycstatusproviderid]

Returns the current KYC status for the authenticated user. Optionally scoped to a specific provider.

```typescript
const status = await pollar.getKycStatus();
// 'none' | 'pending' | 'approved' | 'rejected'
```

---

`pollar.startKyc(body)` [#pollarstartkycbody]

Initiates a KYC verification session with the specified provider.

```typescript
const session = await pollar.startKyc({
  providerId: "provider_id",
  level: "basic",
  redirectUrl: "https://yourapp.com/kyc/callback",
});
```

---

`pollar.resolveKyc(providerId, level?)` [#pollarresolvekycproviderid-level]

Resolves the outcome of a completed KYC session.

```typescript
await pollar.resolveKyc("provider_id", "basic");
```

---

`pollar.pollKycStatus(providerId, opts?)` [#pollarpollkycstatusproviderid-opts]

Polls the KYC status until it reaches a terminal state (`approved` or `rejected`), or until the timeout is exceeded.

```typescript
const finalStatus = await pollar.pollKycStatus("provider_id", {
  intervalMs: 2000,
  timeoutMs: 60000,
});
```

| Option       | Type     | Description                        |
| ------------ | -------- | ---------------------------------- |
| `intervalMs` | `number` | Polling interval in milliseconds.  |
| `timeoutMs`  | `number` | Maximum wait time before throwing. |

**`KycStatus` values:** `'none'` · `'pending'` · `'approved'` · `'rejected'`

**`KycLevel` values:** `'basic'` · `'intermediate'` · `'enhanced'`

---

Ramps [#ramps]

Pollar supports on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows through integrated third-party providers.

`pollar.getRampsQuote(query)` [#pollargetrampsquotequery]

Returns available quotes for a ramp operation.

```typescript
const quotes = await pollar.getRampsQuote({
  direction: "onramp",
  fiatCurrency: "USD",
  cryptoAsset: "USDC",
  amount: "100",
});
```

---

`pollar.createOnRamp(body)` [#pollarcreateonrampbody]

Creates an on-ramp transaction (fiat → crypto).

```typescript
const onramp = await pollar.createOnRamp({ ... });
console.log(onramp.paymentInstructions);
```

---

`pollar.createOffRamp(body)` [#pollarcreateofframpbody]

Creates an off-ramp transaction (crypto → fiat).

```typescript
const offramp = await pollar.createOffRamp({ ... });
```

---

`pollar.getRampTransaction(txId)` [#pollargetramptransactiontxid]

Returns the current state of a ramp transaction by ID.

```typescript
const tx = await pollar.getRampTransaction("tx_id");
console.log(tx.status);
```

---

`pollar.pollRampTransaction(txId, opts?)` [#pollarpollramptransactiontxid-opts]

Polls a ramp transaction until it reaches a terminal status.

```typescript
const finalStatus = await pollar.pollRampTransaction("tx_id", {
  intervalMs: 3000,
  timeoutMs: 120000,
});
```

| Option       | Type     | Description                        |
| ------------ | -------- | ---------------------------------- |
| `intervalMs` | `number` | Polling interval in milliseconds.  |
| `timeoutMs`  | `number` | Maximum wait time before throwing. |

---

App Config [#app-config]

`pollar.getAppConfig()` [#pollargetappconfig]

Returns the application configuration associated with your API key, as configured in the Pollar Dashboard.

```typescript
const config = await pollar.getAppConfig();
```

---

Types [#types]

```typescript
import type {
  PollarClientConfig,
  PollarLoginOptions,
  AuthState,
  AuthErrorCode,
  NetworkState,
  TransactionState,
  TxBuildBody,
  TxBuildContent,
  TxHistoryState,
  TxHistoryParams,
  TxHistoryRecord,
  WalletBalanceState,
  WalletBalanceRecord,
  KycLevel,
  KycStatus,
  KycFlow,
  KycProvider,
  KycStartBody,
  KycStartResponse,
  RampsQuoteQuery,
  RampQuote,
  RampsQuoteResponse,
  RampsOnrampBody,
  RampsOnrampResponse,
  RampsOfframpBody,
  RampsOfframpResponse,
  RampsTransactionResponse,
  RampTxStatus,
  RampDirection,
  PaymentInstructions,
  PollarFlowError,
} from "@pollar/core";

import { WalletType } from "@pollar/core";
```

# @pollar/react

React hooks and pre-built UI components for Pollar. Built on top of `@pollar/core`.

```bash
npm install @pollar/react
```

---

`<PollarProvider>` [#pollarprovider]

Wraps your application root. Required for all hooks and components to work. Internally renders the login, transaction, KYC, ramp, tx history, and wallet balance modals — you do not need to mount them manually.

```tsx
import { PollarProvider } from "@pollar/react";

<PollarProvider config={{ apiKey: "pub_testnet_xxxxxxxxxxxxxxxxxxxx" }}>
  <App />
</PollarProvider>;
```

**Props:**

| Prop     | Type                 | Required | Description                                                         |
| -------- | -------------------- | -------- | ------------------------------------------------------------------- |
| `config` | `PollarClientConfig` | Yes      | Client configuration. See `@pollar/core` for all available options. |
| `styles` | `PollarStyles`       | No       | Style overrides applied on top of the remote configuration.         |

**`PollarClientConfig`:**

| Option           | Type             | Default                        | Description                                 |
| ---------------- | ---------------- | ------------------------------ | ------------------------------------------- |
| `apiKey`         | `string`         | —                              | **Required.** Your Pollar API key.          |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                    | Target network: `'testnet'` or `'mainnet'`. |
| `baseUrl`        | `string`         | `'https://sdk.api.pollar.xyz'` | Override the Pollar API base URL.           |

---

`usePollar()` [#usepollar]

The primary hook. Provides access to all Pollar functionality from a single import. Must be used inside `<PollarProvider>`.

```tsx
"use client";
import { usePollar } from "@pollar/react";

function MyComponent() {
  const {
    isAuthenticated,
    walletAddress,
    login,
    logout,
    buildTx,
    signAndSubmitTx,
    transaction,
    txHistory,
    network,
    setNetwork,
    getBalance,
    getClient,
    openLoginModal,
    openTransactionModal,
    openKycModal,
    openRampWidget,
    openTxHistoryModal,
    openWalletBalanceModal,
    config,
    styles,
  } = usePollar();
}
```

---

Authentication [#authentication]

| Property          | Type                                    | Description                                                                |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| `isAuthenticated` | `boolean`                               | Whether the user has an active session.                                    |
| `walletAddress`   | `string`                                | Public key of the authenticated wallet. Empty string if not authenticated. |
| `login`           | `(options: PollarLoginOptions) => void` | Initiates an authentication flow.                                          |
| `logout`          | `() => void`                            | Signs out the current user and clears the session.                         |

**`PollarLoginOptions`:**

| Value                                      | Description                                      |
| ------------------------------------------ | ------------------------------------------------ |
| `{ provider: 'google' }`                   | Opens Google OAuth flow.                         |
| `{ provider: 'github' }`                   | Opens GitHub OAuth flow.                         |
| `{ provider: 'email', email: string }`     | Sends an OTP code to the provided email address. |
| `{ provider: 'wallet', type: WalletType }` | Connects a Stellar wallet (Freighter or Albedo). |

---

Transactions [#transactions]

| Property               | Type                                             | Description                                   |
| ---------------------- | ------------------------------------------------ | --------------------------------------------- |
| `transaction`          | `TransactionState`                               | Current transaction state (reactive).         |
| `buildTx`              | `(operation, params, options?) => Promise<void>` | Builds an unsigned Stellar transaction.       |
| `signAndSubmitTx`      | `(unsignedXdr: string) => Promise<void>`         | Signs and submits the built transaction.      |
| `openTransactionModal` | `() => void`                                     | Opens the transaction modal programmatically. |

The transaction modal opens automatically when `buildTx` is called. See `@pollar/core` for `TransactionState` step details.

---

Network [#network]

| Property     | Type                                | Description                          |
| ------------ | ----------------------------------- | ------------------------------------ |
| `network`    | `StellarNetwork`                    | Currently active network.            |
| `setNetwork` | `(network: StellarNetwork) => void` | Switches the active Stellar network. |

---

Wallet Balance [#wallet-balance]

| Property                 | Type                                                            | Description                                                                          |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `getBalance`             | `(publicKey?: string) => Promise<WalletBalanceContent \| null>` | Fetches balances for the given public key. Uses the authenticated wallet if omitted. |
| `openWalletBalanceModal` | `() => void`                                                    | Opens the wallet balance modal.                                                      |

---

Transaction History [#transaction-history]

| Property             | Type             | Description                          |
| -------------------- | ---------------- | ------------------------------------ |
| `txHistory`          | `TxHistoryState` | Current tx history state (reactive). |
| `openTxHistoryModal` | `() => void`     | Opens the transaction history modal. |

---

KYC [#kyc]

| Property       | Type                                                                                  | Description                       |
| -------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| `openKycModal` | `(options?: { country?: string; level?: KycLevel; onApproved?: () => void }) => void` | Opens the KYC verification modal. |

| Option       | Type         | Default   | Description                                                          |
| ------------ | ------------ | --------- | -------------------------------------------------------------------- |
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.                 |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level: `'basic'`, `'intermediate'`, or `'enhanced'`.    |
| `onApproved` | `() => void` | —         | Callback invoked when the KYC verification is successfully approved. |

---

Ramps [#ramps]

| Property         | Type         | Description                        |
| ---------------- | ------------ | ---------------------------------- |
| `openRampWidget` | `() => void` | Opens the fiat on/off-ramp widget. |

---

Utilities [#utilities]

| Property    | Type                 | Description                                                           |
| ----------- | -------------------- | --------------------------------------------------------------------- |
| `getClient` | `() => PollarClient` | Returns the underlying `PollarClient` instance for direct API access. |
| `config`    | `PollarConfig`       | Application configuration fetched from the Pollar Dashboard.          |
| `styles`    | `PollarStyles`       | Resolved styles, merging remote config with any local overrides.      |

---

Modal entry points [#modal-entry-points]

All Pollar modals are mounted inside `<PollarProvider>` and controlled programmatically:

| Function                   | Description                          |
| -------------------------- | ------------------------------------ |
| `openLoginModal()`         | Opens the login modal.               |
| `openTransactionModal()`   | Opens the transaction modal.         |
| `openKycModal(options?)`   | Opens the KYC modal.                 |
| `openRampWidget()`         | Opens the ramp widget.               |
| `openTxHistoryModal()`     | Opens the transaction history modal. |
| `openWalletBalanceModal()` | Opens the wallet balance modal.      |

---

Components [#components]

`<WalletButton>` [#walletbutton]

Pre-built button that handles the complete authentication flow. When logged out, opens the login modal. When logged in, shows the wallet address with a dropdown for balance, transaction history, and logout.

```tsx
import { WalletButton } from "@pollar/react";

<WalletButton />;
```

No props required. Appearance is controlled by the `styles` configuration passed to `<PollarProvider>`.

---

`<KycModal>` [#kycmodal]

Pre-built KYC verification modal. Can be rendered directly when you need more control than `openKycModal()` provides.

```tsx
import { KycModal } from "@pollar/react";

<KycModal
  onClose={() => setOpen(false)}
  country="US"
  level="basic"
  onApproved={() => console.log("KYC approved")}
/>;
```

| Prop         | Type         | Default   | Description                                             |
| ------------ | ------------ | --------- | ------------------------------------------------------- |
| `onClose`    | `() => void` | —         | **Required.** Called when the user dismisses the modal. |
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.    |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level.                                     |
| `onApproved` | `() => void` | —         | Called when KYC is successfully approved.               |

---

`<KycStatus>` [#kycstatus]

Displays the current KYC status for the authenticated user.

```tsx
import { KycStatus } from "@pollar/react";

<KycStatus />;
```

---

`<RampWidget>` [#rampwidget]

Pre-built fiat on/off-ramp widget with support for on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows.

```tsx
import { RampWidget } from "@pollar/react";

<RampWidget onClose={() => setOpen(false)} />;
```

| Prop      | Type         | Description                                              |
| --------- | ------------ | -------------------------------------------------------- |
| `onClose` | `() => void` | **Required.** Called when the user dismisses the widget. |

---

`<WalletBalanceModal>` [#walletbalancemodal]

Displays the token balances of the authenticated wallet with a manual refresh option.

```tsx
import { WalletBalanceModal } from "@pollar/react";

<WalletBalanceModal onClose={() => setOpen(false)} />;
```

| Prop      | Type         | Description                                             |
| --------- | ------------ | ------------------------------------------------------- |
| `onClose` | `() => void` | **Required.** Called when the user dismisses the modal. |

---

Template components [#template-components]

Template components handle rendering only — they receive all data and callbacks as props and contain no internal logic. Use them to build fully custom UI while reusing Pollar's layout and visual structure.

| Component                      | Description                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| `<LoginModalTemplate>`         | Login provider selection and email OTP screens.               |
| `<KycModalTemplate>`           | KYC provider selection and verification screens.              |
| `<RampWidgetTemplate>`         | Ramp input, quote selection, and payment instruction screens. |
| `<TransactionModalTemplate>`   | Transaction details, signing, and result screens.             |
| `<TxHistoryModalTemplate>`     | Transaction history list screen.                              |
| `<WalletBalanceModalTemplate>` | Wallet balance screen.                                        |

Import the corresponding `*Props` type for full type safety:

```tsx
import {
  TransactionModalTemplate,
  type TransactionModalTemplateProps,
  WalletBalanceModalTemplate,
  type WalletBalanceModalTemplateProps,
} from "@pollar/react";
```

---

Types [#types]

```typescript
import type {
  PollarConfig,
  PollarStyles,
  AuthProviderProps,
  AuthContextValue,
  LoginButtonProps,
  AuthModalProps,
  KycStep,
  RampStep,
  TransactionModalTemplateProps,
  WalletBalanceModalTemplateProps,
} from "@pollar/react";
```

Core types such as `TransactionState`, `TxHistoryState`, `WalletBalanceContent`, `PollarLoginOptions`, `StellarNetwork`, and `WalletType` are imported directly from `@pollar/core`.

# Pollar Server API

REST API for backend operations. All endpoints require your **secret key** — never call these from client-side code.

**Base URL:** `https://api.pollar.xyz`

**Authentication:**

```bash
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

---

Wallets [#wallets]

`POST /wallets/activate` [#post-walletsactivate]

Activates a wallet by funding its XLM reserve on-chain. Used in Deferred mode when a business event occurs (KYC approved, first deposit, etc.).

This endpoint behaves like a webhook receiver — Pollar retries until it receives a `200` response.

```bash
POST https://api.pollar.xyz/wallets/activate
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "walletId": "wal_abc123"
}
```

**Response codes:**

| Code                      | Meaning                                              |
| ------------------------- | ---------------------------------------------------- |
| `200 OK`                  | Wallet activated. XLM reserve funded on-chain.       |
| `400 Bad Request`         | Missing or malformed `walletId`.                     |
| `402 Payment Required`    | Funding wallet has insufficient XLM.                 |
| `404 Not Found`           | `walletId` does not exist in your app.               |
| `409 Conflict`            | Wallet is already active. Safe to ignore.            |
| `503 Service Unavailable` | Stellar network issue. Pollar retries automatically. |

**Response body (`200`):**

```json
{
  "walletId": "wal_abc123",
  "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "status": "active",
  "activatedAt": "2026-03-15T10:30:00Z"
}
```

---

`GET /wallets/:walletId` [#get-walletswalletid]

Returns wallet details and current balances.

```bash
GET https://api.pollar.xyz/wallets/wal_abc123
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

**Response (`200`):**

```json
{
  "id": "wal_abc123",
  "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "status": "active",
  "balances": [
    { "asset": "XLM", "amount": "2.50" },
    { "asset": "USDC", "amount": "100.00" }
  ],
  "createdAt": "2026-03-15T10:00:00Z",
  "activatedAt": "2026-03-15T10:30:00Z"
}
```

---

`GET /wallets/:walletId/transactions` [#get-walletswalletidtransactions]

Returns paginated transaction history for a wallet.

```bash
GET https://api.pollar.xyz/wallets/wal_abc123/transactions?limit=20&type=payment
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

**Query parameters:**

| Parameter | Type     | Default | Description                                             |
| --------- | -------- | ------- | ------------------------------------------------------- |
| `limit`   | `number` | `20`    | Transactions per page. Max `100`.                       |
| `cursor`  | `string` | —       | Pagination cursor from previous response.               |
| `type`    | `string` | —       | Filter: `payment`, `activation`, `trustline`, `receive` |
| `asset`   | `string` | —       | Filter by asset code, e.g. `USDC`                       |
| `from`    | ISO 8601 | —       | Start date filter                                       |
| `to`      | ISO 8601 | —       | End date filter                                         |

**Response (`200`):**

```json
{
  "transactions": [
    {
      "hash": "a1b2c3d4...",
      "type": "payment",
      "asset": "USDC",
      "amount": "10.00",
      "from": "GABC...",
      "to": "GXYZ...",
      "feeSponsored": true,
      "ledger": 1234567,
      "timestamp": "2026-03-15T10:30:00Z"
    }
  ],
  "cursor": "eyJsZWRnZXIiOjEyMzQ1NjZ9",
  "hasMore": true
}
```

---

Apps [#apps]

`GET /app` [#get-app]

Returns the current app configuration.

```bash
GET https://api.pollar.xyz/app
Authorization: Bearer sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

**Response (`200`):**

```json
{
  "id": "app_xyz789",
  "name": "My App",
  "network": "testnet",
  "fundingMode": "deferred",
  "assets": ["USDC", "EURC"],
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

Error format [#error-format]

All errors follow a consistent format:

```json
{
  "error": {
    "code": "INSUFFICIENT_SPONSOR_BALANCE",
    "message": "The funding wallet does not have enough XLM to activate this wallet.",
    "status": 402
  }
}
```

For a full list of error codes see [Error Codes](./error-codes).

# Webhooks

Pollar uses webhooks in two directions:

- **Inbound** — your backend receives a call from Pollar when an event occurs

- **Outbound** — your backend calls Pollar to trigger an action (e.g. `POST /wallets/activate`)

---

Inbound webhooks `coming soon` [#inbound-webhooks-coming-soon]

Configure a webhook URL in **Dashboard → Configuration → Webhooks**. Pollar sends a `POST` request to your URL when an event occurs.

Authentication [#authentication]

Every request includes an `X-Pollar-Signature` header — an HMAC-SHA256 signature of the raw request body using your webhook secret.

```typescript
import { createHmac } from "crypto";

function verifyWebhook(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return `sha256=${expected}` === signature;
}

// Next.js API route
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-pollar-signature") ?? "";

  if (!verifyWebhook(payload, signature, process.env.POLLAR_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  // handle event...
  return NextResponse.json({ received: true });
}
```

Always respond with `200` as quickly as possible. If your endpoint returns a non-2xx status or times out, Pollar retries with exponential backoff.

Retry policy [#retry-policy]

| Attempt | Delay      |
| ------- | ---------- |
| 1       | Immediate  |
| 2       | 1 minute   |
| 3       | 10 minutes |
| 4       | 1 hour     |
| 5       | 24 hours   |

After 5 failed attempts the event is marked as failed and visible in **Dashboard → Settings → Webhooks → Event log**.

---

Events [#events]

`wallet.created` [#walletcreated]

Fired when a new wallet G-address is created on-chain.

```json
{
  "event": "wallet.created",
  "timestamp": "2026-03-15T10:00:00Z",
  "data": {
    "walletId": "wal_abc123",
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "status": "pending"
  }
}
```

`wallet.activated` [#walletactivated]

Fired when a wallet is successfully funded and active on-chain.

```json
{
  "event": "wallet.activated",
  "timestamp": "2026-03-15T10:30:00Z",
  "data": {
    "walletId": "wal_abc123",
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "activatedAt": "2026-03-15T10:30:00Z"
  }
}
```

`wallet.funded` [#walletfunded]

Fired when `fund()` distributes assets from the distribution wallet.

```json
{
  "event": "wallet.funded",
  "timestamp": "2026-03-15T11:10:00Z",
  "data": {
    "walletId": "wal_abc123",
    "asset": "USDC",
    "amount": "100.00",
    "txHash": "c3d4e5f6..."
  }
}
```

`payment.sent` [#paymentsent]

Fired when a payment is confirmed on-chain.

```json
{
  "event": "payment.sent",
  "timestamp": "2026-03-15T11:00:00Z",
  "data": {
    "txHash": "a1b2c3d4...",
    "fromWalletId": "wal_abc123",
    "from": "GABC...",
    "to": "GXYZ...",
    "asset": "USDC",
    "amount": "10.00",
    "ledger": 1234567
  }
}
```

`payment.received` [#paymentreceived]

Fired when a wallet receives a payment from any Stellar address.

```json
{
  "event": "payment.received",
  "timestamp": "2026-03-15T11:05:00Z",
  "data": {
    "txHash": "b2c3d4e5...",
    "toWalletId": "wal_abc123",
    "from": "GXYZ...",
    "to": "GABC...",
    "asset": "USDC",
    "amount": "25.00",
    "ledger": 1234600
  }
}
```

`trustline.added` [#trustlineadded]

Fired when a trustline is enabled on a user wallet.

```json
{
  "event": "trustline.added",
  "timestamp": "2026-03-15T10:01:00Z",
  "data": {
    "walletId": "wal_abc123",
    "asset": "USDC"
  }
}
```

`sponsor.balance.low` [#sponsorbalancelow]

Fired when any sponsorship wallet drops below its configured minimum threshold.

```json
{
  "event": "sponsor.balance.low",
  "timestamp": "2026-03-15T12:00:00Z",
  "data": {
    "walletType": "funding",
    "address": "GSPONSOR...",
    "balance": "5.00",
    "threshold": "10.00",
    "asset": "XLM"
  }
}
```

---

Outbound webhooks [#outbound-webhooks]

Your backend calls Pollar to trigger actions. Currently:

- `POST /wallets/activate` — see [Server API](./server-api)

# How the C-Address Lifecycle Works

> 🚧 \*\*Upcoming — not yet available.\*\* Smart wallets are not implemented in the current SDK yet. This page is a technical explainer of the planned design. See the [section overview](./overview) for status.

Pollar gives you the same simple `login()` call whether a user gets a classic account or a
smart wallet. This page explains what happens underneath for **C-addresses** — useful when
you're debugging, surfacing progress in your UI, or reasoning about costs.

G-address vs C-address at a glance [#g-address-vs-c-address-at-a-glance]

A **G-address** is a classic Stellar account controlled by an ed25519 keypair. A **C-address**
is a smart contract deployed on Soroban that _acts as an account_ — its authorization logic
lives in code rather than in a fixed signature scheme.

| Aspect           | G-address (classic)       | C-address (smart wallet)               |
| ---------------- | ------------------------- | -------------------------------------- |
| Identifier       | Starts with `G`           | Starts with `C`                        |
| Authorization    | Native ed25519 signature  | `__check_auth` in the contract         |
| Creation         | `createAccount` operation | `InvokeHostFunction` (contract deploy) |
| Holding an asset | `changeTrust` trustline   | SAC balance (no classic trustline)     |
| Keeping it alive | XLM reserve               | Storage rent + TTL                     |
| Fees             | XLM or fee-bump           | Fee-bump (same mechanism)              |
| Flexibility      | Fixed (ed25519 only)      | Programmable auth                      |

The lifecycle [#the-lifecycle]

Pollar models a smart wallet as a small state machine. `login()` walks the user through it
automatically; you can observe each transition via the `walletProgress` event.

```
unregistered ──deploy──▶ deployed ──sponsor──▶ sponsored ──▶ payment_ready
                                                                  │
                                                          (TTL expires)
                                                                  ▼
                                                              archived ──restore──▶ sponsored
```

| State           | What it means                                                   |
| --------------- | --------------------------------------------------------------- |
| `unregistered`  | The user exists in your backend but has no contract yet         |
| `deploying`     | Deploy transaction submitted, awaiting confirmation             |
| `deployed`      | Contract is on-chain; the C-address exists and the owner is set |
| `sponsoring`    | Pollar is paying storage rent and extending the TTL             |
| `sponsored`     | Rent covered, TTL extended                                      |
| `payment_ready` | The wallet can send and receive assets                          |
| `archived`      | The TTL expired and the contract was archived; needs a restore  |

Deploy [#deploy]

Creating a classic account is a single `createAccount` operation. Creating a C-address means
deploying a contract: Pollar submits an `InvokeHostFunction` transaction that instantiates the
smart wallet contract with the user's public key as the authorized owner. The contract's
constructor runs atomically during deploy, so there's no separate "initialize" step exposed to
you. The resulting contract ID _is_ the C-address.

Sponsorship: rent instead of reserve [#sponsorship-rent-instead-of-reserve]

This is the biggest conceptual difference, and Pollar hides most of it.

- **G-address:** Stellar requires a base XLM reserve (plus more per trustline). It's paid once
  and recovered if the account closes.
- **C-address:** There is no XLM reserve in the classic sense. Instead, every entry in the
  contract's storage has a \*\*TTL (time-to-live)\*\*. If the TTL lapses, the entry is archived and
  must be restored before use. Pollar extends the TTL on the user's behalf so the wallet stays
  live.

The practical implication: instead of a one-time reserve, there's a small _recurring_ cost to
keep a smart wallet alive. Pollar's sponsor account handles TTL extension automatically as part
of reaching `payment_ready`.

Holding assets: the SAC [#holding-assets-the-sac]

C-addresses don't use classic trustlines. They interact with assets through the \*\*Stellar Asset
Contract (SAC)\*\* — a built-in contract that wraps each classic Stellar asset. A C-address can
receive a SAC-wrapped asset without an explicit trustline step (provided the issuer isn't gating
with authorization flags). Pollar routes payments through the SAC for you, so `pay()` looks
identical to the classic flow from your side.

Signing: full transaction vs auth entries [#signing-full-transaction-vs-auth-entries]

For G-addresses, the user's key signs the full transaction, which Pollar then wraps in a
fee-bump. For C-addresses the signing model changes:

1. Pollar builds the contract invocation.
2. It simulates the transaction to discover which **auth entries** need signatures.
3. The user's KMS-managed key signs only those auth entries — the contract's `__check_auth`
   verifies them.
4. Pollar reassembles the transaction with the signed auth entries.
5. Pollar's sponsor account signs the envelope as the fee source and submits it.

You don't implement any of this — it's what `login()` and `pay()` do internally — but it's why
smart wallet transactions are contract invocations rather than classic payment ops.

How Pollar abstracts all of this [#how-pollar-abstracts-all-of-this]

| You write              | Pollar handles                                            |
| ---------------------- | --------------------------------------------------------- |
| `walletType: 'smart'`  | Choosing the deploy + sponsor + SAC path                  |
| `login()`              | Deploy, TTL extension, reaching `payment_ready`           |
| `pay()`                | Building the SAC invocation, auth-entry signing, fee-bump |
| `walletProgress` event | Surfacing each lifecycle transition and tx hash           |

The goal is that adopting smart wallets is a configuration choice, not a rewrite. The
differences above matter for debugging and cost modeling, but not for day-to-day integration.

Cost considerations [#cost-considerations]

On testnet, rent and fees are effectively free. On mainnet, each smart wallet carries a small
recurring cost to keep its storage TTL extended — this replaces the one-time XLM reserve of the
classic model. Pollar's sponsor account covers it automatically; account for it when estimating
per-user costs at scale.

References [#references]

- [Contract accounts overview](https://developers.stellar.org/docs/build/guides/contract-accounts)
- [Smart wallets guide](https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets)
- [Signing Soroban invocations](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations)
- [Stellar Asset Contract (SAC)](https://developers.stellar.org/docs/tokens/stellar-asset-contract)
- [State archival (TTL / rent)](https://developers.stellar.org/docs/build/guides/archival)

Next steps [#next-steps]

- [C-Address Quickstart](./quickstart-c-address.md)
- [Migrating from G-Addresses](./migration-g-to-c.md)

# Migrating from G-Addresses to C-Addresses

> 🚧 \*\*Upcoming — not yet available.\*\* Smart wallets (`walletType: 'smart'`) are not implemented in the current SDK yet. This page documents the planned migration path. See the [section overview](./overview) for status.

If you're already onboarding users with Pollar's classic flow (G-addresses), moving to smart
wallets (C-addresses) is a one-line configuration change for the common case. This guide
covers that change, what stays the same, and the edge cases worth knowing about.

TL;DR [#tldr]

```diff
  const pollar = new PollarClient({
    apiKey: process.env.POLLAR_API_KEY!,
    stellarNetwork: 'testnet',
-   // walletType defaults to 'classic'
+   walletType: 'smart',
  });
```

Your `login()` call, your session handling, and your payment calls keep the same shape.
Pollar absorbs the differences between account types internally.

What stays the same [#what-stays-the-same]

- **The SDK surface.** `login()`, the session object, and `pay()` have the same signatures.
- **Key custody.** Keys remain server-side via KMS. Users still never handle seed phrases.
- **Fee sponsorship.** Pollar still pays the user's fees; you don't fund users manually.
- **Your auth providers.** The same social login providers work unchanged.

What changes [#what-changes]

1\. The address format [#1-the-address-format]

A user's `wallet.address` now starts with `C` instead of `G`. If you store or display
addresses, make sure your validation and UI don't assume a `G` prefix.

```typescript
// Before: always G...
// After:  G... (classic) or C... (smart)
const isSmart = wallet.type === "smart";
```

2\. The wallet state shape [#2-the-wallet-state-shape]

The session wallet carries a `type` discriminator:

```typescript
type WalletType = "classic" | "smart";

interface PollarWallet {
  type: WalletType; // discriminator
  address: string; // G-address or C-address
  status: "pending" | "active";
}
```

Branch on `wallet.type` if any of your code paths depend on account semantics.

3\. Onboarding produces contract transactions [#3-onboarding-produces-contract-transactions]

Classic onboarding creates an account and (optionally) trustlines. Smart onboarding deploys a
contract and extends its TTL. If you surface onboarding progress, the lifecycle states are
different — see the [lifecycle explainer](./c-address-lifecycle.md). The progress event is the
same `walletProgress` event; only the status values differ.

4\. Assets use the SAC, not trustlines [#4-assets-use-the-sac-not-trustlines]

C-addresses don't use classic trustlines. They hold assets through the \*\*Stellar Asset
Contract (SAC)\*\*. Pollar handles this for you — `pay()` works the same — but if you query
balances directly, you query the SAC rather than account trustlines.

Coexistence: running both at once [#coexistence-running-both-at-once]

You can run classic and smart users side by side. `walletType` is set per client instance, so
you can migrate a subset of users or offer both:

```typescript
function makeClient(useSmartWallet: boolean) {
  return new PollarClient({
    apiKey: process.env.POLLAR_API_KEY!,
    stellarNetwork: "testnet",
    walletType: useSmartWallet ? "smart" : "classic",
  });
}
```

Existing G-address users are unaffected. There is no in-place "upgrade" of a G-address into a
C-address — they are different account types. New users onboarded with `walletType: 'smart'`
get C-addresses; existing users keep theirs.

Migration checklist [#migration-checklist]

- [ ] Set `walletType: 'smart'` on the client (for new smart-wallet users)
- [ ] Remove any `G`-prefix assumptions in address validation/UI
- [ ] Handle `wallet.type` wherever account semantics matter
- [ ] If you render onboarding progress, map the new lifecycle states
- [ ] If you read balances directly, switch to SAC balance queries
- [ ] Test the full flow on testnet before enabling for users

When to stay on G-addresses [#when-to-stay-on-g-addresses]

Smart wallets add programmable authorization and a smoother fee/rent model, but they aren't
required for every app. If your product only needs classic payments and has no need for
contract-level account logic, the classic flow remains fully supported.

Next steps [#next-steps]

- [C-Address Quickstart](./quickstart-c-address.md)
- [How the C-Address Lifecycle Works](./c-address-lifecycle.md)

# Smart Wallets (C-Addresses)

> 🚧 \*\*Upcoming — not yet available.** Smart wallets are on the Pollar roadmap. The `walletType: 'smart'` option, the `pollar.pay()` call, and the `walletProgress` lifecycle events described in this section are **not implemented in the current SDK yet\*\*. These pages document the planned design so you can prepare your integration. The classic flow (G-addresses) documented elsewhere is the supported path today.

**Smart wallets** let you onboard users to a Stellar **smart contract account** — a _C-address_ — instead of a classic ed25519 account (a _G-address_). The account's authorization logic lives in a Soroban contract rather than in a fixed signature scheme, which unlocks programmable authorization and a smoother fee/rent model.

The promise is that adopting them is a **configuration choice, not a rewrite**: the same `login()` call, the same session object, and the same payment API. You opt in with a single client option:

```typescript
const pollar = new PollarClient({
  apiKey: process.env.POLLAR_API_KEY!,
  stellarNetwork: "testnet",
  walletType: "smart", // ← opt into C-addresses (default is 'classic')
});
```

In this section [#in-this-section]

| <br />                                                     | <br />                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| [C-Address Quickstart](./quickstart-c-address)             | Social login through to a payment-ready smart wallet             |
| [Migrating from G-Addresses](./migration-g-to-c)           | What changes (and what doesn't) when you switch account types    |
| [How the C-Address Lifecycle Works](./c-address-lifecycle) | Deploy, rent/TTL, the SAC, and auth-entry signing under the hood |

How it differs from classic accounts at a glance [#how-it-differs-from-classic-accounts-at-a-glance]

| Aspect           | G-address (classic, available today) | C-address (smart wallet, upcoming)     |
| ---------------- | ------------------------------------ | -------------------------------------- |
| Identifier       | Starts with `G`                      | Starts with `C`                        |
| Authorization    | Native ed25519 signature             | `__check_auth` in the contract         |
| Creation         | `createAccount` operation            | `InvokeHostFunction` (contract deploy) |
| Holding an asset | `changeTrust` trustline              | SAC balance (no classic trustline)     |
| Keeping it alive | XLM reserve (one-time)               | Storage rent + TTL (recurring)         |

See [How the C-Address Lifecycle Works](./c-address-lifecycle) for the full breakdown.

# C-Address Quickstart

> 🚧 \*\*Upcoming — not yet available.\*\* The `walletType: 'smart'` option, `pollar.pay()`, and the `walletProgress` events below are not implemented in the current SDK yet. This page documents the planned flow. See the [section overview](./overview) for status.

This guide takes you from zero to a **payment-ready smart wallet** on Stellar. The user signs
in with a social provider and Pollar handles the rest: deploying the contract account
(C-address), sponsoring fees, and reaching a state where the wallet can send and receive
assets. The user never sees a seed phrase or manages a private key.

> **Already using Pollar with G-addresses?** See the [Migration Guide](./migration-g-to-c.md).
> For how the lifecycle works under the hood, see the [C-Address Lifecycle](./c-address-lifecycle.md).

What you'll build [#what-youll-build]

A login flow that ends with a deployed C-address, verifiable on Stellar Expert.

1\. Install [#1-install]

```bash
npm install @pollar/core
```

2\. Initialize the client [#2-initialize-the-client]

The only difference from classic onboarding is `walletType: 'smart'`. Everything else stays
the same. Both `testnet` and `mainnet` are supported; this guide uses `testnet`.

```typescript
import { PollarClient } from "@pollar/core";

const pollar = new PollarClient({
  apiKey: process.env.POLLAR_API_KEY!,
  stellarNetwork: "testnet",
  walletType: "smart", // ← opt into C-addresses
});
```

If you omit `walletType`, the client defaults to `'classic'` (G-addresses) and behaves
exactly as before. Smart wallets are fully opt-in.

3\. Log the user in [#3-log-the-user-in]

`login()` runs the full lifecycle: authenticate, deploy the contract, sponsor fees, and
settle into `payment_ready`. Keys are managed server-side via KMS.

```typescript
const session = await pollar.login({ provider: "google" });

console.log(session.wallet);
// {
//   type: 'smart',
//   address: 'C...',        // the C-address
//   status: 'active',       // 'active' once payment_ready
// }
```

4\. (Optional) Follow the lifecycle in your UI [#4-optional-follow-the-lifecycle-in-your-ui]

To show progress, subscribe to lifecycle events. Each transition gives you the status and any
transaction hashes produced.

```typescript
pollar.on("walletProgress", (event) => {
  // event.status: 'deploying' | 'deployed' | 'sponsoring' | 'sponsored' | 'payment_ready'
  // event.contractId: the C-address (from 'deployed' onward)
  // event.txs: [{ label, hash }]  — verifiable on Stellar Expert
  render(event);
});
```

The lifecycle states, in order:

| Status          | Meaning                                             |
| --------------- | --------------------------------------------------- |
| `deploying`     | Deploy transaction submitted, awaiting confirmation |
| `deployed`      | Contract is on-chain; the C-address now exists      |
| `sponsoring`    | Pollar is paying storage rent and extending the TTL |
| `sponsored`     | Rent covered, TTL extended                          |
| `payment_ready` | Wallet can send and receive assets                  |

5\. Verify on-chain [#5-verify-on-chain]

Every transaction is real and permanent on-chain. Build a verification link from the
C-address or any tx hash:

```typescript
const contractUrl = `https://testnet.stellar.expert/contract/${session.wallet.address}`;
```

6\. Send a payment [#6-send-a-payment]

Once the wallet is `payment_ready`, send assets. Pollar builds the contract invocation, signs
the auth entries with the user's KMS-managed key, and sponsors the fee.

```typescript
await pollar.pay({
  to: "CDESTINATION...", // G-address or C-address
  asset: { code: "USDC", issuer: "GA5ZSE..." },
  amount: "10.00",
});
```

Full example [#full-example]

```typescript
import { PollarClient } from "@pollar/core";

const pollar = new PollarClient({
  apiKey: process.env.POLLAR_API_KEY!,
  stellarNetwork: "testnet",
  walletType: "smart",
});

pollar.on("walletProgress", (e) => console.log(e.status, e.contractId));

const { wallet } = await pollar.login({ provider: "google" });
console.log("Smart wallet ready:", wallet.address);
```

Live demo [#live-demo]

A deployed reference implementation of this flow runs at
[demo.pollar.xyz/c-address](https://demo.pollar.xyz/c-address) — social login through to a
payment-ready C-address, with live Stellar Expert links for every transaction.

Next steps [#next-steps]

- [Migrating from G-addresses](./migration-g-to-c.md)
- [How the C-address lifecycle works](./c-address-lifecycle.md)

# Alerts

**Dashboard → Configuration → Alerts**

Configure notifications for low wallet balances so you never run out of funds unexpectedly.

---

Alert channels [#alert-channels]

| Channel     | Setup                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| **Email**   | Add one or more email addresses — alerts are sent when a threshold is crossed |
| **Webhook** | Add a webhook URL — Pollar sends a `sponsor.balance.low` event                |

---

Per-wallet thresholds [#per-wallet-thresholds]

Set independent thresholds for each operator wallet:

| Wallet              | Suggested threshold                  |
| ------------------- | ------------------------------------ |
| Funding wallet      | 20 XLM                               |
| Gas wallet          | 5 XLM                                |
| Distribution wallet | Depends on asset and expected volume |

When a wallet drops below its threshold, Pollar sends an alert immediately and repeats every 24 hours until the wallet is topped up.

---

`sponsor.balance.low` event [#sponsorbalancelow-event]

```json
{
  "event": "sponsor.balance.low",
  "timestamp": "2026-03-15T12:00:00Z",
  "data": {
    "walletType": "funding",
    "address": "GSPONSOR...",
    "balance": "5.00",
    "threshold": "10.00",
    "asset": "XLM"
  }
}
```

See [Webhooks](../../sdk-reference/webhooks) for the full event reference.

# API Keys

**Dashboard → Configuration → API Keys**

---

Key types [#key-types]

| Type        | Prefix         | Network | Use                                     |
| ----------- | -------------- | ------- | --------------------------------------- |
| Publishable | `pub_testnet_` | Testnet | Frontend only (safe to expose)          |
| Publishable | `pub_mainnet_` | Mainnet | Frontend only (safe to expose)          |
| Secret      | `sec_testnet_` | Testnet | Backend only (never expose client-side) |
| Secret      | `sec_mainnet_` | Mainnet | Backend only (never expose client-side) |

**Publishable keys** are passed to `@pollar/core` or `@pollar/react` in your frontend. They can only initiate user-authenticated operations.

**Secret keys** are used in your backend for privileged endpoints like `POST /wallets/activate`. Never expose them client-side.

---

Generating a key [#generating-a-key]

1. Click **Generate key**
2. Select type (Publishable or Secret) and network
3. Copy the key immediately — secret keys are only shown once

---

Rotating a key [#rotating-a-key]

1. Click **Rotate** next to the key
2. A new key is generated immediately
3. Update your environment variables
4. The old key is invalidated — requests using it return `API_KEY_REVOKED`

Rotate your secret key immediately if you suspect it has been exposed.

---

Key permissions [#key-permissions]

| Operation        | Publishable | Secret |
| ---------------- | ----------- | ------ |
| Login / logout   | ✓           | ✓      |
| Send payment     | ✓           | ✓      |
| Get wallet       | ✓           | ✓      |
| Get history      | ✓           | ✓      |
| Activate wallet  | —           | ✓      |
| Get app config   | —           | ✓      |
| List all wallets | —           | ✓      |

---

Multiple keys [#multiple-keys]

You can generate multiple keys of the same type — useful for separate deployment environments (staging, production) or rotating keys without downtime.

All active keys are listed with their creation date and last used timestamp.

---

Security checklist [#security-checklist]

- Never commit keys to version control — use environment variables
- Never prefix secret keys with `NEXT_PUBLIC_` or `VITE_`
- Use separate keys for testnet and mainnet
- Rotate keys periodically and immediately after any suspected exposure

# App Settings

**Dashboard → Configuration → App Settings**

General configuration for your Pollar app.

---

App name [#app-name]

The display name for your app. Shown in the Dashboard and in the `WalletButton` modal header.

---

Allowed origins [#allowed-origins]

A list of domains allowed to make requests to the Pollar Server using your publishable key. Requests from unlisted origins are rejected with a `403 Forbidden` error.

Add your development and production URLs:

```
http://localhost:3000
https://yourapp.com
https://staging.yourapp.com
```

> This is separate from **Dashboard → Configuration → Domains**, which controls domain verification for SEP-10 and anchor flows.

---

Network [#network]

Shows whether this app is configured for **Testnet** or **Mainnet**. Network is set at app creation and cannot be changed. To switch networks, create a new app or use the network selector in the top navigation bar to toggle between your Testnet and Mainnet app environments.

---

Delete app [#delete-app]

Permanently deletes the app and all associated configuration. User wallets on the Stellar network are not affected — they exist independently on-chain. This action cannot be undone.

# App Wallets

**Dashboard → Configuration → App Wallets**

App Wallets are the Stellar accounts that Pollar uses to cover costs on behalf of your users. Each wallet has a distinct role.

---

The three wallets [#the-three-wallets]

| Wallet                  | Role                                                         | Charged when               |
| ----------------------- | ------------------------------------------------------------ | -------------------------- |
| **Funding wallet**      | Covers the XLM reserve required to activate new user wallets | Once per wallet activation |
| **Gas wallet**          | Pays transaction fees for all on-chain operations            | Every transaction          |
| **Distribution wallet** | Sends assets to users via `fund()`                           | Every `fund()` call        |

By default a single wallet is created when you create your app and covers all three roles. You can configure separate wallets for each role as your app scales.

---

Funding a wallet [#funding-a-wallet]

Option 1 — Send directly to the G-address [#option-1--send-directly-to-the-g-address]

Copy the wallet's Stellar G-address and send XLM or assets from any Stellar wallet or exchange.

Option 2 — Fund from the Dashboard [#option-2--fund-from-the-dashboard]

Click **Fund wallet** in the Dashboard, connect your Stellar wallet, and send funds with a single click.

---

Recommended minimum balances [#recommended-minimum-balances]

| Wallet              | Recommended minimum                                       |
| ------------------- | --------------------------------------------------------- |
| Funding wallet      | 50 XLM (\~25 wallet activations with 2 assets each)       |
| Gas wallet          | 10 XLM                                                    |
| Distribution wallet | Depends on configured assets and expected `fund()` volume |

Configure low-balance alerts in [Alerts](./alerts.md) so you are notified before running out of funds.

---

XLM reserve cost per wallet activation [#xlm-reserve-cost-per-wallet-activation]

The cost to activate a user wallet depends on how many assets are configured in [Tokens / Trustlines](../wallet-infrastructure/tokens-trustlines):

`1 XLM + (number of configured assets × 0.5 XLM)`

| Assets configured    | Reserve required |
| -------------------- | ---------------- |
| 0                    | 1 XLM            |
| 1 (e.g. USDC)        | 1.5 XLM          |
| 2 (e.g. USDC + EURC) | 2 XLM            |
| 3                    | 2.5 XLM          |

Pollar does not charge extra — the full amount is consumed from your funding wallet.

> References: [Minimum Balance](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) · [Trustlines](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines)

# Branding & UI

**Dashboard → Configuration → Branding & UI**

Customize the appearance of the `WalletButton` modal — the pre-built login component from `@pollar/react`.

---

What you can customize [#what-you-can-customize]

| Setting            | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| **Logo**           | Your app's logo shown at the top of the modal                            |
| **Primary color**  | Button and accent color                                                  |
| **App name**       | Displayed in the modal header                                            |
| **Auth providers** | Which providers appear in the modal (Google, GitHub, Discord, Email OTP) |
| **Border radius**  | Rounded or sharp corners                                                 |
| **Dark mode**      | Auto (follows system), always light, or always dark                      |

---

Auth providers [#auth-providers]

Enable or disable each provider from the Branding & UI section. Only enabled providers appear in the `WalletButton` modal.

| Provider | Type                                  |
| -------- | ------------------------------------- |
| Google   | OAuth                                 |
| GitHub   | OAuth                                 |
| Discord  | OAuth                                 |
| Email    | OTP (one-time password sent to inbox) |

Changes apply immediately — no SDK update or redeployment required.

---

Preview [#preview]

The Dashboard shows a live preview of the modal as you make changes.

# Domains

**Dashboard → Configuration → Domains**

Configure the allowed origins so the Pollar SDK can make requests from your app. Requests from unlisted origins are rejected.

---

Adding a domain [#adding-a-domain]

Click **Add domain** and enter your origin including the protocol:

```
http://localhost:3000
https://yourapp.com
https://staging.yourapp.com
```

Changes take effect immediately — no redeployment required.

---

Common issues [#common-issues]

**SDK throws `Origin not allowed`**
Your app's domain is not in the allowed list. Add it in **Dashboard → Configuration → Domains**.

**Localhost not working**
Add `http://localhost:3000` (or your local port) explicitly. Wildcard subdomains are not supported.

**Staging environment blocked**
Add each environment URL separately — `https://staging.yourapp.com`, `https://preview.yourapp.com`, etc.

# Funding Mode

**Dashboard → Configuration → Funding Mode**

Controls when new user wallets are funded with their XLM reserve. Switch modes at any time without code changes — the new mode applies to all wallets created after the switch.

---

Modes [#modes]

| Mode          | Cost                        | Activation trigger        | Best for                                      |
| ------------- | --------------------------- | ------------------------- | --------------------------------------------- |
| **Immediate** | \~2 XLM per registration    | Automatic on login        | Apps without compliance requirements          |
| **Deferred**  | \~2 XLM per activation only | Webhook from your backend | Neobanks, remittance apps, KYC-gated products |

In both modes, any individual wallet can also be activated manually from **Dashboard → Wallet Infrastructure → Wallets → Activate**. This is useful as a fallback or for support workflows.

---

Immediate [#immediate]

The wallet is funded atomically at the moment the user logs in. Ready in under 3 seconds. No additional setup required.

---

Deferred [#deferred]

The G-address is created on-chain at registration but without an XLM reserve. Activation happens when your backend calls `POST /wallets/activate` after a business event occurs (KYC approved, first deposit, etc.). See [Deferred Flow Guide](../../guides/deferred-flow-guide) for the full setup.

# Integrations

**Dashboard → Configuration → Integrations**

Connect third-party services to extend Pollar's functionality.

---

Fiat Ramps (SEP-24) [#fiat-ramps-sep-24]

Enable fiat on/off-ramps so users can deposit and withdraw real money directly in your app via a modal.

Supported anchors [#supported-anchors]

| Anchor       | Assets                  | Status        |
| ------------ | ----------------------- | ------------- |
| **Anclap**   | USDC, local stablecoins | Available     |
| More anchors | —                       | `coming soon` |

Setup [#setup]

1. Toggle **Enable SEP-24** on
2. Select your anchor
3. Select the assets to support (must also be configured in [Tokens / Trustlines](../wallet-infrastructure/tokens-trustlines))

Pollar handles the SEP-10 authentication handshake with the anchor automatically. No anchor credentials or account setup required.

Once enabled, the SEP-24 modal is available via `openFiatRamp()` in the SDK:

```tsx
const { openFiatRamp } = usePollar();

<button onClick={() => openFiatRamp({ type: "deposit", asset: "USDC" })}>
  Deposit
</button>;
```

---

More integrations `coming soon` [#more-integrations-coming-soon]

| Integration   | Description                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| KYC providers | Connect Jumio, Persona, or Sumsub to trigger Deferred mode activation automatically |
| Analytics     | Send wallet and payment events to Mixpanel, Amplitude, or Segment                   |

# Webhooks

**Dashboard → Configuration → Webhooks**

Configure URLs where Pollar sends event notifications when things happen in your app.

---

Adding a webhook endpoint [#adding-a-webhook-endpoint]

1. Click **Add endpoint**
2. Enter your URL (must be HTTPS in production)
3. Select which events to receive
4. Copy the **Webhook secret** — used to verify incoming requests

---

Verifying webhook signatures [#verifying-webhook-signatures]

Every request includes an `X-Pollar-Signature` header. Verify it before processing:

```typescript
import { createHmac } from "crypto";

function verifyWebhook(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return `sha256=${expected}` === signature;
}
```

Always respond with `200` immediately. Pollar retries failed deliveries with exponential backoff — see [Webhooks reference](../../sdk-reference/webhooks) for the full retry policy and event formats.

---

Event log [#event-log]

**Dashboard → Configuration → Webhooks → Event log** shows every delivery attempt — timestamp, event type, response code, and latency. Use this to debug failed deliveries or verify that events are being received correctly.

# Logs

**Dashboard → Observability → Logs**

API request logs, errors, and webhook delivery history for your app.

---

API logs [#api-logs]

Every request made to the Pollar Server using your app's keys is logged:

| Column         | Description                                            |
| -------------- | ------------------------------------------------------ |
| **Timestamp**  | Request time                                           |
| **Endpoint**   | HTTP method and path                                   |
| **Key**        | Which API key made the request (publishable or secret) |
| **Status**     | HTTP response code                                     |
| **Latency**    | Response time in milliseconds                          |
| **Error code** | Pollar error code if the request failed                |

Logs are retained for **30 days**.

Filter by key, status code, endpoint, or date range. Use this to:

- Audit which key made which request

- Identify unauthorized usage after a key is compromised

- Debug integration issues

---

Webhook delivery logs [#webhook-delivery-logs]

Every webhook delivery attempt is logged with the event type, destination URL, response code, and latency. Failed deliveries show the error and retry schedule.

Access webhook logs from **Dashboard → Configuration → Webhooks → Event log**.

# Transactions

**Dashboard → Observability → Transactions**

A real-time view of all on-chain transactions across your app.

---

Transaction list [#transaction-list]

| Column            | Description                                        |
| ----------------- | -------------------------------------------------- |
| **Tx hash**       | Stellar transaction hash — links to Stellar Expert |
| **Type**          | `payment`, `activation`, `trustline`, `receive`    |
| **Asset**         | Asset code                                         |
| **Amount**        | Transaction amount                                 |
| **From / To**     | Stellar G-addresses involved                       |
| **Fee sponsored** | Whether your gas wallet paid the fee               |
| **Ledger**        | Stellar ledger number                              |
| **Timestamp**     | Confirmation time                                  |

Filter by type, asset, date range, or wallet ID. Export as CSV.

---

Transaction detail [#transaction-detail]

Click any transaction to see the full details including the raw Stellar transaction envelope and a link to Stellar Expert for on-chain verification.

# Authentication

**Dashboard → User Management → Authentication**

Configure which authentication providers are available to your users.

---

Supported providers [#supported-providers]

| Provider      | Type              | Setup required                       |
| ------------- | ----------------- | ------------------------------------ |
| **Google**    | OAuth 2.0         | None — Pollar handles the OAuth flow |
| **GitHub**    | OAuth 2.0         | None — Pollar handles the OAuth flow |
| **Discord**   | OAuth 2.0         | None — Pollar handles the OAuth flow |
| **Email OTP** | One-time password | None — Pollar sends the OTP email    |

Enable or disable each provider here. Only enabled providers appear in the `WalletButton` modal and are accepted by `login()`.

---

Email OTP flow [#email-otp-flow]

<Mermaid
chart="%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#005EB3','primaryTextColor':'#FDFEFE','primaryBorderColor':'#005EB3','lineColor':'#005EB3','secondaryColor':'#A2D1ED','tertiaryColor':'#A2D1ED','actorBkg':'#005EB3','actorBorder':'#005EB3','actorTextColor':'#FDFEFE','actorLineColor':'#005EB3','signalColor':'#005EB3','signalTextColor':'#000','labelBoxBkgColor':'#A2D1ED','labelBoxBorderColor':'#005EB3','labelTextColor':'#000','loopTextColor':'#000','noteBorderColor':'#005EB3','noteBkgColor':'#FDFEFE','noteTextColor':'#000','activationBorderColor':'#005EB3','activationBkgColor':'#A2D1ED','sequenceNumberColor':'#FDFEFE'}}}%%
sequenceDiagram
actor User as End User
participant UI as Pollar SDK
participant API as Pollar API
Note left of UI: State: idle

    User->>+UI: Click login (email)
    Note left of UI: State: creating_session
    UI->>+API: POST /session
    API-->>-UI: return session_id

    Note left of UI: State: entering_email
    UI-->>-User: Display email input field

    User->>+UI: Submit email address
    Note left of UI: State: sending_email
    UI->>+API: POST /email {session_id, address}

    Note over API: Generate & send verification code

    API-->>-UI: Code sent confirmation

    Note left of UI: State: entering_code
    UI-->>-User: Display verification code input

    User->>+UI: Submit verification code
    Note left of UI: State: verifying_email_code
    UI->>+API: POST /verify {session_id, code}

    Note over API: Validate code

    API-->>-UI: Verification successful

    Note left of UI: State: authenticating
    UI->>+API: GET /login {session_id} (with event streaming)

    Note over API: Authentication Process<br/>━━━━━━━━━━━━━━━━<br/>1. Validate session<br/>2. Resolve wallet (find or create)<br/>3. Verify minimum funding<br/>4. Verify trustlines<br/>5. Generate JWT token

    API-->>-UI: event: authenticated returning JWT
    Note over UI: Store JWT
    Note left of UI: State: authenticated
    UI-->>-User: Authentication complete"

/>

What the user sees at each state [#what-the-user-sees-at-each-state]

| State                  | What the user sees                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `idle`                 | `WalletButton` — the login entry point                                               |
| `creating_session`     | `LoginModal` opens with a centered spinner and label "Initializing..."               |
| `entering_email`       | `LoginModal` shows an email input field and a "Continue" button                      |
| `sending_email`        | "Continue" button is disabled with an inline spinner — label changes to "Sending..." |
| `entering_code`        | `LoginModal` shows a 6-digit OTP input field and a "Verify" button                   |
| `verifying_email_code` | "Verify" button is disabled with an inline spinner — label changes to "Verifying..." |
| `authenticating`       | `LoginModal` shows a centered spinner and label "Authenticating..."                  |
| `authenticated`        | `LoginModal` shows a success message — closes automatically after a few seconds      |

---

OAuth flow (Google, GitHub, Discord) [#oauth-flow-google-github-discord]

OAuth providers follow the standard authorization code flow. When `login({ provider: 'google' })` is called:

1. `LoginModal` opens briefly with a spinner — "Redirecting..."
2. The browser redirects to the provider's consent screen
3. After the user approves, the provider redirects back to your app
4. `LoginModal` reopens with a spinner — "Authenticating..."
5. The same five internal steps run (see below)
6. `LoginModal` shows a success message and closes

---

What happens during authentication [#what-happens-during-authentication]

After credentials are verified — whether via OTP code or OAuth callback — the Pollar API runs five steps before issuing the JWT:

1. **Validate session** — confirms the session ID is valid and not expired
2. **Resolve wallet** — finds the existing wallet for this user, or creates a new one on first login
3. **Verify minimum funding** — checks the wallet has the minimum XLM reserve (Immediate mode only)
4. **Verify trustlines** — ensures all assets configured in the Dashboard are enabled on the wallet
5. **Generate JWT** — issues a signed token that the SDK stores and uses for subsequent requests

This sequence is identical for all providers.

---

Custom OAuth app `coming soon` [#custom-oauth-app-coming-soon]

By default, Pollar uses its own OAuth credentials for Google, GitHub, and Discord. You can configure your own OAuth app credentials for a fully branded experience — users will see your app name in the OAuth consent screen instead of Pollar's.

# Users

**Dashboard → User Management → Users**

Browse and manage all users who have authenticated through your app.

---

User list [#user-list]

| Column        | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| **User ID**   | Pollar user ID (`usr_...`)                                                  |
| **Email**     | User email — shown if authenticated via email OTP or OAuth with email scope |
| **Provider**  | Auth provider used (Google, GitHub, Discord, Email)                         |
| **Wallet**    | Associated wallet ID and status                                             |
| **Created**   | First login timestamp                                                       |
| **Last seen** | Most recent activity                                                        |

Search by email or user ID. Filter by auth provider or wallet status.

---

User detail [#user-detail]

Click any user to see:

- Auth provider and login history
- Associated wallet — ID, G-address, status, and balances
- Full transaction history
- Option to manually activate their wallet (Deferred / Manual mode)

# Distribution Wallet

**Dashboard → Wallet Infrastructure → Distribution Wallet**

Controls the behavior of `fund()` — the SDK method that sends assets from your app's distribution wallet to a user wallet.

---

Configured assets [#configured-assets]

Add the assets you want to distribute via `fund()`. Only listed assets can be requested — calling `fund({ asset: 'USDC' })` with an unconfigured asset throws `FUND_ASSET_NOT_CONFIGURED`.

For each asset, configure:

| Setting             | Description                                   |
| ------------------- | --------------------------------------------- |
| **Amount per call** | How much is sent each time `fund()` is called |
| **Daily limit**     | Maximum a single wallet can receive per day   |
| **Weekly limit**    | Maximum a single wallet can receive per week  |
| **Monthly limit**   | Maximum a single wallet can receive per month |

---

Default asset [#default-asset]

`fund()` called without arguments sends XLM. XLM is always available as a default — no configuration required.

```typescript
await fund(); // sends XLM
await fund({ asset: "USDC" }); // sends USDC if configured
```

---

Mainnet [#mainnet]

`fund()` is disabled on mainnet by default. Enable it explicitly by toggling **Allow fund() on mainnet** in this section.

Calling `fund()` on mainnet without this setting enabled throws `FUND_NOT_ENABLED_ON_MAINNET`.

---

Funding the distribution wallet [#funding-the-distribution-wallet]

Send assets directly to the distribution wallet's G-address or use the **Fund wallet** button in [App Wallets](../configuration/app-wallets.md).

# Gas Sponsorship

**Dashboard → Wallet Infrastructure → Gas Sponsorship**

Controls which transactions your app sponsors and the limits applied per user. All rules are enforced server-side by the Pollar Server — they cannot be bypassed from the client SDK.

---

Sponsored transaction types [#sponsored-transaction-types]

Select which Stellar operation types are covered by your gas wallet:

| Type         | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `payment`    | Asset transfers between wallets                              |
| `trustline`  | Adding a new asset trustline to a wallet                     |
| `activation` | Account sponsorship sequence for new wallets                 |
| Custom       | Define rules based on asset, amount range, or other criteria |

Transactions of unselected types are rejected before reaching the Stellar network.

---

Per-user limits [#per-user-limits]

Prevent abuse by setting caps per user:

| Setting           | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `daily_ops_cap`   | Maximum sponsored operations per user per day                    |
| `max_fee_per_tx`  | Maximum fee the gas wallet will pay per transaction (in stroops) |
| `approved_assets` | Whitelist of assets eligible for fee sponsorship                 |

---

Custom rules `coming soon` [#custom-rules-coming-soon]

Define granular sponsorship rules — for example, only sponsor USDC payments under $100, or only sponsor trustlines for configured assets.

# Tokens / Trustlines

**Dashboard → Wallet Infrastructure → Tokens / Trustlines**

Configure which assets are automatically enabled on new user wallets at creation or activation.

---

How it works [#how-it-works]

When a user wallet is created or activated, Pollar automatically sets up a trustline for each asset configured here. Users never need to manually enable assets.

Each trustline adds **0.5 XLM** to the wallet's reserve cost — charged from your funding wallet. See [App Wallets](../configuration/app-wallets) for the full cost breakdown.

---

Adding an asset [#adding-an-asset]

1. Click **Add asset**
2. Enter the asset code (e.g. `USDC`) and issuer G-address
3. Click **Save**

The asset is enabled on all new wallets from this point. Existing wallets are not affected.

---

Common assets on Stellar [#common-assets-on-stellar]

| Asset | Issuer                                                     |
| ----- | ---------------------------------------------------------- |
| USDC  | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| EURC  | `GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP`  |
| AQUA  | `GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA` |

Always verify issuer addresses from the official asset issuer before adding.

---

Removing an asset [#removing-an-asset]

Removing an asset from the list stops it from being added to new wallets. Existing trustlines on active wallets are not removed — trustlines can only be removed by the wallet owner.

# Wallets

**Dashboard → Wallet Infrastructure → Wallets**

Browse and manage all user wallets created through your app.

---

Wallet list [#wallet-list]

The wallet list shows every wallet associated with your app:

| Column        | Description                               |
| ------------- | ----------------------------------------- |
| **Wallet ID** | Pollar wallet ID (`wal_...`)              |
| **G-address** | Stellar address — links to Stellar Expert |
| **User**      | Associated user email or ID               |
| **Status**    | `pending` or `active`                     |
| **Balances**  | Current asset balances                    |
| **Created**   | Creation timestamp                        |

Filter by status, search by user email or wallet ID.

---

Activating a wallet manually [#activating-a-wallet-manually]

In Deferred or Manual mode, wallets start with `pending` status. To activate from the Dashboard:

1. Find the wallet in the list
2. Click **Activate**
3. Confirm — the XLM reserve is funded from your funding wallet

The wallet moves to `active` status within \~2 seconds.

---

Wallet detail [#wallet-detail]

Click any wallet to see:

- Full transaction history
- Current balances per asset
- Activation timestamp
- Associated user
- Link to Stellar Expert for on-chain verification
