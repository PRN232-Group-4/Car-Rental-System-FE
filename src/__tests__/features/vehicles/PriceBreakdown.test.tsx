import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PriceBreakdown } from "@/features/vehicles/components/PriceBreakdown";
import type { RentalPolicy } from "@/features/vehicles/types";

/**
 * Đối chiếu bảng dự toán trên trang chi tiết xe với công thức backend
 * (xem `docs/rental-deposit-penalty-audit.md`): thuê 2 giờ × 100, VAT 10%, cọc 20%
 * ⇒ 200 tiền thuê · 20 VAT · 40 cọc · 260 tổng dự kiến. Không có phụ phí tài xế.
 */
const policy: RentalPolicy = {
  id: 1,
  vehicleTypeId: null,
  name: "Chính sách chuẩn",
  vatRate: 10,
  overtimeFeeRate: 20,
  depositPercentage: 20,
  isActive: true,
} as RentalPolicy;

const baseProps = {
  hourlyRate: 100,
  monthlyRate: 1000,
  hours: 2,
  days: 1,
  hasDriver: false,
  rentalType: "hourly" as const,
};

/** Nội dung của cả bảng, đã nối nhãn với số tiền. */
const panelText = () => screen.getByTestId("price-breakdown").textContent ?? "";

describe("PriceBreakdown — đối chiếu với công thức backend", () => {
  afterEach(cleanup);

  it("tính tiền thuê, VAT, cọc và tổng theo đúng tỷ lệ chính sách", () => {
    render(<PriceBreakdown {...baseProps} policy={policy} />);
    const text = panelText();

    expect(text).toMatch(/Tiền thuê xe \(2h × 100đ\)200đ/);
    expect(text).toMatch(/Thuế VAT \(10%\)20đ/);
    expect(text).toMatch(/Tiền đặt cọc hoàn lại \(20%\)[\s\S]{0,200}?40đ/);
    expect(text).toMatch(/Tổng thanh toán dự kiến:[\s\S]{0,120}?260đ/);
  });

  it("không cộng phụ phí tài xế dù chọn thuê kèm tài xế", () => {
    render(<PriceBreakdown {...baseProps} hasDriver policy={policy} />);

    expect(screen.queryByText(/Tài xế riêng/)).not.toBeInTheDocument();
    expect(panelText()).toMatch(/Tổng thanh toán dự kiến:[\s\S]{0,120}?260đ/);
  });

  it("không tự bịa tỷ lệ khi chưa tải được chính sách", () => {
    render(<PriceBreakdown {...baseProps} policy={null} hasDriver />);
    const text = panelText();

    expect(screen.getByText(/Tạm tính tiền thuê:/)).toBeVisible();
    expect(text).toContain("Thuế VAT (theo chính sách)");
    expect(text).toContain("Tiền đặt cọc hoàn lại (theo chính sách)");
    expect(text).toContain("—");
    expect(text).toContain("Chưa tải được chính sách giá");
    // Không còn rơi về tỷ lệ mặc định tự đặt (8% VAT / 30% cọc).
    expect(text).not.toContain("8%");
    expect(text).not.toContain("30%");
    expect(text).toMatch(/Tiền thuê xe \(2h × 100đ\)200đ/);
  });

  it("thuê dài hạn dùng số tháng làm tròn lên như backend", () => {
    // 800 giờ ⇒ ceil(800/720) = 2 tháng × 1000 = 2000 tiền thuê.
    render(<PriceBreakdown {...baseProps} rentalType="longterm" hours={800} days={34} policy={policy} />);
    const text = panelText();

    expect(text).toMatch(/Tiền thuê xe \(800h × 100đ\)2\.000đ/);
    expect(text).toMatch(/Tổng thanh toán dự kiến:[\s\S]{0,120}?2\.600đ/);
  });
});
