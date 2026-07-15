"use client";

import { Badge } from "@repo/ui/components/badge";

type MilestoneStatusBadgeProps = {
  statusText: string;
};

export const MilestoneStatusBadge = ({
  statusText,
}: MilestoneStatusBadgeProps) => {
  const label = statusText.trim() || "Pending";

  return <Badge variant="outline">{label}</Badge>;
};
