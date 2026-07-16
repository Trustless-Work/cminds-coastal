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

export function isEscrowCompleted(status: string): boolean {
  return status.toUpperCase() === "COMPLETED";
}

/** Cancelled or completed — cover image gets the soft inactive treatment. */
export function isEscrowInactive(status: string): boolean {
  return isEscrowCancelled(status) || isEscrowCompleted(status);
}

export function escrowStatusBadgeVariant(
  status: string,
): "destructive" | "success" | "outline" {
  if (isEscrowCancelled(status)) return "destructive";
  if (isEscrowCompleted(status)) return "success";
  return "outline";
}

/** Soft dim + blur so inactive cover photos read as settled. */
export const CANCELLED_ESCROW_IMAGE_CLASS =
  "opacity-45 blur-[2.5px] grayscale-[0.4] scale-105";
