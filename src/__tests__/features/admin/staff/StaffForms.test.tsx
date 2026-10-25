import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateStaffPage from "@/app/admin/staffs/new/page";
import StaffDetailPage from "@/app/admin/staffs/detail/page";
import { ApiProblemError } from "@/api/api-client";
import { driverStaff, directoryUsers, pageOf } from "./staff-backend-fixture";

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
const push = vi.hoisted(() => vi.fn());
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), useSearchParams: () => new URLSearchParams("id=27") }));
vi.mock("@/features/auth/AuthGate", () => ({ AuthGate: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/features/admin/reviews/hooks", () => ({ useRatingSummary: () => ({}), useReviews: () => ({}) }));
vi.mock("@/features/admin/staff/components/LicenseUploader", () => ({ LicenseUploader: () => null }));

function renderPage(page: ReactNode) {
  const query = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={query}>{page}</QueryClientProvider>);
}

async function chooseAccount(id = 42) {
  fireEvent.change(await screen.findByLabelText(/Email tài khoản/), { target: { value: String(id) } });
  fireEvent.change(screen.getByLabelText(/Phòng ban trực thuộc/), { target: { value: "9" } });
  fireEvent.change(screen.getByLabelText(/Trạm \/ Cơ sở công tác/), { target: { value: "31" } });
}

describe("Tạo và cập nhật nhân sự từ tài khoản thật", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    client.get.mockImplementation(async (path: string) => {
      if (path === "users") return pageOf(directoryUsers);
      if (path === "departments") return [{ id: 9, name: "Đội tài xế" }];
      if (path === "facilities") return pageOf([{ id: 31, name: "Trạm thực tế", address: "TP.HCM" }, { id: 32, name: "Trạm mới", address: null }]);
      if (path === "staff/27") return driverStaff;
      throw new Error(`Unexpected request: ${path}`);
    });
    client.post.mockResolvedValue(driverStaff);
    client.put.mockResolvedValue(driverStaff);
  });
  afterEach(cleanup);

  it("chọn email và chỉ hiển thị GPLX khi tài khoản có vai trò Driver", async () => {
    renderPage(<CreateStaffPage />);
    await chooseAccount();
    expect(screen.getByRole("region", { name: "Giấy phép lái xe" })).toBeVisible();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/User ID/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Số GPLX/), { target: { value: "GPLX-42" } });
    fireEvent.change(screen.getByLabelText(/Email tài khoản/), { target: { value: "43" } });
    expect(screen.queryByRole("region", { name: "Giấy phép lái xe" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận tạo hồ sơ" }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith("staff/from-user", expect.objectContaining({ userId: 43, licenseNumber: null, licenseExpiryDate: null })));
    const body = client.post.mock.calls[0][1];
    expect(body).not.toHaveProperty("isDriver");
    expect(body).not.toHaveProperty("password");
  });

  it("gửi ID đúng tài khoản email và GPLX, điều hướng sau API thành công", async () => {
    renderPage(<CreateStaffPage />);
    await chooseAccount();
    fireEvent.change(screen.getByLabelText(/Số GPLX/), { target: { value: "  GPLX-42  " } });
    fireEvent.change(screen.getByLabelText("Ngày cấp"), { target: { value: "2020-01-01" } });
    fireEvent.change(screen.getByLabelText(/Ngày hết hạn/), { target: { value: "2030-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận tạo hồ sơ" }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith("staff/from-user", expect.objectContaining({
      userId: 42, departmentId: 9, facilityId: 31, licenseNumber: "GPLX-42", licenseType: "B2", licenseIssueDate: "2020-01-01", licenseExpiryDate: "2030-01-01",
    })));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/staffs/detail?id=27"));
    expect(screen.getByRole("option", { name: /linked@example.test/ })).toBeDisabled();
  });

  it("validate các trường bắt buộc và ngày GPLX ngay dưới trường", async () => {
    renderPage(<CreateStaffPage />);
    await chooseAccount();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận tạo hồ sơ" }));
    expect(screen.getByLabelText(/Số GPLX/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Ngày hết hạn/)).toHaveAttribute("aria-invalid", "true");
    expect(client.post).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Số GPLX/), { target: { value: "GPLX-42" } });
    fireEvent.change(screen.getByLabelText("Ngày cấp"), { target: { value: "2029-01-01" } });
    fireEvent.change(screen.getByLabelText(/Ngày hết hạn/), { target: { value: "2028-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận tạo hồ sơ" }));
    expect(screen.getByText("Ngày hết hạn GPLX phải từ ngày cấp trở đi.")).toBeVisible();
    expect(client.post).not.toHaveBeenCalled();
  });

  it("giữ dữ liệu khi API lỗi và ánh xạ lỗi PascalCase về trường", async () => {
    client.post.mockRejectedValue(new ApiProblemError(400, "Bad Request", { error: { errors: { UserId: ["Tài khoản đã có hồ sơ nhân sự."] } } }));
    renderPage(<CreateStaffPage />);
    await chooseAccount(43);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận tạo hồ sơ" }));
    expect(await screen.findByText("Tài khoản đã có hồ sơ nhân sự.")).toBeVisible();
    expect(screen.getByLabelText(/Email tài khoản/)).toHaveValue("43");
    expect(screen.getByLabelText(/Email tài khoản/)).toHaveAttribute("aria-invalid", "true");
    expect(push).not.toHaveBeenCalled();
  });

  it("hiển thị lỗi mạng chung và giữ lựa chọn để gửi lại", async () => {
    client.post.mockRejectedValue(new Error("Không thể kết nối máy chủ. Vui lòng thử lại."));
    renderPage(<CreateStaffPage />);
    await chooseAccount(43);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận tạo hồ sơ" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể kết nối máy chủ");
    expect(screen.getByLabelText(/Trạm \/ Cơ sở công tác/)).toHaveValue("31");
  });

  it("giữ GPLX và Driver role khi chỉ đổi cơ sở cho tài khoản Driver có cờ cũ false", async () => {
    renderPage(<StaffDetailPage />);
    await screen.findByText("Tài khoản driver@example.test");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Giấy Phép Lái Xe/ })).toBeVisible();
    fireEvent.change(screen.getByLabelText(/Cơ sở \/ Trạm trực/), { target: { value: "32" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi hồ sơ" }));
    await waitFor(() => expect(client.put).toHaveBeenCalledWith("staff/27", expect.objectContaining({
      facilityId: 32, isDriver: true, licenseNumber: "GPLX-42", licenseType: "B2", licenseImageUrl: driverStaff.licenseImageUrl,
      licenseExpiryDate: "2030-01-01", gender: "Female",
    })));
    fireEvent.click(screen.getByRole("button", { name: /Giấy Phép Lái Xe/ }));
    expect(screen.getByLabelText(/Số giấy phép lái xe/)).toHaveValue("GPLX-42");
    expect(screen.getByLabelText(/Ngày hết hạn/)).toHaveValue("2030-01-01");
  });
});
