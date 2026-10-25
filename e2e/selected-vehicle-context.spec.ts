import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const from = "2030-06-01T02:30:00.000Z";
const to = "2030-07-01T04:00:00.000Z";
const vehicle = { id: 8, brand: "Toyota", model: "Corolla Cross", yearOfManufacture: 2026, allowedLicenseTypes: ["B", "B2"], mainImageUrl: "/favicon.ico", status: "available" };

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    // This suite never creates rentals or calls payment providers.
    expect(request.method()).toBe("GET");
    const path = new URL(request.url()).pathname;
    let data: unknown = [];
    if (path.endsWith("/account/profile")) data = { id: 1, fullName: "Khách kiểm thử", email: "customer@test.local", roles: ["Customer"] };
    else if (path.endsWith("/facilities")) data = [{ id: 5, name: "Quận 1" }];
    else if (path.endsWith("/customer/license")) data = { number: "B123456", type: "B", expiryDate: "2099-01-01", status: "approved" };
    else if (path.endsWith("/vehicles/search")) data = { items: [{ ...vehicle, vehicleType: { id: 6, type: "car", name: "Ô tô" }, facility: { id: 5, name: "Quận 1" }, priceHourly: 120000, priceLongterm: 18500000 }], totalCount: 1, page: 1, pageSize: 100 };
    else if (path.endsWith("/vehicle/8")) data = { ...vehicle, vehicleTypeId: 6, vehicleType: "car", facilityId: 5, facility: "Quận 1", hourlyPrice: 120000, longtermPrice: 18500000 };
    else if (path.endsWith("/availability")) data = { vehicleId: 8, available: true };
    else if (path.endsWith("/active-policy")) data = null;
    await route.fulfill({ json: envelope(data) });
  });
});

for (const width of [1440, 390]) {
  test(`catalog selection carries the vehicle, branch and schedule through details to booking at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/find?facilityId=5&mode=longterm&startDate=${encodeURIComponent(from)}&endDate=${encodeURIComponent(to)}`);
    const card = page.getByTestId("vehicle-card").filter({ hasText: "Toyota Corolla Cross" });
    await expect(card.getByTestId("vehicle-license-requirement")).toHaveText("Tự lái: GPLX B hoặc B2");
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/vehicle-license-card-${width}.png` });
    await card.getByRole("link", { name: "Chi tiết", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Toyota Corolla Cross" })).toBeVisible();
    await expect(page.getByTestId("vehicle-license-requirement")).toContainText("Tự lái: GPLX B hoặc B2");
    await expect(page.getByText("Chỉ cần một trong các hạng bằng lái trên khi thuê tự lái.", { exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/vehicle-license-detail-${width}.png` });
    const detailUrl = new URL(page.url());
    expect(detailUrl.searchParams.get("id")).toBe("8");
    expect(detailUrl.searchParams.get("from")).toBe(from);
    expect(detailUrl.searchParams.get("to")).toBe(to);
    await page.getByRole("button", { name: "Tiến hành đặt xe", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Tạo đơn thuê xe", exact: true })).toBeVisible();
    await expect(page.locator("#facilityId")).toHaveValue("5");
    await expect(page.locator("#rentalType")).toHaveValue("longterm");
    await expect(page.locator("#hasDriver")).toHaveValue("false");
    await expect(page.locator("#startTime")).toHaveValue("2030-06-01T09:30");
    await expect(page.locator("#endTime")).toHaveValue("2030-07-01T11:00");
    await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
    await expect(page.getByTestId("vehicle-license-requirement")).toHaveText("Tự lái: GPLX B hoặc B2");
    await page.reload();
    await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test("a shared vehicleId-only booking URL recovers the branch and current price", async ({ page }) => {
  await page.goto(`/booking?vehicleId=8&mode=self&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&hourlyPrice=1`);
  await expect(page.locator("#facilityId")).toHaveValue("5");
  await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
  await expect(page.getByText("Đơn giá: 120.000 đ / giờ", { exact: true })).toBeVisible();
  await expect(page.locator("#startTime")).toHaveValue("2030-06-01T09:30");
});
