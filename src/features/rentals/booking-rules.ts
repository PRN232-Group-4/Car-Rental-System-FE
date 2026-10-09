import type { RentalPolicy } from "./types";

export function selectBookingPolicy(policies: RentalPolicy[], vehicleTypeId?: number) {
  const active = policies.filter((policy) => policy.isActive);
  const matching = active.filter((policy) => policy.vehicleTypeId === vehicleTypeId);
  return [...(matching.length ? matching : active.filter((policy) => policy.vehicleTypeId === null))]
    .sort((a, b) => b.id - a.id)[0];
}

export function calculateHourlyEstimate(price: number, hours: number, policy: RentalPolicy) {
  const rentalFee = price * hours;
  const vat = rentalFee * policy.vatRate / 100;
  const total = rentalFee + vat;
  const deposit = total * policy.depositPercentage / 100;
  return { rentalFee, vat, deposit, total: total + deposit };
}

export function validateBookingTimes(startTime: string, endTime: string) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return {
    startTime: !Number.isFinite(start) ? "Vui lòng chọn ngày và giờ nhận xe hợp lệ." : undefined,
    endTime: !Number.isFinite(end) ? "Vui lòng chọn ngày và giờ trả xe hợp lệ." :
      end <= start ? "Giờ trả xe phải sau giờ nhận xe. Vui lòng chọn lại." : undefined,
  };
}

export function isSafeContractLink(value: string) {
  try { return ["http:", "https:"].includes(new URL(value).protocol); }
  catch { return false; }
}

export function localDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
