import { test, expect } from "@playwright/test";

test.describe("Xác thực & Form Đăng nhập (Auth & LoginForm)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/account/profile", (route) => route.fulfill({ status: 401, json: {} }));
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

  test("2. Không hiển thị tài khoản mẫu và không tự điền thông tin đăng nhập", async ({ page }) => {
    await expect(page.getByText("Tài khoản mẫu thử nghiệm:")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^(Khách hàng|Quản trị viên|Điều phối)$/ })).toHaveCount(0);
    await expect(page.locator("#login-email")).toHaveValue("");
    await expect(page.locator("#login-password")).toHaveValue("");
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
