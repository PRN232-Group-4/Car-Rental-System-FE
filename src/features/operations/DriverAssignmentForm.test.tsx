import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { RENTAL_101 } from "@/__tests__/features/admin/rentals/rental-fixture";

const api = vi.hoisted(() => ({ getAssignableDrivers: vi.fn(), assignDriverToRental: vi.fn(), getOperationalDrivers: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "Admin" }));
vi.mock("@/features/auth/AuthContext", () => ({ useOptionalSession: () => ({ hasAnyRole: (roles: string[]) => roles.includes(auth.role) }) }));
vi.mock("@/features/admin/staff/api", () => ({ getAssignableDrivers: api.getAssignableDrivers, assignDriverToRental: api.assignDriverToRental }));
vi.mock("./api", async original => ({ ...await original<typeof import("./api")>(), getOperationalDrivers: api.getOperationalDrivers }));
vi.mock("@/features/admin/VehicleName", () => ({ default: () => <span>Xe của đơn thuê</span> }));
import DriverAssignmentForm from "./DriverAssignmentForm";

beforeEach(() => {
  vi.resetAllMocks();
  auth.role = "Admin";
  api.getAssignableDrivers.mockResolvedValue([{ staffId: 7, fullName: "Tài xế hợp lệ", eligible: true, reasons: [] }, { staffId: 8, fullName: "Tài xế bận", eligible: false, reasons: ["BUSY"] }]);
  api.getOperationalDrivers.mockResolvedValue([{ id: 7, email: "driver@example.com" }, { id: 8, email: "busy@example.com" }]);
  api.assignDriverToRental.mockResolvedValue(undefined);
});

function setup(overrides = {}, props = {}) {
  const refresh = vi.fn().mockResolvedValue(undefined);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><DriverAssignmentForm rental={{ ...RENTAL_101, hasDriver: true, status: "pre_inspection", ...overrides }} refresh={refresh} {...props} /></QueryClientProvider>);
  return { refresh };
}

it("requires a driver and excludes candidates that the server marks busy", async () => {
  const { refresh } = setup();
  await screen.findByRole("option", { name: "driver@example.com" });
  expect(api.getAssignableDrivers).toHaveBeenCalledWith(101);
  expect(screen.getByRole("option", { name: /busy@example.com.*Đã có lịch trùng/ })).toBeDisabled();
  expect(screen.queryByRole("option", { name: /tự lái/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Lưu phân công" }));
  expect(await screen.findByText("Vui lòng chọn tài xế cho đơn thuê có tài xế.")).toBeVisible();
  expect(screen.getByLabelText("Tài xế nhận lệnh")).toHaveAttribute("aria-invalid", "true");
  expect(api.assignDriverToRental).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Tài xế nhận lệnh"), { target: { value: "7" } });
  expect(screen.queryByText("Vui lòng chọn tài xế cho đơn thuê có tài xế.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Lưu phân công" }));
  await waitFor(() => expect(api.assignDriverToRental).toHaveBeenCalledWith({ rentalId: 101, driverStaffId: 7, reason: "other", notes: undefined }));
  await screen.findByText("Đã lưu phân công tài xế cho xe của đơn thuê.");
  expect(refresh).toHaveBeenCalledOnce();
});

it("retains selected driver and maps backend field errors without claiming success", async () => {
  api.assignDriverToRental.mockRejectedValue(new ApiClientError(400, "Không hợp lệ", { error: { errors: { DriverStaffId: ["Tài xế vừa được phân cho chuyến khác. Vui lòng chọn lại."] } } }));
  const { refresh } = setup();
  await screen.findByRole("option", { name: "driver@example.com" });
  fireEvent.change(screen.getByLabelText("Tài xế nhận lệnh"), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu phân công" }));
  await screen.findByText("Tài xế vừa được phân cho chuyến khác. Vui lòng chọn lại.");
  expect(screen.getByLabelText("Tài xế nhận lệnh")).toHaveValue("7");
  expect(refresh).not.toHaveBeenCalled();
  expect(screen.queryByText("Đã lưu phân công tài xế cho xe của đơn thuê.")).not.toBeInTheDocument();
});

it("explains an empty eligible list and blocks submission", async () => {
  api.getAssignableDrivers.mockResolvedValue([]);
  setup();
  await screen.findByText(/Chưa có tài xế đủ điều kiện/);
  expect(screen.getByRole("button", { name: "Lưu phân công" })).toBeDisabled();
});

it("blocks network failures and provides a retry", async () => {
  api.getAssignableDrivers.mockRejectedValueOnce(new TypeError("Failed to fetch"));
  setup();
  await screen.findByRole("alert");
  expect(screen.getByRole("button", { name: "Lưu phân công" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Tải lại tài xế" }));
  await screen.findByRole("option", { name: "driver@example.com" });
  expect(screen.getByRole("button", { name: "Lưu phân công" })).toBeEnabled();
});

it.each([{ hasDriver: false }, { status: "completed" }, { status: "cancelled" }])("does not offer driver assignment for %o", overrides => {
  setup(overrides);
  expect(api.getAssignableDrivers).not.toHaveBeenCalled();
  expect(api.getOperationalDrivers).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Lưu phân công" })).not.toBeInTheDocument();
});

it("keeps assignment read-only without mutation permissions", () => {
  setup({}, { canMutate: false });
  expect(api.getAssignableDrivers).not.toHaveBeenCalled();
  expect(api.getOperationalDrivers).not.toHaveBeenCalled();
  expect(screen.getByText(/Tài khoản chỉ có quyền tra cứu/)).toBeVisible();
  expect(screen.queryByRole("button", { name: "Lưu phân công" })).not.toBeInTheDocument();
});

it("lets customer service assign without requesting the management-only staff directory", async () => {
  auth.role = "CustomerService";
  setup();
  await screen.findByRole("option", { name: "Tài xế hợp lệ" });
  expect(api.getOperationalDrivers).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Tài xế nhận lệnh"), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu phân công" }));
  await waitFor(() => expect(api.assignDriverToRental).toHaveBeenCalledOnce());
});
