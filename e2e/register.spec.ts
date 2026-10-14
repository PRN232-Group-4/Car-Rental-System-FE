import { test, expect } from "@playwright/test";

test.describe("Đăng ký tài khoản (Registration Flow)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("1. Trang đăng ký (/register) hiển thị đầy đủ form và thông tin lợi ích", async ({ page }) => {
    // Kiểm tra tiêu đề trang
    await expect(page).toHaveTitle(/Đăng ký tài khoản/i);

    // Kiểm tra các trường thông tin trong form
    await expect(page.locator("#register-fullname")).toBeVisible();
    await expect(page.locator("#register-email")).toBeVisible();
    await expect(page.locator("#register-password")).toBeVisible();
    await expect(page.locator("#register-confirm-password")).toBeVisible();
    await expect(page.locator("#register-terms")).not.toBeChecked();

    // Nút submit
    const submitBtn = page.locator('button[type="submit"]').getByText(/Tiếp tục/i);
    await expect(submitBtn).toBeVisible();
  });

  test("2. Kiểm tra validation form: Báo lỗi khi mật khẩu ngắn hoặc không khớp", async ({ page }) => {
    const fullNameInput = page.locator("#register-fullname");
    const emailInput = page.locator("#register-email");
    const passwordInput = page.locator("#register-password");
    const confirmInput = page.locator("#register-confirm-password");
    const submitBtn = page.locator('button[type="submit"]');

    await fullNameInput.fill("Nguyen Van Test");
    await emailInput.fill("test@example.com");

    // Case 1: Mật khẩu dưới 6 ký tự
    await passwordInput.fill("123");
    await confirmInput.fill("123");
    await submitBtn.click();
    await expect(page.getByText(/Mật khẩu yêu cầu tối thiểu 6 ký tự/i)).toBeVisible();

    // Case 2: Mật khẩu xác nhận không khớp
    await passwordInput.fill("Matkhau123!");
    await confirmInput.fill("MatkhauKhac456!");
    await submitBtn.click();
    await expect(page.getByText(/Mật khẩu xác nhận không khớp/i)).toBeVisible();
  });

  test("3. Điền mẫu tự động, chuyển sang bước OTP và hoàn tất xác thực", async ({ page }) => {
    // Mock network call để test E2E không phụ thuộc vào dịch vụ email bên thứ 3 (Brevo)
    await page.route("**/api/account/registrations", async (route) => {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Mã OTP đã được gửi thành công.",
          is_success: true,
          data: null,
        }),
      });
    });

    await page.route("**/api/account/registrations/verify", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Xác thực tài khoản thành công!",
          is_success: true,
          data: null,
        }),
      });
    });

    const quickFillBtn = page.getByRole("button", { name: /Điền mẫu tự động/i });
    await expect(quickFillBtn).toBeVisible();
    await quickFillBtn.click();

    // Kiểm tra form đã được điền
    const emailInput = page.locator("#register-email");
    await expect(emailInput).not.toHaveValue("");

    // Submit bước 1
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Sau khi submit, màn hình phải chuyển sang bước nhập OTP
    const otpInput = page.locator("#register-otp");
    await expect(otpInput).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Xác thực email" })).toBeVisible();
    await expect(page.getByText(/Mã xác thực đã gửi tới/i)).toBeVisible();

    // Nhập OTP và xác nhận
    await otpInput.fill("123456");
    const confirmOtpBtn = page.locator('button[type="submit"]').getByText(/Xác nhận & Hoàn tất/i);
    await confirmOtpBtn.click();

    // Kiểm tra màn hình thành công xuất hiện
    await expect(page.getByText("Chúc mừng bạn!")).toBeVisible();
    await expect(page.getByRole("button", { name: /Đăng nhập ngay/i })).toBeVisible();
  });

  test("4. Điều hướng qua lại mượt mà giữa /login và /register", async ({ page }) => {
    // Từ /register bấm link Đăng nhập ngay
    const loginLink = page.getByRole("link", { name: "Đăng nhập ngay" });
    await loginLink.click();
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");

    // Từ /login bấm link Đăng ký tài khoản mới
    const registerLink = page.getByRole("link", { name: "Đăng ký tài khoản mới" });
    await registerLink.click();
    await page.waitForURL(/\/register/);
    expect(page.url()).toContain("/register");
  });
});
