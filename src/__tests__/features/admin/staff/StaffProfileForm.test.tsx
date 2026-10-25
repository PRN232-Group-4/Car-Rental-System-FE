import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StaffProfileForm from "@/features/admin/StaffProfileForm";
import { ApiProblemError } from "@/api/api-client";

const client = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
const refreshProfile = vi.hoisted(() => vi.fn());
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: null, refreshProfile, hasRole: () => true }),
}));

const account = {
  email: "admin@example.test",
  fullName: "Quản trị viên",
  phone: "0901234567",
  gender: "Female",
  roles: ["Admin"],
  staffId: null,
  facilityId: 101,
  departmentId: null,
  departmentName: null,
};

describe("Hồ sơ cá nhân của nhân sự", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    client.get.mockImplementation(async (path: string) => {
      if (path === "account/profile") return account;
      if (path === "facilities") return { items: [], page: 1, pageSize: 100, totalCount: 0 };
      throw new Error(`Unexpected request: ${path}`);
    });
    client.put.mockResolvedValue(account);
  });
  afterEach(cleanup);

  it("hiển thị cơ sở từ tài khoản Maintenance mà không cần quyền đọc danh mục", async () => {
    client.get.mockImplementation(async (path: string) => {
      if (path === "account/profile") return { ...account, roles: ["Maintenance"], staffId: 27, facilityId: 8, facilityName: "Cơ sở Đà Nẵng" };
      throw new Error("Forbidden");
    });
    render(<StaffProfileForm />);
    await screen.findByLabelText("Họ và tên");
    expect(screen.getAllByText("Cơ sở Đà Nẵng")).toHaveLength(2);
    expect(client.get.mock.calls.some(([path]) => path === "facilities")).toBe(false);
  });

  it("hiển thị hồ sơ admin khi danh sách cơ sở trả về phân trang", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: index + 1, name: `Cơ sở ${index + 1}` }));
    client.get.mockImplementation(async (path: string, params?: { page: number }) => {
      if (path === "account/profile") return account;
      return { items: params?.page === 1 ? firstPage : [{ id: 101, name: "Cơ sở TP.HCM" }], page: params?.page, pageSize: 100, totalCount: 101 };
    });

    render(<StaffProfileForm />);

    expect(await screen.findByLabelText("Họ và tên")).toHaveValue("Quản trị viên");
    await waitFor(() => expect(screen.getAllByText("Cơ sở TP.HCM")).toHaveLength(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("không để danh sách cơ sở đang chờ chặn hồ sơ tài khoản", async () => {
    let finishFacilities!: (value: unknown) => void;
    const facilities = new Promise((resolve) => { finishFacilities = resolve; });
    client.get.mockImplementation(async (path: string) => path === "account/profile" ? account : facilities);

    render(<StaffProfileForm />);

    expect(await screen.findByLabelText("Họ và tên")).toHaveValue(account.fullName);
    expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeEnabled();
    await act(async () => finishFacilities({ items: [], page: 1, pageSize: 100, totalCount: 0 }));
  });

  it("vẫn cho cập nhật hồ sơ khi tài khoản không có quyền xem danh sách cơ sở", async () => {
    client.get.mockImplementation(async (path: string) => {
      if (path === "account/profile") return account;
      throw new Error("Forbidden");
    });

    render(<StaffProfileForm />);

    const name = await screen.findByLabelText("Họ và tên");
    fireEvent.change(name, { target: { value: "Tên cập nhật" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(client.put).toHaveBeenCalledWith("account/profile", {
      fullName: "Tên cập nhật", phone: account.phone, gender: account.gender,
    }));
    expect(await screen.findByText("Đã lưu hồ sơ nhân viên.")).toBeVisible();
    expect(refreshProfile).toHaveBeenCalledOnce();
  });

  it("không tải danh mục cơ sở khi admin chưa được gán cơ sở", async () => {
    client.get.mockResolvedValue({ ...account, facilityId: null });

    render(<StaffProfileForm />);

    await screen.findByLabelText("Họ và tên");
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith("account/profile");
  });

  it("tổng hợp hồ sơ từ tài khoản khi không truy cập được bản ghi staff của chính mình", async () => {
    client.get.mockImplementation(async (path: string) => {
      if (path === "account/profile") return { ...account, roles: ["Maintenance"], staffId: 27, facilityId: null };
      throw new Error("Forbidden");
    });

    render(<StaffProfileForm />);

    expect(await screen.findByLabelText("Họ và tên")).toHaveValue(account.fullName);
    expect(screen.getAllByText("Kỹ thuật viên")).toHaveLength(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hiển thị tất cả lỗi bắt buộc dưới trường trước khi gửi", async () => {
    render(<StaffProfileForm />);
    const name = await screen.findByLabelText("Họ và tên");
    const phone = screen.getByLabelText("Số điện thoại");
    fireEvent.change(name, { target: { value: " " } });
    fireEvent.change(phone, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(client.put).not.toHaveBeenCalled();
    fireEvent.change(name, { target: { value: "Tên mới" } });
    expect(name).toHaveAttribute("aria-invalid", "false");
    expect(phone).toHaveAttribute("aria-invalid", "true");
  });

  it("giữ dữ liệu và ánh xạ lỗi API về đúng trường", async () => {
    client.put.mockRejectedValue(new ApiProblemError(400, "Bad Request", {
      error: { errors: { Phone: ["Số điện thoại không hợp lệ. Vui lòng kiểm tra lại."] } },
    }));
    render(<StaffProfileForm />);
    await screen.findByLabelText("Họ và tên");
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(await screen.findByText("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.")).toBeVisible();
    expect(screen.getByLabelText("Số điện thoại")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Họ và tên")).toHaveValue(account.fullName);
  });

  it("hiển thị lỗi mạng chung và giữ nguyên dữ liệu để thử lại", async () => {
    client.put.mockRejectedValue(new Error("Không thể kết nối máy chủ. Vui lòng thử lại."));
    render(<StaffProfileForm />);
    await screen.findByLabelText("Họ và tên");
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể kết nối máy chủ");
    expect(screen.getByLabelText("Họ và tên")).toHaveValue(account.fullName);
    expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeEnabled();
  });
});
