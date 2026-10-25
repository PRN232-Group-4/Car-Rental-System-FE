import { beforeEach, describe, expect, it, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { getFacilities } from "@/features/admin/api";
import { getDriverSchedules, getFacilities as getStaffFacilities } from "@/features/admin/staff/api";

beforeEach(() => vi.restoreAllMocks());

const facility = { id: 5, name: "Chi nhánh trung tâm", address: "Quận 1" };
const schedule = {
  assignmentId: 9, rentalId: 77, driverStaffId: 8, vehicleId: 44,
  driverName: "An", vehicleName: "VinFast VF 8", licensePlate: "51A-12345", bufferMinutes: 60,
  startTime: "2027-01-01T08:00:00Z", endTime: "2027-01-01T12:00:00Z",
};

function page<T>(items: T[], current: number, totalCount: number) {
  return { items, page: current, pageSize: 1, totalCount };
}

describe("Admin production pagination", () => {
  it("loads every facilities page and preserves the array contract for callers", async () => {
    const second = { ...facility, id: 6 };
    const get = vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(page([facility], 1, 2))
      .mockResolvedValueOnce(page([second], 2, 2));

    expect(await getFacilities()).toEqual([second, facility]);
    expect(get).toHaveBeenNthCalledWith(1, "facilities", { page: 1, pageSize: 100 });
    expect(get).toHaveBeenNthCalledWith(2, "facilities", { page: 2, pageSize: 100 });
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("keeps the staff facilities adapter working with the paginated backend", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(page([{ id: 5, name: null, address: null }], 1, 1));
    expect(await getStaffFacilities()).toEqual([{ id: 5, name: "", address: undefined }]);
  });

  it("still accepts the legacy facilities array", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue([facility]);
    expect(await getFacilities()).toEqual([facility]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("loads every schedule page with the same filters and preserves schedule details", async () => {
    const second = { ...schedule, assignmentId: 10, rentalId: 78 };
    const get = vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(page([schedule], 1, 2))
      .mockResolvedValueOnce(page([second], 2, 2));
    const filters = { from: "2027-01-01", to: "2027-01-02", driverStaffId: 8 };

    expect(await getDriverSchedules(filters)).toEqual([schedule, second].map((entry) => ({
      ...entry, start: entry.startTime, end: entry.endTime, status: "assigned",
    })));
    expect(get).toHaveBeenNthCalledWith(1, "drivers/schedule", { ...filters, page: 1, pageSize: 100 });
    expect(get).toHaveBeenNthCalledWith(2, "drivers/schedule", { ...filters, page: 2, pageSize: 100 });
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("applies the facility filter after loading all schedule pages", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockImplementation(async (path, params) => {
      if (path === "staff") return page([{ id: 8, facilityId: 5 }], 1, 1);
      return params?.page === 1
        ? page([{ ...schedule, driverStaffId: 7 }], 1, 2)
        : page([schedule], 2, 2);
    });

    expect(await getDriverSchedules({ facilityId: 5 })).toEqual([
      expect.objectContaining({ assignmentId: 9, driverStaffId: 8 }),
    ]);
    expect(get).toHaveBeenCalledTimes(3);
  });

  describe.each([
    { name: "facilities", load: getFacilities, entry: facility },
    { name: "driver schedule", load: getDriverSchedules, entry: schedule },
  ])("$name", ({ load, entry }) => {
    it("accepts an empty page without requesting another page", async () => {
      const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(page([], 1, 0));
      expect(await load()).toEqual([]);
      expect(get).toHaveBeenCalledTimes(1);
    });

    it.each([
      null,
      { ...page([], 1, 0), items: null },
      { ...page([], 1, 0), totalCount: -1 },
      { ...page([], 1, 0), totalCount: undefined },
      { ...page([], 1, 0), totalCount: 0.5 },
      page([], 2, 0),
    ])("rejects invalid page metadata: %j", async (response) => {
      const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(response);
      await expect(load()).rejects.toThrow("không hợp lệ");
      expect(get).toHaveBeenCalledTimes(1);
    });

    it("does not return a partial list if the next page is empty", async () => {
      vi.spyOn(backendApiClient, "get")
        .mockResolvedValueOnce(page([entry], 1, 2))
        .mockResolvedValueOnce(page([], 2, 2));
      await expect(load()).rejects.toThrow("Chưa tải đủ");
    });

    it("rejects a repeated page rather than returning duplicates", async () => {
      const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(page([entry], 1, 2));
      await expect(load()).rejects.toThrow("không hợp lệ");
      expect(get).toHaveBeenCalledTimes(2);
    });

    it("propagates a later API failure instead of returning partial data", async () => {
      const error = new Error("Mất kết nối");
      vi.spyOn(backendApiClient, "get")
        .mockResolvedValueOnce(page([entry], 1, 2))
        .mockRejectedValueOnce(error);
      await expect(load()).rejects.toBe(error);
    });
  });
});
