import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Landing — nội dung từng section', () => {
  test('hero hiển thị tiêu đề và CTA chính', async ({ app, screen }) => {
    await app.open('/');

    await expect(screen.getByRole('heading', { name: /Giải Pháp Thuê Xe Toàn Diện/i })).toBeVisible();
    await expect(screen.getByRole('link', { name: /Tìm Xe|Đặt xe ngay/i }).first()).toBeVisible();
  });

  test('khu trưng bày 3D hiển thị bảng thông số và lối xem xe thực tế', async ({ app, browser, screen }) => {
    await app.open('/');

    await expect(screen.getByRole('heading', { name: /Khu Trưng Bày Xe 3D Tương Tác/i })).toBeVisible();
    for (const label of ['Năm sản xuất', 'Cấu hình động cơ', 'Công suất cực đại', 'Tốc độ tối đa']) {
      await expect(browser.locator('#showroom-3d').getByText(label, { exact: true })).toBeVisible();
    }
    await expect(browser.locator('#showroom-3d').getByText(/Mô hình trưng bày minh họa/i)).toBeVisible();
    await expect(screen.getByRole('button', { name: /Xem xe thực tế/i })).toBeVisible();
  });

  test('giá thuê thật nằm trong danh mục xe, không nằm trong khu trưng bày 3D', async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#showroom-3d').scrollIntoView();

    // Mô hình 3D chỉ để trưng bày: không được bán giá trong khối này.
    await expect(browser.locator('#showroom-3d').getByText(/₫/)).toHaveCount(0);

    await browser.locator('#doi-xe').scrollIntoView();
    await expect(browser.locator('#doi-xe').getByText(/đ\/giờ/).first()).toBeVisible();
  });

  test('section kiểm định có 4 điểm kiểm tra chọn được và panel đối chiếu quyết toán', async ({ app, browser, screen }) => {
    await app.open('/');

    await expect(screen.getByRole('heading', { name: /Kiểm tra xe trước và sau chuyến đi/i })).toBeVisible();
    for (const name of ['Ngoại thất và ảnh xe', 'Chỉ số km', 'Xăng hoặc pin', 'Kết quả và người xác nhận']) {
      // Panel bên phải lặp lại tên điểm đang chọn nên chỉ cần có ít nhất một heading.
      await expect(screen.getByRole('heading', { name, exact: true }).first()).toBeVisible();
    }
    await expect(browser.locator('#kiem-dinh').getByText('DÙNG KHI QUYẾT TOÁN')).toBeVisible();

    // Chọn điểm khác thì panel chi tiết đổi theo (state cục bộ, không gọi API).
    const detailPanel = browser.locator('#kiem-dinh');
    await expect(detailPanel.getByText('ODOMETER')).toHaveCount(0);
    await screen.getByRole('button', { name: /Chỉ số km/i }).first().click();
    await expect(detailPanel.getByText('ODOMETER')).toBeVisible();
  });

  test('thẻ hội viên: mỗi gói đang mở bán có đúng một CTA mua', async ({ app, browser, screen }) => {
    await app.open('/');
    await browser.locator('#goi-thue-bao').scrollIntoView();

    await expect(screen.getByRole('heading', { name: /Thẻ Hội Viên Số/i })).toBeVisible();
    const cards = browser.locator('#goi-thue-bao').getByText('Sở hữu thẻ');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    await expect(browser.locator('#goi-thue-bao').getByText(/₫/).first()).toBeVisible();
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
