import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

/**
 * Ô mật khẩu là "secure field" — e2e từ chối đọc giá trị/thuộc tính của chúng
 * (POLICY_DENIED). Các test dưới chỉ ghi vào ô và kiểm chứng qua thứ khác.
 */
describe('Xác thực — trang đăng nhập', () => {
  test('form có đủ trường và nút gửi', async ({ app, browser, screen }) => {
    await app.open('/login');

    for (const id of ['#login-email', '#login-password']) {
      await expect(browser.locator(id)).toBeVisible();
    }
    await expect(browser.locator('button[type="submit"]')).toBeVisible();
    await expect(screen.getByText(/Tài khoản mẫu thử nghiệm/)).toBeVisible();
  });

  test('mật khẩu dưới 12 ký tự bị chặn kèm lỗi ngay dưới trường', async ({ app, browser }) => {
    await app.open('/login');

    await browser.locator('#login-email').fill('test@example.com');
    await browser.locator('#login-password').fill('123456');
    await browser.locator('button[type="submit"]').click();

    await expect(browser.locator('#login-password-error')).toContainText(/12 ký tự/i);
  });

  test('email sai định dạng bị chặn trước khi gửi', async ({ app, browser }) => {
    await app.open('/login');

    await browser.locator('#login-email').fill('khong-phai-email');
    await browser.locator('#login-password').fill('a-secure-password');
    await browser.locator('button[type="submit"]').click();

    await expect(browser.locator('#login-email-error')).toBeVisible();
    await expect(browser.locator('#login-email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('chọn tài khoản mẫu thì điền email tương ứng', async ({ app, browser, screen }) => {
    await app.open('/login');

    await screen.getByRole('button', { name: /Khách hàng/i }).click();
    await expect(browser.locator('#login-email')).toHaveValue('customer@example.com');

    await screen.getByRole('button', { name: /Quản trị viên/i }).click();
    await expect(browser.locator('#login-email')).toHaveValue('admin@thongdong.vn');
  });

  test('nút ẩn/hiện mật khẩu đổi nhãn theo trạng thái', async ({ app, screen }) => {
    await app.open('/login');

    await screen.getByRole('button', { name: 'Hiện mật khẩu' }).click();
    await expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toBeVisible();

    await screen.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
    await expect(screen.getByRole('button', { name: 'Hiện mật khẩu' })).toBeVisible();
  });
});

describe('Xác thực — trang đăng ký', () => {
  test('form đăng ký có đủ trường bắt buộc', async ({ app, browser }) => {
    await app.open('/register');

    for (const id of ['#register-fullname', '#register-email', '#register-password', '#register-confirm-password', '#register-terms']) {
      await expect(browser.locator(id)).toBeVisible();
    }
  });

  test('gửi form trống thì hiện lỗi ở từng trường', async ({ app, browser }) => {
    await app.open('/register');

    await browser.locator('button[type="submit"]').first().click();

    for (const id of ['#register-fullname-error', '#register-email-error', '#register-password-error', '#register-confirm-password-error']) {
      await expect(browser.locator(id)).toBeVisible();
    }
  });

  test('mật khẩu xác nhận không khớp thì báo lỗi tại trường xác nhận', async ({ app, browser }) => {
    await app.open('/register');

    await browser.locator('#register-fullname').fill('Nguyễn Văn An');
    await browser.locator('#register-email').fill('an@thongdong.vn');
    await browser.locator('#register-password').fill('a-secure-password');
    await browser.locator('#register-confirm-password').fill('khac-hoan-toan-123');
    await browser.locator('#register-terms').check();
    await browser.locator('button[type="submit"]').first().click();

    await expect(browser.locator('#register-confirm-password-error')).toBeVisible();
  });

  test('chuyển qua lại giữa đăng nhập và đăng ký', async ({ app, browser, screen }) => {
    await app.open('/login');

    await screen.getByRole('link', { name: /Đăng ký/i }).first().click();
    await expect(browser).toHaveURL(/\/register$/);

    await screen.getByRole('link', { name: /Đăng nhập/i }).first().click();
    await expect(browser).toHaveURL(/\/login$/);
  });
});

describe('Chặn truy cập — route riêng tư', () => {
  for (const path of ['/booking', '/invoices', '/my-subscriptions', '/payment-history']) {
    test(`khách chưa đăng nhập vào ${path} bị đưa về /login kèm next`, async ({ app, browser }) => {
      await app.open(path);

      await expect(browser).toHaveURL(/\/login\?next=/);
      const url = await browser.url();
      expect(decodeURIComponent(url)).toContain(path);
    });
  }
});
