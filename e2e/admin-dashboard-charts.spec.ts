import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const counts: Record<string, number> = { available: 5, rented: 2, renting: 1, maintenance: 1 };
    const json = path.endsWith("/account/profile") ? { email: "admin@test.local", fullName: "Quản trị viên", roles: ["Admin"] }
      : path.endsWith("/dashboard") ? { revenue: 24_500_000, renting: 6, maintenance: 2, activeSubscriptions: 9 }
        : path.endsWith("/vehicles") ? { items: [], page: 1, pageSize: 1, totalCount: url.searchParams.has("status") ? counts[url.searchParams.get("status")!] ?? 0 : 12 }
          : [];
    return route.fulfill({ json });
  });
});

test("overview renders real API counts in accessible bar/pie charts and matching tables", async ({ page }) => {
  await page.goto("/admin");
  const bars = page.getByRole("img", { name: /^Biểu đồ cột hoạt động/ });
  const pie = page.getByRole("img", { name: /^Biểu đồ tròn cơ cấu/ });
  await expect(bars).toBeVisible();
  await expect(bars).toHaveAttribute("aria-label", /Đơn đang thuê: 6; Phiếu bảo dưỡng mở: 2; Gói thuê còn hiệu lực: 9/);
  await expect(pie).toHaveAttribute("aria-label", /12 xe.*Đang thuê: 3 xe, 25%.*Tạm ngưng \/ khác: 3 xe, 25%/);
  await expect(page.getByText("24.500.000 ₫", { exact: true })).toBeVisible();
  const cards = page.locator('section[aria-label="Biểu đồ tổng quan"] > section');
  await cards.first().getByRole("button", { name: "Xem dạng bảng" }).click();
  await expect(cards.first().getByRole("table")).toBeVisible();
  await expect(cards.first().getByRole("row", { name: "Đơn đang thuê 6", exact: true })).toBeVisible();
  await cards.first().getByRole("button", { name: "Xem biểu đồ" }).click();
  await expect(bars).toBeVisible();
  await cards.nth(1).getByRole("button", { name: "Xem dạng bảng" }).click();
  await expect(cards.nth(1).getByRole("row", { name: "Đang thuê 3 25%", exact: true })).toBeVisible();
});

test("fleet errors remain local and retry without losing activity data", async ({ page }) => {
  await page.route("**/api/vehicles?**", (route) => route.fulfill({ status: 500, json: { title: "Không thể tải phương tiện" } }));
  await page.goto("/admin");
  await expect(page.getByRole("img", { name: /^Biểu đồ cột hoạt động/ })).toBeVisible();
  const fleet = page.locator('section[aria-label="Biểu đồ tổng quan"] > section').nth(1);
  await expect(fleet.getByRole("alert")).toBeVisible();
  await page.unroute("**/api/vehicles?**");
  await fleet.getByRole("button", { name: "Thử lại" }).click();
  await expect(fleet.getByRole("img")).toBeVisible();
});

test("empty API data has no fabricated bars or percentages", async ({ page }) => {
  await page.route("**/api/dashboard", (route) => route.fulfill({ json: { revenue: 0, renting: 0, maintenance: 0, activeSubscriptions: 0 } }));
  await page.route("**/api/vehicles?**", (route) => route.fulfill({ json: { items: [], totalCount: 0 } }));
  await page.goto("/admin");
  await expect(page.getByText("Chưa có hoạt động để hiển thị.")).toBeVisible();
  await expect(page.getByText("Chưa có phương tiện trong hệ thống.")).toBeVisible();
  await expect(page.getByRole("img", { name: /^Biểu đồ/ })).toHaveCount(0);
});

test("charts show skeletons until requests finish", async ({ page }) => {
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => { finish = resolve; });
  await page.route("**/api/dashboard", async (route) => { await gate; return route.fulfill({ json: { revenue: 0, renting: 1, maintenance: 1, activeSubscriptions: 1 } }); });
  await page.route("**/api/vehicles?**", async (route) => { await gate; return route.fulfill({ json: { items: [], totalCount: 0 } }); });
  await page.goto("/admin");
  await expect(page.getByRole("status", { name: "Đang tải hoạt động hiện tại...", exact: true })).toBeVisible();
  await expect(page.getByRole("status", { name: "Đang tải cơ cấu đội xe...", exact: true })).toBeVisible();
  await expect(page.getByText("Chưa có phương tiện trong hệ thống.")).toHaveCount(0);
  finish();
  await expect(page.getByRole("img", { name: /^Biểu đồ cột/ })).toBeVisible();
});

for (const width of [375, 768, 1280]) {
  test(`charts fit ${width}px in dark theme and reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto("/admin");
    await expect(page.getByRole("img", { name: /^Biểu đồ tròn/ })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-admin-theme", "dark");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/dashboard-charts/dashboard-dark-${width}.png`, fullPage: true });
  });
}

for (const width of [375, 1280]) {
  test(`charts fit ${width}px in light theme`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/admin");
    await expect(page.getByRole("img", { name: /^Biểu đồ tròn/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/dashboard-charts/dashboard-light-${width}.png`, fullPage: true });
  });
}
