import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const api = vi.hoisted(() => ({ getVehicles: vi.fn(), deleteVehicle: vi.fn() }));
vi.mock("@/features/admin/api", () => api);
vi.mock("@/features/auth", () => ({ useAuth: () => ({ hasRole: (role: string) => role === "admin" }) }));
vi.mock("@/features/admin/VehiclePhotos", () => ({ default: () => null }));
import FleetRegistry from "./FleetRegistry";

beforeEach(() => vi.resetAllMocks());
function setup() {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><FleetRegistry /></QueryClientProvider>);
}

it("shows assigned technician emails in the maintenance row and selected vehicle folio", async () => {
  api.getVehicles.mockResolvedValue({ items: [
    { id: 1, status: "maintenance", brand: "Toyota", model: "Vios", licensePlate: "51A-123.45", maintenanceTechnicianEmails: ["assigned@example.com"] },
    { id: 2, status: "available", brand: "Honda", model: "City", licensePlate: "51A-222.22", maintenanceTechnicianEmails: ["old@example.com"] },
  ], totalCount: 2 });
  setup();
  const row = await screen.findByRole("button", { name: /51A-123.45.*assigned@example.com/ });
  expect(within(row).getByText("assigned@example.com")).toBeVisible();
  const folio = screen.getByRole("complementary", { name: "Hồ sơ chi tiết phương tiện" });
  expect(within(folio).getByText("assigned@example.com")).toBeVisible();
  expect(screen.queryByText("old@example.com")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /51A-222.22/ }));
  expect(within(folio).queryByText("Kỹ thuật viên phụ trách")).not.toBeInTheDocument();
  expect(api.getVehicles).toHaveBeenCalledExactlyOnceWith({ status: undefined, page: 1, pageSize: 8 });
});

it("shows an honest unassigned state instead of a historical staff fallback", async () => {
  api.getVehicles.mockResolvedValue({ items: [{ id: 1, status: "maintenance", brand: "Toyota", model: "Vios", licensePlate: "51A-123.45", maintenanceTechnicianEmails: [] }], totalCount: 1 });
  setup();
  await screen.findByRole("button", { name: /51A-123.45.*Chưa phân công kỹ thuật viên/ });
  expect(screen.getAllByText("Chưa phân công kỹ thuật viên")).toHaveLength(2);
});
