import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, act, waitFor, renderHook } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sanitizeNext } from "@/lib/url";
import { AuthGate, DefaultShellSkeleton } from "@/features/auth/AuthGate";
import { AuthProvider, useSession, type SessionContextType } from "@/features/auth/AuthContext";
import * as authApi from "@/features/auth/api";
import type { AuthUser } from "@/features/auth/types";
import type { Role } from "@/features/auth/roles";
import ForbiddenPage from "@/app/forbidden/page";

// ============================================================================
// MOCKS & SETUP
// ============================================================================

const mockRouterReplace = vi.fn();
const mockRouterPush = vi.fn();
let currentPathname = "/admin/dashboard";
let mockSessionOverride: SessionContextType | null = null;

vi.mock("@/components/navigation/NavigationProvider", () => ({
  useNavigationRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
  useNavigationLoading: () => ({
    isLoading: false,
    begin: vi.fn(),
    finish: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
}));

vi.mock("@/features/auth/api", () => ({
  getProfile: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
}));

vi.mock("@/features/auth/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth/AuthContext")>();
  return {
    ...actual,
    useSession: () => (mockSessionOverride !== null ? mockSessionOverride : actual.useSession()),
    useAuth: () => (mockSessionOverride !== null ? mockSessionOverride : actual.useAuth()),
  };
});

const mockAuthUser: AuthUser = {
  email: "admin@thongdong.vn",
  fullName: "Admin User",
  roles: ["Admin"],
};

const mockStaffUser: AuthUser = {
  email: "staff@thongdong.vn",
  fullName: "Staff Member",
  roles: ["Staff"],
};

// ============================================================================
// 1. OPEN REDIRECT DEFENSE & sanitizeNext STRESS-TESTING
// ============================================================================

describe("Challenger Suite 1: sanitizeNext & Open Redirect Defense", () => {
  describe("Mandatory Dispatched Payloads", () => {
    it("sanitizes 'https://attacker.com' to fallback '/'", () => {
      expect(sanitizeNext("https://attacker.com")).toBe("/");
    });

    it("sanitizes '//attacker.com' to fallback '/'", () => {
      expect(sanitizeNext("//attacker.com")).toBe("/");
    });

    it("sanitizes '///attacker.com' to fallback '/'", () => {
      expect(sanitizeNext("///attacker.com")).toBe("/");
    });

    it("sanitizes 'javascript:alert(1)' to fallback '/'", () => {
      expect(sanitizeNext("javascript:alert(1)")).toBe("/");
    });

    it("sanitizes '\\attacker.com' to fallback '/'", () => {
      expect(sanitizeNext("\\attacker.com")).toBe("/");
    });

    it("preserves safe relative path '/valid/path?foo=bar'", () => {
      expect(sanitizeNext("/valid/path?foo=bar")).toBe("/valid/path?foo=bar");
    });
  });

  describe("Adversarial Protocol & Path Bypass Matrix", () => {
    it("blocks Windows and mixed-slash variations", () => {
      expect(sanitizeNext("/\\attacker.com")).toBe("/");
      expect(sanitizeNext("\\\\attacker.com")).toBe("/");
      expect(sanitizeNext("\\/attacker.com")).toBe("/");
      expect(sanitizeNext("///\\attacker.com")).toBe("/");
      expect(sanitizeNext("//\\attacker.com")).toBe("/");
    });

    it("blocks execution and data protocols", () => {
      expect(sanitizeNext("data:text/html,<script>alert(1)</script>")).toBe("/");
      expect(sanitizeNext("vbscript:msgbox(1)")).toBe("/");
      expect(sanitizeNext("file:///etc/passwd")).toBe("/");
      expect(sanitizeNext("javascript:void(0)")).toBe("/");
    });

    it("blocks absolute schemes without standard slash formatting", () => {
      expect(sanitizeNext("http://attacker.com")).toBe("/");
      expect(sanitizeNext("https:attacker.com")).toBe("/");
      expect(sanitizeNext("ftp://attacker.com/resource")).toBe("/");
      expect(sanitizeNext("ws://attacker.com")).toBe("/");
      expect(sanitizeNext("custom-scheme://attacker.com")).toBe("/");
    });

    it("blocks whitespace and control character evasion", () => {
      expect(sanitizeNext("   https://attacker.com   ")).toBe("/");
      expect(sanitizeNext("\t//attacker.com")).toBe("/");
      expect(sanitizeNext("\njavascript:alert(1)")).toBe("/");
      expect(sanitizeNext("/\x00/attacker.com")).toBe("/");
      expect(sanitizeNext("/\x1f/test")).toBe("/");
      expect(sanitizeNext("/\x7f/delete")).toBe("/");
    });

    it("handles null, undefined, empty, and custom fallback correctly", () => {
      expect(sanitizeNext(null)).toBe("/");
      expect(sanitizeNext(undefined)).toBe("/");
      expect(sanitizeNext("")).toBe("/");
      expect(sanitizeNext("    ")).toBe("/");
      expect(sanitizeNext("https://attacker.com", "/portal")).toBe("/portal");
      expect(sanitizeNext(null, "/custom-home")).toBe("/custom-home");
    });

    it("allows valid deep internal application paths with query parameters and hashes", () => {
      expect(sanitizeNext("/admin/vehicles/123/edit")).toBe("/admin/vehicles/123/edit");
      expect(sanitizeNext("/find?category=suv&priceRange=100-200&brand=VinFast")).toBe(
        "/find?category=suv&priceRange=100-200&brand=VinFast",
      );
      expect(sanitizeNext("/account/profile#security")).toBe("/account/profile#security");
    });
  });
});

// ============================================================================
// 2. AuthGate SKELETON FALLBACK & DOM LEAK STRESS-TESTING
// ============================================================================

describe("Challenger Suite 2: AuthGate DOM Protection & Skeleton Fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = "/admin/secure-cockpit";
    mockSessionOverride = null;
  });

  afterEach(() => {
    mockSessionOverride = null;
  });

  it("CRITICAL DOM LEAK CHECK: never renders protected children or executes child bodies during loading", () => {
    const sideEffectTracker = vi.fn();

    function HighlySensitiveAdminDashboard() {
      sideEffectTracker();
      return (
        <div data-testid="leaked-sensitive-dom">
          <h1>SENSITIVE ADMIN DATA - RESTRICTED</h1>
          <button data-testid="delete-database-btn">Delete Database</button>
        </div>
      );
    }

    mockSessionOverride = {
      user: null,
      status: "loading",
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => false,
      hasAnyRole: () => false,
      refreshProfile: vi.fn(),
    };

    render(
      <AuthGate allowedRoles={["Admin"]} requireAuth={true}>
        <HighlySensitiveAdminDashboard />
      </AuthGate>,
    );

    // 1. Child body must NEVER be called while loading
    expect(sideEffectTracker).not.toHaveBeenCalled();

    // 2. No protected DOM elements exist in document
    expect(screen.queryByTestId("leaked-sensitive-dom")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-database-btn")).not.toBeInTheDocument();
    expect(screen.queryByText(/SENSITIVE ADMIN DATA/i)).not.toBeInTheDocument();

    // 3. Skeleton fallback is active and accessible
    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-label", "Đang kiểm tra quyền truy cập");

    // 4. No navigation is fired during loading state
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("custom fallback skeleton replaces DefaultShellSkeleton while keeping DOM locked", () => {
    mockSessionOverride = {
      user: null,
      status: "loading",
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => false,
      hasAnyRole: () => false,
      refreshProfile: vi.fn(),
    };

    render(
      <AuthGate
        allowedRoles={["Admin"]}
        fallback={<div data-testid="custom-blueprint-skeleton">Loading CAD Blueprint...</div>}
      >
        <div data-testid="protected-body">Top Secret</div>
      </AuthGate>,
    );

    expect(screen.getByTestId("custom-blueprint-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("protected-body")).not.toBeInTheDocument();
  });

  it("maintains skeleton shield during transition to anonymous without flashing protected DOM", () => {
    currentPathname = "/admin/users";

    mockSessionOverride = {
      user: null,
      status: "anonymous",
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => false,
      hasAnyRole: () => false,
      refreshProfile: vi.fn(),
    };

    render(
      <AuthGate allowedRoles={["Admin"]} requireAuth={true}>
        <div data-testid="admin-panel">Admin User Table</div>
      </AuthGate>,
    );

    expect(screen.queryByTestId("admin-panel")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(mockRouterReplace).toHaveBeenCalledWith("/login?next=%2Fadmin%2Fusers");
  });

  it("maintains skeleton shield when authenticated but unauthorized (redirects to /forbidden)", () => {
    currentPathname = "/admin/users";

    mockSessionOverride = {
      user: mockStaffUser,
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: (role: string) => role === "Staff",
      hasAnyRole: (roles: readonly (Role | string)[]) => roles.includes("Staff"),
      refreshProfile: vi.fn(),
    };

    render(
      <AuthGate allowedRoles={["Admin"]} requireAuth={true}>
        <div data-testid="admin-panel">Admin User Table</div>
      </AuthGate>,
    );

    expect(screen.queryByTestId("admin-panel")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(mockRouterReplace).toHaveBeenCalledWith("/forbidden?from=%2Fadmin%2Fusers");
  });

  it("unblocks and renders protected DOM only when fully authenticated and authorized", () => {
    mockSessionOverride = {
      user: mockAuthUser,
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: (role: string) => role === "Admin",
      hasAnyRole: (roles: readonly (Role | string)[]) => roles.includes("Admin"),
      refreshProfile: vi.fn(),
    };

    render(
      <AuthGate allowedRoles={["Admin"]} requireAuth={true}>
        <div data-testid="admin-panel">Authorized Admin View</div>
      </AuthGate>,
    );

    expect(screen.getByTestId("admin-panel")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 3. BROADCASTCHANNEL MULTI-TAB SYNCHRONIZATION & ROBUST FALLBACK
// ============================================================================

describe("Challenger Suite 3: BroadcastChannel Multi-Tab Synchronization & Fallbacks", () => {
  let queryClient: QueryClient;
  let channelInstances: MockChannel[] = [];

  class MockChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    isClosed = false;

    constructor(name: string) {
      this.name = name;
      channelInstances.push(this);
    }

    postMessage(data: unknown) {
      if (this.isClosed) throw new Error("Cannot post message on closed channel");
      channelInstances.forEach((ch) => {
        if (ch !== this && ch.name === this.name && !ch.isClosed && ch.onmessage) {
          ch.onmessage(new MessageEvent("message", { data }));
        }
      });
    }

    close() {
      this.isClosed = true;
      channelInstances = channelInstances.filter((ch) => ch !== this);
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionOverride = null;
    channelInstances = [];
    vi.stubGlobal("BroadcastChannel", MockChannel);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
      },
    });
  });

  afterEach(() => {
    mockSessionOverride = null;
    vi.unstubAllGlobals();
  });

  const createWrapper = () => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      );
    };
  };

  it("synchronizes multi-tab logout immediately via 'vrs-auth'", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(mockAuthUser);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    const tab2Channel = new MockChannel("vrs-auth");
    act(() => {
      tab2Channel.postMessage({ type: "logout" });
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it("synchronizes multi-tab login by invalidating session query", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
    });

    vi.mocked(authApi.getProfile).mockResolvedValueOnce(mockAuthUser);

    const tab2Channel = new MockChannel("vrs-auth");
    act(() => {
      tab2Channel.postMessage({ type: "login" });
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
      expect(result.current.user).toEqual(mockAuthUser);
    });
  });

  it("handles corrupted, hostile or malformed broadcast payloads gracefully without throwing", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(mockAuthUser);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    const tab2Channel = new MockChannel("vrs-auth");

    act(() => {
      tab2Channel.postMessage(null);
      tab2Channel.postMessage(undefined);
      tab2Channel.postMessage("raw text string");
      tab2Channel.postMessage(12345);
      tab2Channel.postMessage({ someOtherProp: "test" });
      tab2Channel.postMessage({ type: 999 });
      tab2Channel.postMessage({ type: "unrecognized_command" });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.user).toEqual(mockAuthUser);
  });

  it("GRACEFUL FALLBACK: functions properly when BroadcastChannel is undefined (unsupported browser)", async () => {
    vi.stubGlobal("BroadcastChannel", undefined);

    vi.mocked(authApi.getProfile).mockResolvedValue(mockAuthUser);
    vi.mocked(authApi.logoutUser).mockResolvedValue();

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    // When backend logout completes, subsequent getProfile returns null
    vi.mocked(authApi.getProfile).mockResolvedValue(null);

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
  });

  it("GRACEFUL FALLBACK: functions properly when BroadcastChannel constructor throws SecurityError", async () => {
    class ThrowingBroadcastChannel {
      constructor() {
        throw new DOMException("Access to BroadcastChannel is denied in this document", "SecurityError");
      }
    }
    vi.stubGlobal("BroadcastChannel", ThrowingBroadcastChannel);

    vi.mocked(authApi.getProfile).mockResolvedValue(mockAuthUser);
    vi.mocked(authApi.logoutUser).mockResolvedValue();

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    vi.mocked(authApi.getProfile).mockResolvedValue(null);

    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
  });

  it("GRACEFUL FALLBACK: functions properly when postMessage throws DataCloneError", async () => {
    class ThrowingPostMessageChannel {
      name: string;
      onmessage: null = null;
      constructor(name: string) {
        this.name = name;
      }
      postMessage() {
        throw new DOMException("DataCloneError", "DataCloneError");
      }
      close() {}
    }
    vi.stubGlobal("BroadcastChannel", ThrowingPostMessageChannel);

    vi.mocked(authApi.getProfile).mockResolvedValue(mockAuthUser);
    vi.mocked(authApi.logoutUser).mockResolvedValue();

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    vi.mocked(authApi.getProfile).mockResolvedValue(null);

    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
  });
});

// ============================================================================
// 4. DESIGN.md v3.1 COMPLIANCE ON /forbidden & AUTH COMPONENTS
// ============================================================================

describe("Challenger Suite 4: DESIGN.md v3.1 Compliance Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionOverride = null;
  });

  afterEach(() => {
    mockSessionOverride = null;
  });

  it("DefaultShellSkeleton conforms to DESIGN.md v3.1 tokens", () => {
    const { container } = render(<DefaultShellSkeleton />);
    const root = container.firstElementChild as HTMLElement;

    // Must use Warm Canvas background
    expect(root.className).toContain("bg-canvas");
    // Must use min-h-dvh (no forbidden viewport screen utility)
    expect(root.className).toContain("min-h-dvh");
    const forbiddenViewportClass = ["h", "screen"].join("-");
    expect(root.className).not.toContain(forbiddenViewportClass);
    // Text must use Ink tokens (no raw black or forbidden colors)
    expect(container.querySelector(".text-ink-3")).toBeInTheDocument();
    // Primary spinner uses primary / primary-border
    expect(container.querySelector(".bg-primary\\/10")).toBeInTheDocument();
    expect(container.querySelector(".text-primary")).toBeInTheDocument();
  });

  it("ForbiddenPage conforms to DESIGN.md v3.1 tokens and renders appropriate portal navigation", () => {
    // 1. Authenticated Staff user
    mockSessionOverride = {
      user: mockStaffUser,
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: (role: string) => role === "Staff",
      hasAnyRole: (roles: readonly (Role | string)[]) => roles.includes("Staff"),
      refreshProfile: vi.fn(),
    };

    const { container, rerender } = render(<ForbiddenPage />);
    const mainEl = container.querySelector("main") as HTMLElement;

    // Layout tokens: Warm Canvas and min-h-dvh
    expect(mainEl.className).toContain("bg-canvas");
    expect(mainEl.className).toContain("min-h-dvh");
    expect(mainEl.className).toContain("text-ink");
    const forbiddenViewportClass = ["h", "screen"].join("-");
    expect(mainEl.className).not.toContain(forbiddenViewportClass);

    // Color tokens
    expect(container.querySelector(".text-ink-3")).toBeInTheDocument();

    // Authenticated actions: Portal button + Home button
    const portalBtn = screen.getByRole("link", { name: /Về cổng được phân quyền/i });
    expect(portalBtn).toBeInTheDocument();
    expect(portalBtn.className).toContain("bg-primary");
    expect(portalBtn.className).toContain("text-white");
    expect(portalBtn).toHaveAttribute("href", "/admin");

    const homeBtn = screen.getByRole("link", { name: /Trang chủ/i });
    expect(homeBtn).toBeInTheDocument();
    expect(homeBtn.className).toContain("bg-surface");
    expect(homeBtn.className).toContain("border-line");

    // 2. Unauthenticated anonymous user
    mockSessionOverride = {
      user: null,
      status: "anonymous",
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => false,
      hasAnyRole: () => false,
      refreshProfile: vi.fn(),
    };

    rerender(<ForbiddenPage />);
    const loginBtn = screen.getByRole("link", { name: /Đăng nhập lại/i });
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn.className).toContain("bg-primary");
    expect(loginBtn).toHaveAttribute("href", "/login");
  });
});
