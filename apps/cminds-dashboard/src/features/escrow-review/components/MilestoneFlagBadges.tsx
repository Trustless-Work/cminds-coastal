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

export const MilestoneFlagBadges = ({ flags }: MilestoneFlagBadgesProps) => {
  const labels = getActiveMilestoneFlagLabels(flags);

  if (labels.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge
          key={label}
          variant={label === "DISPUTE" ? "destructive" : "secondary"}
        >
          {label}
        </Badge>
      ))}
    </div>
  );
};
