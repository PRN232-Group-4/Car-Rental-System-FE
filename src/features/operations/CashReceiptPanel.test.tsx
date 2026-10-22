import { beforeAll, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CashReceiptPanel from "./CashReceiptPanel";
import { RENTAL_101 } from "@/__tests__/features/admin/rentals/rental-fixture";

const mocks = vi.hoisted(() => ({ getInvoiceById: vi.fn(), confirmCashReceipt: vi.fn(), getOperationalRentalDetail: vi.fn(), allowed: true }));
vi.mock("@/features/invoices", () => ({ getInvoiceById: mocks.getInvoiceById, confirmCashReceipt: mocks.confirmCashReceipt }));
vi.mock("./api", async original => ({ ...await original<typeof import("./api")>(), getOperationalRentalDetail: mocks.getOperationalRentalDetail }));
vi.mock("@/features/auth/AuthContext", () => ({ useOptionalSession: () => ({ isAuthenticated: mocks.allowed, hasAnyRole: () => mocks.allowed }) }));
const invoice = { id: 55, rentalId: 101, invoiceNumber: "INV-101", amount: 100000, status: "pending", paymentMethod: "cash", kind: "rental", canPay: true };
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.allowed = true;
  mocks.getInvoiceById.mockResolvedValue(invoice);
  mocks.getOperationalRentalDetail.mockResolvedValue({ invoice: { id: 55 } });
});
function setup(overrides = {}) {
  const refresh = vi.fn().mockResolvedValue(undefined);
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={cache}><CashReceiptPanel rental={{ ...RENTAL_101, status: "pre_inspection", invoiceId: 55, ...overrides }} refresh={refresh} compact /></QueryClientProvider>);
  return { refresh };
}
it("collects cash only after an explicit receipt confirmation and reads the paid invoice back", async () => {
  const { refresh } = setup();
  await screen.findByText("Chưa thanh toán");
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }));
  expect(mocks.confirmCashReceipt).not.toHaveBeenCalled();
  mocks.confirmCashReceipt.mockResolvedValue({ status: "paid" });
  mocks.getInvoiceById.mockResolvedValue({ ...invoice, status: "paid", orderId: 201, canPay: false });
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đã nhận đủ tiền" }));
  await screen.findByText("Đã thanh toán");
  expect(screen.getByText("Mã đơn chính thức")).toBeVisible();
  expect(screen.getAllByRole("definition").some(element => element.textContent === "#201")).toBe(true);
  expect(mocks.confirmCashReceipt).toHaveBeenCalledExactlyOnceWith(55);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("keeps the confirmation open and remains unpaid after an API failure", async () => {
  mocks.confirmCashReceipt.mockRejectedValue(new Error("Chưa ghi nhận được tiền. Vui lòng thử lại."));
  const { refresh } = setup();
  await screen.findByText("Chưa thanh toán");
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }));
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đã nhận đủ tiền" }));
  await screen.findByText("Chưa ghi nhận được tiền. Vui lòng thử lại.");
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByText("Chưa thanh toán")).toBeVisible();
  expect(refresh).not.toHaveBeenCalled();
});
it("locks repeated receipts while the cash confirmation is being saved", async () => {
  let finish!: () => void;
  mocks.confirmCashReceipt.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  setup();
  await screen.findByText("Chưa thanh toán");
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }));
  const submit = screen.getByRole("button", { name: "Xác nhận đã nhận đủ tiền" });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(mocks.confirmCashReceipt).toHaveBeenCalledTimes(1);
  expect(submit).toBeDisabled();
  mocks.getInvoiceById.mockResolvedValue({ ...invoice, status: "paid" });
  finish();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
it("does not treat an order id as proof of payment", async () => {
  mocks.getInvoiceById.mockResolvedValue({ ...invoice, orderId: 201, canPay: false });
  setup();
  await screen.findByText("Chưa thanh toán");
  expect(screen.queryByText("Đã thanh toán")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).toBeDisabled();
});
it("requires approval before collecting payment", async () => {
  setup({ status: "pending" });
  await screen.findByText("Xác nhận đơn thuê trước khi ghi nhận thanh toán.");
  expect(screen.queryByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).not.toBeInTheDocument();
  expect(mocks.confirmCashReceipt).not.toHaveBeenCalled();
});
it("never manually marks online payment paid and refreshes provider status", async () => {
  mocks.getInvoiceById.mockResolvedValue({ ...invoice, paymentMethod: "payos" });
  setup();
  await screen.findByText("Chưa thanh toán");
  expect(screen.queryByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).not.toBeInTheDocument();
  mocks.getInvoiceById.mockResolvedValue({ ...invoice, paymentMethod: "payos", status: "paid" });
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật trạng thái thanh toán" }));
  await screen.findByText("Đã thanh toán");
  expect(mocks.confirmCashReceipt).not.toHaveBeenCalled();
});
it.each([{ isSubscription: true }, { status: "cancelled" }, { status: "completed" }])("does not offer collection for ineligible rentals %o", overrides => {
  setup(overrides);
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(mocks.getInvoiceById).not.toHaveBeenCalled();
});
it("does not load or collect invoices without cashier permission", () => {
  mocks.allowed = false;
  setup();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(mocks.getInvoiceById).not.toHaveBeenCalled();
});
it("can resolve an invoice through the rental detail and safely handles missing invoices", async () => {
  mocks.getOperationalRentalDetail.mockResolvedValue({ invoice: null });
  setup({ invoiceId: undefined });
  await screen.findByText("Chưa có hóa đơn của yêu cầu này. Vui lòng kiểm tra lại trước khi bàn giao xe.");
  expect(mocks.getInvoiceById).not.toHaveBeenCalled();
});
