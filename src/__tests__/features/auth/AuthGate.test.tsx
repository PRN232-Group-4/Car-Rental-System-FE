import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGate } from "@/features/auth/AuthGate";
import { RequireRole } from "@/features/auth/RequireRole";
import type { SessionContextType } from "@/features/auth/AuthContext";

const mockRouterReplace = vi.fn();
const mockPathname = vi.fn();

vi.mock("@/components/navigation/NavigationProvider", () => ({
  useNavigationRouter: () => ({
    replace: mockRouterReplace,
    push: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const mockUseSession = vi.fn();

vi.mock("@/features/auth/AuthContext", () => ({
  useSession: () => mockUseSession(),
  useAuth: () => mockUseSession(),
}));

describe("AuthGate (Static Route Guard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/admin/users");
  });

  it("renders skeleton fallback and blocks children when session is loading (zero flicker)", () => {
    mockUseSession.mockReturnValue({
      user: null,
      status: "loading",
      isLoading: true,
      isAuthenticated: false,
    } as SessionContextType);

    render(
      <AuthGate allowedRoles={["Admin"]}>
        <div data-testid="protected-content">Admin Dashboard</div>
      </AuthGate>,
    );

    // Fallback skeleton is displayed
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Đang xác thực phiên làm việc...")).toBeInTheDocument();
    // Child protected content is NOT rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    // No redirect triggered during loading
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated user to /login with sanitized next parameter", () => {
    mockPathname.mockReturnValue("/admin/users");
    mockUseSession.mockReturnValue({
      user: null,
      status: "anonymous",
      isLoading: false,
      isAuthenticated: false,
    } as SessionContextType);

    render(
      <AuthGate allowedRoles={["Admin"]}>
        <div data-testid="protected-content">Admin Dashboard</div>
      </AuthGate>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(mockRouterReplace).toHaveBeenCalledWith("/login?next=%2Fadmin%2Fusers");
  });

  it("redirects unauthorized user to /forbidden?from=...", () => {
    mockPathname.mockReturnValue("/admin/users");
    mockUseSession.mockReturnValue({
      user: {
        email: "staff@example.com",
        fullName: "Staff Member",
        roles: ["Staff"],
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
    } as SessionContextType);

    render(
      <AuthGate allowedRoles={["Admin"]}>
        <div data-testid="protected-content">Admin Dashboard</div>
      </AuthGate>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(mockRouterReplace).toHaveBeenCalledWith("/forbidden?from=%2Fadmin%2Fusers");
  });

  it("renders protected content when user has required role", () => {
    mockPathname.mockReturnValue("/admin/users");
    mockUseSession.mockReturnValue({
      user: {
        email: "admin@example.com",
        fullName: "Admin User",
        roles: ["Admin"],
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
    } as SessionContextType);

    render(
      <AuthGate allowedRoles={["Admin"]}>
        <div data-testid="protected-content">Admin Dashboard</div>
      </AuthGate>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("renders custom fallback skeleton when provided", () => {
    mockUseSession.mockReturnValue({
      user: null,
      status: "loading",
      isLoading: true,
      isAuthenticated: false,
    } as SessionContextType);

    render(
      <AuthGate fallback={<div data-testid="custom-skeleton">Loading Custom...</div>}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGate>,
    );

    expect(screen.getByTestId("custom-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });
});

describe("RequireRole (Component-level Guard)", () => {
  it("renders children when user possesses required role", () => {
    mockUseSession.mockReturnValue({
      user: {
        email: "admin@example.com",
        fullName: "Admin User",
        roles: ["Admin"],
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
    } as SessionContextType);

    render(
      <RequireRole roles={["Admin", "Manager"]}>
        <button>Xóa dữ liệu</button>
      </RequireRole>,
    );

    expect(screen.getByRole("button", { name: "Xóa dữ liệu" })).toBeInTheDocument();
  });

  it("renders fallback or null when user lacks required role", () => {
    mockUseSession.mockReturnValue({
      user: {
        email: "staff@example.com",
        fullName: "Staff Member",
        roles: ["Staff"],
      },
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
    } as SessionContextType);

    const { rerender } = render(
      <RequireRole roles={["Admin"]} fallback={<p>Không có quyền</p>}>
        <button>Xóa dữ liệu</button>
      </RequireRole>,
    );

    expect(screen.getByText("Không có quyền")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa dữ liệu" })).not.toBeInTheDocument();

    rerender(
      <RequireRole roles={["Admin"]}>
        <button>Xóa dữ liệu</button>
      </RequireRole>,
    );
    expect(screen.queryByText("Không có quyền")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa dữ liệu" })).not.toBeInTheDocument();
  });
});
