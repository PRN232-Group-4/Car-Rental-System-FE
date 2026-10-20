import { expect, test } from "@playwright/test";

const rentals = Array.from({ length: 30 }, (_, index) => ({
  id: 201 + index,
  customerId: 1,
  vehicleId: 8,
  vehicleName: `Toyota Vios · Đơn ${201 + index}`,
  status: "renting",
  rentalType: "hourly",
  hasDriver: false,
  isSubscription: false,
  startTime: "2026-10-18T03:00:00Z",
  endTime: "2026-10-18T09:00:00Z",
  totalPrice: 1000000,
}));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("vrs-admin-theme", "light"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const rental = rentals.find((item) => path.endsWith(`/rentals/${item.id}`));
    const json = path.endsWith("/account/profile")
      ? { fullName: "Admin", email: "admin@test.local", roles: ["Admin"] }
      : path.endsWith("/rentals") ? { items: rentals, totalCount: rentals.length }
      : rental ?? (path.endsWith("/vehicles/8")
        ? { id: 8, brand: "Toyota", model: "Vios", licensePlate: "51A-12345" }
        : { items: [], totalCount: 0 });
    return route.fulfill({ json });
  });
});

for (const width of [1920, 1600, 1280]) {
  test(`desktop ${width}: queue and dossier scroll without stretching the page`, async ({ page }) => {
    const height = width === 1280 ? 620 : 900;
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: width === 1920 ? "no-preference" : "reduce" });
    await page.goto("/admin/rentals");
    const workspace = page.locator("#rentalWorkspaceRoot");
    const queue = workspace.locator('[class*="queueList"]');
    await expect(queue.getByRole("button")).toHaveCount(30);

    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.locator("#admin-theme-toggle").click();
      await expect.poll(() => page.evaluate(() => ({
        vertical: document.documentElement.scrollHeight <= innerHeight + 1,
        horizontal: document.documentElement.scrollWidth <= innerWidth,
      }))).toEqual({ vertical: true, horizontal: true });
      const bounds = await workspace.boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height + 1);
      for (const panel of [workspace.getByRole("complementary", { name: "Hàng đợi vận hành" }),
        workspace.getByRole("main", { name: "Hồ sơ chi tiết đơn thuê" }),
        workspace.locator('[class*="commandPanel"]').first()]) {
        const box = await panel.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(height);
      }
      await page.screenshot({ path: `test-results/rentals-empty-${width}-${theme}.png` });
      expect(await queue.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
      // The last item must be reachable inside the queue, without moving the page.
      await queue.getByRole("button").last().scrollIntoViewIfNeeded();
      await expect(queue.getByRole("button").last()).toBeInViewport();
      expect(await page.evaluate(() => scrollY)).toBe(0);
    }

    const search = page.getByRole("textbox", { name: "Nhập mã đơn thuê" });
    expect(await search.evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft))).toBeGreaterThanOrEqual(32);
    await queue.getByRole("button").first().click();
    const dossier = page.getByRole("main", { name: "Hồ sơ chi tiết đơn thuê" });
    await expect(dossier.getByText("Thông số hợp đồng thuê #201", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/rentalId=201/);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    await dossier.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await dossier.evaluate((element) => { element.scrollTop = 0; });
    await page.screenshot({ path: `test-results/rentals-layout-${width}.png` });
  });
}

for (const width of [768, 390, 320]) {
  test(`stacked ${width}: all panels remain reachable without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/admin/rentals");
    const workspace = page.locator("#rentalWorkspaceRoot");
    const queue = workspace.locator('[class*="queueList"]');
    await expect(queue.getByRole("button")).toHaveCount(30);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await queue.getByRole("button").last().scrollIntoViewIfNeeded();
    await expect(queue.getByRole("button").last()).toBeInViewport();
    const command = workspace.locator('[class*="commandPanel"]').first();
    await command.scrollIntoViewIfNeeded();
    await expect(command).toBeInViewport();
    await page.screenshot({ path: `test-results/rentals-layout-${width}.png` });
  });
}
