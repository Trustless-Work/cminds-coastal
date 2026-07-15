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
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Contract ID</p>
        <p className="text-sm text-muted-foreground">
          Send USDC from any Stellar wallet to this address.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-border bg-background-secondary/60 px-3 py-3">
        <p className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-foreground">
          {contractId}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          aria-label={copied ? "Copied" : "Copy contract ID"}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
