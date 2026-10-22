import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
for (const width of [1440, 390]) {
  for (const mode of ["cash", "cash-error", "online", "online-error", "invoice-error", "no-shortfall"] as const) {
    test(`overdue collection ${mode} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      let paid = false;
      let reserved = false;
      let invoiceError = mode === "invoice-error";
      let cashError = mode === "cash-error";
      const posts: string[] = [];
      const flat = { id: 111, vehicleId: 8, rentalType: "hourly", status: "completed", startTime: "2020-01-01T08:00:00Z", endTime: "2020-01-01T12:00:00Z", hasDriver: false, isSubscription: false, totalPrice: 500000, depositPrice: 100000, overtimePrice: 240000, hasPostInspection: true };
      await page.route("**/api/**", async route => {
        const path = new URL(route.request().url()).pathname;
        const failure = (message: string) => route.fulfill({ status: 503, json: { ...envelope(null), code: 503, status: "error", is_success: false, message, error: { detail: message } } });
        if (route.request().method() === "POST") {
          posts.push(path);
          if (path === "/api/invoices/99/cash-confirmation") {
            expect(route.request().postData()).toBeNull();
            if (cashError) return failure("Chưa ghi nhận tiền mặt. Vui lòng thử lại.");
            paid = true;
            return route.fulfill({ json: envelope({ paymentId: 20, invoiceId: 99, status: "paid", orderId: null }) });
          }
          if (path === "/api/invoices/99/staff-checkout") {
            reserved = true;
            if (mode === "online-error") return failure("Không thể tạo link PayOS. Vui lòng thử lại.");
            return route.fulfill({ json: envelope({ orderCode: 99, paymentLinkId: "test", checkoutUrl: "https://pay.payos.vn/web/test" }) });
          }
          return failure("Unexpected mutation");
        }
        if (path === "/api/invoices/99" && invoiceError) return failure("Không đọc được hóa đơn phụ phí.");
        const data = path.endsWith("/account/profile") ? { fullName: "Quản trị", email: "admin@test.local", roles: ["Admin"] } :
          path === "/api/rentals" ? { items: [flat], totalCount: 1, page: 1, pageSize: 30 } :
          path === "/api/rentals/111" ? flat :
          path === "/api/rentals/111/detail" ? { rental: { ...flat, scheduledStart: flat.startTime, scheduledEnd: flat.endTime, returnedAt: "2020-01-01T14:00:00Z" }, settlement: { returnedAt: "2020-01-01T14:00:00Z", overtimeHours: 2, overtimeMinutes: 120, overtimeAmount: 240000, overtimeVat: 24000, depositDeducted: 100000, shortfallInvoiceId: mode === "no-shortfall" ? null : 99 } } :
          path === "/api/invoices/99" ? { id: 99, rentalId: 111, invoiceNumber: "INV-OT-99", amount: 164000, vatAmount: 24000, kind: "overtime", status: paid ? "paid" : "unpaid", paymentMethod: paid && !reserved ? "cash" : "payos", canPay: !paid, canConfirmCash: !paid && !reserved, canCreateStaffCheckout: !paid } :
          path === "/api/vehicles/8" ? { id: 8, brand: "Toyota", model: "Vios" } : [];
        return route.fulfill({ json: envelope(data) });
      });
      await page.goto("/admin/rentals?rentalId=111");
      if (mode === "no-shortfall") {
        await expect(page.getByText("Không có hóa đơn phụ phí còn thiếu sau quyết toán.")).toBeVisible();
        await expect(page.getByRole("region", { name: "Thu phí quá hạn còn thiếu" })).toHaveCount(0);
        expect(posts).toEqual([]);
        return;
      }
      const panel = page.getByRole("region", { name: "Thu phí quá hạn còn thiếu" });
      if (invoiceError) {
        await expect(panel.getByRole("alert")).toContainText("Không đọc được hóa đơn phụ phí.");
        await expect(panel.getByRole("button", { name: "Xác nhận đã thu tiền mặt" })).toHaveCount(0);
        invoiceError = false;
        await panel.getByRole("button", { name: "Cập nhật trạng thái thu phí" }).click();
      }
      await expect(panel.getByText("164.000 đ", { exact: true })).toBeVisible();
      expect(posts).toEqual([]);
      const cash = panel.getByRole("button", { name: "Xác nhận đã thu tiền mặt", exact: true });
      if (mode === "cash" || mode === "cash-error") {
        await cash.click();
        const dialog = page.getByRole("dialog", { name: "Xác nhận thu tiền mặt phí quá hạn" });
        const confirm = dialog.getByRole("button", { name: "Xác nhận đã nhận đủ tiền" });
        await confirm.click();
        if (cashError) {
          await expect(dialog.getByRole("alert")).toContainText("Chưa ghi nhận tiền mặt.");
          await expect(panel.getByRole("status")).toHaveText("Chưa thanh toán phí quá hạn");
          cashError = false;
          await confirm.click();
        }
        await expect(dialog).toHaveCount(0);
        await expect(panel.getByRole("status")).toHaveText("Đã thu phí · Tiền mặt");
        expect(posts).toEqual(Array(mode === "cash-error" ? 2 : 1).fill("/api/invoices/99/cash-confirmation"));
      } else if (mode === "online" || mode === "online-error") {
        await panel.getByRole("button", { name: "Tạo link thanh toán online" }).click();
        await expect(cash).toBeDisabled();
        await expect(panel.getByRole("status")).toHaveText("Chưa thanh toán phí quá hạn");
        if (mode === "online-error") {
          await expect(panel.getByRole("alert")).toContainText("Không thể tạo link PayOS.");
          await expect(panel.getByRole("link", { name: "Mở link PayOS để thanh toán" })).toHaveCount(0);
        } else {
          await expect(panel.getByRole("link", { name: "Mở link PayOS để thanh toán" })).toHaveAttribute("href", "https://pay.payos.vn/web/test");
          paid = true; // Simulate the server reading a verified PayOS webhook, never a browser paid flag.
          await panel.getByRole("button", { name: "Cập nhật trạng thái thu phí" }).click();
          await expect(panel.getByRole("status")).toHaveText("Đã thu phí · Online qua PayOS");
        }
        expect(posts).toEqual(["/api/invoices/99/staff-checkout"]);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

test("overdue queue filters on the server and keeps the return action", async ({ page }) => {
  const statuses: (string | null)[] = [];
  const flat = { id: 111, vehicleId: 8, status: "renting", rentalType: "hourly", totalPrice: 100, endTime: "2020-01-01T12:00:00Z" };
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/rentals") statuses.push(url.searchParams.get("status"));
    const data = url.pathname.endsWith("/account/profile") ? { email: "admin@test.local", roles: ["Admin"] } :
      url.pathname === "/api/rentals" ? { items: [flat], totalCount: 1, page: 1, pageSize: 30 } :
      url.pathname === "/api/rentals/111" ? flat : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/admin/rentals?rentalId=111");
  await expect(page.locator('[data-status-tone="danger"]').filter({ hasText: "Quá hạn" }).first()).toBeVisible();
  await page.getByLabel("Lọc trạng thái hàng đợi").selectOption("overdue");
  await expect.poll(() => statuses.includes("overdue")).toBe(true);
  await expect(page.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true })).toBeEnabled();
});
