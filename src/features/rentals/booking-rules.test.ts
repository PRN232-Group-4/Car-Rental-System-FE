import { describe, expect, it } from "vitest";
import { BOOKING_MINIMUM_LEAD_MINUTES, calculateHourlyEstimate, earliestBookingStart, isSafeContractLink, selectBookingPolicy, validateBookingTimes } from "./booking-rules";
import type { RentalPolicy } from "./types";

const policy: RentalPolicy = { id: 1, vehicleTypeId: null, name: "Chung", isActive: true, vatRate: 8, depositPercentage: 20, overtimeFeeRate: 0 };
const now = new Date("2026-10-10T07:00:00Z");
describe("Booking business rules", () => {
  it("uses the latest active policy for the vehicle type, before global fallback", () => {
    const policies = [policy, { ...policy, id: 2, vehicleTypeId: 6 }, { ...policy, id: 3, vehicleTypeId: 6 }, { ...policy, id: 4, vehicleTypeId: 6, isActive: false }];
    expect(selectBookingPolicy(policies, 6)?.id).toBe(3);
    expect(selectBookingPolicy(policies, 9)?.id).toBe(1);
    expect(selectBookingPolicy([{ ...policy, vehicleTypeId: 8 }], 6)).toBeUndefined();
  });
  it("calculates VAT and refundable deposit from API percentages without driver surcharges", () => {
    // Cọc tính trên tiền thuê (chưa gồm VAT) để khớp hóa đơn backend: 300.000 × 8% = 24.000 VAT, cọc 300.000 × 20% = 60.000.
    expect(calculateHourlyEstimate(120000, 2.5, policy)).toEqual({ rentalFee: 300000, vat: 24000, deposit: 60000, total: 384000 });
    expect(calculateHourlyEstimate(120000, 1, { ...policy, vatRate: 0, depositPercentage: 0 }).total).toBe(120000);
    // Cọc không phụ thuộc VAT: đổi VAT chỉ đổi VAT, không đổi cọc.
    expect(calculateHourlyEstimate(100000, 2, { ...policy, vatRate: 10 }).deposit).toBe(40000);
    expect(calculateHourlyEstimate(100000, 2, { ...policy, vatRate: 0 }).deposit).toBe(40000);
  });
  it("rejects missing, invalid, equal and reversed dates without imposing a minimum duration", () => {
    expect(validateBookingTimes("", "invalid", now)).toMatchObject({ startTime: expect.any(String), endTime: expect.any(String) });
    expect(validateBookingTimes("2026-10-10T08:00", "2026-10-10T08:00", now).endTime).toBeTruthy();
    expect(validateBookingTimes("2026-10-10T08:00", "2026-10-09T08:00", now).endTime).toBeTruthy();
    expect(validateBookingTimes("2026-10-10T08:00", "2026-10-10T08:30", now).endTime).toBeUndefined();
  });
  it("requires the pickup time to stay at least one hour ahead of the booking moment", () => {
    // `datetime-local` là giờ tường địa phương nên giá trị kiểm thử được sinh từ chính mốc `now`.
    const localInput = (date: Date) => {
      const pad = (part: number) => String(part).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const at = (offsetMinutes: number) => localInput(new Date(now.getTime() + offsetMinutes * 60_000));

    expect(BOOKING_MINIMUM_LEAD_MINUTES).toBe(60);
    expect(earliestBookingStart(now).toISOString()).toBe(new Date(now.getTime() + 3_600_000).toISOString());
    expect(validateBookingTimes(at(59), at(180), now).startTime).toMatch(/ít nhất 60 phút/);
    expect(validateBookingTimes(at(-60), at(180), now).startTime).toMatch(/ít nhất 60 phút/);
    expect(validateBookingTimes(at(60), at(180), now).startTime).toBeUndefined();
    expect(validateBookingTimes(at(180), at(300), now).startTime).toBeUndefined();
  });
  it("never opens executable contract URLs", () => {
    expect(isSafeContractLink("https://example.com/contract.pdf")).toBe(true);
    expect(isSafeContractLink("javascript:alert(1)")).toBe(false);
    expect(isSafeContractLink("data:text/html,test")).toBe(false);
  });
});
