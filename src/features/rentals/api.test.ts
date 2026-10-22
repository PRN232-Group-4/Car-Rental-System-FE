import { beforeEach, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/api/default-api-client", () => ({ defaultApiClient: client, isMockMode: false }));
import { createRentalBooking, getBookingPolicies, getBookingVehicles, mapBookingResponse, updateRentalContract } from "./api";

beforeEach(() => vi.resetAllMocks());
it("reads every policy page after the list contract changes to pagination", async () => {
  client.get.mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 2 }).mockResolvedValueOnce({ items: [{ id: 2 }], totalCount: 2 });
  expect(await getBookingPolicies()).toEqual([{ id: 1 }, { id: 2 }]);
  expect(client.get).toHaveBeenLastCalledWith("rental-policies", { page: 2, pageSize: 100 });
});
it("retains compatibility with the previous array policy response", async () => {
  client.get.mockResolvedValueOnce([{ id: 1 }]);
  expect(await getBookingPolicies()).toEqual([{ id: 1 }]);
  expect(client.get).toHaveBeenCalledTimes(1);
});
it("posts the exact RentalRequest and reads a real backend rental id", async () => {
  client.post.mockResolvedValue({ id: 321, rentalType: "hourly", totalPrice: 324000, depositPrice: 64800 });
  const result = await createRentalBooking({ rentalType: "hourly", vehicleId: "8", policyId: 6, startTime: "2026-10-10T01:00:00Z", endTime: "2026-10-10T03:30:00Z", hasDriver: false, customerName: "Do not send this", estimatedCost: 999 });
  expect(client.post).toHaveBeenCalledWith("rentals/hourly", { vehicleId: 8, policyId: 6, startTime: "2026-10-10T01:00:00Z", endTime: "2026-10-10T03:30:00Z", hasDriver: true, subscriptionId: null, paymentMethod: "payos" });
  expect(result.bookingId).toBe(321);
  expect(result.invoiceId).toBeUndefined();
});
it("uses the longterm endpoint and retains failures without fabricating confirmations", async () => {
  const failure = new Error("Xe đã có lịch thuê.");
  client.post.mockRejectedValue(failure);
  await expect(createRentalBooking({ rentalType: "longterm", vehicleId: 8, startTime: "a", endTime: "b" })).rejects.toBe(failure);
  expect(client.post.mock.calls[0][0]).toBe("rentals/longterm");
  expect(mapBookingResponse(null).bookingId).toBeUndefined();
});
it("queries availability by time and reads all vehicle pages", async () => {
  const row = { vehicleType: { id: 2, name: "Ô tô", fuelType: "gasoline" }, facility: { id: 5, name: "Quận 1" }, summary: { seatCount: 7, transmission: "Số sàn" }, priceHourly: 120000, priceLongterm: 18000000, mainImageUrl: "https://example.test/car.png" };
  client.get.mockResolvedValueOnce({ items: [{ ...row, id: 8 }], totalCount: 2 }).mockResolvedValueOnce({ items: [{ ...row, id: 9 }], totalCount: 2 });
  const vehicles = await getBookingVehicles("from", "to", "5", true, "hourly");
  expect(vehicles.map((v) => v.id)).toEqual([8, 9]);
  expect(vehicles[0]).toMatchObject({ vehicleTypeId: 2, facilityId: 5, facilityName: "Quận 1", seats: 7, hourlyPrice: 120000, monthlyPrice: 18000000, isAvailable: true });
  expect(client.get).toHaveBeenLastCalledWith("vehicles/search", { from: "from", to: "to", facilityId: "5", hasDriver: true, rentalType: "hourly", page: 2, pageSize: 100 }, { signal: undefined });
});
it("records a contract with the deployed request fields", async () => {
  client.put.mockResolvedValue({ id: 321, rentalType: "longterm", contractLink: "https://example.com/a.pdf", signedAt: "2026-10-10T03:00:00Z" });
  const result = await updateRentalContract(321, "https://example.com/a.pdf", "2026-10-10T03:00:00Z");
  expect(client.put).toHaveBeenCalledWith("rentals/321/contract", { contractLink: "https://example.com/a.pdf", signedAt: "2026-10-10T03:00:00Z" });
  expect(result.contractLink).toBe("https://example.com/a.pdf");
});
