"use client";

import { Badge } from "@repo/ui/components/badge";

type MilestoneStatusBadgeProps = {
  statusText: string;
};

export const MilestoneStatusBadge = ({
  statusText,
}: MilestoneStatusBadgeProps) => {
  const label = (statusText.trim() || "Pending").toUpperCase();

  return <Badge variant="outline">{label}</Badge>;
};
