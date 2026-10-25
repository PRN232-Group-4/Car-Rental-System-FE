import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
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
  beforeEach(() => {
    vi.spyOn(backendApiClient, "get").mockImplementation(async (path) => {
      if (path === "rentals/mine") return {
        items: [{ id: 101, status: "pending", rentalType: "hourly", isSubscription: false, vehicleId: 1, vehicleBrand: "VinFast", vehicleModel: "VF 8 Plus", startTime: "2027-01-02T08:00:00Z", endTime: "2027-01-03T08:00:00Z", totalPrice: 2700000 }],
        page: 1, pageSize: 12, totalCount: 1,
      };
      if (path === "rental/mine/101") return {
        id: 101, status: "pending", rentalType: "hourly", isSubscription: false,
        vehicle: { id: 1, brand: "VinFast", model: "VF 8 Plus" }, facility: { id: 5, name: "Chi nhánh Quận 1", phone: "0281234567" },
        start: "2027-01-02T08:00:00Z", end: "2027-01-03T08:00:00Z", hasDriver: false, canCancel: true,
        price: { rent: 2200000, vat: 220000, deposit: 280000, overtime: 0, total: 2700000 },
        inspections: [], timeline: [{ to: "pending", at: "2027-01-01T08:00:00Z", actor: "customer" }],
      };
      throw new Error("Unexpected test API: " + path);
    });
  });
  describe("MyTripsPage — Danh sách", () => {
    it("hiển thị tiêu đề, các tab trạng thái và danh sách chuyến đi", async () => {
      renderWithClient(<MyTripsPage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Chuyến của tôi.");
      expect(screen.getByRole("tab", { name: "Sắp tới" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Đang thuê" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Đã trả xe" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Đã hủy" })).toBeInTheDocument();

      // Kiểm tra xe trong tab sắp tới xuất hiện
      expect(await screen.findByText("VinFast VF 8 Plus")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hủy đơn thuê #101" })).toBeInTheDocument();
    });
  });

  describe("TripDetailPage — Chi tiết", () => {
    it("hiển thị thông tin hành trình, stepper tiến trình và nút hủy", async () => {
      renderWithClient(<TripDetailPage />);

      expect(await screen.findByText("VinFast VF 8 Plus")).toBeInTheDocument();
      expect(screen.getByText("Mã yêu cầu: #101 · Chưa phát hành đơn chính thức")).toBeInTheDocument();
      expect(screen.getByText("Tiến trình đơn thuê")).toBeInTheDocument();
      expect(screen.getByText("Thông tin hành trình & Bàn giao")).toBeInTheDocument();
      expect(screen.getByText("Chi nhánh Quận 1")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hủy chuyến/i })).toBeInTheDocument();
    });
  });
});
