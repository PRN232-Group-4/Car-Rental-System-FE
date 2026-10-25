import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";

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

it("shows every license choice and selected license cards, then saves checkbox changes", async () => {
  api.getVehicle.mockResolvedValue({ id: 4, vehicleTypeId: 1, brand: "Toyota", model: "Vios", facilityId: 2, status: "available", allowedLicenseTypes: ["B", "B2"], detail: {} });
  render(<QueryClientProvider client={new QueryClient()}><VehicleForm editingVehicleId={4} onSaved={vi.fn()} /></QueryClientProvider>);
  expect(await screen.findByRole("checkbox", { name: "Chấp nhận hạng B" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Chấp nhận hạng B2" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Chấp nhận hạng A1" })).not.toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Chấp nhận hạng DE" })).toBeVisible();
  expect(within(screen.getByRole("list", { name: "Các hạng bằng đã chọn" })).getByText("Hạng B2")).toBeVisible();
  fireEvent.click(screen.getByRole("checkbox", { name: "Chấp nhận hạng B2" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Chấp nhận hạng C1" }));
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  await waitFor(() => expect(api.updateVehicle).toHaveBeenCalledWith(4, expect.objectContaining({ allowedLicenseTypes: ["B", "C1"] })));
});

it("keeps invalid license classes in the form and reports the error inline", async () => {
  render(<QueryClientProvider client={new QueryClient()}><VehicleForm editingVehicleId={4} /></QueryClientProvider>);
  const input = await screen.findByLabelText("Hạng khác trong hồ sơ (nếu có)");
  fireEvent.change(input, { target: { value: "B/invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByText(/Chọn tối đa 30 hạng bằng/)).toBeVisible();
  expect(api.updateVehicle).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "CUSTOM" } });
  expect(screen.queryByText(/Chọn tối đa 30 hạng bằng/)).not.toBeInTheDocument();
  expect(input).toHaveAttribute("aria-invalid", "false");
});

it("shows unconfigured vehicles as hidden from customers and can reset selections", async () => {
  render(<QueryClientProvider client={new QueryClient()}><VehicleForm editingVehicleId={4} /></QueryClientProvider>);
  const all = await screen.findByRole("checkbox", { name: /Chưa cấu hình hạng bằng/ });
  expect(all).toBeChecked();
  expect(screen.getByRole("status")).toHaveTextContent("Xe đang ẩn khỏi danh sách cho khách");
  fireEvent.click(screen.getByRole("checkbox", { name: "Chấp nhận hạng A1" }));
  expect(all).not.toBeChecked();
  expect(screen.getByText("Hạng A1")).toBeVisible();
  fireEvent.click(all);
  expect(all).toBeChecked();
  expect(screen.queryByRole("list", { name: "Các hạng bằng đã chọn" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  await waitFor(() => expect(api.updateVehicle).toHaveBeenCalledWith(4, expect.objectContaining({ allowedLicenseTypes: [] })));
});

it("preserves custom persisted classes and normalizes extra entries without duplicate classes", async () => {
  api.getVehicle.mockResolvedValue({ id: 4, vehicleTypeId: 1, brand: "Toyota", model: "Vios", facilityId: 2, status: "available", allowedLicenseTypes: ["B", "SPECIAL"], detail: {} });
  render(<QueryClientProvider client={new QueryClient()}><VehicleForm editingVehicleId={4} /></QueryClientProvider>);
  const input = await screen.findByLabelText("Hạng khác trong hồ sơ (nếu có)");
  expect(input).toHaveValue("SPECIAL");
  fireEvent.change(input, { target: { value: " special, " } });
  expect(input).toHaveValue("special, ");
  fireEvent.change(input, { target: { value: " special, custom, B " } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  await waitFor(() => expect(api.updateVehicle).toHaveBeenCalledWith(4, expect.objectContaining({ allowedLicenseTypes: ["B", "SPECIAL", "CUSTOM"] })));
});

it("maps backend class errors inline and keeps the selected classes for correction", async () => {
  api.updateVehicle.mockRejectedValue(new ApiClientError(400, "Bad Request", { errors: { AllowedLicenseTypes: ["Hạng bằng chưa hợp lệ. Vui lòng kiểm tra cấu hình."] } }));
  render(<QueryClientProvider client={new QueryClient()}><VehicleForm editingVehicleId={4} /></QueryClientProvider>);
  const choice = await screen.findByRole("checkbox", { name: "Chấp nhận hạng B2" });
  fireEvent.click(choice);
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(await screen.findByText("Hạng bằng chưa hợp lệ. Vui lòng kiểm tra cấu hình.")).toBeVisible();
  expect(choice).toBeChecked();
  expect(choice).toHaveAttribute("aria-invalid", "true");
  expect(choice).toHaveAttribute("aria-describedby", expect.stringContaining("allowedLicenseTypes-error"));
  fireEvent.click(choice);
  expect(screen.queryByText("Hạng bằng chưa hợp lệ. Vui lòng kiểm tra cấu hình.")).not.toBeInTheDocument();
});
