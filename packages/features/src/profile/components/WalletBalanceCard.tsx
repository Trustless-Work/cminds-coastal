"use client";

import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { RefreshCw, Wallet } from "lucide-react";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { WithdrawDialog } from "./WithdrawDialog";

export const WalletBalanceCard = () => {
  const { status, usdc, xlm, error, refresh } = useWalletBalance();
  const isLoading = status === "idle" || status === "loading";

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
