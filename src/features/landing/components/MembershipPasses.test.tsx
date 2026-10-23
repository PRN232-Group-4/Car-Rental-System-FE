import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import MembershipPasses from "./MembershipPasses";
import SubscriptionPlans from "@/features/subscriptions/components/SubscriptionPlans";
const api = vi.hoisted(() => ({ getSubscriptionPlans: vi.fn(), purchaseSubscriptionPlan: vi.fn() }));
vi.mock("@/features/subscriptions/api", () => api);
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/auth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => ({ push: vi.fn() }) }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
it("distinguishes pending, empty and failed plan requests without sample plans", async () => {
  let resolve!: (plans: never[]) => void;
  api.getSubscriptionPlans.mockReturnValue(new Promise<never[]>(done => { resolve = done; }));
  const { unmount } = render(<MembershipPasses />);
  expect(screen.getByRole("status")).toHaveTextContent("Đang tải");
  await act(async () => resolve([]));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("chưa có gói"));
  unmount();
  api.getSubscriptionPlans.mockRejectedValueOnce(new Error("offline"));
  render(<MembershipPasses />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Không tải được"));
  expect(screen.queryByText(/chưa có gói/)).not.toBeInTheDocument();
});

it("does not label a plan popular or promise reservation privileges without backend data", async () => {
  api.getSubscriptionPlans.mockResolvedValue([{ id: 1, name: "Gói API", price: 100000, hours: 10, validityDays: 7, features: [] }]);
  render(<SubscriptionPlans />);
  await screen.findByRole("heading", { name: "Gói API" });
  expect(screen.queryByText("LỰA CHỌN PHỔ BIẾN NHẤT")).not.toBeInTheDocument();
  expect(screen.queryByText(/Ưu tiên giữ xe/)).not.toBeInTheDocument();
});
