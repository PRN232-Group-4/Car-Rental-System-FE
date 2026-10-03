# 2026-10-03 — Deslop pass: hệ surface, bỏ trang trí AI, siết motion & a11y

- **FR/NFR:** NFR-008 (nền tảng/UI), NFR-007 (test)
- **Loại:** refactor (UI)

Mục tiêu: xoá các dấu hiệu "AI slop" (glass ở mọi bề mặt, orb trang trí, gradient rim/text, emoji làm icon, motion lặp vô nghĩa) và đưa giao diện về một hệ surface có kỷ luật, một accent duy nhất.

## Skills đã cài (`.agents/skills/`, gitignored)

Lấy từ UI Skills registry qua MCP `www_list_skills` / `www_get_skill`:

- `baseline-ui` — baseline chống slop (motion, typography, layout, a11y)
- `frontend-design` — tránh mặc định sinh-bởi-AI, chọn typography/palette có lý do
- `better-ui` — polish: radius đồng tâm, shadow vs border, scale on press, icon stroke
- `design-taste-frontend` — anti-slop cho landing/redesign, eyebrow restraint, dial variance/motion/density
- Chuẩn hoá 2 skill phẳng sẵn có (`gpt-taste.md`, `ui-ux-pro-max.md`) thành `<name>/SKILL.md` để loader nhận; `glassmorphism` giữ nguyên

## Design system (`src/app/globals.css`)

- Viết lại tầng primitive: surface **đặc** (trắng + hairline + 1 shadow nhỏ) thay cho 7 biến thể glass; chỉ **nav** giữ translucency (có fallback `prefers-reduced-transparency`).
- Giữ nguyên tên class (`glass-card`, `glass-sub`, `glass-pill`, `glass-dark`, `glass-certificate`, `glass-hover`) nên 60+ call site không phải sửa; `glass-card-elevated` còn dùng ring accent thay vì glow.
- Xoá hẳn: `.specular-border` / `.specular-emerald` (gradient rim), `.ambient-glow-orb`, `@keyframes orb-drift`, `.orb-drift*`.
- Thêm token: surface/hairline/radius đồng tâm/shadow/ease/duration và **z-index scale cố định**; `.no-scrollbar` (trước đây được dùng nhưng chưa hề định nghĩa).
- Motion: giữ 1 marquee; reveal chỉ còn `opacity` + `translateY` (bỏ `scale`), stagger tối đa 180ms; reveal ký tự bỏ `blur`/`rotateX`; bỏ `will-change` thường trực.
- Thêm `text-wrap: balance` cho heading, `pretty` cho paragraph.

## Bỏ trang trí

- **Orb/aurora**: xoá 7 orb `top-[3100px]`/`top-[4300px]` + dot matrix ở `(marketing)/page.tsx`, 3 orb ở `login/page.tsx`, 3 orb ở `Hero.tsx`; thay bằng nền phẳng một tông.
- **Gradient text** ở trang `/subscriptions` và `/login` → màu accent đặc.
- **Emoji làm icon** trong dropdown `Navbar` (🚗📦🧾💳🪪) → icon `lucide-react` (`Car`, `Package`, `FileText`, `CreditCard`, `FileCheck`) đồng bộ với sidebar dashboard.
- **Dead code**: block `<Image>` logo bị comment trong `Navbar`; comment lỗi thời nhắc "frosted glass/glassmorphism".
- **`animate-pulse` trang trí** (dot "sẵn sàng", dot gói active) → bỏ; giữ pulse cho skeleton và trạng thái đang poll.

## A11y & nhất quán

- `min-h-screen`/`h-screen` → `min-h-dvh` (ổn định viewport mobile).
- `text-[9px]` / `text-[10px]` / `text-[11px]` (35 chỗ) → `text-xs` (12px) — không còn chữ dưới 12px.
- Eyebrow (label uppercase trên heading section) giảm từ 6 → 2 trên landing (giữ ở "Đội xe" và "Gói thuê bao"), theo đúng rule "tối đa 1 eyebrow / 3 section".
- `size-*` cho icon vuông trong các chỗ đã sửa; giữ `:focus-visible` và `prefers-reduced-motion`.

## Test

- `npm run typecheck` xanh; `npm test` 24/24; `npm run lint` 0 error (3 warning có sẵn từ trước); `npm run build` static export 15 route.
- Kiểm tra tự động: 0 orb, 0 `bg-clip-text`, 0 emoji, 0 `specular*`, 0 `*-screen`, 0 `console.log`, 0 chữ < 12px.

## Chưa làm

- Chưa có screenshot đối chiếu trước/sau (môi trường không có browser); các thay đổi về nhịp điệu/khoảng cách cần review mắt thường.
- Radius scale hiện vẫn 3 bậc (`rounded-xl/2xl/3xl` = 107/71/37 chỗ) — chưa gom về một thang duy nhất vì đổi hàng loạt sẽ ảnh hưởng lớn; đề xuất chốt: control 10px, card 16px, panel 20px.
- Chưa rà toàn bộ ~46 chỗ `uppercase` còn lại (phần lớn là nhãn cấu trúc trong card, không phải eyebrow).

## Quyết định/giả định

- Giữ tên class `glass-*` dù ngữ nghĩa đã đổi sang surface đặc, để diff nhỏ và tránh sửa 60+ call site; đã ghi chú trong CSS.
- Giữ `lucide-react` (project đã phụ thuộc) thay vì đổi icon library, đúng nguyên tắc "một icon family cho mỗi surface".
- Giữ bảng màu emerald hiện có làm accent duy nhất; không đổi nhận diện màu của sản phẩm.
