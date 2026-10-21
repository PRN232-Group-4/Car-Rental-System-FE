import React from "react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RentalOperationsPage from "@/app/admin/rentals/page";
import * as operationsApi from "@/features/operations/api";
import { RENTAL_101 } from "./rental-fixture";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/admin/rentals",
}));

// Mock RentalTrackingPanel
vi.mock("@/features/maps/RentalTrackingPanel", () => ({
  default: ({ rentalId }: { rentalId: number | string }) => (
    <div data-testid="rental-tracking-panel">Hành trình GPS cho #{rentalId}</div>
  ),
}));

vi.mock("@/features/operations/TechnicianAssignmentForm", () => ({ default: () => null }));

// Mock VehicleName
vi.mock("@/features/admin/VehicleName", () => ({
  default: ({ vehicleId }: { vehicleId: number | string }) => (
    <span data-testid="vehicle-name">Phương tiện #{vehicleId}</span>
  ),
}));

import { SessionContext, type SessionContextType } from "@/features/auth/AuthContext";

const mockAdminSession: SessionContextType = {
  user: { email: "admin@thongdong.vn", fullName: "Admin User", roles: ["Admin"] },
  isAuthenticated: true,
  isLoading: false,
  status: "authenticated",
  login: vi.fn(),
  logout: vi.fn(),
  hasRole: (r: string) => r.toLowerCase() === "admin",
  hasAnyRole: (roles: readonly string[]) => roles.map((x) => String(x).toLowerCase()).includes("admin"),
  refreshProfile: vi.fn(),
};

function renderWithClient(ui: React.ReactElement, session: SessionContextType | undefined = mockAdminSession) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={session}>{ui}</SessionContext.Provider>
    </QueryClientProvider>
  );
}

describe("FE-TransitDesk: /admin/rentals — Rental Journey Operational Screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    // App không còn fixture: test tự cấp dữ liệu cho hồ sơ đơn thuê.
    vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValue(RENTAL_101);
  });

  it("hiển thị thanh tra cứu đơn và trạng thái rỗng khi chưa có ID", () => {
    renderWithClient(<RentalOperationsPage />);

    expect(screen.getByText("Hành trình vận hành đơn thuê")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /chưa chọn đơn thuê/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nhập mã đơn thuê...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tra cứu đơn" })).toBeInTheDocument();
  });

  it("tải dữ liệu đơn thuê và hiển thị State Rail, thông tin hợp đồng và tracking panel", async () => {
    mockSearchParams = new URLSearchParams("rentalId=101");
    renderWithClient(<RentalOperationsPage />);

    // Chờ dữ liệu đơn thuê #101 tải xong
    await waitFor(() => {
      expect(screen.getByText(/THÔNG SỐ HỢP ĐỒNG THUÊ #101/i)).toBeInTheDocument();
    });

    // Kiểm tra các bước trong State Rail
    expect(screen.getByText("Tiếp nhận & Xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Kiểm tra trước thuê")).toBeInTheDocument();
    expect(screen.getByText("Bàn giao & Đang thuê")).toBeInTheDocument();
    expect(screen.getByText("Nhận xe & Kiểm tra trả")).toBeInTheDocument();
    expect(screen.getByText("Hoàn tất & Quyết toán")).toBeInTheDocument();

    // Kiểm tra tracking panel và các nút hành động
    expect(screen.getByTestId("rental-tracking-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lưu phân công" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xác nhận cập nhật trạng thái" })).toBeInTheDocument();
  });

  it("thực hiện phân công tài xế thành công và thông báo phản hồi", async () => {
    mockSearchParams = new URLSearchParams("rentalId=101");
    vi.spyOn(operationsApi, "getOperationalDrivers").mockResolvedValue([
      {
        id: 1,
        userId: 101,
        fullName: "Nguyễn Văn Hùng",
        email: "driver.hung@thongdong.vn",
        phone: "0901111222",
        departmentId: 1,
        departmentName: "Tài xế",
        facilityId: 1,
        facilityName: "Chi nhánh Quận 1",
        hiredDate: "2024-01-01",
        isDriver: true,
        licenseNumber: "B2-998877",
        licenseType: "B2",
        licenseIssueDate: "2023-01-01",
        licenseExpiryDate: "2033-01-01",
        licenseImageUrl: null,
        rating: 5,
        isActive: true,
        staffRole: "Tài xế",
      },
    ]);
    const assignSpy = vi.spyOn(operationsApi, "assignRental").mockResolvedValueOnce({} as never);

    renderWithClient(<RentalOperationsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Tài xế nhận lệnh")).toBeInTheDocument();
    });

    // Chọn tài xế và submit
    const driverSelect = screen.getByLabelText("Tài xế nhận lệnh");
    fireEvent.change(driverSelect, { target: { value: "1" } });

    const submitBtn = screen.getByRole("button", { name: "Lưu phân công" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(assignSpy).toHaveBeenCalledWith(101, 1);
      expect(screen.getByText("Đã lưu phân công phương tiện và tài xế.")).toBeInTheDocument();
    });
  });

  it("hiển thị modal xác nhận khi chuyển sang trạng thái cuối (completed hoặc cancelled)", async () => {
    mockSearchParams = new URLSearchParams("rentalId=101");
    const statusSpy = vi.spyOn(operationsApi, "changeRentalStatus").mockResolvedValueOnce({} as never);

    renderWithClient(<RentalOperationsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Thao tác chuyển bước")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Thao tác chuyển bước");
    fireEvent.change(statusSelect, { target: { value: "completed" } });

    const updateBtn = screen.getByRole("button", { name: "Xác nhận cập nhật trạng thái" });
    fireEvent.click(updateBtn);

    // Modal xác nhận xuất hiện với tiêu đề nghiệp vụ cụ thể cho completed
    await waitFor(() => {
      expect(screen.getByText("Xác nhận hoàn tất & quyết toán hợp đồng")).toBeInTheDocument();
    });

    // Nhấn Xác nhận hoàn tất trong modal
    const confirmBtn = screen.getByRole("button", { name: "Xác nhận hoàn tất" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(statusSpy).toHaveBeenCalledWith(101, "completed");
    });
  });
});
