"use client";

import { useQuery } from "@tanstack/react-query";
import type { AccountProfile } from "@/features/profile/api";
import { ADMIN_NAVIGATION_COUNTS_KEY, getAdminNavigationCounts } from "./navigation-counts";

export function useNavigationCounts(account: AccountProfile | null) {
  const roles = [...(account?.roles ?? [])].sort();
  const canRead = roles.some((role) => ["admin", "manager", "staff", "customerservice", "maintenance"].includes(role.toLowerCase()));
  return useQuery({
    // Cache identity includes account, roles and facility; API counts follow the list scope.
    queryKey: [...ADMIN_NAVIGATION_COUNTS_KEY, account?.email, roles, account?.facilityId],
    queryFn: ({ signal }) => getAdminNavigationCounts(signal),
    enabled: Boolean(account && canRead),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: false,
  });
}
