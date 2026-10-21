import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserLockDialog } from "@/features/admin/users/components/UserLockDialog";
import { UserRoleDialog } from "@/features/admin/users/components/UserRoleDialog";
import { ApiProblemError } from "@/api/api-client";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
afterEach(cleanup);

describe("Biểu mẫu quản trị tài khoản", () => {
  it("mở khóa chỉ đóng biểu mẫu sau API thành công", async () => {
    const confirm = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn();
    render(<UserLockDialog open onOpenChange={close} userId={7} userName="Tài khoản bị khóa" isCurrentlyActive={false} onConfirm={confirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận mở khóa" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith(undefined));
    await waitFor(() => expect(close).toHaveBeenCalledWith(false));
  });

  it("validate lý do ngay dưới trường và giữ lý do khi server từ chối", async () => {
    const confirm = vi.fn().mockRejectedValue(new ApiProblemError(400, "Bad Request", { error: { errors: { Reason: ["Vui lòng nêu lý do rõ ràng hơn."] } } }));
    const close = vi.fn();
    render(<UserLockDialog open onOpenChange={close} userId={7} userName="Người dùng" isCurrentlyActive onConfirm={confirm} />);
    const reason = screen.getByLabelText(/Lý do khóa tài khoản/);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận khóa" }));
    expect(reason).toHaveAttribute("aria-invalid", "true");
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.change(reason, { target: { value: "Lý do hợp lệ" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận khóa" }));
    expect(await screen.findByText("Vui lòng nêu lý do rõ ràng hơn.")).toBeVisible();
    expect(reason).toHaveValue("Lý do hợp lệ");
    expect(close).not.toHaveBeenCalled();
  });

  it("lỗi mạng mở khóa không đóng biểu mẫu và cho phép thử lại", async () => {
    const confirm = vi.fn().mockRejectedValue(new Error("Không thể kết nối máy chủ. Vui lòng thử lại."));
    const close = vi.fn();
    render(<UserLockDialog open onOpenChange={close} userId={7} userName="Tài khoản bị khóa" isCurrentlyActive={false} onConfirm={confirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận mở khóa" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể kết nối máy chủ");
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Xác nhận mở khóa" })).toBeEnabled();
  });

  it("khóa gửi lặp và đóng biểu mẫu khi đang thay đổi trạng thái", () => {
    const confirm = vi.fn();
    const close = vi.fn();
    render(<UserLockDialog open onOpenChange={close} userId={7} userName="Người dùng" isCurrentlyActive={false} isLoading onConfirm={confirm} />);
    expect(screen.getByRole("button", { name: "Xác nhận mở khóa" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Đóng biểu mẫu" })).toBeDisabled();
  });

  it("gán vai trò có xác nhận và giữ biểu mẫu khi backend từ chối Driver thiếu GPLX", async () => {
    const assign = vi.fn().mockRejectedValue(new ApiProblemError(409, "Conflict", { detail: "Vai trò Driver yêu cầu hồ sơ với giấy phép còn hạn." }));
    const close = vi.fn();
    render(<UserRoleDialog open onOpenChange={close} userId={7} userName="Người dùng" currentRoles={["Staff"]} onAssignRole={assign} />);
    fireEvent.change(screen.getByLabelText(/Chọn vai trò mới/), { target: { value: "Driver" } });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục gán quyền" }));
    expect(assign).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận cấp vai trò" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Vai trò Driver yêu cầu");
    expect(assign).toHaveBeenCalledWith("Driver");
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Chọn vai trò mới/)).toHaveValue("Driver");
  });
});
