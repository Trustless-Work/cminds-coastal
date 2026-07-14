"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

type ContractIdCopyPanelProps = {
  contractId: string;
  className?: string;
};

export const ContractIdCopyPanel = ({
  contractId,
  className,
}: ContractIdCopyPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractId);
      setCopied(true);
      toast.success("Contract ID copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy contract ID");
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 sm:p-8",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Escrow contract ID
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Copy this address and send USDC from any Stellar wallet. Multiple
        funders can contribute to the same escrow.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1 rounded-xl bg-background px-4 py-4 ring-1 ring-foreground/10">
          <p className="break-all font-mono text-base font-semibold leading-relaxed tracking-tight sm:text-lg md:text-xl">
            {contractId}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="h-auto shrink-0 gap-2 px-6 py-4 text-base sm:self-stretch"
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? (
            <>
              <Check className="size-5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-5" />
              Copy contract ID
            </>
          )}
        </Button>
      </div>
    </section>
  );
};
