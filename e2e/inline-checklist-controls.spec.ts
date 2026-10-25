import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

for (const width of [1600, 1280, 390]) {
  for (const theme of ["light", "dark"]) {
    test(`inspection and payment work inside checklist at ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(value => localStorage.setItem("vrs-admin-theme", value), theme);
      let inspected = false;
      let paid = false;
      let assigned = false;
      let assignments = 0;
      let receipts = 0;
      const rental = () => ({ id: 111, vehicleId: 8, invoiceId: 55, rentalType: "hourly", status: "pre_inspection", totalPrice: 100000, depositPrice: 10000, hasDriver: false, isSubscription: false, hasPassingPreInspection: inspected, endTime: "2027-01-01T10:00:00Z" });
      const assignment = () => assigned ? { rentalId: 111, vehicleId: 8, technicianStaffId: 12, technicianEmail: "tech@example.test", assignedAt: "2026-10-23T03:00:00Z" } : null;
      await page.route("**/api/**", async route => {
        const path = new URL(route.request().url()).pathname;
        const method = route.request().method();
        if (method === "PUT" && path === "/api/rental/111/inspection-assignment") {
          expect(route.request().postDataJSON()).toEqual({ technicianStaffId: 12 });
          assigned = true;
          assignments++;
          return route.fulfill({ json: envelope(assignment()) });
        }
        if (method === "POST" && path === "/api/invoice/55/cash-confirmation") {
          paid = true;
          receipts++;
          return route.fulfill({ json: envelope({ paymentId: 30, invoiceId: 55, status: "paid", orderId: 88 }) });
        }
        expect(method).toBe("GET");
        const data = path.endsWith("/account/profile") ? { email: "manager@example.test", fullName: "Quản lý", roles: ["Manager"] }
          : path === "/api/rental/111" ? rental()
          : path === "/api/rentals" ? { items: [rental()], totalCount: 1, page: 1, pageSize: 20 }
          : path === "/api/rental/111/detail" ? { rental: { ...rental(), scheduledEnd: rental().endTime }, invoice: { id: 55 }, settlement: null }
          : path === "/api/invoice/55" ? { id: 55, rentalId: 111, invoiceNumber: "INV-55", amount: 100000, status: paid ? "paid" : "unpaid", paymentMethod: "cash", kind: "rental", canPay: !paid, orderId: paid ? 88 : null }
          : path === "/api/rental/111/inspection-assignment" ? assignment()
          : path === "/api/staff" ? { items: [{ id: 12, email: "tech@example.test", isActive: true, roles: ["Maintenance"] }], totalCount: 1, page: 1, pageSize: 100 }
          : path === "/api/vehicle/8" ? { id: 8, vehicleTypeId: 1, brand: "Toyota", model: "Vios", allowedLicenseTypes: ["B"] }
          : { items: [], totalCount: 0, page: 1, pageSize: 20 };
        return route.fulfill({ json: envelope(data) });
      });
      await page.goto("/admin/rentals?rentalId=111");
      const checklist = page.getByRole("group", { name: "Điều kiện chuyển bước" });
      const inspection = checklist.locator('[data-workflow-condition="inspection"]');
      const payment = checklist.locator('[data-workflow-condition="payment"]');
      await expect(inspection.getByRole("heading", { name: "Kỹ thuật viên kiểm tra trước thuê", exact: true })).toBeVisible();
      await expect(payment.getByRole("heading", { name: "Thanh toán đơn thuê", exact: true })).toBeVisible();
      await expect(inspection.getByRole("combobox", { name: "Kỹ thuật viên phụ trách", exact: true })).toBeEnabled();
      expect(await page.locator("form form").count()).toBe(0);
      await checklist.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/inline-checklist-${width}-${theme}.png` });
      await inspection.getByRole("combobox", { name: "Kỹ thuật viên phụ trách", exact: true }).selectOption("12");
      await inspection.getByRole("button", { name: "Xác nhận", exact: true }).click();
      await expect(inspection.locator("strong")).toHaveText("tech@example.test");
      expect(assignments).toBe(1);
      await expect(inspection.getByRole("checkbox")).not.toBeChecked();
      await payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Xác nhận đã nhận đủ tiền", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(payment.getByRole("checkbox")).toBeChecked();
      expect(receipts).toBe(1);
      await checklist.getByRole("checkbox", { name: "Đã đối chiếu hồ sơ khách và bàn giao xe, chìa khóa", exact: true }).check();
      const handover = page.getByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến", exact: true });
      await expect(handover).toBeDisabled();
      inspected = true;
      await page.getByText("Hướng dẫn kiểm tra", { exact: true }).click();
      await page.getByRole("button", { name: "Tải lại kết quả kiểm tra", exact: true }).click();
      await expect(inspection.getByRole("checkbox")).toBeChecked();
      await expect(handover).toBeEnabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
