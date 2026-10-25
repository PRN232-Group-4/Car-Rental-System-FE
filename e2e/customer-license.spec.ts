import { test, expect } from "@playwright/test";

const customers = Array.from({ length: 101 }, (_, index) => ({ id: index + 1, userId: index + 501, fullName: `Khách ${index + 1}`, email: `customer${index + 1}@test.local`, phone: "0901234567", isActive: true, licenseStatus: index === 100 ? "pending" : "approved" }));
const license = { number: "790123456789", type: "B2", issueDate: "2024-01-01", expiryDate: "2034-01-01", imageUrl: null, status: "pending" };
const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

test.beforeEach(async ({ page }) => {
  // Block every backend request; these tests must never approve a real license.
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    let data: unknown = [];
    if (url.pathname.endsWith("/account/profile")) data = { email: "admin@test.local", fullName: "Admin", roles: ["Admin"], staffId: null, facilityId: null };
    else if (url.pathname === "/api/customers") {
      const search = url.searchParams.get("Search");
      const records = search ? customers.filter((customer) => customer.email.includes(search)) : customers;
      const pageNumber = Number(url.searchParams.get("Page") ?? 1);
      data = { items: records.slice((pageNumber - 1) * 100, pageNumber * 100), totalCount: records.length, page: pageNumber, pageSize: 100 };
    } else if (/\/customer\/\d+$/.test(url.pathname)) {
      const id = Number(url.pathname.split("/").at(-1));
      data = { ...customers.find((customer) => customer.id === id), license };
    } else if (route.request().method() !== "GET") return route.fulfill({ status: 400, json: { detail: "Unexpected test mutation" } });
    return route.fulfill({ status: 200, json: envelope(data) });
  });
});

test("filters all backend pages, resets filters and submits a confirmed customer review", async ({ page }) => {
  await page.goto("/admin/vehicle-license");
  await expect(page.getByText("101 khách hàng", { exact: true })).toBeVisible();
  const menu = page.locator('nav[aria-label="Điều hướng nhân viên"]');
  const links = await menu.getByRole("link").allTextContents();
  expect(links.indexOf("Duyệt giấy phép lái xe")).toBe(links.indexOf("Quản lý bảo trì") + 1);
  await page.locator("#license-filter-status").selectOption("pending");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await expect(page.getByText("1 khách hàng", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Khách 101", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(page.getByText("101 khách hàng", { exact: true })).toBeVisible();
  await page.locator("#license-filter-search").fill("customer101@");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await expect(page.getByText("1 khách hàng", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xem và duyệt GPLX của Khách 101" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("790123456789", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Lưu trạng thái", exact: true }).click();
  await expect(dialog.locator("#license-review-status")).toBeFocused();
  await expect(dialog.locator("#license-review-status-error")).toBeVisible();
  await expect(dialog.locator("#license-review-confirm-error")).toBeVisible();
  await dialog.locator("#license-review-status").selectOption("approved");
  await expect(dialog.locator("#license-review-confirm-error")).toBeVisible();
  await dialog.locator("#license-review-confirm").check();
  await page.route("**/api/customer/101/license-status", (route) => route.fulfill({ status: 400, json: { is_success: false, error: { errors: { "request.Status": ["Vui lòng kiểm tra lại kết quả duyệt."] } } } }));
  await dialog.getByRole("button", { name: "Lưu trạng thái", exact: true }).click();
  await expect(dialog.locator("#license-review-status-error")).toHaveText("Vui lòng kiểm tra lại kết quả duyệt.");
  await expect(dialog.locator("#license-review-confirm")).toBeChecked();
  await page.route("**/api/customer/101/license-status", (route) => { expect(route.request().postDataJSON()).toEqual({ status: "rejected" }); return route.fulfill({ json: envelope({ ...license, status: "rejected" }) }); });
  await dialog.locator("#license-review-status").selectOption("rejected");
  await dialog.getByRole("button", { name: "Lưu trạng thái", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Đã cập nhật trạng thái GPLX" })).toBeVisible();
});

test("mobile dialog keeps values after network failure and fits the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin/vehicle-license");
  await page.locator("#license-filter-status").selectOption("pending");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await page.getByRole("button", { name: "Xem và duyệt GPLX của Khách 101" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("#license-review-status").selectOption("approved");
  await dialog.locator("#license-review-confirm").check();
  await page.route("**/api/customer/101/license-status", (route) => route.abort("failed"));
  await dialog.getByRole("button", { name: "Lưu trạng thái", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Không thể kết nối máy chủ");
  await expect(dialog.locator("#license-review-status")).toHaveValue("approved");
  await expect(dialog.locator("#license-review-confirm")).toBeChecked();
  const bounds = await dialog.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(375 - 32);
  expect(bounds!.height).toBeLessThanOrEqual(812 * 0.9 + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
