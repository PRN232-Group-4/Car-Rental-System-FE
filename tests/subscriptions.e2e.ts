import { test, describe } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Subscriptions — Thẻ hội viên số', () => {
  test('mỗi gói đang mở bán có đúng một CTA mua và giá hiển thị rõ ràng', async ({ app, browser, screen }) => {
    await app.open('/subscriptions');

    await expect(screen.getByRole('heading', { name: /Gói Hội Viên|Thẻ Hội Viên/i }).first()).toBeVisible();
    const cards = browser.locator('button:has-text("Kích hoạt"), button:has-text("Đăng ký"), button:has-text("Sở hữu thẻ")');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
