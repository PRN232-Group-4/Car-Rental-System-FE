import { expect, test, type Page } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

async function mockApi(page: Page, role: string) {
  let status = "renting";
  let transitions = 0;
  const rental = () => ({ id: 111, vehicleId: 8, rentalType: "hourly", status, totalPrice: 100000, depositPrice: 10000, hasDriver: false, isSubscription: false, hasPassingPreInspection: true, hasPostInspection: false, endTime: "2027-01-01T10:00:00Z" });
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET") {
      expect(path).toBe("/api/rental/111/return");
      transitions++;
      status = "post_inspection";
      return route.fulfill({ json: envelope({ rentalId: 111, toStatus: status }) });
    }
    const data = path.endsWith("/account/profile") ? { email: "operator@example.test", fullName: "Nhân sự kiểm thử", roles: [role] }
      : path === "/api/payments" ? [{ id: 30, rentalId: 111, invoiceId: 55, type: "rental", status: "paid", amount: 100000, method: "cash", createdAt: "2026-10-23T03:00:00Z", paidAt: "2026-10-23T03:00:00Z" }]
      : path === "/api/vehicle-types" ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
      : path === "/api/facilities" ? [{ id: 2, name: "Thủ Đức" }]
      : path === "/api/vehicle/8" ? { id: 8, vehicleTypeId: 1, brand: "Toyota", model: "Vios", facilityId: 2, status: "available", allowedLicenseTypes: ["B", "B2"], detail: {} }
      : path === "/api/rental/111" ? rental()
      : path === "/api/rental/111/detail" ? { rental: { ...rental(), scheduledEnd: rental().endTime }, settlement: null }
      : path === "/api/rentals" ? { items: [rental()], totalCount: 1, page: 1, pageSize: 20 }
      : path.endsWith("/inspection-assignment") ? null : { items: [], totalCount: 0, page: 1, pageSize: 20 };
    return route.fulfill({ json: envelope(data) });
  });
  return () => transitions;
}

for (const width of [1600, 1280, 390]) {
  test(`license, payments and checklist fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const transitions = await mockApi(page, "Manager");
    await page.goto("/admin/vehicles/edit?id=8");
    const license = page.getByRole("group", { name: "Hạng bằng lái được phép thuê" });
    await expect(license.getByRole("checkbox")).toHaveCount(26);
    await expect(license.getByRole("checkbox", { name: "Chấp nhận hạng B2", exact: true })).toBeChecked();
    await license.getByRole("checkbox", { name: "Chấp nhận hạng C1", exact: true }).check();
    await expect(license.getByRole("list", { name: "Các hạng bằng đã chọn" }).getByText("Hạng C1", { exact: true })).toBeVisible();
    await license.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/license-config-${width}.png` });

    await page.goto("/admin/payments");
    await expect(page.getByRole("table").getByText("GD-30")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Các route thuộc nhóm Vận hành", exact: true }).getByRole("link", { name: "Thanh toán đơn thuê", exact: true })).toBeVisible();
    await expect(page.getByText(/chức năng khả dụng/i)).toHaveCount(0);
    await page.getByLabel("Trạng thái", { exact: true }).selectOption("pending");
    await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
    await expect(page.getByRole("table")).toContainText("Không có giao dịch phù hợp");
    await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
    await expect(page.getByRole("table").getByText("GD-30")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/order-payments-${width}.png` });

    await page.goto("/admin/rentals?rentalId=111");
    const commands = page.getByRole("complementary", { name: "Bảng lệnh điều phối" });
    const receive = commands.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true });
    await expect(receive).toBeDisabled();
    await commands.getByRole("checkbox", { name: "Đã nhận lại xe và chìa khóa từ khách", exact: true }).check();
    await expect(receive).toBeDisabled();
    await commands.getByRole("checkbox", { name: "Đã đối chiếu thời điểm trả và hiện trạng xe", exact: true }).check();
    await expect(receive).toBeEnabled();
    await commands.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/rental-checklist-${width}.png` });
    await receive.click();
    await expect(commands.getByRole("button", { name: "Quyết toán & Hoàn tất hợp đồng", exact: true })).toBeDisabled();
    expect(transitions()).toBe(1);

    await page.goto("/admin/rentals?rentalId=111");
    const settlement = page.getByRole("complementary", { name: "Bảng lệnh điều phối" });
    await expect(settlement.getByRole("checkbox", { name: /Đã có biên bản kiểm tra sau thuê/ })).toBeDisabled();
    await settlement.getByRole("checkbox", { name: "Đã đối soát phụ phí và nghĩa vụ thanh toán trong hồ sơ", exact: true }).check();
    await expect(settlement.getByRole("button", { name: "Quyết toán & Hoàn tất hợp đồng", exact: true })).toBeDisabled();
    await settlement.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/rental-settlement-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("Admin can find the payment ledger and Staff cannot access it", async ({ page }) => {
  await mockApi(page, "Admin");
  await page.goto("/admin/payments");
  await expect(page.getByRole("table").getByText("GD-30")).toBeVisible();
  await page.getByRole("button", { name: "Tìm chức năng (Ctrl+K)", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: /Thanh toán đơn thuê/ })).toBeVisible();
  await expect(dialog.getByText(/chức năng khả dụng/i)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.route("**/api/account/profile", route => route.fulfill({ json: envelope({ email: "staff@example.test", roles: ["Staff"] }) }));
  await page.reload();
  await expect(page.getByRole("table").getByText("GD-30")).toHaveCount(0);
});
