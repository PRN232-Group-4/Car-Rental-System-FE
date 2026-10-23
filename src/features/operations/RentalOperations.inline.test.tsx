import { beforeAll, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RENTAL_101 } from "@/__tests__/features/admin/rentals/rental-fixture";
import { StatusForm } from "./RentalOperations";

const api = vi.hoisted(() => ({
  getInspectionAssignment: vi.fn(), getInspectionTechnicians: vi.fn(), assignInspectionTechnician: vi.fn(), confirmInspectionChecked: vi.fn(),
  getInvoiceById: vi.fn(), confirmCashReceipt: vi.fn(), changeRentalStatus: vi.fn(), role: "Admin",
}));
vi.mock("./technician-api", async original => ({ ...await original<typeof import("./technician-api")>(), getInspectionAssignment: api.getInspectionAssignment, getInspectionTechnicians: api.getInspectionTechnicians, assignInspectionTechnician: api.assignInspectionTechnician, confirmInspectionChecked: api.confirmInspectionChecked }));
vi.mock("./api", async original => ({ ...await original<typeof import("./api")>(), changeRentalStatus: api.changeRentalStatus }));
vi.mock("@/features/invoices", () => ({ getInvoiceById: api.getInvoiceById, confirmCashReceipt: api.confirmCashReceipt }));
vi.mock("@/features/auth/AuthContext", () => ({ useOptionalSession: () => ({ isAuthenticated: true, hasAnyRole: (roles: string[]) => roles.includes(api.role) }) }));

const invoice = { id: 55, rentalId: 101, invoiceNumber: "INV-101", amount: 100000, status: "unpaid", paymentMethod: "cash", kind: "rental", canPay: true };
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
beforeEach(() => {
  vi.resetAllMocks();
  api.role = "Admin";
  api.getInspectionAssignment.mockResolvedValue(null);
  api.getInspectionTechnicians.mockResolvedValue([{ id: 9, email: "technician@example.com" }]);
  api.getInvoiceById.mockResolvedValue(invoice);
});
function setup(overrides = {}) {
  const refresh = vi.fn().mockResolvedValue(undefined);
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const rendered = render(<QueryClientProvider client={cache}><StatusForm rental={{ ...RENTAL_101, status: "pre_inspection", invoiceId: 55, hasPassingPreInspection: false, ...overrides }} refresh={refresh} /></QueryClientProvider>);
  return { ...rendered, refresh };
}

it("places working technician and cash controls in their own checklist rows without nesting forms", async () => {
  const { container, refresh } = setup();
  await screen.findByRole("option", { name: "technician@example.com" });
  await screen.findByText("Chưa thanh toán");
  const checklist = screen.getByRole("group", { name: "Điều kiện chuyển bước" });
  const inspection = container.querySelector('[data-workflow-condition="inspection"]')! as HTMLElement;
  const payment = container.querySelector('[data-workflow-condition="payment"]')! as HTMLElement;
  expect(checklist).toContainElement(inspection);
  expect(checklist).toContainElement(payment);
  expect(within(inspection).getByRole("checkbox")).toBeDisabled();
  expect(within(inspection).getByLabelText("Kỹ thuật viên phụ trách")).toBeEnabled();
  expect(within(payment).getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).toBeEnabled();
  expect(container.querySelector("form form")).toBeNull();
  expect(container.querySelector("label form")).toBeNull();
  fireEvent.change(within(inspection).getByLabelText("Kỹ thuật viên phụ trách"), { target: { value: "9" } });
  api.assignInspectionTechnician.mockResolvedValue({ technicianStaffId: 9 });
  fireEvent.click(within(inspection).getByRole("button", { name: "Xác nhận" }));
  await waitFor(() => expect(api.assignInspectionTechnician).toHaveBeenCalledExactlyOnceWith(101, 9));
  fireEvent.click(within(payment).getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }));
  api.confirmCashReceipt.mockResolvedValue({ status: "paid" });
  api.getInvoiceById.mockResolvedValue({ ...invoice, status: "paid" });
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đã nhận đủ tiền" }));
  await screen.findByText("Đã thanh toán");
  expect(api.confirmCashReceipt).toHaveBeenCalledExactlyOnceWith(55);
  expect(refresh).toHaveBeenCalled();
  fireEvent.click(screen.getByRole("checkbox", { name: "Đã đối chiếu hồ sơ khách và bàn giao xe, chìa khóa" }));
  expect(screen.getByRole("button", { name: "Cập nhật: Đang thuê" })).toBeDisabled();
  expect(api.changeRentalStatus).not.toHaveBeenCalled();
});

it("enables handover only after server prerequisites and manual confirmation", async () => {
  api.getInvoiceById.mockResolvedValue({ ...invoice, status: "paid" });
  setup({ hasPassingPreInspection: true });
  await screen.findByText("Đã thanh toán");
  const next = screen.getByRole("button", { name: "Cập nhật: Đang thuê" });
  expect(next).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox", { name: "Đã đối chiếu hồ sơ khách và bàn giao xe, chìa khóa" }));
  expect(next).toBeEnabled();
});

it("keeps CustomerService from assigning technicians while permitting authorized cash receipt", async () => {
  api.role = "CustomerService";
  setup();
  await screen.findByText("Chưa thanh toán");
  expect(screen.queryByLabelText("Kỹ thuật viên phụ trách")).not.toBeInTheDocument();
  expect(api.getInspectionTechnicians).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).toBeEnabled();
});

it("places post-return inspection controls beside its prerequisite and omits rental payment", async () => {
  const { container } = setup({ status: "post_inspection", hasPostInspection: false });
  await screen.findByRole("option", { name: "technician@example.com" });
  expect(container.querySelector('[data-workflow-condition="inspection"]')).toContainElement(screen.getByLabelText("Kỹ thuật viên phụ trách"));
  expect(screen.queryByRole("region", { name: "Thanh toán đơn thuê" })).not.toBeInTheDocument();
  expect(api.getInspectionAssignment).toHaveBeenCalledWith(101, true);
  expect(api.getInvoiceById).not.toHaveBeenCalled();
});
