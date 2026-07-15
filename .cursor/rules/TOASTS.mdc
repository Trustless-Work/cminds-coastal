---
description: Sonner toast title capitalization and description conventions
globs: apps/cminds-dashboard/**/*.{tsx,ts},apps/community-dashboard/**/*.{tsx,ts},apps/funding-dashboard/**/*.{tsx,ts},apps/public-viewer/**/*.{tsx,ts},apps/admin/**/*.{tsx,ts},packages/tw-blocks/**/*.{tsx,ts}
alwaysApply: false
---

# Toast notifications (Sonner)

Use `toastSuccess` / `toastError` from `@repo/ui/lib/toast`. Every **success** and **error** toast must include a **title** and a **description**.

The shared `<Toaster />` uses Sonner `theme="dark"` + `richColors` even though the product UI is light-only — do not override toast theme to light.

## Title — Title Case

- Capitalize major words in the toast **title** (message).
- Keep **small / bridge words** lowercase unless they are the first or last word:
  - Articles: `a`, `an`, `the`
  - Coordinating conjunctions: `and`, `but`, `or`, `nor`, `for`, `so`, `yet`
  - Short prepositions: `to`, `of`, `in`, `on`, `at`, `by`, `from`, `with`, `as`, `into`, `onto`, `over`, `per`, `via`
- Always capitalize the **first** and **last** word of the title.
- Do **not** Title-Case the **description** — use normal sentence case.

```ts
import { toastSuccess, toastError } from "@repo/ui/lib/toast";

// ✅ GOOD
toastSuccess(
  "Escrow Initialized",
  "Your escrow is live and ready to receive USDC funding.",
);
toastError(
  "Failed to Submit Evidence",
  getApiErrorMessage(err, "Something went wrong. Please try again."),
);
toastSuccess(
  "Milestone Approved",
  "The community can now release funds for this milestone.",
);
toastSuccess("Funding Confirmed", "Your USDC deposit has been recorded.");

// ❌ BAD — sentence case title, no description, raw sonner API
toast.success("Escrow initialized");
toast.error("Failed to submit evidence");
```

## Description

- One short sentence explaining outcome or next step.
- On errors, put the API / wallet / fallback message in `description`, keep a stable Title Case title.
- On-chain txs: mention confirmation or next user action (e.g. "Check Freighter to sign the release transaction.").

## Scope

Apply this whenever adding or editing toasts in app features or `@repo/tw-blocks`. Prefer updating nearby toasts in the same feature to match when you touch the file.
