import { getVehicles } from "./api";

export type DashboardSnapshot = {
  revenue: number | null;
  renting: number | null;
  maintenance: number | null;
  activeSubscriptions: number | null;
};

export type DashboardChartItem = { key: string; label: string; value: number; color: string };
export type FleetCounts = { total: number; available: number; rented: number; renting: number; maintenance: number };

// A missing/invalid field stays unknown; it must never turn into a fabricated zero.
export function parseDashboardSnapshot(data: unknown): DashboardSnapshot {
  const source = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
  const number = (key: string, count = false) => {
    const value = source[key];
    return typeof value === "number" && Number.isFinite(value) && value >= 0 && (!count || Number.isSafeInteger(value)) ? value : null;
  };
  return { revenue: number("revenue"), renting: number("renting", true), maintenance: number("maintenance", true), activeSubscriptions: number("activeSubscriptions", true) };
}

export function activityChartItems(data: DashboardSnapshot): DashboardChartItem[] {
  return [
    { key: "renting", label: "Đơn đang thuê", value: data.renting, color: "var(--chart-2)" },
    { key: "maintenance", label: "Phiếu bảo dưỡng mở", value: data.maintenance, color: "var(--chart-1)" },
    { key: "activeSubscriptions", label: "Gói thuê còn hiệu lực", value: data.activeSubscriptions, color: "var(--chart-4)" },
  ].filter((item): item is DashboardChartItem => item.value !== null);
}

export function fleetChartItems(counts: FleetCounts): DashboardChartItem[] {
  if (Object.values(counts).some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error("Chưa có số lượng phương tiện hợp lệ. Vui lòng thử lại.");
  }
  const occupied = counts.rented + counts.renting;
  const other = counts.total - counts.available - occupied - counts.maintenance;
  if (other < 0) throw new Error("Số lượng phương tiện vừa thay đổi. Vui lòng tải lại biểu đồ.");
  return [
    { key: "available", label: "Sẵn sàng", value: counts.available, color: "var(--chart-4)" },
    { key: "rented", label: "Đang thuê", value: occupied, color: "var(--chart-2)" },
    { key: "maintenance", label: "Bảo dưỡng", value: counts.maintenance, color: "var(--chart-1)" },
    { key: "other", label: "Tạm ngưng / khác", value: other, color: "var(--chart-3)" },
  ];
}

export async function getDashboardFleet(): Promise<DashboardChartItem[]> {
  // Request counts rather than downloading every vehicle. Include both API status spellings.
  const statuses = [undefined, "available", "rented", "renting", "maintenance"] as const;
  const counts = await Promise.all(statuses.map(async (status) => {
    const result = await getVehicles({ page: 1, pageSize: 1, ...(status ? { status } : {}) });
    return result.totalCount;
  }));
  return fleetChartItems({ total: counts[0], available: counts[1], rented: counts[2], renting: counts[3], maintenance: counts[4] });
}

export function chartScale(max: number) {
  if (max <= 0) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max / 4, 1)));
  const step = Math.ceil(max / 4 / magnitude) * magnitude;
  return { max: step * 4, ticks: [0, step, step * 2, step * 3, step * 4] };
}
