import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Landing — Hero và Footer', () => {
  test('hero hiển thị tiêu đề và thanh tìm kiếm', async ({ app, screen }) => {
    await app.open('/');

    // Hero title & search widget
    await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(screen.getByRole('button', { name: /Tìm Xe|Đặt xe/i }).first()).toBeVisible();
  });

  test('footer có đủ liên kết và thông tin liên hệ', async ({ app, browser, screen }) => {
    await app.open('/');
    const footer = browser.locator('footer');
    await footer.scrollIntoView();

    await expect(footer).toBeVisible();
    await expect(footer.getByText(/support@vrs.vn/)).toBeVisible();
    await expect(footer.getByText(/Toàn bộ quyền được bảo lưu/)).toBeVisible();
  });
});
