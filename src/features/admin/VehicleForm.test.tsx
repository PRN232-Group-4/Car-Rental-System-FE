import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ getVehicle: vi.fn(), getVehicleTypes: vi.fn(), getFacilities: vi.fn(), createVehicle: vi.fn(), updateVehicle: vi.fn(), uploadVehicleImage: vi.fn() }));
vi.mock("./api", () => api);
vi.mock("@/features/auth", () => ({ useAuth: () => ({ hasRole: (role: string) => role === "admin" }) }));
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/navigation/NavigationLink", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/features/maps/VehicleTrackingPanel", () => ({ default: () => null }));
import VehicleForm from "./VehicleForm";

beforeEach(() => {
  vi.resetAllMocks();
  api.getVehicleTypes.mockResolvedValue([{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]);
  api.getFacilities.mockResolvedValue([{ id: 2, name: "Thủ Đức" }]);
  api.getVehicle.mockResolvedValue({ id: 4, vehicleTypeId: 1, brand: "Toyota", model: "Vios", facilityId: 2, status: "maintenance", maintenanceTechnicianEmails: ["assigned@example.com"], detail: {} });
});
afterEach(() => window.history.replaceState({}, "", "/"));

it("loads the persisted vehicle using the fleet edit link and displays its current technician email", async () => {
  window.history.replaceState({}, "", "/admin/vehicles/edit?id=4");
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><VehicleForm /></QueryClientProvider>);
  expect(await screen.findByText("assigned@example.com")).toBeVisible();
  expect(api.getVehicle).toHaveBeenCalledExactlyOnceWith(4);
  expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeVisible();
  expect(screen.getByLabelText("Trạng thái")).toHaveValue("maintenance");
});
