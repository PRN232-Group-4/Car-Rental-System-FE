import { test, expect, type Page } from "@playwright/test";

const vehicle = { id: 10, brand: "Toyota", model: "Vios", licensePlate: "51A-12345", vehicleTypeId: 1, status: "available" };
const staff = { id: 3, fullName: "Nguyễn An", email: "an@test.local", phone: "0900000001", staffRole: "Driver", isActive: true };

async function mockApi(page: Page, roles = ["Admin"]) {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile") ? { email: "admin@test.local", fullName: "Gia Linh", roles }
      : path.endsWith("/vehicle/10") ? vehicle
        : path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 }
          : path.endsWith("/vehicle-types") ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
            : path.endsWith("/departments") ? [{ id: 1, name: "Vận hành" }]
              : path.endsWith("/facilities") ? [{ id: 1, name: "Chi nhánh trung tâm", address: "Quận 1" }]
                : path.endsWith("/staff") || path.endsWith("/staff/drivers") ? { items: [staff], totalCount: 1 }
                  : path.endsWith("/subscription-plans") ? [{ id: 1, name: "Gói linh hoạt", price: 500000, durationDays: 30, includedHours: 5, isActive: true }]
                    : path.endsWith("/maintenance") ? [{ id: 1, vehicleId: 10, assignedStaffId: null, scheduledDate: "2026-10-20", status: "scheduled", cost: null }]
                      : path.endsWith("/drivers/shifts") ? [{ id: 1, driverStaffId: 3, startTime: "2026-10-20T01:00:00Z", endTime: "2026-10-20T09:00:00Z", status: "scheduled" }]
                        : path.endsWith("/drivers/schedule") ? [{ assignmentId: 1, rentalId: 7, driverStaffId: 3, vehicleId: 10, startTime: "2026-10-20T01:00:00Z", endTime: "2026-10-20T09:00:00Z", rentalStatus: "pending" }]
                          : [];
    return route.fulfill({ status: 200, json });
  });
}

for (const width of [1440, 390]) {
  test(`list actions use accessible icon controls at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    await mockApi(page);
    for (const route of ["vehicles", "vehicle-types", "subscription-plans", "departments", "facilities", "staffs", "maintenance", "dispatch"]) {
      await page.goto(`/admin/${route}`);
      const actions = page.locator("td[data-actions] button, td[data-actions] a");
      await expect(actions.first(), route).toBeAttached();
      for (const action of await actions.all()) {
        await expect(action).toHaveText("");
        const label = await action.getAttribute("aria-label");
        expect(label, route).toBeTruthy();
        await expect(action).toHaveAttribute("title", label!);
        await expect(action.locator("svg[aria-hidden=true]")).toHaveCount(1);
        const size = await action.boundingBox();
        expect(size?.width).toBeGreaterThanOrEqual(32);
        expect(size?.height).toBeGreaterThanOrEqual(32);
        await action.focus();
        await expect(action).toBeFocused();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
    }
    await expect(page.locator('td[data-actions] a')).toHaveAttribute("href", "/admin/rentals?rentalId=7");
    await expect(page.locator('td[data-actions] a svg')).toHaveClass(/lucide-eye/);
  });

  test(`icon edit, deletion and navigation preserve behavior at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockApi(page);
    await page.goto("/admin/vehicles");
    const edit = page.getByRole("button", { name: "Chỉnh sửa Toyota Vios", exact: true });
    await edit.scrollIntoViewIfNeeded();
    await edit.click();
    await expect(page.getByRole("dialog", { name: "Chỉnh sửa phương tiện" })).toBeVisible();
    await page.getByRole("button", { name: "Đóng biểu mẫu", exact: true }).click();
    await expect(edit).toBeFocused();

    let finishDelete!: () => void;
    const deletePending = new Promise<void>((resolve) => { finishDelete = resolve; });
    let removed = false;
    await page.route("**/api/vehicle/10", async (route) => {
      if (route.request().method() !== "DELETE") return route.fallback();
      removed = true;
      await deletePending;
      await route.fulfill({ status: 204 });
    });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Xóa xe Toyota Vios (51A-12345)", exact: true }).click();
    await expect.poll(() => removed).toBe(true);
    await expect(page.getByRole("button", { name: "Xóa xe Toyota Vios (51A-12345)", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Xóa xe Toyota Vios (51A-12345)", exact: true })).toHaveAttribute("aria-busy", "true");
    finishDelete();
    await expect(page.getByRole("button", { name: "Xóa xe Toyota Vios (51A-12345)", exact: true })).toBeEnabled();
    await page.goto("/admin/dispatch");
    const view = page.getByRole("link", { name: "Mở đơn thuê", exact: true });
    await view.scrollIntoViewIfNeeded();
    await view.click();
    await expect(page).toHaveURL(/\/admin\/rentals\?rentalId=7$/);
  });
}

test("manager keeps edit access and cannot see admin-only delete actions", async ({ page }) => {
  await mockApi(page, ["Manager"]);
  await page.goto("/admin/vehicle-types");
  await expect(page.getByRole("button", { name: "Sửa Ô tô", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Xóa Ô tô", exact: true })).toHaveCount(0);
});
