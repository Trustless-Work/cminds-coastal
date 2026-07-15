"use client";

import Link from "next/link";
import { formatAddress } from "@repo/helpers";
import { NoData } from "@repo/shared/NoData";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { FileStack } from "lucide-react";

import { useCommunityEscrows } from "../hooks/useCommunityEscrows";

export const CommunityDashboardView = () => {
  const { data = [], isLoading, isError, error, refetch } =
    useCommunityEscrows();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium">Your escrows</h2>
          <p className="text-sm text-muted-foreground">
            Multi-release escrows you initialized for community tasks.
          </p>
        </div>
        <Link
          href="/dashboard/escrows/new"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Create escrow
        </Link>
      </div>

      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Could not load escrows</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Unknown error"}
            </CardDescription>
            <button
              type="button"
              className="w-fit text-sm text-primary hover:underline"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </button>
          </CardHeader>
        </Card>
      ) : null}

      {isLoading ? (
        <>
          <div className="space-y-3 md:hidden">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="hidden h-48 rounded-xl md:block" />
        </>
      ) : data.length === 0 ? (
        <NoData
          title="No escrows yet"
          description="Create an escrow from the fixed task menu to get started."
          icon={<FileStack />}
          link="/dashboard/escrows/new"
          linkText="Create escrow"
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {data.map((escrow) => (
              <Card key={escrow.escrow_id} className="overflow-hidden">
                {escrow.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={escrow.image_url}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/escrows/${escrow.escrow_id}`}
                      className="hover:underline"
                    >
                      {escrow.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{escrow.community.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{escrow.status}</Badge>
                    <span className="text-muted-foreground">
                      {escrow.milestones.length}{" "}
                      {escrow.milestones.length === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatAddress(escrow.escrow_id)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl ring-1 ring-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14"> </TableHead>
                  <TableHead>Escrow</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((escrow) => {
                  const total = escrow.milestones.reduce(
                    (sum, milestone) => sum + Number(milestone.amount),
                    0,
                  );
                  return (
                    <TableRow key={escrow.escrow_id}>
                      <TableCell>
                        {escrow.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={escrow.image_url}
                            alt=""
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/escrows/${escrow.escrow_id}`}
                          className="hover:underline"
                        >
                          {escrow.title}
                        </Link>
                      </TableCell>
                      <TableCell>{escrow.community.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{escrow.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatAddress(escrow.escrow_id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <UsdcAmount amount={total} size="sm" className="justify-end" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};
