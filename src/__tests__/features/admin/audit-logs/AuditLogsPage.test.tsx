import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuditLogsPage from "@/app/admin/audit-logs/page";
import { ApiClientError } from "@/api/api-client";

const mocks = vi.hoisted(() => ({ getAuditLogs: vi.fn(), getProfile: vi.fn() }));

vi.mock("@/features/admin/audit-logs/api", async () => {
  const actual = await vi.importActual<typeof import("@/features/admin/audit-logs/api")>(
    "@/features/admin/audit-logs/api",
  );
  return { ...actual, getAuditLogs: mocks.getAuditLogs };
});
vi.mock("@/features/profile/api", () => ({ getAccountProfile: mocks.getProfile, initialsFor: () => "TD" }));
vi.mock("@/features/auth", () => ({ useAuth: () => ({ user: { email: "admin@test.local", roles: ["Admin"] }, isLoading: false, isAuthenticated: true, logout: vi.fn() }) }));
vi.mock("@/features/auth/AuthGate", () => ({ AuthGate: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/features/admin/transit-desk/TransitFolio", () => ({
  TransitFolio: ({ title }: { title: React.ReactNode }) => <header>{title}</header>,
}));

const row = {
  id: "AUD-12",
  timestamp: "2026-10-23T03:04:05Z",
  actorId: 1,
  actorEmail: "admin@test.local",
  actorName: "Quản trị viên",
  action: "role_assigned",
  targetUserId: 9,
  targetUser: "huy@test.local",
  details: "Gán quyền Manager",
  ipAddress: "203.0.113.7",
  status: "success",
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <AuditLogsPage />
    </QueryClientProvider>,
  );
}

describe("Trang nhật ký kiểm toán", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getProfile.mockResolvedValue({ email: "admin@test.local", roles: ["Admin"] });
    mocks.getAuditLogs.mockResolvedValue({ items: [row], page: 1, pageSize: 20, totalCount: 1 });
  });
  afterEach(cleanup);

  it("hiển thị bản ghi thật từ API kèm mã, người thực hiện, hành động và trạng thái", async () => {
    renderPage();

    expect(await screen.findByText("AUD-12")).toBeVisible();
    const table = within(screen.getByRole("table"));
    expect(table.getByText("Quản trị viên")).toBeVisible();
    expect(table.getByText("admin@test.local")).toBeVisible();
    // Nhãn hành động cũng xuất hiện trong <option> của bộ lọc, nên chỉ kiểm tra trong bảng.
    expect(table.getByText("Gán vai trò")).toBeVisible();
    expect(table.getByText("huy@test.local")).toBeVisible();
    expect(table.getByText("#9")).toBeVisible();
    expect(table.getByText("Gán quyền Manager")).toBeVisible();
    expect(table.getByText("203.0.113.7")).toBeVisible();
    expect(table.getByText("Thành công")).toBeVisible();
    expect(screen.getByText(/1 bản ghi, mới nhất trước/)).toBeVisible();
  });

  it("không gọi lại API khi đang gõ, chỉ gọi sau khi bấm Áp dụng", async () => {
    renderPage();
    await screen.findByText("AUD-12");
    const callsAfterLoad = mocks.getAuditLogs.mock.calls.length;

    fireEvent.change(screen.getByLabelText(/Tìm kiếm/i), { target: { value: "huy" } });
    expect(mocks.getAuditLogs.mock.calls.length).toBe(callsAfterLoad);

    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    await waitFor(() =>
      expect(mocks.getAuditLogs).toHaveBeenLastCalledWith({ search: "huy", action: "all", page: 1, pageSize: 20 }),
    );
  });

  it("lọc theo hành động và đặt lại bộ lọc", async () => {
    renderPage();
    await screen.findByText("AUD-12");

    fireEvent.change(screen.getByLabelText(/Loại hành động/i), { target: { value: "account_locked" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    await waitFor(() =>
      expect(mocks.getAuditLogs).toHaveBeenLastCalledWith({ search: "", action: "account_locked", page: 1, pageSize: 20 }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    await waitFor(() =>
      expect(mocks.getAuditLogs).toHaveBeenLastCalledWith({ search: "", action: "all", page: 1, pageSize: 20 }),
    );
  });

  it("báo lỗi kèm HTTP status và nút thử lại khi API từ chối", async () => {
    const onRetry = vi.fn();
    mocks.getAuditLogs.mockRejectedValueOnce(new ApiClientError(403, "Forbidden", { detail: "Bạn không có quyền." }));
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Không thể tải nhật ký kiểm toán");
    expect(alert).toHaveTextContent(/Bạn không có quyền\. \(HTTP 403\)/);
    expect(alert).toHaveTextContent(/Admin hoặc Manager/);

    mocks.getAuditLogs.mockResolvedValue({ items: [row], page: 1, pageSize: 20, totalCount: 1 });
    fireEvent.click(screen.getByRole("button", { name: /Thử tải lại/i }));
    onRetry();
    expect(await screen.findByText("AUD-12")).toBeVisible();
  });

  it("trạng thái rỗng phân biệt 'chưa có bản ghi' với 'không khớp bộ lọc'", async () => {
    mocks.getAuditLogs.mockResolvedValue({ items: [], page: 1, pageSize: 20, totalCount: 0 });
    renderPage();
    expect(await screen.findByText(/Chưa có bản ghi kiểm toán nào/)).toBeVisible();

    cleanup();
    renderPage();
    await screen.findByText(/Chưa có bản ghi kiểm toán nào/);
    fireEvent.change(screen.getByLabelText(/Tìm kiếm/i), { target: { value: "khong-ton-tai" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(await screen.findByText(/Không có bản ghi khớp bộ lọc hiện tại/)).toBeVisible();
  });

  it("trạng thái lạ không bị gắn nhãn 'cảnh báo' mà hiển thị nguyên văn", async () => {
    mocks.getAuditLogs.mockResolvedValue({
      items: [{ ...row, status: "warning" }],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    });
    renderPage();

    expect(await screen.findByText("warning")).toBeVisible();
    expect(screen.queryByText("Cảnh báo")).not.toBeInTheDocument();
  });
});
