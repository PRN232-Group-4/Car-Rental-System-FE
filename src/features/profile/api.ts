import { backendApiClient } from "@/api/backend-api-client";
import type { components } from "@/api/generated/schema";

export type AccountProfile = components["schemas"]["AccountResponse"];

export interface CustomerLicense {
  number: string | null;
  type: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  imageUrl: string | null;
  status: string | null;
}

export interface LicenseRequest {
  number: string;
  type: string;
  issueDate: string | null;
  expiryDate: string;
  imageUrl: string;
}

/**
 * Hồ sơ tài khoản dùng cho các portal (admin/staff) và trang /profile.
 * Cố ý dùng backendApiClient (không mock): portal cần dữ liệu thật để phân quyền.
 */
export function getAccountProfile() {
  return backendApiClient.get<AccountProfile>("account/profile");
}

export function initialsFor(name: string | null | undefined): string {
  return (name ?? "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();
}

/** Admin, Manager, hoặc Staff không thuộc phòng Driver (tài xế về /staff) → được vào /admin. */
export function isAdminOrStaffAccount(account: AccountProfile): boolean {
  const roles = (account.roles ?? []).map((role) => role.toLocaleLowerCase());
  if (roles.includes("admin") || roles.includes("manager")) return true;
  if (
    !roles.some((role) =>
      ["staff", "driver", "customerservice", "maintenance"].includes(role),
    )
  ) {
    return false;
  }
  return (account.departmentName ?? "").trim().toLocaleLowerCase() !== "driver";
}

export function updateAccountProfile(body: { fullName: string; gender: string; phone: string }) {
  return backendApiClient.put<AccountProfile>("account/profile", body);
}

export function getCustomerLicense() {
  return backendApiClient.get<CustomerLicense | null>("customer/license");
}

export function updateCustomerLicense(body: LicenseRequest) {
  return backendApiClient.put<CustomerLicense>("customer/license/url", body);
}

export function uploadLicenseImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return backendApiClient.post<unknown>("media/vehicle", form);
}

/** Khách hàng thông thường (chỉ có role Customer, không phải Admin/Manager/Staff/Driver). */
export function isCustomerOnlyAccount(account: AccountProfile): boolean {
  const roles = (account.roles ?? []).map((role) => role.toLocaleLowerCase());
  if (roles.includes("admin") || roles.includes("manager") || roles.includes("staff") || roles.includes("driver")) {
    return false;
  }
  return roles.includes("customer");
}
