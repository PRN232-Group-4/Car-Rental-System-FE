import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // No requests from these tests may write to the real backend.
  await page.route("**/api/**", (route) => route.request().url().endsWith("/account/profile")
    ? route.fulfill({ status: 204 })
    : route.fulfill({ status: 200, json: [] }));
});

test("registration shows every invalid field and clears only the edited field", async ({ page }) => {
  await page.goto("/register");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#register-fullname")).toBeFocused();
  await expect(page.locator("#register-fullname-error")).toBeVisible();
  await expect(page.locator("#register-email-error")).toBeVisible();
  await expect(page.locator("#register-password-error")).toBeVisible();
  await expect(page.locator("#register-email")).toHaveAttribute("aria-describedby", "register-email-error");
  await page.locator("#register-email").fill("valid@example.com");
  await expect(page.locator("#register-email-error")).toHaveCount(0);
  await expect(page.locator("#register-fullname-error")).toBeVisible();
  await page.screenshot({ path: "test-results/registration-inline-errors.png", fullPage: true });
});

test("API validation maps to the input and network failures remain general", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#login-email").fill("test@example.com");
  await page.locator("#login-password").fill("valid-password-123");
  await page.route("**/api/auth/login", (route) => route.fulfill({ status: 400, json: { errors: { "request.Email": ["Email không được hỗ trợ."] } } }));
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#login-email-error")).toHaveText("Email không được hỗ trợ.");
  await expect(page.locator("#login-email")).toBeFocused();
  await expect(page.locator("#login-password")).toHaveValue("valid-password-123");
  await page.route("**/api/auth/login", (route) => route.abort("failed"));
  await page.locator("#login-email").fill("other@example.com");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#login-email-error")).toHaveCount(0);
  await expect(page.getByText(/Failed to fetch|NetworkError|Load failed/)).toBeVisible();
});

test("catalog required fields and backend errors stay inside the dialog", async ({ page }) => {
  await page.route("**/api/account/profile", (route) => route.fulfill({ status: 200, json: { email: "admin@test.local", fullName: "Admin", roles: ["Admin"] } }));
  await page.goto("/admin/vehicle-types");
  await page.getByRole("button", { name: /Thêm/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.locator('[name="name"]')).toBeFocused();
  await expect(dialog.getByRole("alert")).toHaveCount(3);
  await dialog.locator('[name="name"]').fill("Xe thử nghiệm");
  await dialog.locator('[name="type"]').selectOption("car");
  await dialog.locator('[name="fuelType"]').selectOption({ index: 1 });
  await page.route("**/api/vehicle-types", (route) => route.fulfill({ status: 400, json: { errors: { Name: ["Tên loại phương tiện đã tồn tại."] } } }));
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.getByRole("alert")).toHaveText("Tên loại phương tiện đã tồn tại.");
  await page.screenshot({ path: "test-results/catalog-inline-errors.png", fullPage: true });
});

test("negative catalog numbers show range errors beside the value", async ({ page }) => {
  await page.route("**/api/account/profile", (route) => route.fulfill({ status: 200, json: { email: "admin@test.local", fullName: "Admin", roles: ["Admin"] } }));
  await page.goto("/admin/subscription-plans");
  await page.getByRole("button", { name: /Thêm/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('[name="name"]').fill("Gói thử nghiệm");
  await dialog.locator('[name="price"]').fill("-1");
  await dialog.locator('[name="durationDays"]').fill("30");
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.locator('[name="price"]')).toBeFocused();
  await expect(dialog.getByRole("alert")).toHaveText("Giá trị phải từ 0 trở lên.");
});

test("license form displays expired date and invalid upload errors inline", async ({ page }) => {
  await page.route("**/api/account/profile", (route) => route.fulfill({ status: 200, json: { email: "customer@test.local", fullName: "Customer", roles: ["Customer"] } }));
  await page.goto("/driver-license");
  await page.locator('[name="licenseNumber"]').fill("123456789");
  await page.locator('[name="issueDate"]').fill("2000-01-01");
  await page.locator('[name="expiryDate"]').fill("2001-01-01");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('[name="expiryDate"]')).toBeFocused();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Giấy phép lái xe đã hết hạn, không thể sử dụng để thuê xe.");
  await page.locator('[name="imageUrl"]').setInputFiles({ name: "invalid.txt", mimeType: "text/plain", buffer: Buffer.from("invalid") });
  await expect(page.locator("#customer-license-image-error")).toHaveText("Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG).");
  await expect(page.getByText("Giấy phép lái xe đã hết hạn, không thể sử dụng để thuê xe.")).toBeVisible();
});
