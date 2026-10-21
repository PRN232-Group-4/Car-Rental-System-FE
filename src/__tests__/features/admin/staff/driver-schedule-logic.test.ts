import { beforeEach, describe, it, expect, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { getAssignableDrivers, assignDriverToRental, getDriverSchedules, createStaff } from "@/features/admin/staff/api";

beforeEach(() => vi.restoreAllMocks());

describe("Staff and dispatch use server decisions", () => {
  it("preserves backend eligibility and exclusion reasons", async () => {
    const drivers = [{ staffId: 8, fullName: "An", eligible: false, reasons: ["BUSY"] }];
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(drivers);
    expect(await getAssignableDrivers(77)).toEqual(drivers);
    expect(get).toHaveBeenCalledWith("rentals/77/assignable-drivers", { eligibleOnly: false });
  });
  it("sends only the assignment contract and propagates failure", async () => {
    const error = new Error("Mất kết nối");
    const post = vi.spyOn(backendApiClient, "post").mockRejectedValue(error);
    await expect(assignDriverToRental({ rentalId: 88, driverStaffId: 9, reason: "customer_request", notes: "Khách yêu cầu", currentActorEmail: "untrusted@example.com" })).rejects.toBe(error);
    expect(post).toHaveBeenCalledWith("rentals/88/assignments/driver", { driverStaffId: 9, reason: "customer_request", note: "Khách yêu cầu" });
  });
  it("maps the real driver schedule instead of hardcoded dates", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue([{ assignmentId: 9, rentalId: 77, driverStaffId: 8, vehicleId: 44, startTime: "2027-01-01T08:00:00Z", endTime: "2027-01-01T12:00:00Z" }]);
    expect(await getDriverSchedules({ from: "2027-01-01", to: "2027-01-02" })).toEqual([expect.objectContaining({ assignmentId: 9, start: "2027-01-01T08:00:00Z", end: "2027-01-01T12:00:00Z" })]);
  });
  it("does not create a local staff record when the server rejects creation", async () => {
    const error = new Error("Email đã được sử dụng");
    const put = vi.spyOn(backendApiClient, "put").mockRejectedValue(error);
    await expect(createStaff({ userId: 99, departmentId: 5, facilityId: 8, hiredDate: "2027-01-01", isDriver: false })).rejects.toBe(error);
    expect(put).toHaveBeenCalledWith("departments/5/members/99", {});
  });
});
