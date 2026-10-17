import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyTripsPage from "@/app/(dashboard)/account/trips/page";
import TripDetailPage from "@/app/(dashboard)/account/trips/detail/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "tab") return "upcoming";
      if (key === "id") return "101";
      return null;
    },
    toString: () => "tab=upcoming&id=101",
  }),
  usePathname: () => "/account/trips",
}));

vi.mock("@/features/auth/AuthGate", () => ({
  AuthGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("FE-07 My Trips — Component Tests", () => {
  describe("MyTripsPage — Danh sách", () => {
    it("hiển thị tiêu đề, các tab trạng thái và danh sách chuyến đi", async () => {
      renderWithClient(<MyTripsPage />);

      expect(screen.getByText("Chuyến của tôi")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Sắp tới" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Đang diễn ra" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Đã hoàn thành" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Đã hủy" })).toBeInTheDocument();

      // Kiểm tra xe trong tab sắp tới xuất hiện
      expect(await screen.findByText("VinFast VF 8 Plus")).toBeInTheDocument();
    });
  });

  describe("TripDetailPage — Chi tiết", () => {
    it("hiển thị thông tin hành trình, stepper tiến trình và nút hủy", async () => {
      renderWithClient(<TripDetailPage />);

      expect(await screen.findByText("VinFast VF 8 Plus")).toBeInTheDocument();
      expect(screen.getByText("Mã đơn thuê: #101")).toBeInTheDocument();
      expect(screen.getByText("Tiến trình đơn thuê")).toBeInTheDocument();
      expect(screen.getByText("Thông tin hành trình & Bàn giao")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hủy chuyến/i })).toBeInTheDocument();
    });
  });
});
