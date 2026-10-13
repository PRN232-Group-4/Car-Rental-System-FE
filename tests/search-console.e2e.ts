import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';
import { SEARCH_CONSOLE, STATION_BUTTON, STATION_PANEL, TIME_BUTTON, TIME_PANEL, probeOnTop } from './helpers';

describe('SearchWidget — trạm nhận xe & lịch trình di chuyển', () => {
  test('mở/đóng dropdown trạm nhận xe', async ({ app, browser, screen }) => {
    await app.open('/');

    const button = browser.locator(STATION_BUTTON);
    const panel = browser.locator(STATION_PANEL);

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(screen.getByRole('listbox', { name: 'Chọn trạm nhận xe' })).toBeVisible();

    await button.click();
    await expect(panel).toBeHidden();
  });

  test('mở/đóng popover lịch trình và xác nhận được', async ({ app, browser }) => {
    await app.open('/');

    const button = browser.locator(TIME_BUTTON);
    await button.click();

    const panel = browser.locator(TIME_PANEL);
    await expect(panel).toBeVisible();
    await expect(panel.getByText('Thời gian nhận xe')).toBeVisible();
    await expect(panel.getByText('Thời gian trả xe')).toBeVisible();

    await panel.getByRole('button', { name: /Xác nhận/i }).click();
    await expect(panel).toBeHidden();
  });

  test('hai dropdown loại trừ nhau — không bao giờ mở cùng lúc', async ({ app, browser }) => {
    await app.open('/');

    await browser.locator(STATION_BUTTON).click();
    await expect(browser.locator(STATION_PANEL)).toBeVisible();

    await browser.locator(TIME_BUTTON).click();
    await expect(browser.locator(TIME_PANEL)).toBeVisible();
    await expect(browser.locator(STATION_PANEL)).toBeHidden();

    await browser.locator(STATION_BUTTON).click();
    await expect(browser.locator(STATION_PANEL)).toBeVisible();
    await expect(browser.locator(TIME_PANEL)).toBeHidden();
  });

  test('bấm ra ngoài thì đóng dropdown', async ({ app, browser }) => {
    await app.open('/');

    await browser.locator(STATION_BUTTON).click();
    const panel = browser.locator(STATION_PANEL);
    await expect(panel).toBeVisible();

    await browser.locator('main').first().click({ position: { x: 5, y: 5 } });
    await expect(panel).toBeHidden();
  });

  // Hồi quy: Hero từng tạo stacking context z-10 nên section phía sau (z-10/z-20)
  // vẽ đè lên thân dropdown.
  test('dropdown trạm nhận xe nằm trên các section phía sau', async ({ app, browser }) => {
    await app.open('/');
    await browser.locator(STATION_BUTTON).click();
    await browser.locator(STATION_PANEL).waitFor({ state: 'visible' });

    const result = await browser.evaluate(probeOnTop, STATION_PANEL);
    expect(result.found).toBe(true);
    expect(result.hits).toBe(result.total);
  });

  test('popover lịch trình di chuyển nằm trên các section phía sau', async ({ app, browser }) => {
    await app.open('/');
    await browser.locator(TIME_BUTTON).click();
    await browser.locator(TIME_PANEL).waitFor({ state: 'visible' });

    const result = await browser.evaluate(probeOnTop, TIME_PANEL);
    expect(result.found).toBe(true);
    expect(result.hits).toBe(result.total);
  });

  // Hồi quy: hai cột flex-1 thiếu min-w-0 nên ở md (768–1024px) cả dải console
  // tràn ra ngoài khung glass và đẩy popover văng khỏi màn hình.
  for (const width of [1280, 1024, 900, 768]) {
    test(`console nằm gọn trong khung glass ở ${width}px`, async ({ app, browser }) => {
      await app.open('/');
      await browser.setViewport({ width, height: 900 });

      const frame = await browser.locator(SEARCH_CONSOLE).boundingBox();
      expect(frame).not.toBeNull();
      for (const inner of ['form', 'button[type="submit"]']) {
        const box = await browser.locator(`${SEARCH_CONSOLE} ${inner}`).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(frame!.x - 1);
        expect(box!.x + box!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
      }
    });
  }

  test('chọn trạm khác thì nhãn trên nút đổi theo', async ({ app, browser }) => {
    await app.open('/');

    const button = browser.locator(STATION_BUTTON);
    const before = await button.textContent();

    await button.click();
    const panel = browser.locator(STATION_PANEL);
    await panel.waitFor({ state: 'visible' });
    await browser.locator(`${STATION_PANEL} button`).nth(1).click();

    await expect(browser.locator(STATION_PANEL)).toBeHidden();
    const after = await browser.locator(STATION_BUTTON).textContent();
    expect(after).not.toBe(before);
  });
});
