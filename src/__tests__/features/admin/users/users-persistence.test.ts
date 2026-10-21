import { beforeEach, describe, expect, it, vi } from "vitest";
import { lockedUser, usersPage } from "./users-backend-fixture";

const server = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/api/backend-api-client", async () => {
  const { ApiClient } = await import("@/api/api-client");
  return { backendApiClient: new ApiClient({ baseUrl: "/api", customFetch: server.fetch }) };
});

describe("Trạng thái người dùng tồn tại sau khi tải lại ứng dụng", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    let stored = structuredClone(lockedUser);
    server.fetch.mockImplementation(async (url: string, init: RequestInit) => {
      const path = new URL(url, "https://app.example.test").pathname;
      let data: unknown;
      if (path === "/api/users/7/status" && init.method === "PATCH") {
        const body = JSON.parse(String(init.body));
        expect(typeof body.isActive).toBe("boolean");
        expect(body.reason).toBeTruthy();
        stored = { ...stored, isActive: body.isActive };
        data = stored;
      } else if (path === "/api/users/7") data = stored;
      else if (path === "/api/users") data = usersPage([stored]);
      else throw new Error(`Unexpected HTTP request ${init.method} ${url}`);
      return new Response(JSON.stringify({ code: 200, status: "success", is_success: true, data, message: "OK", error: null }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
  });

  it("PATCH mở khóa được đọc lại từ HTTP bằng module và query mới", async () => {
    const initial = await import("@/features/admin/users/api");
    expect((await initial.getAdminUsers()).items[0].isActive).toBe(false);
    expect((await initial.setUserActiveStatus({ userId: 7, isActive: true })).isActive).toBe(true);

    // A full app reload loses module state; only the server retains the update.
    vi.resetModules();
    const reloaded = await import("@/features/admin/users/api");
    expect((await reloaded.getAdminUsers()).items[0].isActive).toBe(true);
    expect((await reloaded.getAdminUserById(7))?.isActive).toBe(true);
    expect(server.fetch.mock.calls.some(([url, init]) => String(url).includes("/status") && init.method === "PATCH")).toBe(true);
    expect(server.fetch.mock.calls.filter(([url, init]) => String(url).startsWith("/api/users?") && init.method === "GET")).toHaveLength(2);
  });

  it("lỗi HTTP không tạo thành công giả hoặc sửa trạng thái đọc lại", async () => {
    const api = await import("@/features/admin/users/api");
    server.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ code: 409, status: "error", is_success: false, data: null, message: "Không thể thay đổi trạng thái", error: { detail: "The last active administrator cannot be removed or deactivated." } }), { status: 409, headers: { "Content-Type": "application/json" } }));
    await expect(api.setUserActiveStatus({ userId: 7, isActive: true })).rejects.toMatchObject({ status: 409 });
    expect((await api.getAdminUsers()).items[0].isActive).toBe(false);
  });
});
