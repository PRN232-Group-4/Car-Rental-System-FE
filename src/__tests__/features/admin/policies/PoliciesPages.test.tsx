import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PoliciesPage from "@/app/admin/policies/page";
import SubscriptionPlansPage from "@/app/admin/subscription-plans/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/policies",
}));

// Mock Shell & AuthGate
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

describe("FE-14 Admin Policies & Plans — Component Tests", () => {
  beforeEach(() => {
    vi.spyOn(backendApiClient, "get").mockImplementation(async (path) => {
      if (path === "vehicle-types") return [{ id: 1, name: "Ô tô" }];
      if (path === "rental-policies") return {
        items: [
          { id: 1, vehicleTypeId: 1, name: "Chính sách tiêu chuẩn Ô tô 2026-Q1", vatRate: 10, overtimeFeeRate: 20, depositPercentage: 20, isActive: true },
          { id: 2, vehicleTypeId: 1, name: "Chính sách thay thế", vatRate: 8, overtimeFeeRate: 15, depositPercentage: 20, isActive: true },
        ], totalCount: 2,
      };
      if (path === "subscription-plans") return [
        { id: 1, name: "Gói Trải Nghiệm Khởi Đầu", price: 990000, durationDays: 30, includedHours: 12, isActive: true },
        { id: 2, name: "Gói Đô Thị Thông Minh", price: 2490000, durationDays: 60, includedHours: 35, isActive: true },
      ];
      throw new Error("Unexpected test API: " + path);
    });
  });
  describe("PoliciesPage", () => {
    it("hiển thị tiêu đề, mô tả và nút Tạo phiên bản mới", async () => {
      renderWithClient(<PoliciesPage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Chính sách thuê & đặt cọc");
      expect(
        screen.getByText(/Chính sách thuê là bất biến theo phiên bản/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Tạo phiên bản mới")).toBeInTheDocument();
    });

    it("xác nhận quy tắc bất biến: KHÔNG có bất kỳ nút Sửa hoặc Xóa nào trong danh sách chính sách", async () => {
      renderWithClient(<PoliciesPage />);

      // Chờ dữ liệu hiển thị
      await screen.findByText("Chính sách tiêu chuẩn Ô tô 2026-Q1");

      // Kiểm tra không có nút Sửa hoặc Xóa
      expect(screen.queryByRole("button", { name: /chỉnh sửa/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /xóa/i })).not.toBeInTheDocument();
    });

    it("không hiển thị các banner cảnh báo chính sách đã bỏ", async () => {
      renderWithClient(<PoliciesPage />);

      await screen.findByText("Chính sách tiêu chuẩn Ô tô 2026-Q1");
      expect(screen.queryByText(/Cảnh báo: Có/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Chặn nghiệp vụ:/i)).not.toBeInTheDocument();
    });
  });

  describe("SubscriptionPlansPage", () => {
    it("hiển thị tiêu đề gói thuê bao và nút Tạo gói mới", async () => {
      renderWithClient(<SubscriptionPlansPage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Gói thuê bao di chuyển");
      expect(screen.getByText("Tạo gói mới")).toBeInTheDocument();
    });

    it("hiển thị danh mục các gói với thông tin hạn mức và giá", async () => {
      renderWithClient(<SubscriptionPlansPage />);

      expect(await screen.findByText("Gói Trải Nghiệm Khởi Đầu")).toBeInTheDocument();
      expect(screen.getByText("Gói Đô Thị Thông Minh")).toBeInTheDocument();
    });
  });
});
