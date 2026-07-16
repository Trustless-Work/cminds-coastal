"use client";

import { fetchAdminAnalytics } from "@repo/features/escrow/services/analytics.service";
import { useQuery } from "@tanstack/react-query";

const ADMIN_ANALYTICS_KEY = ["admin", "analytics"] as const;

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ADMIN_ANALYTICS_KEY,
    queryFn: fetchAdminAnalytics,
  });
}
