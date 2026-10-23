import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';
import { offTokenClasses, smallestFontSize, buttonBackgrounds } from './helpers';

/**
 * DESIGN.md Phần A12/A11: mọi giá trị màu phải đi qua biến CSS trong globals.css,
 * chỉ một điểm nhấn chính (Precision Amber --primary). Các lớp Tailwind palette
 * thô (emerald-400, amber-400, bg-[#0f172a]…) là "điểm nhấn thứ hai" bị cấm.
 */
const SYNCED_SECTIONS = ['footer', '#cong-nghe', '#goi-thue-bao', '#showroom-3d'];

describe('Design system — đồng bộ điểm nhấn', () => {
  test('footer và các section được đồng bộ không dùng màu ngoài token', async ({ app, browser }) => {
    await app.open('/');

    const offToken = await browser.evaluate(offTokenClasses, SYNCED_SECTIONS);
    expect(offToken).toEqual([]);
  });

  test('không còn chữ nhỏ hơn 12px trong các vùng đã đồng bộ', async ({ app, browser }) => {
    await app.open('/');

    const smallest = await browser.evaluate(smallestFontSize, SYNCED_SECTIONS);
    expect(smallest).toBeGreaterThanOrEqual(12);
  });

  test('thẻ hội viên: mọi gói dùng cùng một kiểu CTA', async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#goi-thue-bao').scrollIntoView();

    await expect(browser.locator('#goi-thue-bao').getByText('Sở hữu thẻ').first()).toBeVisible();

    // CTA phải cùng một biến thể nút, không có nút xám trông như bị vô hiệu.
    const variants = await browser.evaluate(buttonBackgrounds, 'Sở hữu thẻ');
    expect(variants.length).toBe(1);
  });

  test('trạng thái luôn kèm nhãn chữ chứ không chỉ màu', async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#kiem-dinh').scrollIntoView();

    // Khối kiểm tra xe dùng nhãn chữ cho mọi trạng thái (đang xem / chi tiết / trong đơn thuê)
    // thay cho thanh màu đơn thuần.
    for (const label of ['TRONG ĐƠN THUÊ', 'ĐANG XEM', 'CHI TIẾT', 'DÙNG KHI QUYẾT TOÁN']) {
      await expect(browser.locator('#kiem-dinh').getByText(label, { exact: true }).first()).toBeVisible();
    }
  });
});

/** Các trang còn lại phải dùng đúng hệ token, không màu palette/hex thô. */
const SYNCED_PAGES = ['/login', '/register', '/subscriptions', '/forbidden'];

describe('Design system — các trang còn lại', () => {
  for (const path of SYNCED_PAGES) {
    test(`${path} không dùng màu ngoài token`, async ({ app, browser }) => {
      await app.open(path);

      const offToken = await browser.evaluate(offTokenClasses, ['html']);
      expect(offToken).toEqual([]);
    });
  }

  for (const path of SYNCED_PAGES) {
    test(`${path} không còn chữ nhỏ hơn 12px`, async ({ app, browser }) => {
      await app.open(path);

      const smallest = await browser.evaluate(smallestFontSize, ['body']);
      expect(smallest).toBeGreaterThanOrEqual(12);
    });
  }

  test('trang chủ không còn chữ nhỏ hơn 12px', async ({ app, browser }) => {
    await app.open('/');

    const smallest = await browser.evaluate(smallestFontSize, ['body']);
    expect(smallest).toBeGreaterThanOrEqual(12);
  });
});
