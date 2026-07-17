"use client";

import { Badge } from "@repo/ui/components/badge";

import { getActiveMilestoneFlagLabels } from "../utils";

type MilestoneFlagBadgesProps = {
  flags: {
    approved?: boolean;
    disputed?: boolean;
    released?: boolean;
    resolved?: boolean;
  };
};

type FlagBadgeVariant = "outline" | "success" | "destructive";

function flagBadgeVariant(label: string): FlagBadgeVariant {
  if (label === "HELP") return "destructive";
  if (label === "RELEASED" || label === "RESOLVED") return "success";
  return "outline";
}

export const MilestoneFlagBadges = ({ flags }: MilestoneFlagBadgesProps) => {
  const labels = getActiveMilestoneFlagLabels(flags);

  if (labels.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge key={label} variant={flagBadgeVariant(label)}>
          {label}
        </Badge>
      ))}
    </div>
  );
};
