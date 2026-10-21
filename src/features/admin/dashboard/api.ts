import { backendApiClient } from "@/api/backend-api-client";
import { unsupportedApi } from "@/api/unsupported";
import { formatDate, nowGmt7, toUtcIso } from "@/lib/time";
import { parseDashboardSnapshot } from "../dashboard-data";
import type { PagedResult } from "../api";
import type { DashboardDatePreset, DashboardFilters, DashboardKpis, FleetStatus, RevenuePoint, RentalStatusCount, TopVehicleRow, MaintenanceVsRevenueRow, PlanUsageRow } from "./types";

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

export async function fetchFleetStatus(filters: DashboardFilters): Promise<FleetStatus> {
  const statuses = ["available", "renting", "maintenance", "inactive"] as const;
  const entries = await Promise.all(statuses.map(async (status) => {
    const result = await backendApiClient.get<{ totalCount: number }>("vehicles", {
      status, page: 1, pageSize: 1, facilityId: filters.facilityId, vehicleTypeId: filters.vehicleTypeId,
    });
    if (!Number.isSafeInteger(result?.totalCount) || result.totalCount < 0) throw new Error("Số lượng đội xe chưa hợp lệ. Vui lòng tải lại.");
    return [status, result.totalCount] as const;
  }));
  return Object.fromEntries(entries) as FleetStatus;
}

export async function fetchDashboardKpis(filters: DashboardFilters): Promise<DashboardKpis> {
  if (filters.facilityId || filters.vehicleTypeId) return unsupportedApi("lọc KPI theo cơ sở hoặc loại xe");
  const [raw, fleet, completed] = await Promise.all([
    backendApiClient.get<unknown>("dashboard", { from: filters.from, to: filters.to }),
    fetchFleetStatus(filters),
    backendApiClient.get<{ totalCount: number }>("rentals", { status: "completed", from: filters.from, to: filters.to, page: 1, pageSize: 1 }),
  ]);
  const snapshot = parseDashboardSnapshot(raw);
  const total = Object.values(fleet).reduce((sum, count) => sum + count, 0);
  return {
    revenue: { value: snapshot.revenue, previous: null, format: "currency" },
    completedRentals: { value: Number.isSafeInteger(completed?.totalCount) && completed.totalCount >= 0 ? completed.totalCount : null, previous: null, format: "number" },
    rentingVehicles: { value: fleet.renting, previous: null, format: "number" },
    totalVehicles: { value: total, previous: null, format: "number" },
    utilizationRate: { value: total ? Number((fleet.renting / total * 100).toFixed(1)) : 0, previous: null, format: "percentage" },
    maintenanceCost: { value: null, previous: null, format: "currency" },
    activeSubscriptions: { value: snapshot.activeSubscriptions, previous: null, format: "number" },
  };
}

async function fetchDashboardRows<T>(endpoint: string, filters: DashboardFilters): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  while (true) {
    const result = await backendApiClient.get<PagedResult<T>>(`dashboard/${endpoint}`, {
      from: filters.from, to: filters.to, facilityId: filters.facilityId, vehicleTypeId: filters.vehicleTypeId, page, pageSize: 100,
    });
    if (!result || !Array.isArray(result.items) || result.page !== page || !Number.isSafeInteger(result.totalCount) || result.totalCount < 0) {
      throw new Error("Dữ liệu biểu đồ không hợp lệ. Vui lòng tải lại.");
    }
    items.push(...result.items);
    if (items.length >= result.totalCount) return items;
    if (!result.items.length) throw new Error("Chưa tải đủ dữ liệu biểu đồ. Vui lòng tải lại.");
    page++;
  }
}

export async function fetchRevenueSeries(filters: DashboardFilters): Promise<RevenuePoint[]> {
  const rows = await fetchDashboardRows<RevenuePoint>("revenue-series", filters);
  return rows.map((row) => {
    const bucket = formatDate(row.dateIso, "dd/MM");
    if (!bucket) throw new Error("Ngày doanh thu không hợp lệ. Vui lòng tải lại.");
    return { ...row, bucket, byGroup: row.byGroup ?? undefined };
  });
}
export async function fetchRentalsByStatus(filters: DashboardFilters): Promise<RentalStatusCount[]> {
  if (filters.facilityId || filters.vehicleTypeId) return unsupportedApi("lọc thống kê đơn theo cơ sở hoặc loại xe");
  const statuses = [
    ["pending", "Chờ xác nhận"], ["pre_inspection", "Đang kiểm tra trước thuê"], ["renting", "Đang thuê"],
    ["post_inspection", "Đang kiểm tra sau thuê"], ["completed", "Đã hoàn tất"], ["cancelled", "Đã hủy"],
  ] as const;
  return Promise.all(statuses.map(async ([status, label]) => {
    const result = await backendApiClient.get<{ totalCount: number }>("rentals", { status, from: filters.from, to: filters.to, page: 1, pageSize: 1 });
    if (!Number.isSafeInteger(result?.totalCount) || result.totalCount < 0) throw new Error("Số lượng đơn thuê không hợp lệ. Vui lòng tải lại.");
    return { status, label, count: result.totalCount };
  }));
}
export async function fetchTopVehicles(filters: DashboardFilters): Promise<TopVehicleRow[]> {
  const rows = await fetchDashboardRows<TopVehicleRow>("top-vehicles", filters);
  return rows.map((row) => ({ ...row, name: row.name ?? "Chưa cập nhật tên xe", category: row.category ?? "Chưa phân loại" }));
}
export async function fetchMaintenanceVsRevenue(filters: DashboardFilters): Promise<MaintenanceVsRevenueRow[]> {
  const rows = await fetchDashboardRows<Omit<MaintenanceVsRevenueRow, "isHighCost">>("maintenance-vs-revenue", filters);
  return rows.map((row) => ({ ...row, name: row.name ?? "Chưa cập nhật tên xe", isHighCost: row.maintenanceCost > row.revenue }));
}
export async function fetchPlanUsage(filters: DashboardFilters): Promise<PlanUsageRow[]> {
  const rows = await fetchDashboardRows<PlanUsageRow>("plan-usage", filters);
  return rows.map((row) => ({ ...row, name: row.name ?? "Chưa cập nhật tên gói" }));
}
