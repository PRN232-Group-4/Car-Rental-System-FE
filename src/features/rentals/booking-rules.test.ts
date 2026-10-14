import { describe, expect, it } from "vitest";
import { calculateHourlyEstimate, isSafeContractLink, selectBookingPolicy, validateBookingTimes } from "./booking-rules";
import type { RentalPolicy } from "./types";

const policy: RentalPolicy = { id: 1, vehicleTypeId: null, name: "Chung", isActive: true, vatRate: 8, depositPercentage: 20, overtimeFeeRate: 0 };
describe("Booking business rules", () => {
  it("uses the latest active policy for the vehicle type, before global fallback", () => {
    const policies = [policy, { ...policy, id: 2, vehicleTypeId: 6 }, { ...policy, id: 3, vehicleTypeId: 6 }, { ...policy, id: 4, vehicleTypeId: 6, isActive: false }];
    expect(selectBookingPolicy(policies, 6)?.id).toBe(3);
    expect(selectBookingPolicy(policies, 9)?.id).toBe(1);
    expect(selectBookingPolicy([{ ...policy, vehicleTypeId: 8 }], 6)).toBeUndefined();
  });
  it("calculates VAT and refundable deposit from API percentages without driver surcharges", () => {
    expect(calculateHourlyEstimate(120000, 2.5, policy)).toEqual({ rentalFee: 300000, vat: 24000, deposit: 64800, total: 388800 });
    expect(calculateHourlyEstimate(120000, 1, { ...policy, vatRate: 0, depositPercentage: 0 }).total).toBe(120000);
  });
  it("rejects missing, invalid, equal and reversed dates without imposing a minimum duration", () => {
    expect(validateBookingTimes("", "invalid")).toMatchObject({ startTime: expect.any(String), endTime: expect.any(String) });
    expect(validateBookingTimes("2026-10-10T08:00", "2026-10-10T08:00").endTime).toBeTruthy();
    expect(validateBookingTimes("2026-10-10T08:00", "2026-10-09T08:00").endTime).toBeTruthy();
    expect(validateBookingTimes("2026-10-10T08:00", "2026-10-10T08:30").endTime).toBeUndefined();
  });
  it("never opens executable contract URLs", () => {
    expect(isSafeContractLink("https://example.com/contract.pdf")).toBe(true);
    expect(isSafeContractLink("javascript:alert(1)")).toBe(false);
    expect(isSafeContractLink("data:text/html,test")).toBe(false);
  });
});
