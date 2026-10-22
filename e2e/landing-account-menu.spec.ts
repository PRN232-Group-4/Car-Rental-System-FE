import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path.endsWith("/account/profile")
      ? { fullName: "Khách kiểm thử", email: "customer@test.local", roles: ["Customer"] }
      : [] });
  });
});

for (const width of [1440, 1024, 768, 640]) {
  test(`account popup joins the landing header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 600 });
    await page.goto("/");
    const trigger = page.locator('header button[aria-controls="landing-account-menu"]');
    await expect(trigger).toContainText("Khách kiểm thử");
    await trigger.focus();
    await trigger.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#landing-account-menu");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("box-shadow", "none");
    await expect(menu).toHaveCSS("border-top-left-radius", "0px");

    const header = page.locator("header nav").first();
    const menuBox = await menu.boundingBox();
    const headerBox = await header.boundingBox();
    const triggerBox = await trigger.boundingBox();
    expect(Math.abs(menuBox!.y - headerBox!.y - headerBox!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(menuBox!.x + menuBox!.width - triggerBox!.x - triggerBox!.width)).toBeLessThanOrEqual(1);
    expect(menuBox!.x).toBeGreaterThanOrEqual(0);
    expect(menuBox!.y + menuBox!.height).toBeLessThanOrEqual(600);
    expect(await menu.evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe(await header.evaluate((element) => getComputedStyle(element).backgroundColor));
    await expect(menu.getByRole("link", { name: "Hồ sơ cá nhân", exact: true }).last()).toHaveAttribute("href", "/profile");
    await expect(menu.getByRole("link", { name: "Đổi mật khẩu", exact: true })).toHaveAttribute("href", "/profile#change-password");
    const logout = menu.getByRole("button", { name: "Đăng xuất", exact: true });
    await logout.scrollIntoViewIfNeeded();
    await expect(logout).toBeInViewport();
    await page.screenshot({ path: `test-results/landing-account-${width}.png` });
    await trigger.click();
    await expect(menu).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
}

test("mobile navigation keeps account actions reachable inside the header", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu điều hướng", exact: true }).click();
  const menu = page.locator("#mobile-nav-menu");
  await expect(menu.getByText("customer@test.local")).toBeVisible();
  await expect(menu.getByRole("link", { name: "Đổi mật khẩu", exact: true })).toHaveAttribute("href", "/profile#change-password");
  const logout = menu.getByRole("button", { name: "Đăng xuất", exact: true });
  await logout.scrollIntoViewIfNeeded();
  await expect(logout).toBeInViewport();
  const bounds = await menu.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(640);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "test-results/landing-account-mobile.png" });
});

test("change-password menu opens the existing OTP form after profile loading", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator('header button[aria-controls="landing-account-menu"]');
  await expect(trigger).toContainText("Khách kiểm thử");
  await trigger.click();
  await page.locator("#landing-account-menu").getByRole("link", { name: "Đổi mật khẩu", exact: true }).click();
  await expect(page).toHaveURL(/\/profile#change-password$/);
  const form = page.locator("#change-password");
  await expect(form).toBeInViewport();
  await expect(form.getByLabel("Mật khẩu hiện tại")).toBeVisible();
  await form.getByRole("button", { name: "Gửi OTP xác nhận", exact: true }).click();
  await expect(form.getByLabel("Mật khẩu hiện tại")).toHaveAttribute("aria-invalid", "true");
});

for (const [roles, profile] of [
  [["Admin"], "/admin/profile"],
  [["Staff"], "/admin/profile"],
  [["Staff", "Driver"], "/staff/profile"],
] as const) {
  test(`password link uses the correct portal for ${roles.join("+")}`, async ({ page }) => {
    await page.route("**/api/account/profile", (route) => route.fulfill({ json: {
      fullName: "Nhân viên kiểm thử", email: "staff@test.local", roles,
    } }));
    await page.goto("/");
    const trigger = page.locator('header button[aria-controls="landing-account-menu"]');
    await expect(trigger).toContainText("Nhân viên kiểm thử");
    await trigger.click();
    await expect(page.locator("#landing-account-menu").getByRole("link", { name: "Đổi mật khẩu", exact: true }))
      .toHaveAttribute("href", `${profile}#change-password`);
  });
}
