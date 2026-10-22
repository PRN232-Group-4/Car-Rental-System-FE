import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultApiClient } from "@/api/default-api-client";
import { getVehiclesPaginated } from "@/features/vehicles/api";

beforeEach(() => vi.restoreAllMocks());

const car = {
  id: 2, brand: "VinFast", model: "VF 8", vehicleType: { id: 8, name: "Ô tô điện", type: "car", fuelType: "electric" },
  facility: { id: 5, name: "Chi nhánh Quận 1" }, priceHourly: 250000, priceLongterm: 30000000,
  summary: { seatCount: 5, transmission: "CVT" }, badges: { electric: true },
};

// The new /vehicles/search endpoint applies filters and sorting before server pagination.
describe("getVehiclesPaginated search contract", () => {
  it("keeps the landing preview on the status catalogue with the flat vehicle mapper", async () => {
    const get = vi.spyOn(defaultApiClient, "get").mockResolvedValue({
      items: [{ id: 3, brand: "Honda", model: "SH", vehicleType: "Xe máy xăng", status: "available", hourlyPrice: 60000 }],
      page: 1, pageSize: 6, totalCount: 9,
    });
    const result = await getVehiclesPaginated({ status: "available", page: 1, pageSize: 6 });
    expect(get).toHaveBeenCalledExactlyOnceWith("vehicles", { status: "available", page: 1, pageSize: 6 });
    expect(result.items[0]).toMatchObject({ category: "motorbike", hourlyPrice: 60000, isAvailable: true });
  });

  it("uses public search with the backend query names", async () => {
    const get = vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items: [car], page: 1, pageSize: 9, totalCount: 1 });
    await getVehiclesPaginated({ category: "electric_car", search: " VinFast ", sort: "price_asc", pageSize: 9 });
    expect(get).toHaveBeenCalledExactlyOnceWith("vehicles/search", {
      category: "electric_car", q: "VinFast", sort: "price_asc", rentalType: "hourly", page: 1, pageSize: 9,
    });
  });

  it("preserves filtered results and the server total instead of filtering a single page again", async () => {
    vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items: [car], page: 2, pageSize: 1, totalCount: 7 });
    const result = await getVehiclesPaginated({ category: "electric_car", page: 2, pageSize: 1 });
    expect(result).toMatchObject({ page: 2, pageSize: 1, totalCount: 7, items: [{ id: 2, category: "electric_car", facilityId: 5 }] });
  });

  it("combines category, branch, search and pricing filters in one server request", async () => {
    const get = vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items: [], page: 1, pageSize: 9, totalCount: 0 });
    await getVehiclesPaginated({ category: "electric_car", facilityId: "5", brand: "VinFast", seats: 5,
      fuelType: "electric", transmission: "cvt", priceMin: 100000, priceMax: 300000, search: " VF 8 ", mode: "longterm" });
    expect(get).toHaveBeenCalledExactlyOnceWith("vehicles/search", {
      category: "electric_car", facilityId: "5", brand: "VinFast", seatCount: 5, fuelType: "electric", transmission: "cvt",
      minPrice: 100000, maxPrice: 300000, q: "VF 8", rentalType: "longterm", page: 1, pageSize: 9,
    });
  });

  it("preserves server ordering and translates the newest sort", async () => {
    const get = vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items: [{ ...car, id: 4 }, car], page: 2, pageSize: 2, totalCount: 8 });
    const result = await getVehiclesPaginated({ sort: "year_desc", page: 2, pageSize: 2 });
    expect(get).toHaveBeenCalledExactlyOnceWith("vehicles/search", { sort: "newest", rentalType: "hourly", page: 2, pageSize: 2 });
    expect(result.items.map((vehicle) => vehicle.id)).toEqual([4, 2]);
    expect(result.totalCount).toBe(8);
  });
});
