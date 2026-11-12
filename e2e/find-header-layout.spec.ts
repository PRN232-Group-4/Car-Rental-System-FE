import { expect, test } from "@playwright/test";

for (const width of [320, 375, 768, 1280, 1440]) {
  test(`find content clears the fixed header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/**", (route) => {
      const url = new URL(route.request().url());
      const data = url.pathname.endsWith("/account/profile") ? null
        : url.pathname.endsWith("/vehicles") ? { items: [], page: 1, pageSize: 9, totalCount: 0 }
          : [];
      return route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "OK", error: null } });
    });
    await page.goto("/find");
    const title = page.getByRole("heading", { name: "Tìm & Thuê Xe Thong Dong", exact: true });
    await expect(title).toBeVisible();
    const header = await page.locator("header").boundingBox();
    const kicker = await title.boundingBox();
    expect(header).not.toBeNull();
    expect(kicker).not.toBeNull();
    expect(kicker!.y).toBeGreaterThanOrEqual(header!.y + header!.height + 16);
    await page.screenshot({ path: `test-results/find-header-${width}.png` });
  });
}
