import { beforeEach, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import { getFacilities } from "./api";

beforeEach(() => vi.resetAllMocks());

it("returns an array that directory rows and facility selectors can use", async () => {
  const facilities = [{ id: 1, name: "Chi nhánh 1", address: "TP.HCM" }];
  client.get.mockResolvedValue({ items: facilities, page: 1, pageSize: 100, totalCount: 1 });

  const result = await getFacilities();

  expect(result.map((facility) => facility.name)).toEqual(["Chi nhánh 1"]);
  expect(result.find((facility) => facility.id === 1)).toEqual(facilities[0]);
});

it("loads facilities beyond the first page for all selectors", async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: index + 1, name: `Chi nhánh ${index + 1}`, address: null }));
  const lastFacility = { id: 101, name: "Chi nhánh 101", address: null };
  client.get
    .mockResolvedValueOnce({ items: firstPage, page: 1, pageSize: 100, totalCount: 101 })
    .mockResolvedValueOnce({ items: [lastFacility], page: 2, pageSize: 100, totalCount: 101 });

  expect(await getFacilities()).toEqual([...firstPage, lastFacility]);
  expect(client.get).toHaveBeenNthCalledWith(1, "facilities", { page: 1, pageSize: 100 });
  expect(client.get).toHaveBeenNthCalledWith(2, "facilities", { page: 2, pageSize: 100 });
  expect(client.get).toHaveBeenCalledTimes(2);
});

it.each([{ items: [] }, { items: null }])("stops on an empty page even if the total has become stale (%j)", async ({ items }) => {
  client.get.mockResolvedValue({ items, page: 1, pageSize: 100, totalCount: 1 });

  expect(await getFacilities()).toEqual([]);
  expect(client.get).toHaveBeenCalledTimes(1);
});

it("still accepts arrays from the previous backend contract", async () => {
  const facilities = [{ id: 1, name: "Chi nhánh 1", address: null }];
  client.get.mockResolvedValue(facilities);

  expect(await getFacilities()).toEqual(facilities);
  expect(client.get).toHaveBeenCalledTimes(1);
});

it("propagates a later page failure instead of returning an incomplete list", async () => {
  const error = new Error("Không thể tải chi nhánh");
  client.get
    .mockResolvedValueOnce({ items: [{ id: 1, name: "Chi nhánh 1", address: null }], page: 1, pageSize: 100, totalCount: 2 })
    .mockRejectedValueOnce(error);

  await expect(getFacilities()).rejects.toBe(error);
});
