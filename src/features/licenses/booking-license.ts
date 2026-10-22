import type { CustomerLicense } from "./types";

/** New customers can have a pending placeholder record with no license number. */
export function hasCustomerLicense(license: (Omit<CustomerLicense, "status"> & { status?: string | null }) | null | undefined): boolean {
  return Boolean(license?.number?.trim()) && license?.status !== "none";
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
