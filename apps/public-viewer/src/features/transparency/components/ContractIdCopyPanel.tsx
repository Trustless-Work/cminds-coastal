"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { networkConfig } from "@repo/config";
import { Button, buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import { StellarLink } from "./BrandTextLink";
import Link from "next/link";

type ContractIdCopyPanelProps = {
  contractId: string;
  className?: string;
};

export const ContractIdCopyPanel = ({
  contractId,
  className,
}: ContractIdCopyPanelProps) => {
  const [copied, setCopied] = useState(false);
  const viewerUrl = networkConfig.getEscrowViewerUrl(contractId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractId);
      setCopied(true);
      toastSuccess(
        "Contract ID Copied",
        "You can paste it into Freighter or share it with funders.",
      );
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError(
        "Copy Failed",
        "Could not copy the contract ID. Try again or copy it manually.",
      );
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Contract ID</p>
        <p className="text-sm text-muted-foreground">
          On-chain escrow identifier on <StellarLink />.
        </p>
      </div>

      <div className="flex min-w-0 items-start gap-2 rounded-2xl border border-border bg-background-secondary/60 px-3 py-3">
        <p className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-foreground">
          {contractId}
        </p>
        <div className="flex shrink-0 gap-2">
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
          <Link
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Escrow Viewer"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "size-9 shrink-0 rounded-full",
            )}
          >
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
