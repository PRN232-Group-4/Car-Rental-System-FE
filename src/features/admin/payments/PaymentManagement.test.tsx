import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiProblemError } from "@/api/api-client";
import { getNavigation, ROUTE_CHAPTER_MAP } from "@/config/navigation";
import { canAccessRoute } from "@/features/auth/access";
import { getAdminStatusTone } from "@/components/admin/status-rules";
import type { PaymentSummary } from "@/features/payments/types";
import PaymentManagement from "./PaymentManagement";

const mock = vi.hoisted(() => ({ getPayments: vi.fn(), roles: ["Manager"] as string[] }));
vi.mock("./api", () => ({ getAdminPayments: mock.getPayments }));
vi.mock("@/features/auth/AuthContext", () => ({ useSession: () => ({ isAuthenticated: true, user: { email: "manager@example.com", roles: mock.roles } }) }));

beforeEach(() => { vi.resetAllMocks(); mock.roles = ["Manager"]; });
const payment = (id: number, extra: Partial<PaymentSummary> = {}): PaymentSummary => ({
  id, rentalId: 51, invoiceId: 61, amount: 1500000, type: "rental", status: "paid", method: "cash", createdAt: "2026-10-23T01:00:00Z", paidAt: "2026-10-23T02:00:00Z", ...extra,
});
function setup() {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><PaymentManagement /></QueryClientProvider>);
}

describe("admin payment directory", () => {
  it("exposes the route only to Admin and Manager and assigns the operations chapter", () => {
    for (const role of ["Admin", "Manager"]) {
      expect(canAccessRoute("/admin/payments", [role])).toBe(true);
      expect(getNavigation([role], "admin").map((entry) => entry.href)).toContain("/admin/payments");
    }
    for (const role of ["Staff", "CustomerService", "Maintenance", "Customer", "Driver"]) {
      expect(canAccessRoute("/admin/payments", [role])).toBe(false);
      expect(getNavigation([role], "admin").map((entry) => entry.href)).not.toContain("/admin/payments");
    }
    expect(ROUTE_CHAPTER_MAP["/admin/payments"]).toBe("Vận hành");
  });

  it("does not request the financial ledger for an unauthorized role", () => {
    mock.roles = ["Staff"];
    setup();
    expect(mock.getPayments).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Bạn không có quyền xem danh sách thanh toán.");
  });

  it("shows a loading skeleton before an empty state", () => {
    mock.getPayments.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải giao dịch thanh toán...");
    expect(screen.queryByText(/Không có giao dịch phù hợp/)).not.toBeInTheDocument();
  });

  it("shows persisted fields and paginates the complete ledger without another request", async () => {
    mock.getPayments.mockResolvedValue(Array.from({ length: 21 }, (_, i) => payment(i + 1)));
    setup();
    expect(await screen.findByText("GD-1")).toBeVisible();
    expect(screen.getByText("21 giao dịch · Trang 1/2")).toBeVisible();
    expect(screen.queryByText("GD-21")).not.toBeInTheDocument();
    const row = screen.getByText("GD-1").closest("tr")!;
    expect(within(row).getByText("Đơn thuê #51")).toBeVisible();
    expect(within(row).getByText("Hóa đơn #61")).toBeVisible();
    expect(within(row).getByText("1.500.000đ")).toBeVisible();
    expect(within(row).getByText("Tạo: 23/10/2026 08:00")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Trang sau" }));
    expect(await screen.findByText("GD-21")).toBeVisible();
    expect(screen.queryByText("GD-1")).not.toBeInTheDocument();
    expect(mock.getPayments).toHaveBeenCalledTimes(1);
  });

  it("applies draft filters on submit, resets pagination and displays paid refunds accurately", async () => {
    mock.getPayments.mockResolvedValue([payment(1), payment(2, { type: "refund", providerReference: "REF-ABC" }), payment(3, { method: "payos", status: "pending" })]);
    setup();
    await screen.findByText("GD-2");
    expect(within(screen.getByRole("table")).getByText("Đã hoàn tiền")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Trạng thái"), { target: { value: "refunded" } });
    expect(screen.getByText("GD-1")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(screen.queryByText("GD-1")).not.toBeInTheDocument();
    expect(screen.getByText("GD-2")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    fireEvent.change(screen.getByLabelText("Tìm giao dịch"), { target: { value: "ref-abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(screen.getByText("GD-2")).toBeVisible();
    expect(screen.queryByText("GD-3")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.getByText("GD-3")).toBeVisible();
    expect(screen.getByLabelText("Tìm giao dịch")).toHaveValue("");
  });

  it("shows permission errors and supports retry without presenting an empty ledger", async () => {
    mock.getPayments.mockRejectedValueOnce(new ApiProblemError(403, "Forbidden")).mockResolvedValueOnce([]);
    setup();
    expect(await screen.findByRole("alert")).toHaveTextContent("Bạn không có quyền xem danh sách thanh toán.");
    expect(screen.queryByText(/Không có giao dịch phù hợp/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Thử tải lại" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(await screen.findByText(/Không có giao dịch phù hợp/)).toBeVisible();
  });

  it("combines type and method filters and applies from page one", async () => {
    mock.getPayments.mockResolvedValue([
      ...Array.from({ length: 20 }, (_, i) => payment(i + 1)),
      payment(21, { type: "subscription", method: "payos", rentalId: null, invoiceId: null }),
    ]);
    setup();
    await screen.findByText("GD-1");
    fireEvent.click(screen.getByRole("button", { name: "Trang sau" }));
    expect(screen.getByText("GD-21")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Loại giao dịch"), { target: { value: "subscription" } });
    fireEvent.change(screen.getByLabelText("Phương thức"), { target: { value: "payos" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(screen.getByText("1 giao dịch · Trang 1/1")).toBeVisible();
    expect(screen.getByText("Không gắn đơn thuê")).toBeVisible();
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Phương thức"), { target: { value: "cash" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(screen.getByText(/Không có giao dịch phù hợp/)).toBeVisible();
    expect(screen.getByText("0 giao dịch · Trang 1/1")).toBeVisible();
  });

  it("supports searching the transaction code as displayed", async () => {
    mock.getPayments.mockResolvedValue([payment(1), payment(2)]);
    setup();
    await screen.findByText("GD-1");
    fireEvent.change(screen.getByLabelText("Tìm giao dịch"), { target: { value: "gd-2" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(screen.getByText("GD-2")).toBeVisible();
    expect(screen.queryByText("GD-1")).not.toBeInTheDocument();
  });

  it("uses the shared payment status semantics", () => {
    expect(getAdminStatusTone("payment", "paid")).toBe("success");
    expect(getAdminStatusTone("payment", "pending")).toBe("warning");
    expect(getAdminStatusTone("payment", "requested")).toBe("info");
    expect(getAdminStatusTone("payment", "refunded")).toBe("neutral");
    expect(getAdminStatusTone("payment", "rejected")).toBe("danger");
  });
});
