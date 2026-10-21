import { describe, expect, it, vi } from "vitest";
import { defaultApiClient } from "@/api/default-api-client";
import { getVehiclesPaginated } from "@/features/vehicles/api";

const raw = (overrides: Record<string, unknown>) => ({
  id: 1,
  brand: "Honda",
  model: "City",
  vehicleType: "Ô tô 5 chỗ",
  status: "available",
  hourlyPrice: 100000,
  longtermPrice: 3000000,
  facilityId: 5,
  facility: "Chi nhánh Quận 1",
  ...overrides,
});

const fleet = [
  raw({ id: 1, brand: "Toyota", model: "Corolla Cross", vehicleType: "Ô tô 5 chỗ", hourlyPrice: 120000 }),
  raw({ id: 2, brand: "VinFast", model: "VF 8", vehicleType: "Ô tô điện", hourlyPrice: 250000 }),
  raw({ id: 3, brand: "Honda", model: "SH 160i", vehicleType: "Xe máy xăng", hourlyPrice: 60000 }),
  raw({ id: 4, brand: "VinFast", model: "Feliz S", vehicleType: "Xe máy điện", hourlyPrice: 50000 }),
];

function mockFleet(onQuery?: (query: Record<string, unknown>) => void) {
  return vi.spyOn(defaultApiClient, "get").mockImplementation(async (_path, query) => {
    const params = (query ?? {}) as Record<string, unknown>;
    onQuery?.(params);
    const page = Number(params.page ?? 1);
    const pageSize = Number(params.pageSize ?? 9);
    return { items: fleet.slice((page - 1) * pageSize, page * pageSize), totalCount: fleet.length, page, pageSize };
  });
}

describe("getVehiclesPaginated", () => {
  it("only sends the parameters the API supports", async () => {
    const seen: Record<string, unknown>[] = [];
    const spy = mockFleet((query) => seen.push(query));
    await getVehiclesPaginated({ category: "electric_car", search: "VinFast", sort: "price_asc", pageSize: 9 });
    expect(spy).toHaveBeenCalled();
    for (const query of seen) {
      expect(Object.keys(query).sort()).toEqual(["page", "pageSize"]);
    }
  });

  it("filters by category locally and paginates the filtered result", async () => {
    mockFleet();
    const electricCars = await getVehiclesPaginated({ category: "electric_car", pageSize: 9 });
    expect(electricCars.items.map((vehicle) => vehicle.id)).toEqual([2]);
    expect(electricCars.totalCount).toBe(1);

    const motorbikes = await getVehiclesPaginated({ category: "motorbike", pageSize: 1 });
    expect(motorbikes.items.map((vehicle) => vehicle.id)).toEqual([3]);
    expect(motorbikes.totalCount).toBe(1);
  });

  it("applies branch, price and search filters to the whole fleet", async () => {
    mockFleet();
    expect((await getVehiclesPaginated({ priceMax: 60000 })).items.map((v) => v.id)).toEqual([3, 4]);
    expect((await getVehiclesPaginated({ search: "vinfast" })).items.map((v) => v.id)).toEqual([2, 4]);
    expect((await getVehiclesPaginated({ search: "o to dien" })).items.map((v) => v.id)).toEqual([2]);
  });

  it("sorts locally and keeps the requested page", async () => {
    mockFleet();
    const asc = await getVehiclesPaginated({ sort: "price_asc", pageSize: 2, page: 2 });
    expect(asc.items.map((vehicle) => vehicle.id)).toEqual([1, 2]);
    expect(asc.totalCount).toBe(4);
  });
});
