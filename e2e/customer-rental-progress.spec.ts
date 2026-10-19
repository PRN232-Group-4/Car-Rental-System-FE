import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const summary = { id: 42, orderId: null, status: "pending", rentalType: "hourly", isSubscription: false, vehicleBrand: "Toyota", vehicleModel: "Vios", startTime: "2026-10-20T08:00:00Z", endTime: "2026-10-20T12:00:00Z", totalPrice: 500000 };

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
    if (url.pathname.endsWith("/rentals/mine/42")) return route.fulfill({ json: envelope({ id: 42, orderId: status === "pending" ? null : 88, status, rentalType: "hourly", isSubscription: false, vehicle: { id: 8, brand: "Toyota", model: "Vios" }, facility: "Cơ sở Quận 1", start: summary.startTime, end: summary.endTime, hasDriver: false, driver: null, price: { total: 500000 }, invoice: { id: 55, number: "INV-55", status: "unpaid", amount: 500000 }, timeline: [], nextAction: status === "pending" ? "WAITING_CONFIRMATION" : "PREPARING_VEHICLE" }) });
    return route.fulfill({ json: envelope([]) });
  });
  await page.goto("/my-rentals");
  await expect(page.getByRole("main").getByRole("heading", { name: "Đơn thuê của tôi" })).toBeVisible();
  await page.getByRole("link", { name: "Xem chi tiết yêu cầu 42" }).click();
  const detail = page.locator("#rental-progress");
  await expect(detail.getByRole("heading", { name: "Yêu cầu thuê #42" })).toBeVisible();
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
    if (path.endsWith("/rentals/mine/1")) return route.fulfill({ status: 404, json: { ...envelope(null), code: 404, status: "error", is_success: false, message: "Không tìm thấy yêu cầu của bạn." } });
    return route.fulfill({ json: envelope(path.endsWith("/account/profile") ? { email: "customer@test.local", roles: ["Customer"] } : { items: [], totalCount: 0, page: 1, pageSize: 20 }) });
  });
  await page.goto("/my-rentals?rentalId=1");
  await expect(page.locator("#rental-progress").getByRole("alert")).toContainText("Không tìm thấy yêu cầu của bạn.");
  await expect(page.getByRole("region", { name: "Tiến trình thuê xe" })).toHaveCount(0);
});
