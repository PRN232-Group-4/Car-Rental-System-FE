import { defaultApiClient } from "@/api/default-api-client";
import { ApiClientError } from "@/api/api-client";
import { CustomerLicense, SaveLicensePayload } from "./types";

export async function getCustomerLicense(): Promise<CustomerLicense | null> {
  try {
    const res = await defaultApiClient.get<CustomerLicense>("customer/license");
    return res;
  } catch (error) {
    // No license on record is a legitimate "not set" state; anything else is a real error.
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function saveCustomerLicense(payload: SaveLicensePayload): Promise<CustomerLicense> {
  const form = new FormData();
  if (payload.licenseId != null) form.append("LicenseId", String(payload.licenseId));
  form.append("Number", payload.number);
  form.append("Type", payload.type);
  form.append("IssueDate", payload.issueDate);
  form.append("ExpiryDate", payload.expiryDate);
  form.append("File", payload.file);
  // ApiClient leaves Content-Type to the browser, including the multipart boundary.
  const res = await defaultApiClient.put<CustomerLicense>("customer/license", form);
  return res;
}
