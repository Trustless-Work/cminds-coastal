/** Shared off-chain escrow status display helpers. */

export function formatEscrowStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isEscrowCancelled(status: string): boolean {
  return status.toUpperCase() === "CANCELLED";
}

export function escrowStatusBadgeVariant(
  status: string,
): "destructive" | "outline" {
  return isEscrowCancelled(status) ? "destructive" : "outline";
}

/** Soft dim + blur so cancelled cover photos read as inactive. */
export const CANCELLED_ESCROW_IMAGE_CLASS =
  "opacity-45 blur-[2.5px] grayscale-[0.4] scale-105";
