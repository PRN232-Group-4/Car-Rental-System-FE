import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

export interface StaffAccountOption {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  staffId: number | null;
}

export function hasDriverRole(roles: readonly string[] = []): boolean {
  return roles.some((role) => role.trim().toLowerCase() === "driver");
}

export async function getStaffAccountOptions(): Promise<StaffAccountOption[]> {
  const users: StaffAccountOption[] = [];
  for (let page = 1; ; page += 1) {
    const result = await backendApiClient.get<PagedResult<StaffAccountOption>>("users", { page, pageSize: 100 });
    const items = result.items ?? [];
    users.push(...items);
    if (!items.length || users.length >= result.totalCount) break;
  }
  return users.sort((a, b) => a.email.localeCompare(b.email));
}
