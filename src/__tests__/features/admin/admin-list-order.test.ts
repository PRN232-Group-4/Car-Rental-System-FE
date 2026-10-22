import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDepartments, getFacilities, getSubscriptionPlans, getVehicleTypes } from "@/features/admin/api";
import { fetchSubscriptionPlans } from "@/features/admin/policies/api";
import { getStaffList } from "@/features/admin/staff/api";
import { driverStaff, pageOf } from "./staff/staff-backend-fixture";

const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));

describe("Admin lists default to newest records", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    ["departments", getDepartments], ["vehicle-types", getVehicleTypes],
    ["subscription-plans", getSubscriptionPlans], ["plans page", fetchSubscriptionPlans],
  ] as const)("sorts the entire %s catalog without changing the shared response", async (_name, load) => {
    const records = [{ id: 1, name: "AAA" }, { id: 30, name: "ZZZ" }, { id: 10, name: "Middle" }];
    client.get.mockResolvedValue(records);
    expect((await load()).map((row) => row.id)).toEqual([30, 10, 1]);
    expect(records.map((row) => row.id)).toEqual([1, 30, 10]);
  });

  it("orders facilities globally after loading all backend pages", async () => {
    client.get.mockResolvedValueOnce({ ...pageOf([{ id: 1 }]), totalCount: 2 })
      .mockResolvedValueOnce({ ...pageOf([{ id: 30 }]), totalCount: 2, page: 2 });
    expect((await getFacilities()).map((row) => row.id)).toEqual([30, 1]);
    expect(client.get).toHaveBeenNthCalledWith(2, "facilities", { page: 2, pageSize: 100 });
  });

  it("staff defaults to newest profile before pagination, preserving explicit sorts", async () => {
    client.get.mockImplementation(async (_path, params) => params.page === 1
      ? { ...pageOf([{ ...driverStaff, id: 1, hiredDate: "2030-01-01" }]), totalCount: 2 }
      : { ...pageOf([{ ...driverStaff, id: 30, hiredDate: "2000-01-01" }]), totalCount: 2, page: 2 });
    const first = await getStaffList({ pageSize: 1 });
    const second = await getStaffList({ pageSize: 1, page: 2 });
    expect(first.items.map((row) => row.id)).toEqual([30]);
    expect(second.items.map((row) => row.id)).toEqual([1]);
    expect(first.totalCount).toBe(2);
    expect((await getStaffList({ sortBy: "hiredDate", sortOrder: "desc" })).items.map((row) => row.id)).toEqual([1, 30]);
  });
});
