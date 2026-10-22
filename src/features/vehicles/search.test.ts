import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVehiclesPaginated } from "./api";
import { findFilterSchema } from "./findFilterSchema";
import { parseSearchParams } from "@/lib/url";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/default-api-client", () => ({ defaultApiClient: { get } }));

beforeEach(() => get.mockReset());

describe("public rental search", () => {
  it("sends every filter to public search before pagination and maps nested search cards", async () => {
    get.mockResolvedValue({ items: [{ id: 42, brand: "VinFast", model: "VF8", yearOfManufacture: 2024,
      vehicleType: { id: 8, name: "SUV", type: "car", fuelType: "electric" },
      facility: { id: 3, name: "Quận 1" }, priceHourly: 150000, priceLongterm: 20000000,
      summary: { seatCount: 5, transmission: "CVT", batteryCapacity: "87 kWh" },
      badges: { electric: true, driverAvailable: true }, mainImageUrl: "/car.jpg" }],
      page: 2, pageSize: 6, totalCount: 12 });
    const result = await getVehiclesPaginated({ category: "electric_car", facilityId: "3", brand: "VinFast",
      seats: 5, transmission: "cvt", fuelType: "electric", priceMin: 100000, priceMax: 200000,
      search: " VF8 ", sort: "year_desc", page: 2, pageSize: 6, mode: "hourly",
      from: "2030-06-01T02:00:00.000Z", to: "2030-06-01T04:00:00.000Z" });
    expect(get).toHaveBeenCalledWith("vehicles/search", { category: "electric_car", facilityId: "3", brand: "VinFast",
      seatCount: 5, transmission: "cvt", fuelType: "electric", minPrice: 100000, maxPrice: 200000,
      q: "VF8", sort: "newest", page: 2, pageSize: 6, rentalType: "hourly",
      from: "2030-06-01T02:00:00.000Z", to: "2030-06-01T04:00:00.000Z" });
    expect(result).toMatchObject({ totalCount: 12, page: 2, items: [{ name: "VinFast VF8", category: "electric_car",
      facilityId: 3, facilityName: "Quận 1", hourlyPrice: 150000, monthlyPrice: 20000000,
      seats: 5, transmission: "CVT", batteryCapacity: "87 kWh", isAvailable: true }] });
  });

  it("omits all/default sentinels, supports name sorting and monthly prices", async () => {
    get.mockResolvedValue({ items: [], page: 1, pageSize: 9, totalCount: 0 });
    await getVehiclesPaginated({ category: "all", facilityId: "all", brand: "all", seats: 0,
      transmission: "all", fuelType: "all", priceMin: 0, priceMax: 0, search: " ", mode: "longterm", sort: "name_asc" });
    expect(get).toHaveBeenCalledWith("vehicles/search", { page: 1, pageSize: 9, rentalType: "longterm", sort: "name_asc" });
  });

  it("reports malformed responses instead of showing a false empty result", async () => {
    get.mockResolvedValue({ error: "invalid" });
    await expect(getVehiclesPaginated()).rejects.toThrow("Dữ liệu tìm kiếm xe không hợp lệ");
  });
});

describe("rental filter URL", () => {
  it("converts home page local date/time to UTC while preserving other filters", () => {
    const filters = parseSearchParams(findFilterSchema, new URLSearchParams("startDate=2030-06-01&startTime=09:30&endDate=2030-06-01&endTime=11:00&brand=Toyota"));
    expect(filters).toMatchObject({ startDate: "2030-06-01T02:30:00.000Z", endDate: "2030-06-01T04:00:00.000Z", brand: "Toyota" });
  });
  it("repairs only invalid fields and keeps valid selections", () => {
    const filters = parseSearchParams(findFilterSchema, new URLSearchParams("page=oops&pageSize=200&category=bad&facilityId=undefined&brand=Honda&fuelType=petrol&startDate=bad&endDate=all"));
    expect(filters).toMatchObject({ page: 1, pageSize: 9, category: "all", facilityId: "all", brand: "Honda", fuelType: "petrol" });
    expect(filters.startDate).toBeUndefined();
    expect(filters.endDate).toBeUndefined();
  });
  it("restores picker times from shared UTC links without separate time parameters", () => {
    expect(findFilterSchema.parse({ startDate: "2030-06-01T02:30:00Z", endDate: "2030-06-01T04:00:00Z" }))
      .toMatchObject({ startTime: "09:30", endTime: "11:00" });
  });
});
