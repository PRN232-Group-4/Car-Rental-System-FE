import { expect, test, type Page } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const summary = { id: 42, orderId: null, status: "pending", rentalType: "hourly", isSubscription: false, vehicleBrand: "Toyota", vehicleModel: "Vios", startTime: "2026-10-20T08:00:00Z", endTime: "2026-10-20T12:00:00Z", totalPrice: 500000 };

async function mockCustomerRental(page: Page, facility: { id: number; name: string; phone: string | null } | null, driver: { fullName: string } | null = { fullName: "Tài xế thử nghiệm" }) {
  // Every backend call is intercepted; these tests never access real customer data.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile") ? { fullName: "Khách hàng", email: "customer@test.local", roles: ["Customer"] } :
      path.endsWith("/rental/mine/42") ? { id: 42, status: "pending", vehicle: { id: 8, brand: "Toyota", model: "Vios" }, facility, start: summary.startTime, end: summary.endTime, hasDriver: true, driver, timeline: [], invoice: null, nextAction: "WAITING_CONFIRMATION" } :
      path.endsWith("/rentals/mine") ? { items: [summary], totalCount: 1, page: 1, pageSize: 20 } : [];
    return route.fulfill({ json: envelope(data) });
  });
}

test("requested chauffeur service without assignment is explicitly unassigned", async ({ page }) => {
  await mockCustomerRental(page, null, null);
  await page.goto("/my-rentals?rentalId=42#rental-progress");
  await expect(page.locator("#rental-progress").getByText("Yêu cầu có tài xế · Chưa phân công", { exact: true })).toBeVisible();
  await expect(page.locator("#rental-progress").getByText("Có tài xế", { exact: true })).toHaveCount(0);
});

for (const width of [1440, 390]) {
  for (const facility of [{ id: 5, name: "Cơ sở Quận 1", phone: "0281234567" }, null]) {
    test(`direct progress link renders backend facility ${facility ? "object" : "null"} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await mockCustomerRental(page, facility);
      await page.goto("/my-rentals?rentalId=42#rental-progress");
      const detail = page.locator("#rental-progress");
      await expect(detail.getByRole("heading", { name: "Yêu cầu thuê #42" })).toBeVisible();
      await expect(detail.getByText(facility?.name ?? "Chưa có thông tin cơ sở", { exact: true })).toBeVisible();
      await expect(detail.getByText("Có tài xế · Tài xế thử nghiệm", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Tài khoản cá nhân", exact: true }).click();
      const menu = page.getByRole("menu");
      await menu.getByRole("menuitem", { name: "Theo dõi tiến trình thuê xe", exact: true }).click();
      await expect(page).toHaveURL(/\/my-rentals$/);
      await expect(menu).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }

  test(`landing customer account links to rental progress at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockCustomerRental(page, null);
    await page.goto("/");
    if (width < 640) await page.getByRole("button", { name: "Mở menu điều hướng" }).click();
    else await page.locator('[aria-controls="landing-account-menu"]').click();
    const link = page.getByRole("link", { name: "Theo dõi tiến trình thuê xe", exact: true });
    await expect(link).toHaveAttribute("href", "/my-rentals");
    await link.click();
    await expect(page).toHaveURL(/\/my-rentals$/);
    await expect(page.getByRole("link", { name: "Xem chi tiết yêu cầu 42" })).toBeVisible();
  });
}

test("customer opens own rental progress and refreshes actual status", async ({ page }) => {
  let status = "pending";
  const listRequests: URL[] = [];
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/account/profile")) return route.fulfill({ json: envelope({ fullName: "Khách hàng", email: "customer@test.local", roles: ["Customer"] }) });
    if (url.pathname.endsWith("/rentals/mine")) {
      listRequests.push(url);
      return route.fulfill({ json: envelope({ items: [summary], totalCount: 1, page: 1, pageSize: 20 }) });
    }
    if (url.pathname.endsWith("/rental/mine/42")) return route.fulfill({ json: envelope({ id: 42, orderId: status === "pending" ? null : 88, status, rentalType: "hourly", isSubscription: false, vehicle: { id: 8, brand: "Toyota", model: "Vios" }, facility: { id: 5, name: "Cơ sở Quận 1", phone: "0281234567" }, start: summary.startTime, end: summary.endTime, hasDriver: false, driver: null, price: { total: 500000 }, invoice: { id: 55, number: "INV-55", status: "unpaid", amount: 500000 }, timeline: [], nextAction: status === "pending" ? "WAITING_CONFIRMATION" : "PREPARING_VEHICLE" }) });
    return route.fulfill({ json: envelope([]) });
  });
  await page.goto("/my-rentals");
  await expect(page.getByRole("main").getByRole("heading", { name: "Đơn thuê của tôi" })).toBeVisible();
  await page.getByRole("link", { name: "Xem chi tiết yêu cầu 42" }).click();
  const detail = page.locator("#rental-progress");
  await expect(detail.getByRole("heading", { name: "Yêu cầu thuê #42" })).toBeVisible();
  await expect(detail.getByText("Cơ sở Quận 1", { exact: true })).toBeVisible();
  await expect(detail.locator('[aria-current="step"]')).toContainText("Chờ duyệt");
  await expect(detail.getByText("Yêu cầu đang chờ nhân viên duyệt.")).toBeVisible();
  status = "renting";
  await detail.getByRole("button", { name: "Cập nhật trạng thái" }).click();
  await expect(detail.getByRole("heading", { name: "Đơn thuê chính thức #88" })).toBeVisible();
  await expect(detail.locator('[aria-current="step"]')).toContainText("Đang thuê");
  await expect(detail.getByRole("link", { name: "Xem hóa đơn INV-55" })).toHaveAttribute("href", "/invoices/55");
  expect(listRequests[0].searchParams.get("pageSize")).toBe("20");
  expect(listRequests[0].searchParams.has("tab")).toBe(false);
});

test("cancelled customer rental has stopped progress and fits mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: envelope(path.endsWith("/account/profile") ? { email: "customer@test.local", roles: ["Customer"] } : { items: [{ ...summary, status: "cancelled" }], totalCount: 1, page: 1, pageSize: 20 }) });
  });
  await page.goto("/my-rentals");
  await expect(page.getByText("Yêu cầu / đơn thuê đã hủy. Tiến trình đã dừng.")).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("customer detail denial remains an error without fabricated progress", async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/rental/mine/1")) return route.fulfill({ status: 404, json: { ...envelope(null), code: 404, status: "error", is_success: false, message: "Không tìm thấy yêu cầu của bạn." } });
    return route.fulfill({ json: envelope(path.endsWith("/account/profile") ? { email: "customer@test.local", roles: ["Customer"] } : { items: [], totalCount: 0, page: 1, pageSize: 20 }) });
  });
  await page.goto("/my-rentals?rentalId=1");
  await expect(page.locator("#rental-progress").getByRole("alert")).toContainText("Không tìm thấy yêu cầu của bạn.");
  await expect(page.getByRole("region", { name: "Tiến trình thuê xe" })).toHaveCount(0);
});
