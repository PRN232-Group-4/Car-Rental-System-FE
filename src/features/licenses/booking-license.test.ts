import { describe, expect, it } from "vitest";
import { bookingLicenseHref, getBookingReturnPath, hasCustomerLicense, matchingCustomerLicenses } from "./booking-license";

describe("license check before booking", () => {
  it("checks every independent license against explicit vehicle classes and rental end", () => {
    const licenses = [
      { number: "motorcycle", type: "A1", status: "approved", expiryDate: "2099-01-01" },
      { number: "car", type: " b2 ", status: "approved", expiryDate: "2027-01-01" },
      { number: "truck", type: "C", status: "pending", expiryDate: "2099-01-01" },
    ];
    const profile = { ...licenses[2], licenses };
    expect(matchingCustomerLicenses(profile, ["B2"], "2027-01-01T20:00")).toEqual([licenses[1]]);
    expect(matchingCustomerLicenses(profile, ["B2"], "2027-01-02")).toEqual([]);
    expect(matchingCustomerLicenses(profile, ["B"], "2026-01-01")).toEqual([]);
    expect(matchingCustomerLicenses(profile, ["C"], "2026-01-01")[0].status).toBe("pending");
    expect(matchingCustomerLicenses(profile, [], "2026-01-01")).toHaveLength(3);
  });
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
