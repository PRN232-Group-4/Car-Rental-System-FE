import { beforeEach, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import { assignInspectionTechnician, getInspectionAssignment, getInspectionTechnicians, isInspectionTechnician } from "./technician-api";
import type { StaffDto } from "@/features/admin/api";

beforeEach(() => vi.resetAllMocks());

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
