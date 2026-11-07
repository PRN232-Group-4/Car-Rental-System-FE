import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';
import { SEARCH_CONSOLE, overflowingElements } from './helpers';

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'laptop-1280', width: 1280, height: 900 },
];

describe('Responsive — không tràn ngang', () => {
  for (const viewport of VIEWPORTS) {
    test(`trang chủ không có phần tử tràn ngang ở ${viewport.name}`, async ({ app, browser }) => {
      await app.open('/');
      await browser.setViewport({ width: viewport.width, height: viewport.height });

      const metrics = await browser.evaluate(overflowingElements, viewport.width);
      expect(metrics).toEqual([]);

      const scrollWidth = await browser.evaluate(() => document.documentElement.scrollWidth, 0);
      expect(scrollWidth).toBeLessThanOrEqual(viewport.width);
    });
  }

  test('console tìm xe xếp dọc và vẫn nằm trong khung ở mobile', async ({ app, browser }) => {
    await app.open('/');
    await browser.setViewport({ width: 375, height: 812 });

    const frame = await browser.locator(SEARCH_CONSOLE).boundingBox();
    const submit = await browser.locator(`${SEARCH_CONSOLE} button[type="submit"]`).boundingBox();

    expect(frame).not.toBeNull();
    expect(submit).not.toBeNull();
    expect(submit!.x).toBeGreaterThanOrEqual(frame!.x - 1);
    expect(submit!.x + submit!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
    // Ở mobile hai cột xếp chồng nên nút gửi nằm dưới cùng.
    expect(submit!.y).toBeGreaterThan(frame!.y + frame!.height / 2);
  });

  test('ở mọi cỡ màn hình điều hướng là nút Menu mở lớp phủ toàn màn hình', async ({ app, browser, screen }) => {
    await app.open('/');
    await browser.setViewport({ width: 768, height: 900 });

    const dialog = browser.locator('[role="dialog"][aria-label="Menu điều hướng"]');
    await expect(screen.getByRole('button', { name: 'Mở menu điều hướng' })).toBeVisible();
    await expect(dialog).toBeHidden();

    await screen.getByRole('button', { name: 'Mở menu điều hướng' }).click();
    await expect(dialog).toBeVisible();
    await expect(browser.locator('[role="dialog"] a[href="/subscriptions"]')).toBeVisible();
    await expect(browser.locator('[role="dialog"] a[href="/login"]')).toBeVisible();
  });
});
