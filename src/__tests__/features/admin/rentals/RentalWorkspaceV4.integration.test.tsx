import React from "react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RentalWorkspaceV4 from "@/features/admin/transit-desk/RentalWorkspaceV4";
import * as operationsApi from "@/features/operations/api";
import * as invoiceApi from "@/features/invoices";
import { RENTAL_101 } from "./rental-fixture";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

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

vi.mock("@/features/maps/RentalTrackingPanel", () => ({
  default: ({ rentalId }: { rentalId: number | string }) => (
    <div data-testid="rental-tracking-panel">GPS Panel #{rentalId}</div>
  ),
}));

vi.mock("@/features/operations/TechnicianAssignmentForm", () => ({ default: () => null }));

vi.mock("@/features/admin/VehicleName", () => ({
  default: ({ vehicleId }: { vehicleId: number | string }) => (
    <span data-testid="vehicle-name">Toyota Corolla Cross 1.8V - 51K-992.11 (#{vehicleId})</span>
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

const mockStaffSession: SessionContextType = {
  user: { email: "staff@thongdong.vn", fullName: "Staff User", roles: ["Staff"] },
  isAuthenticated: true,
  isLoading: false,
  status: "authenticated",
  login: vi.fn(),
  logout: vi.fn(),
  hasRole: (r: string) => r.toLowerCase() === "staff",
  hasAnyRole: (roles: readonly string[]) => roles.map((x) => String(x).toLowerCase()).includes("staff"),
  refreshProfile: vi.fn(),
};

function renderWithClient(ui: React.ReactElement, session: SessionContextType | null = mockAdminSession) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={session ?? undefined}>{ui}</SessionContext.Provider>
    </QueryClientProvider>
  );
}

describe("V4.1B Rental Workspace Integration & Acceptance Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    // App không còn fixture: test tự cấp dữ liệu cho hồ sơ đơn thuê.
    vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValue(RENTAL_101);
    vi.spyOn(operationsApi, "getOperationalRentalDetail").mockResolvedValue({ invoice: { id: 55 } } as never);
    vi.spyOn(invoiceApi, "getInvoiceById").mockResolvedValue({ id: 55, status: "paid", amount: 100000, paymentMethod: "cash", kind: "rental" } as never);
    vi.spyOn(operationsApi, "getOperationalDrivers").mockResolvedValue([]);
    vi.spyOn(operationsApi, "listOperationalRentals").mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 30 });
  });

  describe("Gate 1: Truthful States & Provenance", () => {
    it.each(["cancelled", "completed"])("keeps %s rentals read-only without loading drivers", async status => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      vi.spyOn(operationsApi,"getOperationalRental").mockResolvedValue({...RENTAL_101,status});
      vi.spyOn(operationsApi,"getOperationalRentalDetail").mockResolvedValue({rental:{cancelReason:"Khách đổi lịch"},history:[]} as never);
      const assign=vi.spyOn(operationsApi,"assignRental");
      renderWithClient(<RentalWorkspaceV4 />);
      await screen.findByText(`Hồ sơ hợp đồng đã ở trạng thái kết thúc (${status}).`);
      expect(screen.queryByRole("button",{name:"Lưu phân công"})).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Tài xế nhận lệnh")).not.toBeInTheDocument();
      expect(screen.queryByText("Ghi đè trạng thái thủ công")).not.toBeInTheDocument();
      expect(operationsApi.getOperationalDrivers).not.toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
    });
    it("renders truthful empty message when work queue has no items", async () => {
      vi.spyOn(operationsApi, "listOperationalRentals").mockResolvedValueOnce({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 30,
      });

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByText("Hàng đợi trạm hiện không có đơn cần xử lý.")).toBeInTheDocument();
      });
    });

    it("renders filter mismatch message when filter returns no matching items", async () => {
      vi.spyOn(operationsApi, "listOperationalRentals").mockResolvedValueOnce({
        items: [
          {
            id: 201,
            customerId: 2,
            vehicleId: 5,
            vehicleName: "Hyundai Accent",
            status: "pending",
            rentalType: "hourly",
            startTime: "2026-10-18T10:00:00Z",
            endTime: "2026-10-20T10:00:00Z",
            totalPrice: 1500000,
            depositPrice: 500000,
            vatPrice: 150000,
            hasDriver: false,
            contractLink: null,
            signedAt: null,
            isSubscription: false,
            overtimePrice: 0,
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 30,
      });

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByText("#201")).toBeInTheDocument();
      });

      // Type non-matching search term into input
      const searchInput = screen.getByPlaceholderText("Nhập mã đơn thuê...");
      fireEvent.change(searchInput, { target: { value: "KhongTonTai999" } });

      await waitFor(() => {
        expect(screen.getByText(/Không có đơn nào khớp với bộ lọc "KhongTonTai999"/i)).toBeInTheDocument();
      });
    });

    it("renders dedicated pinned lookup card when direct rental ID is outside queue page", async () => {
      mockSearchParams = new URLSearchParams("rentalId=999");
      vi.spyOn(operationsApi, "listOperationalRentals").mockResolvedValueOnce({
        items: [
          {
            id: 101,
            customerId: 1,
            vehicleId: 1,
            vehicleName: "VinFast VF8",
            status: "renting",
            rentalType: "hourly",
            startTime: "2026-10-18T10:00:00Z",
            endTime: "2026-10-20T10:00:00Z",
            totalPrice: 2000000,
            depositPrice: 1000000,
            vatPrice: 200000,
            hasDriver: true,
            contractLink: null,
            signedAt: null,
            isSubscription: false,
            overtimePrice: 0,
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 30,
      });

      vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValueOnce({
        id: 999,
        customerId: 9,
        vehicleId: 42,
        vehicleName: "Toyota Raize",
        status: "pre_inspection",
        rentalType: "hourly",
        startTime: "2026-10-18T08:00:00Z",
        endTime: "2026-10-18T18:00:00Z",
        totalPrice: 800000,
        depositPrice: 500000,
        vatPrice: 80000,
        hasDriver: false,
        contractLink: null,
        signedAt: null,
        isSubscription: false,
        overtimePrice: 0,
      });

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        const pinnedCard = screen.getByTestId("pinned-lookup-card");
        expect(pinnedCard).toBeInTheDocument();
        expect(pinnedCard).toHaveTextContent("Đơn đang mở (Tra cứu trực tiếp)");
        expect(pinnedCard).toHaveTextContent("#999");
      });
    });
  });

  describe("Gate 2: Adaptive Stepper & Vehicle Identity Structure", () => {
    it("renders the adaptive 5-stage stepper with semantic list and ARIA step attribute", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getAllByRole("list").length).toBeGreaterThanOrEqual(1);
      });

      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBe(5);

      // Verify active step banner callout
      expect(screen.getByText("Bàn giao & Đang thuê:")).toBeInTheDocument();
    });

    it("renders dedicated vehicle identity row displaying vehicle name without tile clipping", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getAllByTestId("vehicle-name").length).toBeGreaterThanOrEqual(1);
      });

      // Long vehicle name is rendered in full
      expect(screen.getAllByText("Toyota Corolla Cross 1.8V - 51K-992.11 (#1)").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Phương tiện lưu thông")).toBeInTheDocument();
    });
  });

  describe("Gate 3: Contextual Guided Transition vs Manual Override", () => {
    it.each([false, undefined])("blocks handover when passing inspection is %s and links to the selected rental", async (hasPassingPreInspection) => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValue({ ...RENTAL_101, status: "pre_inspection", hasPassingPreInspection });
      const statusSpy = vi.spyOn(operationsApi, "changeRentalStatus");
      renderWithClient(<RentalWorkspaceV4 />);

      const start = await screen.findByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến" });
      expect(start).toBeDisabled();
      expect(screen.getByRole("link", { name: "Mở phiếu kiểm tra đơn #101" })).toHaveAttribute("href", "/admin/inspections?rentalId=101");
      fireEvent.click(start);
      fireEvent.change(screen.getByLabelText("Thao tác chuyển bước"), { target: { value: "renting" } });
      fireEvent.click(screen.getByRole("button", { name: "Xác nhận cập nhật trạng thái" }));
      expect(statusSpy).not.toHaveBeenCalled();
      expect(screen.getAllByText("Cần hoàn tất phiếu kiểm tra trước thuê với kết quả đạt trước khi bàn giao xe.").length).toBeGreaterThan(0);
    });

    it("reloads the saved inspection, starts the trip, and refreshes its displayed status", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      const pending = { ...RENTAL_101, status: "pre_inspection", hasPassingPreInspection: false };
      const passed = { ...pending, hasPassingPreInspection: true };
      const renting = { ...passed, status: "renting" };
      const rentalSpy = vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValue(pending);
      const statusSpy = vi.spyOn(operationsApi, "changeRentalStatus").mockResolvedValue(renting);
      renderWithClient(<RentalWorkspaceV4 />);
      await screen.findByRole("button", { name: "Tải lại kết quả kiểm tra" });
      rentalSpy.mockResolvedValue(passed);
      fireEvent.click(screen.getByRole("button", { name: "Tải lại kết quả kiểm tra" }));
      await waitFor(() => expect(screen.getByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến" })).toBeEnabled());
      rentalSpy.mockResolvedValue(renting);
      fireEvent.click(screen.getByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến" }));
      await screen.findByRole("button", { name: "Xác nhận đã nhận lại xe" });
      expect(statusSpy).toHaveBeenCalledExactlyOnceWith(101, "renting");
      expect(await screen.findByText("Đã cập nhật đơn thuê sang trạng thái: Đang thuê")).toBeInTheDocument();
    });

    it("preserves the pre-inspection stage when starting fails and shows a Vietnamese explanation", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValue({ ...RENTAL_101, status: "pre_inspection", hasPassingPreInspection: true });
      vi.spyOn(operationsApi, "changeRentalStatus").mockRejectedValue(new Error("A successful pre-rental inspection is required to start."));
      renderWithClient(<RentalWorkspaceV4 />);
      const start = await screen.findByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến" });
      await waitFor(() => expect(start).toBeEnabled());
      fireEvent.click(start);
      expect(await screen.findByText("Cần hoàn tất phiếu kiểm tra trước thuê với kết quả đạt trước khi bàn giao xe.")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Xác nhận đã nhận lại xe" })).not.toBeInTheDocument();
    });

    it("provides prominent primary guided action corresponding to next operational state", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      // Rental #101 is in "renting" status in default mock
      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByText("Thao tác đơn thuê")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Xác nhận đã nhận lại xe" })).toBeInTheDocument();
      });
    });

    it("opens confirmation modal on terminal transition, handles Escape and confirms transition", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      const statusSpy = vi.spyOn(operationsApi, "changeRentalStatus").mockResolvedValueOnce({} as never);

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByLabelText("Thao tác chuyển bước")).toBeInTheDocument();
      });

      // Select 'completed'
      fireEvent.change(screen.getByLabelText("Thao tác chuyển bước"), { target: { value: "completed" } });

      // Click update button
      fireEvent.click(screen.getByRole("button", { name: "Xác nhận cập nhật trạng thái" }));

      // Modal appears with specific completed title
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Xác nhận hoàn tất & quyết toán hợp đồng")).toBeInTheDocument();
      });

      // Test Escape key closes modal
      fireEvent.keyDown(window, { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // Re-trigger and click confirm
      fireEvent.click(screen.getByRole("button", { name: "Xác nhận cập nhật trạng thái" }));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole("button", { name: "Xác nhận hoàn tất" });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(statusSpy).toHaveBeenCalledWith(101, "completed");
      });
    });

    it("opens distinct cancellation modal when cancelled status is chosen", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValue({...RENTAL_101,status:"pre_inspection"});
      const statusSpy = vi.spyOn(operationsApi, "cancelOperationalRental").mockResolvedValueOnce({} as never);

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByLabelText("Thao tác chuyển bước")).toBeInTheDocument();
      });

      // Select 'cancelled'
      fireEvent.change(screen.getByLabelText("Thao tác chuyển bước"), { target: { value: "cancelled" } });

      const updateBtn = screen.getByRole("button", { name: "Xác nhận cập nhật trạng thái" });
      await waitFor(() => {
        expect(updateBtn).not.toBeDisabled();
      });

      // Click update button
      fireEvent.click(updateBtn);

      // Modal appears with cancellation-specific copy
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Xác nhận hủy hợp đồng thuê")).toBeInTheDocument();
        expect(screen.getByLabelText("Lý do hủy *")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText("Lý do hủy *"), {target:{value:"Khách đổi lịch thuê"}});
      const confirmBtn = screen.getByRole("button", { name: "Xác nhận hủy đơn" });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(statusSpy).toHaveBeenCalledWith(101, "Khách đổi lịch thuê");
      });
    });
  });

  describe("Gate 4: Error Handling & Form Validation", () => {
    it("validates direct lookup input and rejects invalid non-numeric IDs", () => {
      renderWithClient(<RentalWorkspaceV4 />);

      const searchInput = screen.getByPlaceholderText("Nhập mã đơn thuê...");
      const searchBtn = screen.getByRole("button", { name: "Tra cứu đơn" });

      // Empty submit
      fireEvent.change(searchInput, { target: { value: "" } });
      fireEvent.click(searchBtn);
      expect(screen.getByText("Vui lòng nhập mã đơn thuê cần tra cứu.")).toBeInTheDocument();

      // Negative/alphanumeric submit
      fireEvent.change(searchInput, { target: { value: "abc-99" } });
      fireEvent.click(searchBtn);
      expect(screen.getByText("Mã đơn thuê phải là số nguyên dương hợp lệ.")).toBeInTheDocument();
    });

    it("displays error banner when rental query fails", async () => {
      mockSearchParams = new URLSearchParams("rentalId=8888");
      vi.spyOn(operationsApi, "getOperationalRental").mockRejectedValueOnce(new Error("Network Error"));

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByText("Không thể tải thông tin đơn thuê #8888")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Thử tải lại" })).toBeInTheDocument();
      });
    });

    it("SEC-01: getOperationalRental fails closed, never returns fixture data", async () => {
      // Bỏ mock của beforeEach để gọi implementation thật: backend không có → phải ném lỗi.
      vi.mocked(operationsApi.getOperationalRental).mockRestore();
      await expect(operationsApi.getOperationalRental(101)).rejects.toThrow();
    });
  });

  describe("Phase 3D Acceptance: Error Boundaries, Safe Currency, and Fail-Closed RBAC", () => {
    it("P0-B: renders distinct 404 state without phantom vehicle, NaN đ, or active commands when rental does not exist", async () => {
      mockSearchParams = new URLSearchParams("rentalId=4040");
      const err = Object.assign(new Error("Not Found"), { status: 404, data: null, response: { status: 404 } });
      vi.spyOn(operationsApi, "getOperationalRental").mockRejectedValueOnce(err);

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByTestId("rental-not-found-state")).toBeInTheDocument();
        expect(screen.getByText("Không tìm thấy hồ sơ đơn thuê #4040")).toBeInTheDocument();
      });

      // Assert NO NaN or bogus currency is rendered
      expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
      // Assert middle dossier is NOT rendered
      expect(screen.queryByText(/THÔNG SỐ HỢP ĐỒNG THUÊ/i)).not.toBeInTheDocument();
      // Assert command panel shows inactive state
      expect(screen.getByTestId("command-inactive-state")).toBeInTheDocument();
      expect(screen.getByText("Hồ sơ chưa sẵn sàng")).toBeInTheDocument();
      // Assert no pinned card for missing rental
      expect(screen.queryByTestId("pinned-lookup-card")).not.toBeInTheDocument();
    });

    it("P0-B: renders distinct 403 Forbidden state when user lacks permission to access rental", async () => {
      mockSearchParams = new URLSearchParams("rentalId=4030");
      const err = Object.assign(new Error("Forbidden"), { status: 403, data: null, response: { status: 403 } });
      vi.spyOn(operationsApi, "getOperationalRental").mockRejectedValueOnce(err);

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByTestId("rental-forbidden-state")).toBeInTheDocument();
        expect(screen.getByText("Từ chối quyền truy cập đơn thuê #4030")).toBeInTheDocument();
      });

      expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/THÔNG SỐ HỢP ĐỒNG THUÊ/i)).not.toBeInTheDocument();
    });

    it("P0-B: renders distinct invalid-data state when payload fails structural validation (e.g. empty array)", async () => {
      mockSearchParams = new URLSearchParams("rentalId=9999");
      // Return invalid data (e.g. array instead of object)
      vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValueOnce([] as never);

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByTestId("rental-invalid-data-state")).toBeInTheDocument();
        expect(screen.getByText("Dữ liệu không hợp lệ cho đơn thuê #9999")).toBeInTheDocument();
      });

      expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/THÔNG SỐ HỢP ĐỒNG THUÊ/i)).not.toBeInTheDocument();
      expect(screen.queryByTestId("pinned-lookup-card")).not.toBeInTheDocument();
    });

    it("P0-B: formats prices safely as 'Chưa có dữ liệu' when numeric values are null or undefined", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      vi.spyOn(operationsApi, "getOperationalRental").mockResolvedValueOnce({
        id: 101,
        customerId: 1,
        vehicleId: 1,
        vehicleName: "VinFast VF8",
        status: "renting",
        rentalType: "daily",
        startTime: "2026-10-18T10:00:00Z",
        endTime: "2026-10-20T10:00:00Z",
        totalPrice: undefined as unknown as number,
        depositPrice: null as unknown as number,
        vatPrice: Number.NaN as number,
        hasDriver: false,
        contractLink: null,
        signedAt: null,
        isSubscription: false,
        overtimePrice: 0,
      });

      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByText(/THÔNG SỐ HỢP ĐỒNG THUÊ #101/i)).toBeInTheDocument();
      });

      // No NaN string anywhere in document
      expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
      // Safely renders fallback text
      const fallbackElements = screen.getAllByText("Chưa có dữ liệu");
      expect(fallbackElements.length).toBeGreaterThanOrEqual(1);
    });

    it("P1-C: unauthenticated session cannot load or mutate privileged rental data", () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      renderWithClient(<RentalWorkspaceV4 />, null);
      expect(operationsApi.getOperationalRental).not.toHaveBeenCalled();
      expect(operationsApi.listOperationalRentals).not.toHaveBeenCalled();
      expect(operationsApi.getOperationalDrivers).not.toHaveBeenCalled();
      expect(screen.queryByText("Ghi đè trạng thái thủ công")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Lưu phân công" })).not.toBeInTheDocument();
    });

    it("P1-C: Staff cannot load the rental workspace reserved for Admin/Manager/CustomerService", () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      renderWithClient(<RentalWorkspaceV4 />, mockStaffSession);
      expect(operationsApi.getOperationalRental).not.toHaveBeenCalled();
      expect(operationsApi.listOperationalRentals).not.toHaveBeenCalled();
      expect(operationsApi.getOperationalDrivers).not.toHaveBeenCalled();
      expect(screen.queryByText("Ghi đè trạng thái thủ công")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Lưu phân công" })).not.toBeInTheDocument();
    });

    it("P1-D: renders truthful operational copy for contracts and GPS monitoring", async () => {
      mockSearchParams = new URLSearchParams("rentalId=101");
      renderWithClient(<RentalWorkspaceV4 />);

      await waitFor(() => {
        expect(screen.getByText("Giám sát vị trí trạm & Tín hiệu xe")).toBeInTheDocument();
        expect(screen.getByText("Đã xác thực chữ ký điện tử")).toBeInTheDocument();
      });

      // Unsubstantiated claims are absent
      expect(screen.queryByText(/vệ tinh trực tiếp/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/real-time satellite/i)).not.toBeInTheDocument();
    });
  });
});
