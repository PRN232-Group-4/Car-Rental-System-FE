import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Keep verification isolated from the deployed backend, including writes.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile")
      ? { email: "admin@test.local", fullName: "Admin", roles: ["Admin"] }
      : path.endsWith("/vehicle-types")
        ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
        : path.endsWith("/vehicles") || path.endsWith("/staff")
          ? { items: [], totalCount: 0 }
          : [];
    return route.fulfill({ json });
  });
});

test("collapsed icons share the rail center even with a scrolling menu", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 620 });
  await page.goto("/admin/vehicles");
  await page.getByRole("button", { name: "Đóng menu", exact: true }).click();
  const sidebar = page.locator("#admin-desktop-navigation");
  await expect.poll(() => sidebar.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(80);
  const links = sidebar.getByRole("navigation").getByRole("link");
  for (const link of await links.all()) {
    await expect.poll(() => link.locator("svg").first().evaluate((icon) => {
      const rail = document.querySelector("#admin-desktop-navigation")!.getBoundingClientRect();
      const bounds = icon.getBoundingClientRect();
      return Math.abs(bounds.x + bounds.width / 2 - rail.x - rail.width / 2);
    })).toBeLessThan(1);
  }
  await page.screenshot({ path: "test-results/admin-centered-icons.png" });
});

test("mobile sticky form actions remain usable while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/admin/vehicles");
  await page.getByRole("button", { name: "Thêm phương tiện", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const cancel = dialog.getByRole("button", { name: "Hủy", exact: true });
  const save = dialog.getByRole("button", { name: "Thêm phương tiện", exact: true });
  await expect(cancel).toBeInViewport();
  await expect(save).toBeInViewport();
  const initial = await cancel.boundingBox();
  await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(cancel).toBeInViewport();
  await expect(save).toBeInViewport();
  expect(Math.abs((await cancel.boundingBox())!.y - initial!.y)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "test-results/admin-mobile-sticky-footer.png" });
  for (const name of ["brand", "description"]) {
    const field = dialog.locator(`[name="${name}"]`);
    await field.focus();
    await expect.poll(() => field.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const dialog = element.closest("dialog")!;
      const header = dialog.querySelector("h2")!.parentElement!.getBoundingClientRect();
      const footer = dialog.querySelector("[data-dialog-footer]")!.getBoundingClientRect();
      return bounds.top >= header.bottom && bounds.bottom <= footer.top;
    })).toBe(true);
  }
  await cancel.click();
  await expect(dialog).toHaveCount(0);
});
