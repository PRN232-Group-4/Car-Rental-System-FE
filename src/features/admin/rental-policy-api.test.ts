import { beforeEach, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import { getRentalPolicies } from "./api";

beforeEach(() => vi.resetAllMocks());
it("keeps server page totals and exact usage counts", async () => {
  const page = { items: [{ id: 2, rentalCount: 0 }, { id: 1, rentalCount: 1234 }], page: 2, pageSize: 20, totalCount: 42 };
  client.get.mockResolvedValue(page);
  expect(await getRentalPolicies(2, 20)).toEqual(page);
  expect(client.get).toHaveBeenCalledWith("rental-policies", { page: 2, pageSize: 20 });
});
it("paginates legacy arrays without fabricating missing usage counts", async () => {
  client.get.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  const page = await getRentalPolicies(2, 1);
  expect(page).toEqual({ items: [{ id: 2 }], page: 2, pageSize: 1, totalCount: 2 });
  expect(page.items![0].rentalCount).toBeUndefined();
});
