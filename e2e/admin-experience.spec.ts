import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Every API call stays local, including form submissions.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile")
      ? { email: "admin@test.local", fullName: "Admin", roles: ["Admin"] }
      : path.endsWith("/vehicle-types")
        ? [{ id: 1, name: "Ô tô xăng", type: "car", fuelType: "gasoline" }]
        : path.endsWith("/vehicles") || path.endsWith("/staff")
          ? { items: [], totalCount: 0 }
          : [];
    return route.fulfill({ status: 200, json });
  });
});

test("desktop menu collapses to icons and expands smoothly", async ({ page }) => {
  await page.goto("/admin/vehicles");
  const navigation = page.locator("#admin-desktop-navigation");
  await expect(navigation.getByRole("navigation").getByRole("link").first()).toHaveText(/Tổng quan/);
  await expect.poll(() => navigation.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(260);
  const labels = await navigation.getByRole("navigation").getByRole("link").allTextContents();
  const firstIconTop = await navigation.getByRole("navigation").getByRole("link").first().evaluate((element) => element.getBoundingClientRect().top);
  await page.getByRole("button", { name: "Đóng menu", exact: true }).click();
  await expect.poll(() => navigation.evaluate((element) => getComputedStyle(element).transitionProperty)).toContain("width");
  await expect(navigation).toBeVisible();
  await expect.poll(() => navigation.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(80);
  await expect.poll(() => navigation.evaluate((element) => Math.round(element.querySelector("nav a")!.getBoundingClientRect().top - element.firstElementChild!.getBoundingClientRect().bottom))).toBe(12);
  await expect(page.getByRole("button", { name: "Mở menu", exact: true })).toHaveAttribute("aria-expanded", "false");
  const links = navigation.getByRole("navigation").getByRole("link");
  await expect(links).toHaveCount(labels.length);
  for (const link of await links.all()) {
    await expect(link.locator("svg").first()).toBeVisible();
    await expect(link.locator("span")).toBeHidden();
    await expect(link).toHaveAttribute("title", await link.getAttribute("aria-label") ?? "");
  }
  const link = navigation.getByRole("link", { name: "Loại phương tiện", exact: true });
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\/vehicle-types$/);
  await expect(link).toHaveAttribute("aria-current", "page");
  await expect.poll(() => navigation.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(80);
  await expect(page.locator('[data-page-loading="true"]')).toHaveCount(0);
  await page.screenshot({ path: "test-results/admin-menu-collapsed.png" });
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect.poll(() => navigation.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(260);
  await expect.poll(() => navigation.getByRole("navigation").getByRole("link").first().evaluate((element) => element.getBoundingClientRect().top)).toBe(firstIconTop);
  await expect(link.locator("span")).toBeVisible();
  await page.screenshot({ path: "test-results/admin-menu-desktop.png" });
});

test("reduced motion skips sidebar animation and mobile keeps full labels", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/vehicles");
  const navigation = page.locator("#admin-desktop-navigation");
  await page.getByRole("button", { name: "Đóng menu", exact: true }).click();
  await expect.poll(() => navigation.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
  await expect.poll(() => navigation.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(80);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  const mobile = page.locator("#admin-mobile-navigation");
  await expect(mobile.getByRole("link", { name: "Tổng quan", exact: true }).locator("span")).toBeVisible();
  await expect(navigation).toBeHidden();
});

test("mobile menu closes after selecting a page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/vehicles");
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  const navigation = page.locator("#admin-mobile-navigation");
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Loại phương tiện", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/vehicle-types$/);
  await expect(navigation).toHaveCount(0);
});

for (const [path, button] of [
  ["vehicle-types", "Thêm mới"],
  ["policies", "Thêm chính sách"],
  ["subscription-plans", "Thêm mới"],
  ["departments", "Thêm mới"],
  ["facilities", "Thêm mới"],
  ["staffs", "Thêm mới"],
  ["maintenance", "Tạo phiếu bảo trì"],
  ["dispatch", "Tạo ca làm"],
]) {
  test(`${path}: create opens a keyboard accessible popup on the list`, async ({ page }) => {
    await page.goto(`/admin/${path}`);
    const trigger = page.getByRole("button", { name: button, exact: true });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/admin/${path}$`));
    await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test("new vehicle form fits a mobile viewport and returns to the list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/vehicles");
  await page.getByRole("link", { name: "Đăng ký xe mới", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/vehicles\/new$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Thêm");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const form = page.locator("form");
  const bounds = (await form.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole("button", { name: "Xem vị trí xe" })).toHaveCount(0);
  const cancel = form.getByRole("link", { name: "Hủy", exact: true });
  await cancel.scrollIntoViewIfNeeded();
  await expect(cancel).toBeInViewport();
  await expect(form.getByRole("button", { name: "Thêm phương tiện", exact: true })).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/admin-vehicle-new-mobile.png", fullPage: true });
  await cancel.click();
  await expect(page).toHaveURL(/\/admin\/vehicles$/);
  await expect(page.getByRole("link", { name: "Đăng ký xe mới", exact: true })).toBeVisible();
});

test("new vehicle keeps API errors, blocks duplicate saves and returns to the list after success", async ({ page }) => {
  await page.goto("/admin/vehicles/new");
  const form = page.locator("form");
  await form.locator('[name="vehicleTypeId"]').selectOption("1");
  await form.getByRole("button", { name: "Thêm phương tiện", exact: true }).click();
  await expect(form.locator('[name="brand"]')).toBeFocused();
  await expect(form.locator('[name="brand"]')).toHaveAttribute("aria-invalid", "true");
  await form.locator('[name="brand"]').fill("Toyota");
  await form.locator('[name="model"]').fill("Vios");
  await page.route("**/api/vehicles", (route) => route.request().method() === "POST"
    ? route.fulfill({ status: 400, json: { errors: { Brand: ["Hãng xe không hợp lệ."] } } })
    : route.fallback());
  await form.getByRole("button", { name: "Thêm phương tiện", exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText("Hãng xe không hợp lệ.");
  await expect(form.locator('[name="model"]')).toHaveValue("Vios");
  await form.locator('[name="brand"]').fill("Honda");
  let releaseSave!: () => void;
  let saves = 0;
  const saveGate = new Promise<void>((resolve) => { releaseSave = resolve; });
  await page.route("**/api/vehicles", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    saves += 1;
    await saveGate;
    await route.fulfill({ status: 200, json: { id: 12 } });
  });
  await form.getByRole("button", { name: "Thêm phương tiện", exact: true }).click();
  await expect(form.getByRole("button", { name: "Đang lưu...", exact: true })).toBeDisabled();
  await expect(form.locator('[name="model"]')).toHaveValue("Vios");
  const refresh = page.waitForRequest((request) => request.method() === "GET" && new URL(request.url()).pathname === "/api/vehicles");
  releaseSave();
  await refresh;
  await expect(page).toHaveURL(/\/admin\/vehicles$/);
  expect(saves).toBe(1);
});

test("links, history and command navigation do not show a page loader", async ({ page }) => {
  await page.goto("/admin/vehicles");
  const loading = page.locator('[data-page-loading="true"]');
  const currentLink = page.locator('a[href="/admin/vehicles"]').first();
  await expect(currentLink).toBeVisible();
  await page.evaluate(() => {
    document.body.dataset.navigationLoaderSeen = "false";
    new MutationObserver(() => {
      if (document.querySelector('[data-page-loading="true"]')) {
        document.body.dataset.navigationLoaderSeen = "true";
      }
    }).observe(document.body, { childList: true, subtree: true });
  });

  await currentLink.click();
  await expect(page).toHaveURL(/\/admin\/vehicles$/);
  await page.getByRole("link", { name: "Thong Dong Transit Desk", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("main")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/vehicles$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("button", { name: "Tìm chức năng (Ctrl+K)", exact: true }).click();
  const search = page.getByRole("textbox", { name: "Tìm kiếm route", exact: true });
  await search.fill("/admin/vehicle-types");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/admin\/vehicle-types$/);
  await expect(page.locator("main")).toBeFocused();
  await expect(loading).toHaveCount(0);
  await expect(page.locator("body")).toHaveAttribute("data-navigation-loader-seen", "false");
});
