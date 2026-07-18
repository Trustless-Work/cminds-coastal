"use client";

import { ExternalLink } from "lucide-react";

type RecommendedWallet = {
  name: string;
  href: string;
  logoSrc: string;
};

const WALLETS: RecommendedWallet[] = [
  { name: "Decaf Wallet", href: "https://www.decaf.so/en", logoSrc: "/decaf.jpeg" },
  { name: "LOBSTR", href: "https://lobstr.co/", logoSrc: "/lobstr.png" },
];

export const RecommendedWallets = () => (
  <div className="space-y-3 rounded-2xl border border-border bg-background-secondary p-4">
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">Recommended wallets</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Need a wallet with a USDC trustline? Try one of these.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {WALLETS.map((wallet) => (
        <a
          key={wallet.name}
          href={wallet.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${wallet.name} website`}
          className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-background-tertiary"
        >
          <img
            src={wallet.logoSrc}
            alt={`${wallet.name} logo`}
            className="size-12 rounded-2xl object-contain"
          />
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {wallet.name}
            <ExternalLink className="size-3" />
          </span>
        </a>
      ))}
    </div>
  </div>
);
