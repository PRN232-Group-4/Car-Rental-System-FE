import { beforeEach, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import { assignInspectionTechnician, confirmInspectionChecked, getInspectionAssignment, getInspectionTechnicians, isInspectionTechnician, inspectionConfirmationError } from "./technician-api";
import { ApiClientError } from "@/api/api-client";
import type { StaffDto } from "@/features/admin/api";

beforeEach(() => vi.resetAllMocks());

it("identifies the legacy pre-only backend response only for post-rental actions", () => {
  const old = new ApiClientError(409, "Conflict", { error: { code: "INSPECTION_ASSIGNMENT_NOT_ALLOWED", detail: "Chỉ phân công kiểm tra trước khi bắt đầu chuyến." } });
  expect(inspectionConfirmationError(old, true)).toContain("phiên bản cũ");
  expect(inspectionConfirmationError(old)).toBeNull();
  const current = new ApiClientError(409, "Conflict", { error: { code: "INSPECTION_ASSIGNMENT_NOT_ALLOWED", detail: "Chỉ phân công kiểm tra ở đúng giai đoạn trước thuê hoặc sau trả xe." } });
  expect(inspectionConfirmationError(current, true)).toBeNull();
});

it("keeps post-rental assignment and confirmation distinct from pre-rental evidence", async () => {
  await getInspectionAssignment(101, true);
  expect(client.get).toHaveBeenCalledWith("rentals/101/inspection-assignment?inspectionType=post_rental");
  await assignInspectionTechnician(101, 5, true);
  expect(client.put).toHaveBeenCalledWith("rentals/101/inspection-assignment?inspectionType=post_rental", { technicianStaffId: 5 });
  await confirmInspectionChecked(101, 5, false, true);
  expect(client.post).toHaveBeenCalledWith("rentals/101/inspection-assignment/checked?inspectionType=post_rental", { technicianStaffId: 5 });
});

it("only requests approval when explicitly selected with the passing check", async () => {
  await confirmInspectionChecked(101, 5);
  expect(client.post).toHaveBeenLastCalledWith("rentals/101/inspection-assignment/checked", { technicianStaffId: 5 });
  await confirmInspectionChecked(101, 5, true);
  expect(client.post).toHaveBeenLastCalledWith("rentals/101/inspection-assignment/checked", { technicianStaffId: 5, approveRequest: true });
});

it("uses authoritative roles for multi-role technician accounts", () => {
  expect(isInspectionTechnician({ isActive: true, staffRole: "Driver", roles: ["Driver", "Maintenance"] } as StaffDto)).toBe(true);
  expect(isInspectionTechnician({ isActive: true, staffRole: "Maintenance", roles: ["Driver"] } as StaffDto)).toBe(false);
});

it("loads all staff pages and offers only active Maintenance staff", async () => {
  const technician = { id: 5, isActive: true, staffRole: "Maintenance" };
  client.get.mockResolvedValueOnce({ items: [
    { id: 1, isActive: true, staffRole: "Driver" },
    { id: 2, isActive: false, staffRole: "Maintenance" },
  ], totalCount: 3 }).mockResolvedValueOnce({ items: [technician], totalCount: 3 });
  expect(await getInspectionTechnicians()).toEqual([technician]);
  expect(client.get).toHaveBeenNthCalledWith(1, "staff", { page: 1, pageSize: 100 });
  expect(client.get).toHaveBeenNthCalledWith(2, "staff", { page: 2, pageSize: 100 });
});

it("does not substitute other staff when a later directory page fails", async () => {
  client.get.mockResolvedValueOnce({ items: [{ id: 1, isActive: true, staffRole: "Maintenance" }], totalCount: 2 })
    .mockRejectedValueOnce(new Error("unavailable"));
  await expect(getInspectionTechnicians()).rejects.toThrow("unavailable");
});

it("reads and persists a distinct inspection assignment", async () => {
  client.get.mockResolvedValue(null);
  expect(await getInspectionAssignment(101)).toBeNull();
  expect(client.get).toHaveBeenCalledWith("rentals/101/inspection-assignment");
  await assignInspectionTechnician(101, 5);
  expect(client.put).toHaveBeenCalledWith("rentals/101/inspection-assignment", { technicianStaffId: 5 });
});
