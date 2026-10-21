import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defaultApiClient } from "@/api/default-api-client";
import { useFleetVehicles } from "./use-fleet-vehicles";

afterEach(() => vi.restoreAllMocks());

const vehicle = { id: 1, brand: "Honda", model: "City", vehicleType: "Ô tô xăng", status: "available" };
function renderFleet() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(useFleetVehicles, {
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

describe("Landing fleet preview", () => {
  it("requests just six available vehicles and does not load remaining pages", async () => {
    const items = Array.from({ length: 6 }, (_, i) => ({ ...vehicle, id: i + 1 }));
    const get = vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items, page: 1, pageSize: 6, totalCount: 100 });
    const { result } = renderFleet();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((row) => row.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(get).toHaveBeenCalledExactlyOnceWith("vehicles", { status: "available", page: 1, pageSize: 6 });
  });

  it("never displays unavailable vehicles even if the backend returns one", async () => {
    const items = [vehicle, ...["renting", "rented", "maintenance", "inactive"].map((status, i) => ({ ...vehicle, id: i + 2, status }))];
    vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items, page: 1, pageSize: 6, totalCount: 5 });
    const { result } = renderFleet();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((row) => row.id)).toEqual([1]);
  });

  it("caps the preview at six if a backend ignores pageSize", async () => {
    vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items: Array.from({ length: 8 }, (_, i) => ({ ...vehicle, id: i + 1 })), page: 1, pageSize: 8, totalCount: 8 });
    const { result } = renderFleet();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(6);
  });

  it.each([0, 2])("does not invent vehicles when only %i are available", async (count) => {
    vi.spyOn(defaultApiClient, "get").mockResolvedValue({ items: Array.from({ length: count }, (_, i) => ({ ...vehicle, id: i + 1 })), page: 1, pageSize: 6, totalCount: count });
    const { result } = renderFleet();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(count);
  });

  it("keeps API failures visible instead of substituting sample vehicles", async () => {
    const error = new Error("Offline");
    vi.spyOn(defaultApiClient, "get").mockRejectedValue(error);
    const { result } = renderFleet();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });
});
