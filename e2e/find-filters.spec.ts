import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/account/profile")) return route.fulfill({ status: 401, json: {} });
    const data = url.pathname.endsWith("/facilities")
      ? { items: [{ id: 3, name: "Chi nhánh Quận 1", city: "TP.HCM" }], totalCount: 1, page: 1, pageSize: 100 }
      : { items: [], totalCount: 0, page: Number(url.searchParams.get("page") || 1), pageSize: 9 };
    await route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "OK", error: null } });
  });
});

async function applied(page: Page, action: () => Promise<unknown>, expected: Record<string, string | null>) {
  const request = page.waitForRequest((req) => {
    const url = new URL(req.url());
    return url.pathname.endsWith("/vehicles/search") && Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value);
  });
  await action();
  await request;
  await expect(page.getByText("Không tìm thấy phương tiện phù hợp", { exact: true })).toBeVisible();
}

test("desktop controls send all criteria, preserve selections, clear chips and reset", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/find?page=2");
  const sidebar = page.locator("aside");
  await expect(sidebar.getByRole("option", { name: /Chi nhánh Quận 1/ })).toHaveCount(1);
  for (const [label, category] of [["Ô tô điện", "electric_car"], ["Xe máy điện", "electric_motorbike"], ["Xe máy xăng", "motorbike"], ["Ô tô xăng", "car"]]) {
    await applied(page, () => sidebar.getByRole("button", { name: label, exact: true }).click(), { category, page: "1" });
  }
  await applied(page, () => sidebar.getByRole("combobox", { name: "Chi nhánh giao nhận" }).selectOption("3"), { category: "car", facilityId: "3" });
  await applied(page, () => sidebar.getByRole("button", { name: "Toyota", exact: true }).click(), { brand: "Toyota", facilityId: "3" });
  await applied(page, () => sidebar.getByRole("button", { name: "5 chỗ", exact: true }).click(), { seatCount: "5", brand: "Toyota" });
  for (const value of ["automatic", "manual", "cvt"]) {
    await applied(page, () => sidebar.getByRole("combobox", { name: "Loại hộp số" }).selectOption(value), { transmission: value, seatCount: "5" });
  }
  for (const value of ["electric", "petrol"]) {
    await applied(page, () => sidebar.getByRole("combobox", { name: "Loại nhiên liệu" }).selectOption(value), { fuelType: value, transmission: "cvt" });
  }
  await applied(page, () => sidebar.getByRole("button", { name: "50.000đ – 150.000đ/h", exact: true }).click(), { minPrice: "50000", maxPrice: "150000" });
  await page.getByPlaceholder("Tìm theo tên xe, hãng xe, đời xe hoặc trạm...").fill("Toyota Corolla");
  await applied(page, () => page.getByRole("button", { name: "Tìm", exact: true }).click(), { q: "Toyota Corolla", brand: "Toyota" });
  for (const [value, sort] of [["price_desc", "price_desc"], ["year_desc", "newest"], ["name_asc", "name_asc"], ["price_asc", "price_asc"]]) {
    await applied(page, () => page.getByRole("combobox", { name: "Sắp xếp danh sách xe" }).selectOption(value), { sort, q: "Toyota Corolla" });
  }
  await applied(page, () => page.getByRole("button", { name: "Xóa bộ lọc Hãng: Toyota", exact: true }).click(), { brand: null, q: "Toyota Corolla" });
  await applied(page, () => sidebar.getByRole("button", { name: "Đặt lại", exact: true }).click(), { category: null, facilityId: null, seatCount: null, transmission: null, fuelType: null, minPrice: null, maxPrice: null, q: null });
  await expect(page).toHaveURL(/\/find$/);
});

test("home date/time links apply UTC availability and allow clearing the whole range", async ({ page }) => {
  const requested = page.waitForRequest((req) => new URL(req.url()).searchParams.get("from") === "2030-06-01T02:30:00.000Z");
  await page.goto("/find?startDate=2030-06-01&startTime=09:30&endDate=2030-06-01&endTime=11:00&brand=Toyota");
  const query = new URL((await requested).url()).searchParams;
  expect(query.get("to")).toBe("2030-06-01T04:00:00.000Z");
  await applied(page, () => page.getByRole("button", { name: /Xóa bộ lọc Lịch thuê:/ }).click(), { from: null, to: null, brand: "Toyota" });
  await expect(page).not.toHaveURL(/startDate|endDate/);
});

test("mobile drawer applies filters and resets them", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/find");
  await page.getByRole("button", { name: "Bộ lọc", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await applied(page, () => drawer.getByRole("button", { name: "Honda", exact: true }).click(), { brand: "Honda" });
  await applied(page, () => drawer.getByRole("combobox", { name: "Loại nhiên liệu" }).selectOption("petrol"), { brand: "Honda", fuelType: "petrol" });
  await drawer.getByRole("button", { name: "Xem kết quả", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByText("Hãng: Honda", { exact: true })).toBeVisible();
  await applied(page, () => page.getByRole("button", { name: "Xóa tất cả", exact: true }).click(), { brand: null, fuelType: null });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
