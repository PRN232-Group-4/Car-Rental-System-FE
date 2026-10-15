import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { vehicleQueryOptions } from "./vehicle-query";
import { getVehicle } from "./api";

vi.mock("./api", () => ({ getVehicle: vi.fn() }));
afterEach(() => vi.resetAllMocks());

describe("shared vehicle references", () => {
  it("deduplicates overlapping requests and reuses fresh results", async () => {
    const client = new QueryClient();
    const vehicle = { id: 8, brand: "VinFast", model: "VF 8", mainImageUrl: "/media/vf8.jpg" };
    vi.mocked(getVehicle).mockResolvedValue(vehicle as Awaited<ReturnType<typeof getVehicle>>);
    const [first, second] = await Promise.all([
      client.fetchQuery(vehicleQueryOptions(8)),
      client.fetchQuery(vehicleQueryOptions(8)),
    ]);
    expect(first).toEqual(vehicle);
    expect(second).toEqual(vehicle);
    await client.fetchQuery(vehicleQueryOptions(8));
    expect(getVehicle).toHaveBeenCalledTimes(1);
    client.clear();
  });

  it("disables references with invalid IDs", () => {
    for (const id of [0, -1, NaN, 1.5]) expect(vehicleQueryOptions(id).enabled).toBe(false);
  });
});
