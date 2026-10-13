# 2026-10-12 — Đồng bộ design 4 vùng & bộ test E2E đầy đủ

- **FR/NFR:** NFR-008 (nền tảng/UI), NFR-007 (test)
- **Loại:** fix (UI) + test

## 1. Đồng bộ design

Chuẩn áp dụng: `DESIGN.md` A2 (một điểm nhấn duy nhất — Precision Amber `--primary`), A3 (không chữ dưới 12px), A11 #5 (cấm điểm nhấn thứ hai), A12 (mọi màu phải đi qua biến CSS trong `globals.css`).

### Số liệu trước khi sửa

Đo bằng Playwright trên các vùng bị phản ánh: `footer`/`#goi-thue-bao`/`#showroom-3d`/`#cong-nghe` dùng 4 lớp accent khác nhau, trộn hai họ màu:

| Vùng | Accent ngoài token đang dùng |
|---|---|
| `footer` | `text-amber-400`, `text-emerald-300/400`, `border-emerald-500/30` |
| `#goi-thue-bao` | `text-emerald-400`, `bg-amber-50/100`, `border-amber-600/20` |
| `#cong-nghe` | `text-amber-400`, `text-emerald-400`, `bg-emerald-950/80` |
| `#showroom-3d` | `bg-amber-50`, `border-amber-600/20`, `text-[#b45309]` |

### Đã sửa

- **`Footer.tsx`** — 17 lớp accent (amber + emerald trộn lẫn) → `hover:text-primary-tint` / `text-primary-tint`; badge "Cổng nhân viên / Admin" dùng `border-primary/40`. Hai `border-border-dim` là utility **không tồn tại** (không có trong `globals.css`) nên mất luôn đường kẻ cấu trúc → thay bằng `border-white/10` như các khối tối khác.
- **`MembershipPasses.tsx`** — gốc của "không đồng bộ": `mapSubscriptionPlanFromBE` **tự suy** `popular` từ `hours >= 20 && hours <= 60` nên 2 gói cùng được gắn "PRIORITY SELECTION"; cộng thêm fallback `index === 1` trong component ⇒ 2 thẻ cùng nổi bật. Bỏ heuristic trong mapper (chỉ nhận `popular` từ BE) và tính một `featuredId` duy nhất ở component. CTA thống nhất `variant="amber-hero"` (trước đó thẻ doanh nghiệp dùng `secondary-stage` nên nút xám trông như bị vô hiệu); màu còn lại đưa về token (`bg-primary-tint`, `border-primary/*`, `bg-surface-raised`, `bg-stage-ink`, `text-primary`).
- **`InspectionSection.tsx`** — trộn **3 sắc amber** (`#b45309`, `#d97706`, `#f59e0b`) và 4 lớp emerald. Quy về token: `text-primary`, `bg-primary-tint`, `text-primary-graphic` (icon trên nền tối), `text-primary-tint`, `border-primary/*`, `bg-stage-ink`, `bg-surface-raised`. Ngoài ra lưới card thiếu `relative z-10` nên nền blueprint SVG (`absolute z-0`) **vẽ đè lên thân card** — thêm `relative z-10` vào wrapper lưới.
- **`InteractiveStudio3D.tsx`** — cùng lỗi stacking context ⇒ thêm `relative z-10` cho lưới; quy hết hex/palette về token.
- **`Button.tsx`** — biến thể `amber-hero`/`sticky-morph`/`filter-pill` dùng hex thô (`bg-[#b45309]`, `hover:bg-[#92400e]`, `bg-[#0f172a]`…) → `bg-primary` / `hover:bg-primary-hover` / `active:bg-primary-press` / `bg-stage-ink` (giá trị màu không đổi, chỉ đi qua token).
- **Giá thuê niêm yết (bug "tràn UI, chữ to quá")** — `formatVND` nhét luôn `" ₫/giờ"` vào cùng một chuỗi `font-mono text-2xl` trong hàng `flex justify-between` với nhãn, nên nhãn và con số dính sát nhau (khe 1px) và con số ép sát mép khung. Đổi thành khối xếp dọc (`bg-surface-raised` + nhãn phía trên + `text-xl` + đơn vị `/giờ` là phần tử riêng) — cùng cấu trúc với khối giá ở thẻ hội viên.
- **Chữ dưới 12px trong 4 vùng** — `text-[8px..11px]` → `text-xs` (11 chỗ ở Inspection/Membership/Studio), nối lại quy tắc A3 mà deslop pass đã chốt.
- **`globals.css`** — bổ sung token còn thiếu `--color-surface-raised` (để `bg-surface-raised` tồn tại thay vì hex thô `#f7f7f4`).
- **Trùng id `#goi-thue-bao`** — `(marketing)/page.tsx` bọc `<div id="goi-thue-bao">` quanh `MembershipPasses` mà chính section cũng đặt cùng id ⇒ HTML không hợp lệ và mọi truy vấn theo id khớp 2 node. Bỏ id ở section, wrapper giữ anchor.
- **`Navbar.tsx`** — ở 768–900px bản desktop tràn: `nav` rộng 720px nhưng "Đăng nhập" (713→817) và "Đăng ký" (827→906) vượt cả khung lẫn viewport. Đổi mốc desktop từ `md` → `lg` (3 chỗ: nav link, nút hamburger, menu mobile). Ở 1024px nội dung ~880px nằm gọn trong pill 976px.

## 2. Bộ test E2E (framework `e2e` của tester-army)

Áp dụng https://github.com/tester-army/e2e bằng `npx e2e init --yes`, sau đó chỉnh lại config.

- **`e2e.config.ts`** — target Web trỏ `APP_URL ?? http://localhost:3000`; `app.command` chạy `npm run dev` với `NEXT_PUBLIC_USE_MOCK=true` khi runner tự spawn (CI), `reuseExisting: true` khi dev server đã chạy (Next 16 không cho chạy dev server thứ hai). Khối `agents` giữ nguyên để dùng được `agent.act/assert` khi có `AI_GATEWAY_API_KEY`.
- **`tests/`** — 8 file, 46 test. Chỉ `tests/agent.e2e.ts` cần model (tự skip khi thiếu key), phần còn lại deterministic:
  - `smoke.e2e.ts` — trang chủ, navbar, 8 khối nội dung, route công khai/riêng tư.
  - `landing.e2e.ts` — hero, studio 3D, khối giá (nhãn không đè con số), kiểm định 2 chiều, thẻ hội viên, footer.
  - `search-console.e2e.ts` — mở/đóng, loại trừ lẫn nhau, click-outside, chọn trạm, và **3 test hồi quy**: dropdown không bị section sau đè, console nằm gọn trong khung glass ở 1280/1024/900/768.
  - `auth.e2e.ts` — validation đăng nhập/đăng ký (lỗi nằm ngay dưới trường), tài khoản mẫu, ẩn/hiện mật khẩu, route guard 4 route riêng tư.
  - `api-error-contract.e2e.ts` — chặn request bằng `browser.route` và trả envelope đúng hợp đồng BE (`{ code, status, is_success, data, message, error }`) với chuỗi cố tình không có trong mã FE; xác nhận FE hiển thị nguyên văn `message` của BE và map `error.errors` về đúng trường. Tự skip khi dev server ở chế độ mock (không có request thật để chặn).
  - `design-system.e2e.ts` — không còn màu ngoài token trong 4 vùng, không chữ < 12px trong 4 vùng, chỉ một thẻ nổi bật + CTA đồng nhất, trạng thái luôn kèm nhãn chữ.
  - `responsive.e2e.ts` — không phần tử tràn ngang ở 375/768/1280, console xếp dọc ở mobile, dưới `lg` dùng menu thu gọn.
  - `tests/helpers.ts` — probe dùng chung (on-top, màu ngoài token, font nhỏ nhất, phần tử tràn, biến thể nút).
- **`package.json`** — `test:e2e` = `e2e run` (mặc định của framework); suite Playwright cũ đổi tên thành `test:e2e:playwright` / `test:e2e:playwright:ui`. Thêm devDeps `e2e`, `@e2e-dev/web`, `ai`, `zod`.
- **`.gitignore`** — init thêm `.e2e/*`; bổ sung `.claude/`, `.cursor/`, `.mcp.json` (agent tooling, cùng convention với `.agents` đang bị ignore).

## Test

- `npm run typecheck` xanh · `npm test` **57/57** · `npm run lint:design` PASS · `npm run build` static export exit 0.
- `npm run test:e2e` **45 pass, 1 skip** (46) · `npm run test:e2e:playwright` **16 pass**.
- Kiểm chứng thị giác bằng Playwright trước/sau ở 1280/768/375px cho 4 vùng + navbar.

## Chưa làm

- **Chưa nối 2 lệnh e2e vào CI**: bước `npx @e2e-dev/web install chromium --with-deps` + `npm run test:e2e` cần thêm vào `.github/workflows/ci.yml` (chưa sửa được trong lượt này).
- Còn **~80 chỗ `text-[8px..11px]`** ngoài 4 vùng đã đồng bộ (`ContinuousBlueprint` 21, `SearchWidget` 12, `MobileAppSection` 8, các bảng admin…). Test 12px hiện chỉ chốt trong 4 vùng.
- `#chinh-sach` trong footer không trỏ tới section nào (4 liên kết chết) — cần chốt xem gắn vào đâu.
- Heuristic `index === 1` trong `MembershipPasses` vẫn là fallback khi BE không đánh dấu gói nào.
- `test:e2e` chạy trên dev server đang chạy (không ép mock) nên dữ liệu do BE quyết định; các test đã viết để không phụ thuộc giá trị cụ thể.
