import { test, expect } from "@playwright/test";

const vehicle = { id: 10, brand: "Toyota", model: "Vios", licensePlate: "51A-12345", mainImageUrl: "/media/car.jpg", vehicleTypeId: 1, status: "available" };
const maintenance = [1, 2].map((id) => ({ id, vehicleId: 10, assignedStaffId: null, scheduledDate: "2026-10-20", status: "scheduled", cost: null }));

test.beforeEach(async ({ page }) => {
  // All API/media requests are isolated from the deployed services.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile") ? { fullName: "Quản trị viên", email: "admin@test.local", roles: ["Admin"] }
      : path.endsWith("/vehicles/10") ? vehicle
        : path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 }
          : path.endsWith("/maintenance") ? maintenance
            : path.endsWith("/rentals/70") ? { id: 70, vehicleId: 10, customerId: 1, status: "pending", rentalType: "hourly", totalPrice: 500000, startTime: "2026-10-20T02:00:00Z", endTime: "2026-10-20T08:00:00Z", hasDriver: false }
              : path.endsWith("/vehicle-types") ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
                : path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 } : [];
    return route.fulfill({ json });
  });
  await page.route("**/media/car.jpg", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#64748b"/></svg>' }));
});

test("vehicle table loads real photos and has stable missing/broken-image fallbacks", async ({ page }) => {
  await page.route("**/api/vehicles?*", (route) => route.fulfill({ json: { items: [vehicle, { ...vehicle, id: 11, brand: "Honda", model: "City", mainImageUrl: null }, { ...vehicle, id: 12, brand: "Kia", model: "K3", mainImageUrl: "/media/missing.jpg" }], totalCount: 3 } }));
  await page.route("**/media/missing.jpg", (route) => route.fulfill({ status: 404, body: "" }));
  await page.goto("/admin/vehicles");
  const table = page.getByRole("table");
  const image = table.getByRole("img", { name: "Toyota Vios", exact: true });
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(table.getByRole("img", { name: "Chưa có ảnh: Honda City", exact: true })).toBeVisible();
  await expect(table.getByRole("img", { name: "Không tải được ảnh: Kia K3", exact: true })).toBeVisible();
  for (const holder of await table.locator("[data-vehicle-image]").all()) {
    const bounds = await holder.boundingBox();
    expect(bounds?.width).toBe(68);
    expect(bounds?.height).toBe(48);
  }
});

test("maintenance shares vehicle lookup and replaces skeletons with thumbnails", async ({ page }) => {
  let lookups = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/vehicles/10", async (route) => { lookups += 1; await gate; await route.fulfill({ json: vehicle }); });
  await page.goto("/admin/maintenance");
  const table = page.getByRole("table");
  await expect(table.getByRole("status", { name: "Đang tải phương tiện", exact: true })).toHaveCount(2);
  release();
  const images = table.getByRole("img", { name: "Toyota Vios", exact: true });
  await expect(images).toHaveCount(2);
  for (const img of await images.all()) await expect.poll(() => img.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(lookups).toBe(1);
});

test("rental details and assignment both show the vehicle using one lookup", async ({ page }) => {
  let lookups = 0;
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/api/vehicles/10") lookups += 1; });
  await page.goto("/admin/rentals?rentalId=70");
  const images = page.getByRole("img", { name: "Toyota Vios", exact: true });
  await expect(images).toHaveCount(2);
  expect(lookups).toBe(1);
});

test("editing a vehicle refreshes its cached name and photo", async ({ page }) => {
  let current = { ...vehicle, yearOfManufacture: null, hourlyPrice: null, longtermPrice: null, detail: null };
  let lookups = 0;
  await page.route("**/api/vehicles?*", (route) => route.fulfill({ json: { items: [current], totalCount: 1 } }));
  await page.route("**/api/vehicles/10", (route) => {
    if (route.request().method() === "PUT") current = { ...current, ...route.request().postDataJSON() };
    else lookups += 1;
    return route.fulfill({ json: current });
  });
  await page.goto("/admin/vehicles");
  await page.getByRole("button", { name: "Chỉnh sửa Toyota Vios", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Chỉnh sửa phương tiện", exact: true });
  await dialog.locator('[name="model"]').fill("Camry");
  await dialog.getByRole("button", { name: "Xóa ảnh chính", exact: true }).click();
  await dialog.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const table = page.getByRole("table");
  await expect(table.getByRole("img", { name: "Chưa có ảnh: Toyota Camry", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Chỉnh sửa Toyota Camry", exact: true }).click();
  await expect(dialog.locator('[name="model"]')).toHaveValue("Camry");
  await expect(dialog.getByRole("button", { name: "Xóa ảnh chính", exact: true })).toHaveCount(0);
  expect(lookups).toBe(2);
});
