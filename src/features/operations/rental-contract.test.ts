import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOperationalRental, rentalTransitionBlocker } from "./api";

const { transport } = vi.hoisted(() => ({ transport: vi.fn() }));
vi.mock("@/api/backend-api-client", async () => {
  const { ApiClient } = await import("@/api/api-client");
  return { backendApiClient: new ApiClient({ baseUrl: "/api", customFetch: transport }) };
});

describe("flat operational rental HTTP contract", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([false, true])("reads authoritative readiness=%s from GET /rental/{id} without a nested detail adapter", async (hasPassingPreInspection) => {
    transport.mockResolvedValue(new Response(JSON.stringify({
      code: 200,
      status: "success",
      is_success: true,
      data: { id: 101, vehicleId: 2, status: "pre_inspection", hasPassingPreInspection, hasPostInspection: false },
      message: "Đã lấy đơn thuê.",
      error: null,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const rental = await getOperationalRental(101);
    expect(transport).toHaveBeenCalledExactlyOnceWith("/api/rental/101", expect.objectContaining({ method: "GET", credentials: "include" }));
    expect(rental.id).toBe(101);
    expect(rental.hasPassingPreInspection).toBe(hasPassingPreInspection);
    expect(rental.hasPostInspection).toBe(false);
    expect(rentalTransitionBlocker(rental, "renting") === null).toBe(hasPassingPreInspection);
  });
});
