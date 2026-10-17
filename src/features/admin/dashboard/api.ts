import { apiClient } from "@/api";
import { formatDate, nowGmt7, toUtcIso } from "@/lib/time";
import type {
  DashboardFilters,
  DashboardDatePreset,
  DashboardKpis,
  RevenuePoint,
  FleetStatus,
  RentalStatusCount,
  TopVehicleRow,
  MaintenanceVsRevenueRow,
  PlanUsageRow,
} from "./types";

/**
 * Tính toán mốc ngày bắt đầu và kết thúc theo preset GMT+7
 */
export function getPresetDateRange(preset: DashboardDatePreset): { from: string; to: string } {
  const now = nowGmt7();

  let fromDate: Date;
  const toDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (preset) {
    case "7d":
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
      break;
    case "30d":
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0);
      break;
    case "this_month":
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
    case "last_month": {
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return {
        from: toUtcIso(fromDate),
        to: toUtcIso(lastDayPrevMonth),
      };
    }
    default:
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0);
  }

  return {
    from: toUtcIso(fromDate),
    to: toUtcIso(toDate),
  };
}

/**
 * Tính phần trăm chênh lệch so với kỳ trước:
 * ((value - previous) / previous) * 100
 * Nếu previous null hoặc <= 0 thì trả về null (tránh NaN, chia 0).
 */
export function calculatePercentageChange(
  current: number | null,
  previous: number | null
): { percent: number | null; direction: "up" | "down" | "neutral"; text: string } {
  if (current === null || previous === null || previous <= 0) {
    return { percent: null, direction: "neutral", text: "—" };
  }

  const diff = current - previous;
  const percent = Number(((diff / previous) * 100).toFixed(1));

  if (percent > 0) {
    return { percent, direction: "up", text: `+${percent}%` };
  } else if (percent < 0) {
    return { percent: Math.abs(percent), direction: "down", text: `${percent}%` };
  } else {
    return { percent: 0, direction: "neutral", text: "0%" };
  }
}

// ---------------- MOCK DATASETS ---------------- //

const MOCK_KPIS: DashboardKpis = {
  revenue: { value: 345_600_000, previous: 308_000_000, format: "currency" },
  completedRentals: { value: 142, previous: 125, format: "number" },
  rentingVehicles: { value: 18, previous: 15, format: "number" },
  totalVehicles: { value: 45, previous: 42, format: "number" },
  utilizationRate: { value: 72.5, previous: 66.8, format: "percentage" },
  maintenanceCost: { value: 18_400_000, previous: 22_100_000, format: "currency" },
  activeSubscriptions: { value: 127, previous: 110, format: "number" },
};

const MOCK_FLEET_STATUS: FleetStatus = {
  available: 21,
  renting: 18,
  maintenance: 4,
  inactive: 2,
};

const MOCK_RENTALS_BY_STATUS: RentalStatusCount[] = [
  { status: "completed", label: "Đã hoàn tất", count: 142 },
  { status: "renting", label: "Đang di chuyển", count: 18 },
  { status: "pending", label: "Chờ nhận xe", count: 14 },
  { status: "pre_inspection", label: "Kiểm định giao", count: 3 },
  { status: "post_inspection", label: "Kiểm định trả", count: 2 },
  { status: "cancelled", label: "Đã hủy đơn", count: 8 },
];

const MOCK_TOP_VEHICLES: TopVehicleRow[] = [
  { vehicleId: 1, name: "VinFast VF 8 Plus", category: "SUV Điện", revenue: 48_200_000, rentals: 22, hours: 380, utilization: 84 },
  { vehicleId: 2, name: "Hyundai Santa Fe 2.5", category: "SUV 7 chỗ", revenue: 42_500_000, rentals: 19, hours: 320, utilization: 79 },
  { vehicleId: 3, name: "Mazda CX-5 Premium", category: "Crossover 5 chỗ", revenue: 38_100_000, rentals: 21, hours: 290, utilization: 74 },
  { vehicleId: 4, name: "Toyota Camry 2.5Q", category: "Sedan Hạng D", revenue: 35_900_000, rentals: 15, hours: 250, utilization: 68 },
  { vehicleId: 5, name: "VinFast VF e34", category: "Crossover Điện", revenue: 28_400_000, rentals: 26, hours: 260, utilization: 71 },
];

const MOCK_MAINTENANCE_VS_REVENUE: MaintenanceVsRevenueRow[] = [
  { vehicleId: 1, name: "VinFast VF 8 Plus", maintenanceCost: 2_400_000, revenue: 48_200_000, isHighCost: false },
  { vehicleId: 2, name: "Hyundai Santa Fe 2.5", maintenanceCost: 3_800_000, revenue: 42_500_000, isHighCost: false },
  { vehicleId: 8, name: "Kia Carnival (Cũ)", maintenanceCost: 14_200_000, revenue: 11_500_000, isHighCost: true }, // Cảnh báo đỏ
  { vehicleId: 3, name: "Mazda CX-5 Premium", maintenanceCost: 1_200_000, revenue: 38_100_000, isHighCost: false },
  { vehicleId: 9, name: "Ford Everest 2021", maintenanceCost: 9_800_000, revenue: 8_900_000, isHighCost: true }, // Cảnh báo đỏ
];

const MOCK_PLAN_USAGE: PlanUsageRow[] = [
  { planId: 1, name: "Gói Trải Nghiệm Khởi Đầu", usedHours: 240, includedHours: 288, activeSubscribers: 24, usagePercentage: 83.3 },
  { planId: 2, name: "Gói Đô Thị Thông Minh", usedHours: 2540, includedHours: 3080, activeSubscribers: 88, usagePercentage: 82.5 },
  { planId: 3, name: "Gói Doanh Nhân & Gia Đình", usedHours: 890, includedHours: 1200, activeSubscribers: 15, usagePercentage: 74.2 },
];

export async function fetchDashboardKpis(filters: DashboardFilters): Promise<DashboardKpis> {
  try {
    const res = await apiClient.get<DashboardKpis>(
      `/api/dashboard?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}`
    );
    if (res && res.revenue) return res;
  } catch {
    // fallback mock
  }
  return MOCK_KPIS;
}

export async function fetchRevenueSeries(filters: DashboardFilters): Promise<RevenuePoint[]> {
  try {
    const res = await apiClient.get<RevenuePoint[]>(
      `/api/dashboard/revenue-series?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}`
    );
    if (Array.isArray(res)) return res;
  } catch {
    // fallback mock
  }

  // Tạo chuỗi 14 ngày mẫu
  const points: RevenuePoint[] = [];
  const fromTime = new Date(filters.from).getTime();
  const toTime = new Date(filters.to).getTime();
  const step = Math.max(24 * 3600 * 1000, Math.floor((toTime - fromTime) / 14));

  for (let t = fromTime; t <= toTime; t += step) {
    const d = new Date(t);
    const dayStr = formatDate(d, "dd/MM");
    const base = 12_000_000 + (t % 15_000_000);
    points.push({
      bucket: dayStr,
      dateIso: d.toISOString(),
      total: base,
      byGroup: {
        "Ô tô xăng": Math.round(base * 0.55),
        "Ô tô điện": Math.round(base * 0.35),
        "Xe máy": Math.round(base * 0.1),
      },
    });
  }

  return points.slice(0, 30);
}

export async function fetchFleetStatus(_filters: DashboardFilters): Promise<FleetStatus> {
  return MOCK_FLEET_STATUS;
}

export async function fetchRentalsByStatus(_filters: DashboardFilters): Promise<RentalStatusCount[]> {
  return MOCK_RENTALS_BY_STATUS;
}

export async function fetchTopVehicles(_filters: DashboardFilters): Promise<TopVehicleRow[]> {
  return MOCK_TOP_VEHICLES;
}

export async function fetchMaintenanceVsRevenue(
  _filters: DashboardFilters
): Promise<MaintenanceVsRevenueRow[]> {
  return MOCK_MAINTENANCE_VS_REVENUE;
}

export async function fetchPlanUsage(_filters: DashboardFilters): Promise<PlanUsageRow[]> {
  return MOCK_PLAN_USAGE;
}
