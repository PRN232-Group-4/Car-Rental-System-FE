import { expect, test } from "@playwright/test";
const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
for (const width of [1440, 390]) {
  test(`official order visible after payment and reload at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    let paid = false;
    let writes = 0;
    const rental = () => ({ id: 115, orderId: paid ? 731 : null, invoiceId: 55, vehicleId: 8, customerId: 1, customerName: "Khách thử", customerEmail: "customer@test.local", rentalType: "hourly", hasDriver: false, status: "pre_inspection", isSubscription: false, hasPassingPreInspection: true, totalPrice: 780000, endTime: "2027-01-10T10:00:00Z" });
    const invoice = () => ({ id: 55, rentalId: 115, orderId: paid ? 731 : null, invoiceNumber: "INV-115", amount: 780000, kind: "rental", status: paid ? "paid" : "unpaid", paymentMethod: "cash", canPay: !paid });
    await page.route("**/api/**", async route => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() === "POST") {
        expect(path).toBe("/api/invoices/55/cash-confirmation");
        paid = true; writes++;
        return route.fulfill({ json: envelope({ invoiceId: 55, orderId: 731, status: "paid" }) });
      }
      const data = path.endsWith("/account/profile") ? { email: "admin@test.local", roles: ["Admin", "Staff"] } :
        path === "/api/rentals/115" ? rental() :
        path === "/api/rentals" ? { items: [rental()], page: 1, pageSize: 20, totalCount: 1 } :
        path === "/api/invoices/55" ? invoice() :
        path === "/api/vehicles/8" ? { id: 8, model: "Vios", brand: "Toyota" } :
        path === "/api/rentals/115/detail" ? { rental: rental(), orderId: rental().orderId, invoice: invoice() } :
        path === "/api/handovers/115" ? { rental: { rental: rental(), orderId: rental().orderId, hasPassingPreInspection: true }, status: "pending" } :
        { items: [], totalCount: 0 };
      return route.fulfill({ json: envelope(data) });
    });
    await page.goto("/admin/rentals?rentalId=115");
    const dossier = page.getByRole("main", { name: "Hồ sơ chi tiết đơn thuê" });
    await expect(dossier.getByRole("definition").filter({ hasText: "#115" })).toBeVisible();
    await expect(dossier.getByText("Chưa phát hành", { exact: true })).toBeVisible();
    expect(await dossier.textContent()).not.toContain("#731");
    const payment = page.getByRole("region", { name: "Thanh toán đơn thuê" });
    await payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Xác nhận đã nhận đủ tiền" }).click();
    await expect(dossier.getByRole("definition").filter({ hasText: "#731" })).toBeVisible();
    await expect(payment.getByRole("definition").filter({ hasText: "#731" })).toBeVisible();
    expect(writes).toBe(1);
    await page.reload();
    await expect(dossier.getByRole("definition").filter({ hasText: "#731" })).toBeVisible();
    await dossier.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/official-order-${width}.png` });
    await page.getByRole("link", { name: "Danh sách, sửa yêu cầu và thanh toán", exact: true }).click();
    const table = page.getByRole("table", { name: "Danh sách yêu cầu và đơn thuê" });
    await expect(table.getByRole("columnheader", { name: "Mã hồ sơ" })).toBeVisible();
    await expect(table.getByRole("definition").filter({ hasText: "#731" })).toBeVisible();
    await expect(table.getByRole("definition").filter({ hasText: "#115" })).toBeVisible();
    await page.goto("/admin/handovers?rentalId=115");
    await expect(page.getByRole("definition").filter({ hasText: "#731" }).last()).toBeVisible();
    expect(writes).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
