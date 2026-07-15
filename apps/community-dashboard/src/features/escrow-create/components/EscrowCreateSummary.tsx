"use client";

import { useEffect, useState } from "react";
import type { UserSearchResult } from "@repo/features/auth/services/users-search.service";
import type { TaskRecord } from "@repo/features/escrow/services/tasks.service";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { ImageIcon, MapPin } from "lucide-react";

type EscrowCreateSummaryProps = {
  title: string;
  communityName: string | null;
  engagementId: string;
  geographicArea: string;
  description: string;
  imageFile: File | null;
  cmindsUser: UserSearchResult | null;
  releaseSigner: UserSearchResult | null;
  selectedTasks: TaskRecord[];
  amounts: Record<string, string>;
  className?: string;
};

function shortenWallet(address: string): string {
  if (address.length < 12) {
    return address;
  }
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function displayPerson(user: UserSearchResult | null): string {
  if (!user) {
    return "Not set";
  }
  return user.display_name?.trim() || user.email || "Not set";
}

export const EscrowCreateSummary = ({
  title,
  communityName,
  engagementId,
  geographicArea,
  description,
  imageFile,
  cmindsUser,
  releaseSigner,
  selectedTasks,
  amounts,
  className,
}: EscrowCreateSummaryProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const totalUsdc = selectedTasks.reduce((sum, task) => {
    const amount = Number(amounts[task.task_id]?.trim() ?? "");
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);

  const hasTitle = Boolean(title.trim());

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/80",
        className,
      )}
    >
      <div className="relative aspect-[16/10] bg-[#F3F3F3]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img
            src={previewUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8 opacity-40" />
            <span className="text-xs">Cover Image Preview</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs font-medium tracking-wide text-white/80 uppercase">
            Escrow draft
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {hasTitle ? title.trim() : "Untitled project"}
          </h2>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <dl className="grid gap-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Community</dt>
            <dd className="max-w-[60%] text-right font-medium text-foreground">
              {communityName ?? "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Engagement</dt>
            <dd className="max-w-[60%] truncate text-right font-medium text-foreground">
              {engagementId.trim() || "—"}
            </dd>
          </div>
          {geographicArea.trim() ? (
            <div className="flex items-start justify-between gap-3">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-3.5" />
                Area
              </dt>
              <dd className="max-w-[60%] text-right font-medium text-foreground">
                {geographicArea.trim()}
              </dd>
            </div>
          ) : null}
        </dl>

        {description.trim() ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {description.trim()}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/70 italic">
            Description will appear here as you write…
          </p>
        )}

        <div className="space-y-2 border-t border-border/80 pt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Roles
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">CMinds</span>
              <span className="max-w-[65%] truncate text-right font-medium">
                {displayPerson(cmindsUser)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Release Signer</span>
              <span className="max-w-[65%] truncate text-right font-medium">
                {displayPerson(releaseSigner)}
              </span>
            </div>
            {releaseSigner?.wallet_address ? (
              <p className="text-right font-mono text-xs text-muted-foreground">
                {shortenWallet(releaseSigner.wallet_address)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 border-t border-border/80 pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Milestones
            </p>
            <UsdcAmount
              amount={totalUsdc}
              size="sm"
              className="font-semibold text-foreground"
            />
          </div>

          {selectedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 italic">
              Selected tasks build the escrow here.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedTasks.map((task) => {
                const raw = amounts[task.task_id]?.trim() ?? "";
                const amount = Number(raw);
                const hasAmount =
                  Boolean(raw) && Number.isFinite(amount) && amount > 0;
                return (
                  <li
                    key={task.task_id}
                    className="flex items-start justify-between gap-3 rounded-xl bg-[#F8F8F8] px-3 py-2.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {task.code}
                        </Badge>
                        <span className="truncate text-sm font-medium">
                          {task.name}
                        </span>
                      </div>
                    </div>
                    {hasAmount ? (
                      <UsdcAmount
                        amount={amount}
                        size="sm"
                        className="shrink-0 font-medium text-foreground"
                      />
                    ) : (
                      <span className="shrink-0 text-sm text-muted-foreground">
                        Amount Pending
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};
