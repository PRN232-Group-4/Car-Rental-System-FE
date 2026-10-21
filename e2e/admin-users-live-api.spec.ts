import { expect, test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`users list reads the production contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const userRequests: URL[] = [];
    await page.route("**/api/**", (route) => {
      const url = new URL(route.request().url());
      let data: unknown = [];
      if (url.pathname.endsWith("/account/profile")) data = { email: "admin@test.local", fullName: "Admin", roles: ["Admin"] };
      else if (url.pathname.endsWith("/users")) {
        userRequests.push(url);
        data = { items: [{ id: 12, email: "an@example.com", fullName: "Nguyễn Văn An", roles: ["Customer"], isActive: false, createdAt: "2027-01-01T00:00:00Z", customerId: 8, staffId: null }], page: 2, pageSize: 10, totalCount: 21 };
      }
      return route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "OK", error: null } });
    });
    await page.goto("/admin/users?page=2&role=Customer&isActive=locked");
    const table = page.getByRole("table", { name: "Danh sách tài khoản người dùng hệ thống Thong Dong" });
    await expect(table.getByRole("link", { name: "Nguyễn Văn An", exact: true })).toBeVisible();
    await expect(table.getByText("Khách", { exact: true })).toBeVisible();
    await expect(table.getByText("Đã khóa", { exact: true })).toBeVisible();
    await expect(page.getByText("Không thể tải danh sách người dùng", { exact: true })).toHaveCount(0);
    expect(userRequests).toHaveLength(1);
    expect(userRequests[0].searchParams.get("role")).toBe("Customer");
    expect(userRequests[0].searchParams.get("isActive")).toBe("false");
    expect(userRequests[0].searchParams.get("page")).toBe("2");
    expect(userRequests[0].searchParams.get("pageSize")).toBe("10");
  });
}
