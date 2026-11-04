import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { gateway } from 'ai';

export default {
  // Model chỉ cần cho test có bước `agent.act/assert` (tests/agent.e2e.ts).
  // Toàn bộ suite còn lại là deterministic (locator + assert) nên chạy được khi
  // chưa có AI_GATEWAY_API_KEY — test agent tự skip.
  agents: {
    default: {
      model: gateway('openai/gpt-6-luna-fast'),
      system: 'Bạn là QA agent kiểm tra giao diện tiếng Việt của hệ thống thuê xe Thong Dong.',
      context:
        'Ứng dụng Next.js tiếng Việt: trang chủ có "Trạm nhận xe" và "Lịch trình di chuyển", '
        + 'đăng nhập tại /login, đặt xe tại /booking, hoá đơn tại /invoices.',
    },
  },
  targets: [
    {
      name: 'web',
      engine: web({ viewport: { width: 1280, height: 900 } }),
      app: {
        url: process.env.APP_URL ?? 'http://localhost:3000',
        command: {
          executable: process.platform === 'win32' ? 'cmd.exe' : 'npm',
          args: process.platform === 'win32' ? ['/c', 'npm', 'run', 'dev'] : ['run', 'dev'],
          // Next 16 từ chối chạy dev server thứ hai khi đã có một cái đang chạy.
          // Local dùng lại server sẵn có; CI luôn spawn.
          reuseExisting: true,
          log: '.e2e/logs/dev-server.log',
        },
      },
    },
  ],
} satisfies E2EConfig;
