import { describe, expect, it } from "vitest";
import { mapFacilitiesPage, mapFacilityFromBE } from "./api";

describe("facility map data", () => {
  it("normalizes live numeric IDs without inventing coordinates, images or vehicle counts", () => {
    const result = mapFacilityFromBE({ id: 7, name: "Chi nhánh Quận 1", address: "12 Nguyễn Huệ" });
    expect(result.id).toBe("7");
    expect(result.address).toBe("12 Nguyễn Huệ");
    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
    expect(result.availableVehicles).toBeUndefined();
    expect(result.imageUrl).toBeUndefined();
  });

  it("retains actual coordinates and an explicit zero availability count", () => {
    const result = mapFacilityFromBE({ id: "fac-1", name: "Chi nhánh", latitude: 10.77, longitude: 106.7, availableVehicles: 0 });
    expect(result.latitude).toBe(10.77);
    expect(result.longitude).toBe(106.7);
    expect(result.availableVehicles).toBe(0);
  });

  it("handles both plain and paginated live lists, omitting malformed rows", () => {
    const item = { id: 7, name: "Chi nhánh", address: "12 Nguyễn Huệ" };
    expect(mapFacilitiesPage([item])).toEqual(mapFacilitiesPage({ items: [item], totalCount: 1 }));
    expect(mapFacilitiesPage(null)).toEqual([]);
    expect(mapFacilitiesPage({ items: [null, {}, item] })).toHaveLength(1);
  });
});
