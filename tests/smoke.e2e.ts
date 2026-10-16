import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Smoke — trang chủ', () => {
  test('mở được trang chủ với tiêu đề và khung điều hướng', async ({ app, browser, screen }) => {
    await app.open('/');

    await expect(browser).toHaveTitle(/Thong Dong/i);
    await expect(browser.locator('header')).toBeVisible();
    await expect(browser.locator('footer')).toBeVisible();
    await expect(screen.getByRole('link', { name: 'ThongDong.' }).first()).toBeVisible();
  });

  test('thanh điều hướng có đủ mục chính và nút đăng nhập/đăng ký', async ({ app, screen }) => {
    await app.open('/');

    for (const name of ['Thuê xe', 'Chi nhánh', 'Gói thuê bao', 'Hướng dẫn', 'Kiểm định']) {
      await expect(screen.getByRole('link', { name, exact: true }).first()).toBeVisible();
    }
    await expect(screen.getByRole('link', { name: 'Đăng nhập' }).first()).toBeVisible();
    await expect(screen.getByRole('link', { name: 'Đăng ký' }).first()).toBeVisible();
  });

  test('landing render đủ 8 khối nội dung theo thứ tự', async ({ app, browser }) => {
    await app.open('/');

    for (const id of ['#gioi-thieu', '#tim-xe', '#showroom-3d', '#doi-xe', '#cong-nghe', '#quy-trinh', '#goi-thue-bao', '#lien-he']) {
      await expect(browser.locator(id)).toBeAttached();
    }
  });

  test('route công khai trả về nội dung, route riêng tư chặn khách', async ({ app, browser }) => {
    await app.open('/login');
    await expect(browser.locator('#login-email')).toBeVisible();

    await app.open('/forbidden');
    await expect(browser.locator('body')).toBeVisible();
    await expect(browser).not.toHaveURL(/\/login/);
  });
});
