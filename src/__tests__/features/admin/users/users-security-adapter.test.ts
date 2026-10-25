import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiProblemError } from "@/api/api-client";
import { adminUser, usersPage } from "./users-backend-fixture";
const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import {
  sanitizeUserRecord,
  getAdminUsers,
  getAdminUserById,
} from "@/features/admin/users/api";

describe("FE-23 Admin Users — Security & Data Adapter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    client.get.mockImplementation(async (path: string, params?: { search?: string; role?: string }) => {
      if (path === "users") return usersPage([adminUser].filter((user) => (!params?.search || `${user.fullName} ${user.email}`.toLowerCase().includes(params.search.toLowerCase())) && (!params?.role || user.roles.includes(params.role))));
      if (path === "user/1") return adminUser;
      if (path === "user/99999") throw new ApiProblemError(404, "Not Found");
      if (path === "staff/27") return { id: 27, departmentName: "Vận hành", facilityName: "Trạm thật", rating: null };
      throw new Error(`Unexpected ${path}`);
    });
  });

  it("triệt để loại bỏ các khóa nhạy cảm (password_hash, token, otp, secret) khỏi bản ghi", () => {
    const dirtyRecord = {
      id: 99,
      email: "test@thongdong.vn",
      fullName: "Test Security",
      password: "plaintext_secret",
      password_hash: "$2a$12$e8Y...hash",
      passwordHash: "hash_camelCase",
      access_token: "jwt.header.payload",
      refresh_token: "refresh.token.val",
      otp: "123456",
      ticket: "ticket_xyz",
      roles: ["Customer"],
    };

    const sanitized = sanitizeUserRecord(dirtyRecord);

    expect(sanitized).toEqual({
      id: 99,
      email: "test@thongdong.vn",
      fullName: "Test Security",
      roles: ["Customer"],
    });

    expect(sanitized).not.toHaveProperty("password");
    expect(sanitized).not.toHaveProperty("password_hash");
    expect(sanitized).not.toHaveProperty("passwordHash");
    expect(sanitized).not.toHaveProperty("access_token");
    expect(sanitized).not.toHaveProperty("refresh_token");
    expect(sanitized).not.toHaveProperty("otp");
    expect(sanitized).not.toHaveProperty("ticket");
  });

  it("lấy danh sách người dùng có phân trang và thông tin cơ bản", async () => {
    const res = await getAdminUsers({ page: 1, pageSize: 5 });
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(5);
    expect(res.items.length).toBeLessThanOrEqual(5);
    expect(res.totalCount).toBeGreaterThan(0);

    const first = res.items[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("email");
    expect(first).toHaveProperty("fullName");
    expect(first).toHaveProperty("roles");
    expect(first).toHaveProperty("isActive");
  });

  it("tìm kiếm người dùng theo từ khóa (họ tên, email, điện thoại)", async () => {
    const resName = await getAdminUsers({ search: "quản trị" });
    expect(resName.items.some((u) => u.fullName.includes("Quản Trị"))).toBe(true);

    const resEmail = await getAdminUsers({ search: "admin@thongdong.vn" });
    expect(resEmail.items.length).toBe(1);
    expect(resEmail.items[0].email).toBe("admin@thongdong.vn");
  });

  it("lọc người dùng theo vai trò", async () => {
    const res = await getAdminUsers({ role: "Admin" });
    expect(res.items.every((u) => u.roles.includes("Admin"))).toBe(true);
  });

  it("lấy chi tiết một người dùng theo ID hợp lệ", async () => {
    const user = await getAdminUserById(1);
    expect(user).not.toBeNull();
    expect(user?.id).toBe(1);
    expect(user?.email).toBe("admin@thongdong.vn");
    expect(user?.staff).toBeDefined();
  });

  it("trả về null khi tìm kiếm người dùng không tồn tại", async () => {
    const user = await getAdminUserById(99999);
    expect(user).toBeNull();
  });
});
