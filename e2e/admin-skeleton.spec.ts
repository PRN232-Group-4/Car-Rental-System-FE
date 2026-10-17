import { test, expect } from "@playwright/test";

const vehicle = { id: 10, vehicleTypeId: 1, brand: "Toyota", model: "Vios", licensePlate: "51A-12345", status: "available" };

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile") ? { email: "admin@test.local", fullName: "Quản trị viên", roles: ["Admin"] }
      : path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 }
        : path.endsWith("/vehicles/10") ? vehicle
          : path.endsWith("/vehicle-types") ? [{ id: 1, name: "Ô tô xăng", type: "car", fuelType: "gasoline" }]
            : [];
    return route.fulfill({ status: 200, json });
  });
});

test("catalog preserves headings, announces loading, then shows the true empty state", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/vehicle-types", async (route) => { await gate; await route.fulfill({ json: [] }); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/vehicle-types");
  const table = page.getByRole("table");
  await expect(table).toHaveAttribute("aria-busy", "true");
  await expect(table.locator("[data-skeleton-row]")).toHaveCount(5);
  await expect(table.getByRole("status")).toHaveText("Đang tải danh sách...");
  await expect(table).not.toContainText("Không có dữ liệu.");
  const animation = await table.locator("[data-skeleton]").first().evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
  release();
  await expect(table).toHaveAttribute("aria-busy", "false");
  await expect(table.locator("[data-skeleton-row]")).toHaveCount(0);
  await expect(table).toContainText("Không có dữ liệu.");
});

test("directory skeleton clears on API error instead of loading forever", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/departments", async (route) => { await gate; await route.fulfill({ status: 500, json: { title: "Không thể tải phòng ban." } }); });
  await page.goto("/admin/departments");
  const table = page.getByRole("table");
  await expect(table.locator("[data-skeleton-row]")).toHaveCount(5);
  release();
  await expect(table).toHaveAttribute("aria-busy", "false");
  await expect(table.locator("[data-skeleton-row]")).toHaveCount(0);
});

test("vehicle editing shows a form skeleton until its saved values arrive", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/vehicles/10", async (route) => { await gate; await route.fulfill({ json: vehicle }); });
  await page.goto("/admin/vehicles");
  await page.getByRole("button", { name: "Chỉnh sửa Toyota Vios", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Chỉnh sửa phương tiện", exact: true });
  await expect(dialog.getByRole("status", { name: "Đang tải thông tin phương tiện...", exact: true })).toBeVisible();
  await expect(dialog.locator('input[name="brand"]')).toHaveCount(0);
  release();
  await expect(dialog.locator('input[name="brand"]')).toHaveValue("Toyota");
  await expect(dialog.locator("[data-skeleton-block]")).toHaveCount(0);
});
