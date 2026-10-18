import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "./api";
import type { LicenseStatus } from "@/features/licenses/types";

export interface CustomerListItem {
  id: number;
  userId: number;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  licenseStatus: LicenseStatus | (string & {});
  loyaltyPoint: number;
}

export interface CustomerListQuery {
  search?: string;
  isActive?: boolean;
  licenseStatus?: LicenseStatus;
  page: number;
  pageSize: number;
}

export function getCustomers(query: CustomerListQuery, signal?: AbortSignal) {
  return backendApiClient.get<PagedResult<CustomerListItem>>("customers", { ...query }, { signal });
}
