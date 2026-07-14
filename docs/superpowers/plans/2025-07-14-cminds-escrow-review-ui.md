# CMinds Escrow Review UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the CMinds operator dashboard presentation layer (already scaffolded by v0) to real on-chain data using `useEscrowsByRoleQuery` and drop in `@repo/tw-blocks` action buttons.

**Architecture:** The UI layer in `apps/cminds-dashboard/src/features/escrow-review/` is fully props-driven; every component accepts `ReviewEscrow[]` and renders into disabled placeholder buttons where tw-blocks actions will be inserted. The Cursor agent's job is to (a) replace mock data with the real TW query, (b) sync the `EscrowProvider` context before each action, and (c) swap placeholder buttons with tw-blocks `Button` components.

**Tech Stack:** Next.js 16 App Router · `@repo/tw-blocks` · `@trustless-work/escrow` SDK · `@repo/providers/EscrowProvider` · `@pollar/react` (wallet address) · TanStack Query

---

## File map

| File | Status | Owner |
|---|---|---|
| `apps/cminds-dashboard/src/features/escrow-review/types.ts` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/utils.ts` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/mock.ts` | Done (v0) | Remove once real data works |
| `apps/cminds-dashboard/src/features/escrow-review/components/StatsCards.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/components/EscrowListCard.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/components/EscrowListTable.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/components/EscrowListView.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneReviewQueue.tsx` | Done (v0) — action slots disabled | Cursor: wire buttons |
| `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx` | Done (v0) — action slots disabled | Cursor: wire buttons |
| `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneList.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/components/EscrowDetailHeader.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/features/escrow-review/components/EscrowDetailView.tsx` | Done (v0) | — |
| `apps/cminds-dashboard/src/app/dashboard/page.tsx` | Done (v0) — mock data | Cursor: replace mock |
| `apps/cminds-dashboard/src/app/dashboard/escrows/[contractId]/page.tsx` | Done (v0) — mock data | Cursor: replace mock + set context |

---

## Task 1: Replace mock data on the dashboard overview page

**Files:**
- Modify: `apps/cminds-dashboard/src/app/dashboard/page.tsx`

- [ ] **Step 1: Add query + wallet address hooks**

```tsx
"use client";

import { usePollar } from "@pollar/react";
import { useEscrowsByRoleQuery } from "@repo/tw-blocks/tanstack/useEscrowsByRoleQuery";
import { useMemo } from "react";
import type { ReviewEscrow, ReviewQueueStats } from "@/features/escrow-review/types";
import type { GetEscrowsFromIndexerResponse as TWEscrow } from "@trustless-work/escrow/types";
import { countPendingReview } from "@/features/escrow-review/utils";
```

- [ ] **Step 2: Map TW escrow type → ReviewEscrow**

Add a mapper function at the top of the file (or in `utils.ts`):

```ts
function toReviewEscrow(e: TWEscrow): ReviewEscrow {
  return {
    contractId: e.contractId,
    title: e.title,
    description: e.description,
    balance: e.balance ?? 0,
    trustline: { address: e.trustline.address, decimals: e.trustline.decimals, name: e.trustline.name },
    createdAt: e.createdAt ? String(e.createdAt) : undefined,
    updatedAt: e.updatedAt ? String(e.updatedAt) : undefined,
    milestones: (e.milestones ?? []).map((m, i) => {
      const mr = m as import("@trustless-work/escrow/types").MultiReleaseMilestone;
      return {
        index: i,
        title: mr.title ?? `Milestone ${i + 1}`,
        description: mr.description,
        amount: mr.amount ?? 0,
        evidenceLink: mr.evidence,
        flags: {
          approved: mr.flags?.approved ?? false,
          disputed: mr.flags?.disputed ?? false,
          resolved: mr.flags?.resolved ?? false,
        },
      };
    }),
  };
}
```

- [ ] **Step 3: Replace mock with live query inside the component**

```tsx
export default function DashboardPage() {
  const { wallet } = usePollar();
  const walletAddress = wallet?.address ?? "";

  const { data: rawEscrows = [], isLoading, error } = useEscrowsByRoleQuery({
    role: "approver",
    roleAddress: walletAddress,
    enabled: Boolean(walletAddress),
  });

  const escrows: ReviewEscrow[] = useMemo(
    () => rawEscrows.map(toReviewEscrow),
    [rawEscrows]
  );

  const stats: ReviewQueueStats = useMemo(() => ({
    totalEscrows: escrows.length,
    pendingReview: escrows.reduce((n, e) => n + countPendingReview(e.milestones), 0),
    disputed: escrows.reduce(
      (n, e) => n + e.milestones.filter((m) => m.flags.disputed && !m.flags.resolved).length,
      0
    ),
    approved: escrows.reduce(
      (n, e) => n + e.milestones.filter((m) => m.flags.approved).length,
      0
    ),
  }), [escrows]);

  // ... rest of JSX unchanged, remove the MOCK_ESCROWS / MOCK_STATS imports
}
```

- [ ] **Step 4: Remove mock imports**

Delete the two import lines at the top that reference `mock.ts`:
```
import { MOCK_ESCROWS, MOCK_STATS } from "@/features/escrow-review/mock";
```

- [ ] **Step 5: Verify in browser — dashboard loads without errors**

Navigate to `http://localhost:3001/dashboard` (after sign-in). Expect the stats cards and queue to render, even if empty because wallet has no escrows yet.

- [ ] **Step 6: Commit**

```bash
git add apps/cminds-dashboard/src/app/dashboard/page.tsx
git commit -m "feat(cminds): wire dashboard overview to useEscrowsByRoleQuery"
```

---

## Task 2: Replace mock data on the escrow detail page + sync EscrowProvider

**Files:**
- Modify: `apps/cminds-dashboard/src/app/dashboard/escrows/[contractId]/page.tsx`

- [ ] **Step 1: Add imports**

```tsx
import { usePollar } from "@pollar/react";
import { useEscrowsByRoleQuery } from "@repo/tw-blocks/tanstack/useEscrowsByRoleQuery";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEffect, useMemo } from "react";
// toReviewEscrow mapper — move to utils.ts in Task 1 and import from there
import { toReviewEscrow } from "@/features/escrow-review/utils";
```

- [ ] **Step 2: Replace mock lookup with live data + sync context**

```tsx
export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { contractId } = use(params);
  const { wallet } = usePollar();
  const walletAddress = wallet?.address ?? "";
  const { setSelectedEscrow, setUserRolesInEscrow } = useEscrowContext();

  const { data: rawEscrows = [], isLoading, error } = useEscrowsByRoleQuery({
    role: "approver",
    roleAddress: walletAddress,
    enabled: Boolean(walletAddress),
  });

  const escrow = useMemo(
    () => {
      const found = rawEscrows.find((e) => e.contractId === contractId);
      return found ? toReviewEscrow(found) : null;
    },
    [rawEscrows, contractId]
  );

  // Sync EscrowProvider so tw-blocks action buttons pick up the right escrow
  useEffect(() => {
    if (escrow) {
      setSelectedEscrow(escrow as Parameters<typeof setSelectedEscrow>[0]);
      setUserRolesInEscrow(["approver"]);
    }
  }, [escrow, setSelectedEscrow, setUserRolesInEscrow]);

  return (
    <AuthGate appRole="CMINDS_OPERATOR" appTitle="CMinds" appSubtitle="Operator dashboard">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <EscrowDetailView
          escrow={escrow}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : null}
        />
      </main>
    </AuthGate>
  );
}
```

- [ ] **Step 3: Remove mock import**

Delete:
```
import { MOCK_ESCROWS } from "@/features/escrow-review/mock";
```

- [ ] **Step 4: Commit**

```bash
git add apps/cminds-dashboard/src/app/dashboard/escrows/[contractId]/page.tsx
git commit -m "feat(cminds): wire escrow detail to live query + sync EscrowProvider"
```

---

## Task 3: Wire ApproveMilestoneButton in MilestoneRow

**Files:**
- Modify: `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx`

- [ ] **Step 1: Import tw-blocks button**

```tsx
import { ApproveMilestoneButton } from "@repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone";
```

- [ ] **Step 2: Replace the disabled Approve placeholder**

Find the comment `// ACTION: ApproveMilestoneButton` inside the `{canApprove && ...}` block and replace the whole `<Button>` with:

```tsx
{canApprove && (
  <ApproveMilestoneButton milestoneIndex={milestone.index} />
)}
```

- [ ] **Step 3: Verify button renders and the parent page has called setSelectedEscrow before this component mounts**

Open a detail page in the browser. The Approve button should be active (not disabled) for a milestone with `evidence_ready` status.

- [ ] **Step 4: Commit**

```bash
git add apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx
git commit -m "feat(cminds): wire ApproveMilestoneButton in MilestoneRow"
```

---

## Task 4: Wire DisputeMilestoneButton in MilestoneRow

**Files:**
- Modify: `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx`

- [ ] **Step 1: Import tw-blocks dispute button**

```tsx
import { DisputeMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone";
```

- [ ] **Step 2: Replace the disabled Dispute placeholder**

Find `// ACTION: DisputeMilestoneButton` inside `{canDispute && ...}` and replace:

```tsx
{canDispute && (
  <DisputeMilestoneButton milestoneIndex={milestone.index} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx
git commit -m "feat(cminds): wire DisputeMilestoneButton in MilestoneRow"
```

---

## Task 5: Wire ResolveDisputeDialog in MilestoneRow

**Files:**
- Modify: `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx`

- [ ] **Step 1: Import dialog**

```tsx
import { ResolveDisputeDialog } from "@repo/tw-blocks/escrows/multi-release/resolve-dispute/dialog/ResolveDispute";
```

- [ ] **Step 2: Replace the disabled Resolve Dispute placeholder**

```tsx
{canResolve && (
  <ResolveDisputeDialog milestoneIndex={milestone.index} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add apps/cminds-dashboard/src/features/escrow-review/components/MilestoneRow.tsx
git commit -m "feat(cminds): wire ResolveDisputeDialog in MilestoneRow"
```

---

## Task 6: Wire action buttons in the MilestoneReviewQueue (dashboard quick-actions)

**Files:**
- Modify: `apps/cminds-dashboard/src/features/escrow-review/components/MilestoneReviewQueue.tsx`

- [ ] **Step 1: Context sync inside QueueCard**

The queue card renders outside the detail page, so the EscrowProvider context must be set per card.  Add `useEscrowContext` and sync on mount:

```tsx
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEffect } from "react";

function QueueCard({ item }: QueueCardProps) {
  const { escrow, milestone } = item;
  const { setSelectedEscrow, setUserRolesInEscrow } = useEscrowContext();
  const status = getMilestoneStatus(milestone);

  useEffect(() => {
    setSelectedEscrow(escrow as Parameters<typeof setSelectedEscrow>[0]);
    setUserRolesInEscrow(["approver"]);
  }, [escrow, setSelectedEscrow, setUserRolesInEscrow]);

  // ... rest unchanged
}
```

- [ ] **Step 2: Replace Approve placeholder with tw-blocks button**

```tsx
import { ApproveMilestoneButton } from "@repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone";
import { DisputeMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone";

// In QueueCard CardFooter:
<CardFooter className="gap-2">
  <div className="flex-1">
    <ApproveMilestoneButton milestoneIndex={milestone.index} />
  </div>
  <div className="flex-1">
    <DisputeMilestoneButton milestoneIndex={milestone.index} />
  </div>
  <Button asChild size="sm" variant="ghost">
    <Link href={`/dashboard/escrows/${escrow.contractId}`}>Details</Link>
  </Button>
</CardFooter>
```

- [ ] **Step 3: Commit**

```bash
git add apps/cminds-dashboard/src/features/escrow-review/components/MilestoneReviewQueue.tsx
git commit -m "feat(cminds): wire approve/dispute buttons in MilestoneReviewQueue"
```

---

## Task 7: Clean up mock data file

**Files:**
- Delete (or keep as dev-only fallback): `apps/cminds-dashboard/src/features/escrow-review/mock.ts`

- [ ] **Step 1: Confirm no imports remain**

```bash
grep -r "mock" apps/cminds-dashboard/src --include="*.ts" --include="*.tsx"
```

Expected: no results.

- [ ] **Step 2: Delete the file**

```bash
rm apps/cminds-dashboard/src/features/escrow-review/mock.ts
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(cminds): remove mock escrow data"
```
