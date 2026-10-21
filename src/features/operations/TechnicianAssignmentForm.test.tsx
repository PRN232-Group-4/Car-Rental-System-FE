import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { RENTAL_101 } from "@/__tests__/features/admin/rentals/rental-fixture";

const api = vi.hoisted(() => ({ getInspectionAssignment: vi.fn(), getInspectionTechnicians: vi.fn(), assignInspectionTechnician: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "Admin" }));
vi.mock("./technician-api", async (importOriginal) => ({ ...await importOriginal<typeof import("./technician-api")>(), ...api }));
vi.mock("@/features/auth/AuthContext", () => ({ useOptionalSession: () => ({ hasAnyRole: (roles: string[]) => roles.includes(auth.role) }) }));
import TechnicianAssignmentForm from "./TechnicianAssignmentForm";

beforeEach(() => {
  vi.resetAllMocks();
  auth.role = "Admin";
  api.getInspectionAssignment.mockResolvedValue(null);
  api.getInspectionTechnicians.mockResolvedValue([{ id: 9, fullName: "Nguyễn Văn Kỹ", email: "technician@example.com", isActive: true, staffRole: "Maintenance" }]);
});

function setup(refresh = vi.fn().mockResolvedValue(undefined)) {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={cache}><TechnicianAssignmentForm rental={{ ...RENTAL_101, status: "pre_inspection", hasPassingPreInspection: false }} refresh={refresh} /></QueryClientProvider>);
  return { refresh };
}

it("requires a technician then saves the selection and displays persisted assignee", async () => {
  api.assignInspectionTechnician.mockResolvedValue({ rentalId: 101, vehicleId: 1, technicianStaffId: 9, technicianName: "Nguyễn Văn Kỹ", technicianEmail: "technician@example.com", assignedAt: "2026-10-21T03:00:00Z" });
  const { refresh } = setup();
  const save = await screen.findByRole("button", { name: "Lưu phân công kiểm tra" });
  await waitFor(() => expect(save).toBeEnabled());
  fireEvent.click(save);
  expect(await screen.findByText("Vui lòng chọn kỹ thuật viên đang hoạt động trong danh sách.")).toBeVisible();
  expect(api.assignInspectionTechnician).not.toHaveBeenCalled();
  const select = screen.getByLabelText("Kỹ thuật viên phụ trách");
  expect(select).toHaveAttribute("aria-invalid", "true");
  fireEvent.change(select, { target: { value: "9" } });
  expect(select).toHaveAttribute("aria-invalid", "false");
  fireEvent.click(save);
  await screen.findByText("Đã phân công kỹ thuật viên kiểm tra trước thuê.");
  expect(api.assignInspectionTechnician).toHaveBeenCalledWith(101, 9);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Đã giao:")).toBeVisible();
});

it("keeps the selection and maps backend field errors inline", async () => {
  api.assignInspectionTechnician.mockRejectedValue(new ApiClientError(400, "Bad Request", { error: { errors: { TechnicianStaffId: ["Kỹ thuật viên đã ngừng hoạt động. Vui lòng chọn người khác."] } } }));
  setup();
  const select = await screen.findByLabelText("Kỹ thuật viên phụ trách");
  await screen.findByRole("option", { name: "technician@example.com" });
  fireEvent.change(select, { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu phân công kiểm tra" }));
  await screen.findByText("Kỹ thuật viên đã ngừng hoạt động. Vui lòng chọn người khác.");
  expect(select).toHaveValue("9");
  expect(select).toHaveAttribute("aria-invalid", "true");
});

it("lets the technician view the assignment without loading the management staff directory", async () => {
  auth.role = "Maintenance";
  api.getInspectionAssignment.mockResolvedValue({ technicianStaffId: 9, technicianName: "Nguyễn Văn Kỹ", technicianEmail: "technician@example.com", assignedAt: "2026-10-21T03:00:00Z" });
  setup();
  await screen.findByText("technician@example.com");
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(api.getInspectionTechnicians).not.toHaveBeenCalled();
  expect(api.assignInspectionTechnician).not.toHaveBeenCalled();
});

it("maps a technician eligibility conflict to the select and reloads available technicians", async () => {
  api.assignInspectionTechnician.mockRejectedValue(new ApiClientError(400, "Bad Request", { error: { code: "TECHNICIAN_NOT_ELIGIBLE", detail: "Unavailable technician" } }));
  setup();
  await screen.findByRole("option", { name: "technician@example.com" });
  const select = screen.getByLabelText("Kỹ thuật viên phụ trách");
  fireEvent.change(select, { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu phân công kiểm tra" }));
  await screen.findByText("Kỹ thuật viên không còn khả dụng. Vui lòng tải lại và chọn kỹ thuật viên đang hoạt động.");
  expect(select).toHaveAttribute("aria-invalid", "true");
  expect(api.getInspectionTechnicians).toHaveBeenCalledTimes(2);
  expect(screen.queryByText("Unavailable technician")).not.toBeInTheDocument();
});

it("blocks saves when assignment loading fails and offers a retry", async () => {
  api.getInspectionAssignment.mockRejectedValue(new TypeError("network"));
  setup();
  await screen.findByText("Không kết nối được máy chủ để tải phân công. Vui lòng kiểm tra mạng rồi thử lại.");
  expect(screen.getByRole("button", { name: "Lưu phân công kiểm tra" })).toBeDisabled();
  api.getInspectionAssignment.mockResolvedValue(null);
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await screen.findByText("Chưa phân công kỹ thuật viên kiểm tra.");
  expect(screen.getByRole("button", { name: "Lưu phân công kiểm tra" })).toBeEnabled();
});

it("explains a missing deployed backend endpoint instead of pretending the rental is unassigned", async () => {
  api.getInspectionAssignment.mockRejectedValue(new ApiClientError(404, "Not Found", { error: { title: "Not Found", detail: "Not Found", status: 404 } }));
  setup();
  await screen.findByText("Backend đang kết nối chưa có API phân công kiểm tra. Cần cập nhật backend cùng phiên bản frontend rồi tải lại.");
  expect(screen.queryByText("Chưa phân công kỹ thuật viên kiểm tra.")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Lưu phân công kiểm tra" })).toBeDisabled();
  expect(api.assignInspectionTechnician).not.toHaveBeenCalled();
});
