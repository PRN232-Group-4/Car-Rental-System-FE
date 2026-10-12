import { describe, test } from '@e2e-dev/web';

/**
 * Bước `agent.act/assert` cần một model (AI_GATEWAY_API_KEY). Không có key thì
 * test tự skip — phần còn lại của suite chạy độc lập với model.
 */
const hasModel = Boolean(process.env.AI_GATEWAY_API_KEY);

describe('Agent — luồng quan trọng nhất', () => {
  test(
    'khách chọn trạm nhận xe rồi mở được danh sách xe',
    { skip: hasModel ? false : 'cần AI_GATEWAY_API_KEY cho bước agent' },
    async ({ app, agent }) => {
      await app.open('/');

      await agent.act('chọn một trạm nhận xe ở TP. Hồ Chí Minh trong ô "Trạm nhận xe", rồi bấm "Tìm Xe"');
      await agent.assert('danh sách xe hiển thị và có nút đặt thuê cho ít nhất một xe');
    },
  );
});
