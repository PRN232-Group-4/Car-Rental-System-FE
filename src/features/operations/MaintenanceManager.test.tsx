import { beforeAll, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";

const api = vi.hoisted(() => ({ getMaintenance: vi.fn(), saveMaintenance: vi.fn(), getFacilities: vi.fn(), getVehicles: vi.fn(), getStaffById: vi.fn(), getInspectionTechnicians: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "Admin" }));
vi.mock("./extended-api", () => ({ getMaintenance: api.getMaintenance, saveMaintenance: api.saveMaintenance }));
vi.mock("./technician-api", async (importOriginal) => ({ ...await importOriginal<typeof import("./technician-api")>(), getInspectionTechnicians: api.getInspectionTechnicians }));
vi.mock("@/features/admin/api", () => ({ getFacilities: api.getFacilities, getVehicles: api.getVehicles, getStaffById: api.getStaffById }));
vi.mock("@/features/auth", () => ({ useAuth: () => ({ hasRole: (role: string) => role.toLowerCase() === auth.role.toLowerCase() }) }));
vi.mock("@/features/auth/AuthContext", () => ({ useOptionalSession: () => ({ user: { email: "me@example.com" }, hasAnyRole: (roles: string[]) => roles.includes(auth.role) }) }));
vi.mock("@/features/admin/VehicleName", () => ({ default: () => <>Xe thử nghiệm</> }));
vi.mock("@/features/admin/VehiclePhotos", () => ({ default: () => null }));
import MaintenanceManager from "./MaintenanceManager";

const record = { id: 42, vehicleId: 3, facilityId: 8, facilityName: "Chi nhánh Thủ Đức", assignedStaffId: 9, assignedStaffEmail: "tech@example.com", status: "scheduled", maintenanceType: "Định kỳ", scheduledDate: null, isSafe: null, description: null, cost: null };

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

beforeEach(() => {
  vi.resetAllMocks();
  auth.role = "Admin";
  api.getMaintenance.mockResolvedValue({ items: [], totalCount: 0 });
  api.getFacilities.mockResolvedValue([{ id: 8, name: "Chi nhánh Thủ Đức" }]);
  api.getVehicles.mockResolvedValue({ items: [{ id: 3, brand: "Toyota", model: "Vios", licensePlate: "51A-123.45" }], totalCount: 1 });
  api.getInspectionTechnicians.mockResolvedValue([
    { id: 9, email: "tech@example.com", fullName: "Kỹ thuật viên", isActive: true, staffRole: "Maintenance" },
    { id: 10, email: "inactive@example.com", isActive: false, staffRole: "Maintenance" },
    { id: 11, email: "driver@example.com", isActive: true, staffRole: "Driver" },
  ]);
  api.getStaffById.mockResolvedValue({ id: 9, email: "tech@example.com" });
  api.saveMaintenance.mockResolvedValue(record);
});

function setup() {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MaintenanceManager /></QueryClientProvider>);
}

async function openCreate() {
  setup();
  await screen.findByText("Không có phiếu bảo trì phù hợp.");
  fireEvent.click(screen.getByRole("button", { name: "Tạo phiếu bảo trì" }));
  return screen.findByRole("combobox", { name: "Email kỹ thuật viên phụ trách (tùy chọn)" });
}

it("shows active technician emails and facility names while submitting their numeric IDs", async () => {
  const technician = await openCreate();
  expect(screen.getByRole("option", { name: "tech@example.com" })).toHaveValue("9");
  expect(screen.queryByRole("option", { name: "inactive@example.com" })).not.toBeInTheDocument();
  expect(screen.queryByRole("option", { name: "driver@example.com" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Mã nhân viên/)).not.toBeInTheDocument();
  const facility = screen.getByRole("combobox", { name: "Cơ sở phụ trách (tùy chọn)" });
  expect(screen.getByRole("option", { name: "Chi nhánh Thủ Đức" })).toHaveValue("8");
  fireEvent.change(screen.getByLabelText("Phương tiện *"), { target: { value: "3" } });
  fireEvent.change(technician, { target: { value: "9" } });
  fireEvent.change(facility, { target: { value: "8" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu phiếu bảo trì" }));
  await waitFor(() => expect(api.saveMaintenance).toHaveBeenCalledWith(expect.objectContaining({ vehicleId: 3, facilityId: 8, assignedStaffId: 9 }), undefined));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

it("preserves selected emails and maps backend assignedStaffId errors beneath the select", async () => {
  api.saveMaintenance.mockRejectedValue(new ApiClientError(400, "Bad Request", { error: { errors: { AssignedStaffId: ["Kỹ thuật viên đã ngừng hoạt động. Vui lòng chọn người khác."] } } }));
  const technician = await openCreate();
  fireEvent.change(screen.getByLabelText("Phương tiện *"), { target: { value: "3" } });
  fireEvent.change(technician, { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu phiếu bảo trì" }));
  await screen.findByText("Kỹ thuật viên đã ngừng hoạt động. Vui lòng chọn người khác.");
  expect(technician).toHaveValue("9");
  expect(technician).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("dialog")).toBeVisible();
  fireEvent.change(technician, { target: { value: "" } });
  expect(technician).toHaveAttribute("aria-invalid", "false");
});

it("keeps the saved assignee visible but requires replacing an unavailable technician", async () => {
  api.getMaintenance.mockResolvedValue({ items: [{ ...record, assignedStaffId: 10, assignedStaffEmail: "inactive@example.com" }], totalCount: 1 });
  setup();
  await screen.findByText("inactive@example.com");
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật" }));
  const technician = await screen.findByRole("combobox", { name: "Email kỹ thuật viên phụ trách (tùy chọn)" });
  expect(technician).toHaveValue("10");
  expect(screen.getByRole("option", { name: "inactive@example.com (không khả dụng)" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Lưu phiếu bảo trì" }));
  await screen.findByText("Vui lòng chọn kỹ thuật viên đang hoạt động hoặc bỏ phân công.");
  expect(api.saveMaintenance).not.toHaveBeenCalled();
});

it("blocks saving on directory failure and offers retry without losing input", async () => {
  api.getInspectionTechnicians.mockRejectedValueOnce(new TypeError("offline"));
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Tạo phiếu bảo trì" }));
  await screen.findByText("Không thể tải kỹ thuật viên.");
  expect(screen.getByRole("button", { name: "Lưu phiếu bảo trì" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Tải lại kỹ thuật viên" }));
  await screen.findByRole("option", { name: "tech@example.com" });
  expect(screen.getByRole("button", { name: "Lưu phiếu bảo trì" })).toBeEnabled();
});

it("shows the assigned email to Maintenance without fetching the management staff directory", async () => {
  auth.role = "Maintenance";
  api.getMaintenance.mockResolvedValue({ items: [record], totalCount: 1 });
  setup();
  await screen.findByText("tech@example.com");
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật" }));
  const technician = await screen.findByRole("combobox", { name: "Email kỹ thuật viên phụ trách (tùy chọn)" });
  expect(technician).toBeDisabled();
  expect(technician).toHaveValue("9");
  expect(screen.getByRole("option", { name: "tech@example.com" })).toBeInTheDocument();
  expect(api.getInspectionTechnicians).not.toHaveBeenCalled();
  expect(api.getStaffById).not.toHaveBeenCalled();
  expect(api.getFacilities).not.toHaveBeenCalled();
  expect(screen.getByRole("combobox", { name: "Cơ sở phụ trách (tùy chọn)" })).toBeDisabled();
  expect(screen.getByRole("option", { name: "Chi nhánh Thủ Đức" })).toBeInTheDocument();
});
