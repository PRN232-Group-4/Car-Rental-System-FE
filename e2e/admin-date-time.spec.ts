import { test, expect } from "@playwright/test";

test.use({ timezoneId: "Asia/Ho_Chi_Minh" });

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile")
      ? { email: "admin@test.local", fullName: "Quản trị viên", roles: ["Admin"] }
      : path.endsWith("/staff/drivers")
        ? { items: [{ id: 17, fullName: "Trần An" }], totalCount: 1 }
        : path.endsWith("/drivers/shifts")
          ? [{ id: 42, driverStaffId: 17, startTime: "2026-10-15T03:04:59Z", endTime: "2026-10-15T05:06:59Z", status: "active" }]
          : path.endsWith("/maintenance")
            ? [{ id: 3, vehicleId: 10, scheduledDate: "2026-10-20", status: "scheduled" }]
            : path.endsWith("/vehicles/10")
              ? { id: 10, brand: "Toyota", model: "Vios" }
              : [];
    return route.fulfill({ status: 200, json });
  });
});

test("dispatch displays minute-precision dates and keeps ISO values when editing", async ({ page }) => {
  await page.goto("/admin/dispatch");
  const table = page.getByRole("table", { name: "Danh sách ca làm tài xế", exact: true });
  await expect(table.getByRole("cell", { name: "15/10/2026 10:04", exact: true })).toBeVisible();
  await expect(table.getByRole("cell", { name: "15/10/2026 12:06", exact: true })).toBeVisible();
  await table.getByRole("button", { name: "Sửa / hủy ca", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cập nhật ca làm", exact: true });
  await expect(dialog.locator('input[name="startTime"]')).toHaveValue("2026-10-15T10:04");
  await expect(dialog.getByText("15/10/2026 10:04", { exact: true })).toBeVisible();
  const saved = page.waitForRequest((request) => request.method() === "PUT" && new URL(request.url()).pathname === "/api/drivers/shifts/42");
  await dialog.getByRole("button", { name: "Lưu ca làm", exact: true }).click();
  const request = await saved;
  expect(request.postDataJSON()).toMatchObject({ startTime: "2026-10-15T03:04:00.000Z", endTime: "2026-10-15T05:06:00.000Z" });
  await expect(dialog).toHaveCount(0);
});

test("maintenance formats calendar dates without changing saved dates", async ({ page }) => {
  await page.goto("/admin/maintenance");
  const table = page.getByRole("table", { name: "Danh sách phiếu bảo trì", exact: true });
  await expect(table.getByRole("cell", { name: "20/10/2026", exact: true })).toBeVisible();
  await table.getByRole("button", { name: "Cập nhật", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cập nhật phiếu bảo trì", exact: true });
  await expect(dialog.locator('input[name="scheduledDate"]')).toHaveValue("2026-10-20");
  const saved = page.waitForRequest((request) => request.method() === "PUT" && new URL(request.url()).pathname === "/api/maintenance/3");
  await dialog.getByRole("button", { name: "Lưu phiếu bảo trì", exact: true }).click();
  expect((await saved).postDataJSON()).toMatchObject({ scheduledDate: "2026-10-20" });
  await expect(dialog).toHaveCount(0);
});
