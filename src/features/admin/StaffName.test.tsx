import { beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const api = vi.hoisted(() => ({ getStaffById: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "admin" }));
vi.mock("./api", () => api);
vi.mock("@/features/auth", () => ({ useAuth: () => ({ hasRole: (role: string) => role === auth.role }) }));
import StaffName from "./StaffName";
beforeEach(() => { vi.resetAllMocks(); auth.role = "admin"; });
function setup(props: React.ComponentProps<typeof StaffName>) {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><StaffName {...props} /></QueryClientProvider>);
}
it("resolves a personnel reference to email rather than a raw ID or display name", async () => {
  api.getStaffById.mockResolvedValue({ id: 7, fullName: "Nguyễn Văn A", email: "staff@example.com" });
  setup({ staffId: 7, name: "Nguyễn Văn A" });
  expect(await screen.findByText("staff@example.com")).toBeVisible();
  expect(api.getStaffById).toHaveBeenCalledExactlyOnceWith(7);
});
it("uses a provided email without making staff directory requests", () => {
  auth.role = "maintenance";
  setup({ staffId: 7, email: "staff@example.com" });
  expect(screen.getByText("staff@example.com")).toBeVisible();
  expect(api.getStaffById).not.toHaveBeenCalled();
});
