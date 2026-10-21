import { expect, test } from "@playwright/test";

const statuses = ["pending", "pre_inspection", "renting", "post_inspection", "completed", "cancelled"];
const rentals = Array.from({ length: 23 }, (_, index) => ({
  id: index + 201, orderId: index % 2 ? index + 501 : null,
  customerId: index + 1, customerName: `Khách thuê ${index + 1}`, customerEmail: `rental${index + 1}@test.local`,
  vehicleId: 8, vehicleModel: "Vios", licensePlate: "51A-12345", status: statuses[index % statuses.length],
  startTime: "2026-10-18T03:00:00Z", endTime: "2026-10-18T09:00:00Z", totalPrice: 1000000,
  hasDriver: index % 2 === 1, driverName: index % 2 === 1 ? "Tài xế An" : null,
}));

test("staff approval refreshes both selected progress and table status", async ({ page }) => {
  let approved = false;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/rentals/201/confirm")) {
      approved = true;
      return route.fulfill({ json: { rentalId: 201, toStatus: "pre_inspection" } });
    }
    if (path.endsWith("/rentals/201")) return route.fulfill({ json: { ...rentals[0], status: approved ? "pre_inspection" : "pending", rentalType: "hourly", isSubscription: false } });
    if (path.endsWith("/rentals")) return route.fulfill({ json: { items: [{ ...rentals[0], status: approved ? "pre_inspection" : "pending" }], page: 1, pageSize: 20, totalCount: 1 } });
    return route.fallback();
  });
  await page.goto("/admin/rentals?rentalId=201");
  await page.locator("#rental-next-status").selectOption("pre_inspection");
  await page.getByRole("button", { name: "Xác nhận cập nhật trạng thái" }).click();
  await expect(page.getByRole("table").getByText("Kiểm tra trước thuê", { exact: true })).toBeVisible();
  await expect(page.locator('#rental-detail [aria-current="step"]')).toContainText("Chuẩn bị xe");
});

test("failed admin detail never falls back to fabricated sample rental", async ({ page }) => {
  await page.route("**/api/rentals/1", (route) => route.fulfill({ status: 404, json: { message: "Không tìm thấy yêu cầu thuê." } }));
  await page.goto("/admin/rentals?rentalId=1");
  await expect(page.locator("#rental-detail").getByRole("alert")).toContainText("Không tìm thấy yêu cầu thuê.");
  await expect(page.locator("#rental-detail").getByRole("region", { name: "Tiến trình thuê xe" })).toHaveCount(0);
});

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path.endsWith("/rentals")) {
      const status = url.searchParams.get("status");
      const filtered = rentals.filter((rental) => !status || rental.status === status);
      const page = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
      return route.fulfill({ json: { items: filtered.slice((page - 1) * pageSize, page * pageSize), totalCount: filtered.length, page, pageSize } });
    }
    const id = Number(path.match(/\/rentals\/(\d+)$/)?.[1]);
    const rental = rentals.find((rental) => rental.id === id);
    const data = path.endsWith("/account/profile") ? { fullName: "Admin", email: "admin@test.local", roles: ["Admin"] }
      : rental ? { ...rental, rentalType: "hourly", isSubscription: false }
      : path.endsWith("/vehicles/8") ? { id: 8, brand: "Toyota", model: "Vios", licensePlate: "51A-12345" }
      : path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 } : [];
    return route.fulfill({ json: data });
  });
});

test("loads every rental status by default and paginates server results", async ({ page }) => {
  const initial = page.waitForRequest((request) => new URL(request.url()).pathname.endsWith("/api/rentals"));
  await page.goto("/admin/rentals");
  const request = await initial;
  expect(new URL(request.url()).searchParams.has("status")).toBe(false);
  await expect(page.getByText("23 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
  await expect(page.getByRole("table").getByText("Đã hủy", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("table").getByText("Đơn thuê chính thức", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("table").getByText("Yêu cầu đặt xe", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Trang sau", exact: true }).click();
  await expect(page.getByText("Trang 2 / 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell").getByText("Khách thuê 23", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Xem chi tiết đơn thuê của Khách thuê 23", exact: true })).toHaveAttribute("href", "/admin/rentals?rentalId=223#rental-detail");
});

test("applies status filter and resets pagination and filters", async ({ page }) => {
  await page.goto("/admin/rentals");
  await expect(page.getByText("23 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Trang sau", exact: true }).click();
  await expect(page.getByText("Trang 2 / 2", { exact: true })).toBeVisible();
  await page.getByLabel("Trạng thái đơn thuê", { exact: true }).selectOption("cancelled");
  await expect(page.getByText("23 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await expect(page.getByText("3 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
  await expect(page.getByText("Trang 1 / 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(page.getByLabel("Trạng thái đơn thuê", { exact: true })).toHaveValue("");
  await expect(page.getByText("23 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
});

test("view icon opens selected detail and can switch between rentals", async ({ page }) => {
  await page.goto("/admin/rentals");
  await page.getByRole("link", { name: "Xem chi tiết đơn thuê của Khách thuê 1", exact: true }).click();
  await expect(page.locator("#rental-detail").getByRole("heading", { name: "Yêu cầu thuê #201", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Xem chi tiết đơn thuê của Khách thuê 2", exact: true }).click();
  await expect(page.locator("#rental-detail").getByRole("heading", { name: "Đơn thuê chính thức #502", exact: true })).toBeVisible();
  await expect(page.locator("#rental-detail").getByRole("heading", { name: "Yêu cầu thuê #201", exact: true })).toHaveCount(0);
  await expect(page.locator("#rental-next-status")).toBeVisible();
});

test("shows a retryable failure instead of a false empty result", async ({ page }) => {
  let fail = true;
  await page.route("**/api/rentals?*", (route) => route.fulfill(fail
    ? { status: 500, json: { message: "Failed" } }
    : { json: { items: [], totalCount: 0, page: 1, pageSize: 20 } }));
  await page.goto("/admin/rentals");
  await expect(page.locator("p[role=alert]")).toContainText("Không thể tải danh sách đơn thuê");
  await expect(page.getByText("Không có đơn thuê phù hợp.", { exact: false })).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByText("Không có đơn thuê phù hợp.", { exact: false })).toBeVisible();
});

test("keeps filters and table within the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/rentals");
  await expect(page.getByText("23 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const select = await page.getByLabel("Trạng thái đơn thuê", { exact: true }).boundingBox();
  expect(select!.height).toBe(44);
  expect(select!.x + select!.width).toBeLessThanOrEqual(390);
  const scroller = page.getByRole("table").locator("..");
  expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test("maps API status filter errors inline and clears errors when edited", async ({ page }) => {
  await page.goto("/admin/rentals");
  await expect(page.getByText("23 yêu cầu / đơn thuê", { exact: true })).toBeVisible();
  await page.route("**/api/rentals?*", (route) => route.fulfill({ status: 400, json: { errors: { Status: ["Vui lòng chọn lại trạng thái đơn thuê."] } } }));
  const status = page.getByLabel("Trạng thái đơn thuê", { exact: true });
  await status.selectOption("pending");
  await page.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await expect(status).toHaveAttribute("aria-invalid", "true");
  await expect(status).toBeFocused();
  await expect(page.getByText("Vui lòng chọn lại trạng thái đơn thuê.", { exact: true })).toBeVisible();
  await status.selectOption("completed");
  await expect(status).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByText("Vui lòng chọn lại trạng thái đơn thuê.", { exact: true })).toHaveCount(0);
});
