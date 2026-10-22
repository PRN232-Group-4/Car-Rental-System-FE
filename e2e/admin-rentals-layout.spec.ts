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
  test(`desktop ${width}: document scrolls up and down while the queue stays on the left`, async ({ page }) => {
    const height = width === 1280 ? 620 : 900;
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: width === 1920 ? "no-preference" : "reduce" });
    await page.goto("/admin/rentals");
    const workspace = page.locator("#rentalWorkspaceRoot");
    const queue = workspace.locator('[class*="queueList"]');
    await expect(queue.getByRole("button")).toHaveCount(30);

    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.locator("#admin-theme-toggle").click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/rentals-empty-${width}-${theme}.png` });
      expect(await queue.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
      // The queue keeps its own scrollbar; its boundaries must not trap page scrolling.
      await queue.getByRole("button").last().scrollIntoViewIfNeeded();
      await expect(queue.getByRole("button").last()).toBeInViewport();
    }

    const search = page.getByRole("textbox", { name: "Nhập mã đơn thuê" });
    expect(await search.evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft))).toBeGreaterThanOrEqual(32);
    await queue.getByRole("button").first().click();
    const dossier = page.getByRole("main", { name: "Hồ sơ chi tiết đơn thuê" });
    await expect(dossier.getByText("Thông số hợp đồng thuê #201", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/rentalId=201/);
    const left = (await workspace.getByRole("complementary", { name: "Hàng đợi vận hành" }).boundingBox())!;
    const right = (await dossier.boundingBox())!;
    expect(left.x + left.width).toBeLessThan(right.x);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
    await page.mouse.move(width - 24, height - 60);
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await page.mouse.wheel(0, -10000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await queue.hover();
    await queue.evaluate(element => { element.scrollTop = element.scrollHeight; });
    await expect.poll(async () => {
      await page.mouse.wheel(0, 500);
      return page.evaluate(() => scrollY);
    }).toBeGreaterThan(0);
    await page.mouse.move(width - 24, height - 60);
    await page.mouse.wheel(0, -10000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.screenshot({ path: `test-results/rentals-layout-${width}.png` });
  });
}

for (const width of [1220, 1180, 1024, 768]) {
  test(`two columns ${width}: queue stays left of the selected rental`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1220 ? 620 : 900 });
    await page.goto("/admin/rentals?rentalId=201");
    const workspace = page.locator("#rentalWorkspaceRoot");
    const queuePanel = workspace.getByRole("complementary", { name: "Hàng đợi vận hành" });
    const queue = workspace.locator('[class*="queueList"]');
    const dossier = workspace.getByRole("main", { name: "Hồ sơ chi tiết đơn thuê" });
    const command = workspace.getByRole("complementary", { name: "Bảng lệnh điều phối" });
    await expect(dossier.getByText("Thông số hợp đồng thuê #201", { exact: true })).toBeVisible();

    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.locator("#admin-theme-toggle").click();
      const left = (await queuePanel.boundingBox())!;
      const right = (await dossier.boundingBox())!;
      const actions = (await command.boundingBox())!;
      expect(left.x + left.width).toBeLessThan(right.x);
      expect(Math.abs(left.y - right.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(actions.x - right.x)).toBeLessThanOrEqual(1);
      expect(actions.y).toBeGreaterThanOrEqual(right.y + right.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/rentals-two-columns-${width}-${theme}.png` });
    }

    await queue.getByRole("button").last().scrollIntoViewIfNeeded();
    await expect(queue.getByRole("button").last()).toBeInViewport();
    await queue.getByRole("button").last().click();
    await expect(page).toHaveURL(/rentalId=230/);
    await expect(dossier.getByText("Thông số hợp đồng thuê #230", { exact: true })).toBeVisible();
    await command.scrollIntoViewIfNeeded();
    await expect(command).toBeInViewport();
    const atCommands = await page.evaluate(() => scrollY);
    expect(atCommands).toBeGreaterThan(0);
    // At the bottom, the blank area below the left queue must also scroll the document.
    await page.mouse.move(100, 400);
    await page.mouse.wheel(0, -10000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });
}

for (const width of [390, 320]) {
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
    const queueBounds = (await workspace.getByRole("complementary", { name: "Hàng đợi vận hành" }).boundingBox())!;
    const dossierBounds = (await workspace.getByRole("main", { name: "Hồ sơ chi tiết đơn thuê" }).boundingBox())!;
    expect(dossierBounds.y).toBeGreaterThanOrEqual(queueBounds.y + queueBounds.height);
    await command.scrollIntoViewIfNeeded();
    await expect(command).toBeInViewport();
    await page.screenshot({ path: `test-results/rentals-layout-${width}.png` });
  });
}
