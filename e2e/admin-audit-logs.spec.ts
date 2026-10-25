import { expect, test } from "@playwright/test";

/**
 * Nhật ký kiểm toán: API `GET /api/audit-logs` đã có trên backend (policy Admin/Manager),
 * nên spec này chốt hợp đồng hiển thị + bộ lọc + phân trang + trạng thái lỗi.
 */
const records = [
  {
    id: "AUD-42",
    timestamp: "2026-10-23T03:04:05Z",
    actorId: 1,
    actorEmail: "admin@test.local",
    actorName: "Quản trị viên",
    action: "role_assigned",
    targetUserId: 9,
    targetUser: "huy@test.local",
    details: "Gán quyền Manager",
    ipAddress: "203.0.113.7",
    status: "success",
  },
  {
    id: "AUD-41",
    timestamp: "2026-10-22T09:00:00Z",
    actorId: 1,
    actorEmail: "admin@test.local",
    actorName: "Quản trị viên",
    action: "account_locked",
    targetUserId: 12,
    targetUser: "khoa@test.local",
    details: "Khóa do vi phạm",
    ipAddress: null,
    status: "success",
  },
];

test("hiển thị nhật ký thật, lọc theo hành động và phân trang", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/audit-logs")) {
      const action = url.searchParams.get("action");
      const search = url.searchParams.get("search");
      let items = records;
      if (action) items = items.filter((item) => item.action === action);
      if (search) items = items.filter((item) => `${item.id} ${item.actorEmail} ${item.actorName} ${item.targetUser}`.includes(search));
      const pageNumber = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
      return route.fulfill({
        json: { items: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), totalCount: items.length, page: pageNumber, pageSize },
      });
    }
    return route.fulfill({
      json: url.pathname.endsWith("/account/profile")
        ? { fullName: "Quản trị viên", email: "admin@test.local", roles: ["Manager"] }
        : [],
    });
  });

  await page.goto("/admin/audit-logs");

  await expect(page.getByRole("heading", { name: /Nhật ký/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /AUD-42/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /huy@test\.local/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /Gán vai trò/ })).toBeVisible();
  await expect(page.getByText("2 bản ghi, mới nhất trước")).toBeVisible();

  const bar = page.locator("[data-admin-filters]");
  await bar.getByLabel("Loại hành động", { exact: true }).selectOption("account_locked");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();

  await expect(page.getByRole("cell", { name: /AUD-41/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /AUD-42/ })).toHaveCount(0);
  await expect(page.getByText("1 bản ghi, mới nhất trước")).toBeVisible();

  await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(page.getByRole("cell", { name: /AUD-42/ })).toBeVisible();
});

test("báo lỗi có HTTP status khi không đủ quyền truy vết", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/audit-logs")) {
      return route.fulfill({
        status: 403,
        json: { code: 403, status: "error", is_success: false, data: null, message: "Forbidden", error: { detail: "Bạn không có quyền truy vết." } },
      });
    }
    return route.fulfill({
      json: url.pathname.endsWith("/account/profile")
        ? { fullName: "Quản trị viên", email: "admin@test.local", roles: ["Manager"] }
        : [],
    });
  });

  await page.goto("/admin/audit-logs");

  const alert = page.getByRole("alert").filter({ hasText: "Không thể tải nhật ký kiểm toán" });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("(HTTP 403)");
  await expect(page.getByRole("button", { name: /Thử tải lại/ })).toBeVisible();
});
