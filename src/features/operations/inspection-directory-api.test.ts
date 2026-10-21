import { expect, it, vi } from "vitest";
const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import { getInspectionDirectory, inspectionImages } from "./inspection-directory-api";

it("sends backend pagination and applied filters", async () => {
  await getInspectionDirectory({ page: 2, pageSize: 20, rentalId: 101, inspectionType: "pre_rental" });
  expect(client.get).toHaveBeenCalledWith("inspections", { page: 2, pageSize: 20, rentalId: 101, inspectionType: "pre_rental" }, { signal: undefined });
});

it("accepts legacy and JSON image evidence without executing invalid URL schemes", () => {
  expect(inspectionImages('["https://example.test/one.jpg","javascript:alert(1)",null,"https://example.test/one.jpg"]')).toEqual(["https://example.test/one.jpg"]);
  expect(inspectionImages("https://example.test/legacy.jpg")).toEqual(["https://example.test/legacy.jpg"]);
  expect(inspectionImages(null)).toEqual([]);
});
