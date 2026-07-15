"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatAddress } from "@repo/helpers";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { UpdateEscrowDialog } from "@repo/tw-blocks/escrows/multi-release/update-escrow/dialog/UpdateEscrow";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

import { useSyncSelectedEscrow } from "../hooks/useSyncSelectedEscrow";
import {
  fundingLabel,
  getMilestoneAmount,
  getMilestoneReviewStatus,
  parseEvidenceLinks,
} from "../utils";
import { MilestoneActions } from "./MilestoneActions";
import { MilestoneStatusBadge } from "./MilestoneStatusBadge";

type EscrowDetailProps = {
  escrow: Escrow;
};

export const EscrowDetail = ({ escrow }: EscrowDetailProps) => {
  useSyncSelectedEscrow(escrow);
  const symbol = escrow.trustline?.symbol ?? "USDC";

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2 overflow-hidden">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold tracking-tight">
              {escrow.title}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {formatAddress(escrow.contractId)}
            </p>
          </div>
          <p className="max-w-2xl break-words text-sm text-muted-foreground">
            {escrow.description}
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="min-w-0 break-words">
              Funding: <strong>{fundingLabel(escrow)}</strong>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              Balance:{" "}
              <UsdcAmount
                amount={escrow.balance ?? 0}
                currency={symbol}
                size="sm"
                className="font-semibold"
              />
            </span>
          </div>
        </div>
        <div className="shrink-0 self-start">
          <UpdateEscrowDialog />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="space-y-3">
          {escrow.milestones.map((milestone, milestoneIndex) => {
            const status = getMilestoneReviewStatus(milestone);
            const amount = getMilestoneAmount(milestone);
            const links = parseEvidenceLinks(milestone.evidence);

            return (
              <Card key={`${escrow.contractId}-${milestoneIndex}`}>
                <CardHeader>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1 overflow-hidden">
                      <CardTitle className="text-base">
                        Task {milestoneIndex + 1}
                      </CardTitle>
                      <CardDescription className="break-words">
                        {milestone.description}
                      </CardDescription>
                    </div>
                    <div className="shrink-0 self-start">
                      <MilestoneStatusBadge status={status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {amount === null ? (
                        "—"
                      ) : (
                        <UsdcAmount
                          amount={amount}
                          currency={symbol}
                          size="sm"
                        />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Status text
                    </p>
                    <p className="text-sm">{milestone.status || "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Evidence</p>
                    {links.length > 0 ? (
                      <ul className="mt-1 space-y-1">
                        {links.map((link) => (
                          <li key={link}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 break-all text-sm text-primary hover:underline"
                            >
                              {link}
                              <ExternalLink className="size-3 shrink-0" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {milestone.evidence?.trim() || "No evidence submitted"}
                      </p>
                    )}
                  </div>
                </CardContent>
                {(status === "ready_for_review" || status === "disputed") && (
                  <CardFooter className="border-t pt-(--card-spacing)">
                    <MilestoneActions
                      escrow={escrow}
                      milestoneIndex={milestoneIndex}
                      status={status}
                    />
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
