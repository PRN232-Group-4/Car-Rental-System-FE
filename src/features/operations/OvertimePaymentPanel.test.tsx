import { beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OvertimePaymentPanel from "./OvertimePaymentPanel";
import { mapInvoiceFromBE } from "@/features/invoices";

const mock = vi.hoisted(() => ({ getInvoiceById: vi.fn(), allowed: true }));
vi.mock("@/features/auth/AuthContext", () => ({ useOptionalSession: () => ({ isAuthenticated: mock.allowed, hasAnyRole: () => mock.allowed }) }));
vi.mock("@/features/invoices", async original => ({ ...await original<typeof import("@/features/invoices")>(), getInvoiceById: mock.getInvoiceById }));
beforeEach(() => { vi.resetAllMocks(); mock.allowed = true; });
function setup() {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><OvertimePaymentPanel invoiceId={99} /></QueryClientProvider>);
}

it("does not read financial details or offer collection without a service role", () => {
  mock.allowed = false;
  setup();
  expect(mock.getInvoiceById).not.toHaveBeenCalled();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});

it("requires explicit server permissions before enabling either payment action", async () => {
  mock.getInvoiceById.mockResolvedValue(mapInvoiceFromBE({ id: 99, kind: "overtime", amount: 150, status: "unpaid", canPay: true }));
  setup();
  expect(await screen.findByRole("button", { name: "Xác nhận đã thu tiền mặt" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Tạo link thanh toán online" })).toBeDisabled();
  expect(mapInvoiceFromBE({ canConfirmCash: "true", canCreateStaffCheckout: "true" }).canConfirmCash).toBe(false);
  expect(mapInvoiceFromBE({ canConfirmCash: "true", canCreateStaffCheckout: "true" }).canCreateStaffCheckout).toBe(false);
});

it("shows persisted paid status without offering another collection", async () => {
  mock.getInvoiceById.mockResolvedValue(mapInvoiceFromBE({ id: 99, kind: "overtime", amount: 150, status: "paid", paymentMethod: "cash", canConfirmCash: true }));
  setup();
  expect(await screen.findByText("Đã thu phí · Tiền mặt")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Xác nhận đã thu tiền mặt" })).not.toBeInTheDocument();
});
