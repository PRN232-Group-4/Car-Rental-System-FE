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

  it("vẫn dự toán khi thuê kèm tài xế, không tự thêm dòng phí tài xế", () => {
    render(<PriceBreakdown {...baseProps} hasDriver policy={policy} />);

    expect(screen.queryByText(/Tài xế riêng/)).not.toBeInTheDocument();
    expect(panelText()).toMatch(/Tổng thanh toán dự kiến:[\s\S]{0,120}?260đ/);
  });

  it("cộng phí tài xế khi có dữ liệu và vẫn tính cọc trên cơ sở trước VAT", () => {
    render(<PriceBreakdown {...baseProps} hasDriver driverFeePerDay={50} policy={policy} />);
    const text = panelText();

    expect(text).toMatch(/Tài xế riêng \(1 ngày × 50đ\)50đ/);
    // (200 thuê + 50 tài xế) ⇒ VAT 25 · cọc 50 · tổng 325.
    expect(text).toMatch(/Thuế VAT \(10%\)25đ/);
    expect(text).toMatch(/Tiền đặt cọc hoàn lại \(20%\)[\s\S]{0,200}?50đ/);
    expect(text).toMatch(/Tổng thanh toán dự kiến:[\s\S]{0,120}?325đ/);
  });

  it("không tự bịa tỷ lệ khi chưa tải được chính sách", () => {
    render(<PriceBreakdown {...baseProps} policy={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("Chưa đủ bảng giá hoặc chính sách");
    expect(screen.queryByText(/Thuế VAT/)).not.toBeInTheDocument();
    expect(screen.queryByText(/8%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30%/)).not.toBeInTheDocument();
  });

  it("thuê dài hạn dùng số tháng làm tròn lên như backend", () => {
    // 800 giờ ⇒ ceil(800/720) = 2 tháng × 1000 = 2000 tiền thuê ⇒ VAT 200 · cọc 400 · tổng 2600.
    render(<PriceBreakdown {...baseProps} rentalType="longterm" hours={800} days={34} policy={policy} />);
    const text = panelText();

    expect(text).toMatch(/Tiền thuê xe \(2 tháng × 1\.000đ\)2\.000đ/);
    expect(text).toMatch(/Tổng thanh toán dự kiến:[\s\S]{0,120}?2\.600đ/);
  });

  it("thuê dài hạn chưa có đơn giá tháng thì không dự toán", () => {
    render(<PriceBreakdown {...baseProps} monthlyRate={0} rentalType="longterm" days={34} policy={policy} />);

    expect(screen.getByRole("status")).toHaveTextContent("Chưa đủ bảng giá hoặc chính sách");
  });
});
