import { expect, test } from "@playwright/test";

const customers = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  userId: index + 101,
  fullName: `Khách hàng ${index + 1}`,
  email: `customer${index + 1}@test.local`,
  phone: "0901234567",
  avatarUrl: null,
  isActive: index !== 22,
  licenseStatus: index === 22 ? "pending" : index === 21 ? "none" : "approved",
  loyaltyPoint: 10,
}));

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/customers")) {
      let items = customers;
      const search = url.searchParams.get("search");
      const licenseStatus = url.searchParams.get("licenseStatus");
      const isActive = url.searchParams.get("isActive");
      if (search) items = items.filter((item) => `${item.fullName} ${item.email} ${item.phone}`.includes(search));
      if (licenseStatus) items = items.filter((item) => item.licenseStatus === licenseStatus);
      if (isActive !== null) items = items.filter((item) => item.isActive === (isActive === "true"));
      const page = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
      return route.fulfill({ json: { items: items.slice((page - 1) * pageSize, page * pageSize), totalCount: items.length, page, pageSize } });
    }
    return route.fulfill({ json: url.pathname.endsWith("/account/profile")
      ? { fullName: "Quản trị viên", email: "admin@test.local", roles: ["Admin"] }
      : [] });
  });
});

test("lists all customer accounts and filters submitted licenses across pages", async ({ page }) => {
  await page.goto("/admin/customers");
  await expect(page.getByRole("link", { name: "Khách hàng", exact: true }).first()).toBeVisible();
  await expect(page.getByText("23 khách hàng", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Trang sau", exact: true }).click();
  await expect(page.getByText("Trang 2 / 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Đã ngừng hoạt động", exact: true })).toBeVisible();
  const bar = page.locator("[data-admin-filters]");
  await bar.getByLabel("Trạng thái GPLX", { exact: true }).selectOption("pending");
  await expect(page.getByText("23 khách hàng", { exact: true })).toBeVisible();
  const pendingRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith("/customers") && url.searchParams.get("licenseStatus") === "pending" && url.searchParams.get("page") === "1";
  });
  await bar.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await pendingRequest;
  await expect(page.getByText("1 khách hàng", { exact: true })).toBeVisible();
  await expect(page.getByRole("table").getByText("Khách hàng 23", { exact: true })).toBeVisible();
  await expect(page.getByText("Trang 1 / 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("table").getByText("Chờ phê duyệt", { exact: true })).toBeVisible();
  await bar.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(bar.getByLabel("Trạng thái GPLX", { exact: true })).toHaveValue("");
  await expect(page.getByText("23 khách hàng", { exact: true })).toBeVisible();
  await expect(page.getByText("Trang 1 / 2", { exact: true })).toBeVisible();
});

test("applies search and inactive account filter and clears empty results", async ({ page }) => {
  await page.goto("/admin/customers");
  const bar = page.locator("[data-admin-filters]");
  await bar.getByLabel("Tìm khách hàng", { exact: true }).fill("customer23");
  await bar.getByLabel("Trạng thái tài khoản", { exact: true }).selectOption("false");
  await bar.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await expect(page.getByText("1 khách hàng", { exact: true })).toBeVisible();
  await bar.getByLabel("Trạng thái GPLX", { exact: true }).selectOption("none");
  await bar.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await expect(page.getByText("Không có khách hàng phù hợp.", { exact: false })).toBeVisible();
  await bar.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(page.getByText("23 khách hàng", { exact: true })).toBeVisible();
  await expect(bar.getByLabel("Tìm khách hàng", { exact: true })).toHaveValue("");
  await expect(bar.getByLabel("Trạng thái tài khoản", { exact: true })).toHaveValue("");
});

test("shows a retryable error instead of a false empty list", async ({ page }) => {
  let fail = true;
  await page.route("**/api/customers?*", (route) => route.fulfill(fail
    ? { status: 500, json: { title: "Failed" } }
    : { json: { items: [customers[0]], totalCount: 1, page: 1, pageSize: 20 } }));
  await page.goto("/admin/customers");
  await expect(page.locator("p[role=alert]")).toContainText("Không thể tải danh sách khách hàng");
  await expect(page.getByText("Không có khách hàng phù hợp.", { exact: false })).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByText("1 khách hàng", { exact: true })).toBeVisible();
  await expect(page.locator("p[role=alert]")).toHaveCount(0);
});

test("maps API filter validation inline and clears the edited field", async ({ page }) => {
  await page.goto("/admin/customers");
  await expect(page.getByText("23 khách hàng", { exact: true })).toBeVisible();
  await page.route("**/api/customers?*", (route) => route.fulfill({
    status: 400,
    json: { errors: { Search: ["Vui lòng kiểm tra từ khóa tìm kiếm."] } },
  }));
  const search = page.getByLabel("Tìm khách hàng", { exact: true });
  await search.fill("Từ khóa");
  await page.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await expect(search).toHaveAttribute("aria-invalid", "true");
  await expect(search).toBeFocused();
  await expect(page.getByText("Vui lòng kiểm tra từ khóa tìm kiếm.", { exact: true })).toBeVisible();
  await search.fill("Từ khóa mới");
  await expect(search).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByText("Vui lòng kiểm tra từ khóa tìm kiếm.", { exact: true })).toHaveCount(0);
});

test("keeps shared filter controls inside the viewport on desktop and mobile", async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/admin/customers");
    await expect(page.getByText("23 khách hàng", { exact: true })).toBeVisible();
    const bar = page.locator("[data-admin-filters]");
    for (const control of await bar.locator("input, select").all()) {
      const bounds = await control.boundingBox();
      expect(bounds!.height).toBe(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/admin-customers-${width}.png`, fullPage: true });
  }
});
