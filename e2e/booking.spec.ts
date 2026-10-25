import { test, expect, type Page } from "@playwright/test";

const vehicle = { id: 8, vehicleType: { id: 6, name: "Ô tô", fuelType: "gasoline" }, facility: { id: 5, name: "Quận 1" }, brand: "Toyota", model: "Corolla Cross", priceHourly: 120000, priceLongterm: 18500000, summary: { seatCount: 5, transmission: "Tự động" } };
const policy = { id: 6, vehicleTypeId: 6, name: "Chính sách thử nghiệm", isActive: true, vatRate: 8, depositPercentage: 20, overtimeFeeRate: 0 };
const rental = { id: 321, vehicleId: 8, rentalType: "longterm", status: "pending", totalPrice: 19980000, depositPrice: 3996000, vatPrice: 1480000, contractLink: null, signedAt: null };
const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

test.beforeEach(async ({ page }) => {
  // Intercept every API call: no test may create a production booking or contract.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile") ? { fullName: "Khách kiểm thử", email: "test@example.com", roles: ["Customer"] } :
      path.endsWith("/customer/license") ? { number: "012345678901", verificationStatus: "approved", status: "approved" } :
      path.endsWith("/facilities") ? [{ id: 5, name: "Quận 1", address: "12 Nguyễn Huệ" }, { id: 6, name: "Quận 3" }] :
      path.endsWith("/vehicles/search") ? { items: [vehicle], totalCount: 1 } :
      path.endsWith("/rental-policies") ? [policy] :
      path.endsWith("/rental/321") ? rental : [];
    return route.fulfill({ status: 200, json: envelope(data) });
  });
});

async function fillBooking(page: Page) {
  await chooseBranch(page);
  await page.locator("#startTime").fill("2027-01-10T08:00");
  await page.locator("#endTime").fill("2027-01-10T10:30");
  await expect(page.locator("#vehicleId")).toBeEnabled();
  await page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true }).check();
}

async function chooseBranch(page: Page, driver = "false") {
  if (await page.locator("#facilityId").inputValue() !== "5") await page.locator("#facilityId").selectOption("5");
  await page.locator("#hasDriver").selectOption(driver);
}

test("hourly booking uses policy percentages, real ids and the exact API request", async ({ page }) => {
  let payload: unknown;
  await page.route("**/api/rentals/hourly", (route) => { payload = route.request().postDataJSON(); return route.fulfill({ status: 200, json: envelope({ ...rental, rentalType: "hourly", totalPrice: 324000, depositPrice: 64800 }) }); });
  await page.goto("/booking"); await fillBooking(page);
  await expect(page.getByText("388.800 đ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("heading", { name: "Đã gửi yêu cầu đặt xe" })).toBeVisible();
  expect(payload).toEqual({ vehicleId: 8, policyId: 6, startTime: "2027-01-10T01:00:00.000Z", endTime: "2027-01-10T03:30:00.000Z", subscriptionId: null, hasDriver: false, paymentMethod: "payos" });
  await expect(page.getByText("Mã yêu cầu: #321")).toBeVisible();
  await page.route("**/api/invoices", (route) => route.fulfill({ json: envelope([{ id: 777, rentalId: 321, status: "unpaid" }]) }));
  await expect(page.getByText("Yêu cầu đang chờ nhân viên duyệt.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Tra cứu hóa đơn", exact: true }).click();
  await expect(page.getByRole("link", { name: "Xem hóa đơn", exact: true })).toHaveAttribute("href", "/invoices/777");
});

test("longterm booking calls the correct endpoint and opens its contract", async ({ page }) => {
  await page.route("**/api/rentals/longterm", (route) => route.fulfill({ json: envelope(rental) }));
  await page.goto("/booking?mode=longterm&vehicleId=8&facilityId=5");
  await chooseBranch(page);
  await expect(page.locator("#rentalType")).toHaveValue("longterm");
  await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
  await expect(page.locator("#hasDriver option")).toHaveCount(2);
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("link", { name: "Xem hợp đồng", exact: true })).toHaveAttribute("href", "/rental-contract?rentalId=321");
});

test("cash selection submits a request and waits for staff receipt without issuing an order", async ({ page }) => {
  let payload: Record<string, unknown> | undefined;
  await page.route("**/api/rentals/hourly", (route) => { payload = route.request().postDataJSON(); return route.fulfill({ json: envelope({ ...rental, rentalType: "hourly", orderId: null }) }); });
  await page.goto("/booking"); await fillBooking(page);
  await page.locator("#paymentMethod").selectOption("cash");
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("heading", { name: "Đã gửi yêu cầu đặt xe" })).toBeVisible();
  expect(payload?.paymentMethod).toBe("cash");
  await expect(page.getByText("Mã yêu cầu: #321")).toBeVisible();
  await expect(page.getByText("nhân viên xác nhận đã thu tiền để phát hành đơn thuê chính thức", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /Thanh toán.*PayOS/ })).toHaveCount(0);
});

test("vehicle cards show price and pickup, support keyboard selection and clear their inline error", async ({ page }) => {
  const second = { ...vehicle, id: 9, brand: "Honda", model: "City", priceHourly: 90000 };
  await page.route("**/api/vehicles/search?**", (route) => route.fulfill({ json: envelope({ items: [vehicle, second], totalCount: 2 }) }));
  await page.goto("/booking");
  await chooseBranch(page);
  const choices = page.getByRole("group", { name: "Phương tiện khả dụng" });
  await expect(choices.locator("select")).toHaveCount(0);
  await expect(choices.getByText("Nhận xe: Quận 1")).toHaveCount(2);
  await expect(choices.getByText("120.000 đ", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeFocused();
  await expect(page.locator("#vehicleId-error")).toBeVisible();
  await page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true }).check();
  await expect(page.locator("#vehicleId-error")).toHaveCount(0);
  await page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true }).press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Honda City", exact: true })).toBeChecked();
  await expect(page.getByText("Chưa chọn phương tiện", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Đơn giá: 90.000 đ / giờ", { exact: true })).toBeVisible();
  await page.locator("#rentalType").selectOption("longterm");
  await page.locator("#hasDriver").selectOption("false");
  await page.getByRole("radio", { name: "Honda City", exact: true }).check();
  await expect(choices.getByText("18.500.000 đ", { exact: false })).toHaveCount(2);
  await expect(page.getByRole("radio", { name: "Honda City", exact: true })).toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await choices.boundingBox();
  expect(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390).toBeTruthy();
});

test("date changes recheck availability and require another choice when the selected vehicle is unavailable", async ({ page }) => {
  await page.goto("/booking?vehicleId=8&facilityId=5");
  await chooseBranch(page);
  await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
  await page.route("**/api/vehicles/search?**", (route) => route.fulfill({ json: envelope({ items: [], totalCount: 0 }) }));
  await page.locator("#startTime").fill("2027-01-10T08:00");
  await page.locator("#endTime").fill("2027-01-10T10:00");
  await expect(page.getByText("Không có xe khả dụng. Vui lòng chọn khoảng thời gian khác.")).toBeVisible();
  await expect(page.getByText("Chưa chọn phương tiện", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.locator("#vehicleId-error")).toBeVisible();
});

test("shows all field errors and focuses the first without submitting", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/rentals/hourly", (route) => { calls += 1; return route.fulfill({ json: envelope(rental) }); });
  await page.goto("/booking");
  await chooseBranch(page);
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
  await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
  await page.route("**/api/rentals/hourly", (route) => route.abort("failed"));
  await page.locator("#endTime").fill("2027-01-10T11:00");
  await page.getByRole("button", { name: "Xác nhận đặt xe" }).click();
  await expect(page.getByText("Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Toyota Corolla Cross", exact: true })).toBeChecked();
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
  await page.route("**/api/rental/321/contract", (route) => route.fulfill({ status: 400, json: { errors: { "request.ContractLink": ["Đường dẫn hợp đồng không hợp lệ."] } } }));
  await page.getByRole("button", { name: "Lưu thông tin ký hợp đồng" }).click();
  await expect(page.locator("#contractLink-error")).toHaveText("Đường dẫn hợp đồng không hợp lệ.");
  await page.route("**/api/rental/321/contract", (route) => { payload = route.request().postDataJSON(); return route.fulfill({ json: envelope({ ...rental, contractLink: "https://example.com/contract.pdf", signedAt: "2027-01-10T01:00:00.000Z" }) }); });
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
