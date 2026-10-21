import type { ReactNode } from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";

afterEach(() => vi.restoreAllMocks());
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UsersPage from "@/app/admin/users/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useSearchParams: () => new URLSearchParams(), usePathname: () => "/admin/users" }));
vi.mock("@/features/auth/AuthGate", () => ({ AuthGate: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("@/features/auth/AuthContext", () => ({ useSession: () => ({ user: { email: "admin@example.com", roles: ["Admin"] }, hasRole: (role: string) => role === "Admin" }) }));

describe("Users page API capability boundary", () => {
  it("retains the page and reports a backend failure without fabricating users", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockRejectedValue(new Error("Mất kết nối máy chủ"));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><UsersPage /></QueryClientProvider>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Người dùng & phân quyền.");
    expect(await screen.findByText("Mất kết nối máy chủ")).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("users", expect.objectContaining({ page: 1, pageSize: 10 }));
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("Nguyễn Văn Quản Trị")).toBeNull();
  });
});
