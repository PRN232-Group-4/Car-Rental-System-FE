import { test, expect } from "@playwright/test";

test.describe("Smoke Tests — Hệ Thống Thuê Xe Thong Dong", () => {
  test("1. Trang chủ tải thành công và hiển thị các thành phần cốt lõi", async ({ page }) => {
    await page.goto("/");

    // Kiểm tra title trang
    await expect(page).toHaveTitle(/Thong Dong/i);

    // Kiểm tra Navbar và thương hiệu
    const brand = page.locator("header").getByRole("link", { name: /ThongDong/i }).first();
    await expect(brand).toBeVisible();

    // Kiểm tra các liên kết điều hướng chính trên Desktop Navbar
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Thuê xe", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Gói thuê bao", exact: true })).toBeVisible();

    // Kiểm tra nút Đăng nhập hiển thị khi chưa có phiên
    const loginBtn = page.locator("header").getByRole("link", { name: "Đăng nhập" });
    await expect(loginBtn).toBeVisible();

    // Kiểm tra Footer có xuất hiện
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("2. Trang thông tin Gói thuê bao (/subscriptions) hiển thị đầy đủ", async ({ page }) => {
    await page.goto("/subscriptions");

    // Kiểm tra tiêu đề chính
    await expect(
      page.getByRole("heading", { name: /Thuê xe theo giờ trả trước/i })
    ).toBeVisible();

    // Kiểm tra nút 'Xem các gói cước'
    const viewPlansBtn = page.getByRole("link", { name: "Xem các gói cước" });
    await expect(viewPlansBtn).toBeVisible();
  });

  test("3. Trang đăng nhập (/login) hiển thị form đăng nhập và tài khoản mẫu", async ({ page }) => {
    await page.goto("/login");

    // Kiểm tra input email & password
    const emailInput = page.locator("#login-email");
    const passwordInput = page.locator("#login-password");
    const submitBtn = page.locator('button[type="submit"]').getByText(/Đăng nhập/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Kiểm tra các nút tài khoản demo có hiển thị
    await expect(page.getByText("Tài khoản mẫu thử nghiệm")).toBeVisible();
    await expect(page.getByRole("button", { name: /Khách hàng/i })).toBeVisible();
  });

  test("4. Route Guard: Tự động điều hướng về /login khi truy cập Dashboard chưa xác thực", async ({ page }) => {
    // Thử truy cập trang đặt xe khi chưa đăng nhập
    await page.goto("/booking");

    // Phải bị redirect về trang login kèm query param next
    await page.waitForURL(/\/login\?next=.*/);
    expect(page.url()).toContain("/login?next=%2Fbooking");

    // Thử truy cập trang hóa đơn khi chưa đăng nhập
    await page.goto("/invoices");
    await page.waitForURL(/\/login\?next=.*/);
    expect(page.url()).toContain("/login?next=%2Finvoices");
  });
});
