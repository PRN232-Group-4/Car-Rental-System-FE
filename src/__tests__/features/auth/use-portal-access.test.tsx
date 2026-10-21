import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { AccountProfile } from "@/features/profile/api";

const state = vi.hoisted(() => ({
  user: { email: "admin@example.test" }, isAuthenticated: true, isLoading: false,
}));
const mocks = vi.hoisted(() => ({ getProfile: vi.fn(), replace: vi.fn() }));
const router = { replace: mocks.replace };
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => router }));
vi.mock("@/features/auth/context/AuthContext", () => ({ useAuth: () => state }));
vi.mock("@/features/profile/api", () => ({ getAccountProfile: mocks.getProfile }));
import { usePortalAccess } from "@/features/auth/use-portal-access";

const allow = () => true;
beforeEach(() => {
  vi.clearAllMocks();
  state.user = { email: "admin@example.test" };
  state.isAuthenticated = true;
});

it("removes the old user's facility immediately when the logged-in account changes", async () => {
  mocks.getProfile.mockResolvedValueOnce({ email: "admin@example.test", facilityId: 1, facilityName: "Cơ sở A" });
  const { result, rerender } = renderHook(() => usePortalAccess(allow));
  await waitFor(() => expect(result.current.account?.facilityName).toBe("Cơ sở A"));
  let resolve!: (account: AccountProfile) => void;
  mocks.getProfile.mockReturnValueOnce(new Promise<AccountProfile>((done) => { resolve = done; }));
  state.user = { email: "technician@example.test" };
  rerender();
  expect(result.current.account).toBeNull();
  expect(result.current.checkingAccess).toBe(true);
  await act(async () => resolve({ email: state.user.email, facilityId: 2, facilityName: "Cơ sở B" }));
  expect(result.current.account?.facilityName).toBe("Cơ sở B");
});

it("ignores an old profile response after switching accounts", async () => {
  let resolveOld!: (account: AccountProfile) => void;
  mocks.getProfile.mockReturnValueOnce(new Promise<AccountProfile>((done) => { resolveOld = done; }));
  const { result, rerender } = renderHook(() => usePortalAccess(allow));
  mocks.getProfile.mockResolvedValueOnce({ email: "manager@example.test", facilityId: 2, facilityName: "Cơ sở B" });
  state.user = { email: "manager@example.test" };
  rerender();
  await waitFor(() => expect(result.current.account?.facilityName).toBe("Cơ sở B"));
  await act(async () => resolveOld({ email: "admin@example.test", facilityId: 1, facilityName: "Cơ sở A" }));
  expect(result.current.account?.facilityName).toBe("Cơ sở B");
});

it("removes the account on logout and redirects to login", async () => {
  mocks.getProfile.mockResolvedValue({ email: state.user.email, facilityName: "Cơ sở A" });
  const { result, rerender } = renderHook(() => usePortalAccess(allow));
  await waitFor(() => expect(result.current.checkingAccess).toBe(false));
  state.isAuthenticated = false;
  rerender();
  expect(result.current.account).toBeNull();
  expect(mocks.replace).toHaveBeenCalledWith("/login");
});
