import { describe, it, expect } from "vitest";
import {
  policySchema,
  planSchema,
  type RentalPolicy,
  type VehicleTypeOption,
} from "@/features/admin/policies/types";
import {
  calculateSampleQuote,
  calculateHourlyRate,
  auditPoliciesByVehicleType,
  SAMPLE_BASE_RENTAL,
} from "@/features/admin/policies/pricing-calculator";

describe("FE-14 Admin Policies & Plans — Unit & Calculator Tests", () => {
  describe("Zod Validation: policySchema", () => {
    it("chấp nhận dữ liệu hợp lệ", () => {
      const valid = {
        vehicleTypeId: 1,
        name: "Chính sách Ô tô Hè 2026",
        vatRate: 10,
        overtimeFeeRate: 15.5,
        depositPercentage: 10,
        isActive: true,
      };
      const res = policySchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("từ chối khi tỷ lệ phần trăm vượt quá 100% hoặc nhỏ hơn 0%", () => {
      const invalidOver = {
        vehicleTypeId: 1,
        name: "Chính sách Test",
        vatRate: 105,
        overtimeFeeRate: 15,
        depositPercentage: 10,
        isActive: true,
      };
      expect(policySchema.safeParse(invalidOver).success).toBe(false);

      const invalidUnder = {
        ...invalidOver,
        vatRate: -5,
      };
      expect(policySchema.safeParse(invalidUnder).success).toBe(false);
    });

    it("từ chối số thập phân có hơn 2 chữ số (NUMERIC(5,2))", () => {
      const invalidDecimals = {
        vehicleTypeId: 1,
        name: "Chính sách Test",
        vatRate: 10.125, // 3 chữ số thập phân
        overtimeFeeRate: 15,
        depositPercentage: 10,
        isActive: true,
      };
      const res = policySchema.safeParse(invalidDecimals);
      expect(res.success).toBe(false);
    });

    it("từ chối tên chính sách quá ngắn hoặc quá dài", () => {
      expect(
        policySchema.safeParse({
          vehicleTypeId: 1,
          name: "AB", // < 3 ký tự
          vatRate: 10,
          overtimeFeeRate: 15,
          depositPercentage: 10,
          isActive: true,
        }).success
      ).toBe(false);

      expect(
        policySchema.safeParse({
          vehicleTypeId: 1,
          name: "A".repeat(125), // > 120 ký tự
          vatRate: 10,
          overtimeFeeRate: 15,
          depositPercentage: 10,
          isActive: true,
        }).success
      ).toBe(false);
    });
  });

  describe("Zod Validation: planSchema", () => {
    it("chấp nhận gói thuê bao hợp lệ", () => {
      const validPlan = {
        name: "Gói Đô Thị 30 Ngày",
        description: "Dành cho khách hàng di chuyển hàng ngày",
        price: 1500000,
        durationDays: 30,
        includedHours: 20,
        isActive: true,
      };
      const res = planSchema.safeParse(validPlan);
      expect(res.success).toBe(true);
    });

    it("bắt buộc giá và giờ là số nguyên dương trong giới hạn", () => {
      const floatPrice = {
        name: "Gói Lỗi",
        price: 1200000.5,
        durationDays: 30,
        includedHours: 10,
        isActive: true,
      };
      expect(planSchema.safeParse(floatPrice).success).toBe(false);

      const excessHours = {
        name: "Gói Lỗi Giờ",
        price: 1200000,
        durationDays: 30,
        includedHours: 2500, // > 2000
        isActive: true,
      };
      expect(planSchema.safeParse(excessHours).success).toBe(false);
    });
  });

  describe("calculateHourlyRate", () => {
    it("tính chính xác giá quy đổi mỗi giờ", () => {
      expect(calculateHourlyRate(1000000, 10)).toBe(100000);
      expect(calculateHourlyRate(2490000, 35)).toBe(71143);
    });

    it("xử lý an toàn khi số giờ <= 0", () => {
      expect(calculateHourlyRate(1000000, 0)).toBe(0);
      expect(calculateHourlyRate(1000000, -5)).toBe(0);
    });
  });

  describe("calculateSampleQuote — Công thức chuẩn DESIGN.md B.§23", () => {
    it("tính khớp từng dòng cho đơn mẫu 2.700.000đ với VAT 10% và cọc 10%", () => {
      // Tiền thuê mẫu: 2.700.000đ
      // VAT (10%): 270.000đ -> Tiền sau VAT: 2.970.000đ
      // Đặt cọc (10% của 2.970.000đ): 297.000đ
      // Tổng cộng: 2.970.000đ + 297.000đ = 3.267.000đ
      const quote = calculateSampleQuote(10, 10, SAMPLE_BASE_RENTAL);

      expect(quote.baseRental).toBe(2700000);
      expect(quote.vatRate).toBe(10);
      expect(quote.vatAmount).toBe(270000);
      expect(quote.rentalWithVat).toBe(2970000);
      expect(quote.depositRate).toBe(10);
      expect(quote.depositAmount).toBe(297000);
      expect(quote.totalEstimated).toBe(3267000);
    });

    it("tính đúng khi VAT 8% và cọc 5%", () => {
      // Base: 2.700.000
      // VAT: 8% = 216.000 -> rentalWithVat: 2.916.000
      // Deposit: 5% = 145.800
      // Total: 2.916.000 + 145.800 = 3.061.800
      const quote = calculateSampleQuote(8, 5, SAMPLE_BASE_RENTAL);

      expect(quote.vatAmount).toBe(216000);
      expect(quote.depositAmount).toBe(145800);
      expect(quote.totalEstimated).toBe(3061800);
    });
  });

  describe("auditPoliciesByVehicleType — Phát hiện xung đột & thiếu chính sách", () => {
    const vehicleTypes: VehicleTypeOption[] = [
      { id: 1, name: "Ô tô xăng" },
      { id: 2, name: "Xe máy xăng" },
      { id: 3, name: "Xe điện" },
    ];

    it("phát hiện xung đột khi có nhiều hơn 1 active policy cho một loại xe", () => {
      const mockPolicies: RentalPolicy[] = [
        {
          id: 1,
          vehicleTypeId: 1,
          name: "Bản Cũ",
          vatRate: 10,
          overtimeFeeRate: 15,
          depositPercentage: 10,
          isActive: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
        {
          id: 2,
          vehicleTypeId: 1,
          name: "Bản Mới",
          vatRate: 10,
          overtimeFeeRate: 12,
          depositPercentage: 10,
          isActive: true,
          createdAt: "2026-02-01T00:00:00Z",
        },
        {
          id: 3,
          vehicleTypeId: 2,
          name: "Bản Xe Máy",
          vatRate: 8,
          overtimeFeeRate: 10,
          depositPercentage: 5,
          isActive: true,
        },
      ];

      const audits = auditPoliciesByVehicleType(mockPolicies, vehicleTypes);

      // Loại xe 1 có 2 active -> xung đột
      const otoAudit = audits.find((a) => a.vehicleTypeId === 1);
      expect(otoAudit?.hasConflict).toBe(true);
      expect(otoAudit?.activeCount).toBe(2);
      // Hệ thống chọn bản mới nhất (id: 2 tạo ngày 2026-02-01)
      expect(otoAudit?.latestActivePolicy?.id).toBe(2);

      // Loại xe 2 có 1 active -> bình thường
      const xeMayAudit = audits.find((a) => a.vehicleTypeId === 2);
      expect(xeMayAudit?.hasConflict).toBe(false);
      expect(xeMayAudit?.isMissing).toBe(false);

      // Loại xe 3 có 0 active -> thiếu (blocking)
      const xeDienAudit = audits.find((a) => a.vehicleTypeId === 3);
      expect(xeDienAudit?.hasConflict).toBe(false);
      expect(xeDienAudit?.isMissing).toBe(true);
      expect(xeDienAudit?.latestActivePolicy).toBeNull();
    });
  });
});
