"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { networkConfig } from "@repo/config";
import { Button, buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import { BrandTextLink, StellarLink } from "./BrandTextLink";
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
          On-chain escrow identifier on <StellarLink />.
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
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
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
  );
};
