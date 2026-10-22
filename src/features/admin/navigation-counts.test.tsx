import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AccountProfile } from "@/features/profile/api";
import { NavigationCount, NavigationDot } from "./transit-desk/NavigationIndicator";
import { ADMIN_NAVIGATION_COUNTS_KEY, navigationCount } from "./navigation-counts";
import { useNavigationCounts } from "./use-navigation-counts";
import { useReviewLicense } from "./users/hooks";
import { getNavigation, ROUTE_CHAPTER_MAP } from "@/config/navigation";

const api = vi.hoisted(() => ({ get: vi.fn(), review: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: { get: api.get } }));
vi.mock("./users/api", () => ({ reviewCustomerLicense: api.review }));

const counts = { rentals: 123, inspections: 3, maintenance: 2, reports: 4, licenses: 5 };
const admin = { email: "admin@example.test", roles: ["Admin"], facilityId: 1 } as AccountProfile;
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}
beforeEach(() => vi.clearAllMocks());

describe("navigation work queues", () => {
  it("maps only actionable routes and rejects unavailable or invalid counts", () => {
    expect(navigationCount(counts, "/admin/rentals")).toBe(123);
    expect(navigationCount(counts, "/admin/inspections")).toBe(3);
    expect(navigationCount(counts, "/admin/maintenance")).toBe(2);
    expect(navigationCount(counts, "/admin/reports")).toBe(4);
    expect(navigationCount(counts, "/admin/customers")).toBe(5);
    for (const href of ["/admin/reviews", "/admin/users", "/admin"]) expect(navigationCount(counts, href)).toBe(0);
    expect(navigationCount(undefined, "/admin/rentals")).toBe(0);
    for (const value of [0, -1, 1.5, NaN, Infinity, "5", null]) {
      expect(navigationCount({ ...counts, rentals: value } as typeof counts, "/admin/rentals")).toBe(0);
    }
  });

  it("renders exact counts with accessible text and hides empty indicators", () => {
    const { rerender, container } = render(<><NavigationDot hasWork /><NavigationCount count={123} /></>);
    expect(screen.getByText("123", { exact: true })).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(", 123 hồ sơ mới cần xử lý")).toBeInTheDocument();
    expect(screen.getByText(", có hồ sơ mới cần xử lý")).toBeInTheDocument();
    rerender(<><NavigationDot hasWork={false} /><NavigationCount count={0} /></>);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the license queue under care and preserves its existing read roles", () => {
    const license = getNavigation(["CustomerService"], "admin").find((item) => item.href === "/admin/customers");
    expect(license).toMatchObject({ label: "Khách hàng & GPLX", defaultQuery: "?licenseStatus=pending" });
    expect(ROUTE_CHAPTER_MAP[license!.href]).toBe("Chăm sóc & Sự cố");
    expect(getNavigation(["Staff"], "admin")).toContainEqual(license);
    expect(getNavigation(["Maintenance"], "admin")).not.toContainEqual(license);
    expect(getNavigation(["Admin"], "admin")).not.toContainEqual(license);
  });

  it("does not fetch until portal access is confirmed, and isolates account scope", async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue(counts);
    const { result, rerender } = renderHook(({ account }) => useNavigationCounts(account), { wrapper, initialProps: { account: null as AccountProfile | null } });
    expect(api.get).not.toHaveBeenCalled();
    rerender({ account: admin });
    await waitFor(() => expect(result.current.data).toEqual(counts));
    expect(api.get).toHaveBeenCalledWith("admin/navigation-counts", undefined, { signal: expect.any(AbortSignal) });
    api.get.mockResolvedValue({ ...counts, rentals: 0 });
    rerender({ account: { ...admin, email: "other@example.test", facilityId: 2 } });
    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.data?.rentals).toBe(0));
  });

  it("refreshes badges and the license queue after successful approval", async () => {
    const { client, wrapper } = setup();
    api.get.mockResolvedValue(counts);
    api.review.mockResolvedValue({ fullName: "Khách hàng" });
    client.setQueryData(["admin-customers"], { items: [] });
    const { result } = renderHook(() => ({ counts: useNavigationCounts(admin), review: useReviewLicense() }), { wrapper });
    await waitFor(() => expect(result.current.counts.data?.licenses).toBe(5));
    api.get.mockResolvedValue({ ...counts, licenses: 4 });
    await act(async () => { await result.current.review.mutateAsync({ customerId: 1, status: "approved" }); });
    await waitFor(() => expect(result.current.counts.data?.licenses).toBe(4));
    expect(client.getQueryState(["admin-customers"])?.isInvalidated).toBe(true);
    expect(client.getQueriesData({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY })).toHaveLength(1);
  });

  it("does not change cached counts on failed license approval", async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue(counts);
    api.review.mockRejectedValue(new Error("Server unavailable"));
    const { result } = renderHook(() => ({ counts: useNavigationCounts(admin), review: useReviewLicense() }), { wrapper });
    await waitFor(() => expect(result.current.counts.data?.licenses).toBe(5));
    await act(async () => { await expect(result.current.review.mutateAsync({ customerId: 1, status: "rejected" })).rejects.toThrow(); });
    expect(result.current.counts.data?.licenses).toBe(5);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
