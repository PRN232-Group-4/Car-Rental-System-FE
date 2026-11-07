import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminUsersPage from "@/app/admin/users/page";
import { adminUser, managerUser, usersPage } from "./users-backend-fixture";
const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import type { SessionContextType } from "@/features/auth/AuthContext";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/users",
}));

// Mock Shell & AuthGate to focus tests strictly on UsersListPage behavior
vi.mock("@/features/auth/AuthGate", () => ({
  AuthGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

let mockSessionOverrides: Partial<SessionContextType> = {};

vi.mock("@/features/auth/AuthContext", () => ({
  useSession: () => {
    const roles = mockSessionOverrides.user?.roles ?? ["Admin"];
    return {
      user: {
        email: "admin@thongdong.vn",
        fullName: "Nguyễn Văn Quản Trị",
        roles,
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      hasRole: (r: string) => roles.includes(r),
      hasAnyRole: (list: readonly string[]) => list.some((r) => roles.includes(r)),
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      ...mockSessionOverrides,
    };
  },
  useAuth: () => {
    const roles = mockSessionOverrides.user?.roles ?? ["Admin"];
    return {
      user: {
        email: "admin@thongdong.vn",
        fullName: "Nguyễn Văn Quản Trị",
        roles,
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      hasRole: (r: string) => roles.includes(r),
      hasAnyRole: (list: readonly string[]) => list.some((r) => roles.includes(r)),
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      ...mockSessionOverrides,
    };
  },
}));

vi.mock("@/features/auth/context/AuthContext", () => ({
  useSession: () => {
    const roles = mockSessionOverrides.user?.roles ?? ["Admin"];
    return {
      user: {
        email: "admin@thongdong.vn",
        fullName: "Nguyễn Văn Quản Trị",
        roles,
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      hasRole: (r: string) => roles.includes(r),
      hasAnyRole: (list: readonly string[]) => list.some((r) => roles.includes(r)),
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      ...mockSessionOverrides,
    };
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderUsersPage(overrides: Partial<SessionContextType> = {}) {
  mockSessionOverrides = overrides;
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminUsersPage />
    </QueryClientProvider>
  );
}

describe("FE-23 Admin Users — List Page Component", () => {
  beforeEach(() => {
    client.get.mockResolvedValue(usersPage([adminUser, managerUser]));
    pushMock.mockClear();
    mockSessionOverrides = {};
  });

  it("hiển thị tiêu đề trang và bảng danh sách người dùng", async () => {
    renderUsersPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Người dùng & phân quyền.");

    // Chờ dữ liệu bảng tải xong
    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Quản Trị")).toBeDefined();
    });

    expect(screen.getByText("admin@thongdong.vn")).toBeDefined();
    expect(screen.getByText("Trần Thị Quản Lý")).toBeDefined();
  });

  it("hiển thị các chip vai trò và nhãn trạng thái", async () => {
    renderUsersPage();

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Quản Trị")).toBeDefined();
    });

    expect(screen.getAllByText("Hoạt động").length).toBeGreaterThan(0);
  });

  it("ẩn các nút hành động ghi khi đăng nhập bằng vai trò Manager (Chỉ đọc)", async () => {
    // Đăng nhập dưới quyền Manager (không có quyền Admin)
    renderUsersPage({
      user: {
        email: "manager.hcm@thongdong.vn",
        fullName: "Trần Thị Quản Lý",
        roles: ["Manager"],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Quản Trị")).toBeDefined();
    });

    // Huy hiệu chỉ đọc hiển thị
    expect(screen.getByText("Chỉ đọc (Manager)")).toBeDefined();

    // Nút khóa hoặc thu hồi phiên bị ẩn hoàn toàn
    expect(screen.queryByTitle("Khóa tài khoản")).toBeNull();
    expect(screen.queryByTitle("Thu hồi phiên đăng nhập")).toBeNull();
  });
});
