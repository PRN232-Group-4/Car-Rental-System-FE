import { beforeEach, describe, expect, it, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { getOperationalDrivers, operationalError, rentalTransitionBlocker } from "./api";
import type { OperationalRental } from "./api";

vi.mock("@/api/backend-api-client", () => ({ backendApiClient: { get: vi.fn() } }));

describe("operational rental prerequisites and drivers", () => {
  beforeEach(() => vi.resetAllMocks());

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
