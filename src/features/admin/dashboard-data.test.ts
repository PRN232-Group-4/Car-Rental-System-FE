import { describe, expect, it, vi } from "vitest";
import { activityChartItems, chartScale, fleetChartItems, getDashboardFleet, parseDashboardSnapshot } from "./dashboard-data";
import { getVehicles } from "./api";

vi.mock("./api", () => ({ getVehicles: vi.fn() }));

describe("dashboard data", () => {
  it("keeps absent/invalid metrics unknown and accepts real zeroes", () => {
    expect(parseDashboardSnapshot({ revenue: 0, renting: -1, maintenance: "5", activeSubscriptions: Infinity })).toEqual({ revenue: 0, renting: null, maintenance: null, activeSubscriptions: null });
    expect(parseDashboardSnapshot(null)).toEqual({ revenue: null, renting: null, maintenance: null, activeSubscriptions: null });
    expect(parseDashboardSnapshot({ renting: 0.5 }).renting).toBeNull();
  });

  it("plots counts only and never mixes revenue with a count axis", () => {
    const data = parseDashboardSnapshot({ revenue: 6_000_000, renting: 3, maintenance: 0 });
    expect(activityChartItems(data).map((item) => item.value)).toEqual([3, 0]);
  });

  it("includes both renting spellings and retains the rest of the fleet", () => {
    const result = fleetChartItems({ total: 12, available: 5, rented: 2, renting: 1, maintenance: 1 });
    expect(result.map((item) => item.value)).toEqual([5, 3, 1, 3]);
    expect(result.reduce((sum, item) => sum + item.value, 0)).toBe(12);
  });

  it("handles an empty fleet and rejects inconsistent counts instead of inventing shares", () => {
    expect(fleetChartItems({ total: 0, available: 0, rented: 0, renting: 0, maintenance: 0 }).every((item) => item.value === 0)).toBe(true);
    expect(() => fleetChartItems({ total: 2, available: 3, rented: 0, renting: 0, maintenance: 0 })).toThrow("vừa thay đổi");
    expect(() => fleetChartItems({ total: NaN, available: 0, rented: 0, renting: 0, maintenance: 0 })).toThrow("hợp lệ");
  });

  it("requests server counts rather than a partial page sample", async () => {
    vi.mocked(getVehicles).mockImplementation(async ({ status }) => ({ items: [], page: 1, pageSize: 1, totalCount: status === "available" ? 30 : status ? 0 : 35 }));
    const data = await getDashboardFleet();
    expect(data.map((item) => item.value)).toEqual([30, 0, 0, 5]);
    expect(getVehicles).toHaveBeenCalledTimes(5);
    expect(getVehicles).toHaveBeenCalledWith({ page: 1, pageSize: 1 });
    expect(getVehicles).toHaveBeenCalledWith({ page: 1, pageSize: 1, status: "renting" });
  });

  it("uses integer readable axes covering zero and large counts", () => {
    for (const max of [0, 1, 7, 95, 12_340]) {
      const scale = chartScale(max);
      expect(scale.max).toBeGreaterThanOrEqual(max);
      expect(scale.ticks.every(Number.isInteger)).toBe(true);
      expect(scale.ticks[0]).toBe(0);
    }
  });
});
