import { test, expect } from "@playwright/test";

const snapshot = { revenue: 24_500_000, renting: 6, maintenance: 2, activeSubscriptions: 9 };

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const counts: Record<string, number> = { available: 5, rented: 2, renting: 1, maintenance: 1 };
    const json = path.endsWith("/account/profile") ? { email: "admin@test.local", fullName: "Quản trị viên", roles: ["Admin"] }
      : path.endsWith("/dashboard") ? snapshot
        : path.endsWith("/vehicles") ? { items: [], page: 1, pageSize: 1, totalCount: url.searchParams.has("status") ? counts[url.searchParams.get("status")!] ?? 0 : 12 }
          : [];
    return route.fulfill({ json });
  });
});

test("operating overview renders API counts in the lifecycle track and fleet instrument", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("region", { name: "Vòng đời vận hành" }).locator("strong"))
    .toHaveText(["6", "2", "9", "24.500.000 ₫"]);
  const fleet = page.getByRole("complementary");
  await expect(fleet).toContainText(/5\s*\/\s*12 XE SẴN SÀNG/);
  await expect(fleet.locator("strong")).toHaveText(["3", "1", "3"]);
});

test("fleet errors stay local and retry without losing activity data", async ({ page }) => {
  await page.route("**/api/vehicles?**", (route) => route.fulfill({ status: 500, json: { title: "Không thể tải phương tiện" } }));
  await page.goto("/admin");
  await expect(page.getByRole("region", { name: "Vòng đời vận hành" }).locator("strong"))
    .toHaveText(["6", "2", "9", "24.500.000 ₫"]);
  const fleet = page.getByRole("complementary");
  await expect(fleet.getByRole("alert")).toContainText("Không thể tải cơ cấu đội xe");
  await expect(fleet).not.toContainText("XE SẴN SÀNG");
  await page.unroute("**/api/vehicles?**");
  await fleet.getByRole("button", { name: "Thử lại" }).click();
  await expect(fleet).toContainText(/5\s*\/\s*12 XE SẴN SÀNG/);
});

test("empty API data displays zero counts rather than fabricated activity", async ({ page }) => {
  await page.route("**/api/dashboard", (route) => route.fulfill({ json: { revenue: 0, renting: 0, maintenance: 0, activeSubscriptions: 0 } }));
  await page.route("**/api/vehicles?**", (route) => route.fulfill({ json: { items: [], totalCount: 0 } }));
  await page.goto("/admin");
  await expect(page.getByRole("region", { name: "Vòng đời vận hành" }).locator("strong"))
    .toHaveText(["0", "0", "0", "0 ₫"]);
  const fleet = page.getByRole("complementary");
  await expect(fleet).toContainText(/0\s*\/\s*0 XE SẴN SÀNG/);
  await expect(fleet.locator("strong")).toHaveText(["0", "0", "0"]);
});

test("overview shows named skeletons without zero fleet counts while loading", async ({ page }) => {
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => { finish = resolve; });
  await page.route("**/api/dashboard", async (route) => { await gate; return route.fulfill({ json: snapshot }); });
  await page.route("**/api/vehicles?**", async (route) => { await gate; return route.fulfill({ json: { items: [], totalCount: 0 } }); });
  await page.goto("/admin");
  await expect(page.getByRole("status", { name: "Đang tải hoạt động hiện tại...", exact: true })).toBeVisible();
  await expect(page.getByRole("status", { name: "Đang tải cơ cấu đội xe...", exact: true })).toBeVisible();
  await expect(page.getByRole("complementary")).not.toContainText("XE SẴN SÀNG");
  finish();
  await expect(page.getByRole("region", { name: "Vòng đời vận hành" }).locator("strong"))
    .toHaveText(["6", "2", "9", "24.500.000 ₫"]);
});

for (const width of [375, 768, 1280]) {
  test(`overview fits ${width}px in dark theme and reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto("/admin");
    await expect(page.getByRole("complementary")).toContainText(/5\s*\/\s*12 XE SẴN SÀNG/);
    await expect(page.locator("html")).toHaveAttribute("data-admin-theme", "dark");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/dashboard-charts/dashboard-dark-${width}.png`, fullPage: true });
  });
}

for (const width of [375, 1280]) {
  test(`overview fits ${width}px in light theme`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/admin");
    await expect(page.getByRole("complementary")).toContainText(/5\s*\/\s*12 XE SẴN SÀNG/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/dashboard-charts/dashboard-light-${width}.png`, fullPage: true });
  });
}
