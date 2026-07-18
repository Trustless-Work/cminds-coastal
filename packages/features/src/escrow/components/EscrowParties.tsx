"use client";

import { UserCard } from "@repo/features/auth/components/UserCard";
import { cn } from "@repo/ui/lib/utils";

import type {
  EscrowPartyUser,
  EscrowRecord,
} from "../services/escrows.service";

type EscrowPartyRole =
  | "initializer"
  | "approver"
  | "release_signer"
  | "dispute_resolver";

type EscrowPartyEntry = {
  role: EscrowPartyRole;
  label: string;
  user: EscrowPartyUser;
};

const PARTY_ORDER: Array<{
  role: EscrowPartyRole;
  label: string;
  key: keyof Pick<
    EscrowRecord,
    "initializer" | "approver" | "release_signer" | "dispute_resolver"
  >;
}> = [
  { role: "initializer", label: "Initializer", key: "initializer" },
  { role: "approver", label: "CMinds", key: "approver" },
  { role: "release_signer", label: "Release Signer", key: "release_signer" },
  {
    role: "dispute_resolver",
    label: "Help Resolver",
    key: "dispute_resolver",
  },
];

type EscrowPartiesProps = {
  escrow: EscrowRecord;
  className?: string;
  /**
   * Builds the public profile URL for a party. Defaults to
   * `/dashboard/profile/:userId`. Pass `false` to disable links
   * (e.g. public viewer, which has no profile routes).
   */
  getProfileHref?: ((userId: string) => string) | false;
};

function partyWalletAddress(user: EscrowPartyUser): string | null {
  return user.wallets[0]?.address ?? null;
}

export function buildEscrowParties(escrow: EscrowRecord): EscrowPartyEntry[] {
  const parties: EscrowPartyEntry[] = [];

  for (const entry of PARTY_ORDER) {
    const user = escrow[entry.key];
    if (!user) {
      continue;
    }
    parties.push({
      role: entry.role,
      label: entry.label,
      user,
    });
  }

  return parties;
}

function defaultProfileHref(userId: string): string {
  return `/dashboard/profile/${userId}`;
}

export function EscrowParties({
  escrow,
  className,
  getProfileHref,
}: EscrowPartiesProps) {
  const parties = buildEscrowParties(escrow);
  const resolveProfileHref =
    getProfileHref === false
      ? null
      : (getProfileHref ?? defaultProfileHref);

  if (parties.length === 0) {
    return null;
  }

  return (
    <div className={cn("min-w-0 space-y-3 border-t border-border pt-6", className)}>
      <div className="min-w-0 space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Parties
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Users assigned when this escrow was created.
        </p>
      </div>

      <ul className="flex min-w-0 flex-col gap-3">
        {parties.map((party) => (
          <li key={`${party.role}-${party.user.user_id}`} className="min-w-0">
            <UserCard
              displayName={
                party.user.display_name?.trim() || party.user.email
              }
              avatarUrl={party.user.avatar_url}
              subtitle={party.label}
              walletAddress={partyWalletAddress(party.user)}
              href={resolveProfileHref?.(party.user.user_id)}
              className="w-full max-w-none md:max-w-none"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
