"use client";

import { formatAddress, useCopy } from "@repo/helpers";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Check, Copy, RefreshCw, Wallet } from "lucide-react";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { WithdrawDialog } from "./WithdrawDialog";

type WalletBalanceCardProps = {
  walletAddress?: string | null;
};

const WalletAddressRow = ({ address }: { address: string }) => {
  const { copiedKeyId, copyToClipboard } = useCopy();

  return (
    <TooltipProvider delay={200}>
      <div className="flex items-center justify-between gap-2 rounded-full bg-background-tertiary py-1.5 pl-4 pr-1.5 ring-1 ring-border/60">
        <Tooltip>
          <TooltipTrigger
            className="min-w-0 truncate text-left font-mono text-xs font-medium tracking-wide text-foreground outline-none"
            render={<button type="button" />}
          >
            {formatAddress(address, 6)}
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-[18rem] break-all font-mono tracking-wide"
          >
            {address}
          </TooltipContent>
        </Tooltip>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 shrink-0 rounded-full text-muted-foreground hover:scale-100 hover:bg-white hover:text-foreground"
          aria-label={copiedKeyId ? "Address copied" : "Copy wallet address"}
          onClick={() => {
            void copyToClipboard(address);
          }}
        >
          {copiedKeyId ? (
            <Check className="size-3 text-emerald-500" />
          ) : (
            <Copy className="size-3" strokeWidth={2} />
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
};

export const WalletBalanceCard = ({
  walletAddress,
}: WalletBalanceCardProps) => {
  const { status, usdc, xlm, error, refresh } = useWalletBalance();
  const isLoading = status === "idle" || status === "loading";
  const address = walletAddress?.trim() || null;

  return (
    <Card className="rounded-[24px] border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Wallet className="size-4 text-muted-foreground" />
          Wallet Balance
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Refresh balance"
          onClick={() => {
            void refresh();
          }}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "animate-spin" : undefined} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {address ? <WalletAddressRow address={address} /> : null}
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-lg" />
          </>
        ) : status === "error" ? (
          <p className="text-sm text-muted-foreground">
            {error ?? "Could not load your balance."}
          </p>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                USDC
              </p>
              <UsdcAmount
                amount={usdc?.balance ?? 0}
                currency="USDC"
                size="lg"
              />
            </div>
            <div className="border-t border-border/70 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                XLM
              </p>
              <p className="text-sm font-medium text-foreground">
                {xlm?.balance ?? "0"} XLM
              </p>
            </div>
            {usdc && Number(usdc.available) > 0 ? (
              <div className="border-t border-border/70 pt-4">
                <WithdrawDialog available={usdc.available} />
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};
