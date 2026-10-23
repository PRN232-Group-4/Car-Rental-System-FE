export type LicenseStatus = "pending" | "approved" | "rejected" | "none";

export interface CustomerLicense {
  id?: number | null;
  licenses?: CustomerLicense[];
  number?: string | null;
  type?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  imageUrl?: string | null;
  /** Known values are typed for autocomplete; BE may return others. */
  status: LicenseStatus | (string & {});
}

export interface SaveLicensePayload {
  licenseId?: number | null;
  number: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  file: File;
}
