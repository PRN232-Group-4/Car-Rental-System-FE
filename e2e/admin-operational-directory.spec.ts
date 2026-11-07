import { expect, test } from "@playwright/test";

const profile = { email: "admin@example.test", fullName: "Quản trị viên", roles: ["Admin"], facilityId: 1, facilityName: "Chi nhánh Trung tâm" };
const vehicle = { id: 8, brand: "Hyundai", model: "Accent", licensePlate: "51F-010.02", status: "maintenance", facility: "Chi nhánh Trung tâm", maintenanceTechnicianEmails: ["tech@example.test"], detail: null };
const inspection = { id: 501, rentalId: 101, vehicleId: 8, vehicleName: "Hyundai Accent", licensePlate: vehicle.licensePlate, inspectionType: "pre_rental", isOk: true, inspectorEmail: "tech@example.test", inspectedAt: "2026-10-21T03:00:00Z", odometerKm: 34567, fuelBatteryLevel: 80, damageNotes: "Xước nhẹ bên trái", imageUrls: null };

function envelope(data: unknown, code = 200) {
  return { code, status: code < 400 ? "success" : "error", is_success: code < 400, data: code < 400 ? data : null, message: code < 400 ? "Thành công." : "Not Found", error: code < 400 ? null : { title: "Not Found", detail: "Not Found", status: code } };
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let data: unknown = { items: [], totalCount: 0, page: 1, pageSize: 20 };
    if (path.endsWith("/account/profile")) data = profile;
    else if (path.endsWith("/vehicles")) data = { items: [vehicle], totalCount: 1, page: 1, pageSize: 8 };
    else if (path.endsWith("/vehicle/8")) data = vehicle;
    else if (path.endsWith("/inspections")) {
      const type = url.searchParams.get("inspectionType");
      const all = [inspection, { ...inspection, id: 502, rentalId: 102, inspectionType: "post_rental", inspectorEmail: "post@example.test" }];
      const items = all.filter((item) => !type || item.inspectionType === type);
      data = { items, totalCount: items.length, page: 1, pageSize: 20 };
    } else if (path.endsWith("/rentals")) data = { items: [{ id: 101, vehicleId: 8, vehicleModel: "Hyundai Accent", licensePlate: vehicle.licensePlate, customerEmail: "customer@example.test", status: url.searchParams.get("status") || "pre_inspection" }], totalCount: 1, page: 1, pageSize: 10 };
    else if (path.endsWith("/rental/101")) data = { id: 101, vehicleId: 8, customerId: 1, status: "pre_inspection", rentalType: "hourly", isSubscription: false, vatPrice: 0, depositPrice: 1000000, totalPrice: 1000000, overtimePrice: 0, hasPassingPreInspection: false };
    else if (path.endsWith("/staff")) data = { items: [{ id: 9, userId: 29, email: "tech@example.test", staffRole: "Maintenance", isActive: true }], totalCount: 1, page: 1, pageSize: 100 };
    else if (path.endsWith("/inspection-assignment")) return route.fulfill({ status: 404, json: envelope(null, 404) });
    return route.fulfill({ json: envelope(data) });
  });
});

for (const width of [1600, 1280, 390]) {
  test(`inspection directory shows existing evidence and waiting rentals at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/admin/inspections");
    const table = page.getByRole("table", { name: "Toàn bộ biên bản kiểm tra", exact: true });
    await expect(table.getByText("tech@example.test")).toBeVisible();
    await expect(table.getByText("post@example.test")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mở kiểm tra đơn #101" })).toHaveAttribute("href", "/admin/inspections?rentalId=101#inspection-editor");
    await table.getByRole("button", { name: "Xem biên bản trước thuê đơn #101" }).click();
    const detail = page.getByRole("region", { name: "Chi tiết biên bản kiểm tra" });
    await expect(detail.getByText("34567")).toBeVisible();
    await expect(detail.getByText("Xước nhẹ bên trái")).toBeVisible();
    await expect(page.getByText("Mã đơn mẫu kiểm tra:")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/inspection-directory-${width}.png`, fullPage: true });
  });
}

test("maintenance vehicles display responsible technician email", async ({ page }) => {
  await page.goto("/admin/vehicles");
  await expect(page.getByText("tech@example.test").first()).toBeVisible();
  await expect(page.getByText("51F-010.02").first()).toBeVisible();
});

test("unlock persists after reloading the page from the backend", async ({ page }) => {
  let isActive = false;
  let statusWrites = 0;
  const account = () => ({ id: 202, email: "locked@example.test", fullName: "Người dùng bị khóa", roles: ["Customer"], phone: "0901234567", isActive, createdAt: "2026-01-01T00:00:00Z", customerId: 2, staffId: null });
  await page.route("**/api/users**", (route) => {
    const request = route.request();
    if (new URL(request.url()).pathname.endsWith("/202/status")) {
      const body = request.postDataJSON();
      expect(request.method()).toBe("PATCH");
      expect(body.isActive).toBe(true);
      expect(body.reason).toBeTruthy();
      statusWrites += 1;
      isActive = body.isActive;
      return route.fulfill({ json: envelope(account()) });
    }
    return route.fulfill({ json: envelope({ items: [account()], page: 1, pageSize: 100, totalCount: 1 }) });
  });
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "Mở khóa locked@example.test" }).click();
  await page.getByRole("button", { name: "Xác nhận mở khóa" }).click();
  await expect(page.getByRole("button", { name: "Khóa tài khoản locked@example.test" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Khóa tài khoản locked@example.test" })).toBeVisible();
  expect(statusWrites).toBe(1);
});

test("missing deployed assignment route displays the specific version problem", async ({ page }) => {
  await page.goto("/admin/rentals?rentalId=101");
  await expect(page.getByText("Backend đang kết nối chưa có API phân công kiểm tra. Cần cập nhật backend cùng phiên bản frontend rồi tải lại.")).toBeVisible();
  await expect(page.getByRole("region", {name:"Phân công kiểm tra trước thuê"}).getByRole("button", { name: "Xác nhận", exact:true })).toBeDisabled();
  await expect(page.getByText("Chưa phân công kỹ thuật viên kiểm tra.", { exact: true })).toHaveCount(0);
});
