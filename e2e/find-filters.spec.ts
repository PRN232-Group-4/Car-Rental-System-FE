import { expect, test } from "@playwright/test";

const fleet = [
  { id: 1, brand: "Toyota", model: "Corolla Cross", vehicleType: "Ô tô 5 chỗ", status: "available", hourlyPrice: 120000, longtermPrice: 18000000, facilityId: 5, facility: "Chi nhánh Quận 1", seatCount: 5, transmission: "Tự động (CVT)" },
  { id: 2, brand: "VinFast", model: "VF 8 Plus", vehicleType: "Ô tô điện", status: "available", hourlyPrice: 250000, longtermPrice: 30000000, facilityId: 5, facility: "Chi nhánh Quận 1", seatCount: 5, transmission: "Tự động" },
  { id: 3, brand: "Honda", model: "SH 160i", vehicleType: "Xe máy xăng", status: "available", hourlyPrice: 60000, longtermPrice: 3000000, facilityId: 6, facility: "Chi nhánh Gò Vấp", transmission: "Số sàn" },
  { id: 4, brand: "VinFast", model: "Feliz S", vehicleType: "Xe máy điện", status: "available", hourlyPrice: 50000, longtermPrice: 2500000, facilityId: 6, facility: "Chi nhánh Gò Vấp", transmission: "Tự động" },
];

test.beforeEach(async ({ page }) => {
  await page.route(/api\.mapbox\.com|events\.mapbox\.com/, (route) => route.abort());
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    // The production API only honours vehicleTypeId/facilityId/status/from/to; any other filter must narrow client-side.
    let data: unknown = [];
    if (path.endsWith("/account/profile")) data = null;
    else if (path.endsWith("/vehicles")) {
      const rows = fleet.filter((row) => !url.searchParams.get("facilityId") || String(row.facilityId) === url.searchParams.get("facilityId"));
      data = { items: rows, page: 1, pageSize: 100, totalCount: rows.length };
    } else if (path.endsWith("/facilities")) data = [];
    return route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "OK", error: null } });
  });
});

const names = (page: import("@playwright/test").Page) => page.getByTestId("vehicle-grid").locator("article");

test("category tab narrows the catalog to electric cars only", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/find", { waitUntil: "domcontentloaded" });
  await expect(names(page)).toHaveCount(4);
  await expect(page.getByText("Tìm thấy 4 xe")).toBeVisible();
  await page.locator("main").getByRole("button", { name: "Ô tô điện", exact: true }).first().click();
  await expect(page).toHaveURL(/category=electric_car/);
  await expect(names(page)).toHaveCount(1);
  await expect(page.getByTestId("vehicle-grid")).toContainText("VF 8 Plus");
});

test("search and price filters apply to the whole fleet, not just the first page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/find", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("vehicle-grid")).toBeVisible();
  const searchBox = page.getByPlaceholder("Tìm theo tên xe, hãng xe, đời xe hoặc trạm...");
  await searchBox.fill("VinFast");
  await page.locator("main").getByRole("button", { name: "Tìm", exact: true }).last().click();
  await expect(page).toHaveURL(/search=VinFast/);
  await expect(names(page)).toHaveCount(2);
  await expect(page.getByText("Tìm thấy 2 xe")).toBeVisible();
});

test("branch filter keeps only vehicles of that facility", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/find", { waitUntil: "domcontentloaded" });
  await page.goto("/find?facilityId=6", { waitUntil: "domcontentloaded" });
  await expect(names(page)).toHaveCount(2);
  await expect(page.getByTestId("vehicle-grid")).toContainText("SH 160i");
  await expect(page.getByTestId("vehicle-grid")).toContainText("Feliz S");
});
