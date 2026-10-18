import { test, expect, type Locator } from "@playwright/test";

const profile = { email: "admin@test.local", fullName: "Gia Linh", roles: ["Admin"], avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" };
const vehicle = { id: 10, brand: "Toyota", model: "Vios", licensePlate: "51A-12345", vehicleTypeId: 1, status: "available" };
const maintenance = [3, 2].map((id) => ({ id, vehicleId: 10, assignedStaffId: null, scheduledDate: "2026-10-20", status: "scheduled", cost: null }));

test.beforeEach(async ({ page }) => {
  // No API calls in this suite reach the production backend.
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile") ? profile
      : path.endsWith("/vehicles/10") ? vehicle
        : path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 }
          : path.endsWith("/maintenance") ? maintenance
            : path.endsWith("/vehicle-types") ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
              : path.endsWith("/staff") || path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 }
                : [];
    return route.fulfill({ status: 200, json });
  });
});

test("Admin loads account images in header, sidebar, mobile menu and profile", async ({ page }) => {
  await page.goto("/admin/profile");
  const images = page.getByRole("img", { name: "Ảnh đại diện Gia Linh", exact: true });
  await expect(images).toHaveCount(3);
  for (const img of await images.all()) {
    await expect.poll(() => img.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  const mobile = page.locator("#admin-mobile-navigation");
  await expect(mobile.getByRole("img", { name: "Ảnh đại diện Gia Linh", exact: true })).toBeVisible();
});

test("a broken avatar falls back to initials", async ({ page }) => {
  await page.route("**/api/account/profile", (route) => route.fulfill({ json: { ...profile, avatarUrl: "/missing-admin-avatar.png" } }));
  await page.route("**/missing-admin-avatar.png", (route) => route.fulfill({ status: 404, body: "" }));
  await page.goto("/admin/vehicles");
  const headerAvatar = page.locator("header").getByRole("link", { name: "Hồ sơ nhân viên", exact: true });
  await expect(headerAvatar).toHaveText("GL");
  await expect(headerAvatar.getByRole("img")).toHaveCount(0);
});

test("maintenance renders vehicle names and shares lookups between records", async ({ page }) => {
  let lookups = 0;
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/api/vehicles/10") lookups += 1; });
  await page.goto("/admin/maintenance");
  const table = page.getByRole("table", { name: "Danh sách phiếu bảo trì", exact: true });
  await expect(table.getByText("Toyota Vios", { exact: true })).toHaveCount(2);
  await expect(table.getByText("51A-12345", { exact: true })).toHaveCount(2);
  await expect(table.getByRole("cell", { name: "#10", exact: true })).toHaveCount(0);
  expect(lookups).toBe(1);
  await page.screenshot({ path: "test-results/admin-maintenance-names.png", fullPage: true });
});

test("vehicle lookup failure keeps maintenance records usable and can retry", async ({ page }) => {
  await page.route("**/api/vehicles/10", (route) => route.fulfill({ status: 500, json: { title: "Vehicle lookup failed" } }));
  await page.goto("/admin/maintenance");
  const table = page.getByRole("table", { name: "Danh sách phiếu bảo trì", exact: true });
  await expect(table.getByRole("button", { name: "Cập nhật", exact: true })).toHaveCount(2);
  await expect(table.getByText("Không tải được tên xe", { exact: false })).toHaveCount(2);
  await page.route("**/api/vehicles/10", (route) => route.fulfill({ json: vehicle }));
  await table.getByRole("button", { name: "Tải lại tên xe", exact: true }).first().click();
  await expect(table.getByText("Toyota Vios", { exact: true })).toHaveCount(2);
});

async function tableStyle(table: Locator) {
  return table.evaluate((element) => {
    const head = getComputedStyle(element.querySelector("thead")!);
    const cell = getComputedStyle(element.querySelector("th")!);
    const card = getComputedStyle(element.closest("section")!);
    return {
      headBackground: head.backgroundColor, headColor: head.color, headSize: head.fontSize,
      headWeight: head.fontWeight, headTransform: head.textTransform,
      cellPadding: cell.padding, cardBorder: card.border, cardRadius: card.borderRadius,
      cardShadow: card.boxShadow, scroll: getComputedStyle(element.parentElement!).overflowX,
    };
  });
}

test("all Admin list tables use the vehicle table presentation", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/admin/vehicles");
  await expect(page.getByRole("table")).toBeVisible();
  const reference = await tableStyle(page.getByRole("table"));
  for (const route of ["vehicle-types", "policies", "subscription-plans", "departments", "facilities", "staffs", "roles", "maintenance", "dispatch"]) {
    await page.goto(`/admin/${route}`);
    await expect(page.getByRole("table").first()).toBeVisible();
    for (const table of await page.getByRole("table").all()) expect(await tableStyle(table), route).toEqual(reference);
  }
});

test("vehicles hide IDs, display license plates and edit in a popup", async ({ page }) => {
  await page.goto("/admin/vehicles");
  const table = page.getByRole("table");
  await expect(table.getByText("51A-12345", { exact: true })).toBeVisible();
  await expect(table).not.toContainText(/\bID\b|#\d+/);
  await table.getByRole("button", { name: "Chỉnh sửa Toyota Vios", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Chỉnh sửa phương tiện", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[name="brand"]')).toHaveValue("Toyota");
  await expect(page).toHaveURL(/\/admin\/vehicles$/);
  await page.keyboard.press("Escape");
  await page.getByPlaceholder("Tìm theo tên, biển số hoặc chi nhánh...").fill("51A-12345");
  await expect(table.getByText("Toyota Vios", { exact: true })).toBeVisible();
});

test("maintenance hides record IDs, resolves employee names and saves the original record", async ({ page }) => {
  await page.route("**/api/maintenance*", (route) => route.fulfill({ json: [{ ...maintenance[0], id: 9301, assignedStaffId: 17 }] }));
  await page.route("**/api/staff/17", (route) => route.fulfill({ json: { id: 17, fullName: "Trần An", email: "an@test.local" } }));
  await page.goto("/admin/maintenance");
  const table = page.getByRole("table");
  await expect(table.getByText("Trần An", { exact: true })).toBeVisible();
  await expect(table.getByRole("columnheader", { name: "Phiếu", exact: true })).toHaveCount(0);
  await expect(table).not.toContainText(/\bID\b|#\d+/);
  await table.getByRole("button", { name: "Cập nhật", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cập nhật phiếu bảo trì", exact: true });
  await expect(dialog).toBeVisible();
  const saved = page.waitForRequest((request) => request.method() === "PUT" && new URL(request.url()).pathname === "/api/maintenance/9301");
  await dialog.getByRole("button", { name: "Lưu phiếu bảo trì", exact: true }).click();
  await saved;
  await expect(dialog).toHaveCount(0);
});

test("dispatch hides shift and rental IDs while keeping edit and rental actions", async ({ page }) => {
  const startTime = new Date(Date.now() + 86400000).toISOString();
  const endTime = new Date(Date.now() + 90000000).toISOString();
  await page.route("**/api/staff/drivers*", (route) => route.fulfill({ json: { items: [{ id: 17, fullName: "Trần An" }], totalCount: 1 } }));
  await page.route("**/api/drivers/shifts*", (route) => route.fulfill({ json: [{ id: 9401, driverStaffId: 17, startTime, endTime, status: "active" }] }));
  await page.route("**/api/drivers/schedule*", (route) => route.fulfill({ json: [{ assignmentId: 9601, rentalId: 9501, vehicleId: 10, driverStaffId: 17, startTime, endTime, rentalStatus: "renting" }] }));
  await page.goto("/admin/dispatch");
  const shifts = page.getByRole("table", { name: "Danh sách ca làm tài xế", exact: true });
  const trips = page.getByRole("table", { name: "Lịch chuyến được phân cho tài xế", exact: true });
  await expect(shifts.getByText("Trần An", { exact: true })).toBeVisible();
  await expect(trips.getByText("Toyota Vios", { exact: true })).toBeVisible();
  await expect(shifts).not.toContainText(/\bID\b|#\d+/);
  await expect(trips).not.toContainText(/\bID\b|#\d+/);
  await expect(shifts.getByRole("columnheader", { name: "Ca", exact: true })).toHaveCount(0);
  await expect(trips.getByRole("link", { name: "Mở đơn thuê", exact: true })).toHaveAttribute("href", "/admin/rentals?rentalId=9501");
  await shifts.getByRole("button", { name: "Sửa / hủy ca", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cập nhật ca làm", exact: true });
  const saved = page.waitForRequest((request) => request.method() === "PUT" && new URL(request.url()).pathname === "/api/drivers/shifts/9401");
  await dialog.getByRole("button", { name: "Lưu ca làm", exact: true }).click();
  await saved;
  await expect(dialog).toHaveCount(0);
});

test("missing employee names do not fall back to raw IDs", async ({ page }) => {
  await page.route("**/api/staff?*", (route) => route.fulfill({ json: { items: [{ id: 4261, fullName: "", email: null }], totalCount: 1 } }));
  await page.goto("/admin/staffs");
  const table = page.getByRole("table");
  await expect(table.getByText("Chưa có tên nhân viên", { exact: true })).toBeVisible();
  await expect(table).not.toContainText(/4261|\bID\b|#\d+/);
});
