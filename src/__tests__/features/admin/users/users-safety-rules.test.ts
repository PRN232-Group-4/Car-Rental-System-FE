import { beforeEach, describe, expect, it, vi } from "vitest";
import { setUserActiveStatus, assignUserRole, removeUserRole, revokeUserSessions } from "@/features/admin/users/api";
import { ApiProblemError } from "@/api/api-client";
import type { Role } from "@/features/auth/roles";
import { managerUser } from "./users-backend-fixture";

const client = vi.hoisted(() => ({ patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));

beforeEach(() => {
  vi.resetAllMocks();
  client.patch.mockResolvedValue(managerUser);
  client.post.mockResolvedValue(managerUser);
  client.delete.mockResolvedValue(managerUser);
});

describe("Admin Users: bảo vệ API thật", () => {
  it("chặn tự khóa và tự gỡ Admin khi có actor ID", async () => {
    await expect(setUserActiveStatus({ userId: 1, currentActorId: 1, isActive: false, reason: "Thử khóa" })).rejects.toThrow("không thể tự khóa");
    await expect(removeUserRole({ userId: 1, currentActorId: 1, role: "Admin" })).rejects.toThrow("không thể tự gỡ");
    expect(client.patch).not.toHaveBeenCalled();
    expect(client.delete).not.toHaveBeenCalled();
  });

  it("giữ nguyên lỗi last Admin do backend kiểm tra trong transaction", async () => {
    const failure = new ApiProblemError(409, "Conflict", { detail: "The last active administrator cannot be removed or deactivated." });
    client.patch.mockRejectedValue(failure);
    client.delete.mockRejectedValue(failure);
    await expect(setUserActiveStatus({ userId: 1, currentActorId: 99, isActive: false, reason: "Khóa" })).rejects.toBe(failure);
    await expect(removeUserRole({ userId: 1, currentActorId: 99, role: "Admin" })).rejects.toBe(failure);
    expect(client.delete).toHaveBeenCalledWith("users/1/roles", { body: JSON.stringify({ role: "Admin" }) });
  });

  it("yêu cầu lý do khi khóa và gửi lý do đúng lên backend", async () => {
    await expect(setUserActiveStatus({ userId: 2, isActive: false, reason: " " })).rejects.toThrow("Vui lòng nhập lý do");
    await setUserActiveStatus({ userId: 2, isActive: false, reason: "  Vi phạm quy chế  " });
    expect(client.patch).toHaveBeenCalledWith("users/2/status", { isActive: false, reason: "Vi phạm quy chế" });
  });

  it("mở khóa gửi boolean true và lý do audit thay vì chỉ đổi bộ nhớ", async () => {
    client.patch.mockResolvedValue({ ...managerUser, isActive: true });
    expect((await setUserActiveStatus({ userId: 2, isActive: true })).isActive).toBe(true);
    expect(client.patch).toHaveBeenCalledWith("users/2/status", { isActive: true, reason: "Mở khóa tài khoản theo xác nhận của quản trị viên." });
  });

  it("gán vai trò chỉ qua API, không gửi actor giả hoặc chấp nhận vai trò lạ", async () => {
    await assignUserRole({ userId: 2, role: "Maintenance" });
    expect(client.post).toHaveBeenCalledWith("users/2/roles", { role: "Maintenance" });
    await expect(assignUserRole({ userId: 2, role: "SuperHackerRole" as Role })).rejects.toThrow("không tồn tại trong danh mục hệ thống");
    expect(client.post).toHaveBeenCalledTimes(1);
  });

  it("không tự cập nhật quyền khi server từ chối thiếu hồ sơ hoặc GPLX", async () => {
    const failure = new ApiProblemError(409, "Conflict", { detail: "The Driver role requires a driver profile with a valid license." });
    client.post.mockRejectedValue(failure);
    await expect(assignUserRole({ userId: 2, role: "Driver" })).rejects.toBe(failure);
  });

  it("thu hồi phiên đăng nhập thông qua endpoint backend", async () => {
    await expect(revokeUserSessions(2)).resolves.toEqual({ success: true });
    expect(client.post).toHaveBeenCalledWith("users/2/sessions/revoke");
    client.post.mockRejectedValue(new ApiProblemError(403, "Forbidden"));
    await expect(revokeUserSessions(2)).rejects.toMatchObject({ status: 403 });
  });
});
