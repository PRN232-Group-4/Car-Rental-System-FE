import { afterEach, describe, expect, it, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { defaultApiClient } from "@/api/default-api-client";
import { ApiProblemError } from "@/api/api-client";
import { fetchRentalPolicies, fetchSubscriptionPlans, createRentalPolicy } from "@/features/admin/policies/api";
import { mapStaff, updateStaff, uploadLicenseImage } from "@/features/admin/staff/api";
import type { StaffDto } from "@/features/admin/api";
import { fetchMyTrips, fetchMyTripDetail, fetchCancellationPreview, cancelTrip } from "@/features/account/trips/api";
import { fetchFleetStatus, fetchRentalsByStatus, fetchRevenueSeries } from "@/features/admin/dashboard/api";
import { getVehicles } from "@/features/vehicles/api";
import { mapVehicleFromBE } from "@/features/vehicles/mappers";

afterEach(() => vi.restoreAllMocks());

const staff: StaffDto = {
  id: 17, userId: 27, email: "an@example.com", fullName: "Nguyễn Văn An", phone: "0900000000",
  departmentId: 4, departmentName: "Kỹ thuật", facilityId: 8, facilityName: "Thủ Đức", hiredDate: "2025-01-01",
  isDriver: false, licenseNumber: "123456789012", licenseType: "B2", licenseIssueDate: "2020-01-01",
  licenseExpiryDate: "2030-01-01", licenseImageUrl: "https://example.com/license.jpg", rating: null, isActive: true, staffRole: "Maintenance",
};
const trip = {
  id: 77, status: "pending", rentalType: "hourly", isSubscription: false,
  vehicle: { id: 18, brand: "Honda", model: "City" }, facility: { id: 5, name: "Chi nhánh Quận 1", phone: null },
  start: "2027-01-01T08:00:00Z", end: "2027-01-01T12:00:00Z", hasDriver: false, canCancel: false,
  price: { rent: 1000000, vat: 100000, deposit: 200000, overtime: 0, total: 1300000 },
  inspections: [{ type: "pre_rental", isOk: true, imgUrls: '["https://example.com/inspection.jpg"]' }],
  timeline: [{ to: "pending", at: "2027-01-01T07:00:00Z", actor: "customer" }],
};
const filters = { from: "2027-01-01T00:00:00Z", to: "2027-01-31T23:59:59Z", preset: "custom" as const };

describe("Runtime adapters never substitute mock data", () => {
  it("loads every policy page using relative API paths", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValueOnce({ items: [{ id: 11 }], totalCount: 2 }).mockResolvedValueOnce({ items: [{ id: 12 }], totalCount: 2 });
    expect(await fetchRentalPolicies()).toEqual([{ id: 11 }, { id: 12 }]);
    expect(get).toHaveBeenNthCalledWith(1, "rental-policies", { page: 1, pageSize: 100 });
    expect(get).toHaveBeenNthCalledWith(2, "rental-policies", { page: 2, pageSize: 100 });
  });
  it("requests inactive plans using the deployed all parameter", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue([]);
    expect(await fetchSubscriptionPlans(true)).toEqual([]);
    expect(get).toHaveBeenCalledWith("subscription-plans", { all: true });
  });
  it("retains backend validation and network failures on policy writes", async () => {
    const error = new ApiProblemError(400, "Validation", { errors: { Name: ["Tên không hợp lệ"] } });
    const post = vi.spyOn(backendApiClient, "post").mockRejectedValueOnce(error).mockRejectedValueOnce(new Error("Offline"));
    const input = { vehicleTypeId: 9, name: "Chính sách", vatRate: 10, overtimeFeeRate: 15, depositPercentage: 20, isActive: true };
    await expect(createRentalPolicy(input)).rejects.toBe(error);
    await expect(createRentalPolicy(input)).rejects.toThrow("Offline");
    expect(post).toHaveBeenCalledTimes(2);
  });
  it("maps staff from actual profile fields without fabricated trip counts", () => {
    const result = mapStaff(staff);
    expect(result).toMatchObject({ fullName: staff.fullName, department: { id: 4, name: "Kỹ thuật" }, license: { number: staff.licenseNumber } });
    expect(result.totalTrips).toBeUndefined();
  });
  it("preserves other PUT fields while updating staff organization", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(staff);
    const put = vi.spyOn(backendApiClient, "put").mockResolvedValue({ ...staff, departmentId: 6 });
    await updateStaff({ staffId: 17, departmentId: 6 });
    expect(put).toHaveBeenCalledWith("staff/17", expect.objectContaining({ departmentId: 6, fullName: staff.fullName, facilityId: 8, licenseNumber: staff.licenseNumber, staffRole: "Maintenance" }));
  });
  it("uploads GPLX to the server and rejects invalid files before sending", async () => {
    const post = vi.spyOn(backendApiClient, "post").mockResolvedValue({ secureUrl: "https://example.com/upload.jpg" });
    await expect(uploadLicenseImage(new File(["image"], "license.png", { type: "image/png" }))).resolves.toEqual({ url: "https://example.com/upload.jpg" });
    expect(post).toHaveBeenCalledWith("media/staff-license", expect.any(FormData));
    await expect(uploadLicenseImage(new File(["text"], "license.txt", { type: "text/plain" }))).rejects.toThrow("JPG");
    expect(post).toHaveBeenCalledTimes(1);
  });
  it("maps flat trip summaries but does not assume cancellation permission", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue({ items: [{ id: 77, status: "pending", rentalType: "hourly", isSubscription: false, vehicleId: 18, vehicleBrand: "Honda", vehicleModel: "City", startTime: trip.start, endTime: trip.end, totalPrice: 1300000 }], totalCount: 1, page: 1, pageSize: 12 });
    expect((await fetchMyTrips()).items[0]).toMatchObject({ vehicle: { id: 18, brand: "Honda", model: "City" }, start: trip.start, canCancel: false });
  });

  it("retains the server cancellation flag only before renting", async () => {
    vi.spyOn(backendApiClient,"get").mockResolvedValue({items:[
      {id:77,status:"pre_inspection",canCancel:true},
      {id:78,status:"renting",canCancel:true},
    ],page:1,pageSize:12,totalCount:2});
    expect((await fetchMyTrips()).items.map(item=>item.canCancel)).toEqual([true,false]);
  });
  it("maps detail prices, facility reference and serialized inspection images", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(trip);
    expect(await fetchMyTripDetail(77)).toMatchObject({ totalPrice: 1300000, facility: { name: "Chi nhánh Quận 1" }, inspections: [{ imgUrls: ["https://example.com/inspection.jpg"] }], canCancel: false });
  });
  it("rejects malformed detail/image payloads rather than returning fixtures", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValueOnce({ ...trip, id: 88 }).mockResolvedValueOnce({ ...trip, inspections: [{ type: "pre_rental", imgUrls: "[broken" }] });
    await expect(fetchMyTripDetail(77)).rejects.toThrow("không hợp lệ");
    await expect(fetchMyTripDetail(77)).rejects.toThrow();
  });
  it("uses the backend cancellation decision and does not calculate a local fee policy", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue({ allowed: false, feeAmount: 70000, refundAmount: 30000, reasons: ["Không thể tự hủy"] });
    expect(await fetchCancellationPreview(77)).toMatchObject({ rentalId: 77, canCancel: false, cancellationFee: 70000, refundAmount: 30000 });
  });
  it("reloads the authoritative detail after lifecycle cancellation", async () => {
    const post = vi.spyOn(backendApiClient, "post").mockResolvedValue({ rentalId: 77, toStatus: "cancelled" });
    vi.spyOn(backendApiClient, "get").mockResolvedValue({ ...trip, status: "cancelled" });
    expect((await cancelTrip({ rentalId: 77, reason: "Đổi lịch" })).status).toBe("cancelled");
    expect(post).toHaveBeenCalledWith("rentals/77/cancel", { reason: "Đổi lịch", initiator: "customer", waiveFee: false });
  });
  it("does not update trip data locally after cancellation fails", async () => {
    vi.spyOn(backendApiClient, "post").mockRejectedValue(new Error("Offline"));
    const get = vi.spyOn(backendApiClient, "get");
    await expect(cancelTrip({ rentalId: 77, reason: "Đổi lịch" })).rejects.toThrow("Offline");
    expect(get).not.toHaveBeenCalled();
  });
  it("uses server counts for fleet and rental status charts, including real zero counts", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue({ totalCount: 0 });
    expect(await fetchFleetStatus(filters)).toEqual({ available: 0, renting: 0, maintenance: 0, inactive: 0 });
    expect((await fetchRentalsByStatus(filters)).every((row) => row.count === 0)).toBe(true);
    expect(get).toHaveBeenCalledWith("rentals", expect.objectContaining({ status: "completed", from: filters.from, pageSize: 1 }));
  });
  it("loads revenue from the deployed dashboard endpoint without fabricating data", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue({ items: [], page: 1, pageSize: 100, totalCount: 0 });
    expect(await fetchRevenueSeries(filters)).toEqual([]);
    expect(get).toHaveBeenCalledWith("dashboard/revenue-series", expect.objectContaining({ from: filters.from, to: filters.to, page: 1, pageSize: 100 }));
  });
  it("loads all public vehicle pages without fallback specifications", async () => {
    const get = vi.spyOn(defaultApiClient, "get").mockResolvedValueOnce({ items: [{ id: 1, vehicleType: { id: 1, type: "car" }, brand: "Honda", model: "City" }], totalCount: 2 }).mockResolvedValueOnce({ items: [{ id: 2, vehicleType: { id: 1, type: "car" }, brand: "Toyota", model: "Vios" }], totalCount: 2 });
    expect((await getVehicles()).map((vehicle) => vehicle.id)).toEqual([1, 2]);
    expect(get).toHaveBeenNthCalledWith(1,"vehicles/search",{page:1,pageSize:100});
    expect(get).toHaveBeenNthCalledWith(2,"vehicles/search",{page:2,pageSize:100});
    const missing = mapVehicleFromBE({ id: 99 });
    expect(missing.seats).toBeUndefined();
    expect(missing.transmission).toBe("");
    expect(missing.isAvailable).toBe(false);
    expect(missing.hasDriverOption).toBeUndefined();
  });
});
