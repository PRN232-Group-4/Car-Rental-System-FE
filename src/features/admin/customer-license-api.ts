import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "./api";

export interface CustomerLicenseSummary {
  id: number;
  userId: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  licenseStatus: string | null;
}

export interface ReviewableLicense {
  number: string | null;
  type: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  imageUrl: string | null;
  status: string | null;
}

export interface CustomerLicenseDetail extends CustomerLicenseSummary {
  license: ReviewableLicense | null;
}

/** Fetch every backend page so client-side status filtering includes all customers. */
export async function getCustomerLicenses(search = ""): Promise<CustomerLicenseSummary[]> {
  const records: CustomerLicenseSummary[] = [];
  let page = 1;
  while (true) {
    const result = await backendApiClient.get<PagedResult<CustomerLicenseSummary>>("customers", {
      Search: search.trim() || undefined, Page: page, PageSize: 100,
    });
    const items = result.items ?? [];
    records.push(...items);
    if (!items.length || records.length >= result.totalCount) break;
    page += 1;
  }
  return records;
}

export function getCustomerLicenseDetail(customerId: number) {
  return backendApiClient.get<CustomerLicenseDetail>(`customers/${customerId}`);
}

export function reviewCustomerLicense(customerId: number, status: string) {
  return backendApiClient.put<ReviewableLicense>(`customers/${customerId}/license-status`, { status });
}

export const licenseStatusLabels: Record<string, string> = {
  pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", expired: "Hết hạn",
  none: "Chưa cập nhật", incomplete: "Chưa cập nhật",
};
export function normalizeLicenseStatus(status: string | null | undefined) {
  return status?.trim().toLowerCase() || "none";
}
export function licenseStatusLabel(status: string | null | undefined) {
  return licenseStatusLabels[normalizeLicenseStatus(status)] ?? "Trạng thái chưa xác định";
}

export function filterCustomerLicenses(records: CustomerLicenseSummary[], status: string) {
  return status ? records.filter((record) => {
    const value = normalizeLicenseStatus(record.licenseStatus);
    return status === "none" ? value === "none" || value === "incomplete" : value === status;
  }) : records;
}
