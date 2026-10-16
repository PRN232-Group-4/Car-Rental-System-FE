# 2026-10-12 — Quét đồng bộ design toàn bộ ứng dụng (login, register, dashboard, admin)

- **FR/NFR:** NFR-008 (nền tảng/UI)
- **Loại:** fix (UI) + refactor token

Tiếp nối `2026-10-12-fe-design-sync-and-e2e-suite.md`: lượt trước mới đồng bộ 4 vùng ở landing, lượt này quét **toàn bộ `src/`** vì login/register và các trang dashboard/admin vẫn dùng hệ màu cũ.

## Đo trước khi sửa

Audit tự động (script quét mọi chuỗi class màu trong `src/**/*.tsx`, đối chiếu với token khai báo trong `globals.css`):

| Nhóm | Số chỗ | Hệ quả |
|---|---|---|
| Utility thuộc **token cũ chưa bao giờ tồn tại**: `text-ink-muted`, `border-border`, `shadow-elevation-1/2/3`, `bg-surface-elevated`, `border-border-dim` | **217** | Class không sinh CSS ⇒ style mong muốn **không hề render** (viền, đổ bóng, màu chữ) |
| Màu palette/hex thô: `text-neutral-900`, `text-emerald-600`, `bg-[#059669]`, `text-[#b45309]`… | **904** trên 48 file | Điểm nhấn thứ hai (Emerald `#059669`) ở login/register/dashboard, trái A2 + A12 |
| Chữ dưới 12px: `text-[8px..11px]` | **79** | Trái A3 |

Nguyên nhân gốc: các trang này được viết theo bộ token **trước** lần đổi tên ở DESIGN.md A12 (`--color-border → --line`, `--color-text-muted → --ink-3`, `--color-surface → --surface`), dùng Emerald `#059669` làm accent chính, còn landing/dashboard mới đã chuyển sang Precision Amber `#b45309`. Kết quả là hai nhận diện song song trong cùng một app.

## Đã làm

Migrate cơ học 1238 + 144 + 76 class, **giữ nguyên giá trị màu** — chỉ đổi sang token:

| Từ | Sang | Ghi chú |
|---|---|---|
| `text-ink-muted` | `text-ink-3` | `--color-text-muted → --ink-3` |
| `border-border`, `border-border-dim` | `border-line`, `border-white/10` | `border-border-dim` chưa từng tồn tại; trên khối tối đi qua `border-white/10` |
| `shadow-elevation-1/2/3` | `shadow-e1/e2/e3` | |
| `bg-surface-elevated` | `bg-surface-raised` | |
| `text-neutral-900/800`, `text-slate-900/800` | `text-ink` | |
| `text-neutral-700`, `text-slate-700` | `text-ink-2` | |
| `text-neutral-600/500/400`, `text-slate-*`, `text-gray-*` | `text-ink-3` | |
| `bg-neutral-50/100/200`, `bg-slate-*`, `bg-gray-*` | `bg-sunken` | |
| `border-neutral-100/200`, `border-slate-200` | `border-line` | |
| `border-neutral-300`, `border-slate-300` | `border-line-strong` | |
| `bg-white` | `bg-surface` | cùng giá trị `#ffffff` |
| `emerald-*`, `#059669`, `#047857`, `#065f46` | `primary` / `primary-hover` / `primary-press` / `primary-tint` | |
| `text-emerald-400/300/200` | `text-primary-tint` | dùng trên nền tối |
| `amber-*` | `primary-tint` / `text-warning` / `text-primary-graphic` | `--warning-bg` = `#fef3c7` = `amber-100`, `--warning` = `#92400e` = `amber-800` ⇒ màu y hệt |
| `rose-*`, `red-*` | `danger` / `danger-bg` | |
| `blue-*`, `sky-*`, `teal-*` | `info` / `info-bg` | |
| `text-[8px..11px]` | `text-xs` | A3: không chữ dưới 12px |

Sửa kèm:

- **`BookingModal` scrim**: dùng `bg-[var(--scrim-modal)]` nhưng biến này **không tồn tại** trong `globals.css` ⇒ lớp phủ modal trong suốt, không tối nền. Đổi sang `bg-scrim`.
- **`globals.css`**: thêm `--danger-hover` + `--color-danger-hover` (hệ token có hover/press cho primary nhưng thiếu cho danger).
- **Token hoá biến thể Button**: `amber-hero` / `sticky-morph` / `filter-pill` / `danger` không còn hex thô.
- **`/subscriptions`**: 3 ô icon dùng 2 hệ màu khác nhau (`amber-100` + `blue-100` ×2) → cùng `bg-primary-tint text-primary`.
- **`SpatialFleetShowcase`**: `bg-[#13221E] hover:bg-[#1A302A]` → `bg-stage-ink hover:bg-stage-ink/90`.

## Chặn hồi quy

- **`scripts/check-design-rules.mjs`** thêm rule `NO_RAW_PALETTE_COLOUR (A2, A12)`: fail build nếu thấy class màu thuộc palette Tailwind (emerald/green/amber/slate/neutral/rose/blue…) hoặc hex tuỳ ý (`bg-[#…]`) trong `src/**`. Rule này đã bắt được 5 chỗ mà script migrate bỏ sót.
- **`tests/design-system.e2e.ts`** thêm 9 test: `/login`, `/register`, `/subscriptions`, `/forbidden` không còn màu ngoài token, không còn chữ < 12px; trang chủ cũng kiểm 12px toàn trang (trước chỉ kiểm 4 vùng).

## Kết quả

| Chỉ số | Trước | Sau |
|---|---|---|
| Màu palette/hex thô | 904 (48 file) | **19** (12 file) |
| Utility token cũ (không render) | 217 | **0** |
| Chữ < 12px | 79 | **0** |

19 chỗ còn lại **không phải màu**: 4 × `stroke-[2/2.2/2.5/3]` (độ dày nét icon lucide) và 6 × `shadow-[0_…rgba(…)]` (đổ bóng tuỳ ý — `.glass-*` đã set `box-shadow` bằng layer nên utility này vốn không có tác dụng).

## Test

- `npm run lint:design` PASS (có rule mới) · `npm run typecheck` xanh · `npm test` **57/57** · `npm run build` static export exit 0.
- `npm run test:e2e` **54 pass, 1 skip** (55) · `npm run test:e2e:playwright` **16 pass**.
- Đối chiếu ảnh trước/sau ở 1280px: `/login`, `/register`, `/subscriptions`, `/forbidden`, thẻ hội viên, footer.

## Chưa làm / cần biết

- Đổi sang token là **đổi tên, không đổi giá trị**, trừ 3 chỗ có chủ ý: `text-[#f59e0b]`→`text-primary-graphic` (`#d97706`), `emerald-600`→`primary` (`#b45309`) ở các CTA/link, và `text-neutral-400`→`text-ink-3` (`#a3a3a3`→`#64748b`, đậm hơn nhưng đạt AA). Cần review mắt thường phần dashboard/admin vì tôi không đăng nhập được vào môi trường này.
- 6 `shadow-[…]` tuỳ ý: nên gom về `--e1/e2/e3` nhưng sẽ đổi cảm giác đổ bóng nên để lại.
- `#chinh-sach` trong footer vẫn là 4 liên kết chết (chưa chốt gắn vào đâu).
- Chưa nối `npm run test:e2e` (và bước cài chromium) vào `.github/workflows/ci.yml`.
