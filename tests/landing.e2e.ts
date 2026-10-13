import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Landing — nội dung từng section', () => {
  test('hero hiển thị tiêu đề và CTA chính', async ({ app, screen }) => {
    await app.open('/');

    await expect(screen.getByRole('heading', { name: /Giải Pháp Thuê Xe Toàn Diện/i })).toBeVisible();
    await expect(screen.getByRole('link', { name: /Tìm Xe|Đặt xe ngay/i }).first()).toBeVisible();
  });

  test('khu trưng bày 3D hiển thị bảng thông số và nút đặt thuê', async ({ app, browser, screen }) => {
    await app.open('/');

    await expect(screen.getByRole('heading', { name: /Khu Trưng Bày Xe 3D Tương Tác/i })).toBeVisible();
    for (const label of ['Năm sản xuất', 'Cấu hình động cơ', 'Công suất cực đại', 'Tốc độ tối đa']) {
      await expect(browser.locator('#showroom-3d').getByText(label, { exact: true })).toBeVisible();
    }
    await expect(screen.getByRole('link', { name: /Đặt thuê xe này/i })).toBeVisible();
  });

  test('khối giá niêm yết là một khối riêng, nhãn không đè lên con số', async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#showroom-3d').scrollIntoView();

    const label = browser.locator('#showroom-3d').getByText('Giá thuê niêm yết', { exact: true });
    const price = browser.locator('#showroom-3d').getByText(/₫$/).first();
    const labelBox = await label.boundingBox();
    const priceBox = await price.boundingBox();

    expect(labelBox).not.toBeNull();
    expect(priceBox).not.toBeNull();
    // Nhãn phải nằm hẳn phía trên con số (bản cũ đặt cùng hàng nên dính nhau).
    expect(priceBox!.y).toBeGreaterThanOrEqual(labelBox!.y + labelBox!.height);

    const panel = await browser.locator('#showroom-3d').boundingBox();
    expect(priceBox!.x + priceBox!.width).toBeLessThanOrEqual(panel!.x + panel!.width + 1);
  });

  test('section kiểm định có 4 hạng mục và bảng chứng thực PayOS', async ({ app, browser, screen }) => {
    await app.open('/');

    await expect(screen.getByRole('heading', { name: /Kiểm Định 2 Chiều & Hoàn Cọc Tự Động/i })).toBeVisible();
    for (const name of ['Ngoại Quan 360°', 'ECU Odometer & Pin', 'Áp Suất Lốp & Phanh', 'Ký Số Điện Tử']) {
      // Panel bên phải lặp lại tên hạng mục đang chọn nên chỉ cần có ít nhất một.
      await expect(screen.getByRole('heading', { name, exact: true }).first()).toBeVisible();
    }
    await expect(browser.locator('#cong-nghe').getByText('CƠ CHẾ HOÀN CỌC PAYOS TỨC THÌ')).toBeVisible();
  });

  test('thẻ hội viên: đúng 3 gói và chỉ một thẻ được nhấn', async ({ app, browser, screen }) => {
    await app.open('/');
    await browser.locator('#goi-thue-bao').scrollIntoView();

    await expect(screen.getByRole('heading', { name: /Thẻ Hội Viên Số/i })).toBeVisible();
    await expect(browser.locator('#goi-thue-bao').getByText('Sở hữu thẻ')).toHaveCount(3);
    // Bản cũ gắn "PRIORITY SELECTION" cho 2 thẻ cùng lúc.
    await expect(browser.locator('#goi-thue-bao').getByText('PRIORITY SELECTION')).toHaveCount(1);
  });

  test('footer có đủ 4 nhóm liên kết và thông tin liên hệ', async ({ app, browser, screen }) => {
    await app.open('/');
    const footer = browser.locator('footer');
    await footer.scrollIntoView();

    for (const heading of ['Về hệ thống', 'Thuê xe', 'Chính sách', 'Hỗ trợ khách hàng']) {
      await expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    }
    await expect(footer.getByText(/1900 xxxx/)).toBeVisible();
    await expect(footer.getByText('support@vrs.vn')).toBeVisible();
    await expect(footer.getByText(/12 Trần Hưng Đạo/)).toBeVisible();
    await expect(footer.getByText(/Toàn bộ quyền được bảo lưu/)).toBeVisible();
  });
});
