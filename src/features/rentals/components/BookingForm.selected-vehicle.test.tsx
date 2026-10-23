import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BookingForm from "./BookingForm";

const mocks = vi.hoisted(() => ({ vehicle: vi.fn(), search: vi.fn(), create: vi.fn(), policy: vi.fn(), params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => mocks.params }));
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/navigation/NavigationLink", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));
vi.mock("@/features/vehicles/api", () => ({ getVehicleById: mocks.vehicle }));
vi.mock("@/features/licenses", () => ({ getCustomerLicense: async () => ({ licenses: [{ id: 1, number: "B123", type: "B", status: "approved", expiryDate: "2099-01-01" }] }) }));
vi.mock("@/features/facilities", () => ({ getFacilities: async () => [{ id: "1", name: "Cơ sở một" }, { id: "2", name: "Cơ sở hai" }] }));
vi.mock("@/features/subscriptions", () => ({ getMySubscriptions: async () => [] }));
vi.mock("@/features/invoices/api", () => ({ getInvoices: async () => [] }));
vi.mock("../api", () => ({ createRentalBooking: mocks.create, getActivePolicyForVehicleType: mocks.policy, getBookingPolicies: async () => [], getBookingVehicles: mocks.search }));
vi.mock("@/components/ui/VehicleImage", () => ({ default: () => null }));
vi.mock("@/features/admin/VehicleName", () => ({ default: () => null }));
vi.mock("@/features/facilities/components/BookingPickupMap", () => ({ default: () => null }));

const chosen = { id: 8, facilityId: "1", vehicleTypeId: 3, name: "Xe đã chọn", hourlyPrice: 125000, monthlyPrice: 3000000, allowedLicenseTypes: ["B"] };
function open() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><BookingForm /></QueryClientProvider>);
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams({ vehicleId: "8", mode: "self", from: "2027-11-01T03:00:00Z", to: "2027-11-01T05:00:00Z", paymentMethod: "cash", hourlyPrice: "1" });
  mocks.vehicle.mockResolvedValue({ ...chosen, hourlyPrice: 1 });
  mocks.search.mockResolvedValue([chosen]);
  mocks.policy.mockResolvedValue(null);
  mocks.create.mockResolvedValue({ bookingId: 42 });
});
afterEach(cleanup);

describe("booking selected vehicle context", () => {
  it("recovers the selected vehicle's branch on a direct URL and uses current availability and pricing", async () => {
    open();
    await waitFor(() => expect(screen.getByRole("radio", { name: "Xe đã chọn" })).toBeChecked());
    expect(mocks.vehicle).toHaveBeenCalledWith("8");
    expect(screen.getByLabelText("Cơ sở nhận xe")).toHaveValue("1");
    expect(screen.getByLabelText("Ngày giờ nhận xe")).toHaveValue("2027-11-01T10:00");
    expect(screen.getByLabelText("Ngày giờ trả xe")).toHaveValue("2027-11-01T12:00");
    expect(mocks.search).toHaveBeenCalledWith("2027-11-01T03:00:00.000Z", "2027-11-01T05:00:00.000Z", "1", false, "hourly", expect.any(AbortSignal));
    expect(screen.getByText("Đơn giá: 125.000 đ / giờ")).toBeVisible();
    await waitFor(() => expect(mocks.policy).toHaveBeenCalledWith(3));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đặt xe" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ vehicleId: 8, hasDriver: false, startTime: "2027-11-01T03:00:00.000Z" })));
  });

  it("keeps the same available vehicle while changing driving and rental choices, and clears it on branch change", async () => {
    mocks.params.set("facilityId", "1");
    open();
    await waitFor(() => expect(screen.getByRole("radio", { name: "Xe đã chọn" })).toBeChecked());
    fireEvent.change(screen.getByLabelText("Hình thức lái"), { target: { value: "true" } });
    await waitFor(() => expect(screen.getByRole("radio", { name: "Xe đã chọn" })).toBeChecked());
    fireEvent.change(screen.getByLabelText("Hình thức thuê"), { target: { value: "longterm" } });
    await waitFor(() => expect(screen.getByRole("radio", { name: "Xe đã chọn" })).toBeChecked());
    expect(screen.getByLabelText("Ngày giờ nhận xe")).toHaveValue("2027-11-01T10:00");
    expect(mocks.vehicle).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Cơ sở nhận xe"), { target: { value: "2" } });
    await waitFor(() => expect(screen.getByRole("radio", { name: "Xe đã chọn" })).not.toBeChecked());
  });

  it("does not book a vehicle absent from the current availability results", async () => {
    mocks.search.mockResolvedValue([]);
    open();
    await screen.findByText("Chưa có xe chưa được thuê phù hợp thời gian này. Vui lòng chọn thời gian hoặc cơ sở khác.");
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đặt xe" }));
    await screen.findByText("Vui lòng chọn xe khả dụng trong khoảng thời gian thuê.");
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
