import { test, expect } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const data = url.pathname.endsWith("/account/profile") ? { fullName: "Khách kiểm thử", email: "test@example.com", roles: ["Customer"] }
      : url.pathname.endsWith("/customer/license") ? { number: "123456789", status: "approved" }
      : url.pathname.endsWith("/facilities") ? [{ id: 5, name: "Quận 1" }, { id: 6, name: "Quận 3" }]
      : url.pathname.endsWith("/vehicles/search") ? { items: url.searchParams.get("hasDriver") === "true" ? [] : [{ id: 8, brand: "Toyota", model: "Vios", facility: { id: Number(url.searchParams.get("facilityId")), name: url.searchParams.get("facilityId") === "6" ? "Quận 3" : "Quận 1" }, vehicleType: { id: 1, name: "Ô tô" }, priceHourly: 100000 }], totalCount: url.searchParams.get("hasDriver") === "true" ? 0 : 1 }
      : [];
    return route.fulfill({ json: envelope(data) });
  });
});

test("requires facility then driving choice and resets vehicle when either changes", async ({ page }) => {
  const searches: URL[] = [];
  page.on("request", (request) => { if (new URL(request.url()).pathname.endsWith("/vehicles/search")) searches.push(new URL(request.url())); });
  await page.goto("/booking");
  await expect(page.locator("#facilityId")).toBeEnabled();
  await expect(page.locator("#hasDriver")).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Phương tiện khả dụng" })).toHaveCount(0);
  expect(searches).toHaveLength(0);
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.locator("#facilityId-error")).toBeVisible();
  await expect(page.locator("#facilityId")).toBeFocused();
  await page.locator("#facilityId").selectOption("5");
  await expect(page.locator("#hasDriver")).toBeVisible();
  expect(searches).toHaveLength(0);
  await page.locator("#hasDriver").selectOption("false");
  await page.getByRole("radio", { name: "Toyota Vios" }).check();
  expect(searches.at(-1)?.searchParams.get("facilityId")).toBe("5");
  expect(searches.at(-1)?.searchParams.get("hasDriver")).toBe("false");
  await page.locator("#hasDriver").selectOption("true");
  await expect(page.getByText("Chưa có xe và tài xế khả dụng tại cơ sở trong thời gian này.", { exact: false })).toBeVisible();
  await expect(page.getByText("Chưa chọn phương tiện", { exact: true })).toBeVisible();
  expect(searches.at(-1)?.searchParams.get("hasDriver")).toBe("true");
  await page.locator("#facilityId").selectOption("6");
  await expect(page.locator("#hasDriver")).toHaveValue("");
  await expect(page.getByRole("group", { name: "Phương tiện khả dụng" })).toHaveCount(0);
  await page.locator("#hasDriver").selectOption("false");
  await expect(page.getByRole("radio", { name: "Toyota Vios" })).not.toBeChecked();
  expect(searches.at(-1)?.searchParams.get("facilityId")).toBe("6");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#facilityId")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/booking-facility-mobile.png", fullPage: true });
});

test("shows available vehicles for a branch with a free driver and submits hasDriver", async ({ page }) => {
  await page.route("**/api/vehicles/search?**", (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get("hasDriver")).toBe("true");
    expect(url.searchParams.get("facilityId")).toBe("5");
    return route.fulfill({ json: envelope({ items: [{ id: 8, brand: "Toyota", model: "Vios", facility: { id: 5, name: "Quận 1" }, vehicleType: { id: 1, name: "Ô tô" }, priceHourly: 100000 }], totalCount: 1 }) });
  });
  let payload: Record<string, unknown> | undefined;
  await page.route("**/api/rentals/hourly", (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({ json: envelope({ id: 55, vehicleId: 8, rentalType: "hourly", status: "pending" }) });
  });
  await page.goto("/booking?facilityId=5");
  await page.locator("#hasDriver").selectOption("true");
  await page.getByRole("radio", { name: "Toyota Vios" }).check();
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("heading", { name: "Đã gửi yêu cầu đặt xe" })).toBeVisible();
  expect(payload?.hasDriver).toBe(true);
  expect(payload?.vehicleId).toBe(8);
});

test("shows a retry action if facilities cannot load", async ({ page }) => {
  await page.route("**/api/facilities?**", (route) => route.fulfill({ status: 500, json: { ...envelope(null), code: 500, status: "error", is_success: false } }));
  await page.goto("/booking");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Không thể tải cơ sở");
  await page.route("**/api/facilities?**", (route) => route.fulfill({ json: envelope([{ id: 5, name: "Quận 1" }]) }));
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await page.locator("#facilityId").selectOption("5");
  await expect(page.locator("#hasDriver")).toBeVisible();
});
