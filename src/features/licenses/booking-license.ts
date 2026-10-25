import type { CustomerLicense } from "./types";

/** New customers can have a pending placeholder record with no license number. */
export function hasCustomerLicense(license: (Omit<CustomerLicense, "status"> & { status?: string | null }) | null | undefined): boolean {
  return Boolean(license?.number?.trim()) && license?.status !== "none";
}

export function customerLicenses(license: CustomerLicense | null | undefined): CustomerLicense[] {
  return (license?.licenses?.length ? license.licenses : license ? [license] : []).filter(hasCustomerLicense);
}

/** Match explicit vehicle configuration; no inferred hierarchy between license classes. */
export function matchingCustomerLicenses(license: CustomerLicense | null | undefined, allowedTypes: string[] = [], throughDate?: string): CustomerLicense[] {
  const allowed = allowedTypes.map((type) => type.trim().toUpperCase());
  const endDate = throughDate?.slice(0, 10);
  return customerLicenses(license).filter((item) =>
    (!allowed.length || allowed.includes(item.type?.trim().toUpperCase() ?? "")) &&
    (!endDate || Boolean(item.expiryDate && item.expiryDate.slice(0, 10) >= endDate)));
}

export function bookingLicenseHref(bookingPath: string): string {
  return `/driver-license?returnTo=${encodeURIComponent(bookingPath)}`;
}

/** Only allow returning to the booking page, never an arbitrary redirect target. */
export function getBookingReturnPath(value: string | null): string | null {
  if (!value?.startsWith("/booking")) return null;
  try {
    const target = new URL(value, "https://booking.local");
    return target.origin === "https://booking.local" && target.pathname === "/booking"
      ? `${target.pathname}${target.search}`
      : null;
  } catch {
    return null;
  }
}
