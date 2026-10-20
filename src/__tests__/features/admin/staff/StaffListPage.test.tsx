import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StaffsPage from "@/app/admin/staffs/page";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/staffs",
}));

// Mock Shell & AuthGate
vi.mock("@/features/admin/StaffShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="staff-shell">{children}</div>,
  StaffShell: ({ children }: { children: React.ReactNode }) => <div data-testid="staff-shell">{children}</div>,
}));

vi.mock("@/features/auth/AuthGate", () => ({
  AuthGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/auth/AuthContext", () => ({
  useSession: () => ({
    user: {
      email: "admin@thongdong.vn",
      fullName: "Nguyễn Văn Quản Trị",
      roles: ["Admin"],
    },
    status: "authenticated",
    isLoading: false,
    isAuthenticated: true,
    hasRole: () => true,
    hasAnyRole: () => true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
  useAuth: () => ({
    user: {
      email: "admin@thongdong.vn",
      fullName: "Nguyễn Văn Quản Trị",
      roles: ["Admin"],
    },
    status: "authenticated",
    isLoading: false,
    isAuthenticated: true,
    hasRole: () => true,
    hasAnyRole: () => true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

vi.mock("@/features/auth/context/AuthContext", () => ({
  useSession: () => ({
    user: {
      email: "admin@thongdong.vn",
      fullName: "Nguyễn Văn Quản Trị",
      roles: ["Admin"],
    },
    status: "authenticated",
    isLoading: false,
    isAuthenticated: true,
    hasRole: () => true,
    hasAnyRole: () => true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderStaffsPage() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <StaffsPage />
    </QueryClientProvider>
  );
}

describe("FE-24 Admin Staff — List Page Component", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("hiển thị tiêu đề trang và danh sách nhân sự", async () => {
    renderStaffsPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nhân viên & tài xế.");

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Quản Trị")).toBeDefined();
    });

    expect(screen.getByText("Phạm Hùng Cường (Tài xế VIP)")).toBeDefined();
    expect(screen.getAllByText("Ban Giám Đốc").length).toBeGreaterThan(0);
  });

  it("hiển thị các huy hiệu phân loại tài xế và trạng thái GPLX", async () => {
    renderStaffsPage();

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Quản Trị")).toBeDefined();
    });

    expect(screen.getAllByText("Tài xế").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nội bộ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Còn hạn").length).toBeGreaterThan(0);
  });

  it("có nút Thêm nhân viên dẫn tới trang /admin/staffs/new", async () => {
    renderStaffsPage();

    const addBtn = screen.getByText("Thêm nhân viên");
    expect(addBtn).toBeDefined();
    expect(addBtn.closest("a")).toHaveAttribute("href", "/admin/staffs/new");
  });
});
