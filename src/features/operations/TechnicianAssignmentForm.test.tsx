import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { RENTAL_101 } from "@/__tests__/features/admin/rentals/rental-fixture";

const api = vi.hoisted(() => ({ getInspectionAssignment: vi.fn(), getInspectionTechnicians: vi.fn(), assignInspectionTechnician: vi.fn(), confirmInspectionChecked: vi.fn() }));
const operations = vi.hoisted(() => ({ changeRentalStatus: vi.fn() }));
vi.mock("./api", async original => ({ ...await original<typeof import("./api")>(), ...operations }));
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

function setup(refresh = vi.fn().mockResolvedValue(undefined), overrides = {}, props = {}) {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={cache}><TechnicianAssignmentForm rental={{ ...RENTAL_101, status: "pre_inspection", hasDriver: false, hasPassingPreInspection: false, ...overrides }} refresh={refresh} {...props} /></QueryClientProvider>);
  return { refresh };
}

it("offers a separate post-return inspection even when pre-rental inspection passed", async () => {
  api.confirmInspectionChecked.mockResolvedValue({ technicianStaffId: 9 });
  setup(undefined, { status: "post_inspection", hasPassingPreInspection: true, hasPostInspection: false, hasDriver: true }, { compact: true });
  await screen.findByRole("option", { name: "technician@example.com" });
  expect(api.getInspectionAssignment).toHaveBeenCalledWith(101, true);
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  fireEvent.change(screen.getByLabelText("Thao tác kiểm tra"), { target: { value: "checked" } });
  fireEvent.click(screen.getByRole("button", { name: "Đã inspect" }));
  await waitFor(() => expect(api.confirmInspectionChecked).toHaveBeenCalledWith(101, 9, false, true));
  expect(operations.changeRentalStatus).not.toHaveBeenCalled();
});

it("dispatches post-return technicians without marking inspection complete", async () => {
  api.assignInspectionTechnician.mockResolvedValue({ technicianStaffId: 9 });
  setup(undefined, { status: "post_inspection", hasPostInspection: false }, { compact: true });
  await screen.findByRole("option", { name: "technician@example.com" });
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
  await waitFor(() => expect(api.assignInspectionTechnician).toHaveBeenCalledWith(101, 9, true));
  expect(api.confirmInspectionChecked).not.toHaveBeenCalled();
});

it("does not replace any existing post-return report", async () => {
  setup(undefined, { status: "post_inspection", hasPostInspection: true }, { compact: true });
  await screen.findByText("Đã có biên bản kiểm tra sau trả xe.");
  expect(screen.queryByRole("button", { name: "Đã inspect" })).not.toBeInTheDocument();
  expect(api.getInspectionTechnicians).not.toHaveBeenCalled();
});

it.each(["assign", "checked"])("explains legacy backend rejection for post-return %s without changing the rental", async action => {
  const error = new ApiClientError(409, "Conflict", { error: { code: "INSPECTION_ASSIGNMENT_NOT_ALLOWED", detail: "Chỉ phân công kiểm tra trước khi bắt đầu chuyến." } });
  api.assignInspectionTechnician.mockRejectedValue(error);
  api.confirmInspectionChecked.mockRejectedValue(error);
  const { refresh } = setup(undefined, { status: "post_inspection", hasPostInspection: false }, { compact: true });
  await screen.findByRole("option", { name: "technician@example.com" });
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  fireEvent.change(screen.getByLabelText("Thao tác kiểm tra"), { target: { value: action } });
  fireEvent.click(screen.getByRole("button", { name: action === "checked" ? "Đã inspect" : "Xác nhận" }));
  await screen.findByText("Backend đang chạy phiên bản cũ chỉ hỗ trợ kiểm tra trước thuê. Hãy khởi động lại backend để dùng kiểm tra sau trả xe.");
  expect(screen.getByLabelText("Kỹ thuật viên phụ trách")).toHaveValue("9");
  expect(refresh).not.toHaveBeenCalled();
  expect(operations.changeRentalStatus).not.toHaveBeenCalled();
});

it("compact mode uses one submit for either dispatch or a deliberately selected passing check", async () => {
  api.confirmInspectionChecked.mockResolvedValue({ technicianStaffId: 9 });
  setup(undefined, { status: "pre_inspection" }, { compact: true });
  await screen.findByRole("option", { name: "technician@example.com" });
  expect(screen.getByRole("button", { name: "Xác nhận" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Lưu phân công kiểm tra" })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  fireEvent.change(screen.getByLabelText("Thao tác kiểm tra"), { target: { value: "checked" } });
  expect(screen.queryByRole("button", { name: "Xác nhận" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Đã inspect" }));
  await waitFor(() => expect(api.confirmInspectionChecked).toHaveBeenCalledWith(101,9));
  expect(api.assignInspectionTechnician).not.toHaveBeenCalled();
});

it("compact completed checks do not duplicate approval or inspection action buttons", async () => {
  setup(undefined, { status: "pending", hasPassingPreInspection: true }, { compact: true, showApprovalAction: false });
  expect(await screen.findByText("Xác nhận đơn thuê trước, sau đó phân công và xác nhận Đã inspect.")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Duyệt yêu cầu đã kiểm tra" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByText("Chi tiết kiểm tra")).toBeVisible();
});

it("explains pending pass and requires an explicit approval request without rewriting evidence", async () => {
  operations.changeRentalStatus.mockResolvedValue({ status: "pre_inspection" });
  const { refresh } = setup(undefined, { status: "pending", hasPassingPreInspection: true });
  expect(await screen.findByText(/Kiểm tra trước thuê đã đạt nhưng yêu cầu chưa được duyệt/)).toBeVisible();
  expect(operations.changeRentalStatus).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Duyệt yêu cầu đã kiểm tra" }));
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  expect(operations.changeRentalStatus).toHaveBeenCalledWith(101, "pre_inspection");
  expect(api.confirmInspectionChecked).not.toHaveBeenCalled();
});

it("requires rental approval before loading technicians or offering inspection", async () => {
  setup(undefined, { status: "pending" });
  await screen.findByText("Xác nhận đơn thuê trước, sau đó phân công và xác nhận Đã inspect.");
  expect(screen.queryByRole("button", { name: "Đã inspect" })).not.toBeInTheDocument();
  expect(api.getInspectionTechnicians).not.toHaveBeenCalled();
  expect(api.confirmInspectionChecked).not.toHaveBeenCalled();
});

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
  await screen.findByText("Đã phân công kỹ thuật viên. Đang chờ kết quả kiểm tra.");
  expect(api.assignInspectionTechnician).toHaveBeenCalledWith(101, 9);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Đã giao:")).toBeVisible();
});

it("lets Admin explicitly confirm assignment and a passing check after selecting a technician", async () => {
  api.confirmInspectionChecked.mockResolvedValue({ technicianStaffId: 9, technicianEmail: "technician@example.com", assignedAt: "2026-10-21T03:00:00Z" });
  const { refresh } = setup();
  await screen.findByRole("option", { name: "technician@example.com" });
  fireEvent.click(screen.getByRole("button", { name: "Đã inspect" }));
  expect(await screen.findByText("Vui lòng chọn kỹ thuật viên phụ trách trước khi xác nhận.")).toBeVisible();
  expect(api.confirmInspectionChecked).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Đã inspect" }));
  expect(api.confirmInspectionChecked).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận kiểm tra đạt" }));
  await screen.findByText("Đã xác nhận phân công và kiểm tra trước thuê đạt.");
  expect(api.confirmInspectionChecked).toHaveBeenCalledWith(101,9);
  expect(api.assignInspectionTechnician).not.toHaveBeenCalled();
  expect(refresh).toHaveBeenCalledTimes(1);
});

it("retains technician selection when Admin confirmation fails", async () => {
  api.confirmInspectionChecked.mockRejectedValue(new TypeError("network"));
  setup();
  await screen.findByRole("option", { name: "technician@example.com" });
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Đã inspect" }));
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận kiểm tra đạt" }));
  await screen.findByRole("alert");
  expect(screen.getByLabelText("Kỹ thuật viên phụ trách")).toHaveValue("9");
  expect(screen.queryByText("Đã xác nhận phân công và kiểm tra trước thuê đạt.")).not.toBeInTheDocument();
});

it("explains a missing checked endpoint and keeps the selected technician", async () => {
  api.confirmInspectionChecked.mockRejectedValue(new ApiClientError(404,"Not Found",{error:{title:"Not Found",detail:"Not Found"}}));
  setup();
  await screen.findByRole("option",{name:"technician@example.com"});
  fireEvent.change(screen.getByLabelText("Kỹ thuật viên phụ trách"),{target:{value:"9"}});
  fireEvent.click(screen.getByRole("button",{name:"Đã inspect"}));
  fireEvent.click(screen.getByRole("button",{name:"Xác nhận kiểm tra đạt"}));
  await screen.findByText("Backend đang kết nối chưa có API xác nhận kiểm tra đạt. Cần cập nhật backend mới cùng migration 0028 rồi thử lại.");
  expect(screen.getByLabelText("Kỹ thuật viên phụ trách")).toHaveValue("9");
});

it("offers Đã inspect for an already assigned rental even when a driver booking has no passing check yet", async () => {
  api.getInspectionAssignment.mockResolvedValue({ technicianStaffId: 9, technicianEmail: "technician@example.com", assignedAt: "2026-10-22T03:21:00Z" });
  api.confirmInspectionChecked.mockResolvedValue({ technicianStaffId: 9, technicianEmail: "technician@example.com", assignedAt: "2026-10-22T03:21:00Z" });
  const { refresh } = setup(undefined, {hasDriver:true});
  const inspect = await screen.findByRole("button", { name: "Đã inspect" });
  await waitFor(() => expect(inspect).toBeEnabled());
  expect(screen.getByLabelText("Kỹ thuật viên phụ trách")).toHaveValue("9");
  fireEvent.click(inspect);
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận kiểm tra đạt" }));
  await screen.findByText("Đã xác nhận phân công và kiểm tra trước thuê đạt.");
  expect(api.confirmInspectionChecked).toHaveBeenCalledWith(101,9);
  expect(api.assignInspectionTechnician).not.toHaveBeenCalled();
  expect(refresh).toHaveBeenCalledTimes(1);
});

it("shows driver default readiness and does not offer another pre-inspection assignment", async () => {
  setup(undefined, {hasDriver:true,hasPassingPreInspection:true});
  expect(await screen.findByText("Đơn có tài xế: đã đạt kiểm tra trước thuê theo mặc định.")).toBeVisible();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(api.getInspectionTechnicians).not.toHaveBeenCalled();
});

it("does not offer direct confirmation to Manager", async () => {
  auth.role="Manager";
  setup();
  await screen.findByRole("button", {name:"Lưu phân công kiểm tra"});
  expect(screen.queryByRole("button", {name:"Đã inspect"})).not.toBeInTheDocument();
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
