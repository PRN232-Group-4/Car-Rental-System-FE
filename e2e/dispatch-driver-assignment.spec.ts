import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

const scenarios = [1600, 1280, 390].flatMap(width => ["light", "dark"].map(theme => ({ width, theme, role: "Admin" })));
scenarios.push({ width: 390, theme: "light", role: "CustomerService" });
for (const { width, theme, role } of scenarios) {
  test(`assigns a driver to the selected rental vehicle while shifts are paused (${width}px, ${theme}, ${role})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.addInitScript(theme => localStorage.setItem("vrs-admin-theme", theme), theme);
    let assignments = 0;
    let shiftWrites = 0;
    let managementReads = 0;
    const rental = { id: 101, orderId: 201, customerId: 12, vehicleId: 5, rentalType: "hourly", status: "pre_inspection", hasDriver: true, totalPrice: 100000, isSubscription: false, hasPassingPreInspection: true, startTime: "2027-01-01T02:00:00Z", endTime: "2027-01-01T05:00:00Z" };
    await page.route("**/api/**", async route => {
      const path = new URL(route.request().url()).pathname;
      let data: unknown = { items: [], page: 1, pageSize: 100, totalCount: 0 };
      if (path.endsWith("/account/profile")) data = { email: "admin@test.local", roles: [role] };
      else if (path.endsWith("/staff/drivers")) { managementReads++; data = { items: [{ id: 7, email: "driver@example.com", fullName: "Tài xế hợp lệ", isDriver: true, isActive: true }], page: 1, pageSize: 100, totalCount: 1 }; }
      else if (path.endsWith("/rentals/101/assignable-drivers")) data = [{ staffId: 7, fullName: "Tài xế hợp lệ", eligible: true, reasons: [] }, { staffId: 8, fullName: "Tài xế đang bận", eligible: false, reasons: ["BUSY"] }];
      else if (path.endsWith("/rentals/101/assignments/driver")) {
        expect(route.request().method()).toBe("POST");
        expect(route.request().postDataJSON()).toMatchObject({ driverStaffId: 7, reason: "other" });
        assignments++;
        if (assignments === 1) return route.fulfill({ status: 409, json: { ...envelope(null), code: 409, status: "error", is_success: false, message: "Tài xế vừa được phân cho chuyến khác. Vui lòng chọn lại.", error: { detail: "Tài xế vừa được phân cho chuyến khác. Vui lòng chọn lại." } } });
        data = { id: 3, rentalId: 101, vehicleId: 5, driverStaffId: 7, status: "assigned" };
      } else if (path.endsWith("/drivers/shifts")) {
        managementReads++;
        if (route.request().method() !== "GET") shiftWrites++;
        data = [{ id: 44, driverStaffId: 7, startTime: "2027-01-01T02:00:00Z", endTime: "2027-01-01T05:00:00Z", status: "scheduled" }];
      } else if (path.endsWith("/drivers/schedule")) { managementReads++; data = []; }
      else if (path.endsWith("/rentals/101")) data = rental;
      else if (path.endsWith("/vehicles/5")) data = { id: 5, brand: "Toyota", model: "Vios", licensePlate: "51A-12345" };
      return route.fulfill({ json: envelope(data) });
    });
    await page.goto("/admin/dispatch?rentalId=101");
    await expect(page.getByRole("button", { name: "Tạo ca làm", exact: true })).toBeDisabled();
    if (role === "Admin") await expect(page.getByRole("button", { name: "Sửa / hủy ca", exact: true })).toBeDisabled();
    else await expect(page.getByRole("table", { name: "Danh sách ca làm tài xế" })).toHaveCount(0);
    const assignment = page.getByRole("region", { name: "Phân công tài xế theo đơn thuê" });
    const select = assignment.getByLabel("Tài xế nhận lệnh", { exact: true });
    await expect(select.getByRole("option", { name: role === "Admin" ? "driver@example.com" : "Tài xế hợp lệ", exact: true })).toBeEnabled();
    await expect(select.getByRole("option", { name: /Tài xế đang bận/ })).toBeDisabled();
    await assignment.getByRole("button", { name: "Lưu phân công", exact: true }).click();
    await expect(assignment.getByText("Vui lòng chọn tài xế cho đơn thuê có tài xế.")).toBeVisible();
    expect(assignments).toBe(0);
    await select.selectOption("7");
    await assignment.getByRole("button", { name: "Lưu phân công", exact: true }).click();
    await expect(assignment.getByRole("alert").filter({ hasText: "Tài xế vừa được phân cho chuyến khác" })).toBeVisible();
    await expect(select).toHaveValue("7");
    await expect(assignment.getByText("Đã lưu phân công tài xế cho xe của đơn thuê.", { exact: true })).toHaveCount(0);
    await assignment.getByRole("button", { name: "Lưu phân công", exact: true }).click();
    await expect(assignment.getByText("Đã lưu phân công tài xế cho xe của đơn thuê.", { exact: true })).toBeVisible();
    expect(assignments).toBe(2);
    expect(shiftWrites).toBe(0);
    if (role === "CustomerService") expect(managementReads).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.validation/ui/driver-assignment-${width}-${theme}-${role}.png`, fullPage: true });
  });
}
