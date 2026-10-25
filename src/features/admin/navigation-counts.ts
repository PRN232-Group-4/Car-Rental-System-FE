import { backendApiClient } from "@/api/backend-api-client";

export interface AdminNavigationCounts {
  rentals: number;
  inspections: number;
  maintenance: number;
  reports: number;
  licenses: number;
}

export const ADMIN_NAVIGATION_COUNTS_KEY = ["admin-navigation-counts"] as const;

const routeCountKeys: Record<string, keyof AdminNavigationCounts> = {
  "/admin/rentals": "rentals",
  "/admin/inspections": "inspections",
  "/admin/maintenance": "maintenance",
  "/admin/reports": "reports",
  "/admin/customers": "licenses",
};

export function getAdminNavigationCounts(signal?: AbortSignal) {
  return backendApiClient.get<AdminNavigationCounts>("admin/navigation-counts", undefined, { signal });
}

/** Missing, invalid and unavailable counts must never look like new work. */
export function navigationCount(counts: AdminNavigationCounts | undefined, href: string): number {
  const key = routeCountKeys[href];
  const value = key ? counts?.[key] : undefined;
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;
}
