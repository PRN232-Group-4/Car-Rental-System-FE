import { expect, test } from "@playwright/test";

const counts = { rentals: 123, inspections: 3, maintenance: 2, reports: 4, licenses: 5 };
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("vrs-admin-theme", "light"));
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile")
      ? { email: "admin@example.test", fullName: "Quản trị viên", roles: ["Admin"] }
      : path.endsWith("/admin/navigation-counts") ? counts
        : path.endsWith("/reports") ? [] : { items: [], totalCount: 0, page: 1, pageSize: 20 };
    return route.fulfill({ json: { code: 200, is_success: true, data } });
  });
});

for (const width of [1600, 1280, 390]) {
  test(`parent dots and exact child counts at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/admin/maintenance");
    const chapters = page.getByRole("navigation", { name: "Nhóm chức năng", exact: true });
    await expect(chapters.getByRole("link", { name: /^Vận hành\s*, có hồ sơ mới cần xử lý$/ })).toBeAttached();
    await expect(chapters.getByRole("link", { name: /^Chăm sóc & Sự cố\s*, có hồ sơ mới cần xử lý$/ })).toBeAttached();
    await expect(chapters.getByRole("link", { name: "Đội xe", exact: true })).toBeAttached();
    const operations = page.getByRole("navigation", { name: "Các route thuộc nhóm Vận hành", exact: true });
    await expect(operations.getByRole("link", { name: /^Vận hành đơn thuê\s*, 123 hồ sơ mới cần xử lý$/ })).toBeAttached();
    await expect(operations.getByRole("link", { name: /^Kiểm tra xe\s*, 3 hồ sơ mới cần xử lý$/ })).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/navigation-counts-${width}-light.png` });
    await page.locator("#admin-theme-toggle").click();
    await page.screenshot({ path: `test-results/navigation-counts-${width}-dark.png` });
    await page.goto("/admin/reports");
    const care = page.getByRole("navigation", { name: "Các route thuộc nhóm Chăm sóc & Sự cố", exact: true });
    const license = care.getByRole("link", { name: /^Duyệt GPLX\s*, 5 hồ sơ mới cần xử lý$/ });
    await expect(license).toHaveAttribute("href", "/admin/customers?licenseStatus=pending");
    await license.click();
    await expect(page.getByLabel("Trạng thái GPLX", { exact: true })).toHaveValue("pending");
  });
}

test("zero counts show no badges or parent dots", async ({ page }) => {
  await page.route("**/api/admin/navigation-counts", (route) => route.fulfill({ json: { rentals: 0, inspections: 0, maintenance: 0, reports: 0, licenses: 0 } }));
  await page.goto("/admin/maintenance");
  const chapters = page.getByRole("navigation", { name: "Nhóm chức năng", exact: true });
  await expect(chapters.getByRole("link", { name: "Vận hành", exact: true })).toBeVisible();
  await expect(page.getByText(/hồ sơ mới cần xử lý/)).toHaveCount(0);
});

test("unavailable counts leave navigation usable without claiming new work", async ({ page }) => {
  await page.route("**/api/admin/navigation-counts", (route) => route.fulfill({ status: 500, json: { title: "Unavailable" } }));
  await page.goto("/admin/reports");
  await expect(page.getByRole("link", { name: "Duyệt GPLX", exact: true })).toBeVisible();
  await expect(page.getByText(/hồ sơ mới cần xử lý/)).toHaveCount(0);
});

for (const role of ["Admin", "Manager"]) {
  test(`${role} keeps its existing license profile access`, async ({ page }) => {
    await page.route("**/api/account/profile", (route) => route.fulfill({ json: { email: "operator@example.test", fullName: "Nhân viên", roles: [role] } }));
    await page.route("**/api/customers?*", (route) => route.fulfill({ json: { items: [{ id: 5, userId: 105, email: "customer@example.test", fullName: "Khách hàng", isActive: true, licenseStatus: "pending", loyaltyPoint: 0 }], totalCount: 1, page: 1, pageSize: 20 } }));
    await page.goto("/admin/customers?licenseStatus=pending");
    const profile = page.getByRole("link", { name: "Xem hồ sơ GPLX customer@example.test", exact: true });
    if (role === "Admin") await expect(profile).toHaveAttribute("href", "/admin/users/detail?id=105");
    else {
      await expect(page.getByRole("table").getByText("customer@example.test", { exact: true })).toBeVisible();
      await expect(profile).toHaveCount(0);
    }
  });
}

test("a hidden license route cannot add a care chapter or badge for Maintenance", async ({ page }) => {
  await page.route("**/api/account/profile", (route) => route.fulfill({ json: { email: "technician@example.test", fullName: "Kỹ thuật viên", roles: ["Maintenance"] } }));
  await page.route("**/api/admin/navigation-counts", (route) => route.fulfill({ json: { rentals: 0, inspections: 0, maintenance: 0, reports: 0, licenses: 5 } }));
  await page.goto("/admin/maintenance");
  await expect(page.getByRole("navigation", { name: "Nhóm chức năng", exact: true }).getByRole("link", { name: "Vận hành", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chăm sóc & Sự cố|Duyệt GPLX/ })).toHaveCount(0);
  await expect(page.getByText(/hồ sơ mới cần xử lý/)).toHaveCount(0);
});
