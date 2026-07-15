"use client";

import { useParticipatingEscrowsUnion } from "@repo/features/escrow/hooks/useParticipatingEscrows";

export function useCommunityEscrows() {
  return useParticipatingEscrowsUnion(["initializer", "release_signer"]);
}
