import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportsPage from "@/features/../app/admin/reports/page";
import { ReportDetailView } from "@/features/admin/reports/components/ReportDetailView";
import { MOCK_REPORTS } from "@/features/admin/reports/api";

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
  usePathname: () => "/admin/reports",
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

describe("FE-19 Admin Reports — List & Detail Components", () => {
  it("hiển thị danh sách báo cáo, chip đếm trạng thái và bảng dữ liệu", async () => {
    renderWithClient(<ReportsPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Xử lý khiếu nại & báo cáo sự cố.");
    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Mới tiếp nhận")).toBeInTheDocument();
    expect(screen.getByText("Đang xử lý")).toBeInTheDocument();
    expect(screen.getByText("Đã giải quyết")).toBeInTheDocument();

    // Kiểm tra hàng hiển thị
    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument();
      expect(screen.getByText("Lê Hoàng Yến")).toBeInTheDocument();
    });

    // Kiểm tra huy hiệu quá hạn SLA trên đơn #102
    expect(screen.getByText("Quá hạn")).toBeInTheDocument();
  });

  it("bảo mật XSS: chuỗi script/HTML độc hại hiển thị dưới dạng văn bản thuần, không thực thi", () => {
    const maliciousReport = MOCK_REPORTS.find((r) => r.id === 105)!;
    renderWithClient(<ReportDetailView report={maliciousReport} />);

    // Kiểm tra nội dung chứa script hiển thị như text trong thẻ
    const descElement = screen.getByText(/<script>alert\("XSS_PAYLOAD"\)<\/script>/i);
    expect(descElement).toBeInTheDocument();
    expect(descElement.tagName.toLowerCase()).toBe("div");
  });

  it("hiển thị thẻ ngữ cảnh đơn thuê và các nút hành động", () => {
    const rentalReport = MOCK_REPORTS.find((r) => r.id === 101)!;
    renderWithClient(<ReportDetailView report={rentalReport} />);

    expect(screen.getByText("VinFast VF 8 Plus")).toBeInTheDocument();
    expect(screen.getByText(/51K-899.21/i)).toBeInTheDocument();
    expect(screen.getByText("Giải quyết sự cố")).toBeInTheDocument();
    expect(screen.getByText("Tạo phiếu bảo dưỡng")).toBeInTheDocument();
  });

  it("bắt buộc nhập lý do khi chọn từ chối báo cáo sự cố", async () => {
    const report = MOCK_REPORTS.find((r) => r.id === 101)!;
    renderWithClient(<ReportDetailView report={report} />);

    // Bấm nút Từ chối
    const rejectBtn = screen.getByRole("button", { name: /Từ chối/i });
    fireEvent.click(rejectBtn);

    // Modal xuất hiện
    expect(screen.getByText(/Từ chối báo cáo sự cố #101/i)).toBeInTheDocument();

    // Submit form khi chưa nhập lý do
    const form = screen.getByRole("dialog").querySelector("form")!;
    fireEvent.submit(form);

    // Báo lỗi yêu cầu lý do
    await waitFor(() => {
      expect(screen.getByText(/Vui lòng nhập lý do từ chối/i)).toBeInTheDocument();
    });
  });
});
