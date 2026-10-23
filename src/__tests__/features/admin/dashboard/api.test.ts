import { afterEach, describe, it, expect, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { ApiProblemError } from "@/api/api-client";
import { calculatePercentageChange, getPresetDateRange, fetchRevenueSeries, fetchTopVehicles, fetchMaintenanceVsRevenue, fetchPlanUsage } from "@/features/admin/dashboard/api";

afterEach(() => vi.restoreAllMocks());

const filters = { from: "2027-01-01T00:00:00Z", to: "2027-01-31T23:59:59Z", preset: "custom" as const, facilityId: 5, vehicleTypeId: 2 };
const revenue = { bucket: "01/01", dateIso: "2027-01-01", total: 250000, byGroup: { "Ô tô điện": 250000 } };
const vehicle = { vehicleId: 12, name: "VinFast VF 8", category: "Ô tô điện", revenue: 250000, rentals: 1, hours: 4, utilization: 25 };
const maintenance = { vehicleId: 12, name: "VinFast VF 8", maintenanceCost: 300000, revenue: 250000 };

function response(items: unknown[], page = 1, totalCount = items.length) {
  return { items, page, pageSize: 100, totalCount };
}

describe.each([
  { endpoint: "revenue-series", load: fetchRevenueSeries, row: revenue },
  { endpoint: "top-vehicles", load: fetchTopVehicles, row: vehicle },
  { endpoint: "maintenance-vs-revenue", load: fetchMaintenanceVsRevenue, row: maintenance },
  { endpoint: "plan-usage", load: fetchPlanUsage, row: { planId: 3, name: "Gói đô thị", usedHours: 25, includedHours: 100, activeSubscribers: 5, usagePercentage: 25 } },
])("Dashboard $endpoint", ({ endpoint, load, row }) => {
  it("loads all pages with date, facility and vehicle type filters", async () => {
    const get = vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(response([row], 1, 2))
      .mockResolvedValueOnce(response([row], 2, 2));
    const rows = await load(filters);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject(row);
    for (const page of [1, 2]) {
      expect(get).toHaveBeenNthCalledWith(page, `dashboard/${endpoint}`, {
        from: filters.from, to: filters.to, facilityId: 5, vehicleTypeId: 2, page, pageSize: 100,
      });
    }
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("preserves an empty response without substituting mock data", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(response([]));
    expect(await load(filters)).toEqual([]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it.each([null, { items: null, page: 1, totalCount: 0 }, response([], 2), { ...response([]), totalCount: -1 }])("rejects invalid pagination: %j", async (data) => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(data);
    await expect(load(filters)).rejects.toThrow("không hợp lệ");
  });

  it("rejects an incomplete response instead of displaying partial chart data", async () => {
    vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(response([row], 1, 2))
      .mockResolvedValueOnce(response([], 2, 2));
    await expect(load(filters)).rejects.toThrow("Chưa tải đủ");
  });

  it.each([new ApiProblemError(403, "Forbidden"), new Error("Mất kết nối")])("preserves API and network failures", async (error) => {
    vi.spyOn(backendApiClient, "get").mockRejectedValue(error);
    await expect(load(filters)).rejects.toBe(error);
  });
});

describe("Dashboard response mapping", () => {
  it("preserves null limits/usage without fabricating a zero percentage", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response([{ planId: 3, name: null, usedHours: 25, includedHours: null, activeSubscribers: 5, usagePercentage: null }]));
    expect(await fetchPlanUsage(filters)).toEqual([{ planId: 3, name: "Chưa cập nhật tên gói", usedHours: 25, includedHours: null, activeSubscribers: 5, usagePercentage: null }]);
  });
  it("uses each dateIso as the label when every backend bucket is day", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response([
      { ...revenue, bucket: "day", dateIso: "2027-01-31" },
      { ...revenue, bucket: "day", dateIso: "2027-02-01" },
    ]));
    expect((await fetchRevenueSeries(filters)).map((row) => row.bucket)).toEqual(["31/01", "01/02"]);
  });

  it("rejects an invalid revenue date rather than labelling it day", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response([{ ...revenue, bucket: "day", dateIso: "invalid" }]));
    await expect(fetchRevenueSeries(filters)).rejects.toThrow("Ngày doanh thu không hợp lệ");
  });

  it("handles nullable revenue labels and groups without inventing revenue", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response([{ ...revenue, bucket: null, byGroup: null, total: 0 }]));
    expect(await fetchRevenueSeries(filters)).toEqual([{ ...revenue, bucket: "01/01", byGroup: undefined, total: 0 }]);
  });

  it("handles nullable vehicle names and categories", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response([{ ...vehicle, name: null, category: null }]));
    expect(await fetchTopVehicles(filters)).toEqual([{ ...vehicle, name: "Chưa cập nhật tên xe", category: "Chưa phân loại" }]);
  });

  it("flags maintenance costs only when they exceed actual revenue", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response([
      maintenance, { ...maintenance, maintenanceCost: 250000 }, { ...maintenance, maintenanceCost: 0, revenue: 0, name: null },
    ]));
    expect((await fetchMaintenanceVsRevenue(filters)).map((row) => row.isHighCost)).toEqual([true, false, false]);
  });
});

describe("Dashboard Math & Helpers", () => {
  describe("calculatePercentageChange", () => {
    it("tính đúng % tăng trưởng và hướng 'up'", () => {
      const result = calculatePercentageChange(112, 100);
      expect(result.percent).toBe(12);
      expect(result.direction).toBe("up");
      expect(result.text).toBe("+12%");
    });

    it("tính đúng % sụt giảm và hướng 'down'", () => {
      const result = calculatePercentageChange(80, 100);
      expect(result.percent).toBe(20);
      expect(result.direction).toBe("down");
      expect(result.text).toBe("-20%");
    });

    it("xử lý kỳ trước bằng 0 hoặc âm an toàn (tránh NaN, chia 0)", () => {
      const resZero = calculatePercentageChange(100, 0);
      expect(resZero.percent).toBeNull();
      expect(resZero.direction).toBe("neutral");
      expect(resZero.text).toBe("—");

      const resNegative = calculatePercentageChange(100, -10);
      expect(resNegative.percent).toBeNull();
      expect(resNegative.direction).toBe("neutral");
      expect(resNegative.text).toBe("—");
    });

    it("xử lý giá trị null an toàn", () => {
      const resNullCurrent = calculatePercentageChange(null, 100);
      expect(resNullCurrent.percent).toBeNull();
      expect(resNullCurrent.text).toBe("—");

      const resNullPrevious = calculatePercentageChange(100, null);
      expect(resNullPrevious.percent).toBeNull();
      expect(resNullPrevious.text).toBe("—");
    });

    it("xử lý hai giá trị bằng nhau", () => {
      const result = calculatePercentageChange(100, 100);
      expect(result.percent).toBe(0);
      expect(result.direction).toBe("neutral");
      expect(result.text).toBe("0%");
    });
  });

  describe("getPresetDateRange", () => {
    it("trả về mốc ngày hợp lệ cho preset 7d", () => {
      const range = getPresetDateRange("7d");
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      expect(new Date(range.from).getTime()).toBeLessThan(new Date(range.to).getTime());
    });

    it("trả về mốc ngày hợp lệ cho preset 30d", () => {
      const range = getPresetDateRange("30d");
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      expect(new Date(range.from).getTime()).toBeLessThan(new Date(range.to).getTime());
    });

    it("trả về mốc ngày hợp lệ cho preset this_month và last_month", () => {
      const thisMonth = getPresetDateRange("this_month");
      const lastMonth = getPresetDateRange("last_month");
      expect(thisMonth.from).toBeDefined();
      expect(lastMonth.from).toBeDefined();
      expect(new Date(lastMonth.from).getTime()).toBeLessThan(new Date(thisMonth.from).getTime());
    });

    it("preset năm nay bắt đầu từ 01/01 GMT+7 và bao trọn hôm nay", () => {
      const range = getPresetDateRange("this_year");
      const from = new Date(range.from);
      const to = new Date(range.to);
      expect(from.getTime()).toBeLessThan(to.getTime());
      // Mốc đầu năm theo giờ GMT+7 ⇒ khi đổi sang UTC là 31/12 năm trước 17:00Z.
      expect(from.toISOString().slice(5, 10)).toBe("12-31");
      expect(from.toISOString().slice(11, 13)).toBe("17");
      expect(to.getTime()).toBeGreaterThanOrEqual(Date.now());
    });
  });
});
