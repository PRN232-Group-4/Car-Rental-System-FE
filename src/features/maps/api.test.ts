import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/api/api-client";
import { backendApiClient } from "@/api/backend-api-client";
import { getVehiclePosition, hasGpsCoordinates, trackingError } from "./api";

afterEach(() => vi.restoreAllMocks());

describe("GPS data handling", () => {
  it("accepts zero coordinates and rejects absent or out-of-range positions", () => {
    expect(hasGpsCoordinates({ lat: 0, lng: 0 })).toBe(true);
    for (const point of [null, { lat: 91, lng: 10 }, { lat: 10, lng: 181 }, { lat: NaN, lng: 0 }]) {
      expect(hasGpsCoordinates(point)).toBe(false);
    }
  });

  it("does not invent a position when the vehicle has no GPS", async () => {
    vi.spyOn(backendApiClient, "get").mockRejectedValue(new ApiClientError(404, "Not Found", null));
    expect(await getVehiclePosition(10)).toBeNull();
  });

  it("keeps forbidden/network errors distinct from an empty GPS result", async () => {
    const failure = new ApiClientError(403, "Forbidden", null);
    vi.spyOn(backendApiClient, "get").mockRejectedValue(failure);
    await expect(getVehiclePosition(10)).rejects.toBe(failure);
    expect(trackingError(failure)).toContain("không có quyền");
    expect(trackingError(new TypeError("secret upstream URL"))).not.toContain("secret");
  });
});
