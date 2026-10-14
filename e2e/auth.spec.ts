import { test, expect } from "@playwright/test";

test.describe("Xác thực & Form Đăng nhập (Auth & LoginForm)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("1. Kiểm tra validation khi mật khẩu dưới 6 ký tự", async ({ page }) => {
    const emailInput = page.locator("#login-email");
    const passwordInput = page.locator("#login-password");
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill("test@example.com");
    await passwordInput.fill("12345"); // dưới 6 ký tự
    await submitBtn.click();

    // Thông báo lỗi phải hiển thị
    const alertBox = page.locator("div").getByText(/Mật khẩu yêu cầu tối thiểu 6 ký tự/i);
    await expect(alertBox).toBeVisible();
  });

  test("2. Tính năng chọn tài khoản mẫu (Demo Accounts) tự động điền form", async ({ page }) => {
    const emailInput = page.locator("#login-email");
    const passwordInput = page.locator("#login-password");

    // Click vào pill tài khoản "Khách hàng"
    const customerPill = page.getByRole("button", { name: /Khách hàng/i });
    await customerPill.click();

    // Form phải được điền email customer@example.com
    await expect(emailInput).toHaveValue("customer@example.com");
    await expect(passwordInput).toHaveValue("a-secure-password");

    // Click sang pill "Quản trị viên (Admin)"
    const adminPill = page.getByRole("button", { name: /Quản trị viên/i });
    await adminPill.click();

    await expect(emailInput).toHaveValue("admin@thongdong.vn");
  });

  test("3. Nút ẩn/hiện mật khẩu hoạt động chính xác", async ({ page }) => {
    const passwordInput = page.locator("#login-password");
    const toggleBtn = page.locator('button[aria-label*="mật khẩu"]');

    await passwordInput.fill("securePassword123!");
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Bấm hiện mật khẩu
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Bấm ẩn mật khẩu
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
