import { afterEach, describe, it, expect, vi } from "vitest";
import { backendApiClient } from "@/api/backend-api-client";
import { ApiProblemError } from "@/api/api-client";
import { sanitizeUserRecord, getAdminUsers, getAdminUserById } from "@/features/admin/users/api";

afterEach(() => vi.restoreAllMocks());

const user = {
  id: 12, email: "an@example.com", fullName: "Nguyễn Văn An", phone: null, avatarUrl: null,
  roles: ["Customer"], isActive: true, createdAt: "2027-01-01T00:00:00Z", customerId: 8, staffId: null,
};
function page(items: unknown[], current = 1, totalCount = items.length) {
  return { items, page: current, pageSize: 10, totalCount };
}

describe("User adapter security", () => {
  it("strips sensitive fields without modifying the source record", () => {
    const record = { id: 1, email: "an@example.com", password: "secret", password_hash: "hash", passwordHash: "hash", access_token: "token", refresh_token: "refresh", otp: "123456", ticket: "ticket", salt: "salt", secret: "secret" };
    expect(sanitizeUserRecord(record)).toEqual({ id: 1, email: "an@example.com" });
    expect(record.password).toBe("secret");
  });

  it("requests the deployed users endpoint with supported filters and boolean status", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(page([user], 2, 21));
    const result = await getAdminUsers({ search: " An ", role: "customer", isActive: "locked", profile: "all", page: 2, pageSize: 10 });
    expect(get).toHaveBeenCalledWith("users", { search: "An", role: "Customer", isActive: false, page: 2, pageSize: 10 });
    expect(result).toMatchObject({ page: 2, pageSize: 10, totalCount: 21, items: [{ id: 12, hasCustomerProfile: true, hasStaffProfile: false }] });
  });

  it("does not send all sentinel values as backend filters", async () => {
    const get = vi.spyOn(backendApiClient, "get").mockResolvedValue(page([]));
    expect(await getAdminUsers({ role: "all", isActive: "all" })).toEqual(page([]));
    expect(get).toHaveBeenCalledWith("users", { search: undefined, role: undefined, isActive: undefined, page: 1, pageSize: 10 });
  });

  it("maps nullable fields and normalizes roles without leaking extra payload fields", async () => {
    const record = { ...user, email: null, fullName: null, roles: ["manager", "unknown", " Customer "], customerId: null, staffId: 4, passwordHash: "hash", refreshToken: "secret" };
    vi.spyOn(backendApiClient, "get").mockResolvedValue(page([record]));
    const mapped = (await getAdminUsers()).items[0];
    expect(mapped).toEqual({ id: 12, email: "", fullName: "Chưa cập nhật tên", roles: ["Manager", "Customer"], isActive: true, createdAt: user.createdAt, phone: undefined, avatarUrl: undefined, hasCustomerProfile: false, hasStaffProfile: true });
    expect(record.passwordHash).toBe("hash");
  });

  it("handles users without assigned roles", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(page([{ ...user, roles: null }]));
    expect((await getAdminUsers()).items[0].roles).toEqual([]);
  });

  it("loads all matching pages before applying profile filtering and pagination", async () => {
    const get = vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(page([{ ...user, customerId: null, staffId: 4 }], 1, 2))
      .mockResolvedValueOnce(page([user], 2, 2));
    const result = await getAdminUsers({ profile: "customer", page: 1, pageSize: 1, isActive: "active" });
    expect(result).toMatchObject({ items: [{ id: user.id }], totalCount: 1, page: 1, pageSize: 1 });
    expect(get).toHaveBeenNthCalledWith(2, "users", { search: undefined, role: undefined, isActive: true, page: 2, pageSize: 100 });
  });

  it.each(["staff", "none"])("preserves the %s profile filter", async (profile) => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(page([user, { ...user, id: 13, customerId: null, staffId: profile === "staff" ? 4 : null }]));
    expect((await getAdminUsers({ profile })).items.map((row) => row.id)).toEqual([13]);
  });

  it("sorts the full result before taking the requested local page", async () => {
    vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(page([user], 1, 2))
      .mockResolvedValueOnce(page([{ ...user, id: 13, fullName: "Bình" }], 2, 2));
    const result = await getAdminUsers({ sortBy: "fullName", sortOrder: "asc", page: 1, pageSize: 1 });
    expect(result).toMatchObject({ items: [{ id: 13 }], totalCount: 2 });
  });

  it("never displays an incomplete locally filtered result", async () => {
    vi.spyOn(backendApiClient, "get")
      .mockResolvedValueOnce(page([user], 1, 2))
      .mockResolvedValueOnce(page([], 2, 2));
    await expect(getAdminUsers({ profile: "customer" })).rejects.toThrow("Chưa tải đủ");
  });

  it.each([null, { ...page([]), items: null }, page([], 2), { ...page([]), totalCount: -1 }, page([{ ...user, roles: "Admin" }])])("rejects malformed backend data: %j", async (data) => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue(data);
    await expect(getAdminUsers()).rejects.toThrow("không hợp lệ");
  });

  it.each([new ApiProblemError(401, "Unauthorized"), new ApiProblemError(403, "Forbidden"), new Error("Offline")])("preserves API/network errors without substituting mock users", async (error) => {
    vi.spyOn(backendApiClient, "get").mockRejectedValue(error);
    await expect(getAdminUsers()).rejects.toBe(error);
  });

  it("does not request invalid page values", async () => {
    const get = vi.spyOn(backendApiClient, "get");
    await expect(getAdminUsers({ page: NaN })).rejects.toThrow("Trang phải từ 1");
    await expect(getAdminUsers({ pageSize: 101 })).rejects.toThrow("1 đến 100");
    expect(get).not.toHaveBeenCalled();
  });

  it("leaves the not-yet-connected detail adapter unchanged", async () => {
    await expect(getAdminUserById(1)).rejects.toMatchObject({ status: 501 });
  });
});
