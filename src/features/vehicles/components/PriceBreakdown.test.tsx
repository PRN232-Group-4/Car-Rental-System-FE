import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PriceBreakdown } from "./PriceBreakdown";
import { RentalPolicyPanel } from "./RentalPolicyPanel";
import { formatVnd } from "@/lib/format";

const policy = { id: 1, name: "Theo API", vehicleTypeId: null, vatRate: 10, depositPercentage: 20, overtimeFeeRate: 15, isActive: true };
const props = { hourlyRate: 100000, hours: 2, days: 1, hasDriver: false, rentalType: "hourly" as const };
afterEach(cleanup);

describe("real pricing and policy data", () => {
  it("shows unavailable instead of inventing VAT and deposit without a policy", () => {
    render(<PriceBreakdown {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent("Chưa đủ bảng giá hoặc chính sách");
    expect(screen.queryByText(/Thuế VAT/)).not.toBeInTheDocument();
  });
  it("does not invent a driver fee or monthly discount", () => {
    const { rerender } = render(<PriceBreakdown {...props} policy={policy} hasDriver />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<PriceBreakdown {...props} policy={policy} rentalType="longterm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
  it("uses supplied zero fees and zero VAT without replacing them", () => {
    render(<PriceBreakdown {...props} policy={{ ...policy, vatRate: 0, depositPercentage: 0 }} hasDriver driverFeePerDay={0} />);
    expect(screen.getByText("Thuế VAT (0%)")).toBeInTheDocument();
    expect(screen.getAllByText(formatVnd(200000)).length).toBeGreaterThan(0);
  });
  it("calculates from actual prices and policy", () => {
    render(<PriceBreakdown {...props} policy={policy} />);
    // Backend: cọc = tiền thuê × 20% (không gồm VAT) ⇒ 200.000 + 20.000 + 40.000 = 260.000.
    // Xem docs/rental-deposit-penalty-audit.md và RentalMoneyReconciliationTests phía backend.
    expect(screen.getByText(formatVnd(260000))).toBeInTheDocument();
    expect(screen.getByText("Thuế VAT (10%)")).toBeInTheDocument();
  });
  it("shows the overtime API rate as a percentage and no invented penalties", () => {
    render(<RentalPolicyPanel policy={policy} />);
    expect(screen.getByText("15% cộng vào đơn giá mỗi giờ quá hạn")).toBeInTheDocument();
    expect(screen.queryByText(/500.000|24 giờ|30%/)).not.toBeInTheDocument();
  });
  it("shows missing policy explicitly", () => {
    render(<RentalPolicyPanel />);
    expect(screen.getByRole("status")).toHaveTextContent("Chưa có chính sách");
  });
});
