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

export function getAccountProfile() {
  return backendApiClient.get<AccountProfile>("account/profile");
}

export function updateAccountProfile(body: { fullName: string; gender: string; phone: string }) {
  return backendApiClient.put<AccountProfile>("account/profile", body);
}

export function getCustomerLicense() {
  return backendApiClient.get<CustomerLicense | null>("customer/license");
}

export function updateCustomerLicense(body: LicenseRequest) {
  return backendApiClient.put<CustomerLicense>("customer/license", body);
}

export function uploadLicenseImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return backendApiClient.post<unknown>("media/vehicle", form);
}
