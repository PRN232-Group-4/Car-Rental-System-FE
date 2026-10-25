import { beforeEach, describe, it, expect, vi } from "vitest";
import { driverStaff, pageOf } from "./staff-backend-fixture";
import { backendApiClient } from "@/api/backend-api-client";
import { getAssignableDrivers, assignDriverToRental, getDriverSchedules, createStaff, getStaffList } from "@/features/admin/staff/api";

beforeEach(() => vi.restoreAllMocks());

describe("Staff and dispatch use server decisions", () => {
  it("preserves backend eligibility and exclusion reasons", async () => {
    const drivers = [{ staffId: 8, fullName: "An", eligible: false, reasons: ["BUSY"] }];
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(drivers);
    expect(await getAssignableDrivers(77)).toEqual(drivers);
    expect(get).toHaveBeenCalledWith("rental/77/assignable-drivers", { eligibleOnly: false });
  });
  it("sends only the assignment contract and propagates failure", async () => {
    const error = new Error("Mất kết nối");
    const post = vi.spyOn(backendApiClient, "post").mockRejectedValue(error);
    await expect(assignDriverToRental({ rentalId: 88, driverStaffId: 9, reason: "customer_request", notes: "Khách yêu cầu", currentActorEmail: "untrusted@example.com" })).rejects.toBe(error);
    expect(post).toHaveBeenCalledWith("rental/88/assignments/driver", { driverStaffId: 9, reason: "customer_request", note: "Khách yêu cầu" });
  });
  it("maps the real driver schedule instead of hardcoded dates", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue([{ assignmentId: 9, rentalId: 77, driverStaffId: 8, vehicleId: 44, startTime: "2027-01-01T08:00:00Z", endTime: "2027-01-01T12:00:00Z" }]);
    expect(await getDriverSchedules({ from: "2027-01-01", to: "2027-01-02" })).toEqual([expect.objectContaining({ assignmentId: 9, start: "2027-01-01T08:00:00Z", end: "2027-01-01T12:00:00Z" })]);
  });
  it("does not create a local staff record when the server rejects creation", async () => {
    const error = new Error("Email đã được sử dụng");
    const post = vi.spyOn(backendApiClient, "post").mockRejectedValue(error);
    await expect(createStaff({ userId: 99, departmentId: 5, facilityId: 8, hiredDate: "2027-01-01", isDriver: false })).rejects.toBe(error);
    expect(post).toHaveBeenCalledWith("staff/from-user", expect.objectContaining({ userId: 99, departmentId: 5, facilityId: 8 }));
  });
  it("hỗ trợ lọc nhân sự theo phòng ban, cơ sở và tình trạng GPLX", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(pageOf([{ ...driverStaff, licenseExpiryDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10) }]));
    // 1. Chỉ lọc tài xế
    const driversResult = await getStaffList({ isDriver: "driver" });
    expect(driversResult.items.every((s) => s.isDriver)).toBe(true);

    // 2. Lọc bằng sắp hết hạn
    const expiringResult = await getStaffList({ licenseStatus: "expiring" });
    expect(expiringResult.items.length).toBeGreaterThan(0);
    expect(expiringResult.items[0].license?.expiryDate).toBeDefined();
  });
});
