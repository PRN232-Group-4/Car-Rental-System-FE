import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiStrip } from "@/features/admin/dashboard/components/KpiStrip";
import { FleetStatusChart } from "@/features/admin/dashboard/components/FleetStatusChart";
import { MaintenanceVsRevenueChart } from "@/features/admin/dashboard/components/MaintenanceVsRevenueChart";
import { PlanUsageChart } from "@/features/admin/dashboard/components/PlanUsageChart";
import { TopVehiclesTable } from "@/features/admin/dashboard/components/TopVehiclesTable";
import type { DashboardKpis, FleetStatus } from "@/features/admin/dashboard/types";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const MOCK_KPIS: DashboardKpis = {
  revenue: { value: 345_600_000, previous: 308_000_000 },
  completedRentals: { value: 142, previous: 125 },
  rentingVehicles: { value: 18, previous: 15 },
  totalVehicles: { value: 45, previous: 42 },
  utilizationRate: { value: 72.5, previous: 66.8 },
  maintenanceCost: { value: 18_400_000, previous: 22_100_000 },
  activeSubscriptions: { value: 127, previous: 110 },
};

const MOCK_FLEET: FleetStatus = {
  available: 21,
  renting: 18,
  maintenance: 4,
  inactive: 2,
};

describe("Dashboard Widgets Components", () => {
  describe("KpiStrip", () => {
    it("hiển thị đúng 6 chỉ số KPI kèm phần trăm so sánh", () => {
      render(
        <KpiStrip
          data={MOCK_KPIS}
          isLoading={false}
          isError={false}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText("Doanh thu")).toBeInTheDocument();
      expect(screen.getByText("345.6 tr đ")).toBeInTheDocument();
      expect(screen.getByText("Đơn hoàn tất")).toBeInTheDocument();
      expect(screen.getByText("142")).toBeInTheDocument();
      expect(screen.getByText("18 / 45")).toBeInTheDocument();
      expect(screen.getByText("72.5%")).toBeInTheDocument();
      expect(screen.getByText("18.4 tr đ")).toBeInTheDocument();
      expect(screen.getByText("127")).toBeInTheDocument();
    });

    it("hiển thị trạng thái lỗi và nút Thử lại", () => {
      const onRetryMock = vi.fn();
      render(
        <KpiStrip
          isLoading={false}
          isError={true}
          onRetry={onRetryMock}
        />
      );

      expect(screen.getByText(/Không thể tải dữ liệu chỉ số KPI/i)).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /Thử lại/i });
      fireEvent.click(retryBtn);
      expect(onRetryMock).toHaveBeenCalled();
    });
  });

  describe("FleetStatusChart", () => {
    it("hiển thị phân bổ đội xe và cho phép chuyển đổi xem dạng bảng", () => {
      render(
        <FleetStatusChart
          data={MOCK_FLEET}
          isLoading={false}
          isError={false}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText("Tình trạng đội xe")).toBeInTheDocument();
      expect(screen.getByText("Sẵn sàng đón khách")).toBeInTheDocument();
      expect(screen.getByText("21")).toBeInTheDocument();

      // Nút chuyển sang dạng bảng (a11y)
      const tableBtn = screen.getByRole("button", { name: /Chuyển sang xem dạng bảng/i });
      expect(tableBtn).toBeInTheDocument();
      fireEvent.click(tableBtn);

      // Bảng hiển thị
      expect(screen.getByText("Bảng số liệu cho Tình trạng đội xe")).toBeInTheDocument();
    });
  });

  describe("MaintenanceVsRevenueChart", () => {
    it("phát hiện và hiển thị cảnh báo khi chi phí bảo dưỡng vượt doanh thu", () => {
      const mockData = [
        { vehicleId: 1, name: "VinFast VF 8", maintenanceCost: 2000000, revenue: 45000000, isHighCost: false },
        { vehicleId: 2, name: "Kia Carnival Cũ", maintenanceCost: 15000000, revenue: 10000000, isHighCost: true },
      ];

      render(
        <MaintenanceVsRevenueChart
          data={mockData}
          isLoading={false}
          isError={false}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Phát hiện 1 phương tiện có chi phí bảo dưỡng vượt doanh thu/i)).toBeInTheDocument();
      expect(screen.getByText(/Kia Carnival Cũ/i)).toBeInTheDocument();
    });
  });

  describe("PlanUsageChart", () => {
    it("hiển thị danh sách tiến độ sử dụng giờ của các gói hội viên", () => {
      const mockPlans = [
        { planId: 1, name: "Gói Đô Thị", usedHours: 250, includedHours: 300, activeSubscribers: 42, usagePercentage: 83.3 },
      ];

      render(
        <PlanUsageChart
          data={mockPlans}
          isLoading={false}
          isError={false}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText("Gói Đô Thị")).toBeInTheDocument();
      expect(screen.getByText(/42 hội viên/i)).toBeInTheDocument();
      expect(screen.getByText("83.3%")).toBeInTheDocument();
    });
  });

  describe("TopVehiclesTable", () => {
    it("hiển thị danh sách top xe hiệu quả", () => {
      const mockVehicles = [
        { vehicleId: 1, name: "VinFast VF 8 Plus", category: "SUV Điện", revenue: 48000000, rentals: 22, hours: 380, utilization: 84 },
      ];

      render(
        <TopVehiclesTable
          data={mockVehicles}
          isLoading={false}
          isError={false}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText("VinFast VF 8 Plus")).toBeInTheDocument();
      expect(screen.getByText("SUV Điện")).toBeInTheDocument();
      expect(screen.getByText("48.000.000 đ")).toBeInTheDocument();
      expect(screen.getByText("22 lượt")).toBeInTheDocument();
    });
  });
});
