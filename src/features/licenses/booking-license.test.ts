import { describe, expect, it } from "vitest";
import { bookingLicenseHref, getBookingReturnPath, hasCustomerLicense } from "./booking-license";

describe("license check before booking", () => {
  it("detects both missing and pending placeholder licenses", () => {
    expect(hasCustomerLicense(null)).toBe(false);
    expect(hasCustomerLicense(undefined)).toBe(false);
    expect(hasCustomerLicense({ status: "pending", number: null })).toBe(false);
    expect(hasCustomerLicense({ status: "pending", number: "  " })).toBe(false);
    expect(hasCustomerLicense({ status: "none", number: "123" })).toBe(false);
  });

  it("keeps existing approval and expiry decisions separate from missing-license detection", () => {
    for (const status of ["approved", "pending", "rejected"]) {
      expect(hasCustomerLicense({ status, number: "123", expiryDate: "2020-01-01" })).toBe(true);
    }
  });

  it("preserves the booking query through the license update round trip", () => {
    const path = "/booking?mode=longterm&vehicleId=2&startTime=2026-10-20T08%3A00&facilityId=3";
    const link = new URL(bookingLicenseHref(path), "https://booking.local");
    expect(getBookingReturnPath(link.searchParams.get("returnTo"))).toBe(path);
    expect(getBookingReturnPath("/booking")).toBe("/booking");
  });

  it("rejects external URLs, executable URLs and unrelated internal paths", () => {
    for (const value of [null, "https://evil.test/booking", "//evil.test/booking", "javascript:alert(1)", "/admin", "/booking/../admin", "/booking-other"]) {
      expect(getBookingReturnPath(value)).toBeNull();
    }
  });
});
