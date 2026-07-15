"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatAddress } from "@repo/helpers";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

import type { ReviewQueueItem } from "../types";
import { parseEvidenceLinks } from "../utils";
import { MilestoneActions } from "./MilestoneActions";
import { MilestoneStatusBadge } from "./MilestoneStatusBadge";

type MilestoneReviewQueueProps = {
  items: ReviewQueueItem[];
  isLoading?: boolean;
};

export const MilestoneReviewQueue = ({
  items,
  isLoading,
}: MilestoneReviewQueueProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review queue empty</CardTitle>
          <CardDescription>
            Tasks marked ready for review or in dispute will show up here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const ready = items.filter((item) => item.status === "ready_for_review");
  const disputed = items.filter((item) => item.status === "disputed");

  return (
    <div className="space-y-6">
      {ready.length > 0 ? (
        <QueueSection title="Ready for Review" items={ready} />
      ) : null}
      {disputed.length > 0 ? (
        <QueueSection title="Disputed" items={disputed} />
      ) : null}
    </div>
  );
};

function QueueSection({
  title,
  items,
}: {
  title: string;
  items: ReviewQueueItem[];
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const symbol = item.escrow.trustline?.symbol ?? "USDC";
          const links = parseEvidenceLinks(item.evidence);

          return (
            <Card key={`${item.escrow.contractId}-${item.milestoneIndex}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      <Link
                        href={`/dashboard/escrows/${item.escrow.contractId}`}
                        className="hover:underline"
                      >
                        {item.escrow.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Task {item.milestoneIndex + 1} ·{" "}
                      {formatAddress(item.escrow.contractId)}
                    </CardDescription>
                  </div>
                  <MilestoneStatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{item.milestoneDescription}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {item.amount === null ? (
                        "—"
                      ) : (
                        <UsdcAmount
                          amount={item.amount}
                          currency={symbol}
                          size="sm"
                        />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Evidence</p>
                    {links.length > 0 ? (
                      <ul className="space-y-1">
                        {links.map((link) => (
                          <li key={link}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Open link
                              <ExternalLink className="size-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {item.evidence?.trim() || "No link"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-(--card-spacing)">
                <MilestoneActions
                  escrow={item.escrow}
                  milestoneIndex={item.milestoneIndex}
                  status={item.status}
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
