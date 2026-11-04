import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Inspection — Khu trưng bày 3D & Kiểm định đối soát', () => {
  test('khu trưng bày 3D hiển thị bảng thông số và lối xem xe thực tế', async ({ app, browser, screen }) => {
    await app.open('/inspection');

    await expect(screen.getByRole('heading', { name: /Khu Trưng Bày Xe 3D Tương Tác/i })).toBeVisible();
    for (const label of ['Năm sản xuất', 'Cấu hình động cơ', 'Công suất cực đại', 'Tốc độ tối đa']) {
      await expect(browser.locator('#showroom-3d').getByText(label, { exact: true })).toBeVisible();
    }
    await expect(browser.locator('#showroom-3d').getByText(/Mô hình trưng bày minh họa/i)).toBeVisible();
    await expect(screen.getByRole('button', { name: /Xem xe thực tế/i })).toBeVisible();
  });

  test('section kiểm định có 4 điểm kiểm tra chọn được và panel đối chiếu quyết toán', async ({ app, browser, screen }) => {
    await app.open('/inspection');

    await expect(screen.getByRole('heading', { name: /Kiểm tra xe trước và sau chuyến đi/i })).toBeVisible();
    for (const name of ['Ngoại thất và ảnh xe', 'Chỉ số km', 'Xăng hoặc pin', 'Kết quả và người xác nhận']) {
      await expect(screen.getByRole('heading', { name, exact: true }).first()).toBeVisible();
    }
    await expect(browser.locator('#kiem-dinh').getByText('DÙNG KHI QUYẾT TOÁN')).toBeVisible();

    const detailPanel = browser.locator('#kiem-dinh');
    await expect(detailPanel.getByText('ODOMETER')).toHaveCount(0);
    await screen.getByRole('button', { name: /Chỉ số km/i }).first().click();
    await expect(detailPanel.getByText('ODOMETER')).toBeVisible();
  });
});
