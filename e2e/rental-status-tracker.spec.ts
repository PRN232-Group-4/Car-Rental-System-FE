import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

test("customer sees actual rental milestones on desktop and mobile", async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile") ? { fullName: "Customer", email: "customer@test.local", roles: ["Customer"] }
      : path.endsWith("/rentals/42") ? { id: 42, orderId: 88, vehicleId: 8, status: "renting", rentalType: "longterm", totalPrice: 3000000, isSubscription: false }
        : path.endsWith("/vehicles/8") ? { id: 8, brand: "Toyota", model: "Vios" } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/rental-contract?rentalId=42");
  const progress = page.getByRole("region", { name: "Tiến trình thuê xe" });
  await expect(progress.getByRole("listitem")).toHaveCount(5);
  await expect(progress.locator('[aria-current="step"]')).toContainText("Đang thuê");
  await expect(progress.locator('[data-state="complete"]')).toHaveCount(2);
  await expect(progress.locator('[data-state="upcoming"]')).toHaveCount(2);
  const accent = await progress.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--td-oxide)";
    element.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  const currentDot = progress.locator('[aria-current="step"] > [aria-hidden="true"]');
  await expect(currentDot).toHaveText("03");
  await expect(progress.locator('[data-state="upcoming"] > [aria-hidden="true"]')).toHaveText(["04", "05"]);
  await expect(currentDot).toHaveCSS("background-color", accent);
  await expect(progress.locator('[data-state="complete"] > [aria-hidden="true"]').first()).toHaveCSS("background-color", accent);
  expect(await progress.locator('[data-state="complete"]').first().evaluate((element) => getComputedStyle(element, "::after").backgroundColor)).toBe(accent);
  await expect(page.getByText(/chức năng khả dụng/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Đơn thuê chính thức #88" })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(progress.getByText("Kiểm tra trả xe", { exact: true })).toBeVisible();
  expect(await progress.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("staff preparation milestone does not assert payment or official order", async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile") ? { fullName: "Manager", email: "manager@test.local", roles: ["Manager"] }
      : path.endsWith("/rentals/42") ? { id: 42, orderId: null, customerId: 3, vehicleId: 8, status: "pre_inspection", rentalType: "hourly", totalPrice: 3000000, isSubscription: false }
        : path.endsWith("/vehicles/8") ? { id: 8, brand: "Toyota", model: "Vios" }
          : path.endsWith("/staff/drivers") || path.endsWith("/rentals") ? { items: [], totalCount: 0 } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/admin/rentals?rentalId=42");
  const progress = page.locator('[aria-label="Tiến trình vòng đời hợp đồng"]');
  await expect(progress.locator('[aria-current="step"]')).toContainText("Kiểm tra trước thuê");
  await expect(page.getByRole("heading", { name: "Hành trình vận hành đơn thuê", exact: true })).toBeVisible();
  await expect(page.getByText("Chưa phát hành", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Hóa đơn đã thanh toán đủ/ })).not.toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await progress.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("cancelled customer rental stops without fabricating prior progress", async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile") ? { fullName: "Customer", email: "customer@test.local", roles: ["Customer"] }
      : path.endsWith("/rentals/42") ? { id: 42, vehicleId: 8, status: "cancelled", rentalType: "longterm", totalPrice: 3000000, isSubscription: false }
        : path.endsWith("/vehicles/8") ? { id: 8, brand: "Toyota", model: "Vios" } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/rental-contract?rentalId=42");
  const progress = page.getByRole("region", { name: "Tiến trình thuê xe" });
  await expect(progress).toContainText("Yêu cầu / đơn thuê đã hủy. Tiến trình đã dừng.");
  await expect(progress.locator('[aria-current="step"]')).toHaveCount(0);
  await expect(progress.locator('[data-state="complete"]')).toHaveCount(0);
  await expect(progress.locator('[data-state="stopped"] > [aria-hidden="true"]')).toHaveText(["01", "02", "03", "04", "05"]);
});
