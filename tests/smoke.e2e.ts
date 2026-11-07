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

  test('nút Menu mở lớp điều hướng với đủ mục chính, đăng nhập và đăng ký', async ({ app, browser, screen }) => {
    await app.open('/');

    await screen.getByRole('button', { name: 'Mở menu điều hướng' }).click();
    await expect(browser.locator('[role="dialog"][aria-label="Menu điều hướng"]')).toBeVisible();

    const items: Array<[string, string]> = [
      ['ĐỘI XE TUYỂN CHỌN', '/find'],
      ['MẠNG LƯỚI TRẠM', '/facilities'],
      ['KIỂM ĐỊNH KỸ THUẬT 3D', '/inspection'],
      ['GÓI HỘI VIÊN', '/subscriptions'],
      ['ĐĂNG KÝ THÀNH VIÊN', '/register'],
      ['ĐĂNG NHẬP', '/login'],
    ];
    for (const [label, href] of items) {
      const link = browser.locator(`[role="dialog"] a[href="${href}"]`);
      await expect(link).toBeVisible();
      await expect(link).toContainText(label);
    }
  });

  test('landing render đủ 5 chương nội dung theo thứ tự', async ({ app, browser }) => {
    await app.open('/');

    const expected = ['gioi-thieu', 'cung-duong', 'quy-trinh', 'tin-cay', 'dat-xe'];
    for (const id of expected) {
      await expect(browser.locator(`#${id}`)).toBeAttached();
    }

    const order = await browser.evaluate((ids: string[]) => {
      const all = Array.from(document.querySelectorAll('main [id]')).map((el) => el.id);
      return all.filter((id) => ids.includes(id));
    }, expected);
    expect(order).toEqual(expected);
  });

  test('route công khai trả về nội dung, route riêng tư chặn khách', async ({ app, browser }) => {
    await app.open('/login');
    await expect(browser.locator('#login-email')).toBeVisible();

    await app.open('/forbidden');
    await expect(browser.locator('body')).toBeVisible();
    await expect(browser).not.toHaveURL(/\/login/);
  });
});
