import { beforeEach, describe, expect, it, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { confirmHandover, getOperationalDrivers, getOperationalRentalDetail, operationalError, rentalTransitionBlocker, updateRental } from "./api";
import type { OperationalRental } from "./api";

vi.mock("@/api/backend-api-client", () => ({ backendApiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

describe("operational rental prerequisites and drivers", () => {
  beforeEach(() => vi.resetAllMocks());

  it("keeps handover confirmation and rental editing on their dedicated endpoints", async () => {
    const input = { vehicleId: 8, startTime: "2027-01-01T02:00:00Z", endTime: "2027-01-02T02:00:00Z", hasDriver: false };
    await confirmHandover(77);
    expect(backendApiClient.post).toHaveBeenCalledExactlyOnceWith("handovers/77/confirm");
    await updateRental(77, input);
    expect(backendApiClient.put).toHaveBeenCalledExactlyOnceWith("rentals/77", input);
  });

  it("loads invoice and inspection metadata without changing the flat rental contract", async () => {
    const detail = { invoice: { id: 42 }, hasPassingPreInspection: true };
    vi.mocked(backendApiClient.get).mockResolvedValue(detail);
    expect(await getOperationalRentalDetail(77)).toBe(detail);
    expect(backendApiClient.get).toHaveBeenCalledExactlyOnceWith("rentals/77/detail");
  });

  it("reads every driver page using the driver-only endpoint", async () => {
    vi.mocked(backendApiClient.get)
      .mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 2 })
      .mockResolvedValueOnce({ items: [{ id: 2 }], totalCount: 2 });
    expect(await getOperationalDrivers()).toEqual([{ id: 1 }, { id: 2 }]);
    expect(backendApiClient.get).toHaveBeenNthCalledWith(1, "staff/drivers", { page: 1, pageSize: 100 });
    expect(backendApiClient.get).toHaveBeenNthCalledWith(2, "staff/drivers", { page: 2, pageSize: 100 });
  });

  it("reports driver lookup failure instead of assigning arbitrary employees", async () => {
    const failure = new Error("Forbidden");
    vi.mocked(backendApiClient.get).mockRejectedValueOnce(failure);
    await expect(getOperationalDrivers()).rejects.toBe(failure);
    expect(backendApiClient.get).toHaveBeenCalledOnce();
  });

  it("keeps an empty driver list empty", async () => {
    vi.mocked(backendApiClient.get).mockResolvedValueOnce({ items: [], totalCount: 0 });
    expect(await getOperationalDrivers()).toEqual([]);
    expect(backendApiClient.get).toHaveBeenCalledOnce();
  });

  it("requires authoritative inspection facts for handover and completion", () => {
    const rental = {} as OperationalRental;
    expect(rentalTransitionBlocker(rental, "renting")).toContain("kiểm tra trước thuê");
    expect(rentalTransitionBlocker(rental, "completed")).toContain("kiểm tra sau thuê");
    expect(rentalTransitionBlocker({ ...rental, hasPassingPreInspection: true }, "renting")).toBeNull();
    expect(rentalTransitionBlocker({ ...rental, hasPostInspection: true }, "completed")).toBeNull();
    expect(rentalTransitionBlocker(rental, "pre_inspection")).toBeNull();
  });

  it("explains the backend inspection guard in Vietnamese", () => {
    expect(operationalError(new Error("A successful pre-rental inspection is required to start."))).toContain("Cần hoàn tất phiếu kiểm tra trước thuê");
  });
});
