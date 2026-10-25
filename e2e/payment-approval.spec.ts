import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const invoice = { id: 55, rentalId: 42, invoiceNumber: "INV-55", amount: 3000000, vatAmount: 100000, status: "unpaid", issuedAt: "2026-10-18T08:00:00Z", dueAt: null };

test("customer waits for staff approval before payment becomes available", async ({ page }) => {
  let approved = false;
  let checkouts = 0;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/invoice/55/checkout")) {
      checkouts++;
      return route.fulfill({ status: 409, json: { ...envelope(null), code: 409, status: "error", is_success: false, message: "Đơn đã thay đổi. Vui lòng tải lại hóa đơn." } });
    }
    const data = path.endsWith("/account/profile") ? { fullName: "Customer", email: "customer@test.local", roles: ["Customer"] }
      : path.endsWith("/invoice/55") ? { ...invoice, canPay: approved, paymentBlockedReason: approved ? null : "RENTAL_CONFIRMATION_REQUIRED" }
      : path.endsWith("/invoices") ? [invoice] : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/invoices/55");
  await expect(page.getByText("Đơn thuê đang chờ nhân viên xác nhận.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thanh toán ngay qua PayOS" })).toHaveCount(0);
  expect(checkouts).toBe(0);
  approved = true;
  await expect(page.getByRole("button", { name: "Thanh toán ngay qua PayOS" })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Thanh toán ngay qua PayOS" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Đơn đã thay đổi");
  expect(checkouts).toBe(1);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("staff confirms an unpaid rental through the confirmation endpoint", async ({ page }) => {
  let status = "pending";
  let confirmations = 0;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/rental/42/confirm")) {
      confirmations++;
      status = "pre_inspection";
      return route.fulfill({ json: envelope({ rentalId: 42, fromStatus: "pending", toStatus: status }) });
    }
    const data = path.endsWith("/account/profile") ? { fullName: "Admin", email: "admin@test.local", roles: ["Admin"] }
      : path.endsWith("/rental/42") ? { id: 42, vehicleId: 8, customerId: 3, status, rentalType: "hourly", hasDriver: false, isSubscription: false, totalPrice: 3000000 }
      : path.endsWith("/vehicle/8") ? { id: 8, brand: "Toyota", model: "Vios" }
      : path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/admin/rentals?rentalId=42");
  await page.locator("#rental-next-status").selectOption("pre_inspection");
  await page.getByRole("button", { name: "Xác nhận cập nhật trạng thái" }).click();
  await expect(page.getByText("Đã duyệt yêu cầu thuê. Khách hàng có thể thanh toán hóa đơn.")).toBeVisible();
  expect(confirmations).toBe(1);
});

test("cancelled invoices never show checkout", async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: envelope(path.endsWith("/account/profile") ? { fullName: "Customer", email: "customer@test.local", roles: ["Customer"] } : { ...invoice, status: "cancelled", canPay: false, paymentBlockedReason: "INVOICE_NOT_PAYABLE" }) });
  });
  await page.goto("/invoices/55");
  await expect(page.getByText("Hóa đơn chưa thể thanh toán")).toBeVisible();
  await expect(page.getByRole("button", { name: "Thanh toán ngay qua PayOS" })).toHaveCount(0);
});

test("customer cash invoice stays unpaid until staff records receipt and issues order", async ({ page }) => {
  let paid = false;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: envelope(path.endsWith("/account/profile") ? { fullName: "Customer", email: "customer@test.local", roles: ["Customer"] } : { ...invoice, paymentMethod: "cash", canPay: !paid, status: paid ? "paid" : "unpaid", orderId: paid ? 88 : null }) });
  });
  await page.goto("/invoices/55");
  await expect(page.getByText("Chờ xác nhận thu tiền mặt")).toBeVisible();
  await expect(page.getByRole("button", { name: "Thanh toán ngay qua PayOS" })).toHaveCount(0);
  paid = true;
  await expect(page.getByText("Đã thanh toán · Đơn thuê chính thức #88")).toBeVisible({ timeout: 10000 });
});

test("staff cash receipt issues an official order only after explicit confirmation", async ({ page }) => {
  let paid = false;
  let receipts = 0;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/invoice/55/cash-confirmation")) { paid = true; receipts++; return route.fulfill({ json: envelope({ paymentId: 3, invoiceId: 55, status: "paid", orderId: 88 }) }); }
    const data = path.endsWith("/account/profile") ? { fullName: "Admin", email: "admin@test.local", roles: ["Admin"] }
      : path.endsWith("/rental/42") ? { id: 42, vehicleId: 8, customerId: 3, status: "pre_inspection", rentalType: "hourly", isSubscription: false, totalPrice: 3000000, orderId: paid ? 88 : null }
      : path.endsWith("/invoices") ? [invoice]
      : path.endsWith("/invoice/55") ? { ...invoice, status: paid ? "paid" : "unpaid", paymentMethod: "cash", canPay: !paid, orderId: paid ? 88 : null }
      : path.endsWith("/vehicle/8") ? { id: 8, brand: "Toyota", model: "Vios" }
      : path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/admin/rentals?rentalId=42");
  await expect(page.getByRole("heading", { name: "Yêu cầu thuê #42", exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Xác nhận đã thu tiền mặt" }).click();
  expect(receipts).toBe(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Xác nhận đã thu tiền mặt" }).click();
  await expect(page.getByText("Đã thu tiền mặt và phát hành đơn thuê chính thức #88.")).toBeVisible();
  expect(receipts).toBe(1);
  await expect(page.getByRole("heading", { name: "Đơn thuê chính thức #88", exact: true })).toBeVisible();
});

test("PayOS return parameters do not imply paid or create a formal order", async ({ page }) => {
  let paid = false;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: envelope(path.endsWith("/account/profile") ? { fullName: "Customer", email: "customer@test.local", roles: ["Customer"] } : { ...invoice, status: paid ? "paid" : "unpaid", orderId: paid ? 88 : null }) });
  });
  await page.goto("/payment/result?orderCode=55&status=PAID");
  await expect(page.getByRole("heading", { name: "Đang đối soát giao dịch..." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thanh toán thành công!" })).toHaveCount(0);
  paid = true;
  await expect(page.getByRole("heading", { name: "Thanh toán thành công!" })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Mã đơn thuê chính thức:")).toBeVisible();
  await expect(page.getByText("#88", { exact: true })).toBeVisible();
});
