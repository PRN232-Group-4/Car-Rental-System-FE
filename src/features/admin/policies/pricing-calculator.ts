import type { RentalPolicy, VehicleTypeOption } from "./types";

export interface PolicyPricingQuote {
  baseRental: number;
  vatRate: number;
  vatAmount: number;
  rentalWithVat: number;
  depositRate: number;
  depositAmount: number;
  totalEstimated: number;
}

export const SAMPLE_BASE_RENTAL = 2_700_000; // 30 giờ × 90.000đ theo DESIGN.md §23

/**
 * Tính bảng giá minh họa theo công thức chuẩn DESIGN.md B.§23
 */
export function calculateSampleQuote(
  vatRate: number,
  depositRate: number,
  baseRental: number = SAMPLE_BASE_RENTAL
): PolicyPricingQuote {
  const safeVatRate = Math.max(0, vatRate);
  const safeDepositRate = Math.max(0, depositRate);

  const vatAmount = Math.round(baseRental * (safeVatRate / 100));
  const rentalWithVat = baseRental + vatAmount;
  const depositAmount = Math.round(rentalWithVat * (safeDepositRate / 100));
  const totalEstimated = rentalWithVat + depositAmount;

  return {
    baseRental,
    vatRate: safeVatRate,
    vatAmount,
    rentalWithVat,
    depositRate: safeDepositRate,
    depositAmount,
    totalEstimated,
  };
}

/**
 * Tính giá quy đổi mỗi giờ cho gói thuê bao (price / includedHours)
 */
export function calculateHourlyRate(price: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round(price / hours);
}

export interface PolicyStatusByVehicleType {
  vehicleTypeId: number;
  vehicleTypeName: string;
  activeCount: number;
  activePolicies: RentalPolicy[];
  latestActivePolicy: RentalPolicy | null;
  hasConflict: boolean; // Nhiều hơn 1 active
  isMissing: boolean; // 0 active
}

/**
 * Kiểm tra trạng thái chính sách theo từng loại xe (phát hiện xung đột hoặc thiếu)
 */
export function auditPoliciesByVehicleType(
  policies: RentalPolicy[],
  vehicleTypes: VehicleTypeOption[]
): PolicyStatusByVehicleType[] {
  return vehicleTypes.map((vt) => {
    const matching = policies.filter((p) => p.vehicleTypeId === vt.id);
    const active = matching
      .filter((p) => p.isActive)
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return timeB - timeA;
      });

    const activeCount = active.length;
    const latestActivePolicy = active[0] ?? null;

    return {
      vehicleTypeId: vt.id,
      vehicleTypeName: vt.name,
      activeCount,
      activePolicies: active,
      latestActivePolicy,
      hasConflict: activeCount > 1,
      isMissing: activeCount === 0,
    };
  });
}
