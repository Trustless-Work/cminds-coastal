"use client";

import { Badge } from "@repo/ui/components/badge";

import type { MilestoneReviewStatus } from "../types";
import { milestoneStatusLabel, milestoneStatusVariant } from "../utils";

type MilestoneStatusBadgeProps = {
  status: MilestoneReviewStatus;
};

export const MilestoneStatusBadge = ({ status }: MilestoneStatusBadgeProps) => {
  return (
    <Badge variant={milestoneStatusVariant(status)}>
      {milestoneStatusLabel(status)}
    </Badge>
  );
};
