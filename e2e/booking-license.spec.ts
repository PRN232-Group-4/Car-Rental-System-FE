import { expect, test, type Page } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const bookingPath = "/booking?mode=longterm&vehicleId=8&startTime=2027-01-10T08%3A00&endTime=2027-01-11T08%3A00&facilityId=5";

async function mockApis(page: Page) {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile")
      ? { fullName: "Khách kiểm thử", email: "license-test@example.com", roles: ["Customer"] }
      : path.endsWith("/facilities") ? [{ id: 5, name: "Quận 1" }]
      : path.endsWith("/vehicles/search")
        ? { items: [{ id: 8, vehicleTypeId: 6, facilityId: 5, status: "available", brand: "Toyota", model: "Corolla Cross", hourlyPrice: 120000, longtermPrice: 18500000 }], page: 1, pageSize: 20, totalCount: 1 }
        : [];
    return route.fulfill({ json: envelope(data) });
  });
}

test.beforeEach(async ({ page }) => mockApis(page));

for (const license of [null, { number: null, status: "pending" }]) {
  test(`redirects ${license ? "placeholder" : "missing"} license before rendering booking`, async ({ page }) => {
    await page.route("**/api/customer/license", (route) => route.fulfill({ json: envelope(license) }));
    await page.goto(bookingPath);
    await expect(page).toHaveURL(`/driver-license?returnTo=${encodeURIComponent(bookingPath)}`);
    await expect(page.getByRole("main").getByRole("heading", { name: "Giấy phép lái xe (GPLX)" })).toBeVisible();
    await expect(page.getByText("Vui lòng cập nhật GPLX trước khi đặt xe.", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: "Xác nhận đặt xe" })).toHaveCount(0);
  });
}

test("keeps license loading failures on booking and supports retry", async ({ page }) => {
  let failing = true;
  await page.route("**/api/customer/license", (route) => failing
    ? route.fulfill({ status: 500, json: { ...envelope(null), code: 500, is_success: false, status: "error", message: "Không thể tải" } })
    : route.fulfill({ json: envelope({ number: "123", status: "approved" }) }));
  await page.goto("/booking");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Không thể kiểm tra GPLX");
  await expect(page).toHaveURL("/booking");
  await expect(page.getByRole("button", { name: "Xác nhận đặt xe" })).toHaveCount(0);
  failing = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByRole("button", { name: "Xác nhận đặt xe" })).toBeVisible();
});

for (const status of ["pending", "rejected"]) {
  test(`keeps existing approval handling for a populated ${status} license`, async ({ page }) => {
    await page.route("**/api/customer/license", (route) => route.fulfill({ json: envelope({ number: "123", status }) }));
    await page.goto("/booking");
    await expect(page.getByRole("button", { name: "Xác nhận đặt xe" })).toBeVisible();
    await expect(page).toHaveURL("/booking");
    await expect(page.locator("#licenseStatus")).toHaveValue("Chưa được duyệt");
  });
}

test("returns to the same booking after submitting the missing license", async ({ page }) => {
  let license: Record<string, unknown> = { number: null, status: "pending" };
  await page.route("**/api/customer/license", (route) => {
    if (route.request().method() === "PUT") license = { number: "123456789", type: "B2", expiryDate: "2030-01-01", status: "pending" };
    return route.fulfill({ json: envelope(license) });
  });
  await page.goto(bookingPath);
  await expect(page.getByRole("main").getByRole("heading", { name: "Giấy phép lái xe (GPLX)" })).toBeVisible();
  await page.locator("#license-number").fill("123456789");
  await page.locator("#license-expiry-date").fill("2030-01-01");
  await page.locator("#customer-license-image").setInputFiles({ name: "license.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") });
  await page.getByRole("button", { name: "Cập nhật hồ sơ GPLX" }).click();
  await expect(page.getByRole("link", { name: "Quay lại đặt xe" })).toHaveAttribute("href", bookingPath);
  await page.getByRole("link", { name: "Quay lại đặt xe" }).click();
  await expect(page).toHaveURL(bookingPath);
  await expect(page.locator("#rentalType")).toHaveValue("longterm");
  await expect(page.locator("#startTime")).toHaveValue("2027-01-10T08:00");
  await expect(page.getByRole("button", { name: "Xác nhận đặt xe" })).toBeVisible();
});
