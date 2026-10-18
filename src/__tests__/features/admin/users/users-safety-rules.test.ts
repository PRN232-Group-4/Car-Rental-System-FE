import { describe, it, expect, beforeEach } from "vitest";
import {
  setUserActiveStatus,
  assignUserRole,
  removeUserRole,
  resetMockUsersDb,
} from "@/features/admin/users/api";
import { Role } from "@/features/auth/roles";
import { ApiProblemError } from "@/api/api-client";

describe("FE-23 Admin Users — Safety Guard Rules", () => {
  beforeEach(() => {
    resetMockUsersDb();
  });

  describe("Quy tắc bảo vệ tự thân (Self-Protection)", () => {
    it("chặn không cho Admin tự khóa tài khoản của chính mình", async () => {
      await expect(
        setUserActiveStatus({
          userId: 1,
          isActive: false,
          reason: "Tự thử khóa tài khoản",
          currentActorId: 1,
        })
      ).rejects.toThrow("Bạn không thể tự khóa tài khoản quản trị của chính mình.");
    });

    it("chặn không cho Admin tự gỡ vai trò Admin của chính mình", async () => {
      await expect(
        removeUserRole({
          userId: 1,
          role: "Admin",
          currentActorId: 1,
        })
      ).rejects.toThrow("Bạn không thể tự gỡ vai trò Quản trị viên (Admin) của chính mình.");
    });
  });

  describe("Quy tắc bảo vệ Admin cuối cùng (LAST_ADMIN)", () => {
    it("chặn gỡ vai trò Admin khi chỉ còn 1 Admin duy nhất trong hệ thống", async () => {
      // Trong resetMockUsersDb, chỉ có user #1 là Admin
      try {
        await removeUserRole({
          userId: 1,
          role: "Admin",
          currentActorId: 99, // Actor khác
        });
        expect.unreachable("Hành động phải bị từ chối 409 LAST_ADMIN");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiProblemError);
        const pErr = err as ApiProblemError;
        expect(pErr.status).toBe(409);
        expect(pErr.code).toBe("LAST_ADMIN");
      }
    });

    it("chặn khóa tài khoản Admin khi chỉ còn 1 Admin duy nhất đang hoạt động", async () => {
      try {
        await setUserActiveStatus({
          userId: 1,
          isActive: false,
          reason: "Khóa quản trị viên duy nhất",
          currentActorId: 99,
        })
        expect.unreachable("Hành động phải bị từ chối 409 LAST_ADMIN");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiProblemError);
        const pErr = err as ApiProblemError;
        expect(pErr.status).toBe(409);
        expect(pErr.code).toBe("LAST_ADMIN");
      }
    });
  });

  describe("Bắt buộc lý do khi khóa tài khoản", () => {
    it("báo lỗi nếu khóa tài khoản mà không cung cấp lý do", async () => {
      await expect(
        setUserActiveStatus({
          userId: 2,
          isActive: false,
          reason: "",
          currentActorId: 1,
        })
      ).rejects.toThrow("Vui lòng nhập lý do khóa tài khoản cụ thể");
    });

    it("thành công khi khóa tài khoản với lý do hợp lệ", async () => {
      const updated = await setUserActiveStatus({
        userId: 2,
        isActive: false,
        reason: "Vi phạm quy chế nội bộ",
        currentActorId: 1,
      });

      expect(updated.isActive).toBe(false);
      expect(updated.lockInfo?.reason).toBe("Vi phạm quy chế nội bộ");
    });
  });

  describe("Gán vai trò và Phê duyệt hồ sơ", () => {
    it("gán vai trò hợp lệ cho người dùng", async () => {
      const updated = await assignUserRole({
        userId: 2,
        role: "Maintenance",
      });
      expect(updated.roles).toContain("Maintenance");
    });

    it("từ chối gán vai trò không tồn tại trong hệ thống", async () => {
      await expect(
        assignUserRole({
          userId: 2,
          role: "SuperHackerRole" as unknown as Role,
        })
      ).rejects.toThrow("không tồn tại trong danh mục hệ thống");
    });
  });
});
