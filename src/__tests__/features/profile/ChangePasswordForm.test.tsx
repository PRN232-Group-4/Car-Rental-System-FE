import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChangePasswordForm from "@/features/profile/components/ChangePasswordForm";
import { ApiClientError } from "@/api/api-client";

const mocks = vi.hoisted(() => ({ send: vi.fn(), change: vi.fn(), logout: vi.fn(), replace: vi.fn() }));
vi.mock("@/features/profile/api", () => ({ sendPasswordChangeOtp: mocks.send, changePassword: mocks.change }));
vi.mock("@/features/auth", () => ({ useAuth: () => ({ user: { email: "user@test.local" }, logout: mocks.logout }) }));
vi.mock("@/components/navigation/NavigationProvider", () => ({ useNavigationRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/components/ui/Toaster", () => ({ notifySuccess: vi.fn(), notifyError: vi.fn() }));

async function start() {
  fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), { target: { value: " current " } });
  fireEvent.click(screen.getByRole("button", { name: "Gửi OTP xác nhận" }));
  await screen.findByLabelText("Mã OTP");
}
function completeFields() {
  fireEvent.change(screen.getByLabelText("Mã OTP"), { target: { value: "012345" } });
  fireEvent.change(screen.getByLabelText("Mật khẩu mới"), { target: { value: " newpass " } });
  fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), { target: { value: " newpass " } });
}

describe("Đổi mật khẩu xác nhận OTP", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.send.mockResolvedValue(undefined); mocks.change.mockResolvedValue(undefined); mocks.logout.mockResolvedValue(undefined); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("kiểm tra mật khẩu hiện tại trước khi yêu cầu OTP", async () => {
    render(<ChangePasswordForm />);
    fireEvent.click(screen.getByRole("button", { name: "Gửi OTP xác nhận" }));
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.getByLabelText("Mật khẩu hiện tại")).toHaveAttribute("aria-invalid", "true");
    expect(mocks.send).not.toHaveBeenCalled(); expect(mocks.change).not.toHaveBeenCalled();
  });

  it("chỉ gửi OTP ở bước đầu, giữ nguyên mật khẩu và khóa gửi lại trong cooldown", async () => {
    render(<ChangePasswordForm />); await start();
    expect(mocks.send).toHaveBeenCalledWith(" current "); expect(mocks.change).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Gửi lại OTP/ })).toBeDisabled();
    expect(screen.getByText(/user@test.local/)).toBeVisible();
  });

  it("hiển thị tất cả lỗi OTP, độ dài và xác nhận dưới trường tương ứng", async () => {
    render(<ChangePasswordForm />); await start();
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đổi mật khẩu" }));
    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByText("Mật khẩu phải có từ 6 đến 20 ký tự.")).toBeVisible();
    expect(mocks.change).not.toHaveBeenCalled();
  });

  it("gửi OTP cùng mật khẩu, xóa phiên và chuyển về đăng nhập sau thành công", async () => {
    render(<ChangePasswordForm />); await start(); completeFields();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đổi mật khẩu" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.change).toHaveBeenCalledWith({ currentPassword: " current ", newPassword: " newpass ", otp: "012345" });
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it("ánh xạ lỗi backend OTP về đúng trường và giữ dữ liệu để thử lại", async () => {
    mocks.change.mockRejectedValue(new ApiClientError(400, "Bad Request", { error: { errors: { Otp: ["OTP không chính xác."] } } }));
    render(<ChangePasswordForm />); await start(); completeFields();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đổi mật khẩu" }));
    expect(await screen.findByText("OTP không chính xác.")).toBeVisible();
    expect(screen.getByLabelText("Mã OTP")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Mật khẩu mới")).toHaveValue(" newpass "); expect(mocks.logout).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Mã OTP"), { target: { value: "123456" } });
    expect(screen.queryByText("OTP không chính xác.")).not.toBeInTheDocument();
  });

  it("lỗi mạng khi gửi mã không mở bước đổi mật khẩu", async () => {
    mocks.send.mockRejectedValue(new Error("Không thể kết nối máy chủ."));
    render(<ChangePasswordForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), { target: { value: "current" } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi OTP xác nhận" }));
    expect(await screen.findByText("Không thể kết nối máy chủ.")).toBeVisible();
    expect(screen.queryByLabelText("Mã OTP")).not.toBeInTheDocument(); expect(mocks.change).not.toHaveBeenCalled();
  });

  it("cho gửi lại mã sau cooldown và xóa mã đã nhập", async () => {
    vi.useFakeTimers();
    render(<ChangePasswordForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), { target: { value: "current" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Gửi OTP xác nhận" })); });
    fireEvent.change(screen.getByLabelText("Mã OTP"), { target: { value: "111111" } });
    for (let i = 0; i < 60; i++) await act(async () => { vi.advanceTimersByTime(1000); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Gửi lại OTP" })); });
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText("Mã OTP")).toHaveValue("");
  });
});
