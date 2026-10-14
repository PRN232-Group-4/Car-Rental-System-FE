import { test, expect, type Page } from "@playwright/test";

const vehicle = { id: 8, vehicleTypeId: 6, vehicleType: "Ô tô", facilityId: 5, facility: "Quận 1", status: "available", brand: "Toyota", model: "Corolla Cross", hourlyPrice: 120000, longtermPrice: 18500000 };
const policy = { id: 6, vehicleTypeId: 6, name: "Chính sách thử nghiệm", isActive: true, vatRate: 8, depositPercentage: 20, overtimeFeeRate: 0 };
const rental = { id: 321, vehicleId: 8, rentalType: "longterm", status: "pending", totalPrice: 19980000, depositPrice: 3996000, vatPrice: 1480000, contractLink: null, signedAt: null };
const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

test.beforeEach(async ({ page }) => {
  // Intercept every API call: no test may create a production booking or contract.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile") ? { fullName: "Khách kiểm thử", email: "test@example.com", roles: ["Customer"] } :
      path.endsWith("/customer/license") ? { verificationStatus: "approved", status: "approved" } :
      path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 } :
      path.endsWith("/rental-policies") ? [policy] :
      path.endsWith("/rentals/321") ? rental : [];
    return route.fulfill({ status: 200, json: envelope(data) });
  });
});

async function fillBooking(page: Page) {
  await page.locator("#startTime").fill("2027-01-10T08:00");
  await page.locator("#endTime").fill("2027-01-10T10:30");
  await expect(page.locator("#vehicleId")).toBeEnabled();
  await page.locator("#vehicleId").selectOption("8");
}

test("hourly booking uses policy percentages, real ids and the exact API request", async ({ page }) => {
  let payload: unknown;
  await page.route("**/api/rentals/hourly", (route) => { payload = route.request().postDataJSON(); return route.fulfill({ status: 200, json: envelope({ ...rental, rentalType: "hourly", totalPrice: 324000, depositPrice: 64800 }) }); });
  await page.goto("/booking"); await fillBooking(page);
  await expect(page.getByText("388.800 đ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("heading", { name: "Đặt xe thành công" })).toBeVisible();
  expect(payload).toEqual({ vehicleId: 8, policyId: 6, startTime: "2027-01-10T01:00:00.000Z", endTime: "2027-01-10T03:30:00.000Z", subscriptionId: null, hasDriver: false });
  await expect(page.getByText("Mã đơn thuê: #321")).toBeVisible();
  await page.route("**/api/invoices", (route) => route.fulfill({ json: envelope([{ id: 777, rentalId: 321, status: "unpaid" }]) }));
  await page.getByRole("button", { name: "Kiểm tra / tạo hóa đơn" }).click();
  await expect(page.getByRole("link", { name: "Xem hóa đơn và thanh toán" })).toHaveAttribute("href", "/invoices/777");
});

test("longterm booking calls the correct endpoint and opens its contract", async ({ page }) => {
  await page.route("**/api/rentals/longterm", (route) => route.fulfill({ json: envelope(rental) }));
  await page.goto("/booking?mode=longterm&vehicleId=8");
  await expect(page.locator("#rentalType")).toHaveValue("longterm");
  await expect(page.locator("#hasDriver")).toHaveCount(0);
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("link", { name: "Xem hợp đồng", exact: true })).toHaveAttribute("href", "/rental-contract?rentalId=321");
});

test("shows all field errors and focuses the first without submitting", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/rentals/hourly", (route) => { calls += 1; return route.fulfill({ json: envelope(rental) }); });
  await page.goto("/booking");
  await page.locator("#startTime").fill("2027-01-10T10:00");
  await page.locator("#endTime").fill("2027-01-10T08:00");
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.locator("#endTime")).toBeFocused();
  await expect(page.locator("#endTime-error")).toBeVisible();
  await expect(page.locator("#vehicleId-error")).toBeVisible();
  await page.locator("#endTime").fill("2027-01-10T11:00");
  await expect(page.locator("#endTime-error")).toHaveCount(0);
  await expect(page.locator("#vehicleId-error")).toBeVisible();
  expect(calls).toBe(0);
});

test("maps nested backend errors and preserves values after a network failure", async ({ page }) => {
  await page.goto("/booking"); await fillBooking(page);
  await page.route("**/api/rentals/hourly", (route) => route.fulfill({ status: 400, json: { is_success: false, data: null, error: { errors: { "Request.EndTime": ["Xe đã được thuê trong khoảng thời gian này."] } } } }));
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.locator("#endTime-error")).toHaveText("Xe đã được thuê trong khoảng thời gian này.");
  await expect(page.locator("#endTime")).toBeFocused();
  await expect(page.locator("#vehicleId")).toHaveValue("8");
  await page.route("**/api/rentals/hourly", (route) => route.abort("failed"));
  await page.locator("#endTime").fill("2027-01-10T11:00");
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByText("Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.")).toBeVisible();
  await expect(page.locator("#vehicleId")).toHaveValue("8");
});

test("records signed contract, validates unsafe links and displays backend field errors", async ({ page }) => {
  let payload: unknown;
  await page.goto("/rental-contract?rentalId=321");
  await page.locator("#contractLink").fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Lưu thông tin ký hợp đồng" }).click();
  await expect(page.locator("#contractLink")).toBeFocused();
  await expect(page.locator("#contractLink-error")).toBeVisible();
  await expect(page.locator("#signedAt-error")).toBeVisible();
  await page.locator("#contractLink").fill("https://example.com/contract.pdf");
  await page.locator("#signedAt").fill("2027-01-10T08:00");
  await page.route("**/api/rentals/321/contract", (route) => route.fulfill({ status: 400, json: { errors: { "request.ContractLink": ["Đường dẫn hợp đồng không hợp lệ."] } } }));
  await page.getByRole("button", { name: "Lưu thông tin ký hợp đồng" }).click();
  await expect(page.locator("#contractLink-error")).toHaveText("Đường dẫn hợp đồng không hợp lệ.");
  await page.route("**/api/rentals/321/contract", (route) => { payload = route.request().postDataJSON(); return route.fulfill({ json: envelope({ ...rental, contractLink: "https://example.com/contract.pdf", signedAt: "2027-01-10T01:00:00.000Z" }) }); });
  await page.locator("#contractLink").fill("https://example.com/contract.pdf");
  await page.getByRole("button", { name: "Lưu thông tin ký hợp đồng" }).click();
  await expect(page.getByText("Đã lưu thông tin hợp đồng.")).toBeVisible();
  expect(payload).toEqual({ contractLink: "https://example.com/contract.pdf", signedAt: "2027-01-10T01:00:00.000Z" });
  await expect(page.getByRole("link", { name: "Mở tài liệu hợp đồng" })).toHaveAttribute("href", "https://example.com/contract.pdf");
});

test("preserves booking selection through the login guard", async ({ page }) => {
  await page.route("**/api/account/profile", (route) => route.fulfill({ status: 204 }));
  await page.goto("/booking?mode=longterm&vehicleId=8");
  await expect(page).toHaveURL(/login\?next=%2Fbooking%3Fmode%3Dlongterm%26vehicleId%3D8/);
});
