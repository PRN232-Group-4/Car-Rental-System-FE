import React from "react";
import { describe, it, expect, vi } from "vitest";
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
vi.mock("@/features/admin/StaffShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaffShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe("FE-14 Admin Policies & Plans — Component Tests", () => {
  describe("PoliciesPage", () => {
    it("hiển thị tiêu đề, mô tả và nút Tạo phiên bản mới", async () => {
      renderWithClient(<PoliciesPage />);

      expect(screen.getByText("Chính sách thuê & Đặt cọc")).toBeInTheDocument();
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

    it("hiển thị cảnh báo khi phát hiện loại xe có nhiều chính sách active cùng lúc", async () => {
      renderWithClient(<PoliciesPage />);

      // Mock data có id 1 và id 4 cùng active cho Ô tô
      const alert = await screen.findByText(/Cảnh báo: Có 2 chính sách cùng đang áp dụng/i);
      expect(alert).toBeInTheDocument();
    });
  });

  describe("SubscriptionPlansPage", () => {
    it("hiển thị tiêu đề gói thuê bao và nút Tạo gói mới", async () => {
      renderWithClient(<SubscriptionPlansPage />);

      expect(screen.getByText("Gói thuê bao di chuyển")).toBeInTheDocument();
      expect(screen.getByText("Tạo gói mới")).toBeInTheDocument();
    });

    it("hiển thị danh mục các gói với thông tin hạn mức và giá", async () => {
      renderWithClient(<SubscriptionPlansPage />);

      expect(await screen.findByText("Gói Trải Nghiệm Khởi Đầu")).toBeInTheDocument();
      expect(screen.getByText("Gói Đô Thị Thông Minh")).toBeInTheDocument();
    });
  });
});
