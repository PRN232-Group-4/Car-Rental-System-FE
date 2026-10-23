import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BookingForm from "./BookingForm";

const mocks = vi.hoisted(() => ({ license: vi.fn(), create: vi.fn(), push: vi.fn() }));
const params = new URLSearchParams({ vehicleId: "8", facilityId: "1", mode: "self", startTime: "2027-11-01T10:00", endTime: "2027-11-01T12:00", paymentMethod: "cash" });
vi.mock("next/navigation", () => ({ useSearchParams: () => params }));
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => ({ push: mocks.push }) }));
vi.mock("@/components/navigation/NavigationLink", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));
vi.mock("@/features/licenses", () => ({ getCustomerLicense: mocks.license }));
vi.mock("@/features/facilities", () => ({ getFacilities: async () => [{ id: "1", name: "Cơ sở thử" }] }));
vi.mock("@/features/subscriptions", () => ({ getMySubscriptions: async () => [] }));
vi.mock("@/features/invoices/api", () => ({ getInvoices: async () => [] }));
vi.mock("../api", () => ({
  createRentalBooking: mocks.create,
  getActivePolicyForVehicleType: async () => null,
  getBookingPolicies: async () => [],
  getBookingVehicles: async () => [{ id: 8, facilityId: "1", name: "Xe thử", hourlyPrice: 100000, monthlyPrice: 1000000, allowedLicenseTypes: ["B"] }],
}));
vi.mock("@/components/ui/VehicleImage", () => ({ default: () => null }));
vi.mock("@/features/admin/VehicleName", () => ({ default: () => null }));
vi.mock("@/features/facilities/components/BookingPickupMap", () => ({ default: () => null }));
vi.mock("./BookingVehicleCards", () => ({ default: () => null }));

const first = { id: 1, number: "A123", type: "A1", issueDate: "2020-01-01", expiryDate: "2099-01-01", status: "approved" };
const second = { ...first, id: 2, number: "B456", type: "B" };
async function open() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><BookingForm /></QueryClientProvider>);
  await screen.findByText("Xe thử", { exact: true });
  await waitFor(() => expect(screen.getByRole("button", { name: "Xác nhận đặt xe" })).toBeEnabled());
}
beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ bookingId: 42 }); });
afterEach(cleanup);
describe("self-drive license gate", () => {
  it("books with an approved suitable secondary license without redirecting", async () => {
    mocks.license.mockResolvedValue({ ...first, licenses: [first, second] });
    await open();
    await screen.findByText("Bạn đã có GPLX phù hợp với xe và thời gian thuê.");
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đặt xe" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ vehicleId: 8, hasDriver: false, paymentMethod: "cash" })));
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it("keeps a suitable pending license on booking with an inline explanation", async () => {
    mocks.license.mockResolvedValue({ ...first, licenses: [first, { ...second, status: "pending" }] });
    await open();
    await screen.findByText("GPLX phù hợp đang chờ duyệt. Bạn không cần gửi lại hồ sơ.");
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đặt xe" }));
    await screen.findByText("GPLX phù hợp đang chờ duyệt. Vui lòng chờ được phê duyệt hoặc chọn thuê có tài xế.");
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("redirects only when no suitable license exists and preserves booking choices", async () => {
    mocks.license.mockResolvedValue({ ...first, licenses: [first] });
    await open();
    await screen.findByRole("link", { name: "Bổ sung GPLX phù hợp để thuê xe này" });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đặt xe" }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    const destination = new URL(mocks.push.mock.calls[0][0], "https://test.local");
    expect(destination.pathname).toBe("/driver-license");
    const back = new URL(destination.searchParams.get("returnTo")!, "https://test.local");
    expect(back.pathname).toBe("/booking");
    for (const [key, value] of params) expect(back.searchParams.get(key)).toBe(value);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
