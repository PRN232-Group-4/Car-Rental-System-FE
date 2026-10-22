import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileManager from "@/features/profile/components/ProfileManager";
import { ApiClientError } from "@/api/api-client";

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  getLicense: vi.fn(),
  updateProfile: vi.fn(),
  router: { replace: vi.fn() },
}));
vi.mock("@/features/profile/api", () => ({
  getAccountProfile: mocks.getProfile,
  getCustomerLicense: mocks.getLicense,
  updateAccountProfile: mocks.updateProfile,
}));
vi.mock("@/features/auth", () => ({ useAuth: () => ({ isLoading: false, isAuthenticated: true }) }));
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => mocks.router }));
vi.mock("@/features/profile/components/ChangePasswordForm", () => ({ default: () => null }));

const profile = { fullName: "Khách hàng", email: "user@test.local", phone: "0901234567", gender: "" };

describe("Thông tin cá nhân khách hàng", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getProfile.mockResolvedValue(profile);
    mocks.getLicense.mockResolvedValue(null);
    mocks.updateProfile.mockImplementation(async (body) => ({ ...profile, ...body }));
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 30 }] as unknown as DOMRectList);
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  async function open() {
    render(<ProfileManager />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Lưu thông tin" })).toBeEnabled());
    return screen.getByRole("combobox", { name: "Giới tính" });
  }

  it.each(["Male", "Female", "Other", ""])("chọn giới tính %s và lưu mà không lỗi", async (gender) => {
    const select = await open();
    fireEvent.change(select, { target: { value: "Male" } });
    fireEvent.change(select, { target: { value: gender } });
    expect(select).toHaveValue(gender);
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledWith({ fullName: profile.fullName, phone: profile.phone, gender }));
    expect(await screen.findByText("Thông tin đã được lưu.")).toBeVisible();
    expect(screen.getByLabelText("Họ và tên")).toHaveValue(profile.fullName);
    expect(screen.getByLabelText("Số điện thoại")).toHaveValue(profile.phone);
    fireEvent.change(select, { target: { value: gender === "Male" ? "Female" : "Male" } });
    expect(screen.queryByText("Thông tin đã được lưu.")).not.toBeInTheDocument();
  });

  it("hiện lỗi API dưới giới tính, sửa chỉ xóa lỗi tương ứng và giữ dữ liệu", async () => {
    mocks.updateProfile.mockRejectedValue(new ApiClientError(400, "Bad Request", {
      error: { errors: { Gender: ["Giới tính không hợp lệ. Vui lòng chọn lại."], Phone: ["Số điện thoại không hợp lệ."] } },
    }));
    const select = await open();
    fireEvent.change(select, { target: { value: "Female" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(await screen.findByText("Giới tính không hợp lệ. Vui lòng chọn lại.")).toBeVisible();
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById(select.getAttribute("aria-describedby")!)).toHaveTextContent("Giới tính không hợp lệ.");
    expect(select).toHaveValue("Female");
    fireEvent.change(select, { target: { value: "Other" } });
    expect(select).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("Số điện thoại không hợp lệ.")).toBeVisible();
    expect(screen.getByLabelText("Số điện thoại")).toHaveValue(profile.phone);
  });

  it("giữ kiểm tra bắt buộc, hiện đủ lỗi và focus trường đầu tiên", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("Họ và tên"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(screen.getByLabelText("Họ và tên")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Số điện thoại")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByText("Vui lòng điền hoặc chọn thông tin này.")).toHaveLength(2);
    expect(screen.getByLabelText("Họ và tên")).toHaveFocus();
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it("hiện lỗi mạng và giữ lựa chọn giới tính để thử lưu lại", async () => {
    mocks.updateProfile.mockRejectedValue(new TypeError("Không thể kết nối máy chủ."));
    const select = await open();
    fireEvent.change(select, { target: { value: "Other" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể kết nối máy chủ.");
    expect(select).toHaveValue("Other");
    expect(screen.getByLabelText("Họ và tên")).toHaveValue(profile.fullName);
    expect(screen.getByRole("button", { name: "Lưu thông tin" })).toBeEnabled();
  });
});
