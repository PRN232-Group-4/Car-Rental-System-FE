import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminReviewsPage from "@/features/../app/admin/reviews/page";
import { ReviewDetailView } from "@/features/admin/reviews/components/ReviewDetailView";
import { MOCK_REVIEWS, resetReviewsMock } from "@/features/admin/reviews/api";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/reviews",
}));

// Mock StaffShell & AuthGate
vi.mock("@/features/admin/StaffShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="staff-shell">{children}</div>,
  StaffShell: ({ children }: { children: React.ReactNode }) => <div data-testid="staff-shell">{children}</div>,
}));

vi.mock("@/features/auth/AuthGate", () => ({
  AuthGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock AuthContext
vi.mock("@/features/auth/AuthContext", () => ({
  useSession: () => ({
    user: { email: "admin@thongdong.vn", roles: ["Admin"], fullName: "Quản Trị Viên" },
    isAuthenticated: true,
    isLoading: false,
  }),
  useAuth: () => ({
    user: { email: "admin@thongdong.vn", roles: ["Admin"], fullName: "Quản Trị Viên" },
    isAuthenticated: true,
    hasRole: () => true,
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Admin Reviews Page & Moderation (FE-25)", () => {
  beforeEach(() => {
    resetReviewsMock();
  });

  it("render trang quản trị đánh giá với đầy đủ tiêu đề và danh sách từ mock", async () => {
    renderWithClient(<AdminReviewsPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Đánh giá nhân sự & tài xế.");
    expect(screen.getByText("01 · Điểm trung bình")).toBeInTheDocument();

    await waitFor(() => {
      // Tìm thấy nhân viên từ mock
      expect(screen.getAllByText("Nguyễn Văn Tài").length).toBeGreaterThan(0);
      expect(screen.getByText("Lê Hoàng Yến")).toBeInTheDocument();
    });
  });

  it("không bao giờ cung cấp thao tác xóa vĩnh viễn đánh giá", () => {
    const review = MOCK_REVIEWS[0];
    renderWithClient(<ReviewDetailView review={review} />);

    // Kiểm tra không có bất kỳ nút "Xóa" hoặc "Xóa vĩnh viễn" nào
    const deleteButton = screen.queryByRole("button", { name: /xóa vĩnh viễn/i });
    expect(deleteButton).toBeNull();
  });

  it("bảo vệ chống XSS: render nội dung nhận xét độc hại dưới dạng text thuần túy", () => {
    const xssReview = MOCK_REVIEWS.find((r) => r.id === 6)!;
    renderWithClient(<ReviewDetailView review={xssReview} />);

    // Nội dung chứa chuỗi script phải hiển thị dưới dạng văn bản text, không render thành thẻ script
    expect(
      screen.getByText(/<script>alert\("XSS Attack Failed"\)<\/script>/i)
    ).toBeInTheDocument();
  });

  it("mở modal ẩn kiểm duyệt với lý do bắt buộc và cảnh báo công bằng tác động điểm số", async () => {
    const review = MOCK_REVIEWS[0]; // 5 sao
    renderWithClient(<ReviewDetailView review={review} />);

    const hideBtn = screen.getByRole("button", { name: /ẩn kiểm duyệt/i });
    fireEvent.click(hideBtn);

    // Modal xuất hiện
    await waitFor(() => {
      expect(screen.getByText(/Ẩn kiểm duyệt đánh giá #1/i)).toBeInTheDocument();
      expect(screen.getByText(/Cân nhắc tác động điểm số/i)).toBeInTheDocument();
    });

    // Chọn lý do và submit
    const submitBtn = screen.getByRole("button", { name: /xác nhận ẩn đánh giá/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Modal đóng lại
      expect(screen.queryByText(/Ẩn kiểm duyệt đánh giá #1/i)).toBeNull();
    });
  });

  it("xử lý đánh giá bị báo cáo: có nút Giữ hiển thị (Bác báo cáo) và Chấp nhận ẩn", () => {
    const reportedReview = MOCK_REVIEWS.find((r) => r.status === "reported")!;
    renderWithClient(<ReviewDetailView review={reportedReview} />);

    expect(screen.getByText(/Đánh giá đang bị gắn cờ báo cáo vi phạm/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /giữ hiển thị/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /chấp nhận ẩn/i })).toBeInTheDocument();
  });

  it("cho phép gửi phản hồi chính thức từ quản trị viên với độ dài hợp lệ", async () => {
    const reviewWithoutReply = MOCK_REVIEWS.find((r) => !r.hasReply)!;
    renderWithClient(<ReviewDetailView review={reviewWithoutReply} />);

    const textarea = screen.getByPlaceholderText(/nhập phản hồi từ đại diện thong dong/i);
    fireEvent.change(textarea, { target: { value: "Cảm ơn quý khách đã đóng góp ý kiến quý báu cho đội ngũ." } });

    const submitReplyBtn = screen.getByRole("button", { name: /lưu phản hồi/i });
    fireEvent.click(submitReplyBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Cảm ơn quý khách đã đóng góp ý kiến quý báu cho đội ngũ.")
      ).toBeInTheDocument();
    });
  });
});
