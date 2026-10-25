import { describe, expect, it } from "vitest";
import { calculateHourlyEstimate } from "@/features/rentals/booking-rules";
import type { RentalPolicy } from "@/features/rentals/types";

/**
 * Đối chiếu công thức giá FE ↔ BE.
 *
 * Con số dưới đây lấy đúng theo kịch bản backend `Scenarios.CreateDirectRentalAsync`
 * (tests/VehicleRental.Tests/Scenarios.cs): đơn giá 100, thuê 2 giờ, VAT 10%, cọc 20%
 * ⇒ tiền thuê 200, VAT 20, cọc 40, hóa đơn 260.
 * Nếu backend đổi công thức, test này phải đổi theo — đó là mục đích của nó.
 */
const policy: RentalPolicy = {
  id: 1,
  vehicleTypeId: null,
  name: "Default",
  vatRate: 10,
  depositPercentage: 20,
  overtimeFeeRate: 0,
  isActive: true,
};

describe("Đối chiếu công thức tiền thuê và tiền cọc giữa FE và BE", () => {
  it("khớp kịch bản backend: 100/giờ × 2 giờ, VAT 10%, cọc 20%", () => {
    expect(calculateHourlyEstimate(100, 2, policy)).toEqual({
      rentalFee: 200,
      vat: 20,
      deposit: 40,
      total: 260,
    });
  });

  it("tiền cọc không tính trên VAT", () => {
    const withoutVat = calculateHourlyEstimate(100, 2, { ...policy, vatRate: 0 });
    const withVat = calculateHourlyEstimate(100, 2, policy);
    expect(withoutVat.deposit).toBe(40);
    expect(withVat.deposit).toBe(40);
    expect(withVat.vat).toBe(20);
    expect(withVat.total - withoutVat.total).toBe(20);
  });

  it("tỷ lệ cọc và VAT bằng 0 thì tổng chỉ còn tiền thuê", () => {
    expect(calculateHourlyEstimate(150000, 3, { ...policy, vatRate: 0, depositPercentage: 0 })).toEqual({
      rentalFee: 450000,
      vat: 0,
      deposit: 0,
      total: 450000,
    });
  });

  it("tổng dự toán = tiền thuê + VAT + cọc với tỷ lệ cọc tối đa", () => {
    const estimate = calculateHourlyEstimate(200000, 4, { ...policy, depositPercentage: 100 });
    expect(estimate).toEqual({ rentalFee: 800000, vat: 80000, deposit: 800000, total: 1680000 });
    expect(estimate.total).toBe(estimate.rentalFee + estimate.vat + estimate.deposit);
  });
});
