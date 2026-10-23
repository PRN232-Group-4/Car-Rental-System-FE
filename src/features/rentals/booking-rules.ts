import { toLocalInputValue } from "@/lib/time";
import type { RentalPolicy } from "./types";

export function selectBookingPolicy(policies: RentalPolicy[], vehicleTypeId?: number) {
  const active = policies.filter((policy) => policy.isActive);
  const matching = active.filter((policy) => policy.vehicleTypeId === vehicleTypeId);
  return [...(matching.length ? matching : active.filter((policy) => policy.vehicleTypeId === null))]
    .sort((a, b) => b.id - a.id)[0];
}

/**
 * Công thức giá dùng chung với backend (`NpgsqlOperationsRepository.CreateRentalAsync`):
 * tiền thuê = đơn giá × số giờ; VAT = tiền thuê × vat_rate%; cọc = tiền thuê × deposit_percentage%.
 * Tiền cọc KHÔNG tính trên VAT — nếu tính gộp VAT thì bản dự toán của khách cao hơn hóa đơn thật.
 */
export function calculateHourlyEstimate(price: number, hours: number, policy: RentalPolicy) {
  const rentalFee = price * hours;
  const vat = rentalFee * policy.vatRate / 100;
  const deposit = rentalFee * policy.depositPercentage / 100;
  return { rentalFee, vat, deposit, total: rentalFee + vat + deposit };
}

/**
 * FR-042: giờ nhận xe phải cách thời điểm đặt tối thiểu một giờ.
 * BE cũng chặn cùng ngưỡng này và trả `RENTAL_START_TIME_TOO_SOON`.
 */
export const BOOKING_MINIMUM_LEAD_MINUTES = 60;

/** Thời điểm sớm nhất được phép chọn làm giờ nhận xe. */
export function earliestBookingStart(now: Date = new Date()): Date {
  return new Date(now.getTime() + BOOKING_MINIMUM_LEAD_MINUTES * 60_000);
}

export function validateBookingTimes(startTime: string, endTime: string, now: Date = new Date()) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const earliest = earliestBookingStart(now).getTime();
  return {
    startTime: !Number.isFinite(start) ? "Vui lòng chọn ngày và giờ nhận xe hợp lệ." :
      start < earliest
        ? `Giờ nhận xe phải cách thời điểm đặt ít nhất ${BOOKING_MINIMUM_LEAD_MINUTES} phút. Vui lòng chọn giờ nhận xe muộn hơn.`
        : undefined,
    endTime: !Number.isFinite(end) ? "Vui lòng chọn ngày và giờ trả xe hợp lệ." :
      end <= start ? "Giờ trả xe phải sau giờ nhận xe. Vui lòng chọn lại." : undefined,
  };
}

export function isSafeContractLink(value: string) {
  try { return ["http:", "https:"].includes(new URL(value).protocol); }
  catch { return false; }
}

/** Wall-clock GMT+7 value for a `datetime-local` input, independent of the browser time zone. */
export function localDateTime(date: Date) {
  return toLocalInputValue(date);
}
