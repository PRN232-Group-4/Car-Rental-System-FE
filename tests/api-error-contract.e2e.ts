import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

/**
 * Hồi quy: BE bọc mọi response trong ApiResponse { code, status, is_success, data, message, error }.
 * FE từng đọc lỗi ở gốc (`data.errors` / `data.detail`) nên không bao giờ khớp và tự bịa thông báo.
 * Các test dưới chặn request thật bằng envelope đúng hợp đồng và yêu cầu FE hiển thị nguyên văn
 * thông báo của BE (chuỗi cố tình không xuất hiện ở bất kỳ đâu trong mã FE).
 *
 * Chỉ chạy được khi dev server gọi API thật (NEXT_PUBLIC_USE_MOCK=false). Ở chế độ mock
 * không có request nào ra network nên test tự skip.
 */
const MOCK_MODE_REASON = 'dev server đang ở chế độ mock — không có request thật để chặn';

describe('Hợp đồng lỗi API — FE hiển thị đúng thông báo của BE', () => {
  test('lỗi 401 khi đăng nhập dùng nguyên văn message của BE', async ({ app, browser, screen }) => {
    const apiMessage = 'Tài khoản đã bị tạm khoá 15 phút do đăng nhập sai quá nhiều lần.';

    await app.open('/login');
    await browser.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        json: {
          code: 401,
          status: 'error',
          is_success: false,
          data: null,
          message: apiMessage,
          error: { status: 401, title: 'Unauthorized', detail: apiMessage },
        },
      });
    });

    const response = browser.waitForResponse('**/api/auth/login', { timeout: 8000 }).then(() => true).catch(() => false);

    await screen.getByLabel('Địa chỉ Email').fill('customer@example.com');
    await screen.getByLabel('Mật khẩu').fill('a-secure-password');
    await screen.getByRole('button', { name: /Đăng nhập/i }).click();

    if (!(await response)) test.skip(MOCK_MODE_REASON);

    await expect(screen.getByText(apiMessage)).toBeVisible();
    // Bản cũ thay bằng câu tự đặt nên các lý do khác (khoá tài khoản) bị che mất.
    await expect(screen.getByText('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.')).toBeHidden();
  });

  test('lỗi validation nằm ở error.errors được map về đúng trường', async ({ app, browser }) => {
    const fieldMessage = 'Email doanh nghiệp này đã có tài khoản trên hệ thống.';

    await app.open('/register');
    await browser.route('**/api/account/registrations', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        json: {
          code: 400,
          status: 'error',
          is_success: false,
          data: null,
          message: 'One or more validation errors occurred.',
          error: {
            status: 400,
            title: 'One or more validation errors occurred.',
            errors: { 'StartRegistrationRequest.Email': [fieldMessage] },
          },
        },
      });
    });

    const response = browser.waitForResponse('**/api/account/registrations', { timeout: 8000 }).then(() => true).catch(() => false);

    await browser.locator('#register-fullname').fill('Nguyễn Văn An');
    await browser.locator('#register-email').fill('an@thongdong.vn');
    await browser.locator('#register-password').fill('a-secure-password');
    await browser.locator('#register-confirm-password').fill('a-secure-password');
    await browser.locator('#register-terms').check();
    await browser.locator('button[type="submit"]').first().click();

    if (!(await response)) test.skip(MOCK_MODE_REASON);

    await expect(browser.locator('#register-email-error')).toHaveText(fieldMessage);
  });
});
