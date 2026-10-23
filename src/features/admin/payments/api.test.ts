import { afterEach, describe, expect, it, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { getAdminPayments } from "./api";

afterEach(() => vi.restoreAllMocks());

describe("admin payments API", () => {
  it("loads the real ledger and preserves rental, invoice and provider references", async () => {
    const row = { id: 7, rentalId: 4, invoiceId: 3, type: "rental", status: "paid", amount: 900000, method: "cash", providerReference: "cash:3", createdAt: "2026-10-23T01:00:00Z", paidAt: "2026-10-23T01:00:00Z" };
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue([row]);
    expect(await getAdminPayments()).toEqual([row]);
    expect(get).toHaveBeenCalledWith("payments");
  });

  it("accepts an empty ledger and PascalCase fields", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValueOnce([]).mockResolvedValueOnce([
      { Id: 8, Amount: 120000, Type: "Rental", Method: "Cash", Status: "Paid", CreatedAt: "2026-10-23T01:00:00Z" },
    ]);
    expect(await getAdminPayments()).toEqual([]);
    expect(await getAdminPayments()).toEqual([expect.objectContaining({ id: 8, amount: 120000, status: "paid", type: "rental", method: "cash" })]);
  });

  it.each([null, {}, { items: [] }, [null], [{}], [{ id: 8, amount: "bad", status: "paid", createdAt: "2026-10-23" }]])("rejects malformed data instead of showing an empty ledger: %j", async (response) => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(response);
    await expect(getAdminPayments()).rejects.toThrow("không hợp lệ");
  });

  it("propagates a denied or failed API request", async () => {
    const error = new Error("Forbidden");
    vi.spyOn(backendApiClient, "get").mockRejectedValue(error);
    await expect(getAdminPayments()).rejects.toBe(error);
  });
});
