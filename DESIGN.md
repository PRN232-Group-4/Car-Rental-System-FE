# Design System — Hệ Thống Thuê Xe Thong Dong (Vehicle Rental System)

> **Phiên bản 3.1 — Light Editorial Automotive Blueprint, Warm Canvas, Zero-Gradient.**
>
> Tài liệu gồm hai phần:
>
> - **Phần A — Design System** (mục A1–A13): vật liệu kính, màu sắc, chữ, hệ thống đồ họa kỹ thuật Blueprint đa phân vùng, chuyển động 2D (GSAP), 3D (Three.js/WebGL), khu vực admin, truy cập, các điều cấm tuyệt đối. Đây là nguồn xác thực duy nhất cho mọi quyết định thị giác.
> - **Phần B — Product & UX Specification** (mục 1–54): nghiệp vụ, luồng, trạng thái, quy tắc sản phẩm. Giữ nguyên 100% tinh thần v2.0/v3.0; các mục xung đột với Phần A đã được chuẩn hóa và trỏ về Phần A.
>
> **Khi Phần A và Phần B mâu thuẫn, Phần A thắng.**
>
> **Nguồn xác thực nghiệp vụ:** `docs/SRS_CarRental.md` (SRS v2.0), `Car-Rental-System-BE/specs` (FR/NFR), `Car-Rental-System-BE/docs/db/Init.sql` + `db/migrations` (DDL, 26 bảng, không FK tường minh).
>
> **Quyết định kiến trúc sản phẩm:** đây là **system**, không phải **platform**. Một đơn vị vận hành sở hữu toàn bộ đội xe — không có chủ xe/đối tác, không hoa hồng.
>
> **Tên gọi:** thương hiệu hiển thị cho khách là **Thong Dong**; tên kỹ thuật của hệ thống là **VRS (Vehicle Rental System)**. Chuỗi hiển thị dùng "Thong Dong"; mã nguồn, tài liệu kỹ thuật dùng "VRS".

---

# A. DESIGN SYSTEM

## A1. Bầu không khí & thang đo

Một studio thiết kế & showroom ô tô kỹ thuật đương đại: nền giấy phác thảo ấm (**Warm Editorial Canvas `#FBFBF9`**) phẳng và chuẩn xác, các đồ họa vector phác thảo kỹ thuật CAD/Aero chuyên ngành làm hậu cảnh, còn giao diện là những **tấm kính mờ** (`.glass-1`, `.glass-2`, `.glass-3`) đứng trước hậu cảnh đó. Kính là vật liệu của lớp điều khiển (thanh điều hướng, bảng tìm kiếm, hộp thoại, bảng đặt xe), không phải lớp trang trí phủ lên mọi thứ. Chuyển động cơ khí chính xác, có trọng lượng, phản hồi dứt khoát.

| Chiều                        | Khu công khai (khách)                                    | Khu admin / staff                                                           |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| Mật độ (Density)             | 4 — "Daily App Balanced"                                 | 7 — "Cockpit Dense có kiểm soát"                                            |
| Biến thiên bố cục (Variance) | 6 — bất đối xứng có kỷ luật, watermark editorial         | 3 — đối xứng, dễ đoán                                                       |
| Chuyển động (Motion)         | 7 — "Fluid + Cinematic có chọn lọc (GSAP ScrollTrigger)" | 3 — chỉ phản hồi chức năng                                                  |
| Vật liệu kính                | Kính thật (blur + saturate) trên hậu cảnh Blueprint      | Kính nhẹ "Clean Minimal Frosted" trên canvas phẳng; vùng nhập liệu luôn đặc |

Nguyên tắc chủ đạo:

1. **Kính cần hậu cảnh thật.** `backdrop-filter` chỉ có tác dụng khi có thứ gì đó phía sau: ảnh xe, khối màu đặc, hoặc nội dung cuộn. Trên nền phẳng, kính phải tự đứng được bằng viền sáng + đổ bóng; không được giả lập hậu cảnh bằng gradient.
2. **Đọc được trước, đẹp sau.** Văn bản trên kính luôn đạt WCAG AA tính trên vùng hậu cảnh sáng nhất (xem bảng tương phản A2).
3. **Điểm nhấn màu chính:** Precision Amber `#B45309` (tông màu vàng đồng kỹ thuật ô tô, thay thế hoàn toàn màu xanh lá EV slop). Không lạm dụng màu, diện tích điểm nhấn <= 10% mỗi màn hình.
4. **Hệ thống Blueprint Đa Phân Vùng:** Mỗi phân vùng sở hữu đồ họa kỹ thuật chuyên ngành tương ứng (Khí động học, Khung gầm phẳng, Radar 360°, Trắc địa GPS, Vi mạch NFC).
5. **Chuyển động có lý do.** Mỗi animation trả lời một câu hỏi: "cái gì vừa xuất hiện / thay đổi / có thể bấm?".

---

## A2. Bảng màu & vai trò

Một họ trung tính ấm cao cấp (Warm Paper / Slate Ink), một điểm nhấn kỹ thuật chính (Precision Amber). Không dùng `#000000`; không dùng `#FFFFFF` làm nền trang (chỉ làm bề mặt thẻ/ô nhập).

| Tên                  | Hex                   | Vai trò                                                                                |
| -------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| **Warm Canvas**      | `#FBFBF9`             | Canvas — nền trang ấm cao cấp (thay cho Showroom Mist xanh xám)                        |
| **Sunken Bay**       | `#F2F2EE`             | Giếng/đáy: đầu bảng, vùng lõm, skeleton, ô disabled                                    |
| **Pure Surface**     | `#FFFFFF`             | Bề mặt đặc: thân bảng, ô nhập, thẻ cần tối đa độ đọc                                   |
| **Slate Ink**        | `#0F172A`             | Chữ chính; khối "stage" tối; sidebar admin                                             |
| **Ink Secondary**    | `#334155`             | Chữ phụ, mô tả                                                                         |
| **Ink Muted**        | `#64748B`             | Metadata, placeholder, nhãn nhỏ (>= 5.0:1 trên canvas)                                 |
| **Hairline**         | `rgba(15,23,42,0.08)` | Đường kẻ cấu trúc 1px                                                                  |
| **Hairline Strong**  | `rgba(15,23,42,0.16)` | Viền ô nhập, viền thẻ trên nền sáng                                                    |
| **Precision Amber**  | `#B45309`             | **Điểm nhấn chính**: CTA chính, link, trạng thái chọn, focus ring                      |
| Amber Hover          | `#92400E`             | Hover CTA                                                                              |
| Amber Press          | `#78350F`             | Active CTA                                                                             |
| Amber Tint           | `#FEF3C7`             | Nền hàng/chip được chọn                                                                |
| Amber Graphic        | `#D97706`             | Chỉ cho icon/đồ họa lớn (>= 3:1); **không** dùng làm màu chữ hay nền nút chữ trắng     |
| Success / bg         | `#166534` / `#DCFCE7` | Trạng thái — luôn đi kèm icon + nhãn chữ                                               |
| Warning / bg         | `#92400E` / `#FEF3C7` | Trạng thái                                                                             |
| Danger / bg          | `#B91C1C` / `#FEE2E2` | Trạng thái                                                                             |
| Info / bg            | `#1D4ED8` / `#DBEAFE` | Trạng thái                                                                             |
| Scrim                | `rgba(15,23,42,0.45)` | Lớp phủ **phẳng** trên ảnh để chữ/kính đọc được (không phải gradient)                  |

**Bảng tương phản đã đo (WCAG 2.x):**

| Cặp                          | Tỉ lệ                                 | Dùng cho                                                                                    |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Slate Ink / Warm Canvas      | 16.5:1                                | Chữ chính (đạt AAA)                                                                         |
| Ink Secondary / Warm Canvas  | 9.6:1                                 | Chữ phụ (đạt AAA)                                                                           |
| Ink Muted / Warm Canvas      | 5.2:1                                 | Metadata (đạt AA)                                                                           |
| White / Precision Amber      | 5.2:1                                 | Chữ trên nút chính (đạt AA)                                                                 |
| Precision Amber / Canvas     | 5.1:1                                 | Link, chữ nhấn (đạt AA)                                                                     |
| White / Slate Ink            | 17.8:1                                | Chữ trên khối tối (đạt AAA)                                                                 |

**Màu biểu đồ (Recharts/SVG), tất cả >= 3:1 trên Surface:**

```text
--chart-1: #B45309 (Amber 5.2:1)     --chart-2: #0F172A (Slate 17.8:1)   --chart-3: #64748B (Muted 5.2:1)
--chart-4: #047857 (Emerald 5.5:1)   --chart-5: #D97706 (Amber Graphic 3.5:1)
```

---

## A3. Chữ

- **Be Vietnam Pro** — display + body. Lý do chọn: font được thiết kế cho tiếng Việt, có đủ subset `vietnamese` trên Google Fonts (dấu chồng ở ệ, ự, ẫ… hiển thị đúng thay vì rơi về font hệ thống). **Inter bị cấm** (bản v2 cũ dùng Inter).
- **Geist Mono** — số liệu mật độ cao ở admin (mã đơn, số km, tiền, ID), thời gian, mã hóa đơn.
- Cấu hình `next/font/google`: `subsets: ["latin", "latin-ext", "vietnamese"]`, `weight: ["400","500","600","700","800"]`, `display: "swap"`. (Mã hiện tại chỉ nạp `["latin"]` — thiếu các ký tự như đ, ệ, ạ, ư, ơ, ă.)
- **Cổng kiểm tra bắt buộc:** render chuỗi `Thuê xe ô tô điện — Quản lý bảo dưỡng, hoàn cọc, đặt xe ngày Chủ nhật` ở 400/600/800 và xác nhận trong DevTools → Network có tệp unicode-range `vietnamese` được tải và không có glyph rơi về font hệ thống. Nếu không đạt, thay Be Vietnam Pro bằng một font khác có subset `vietnamese`; **không** chấp nhận font thiếu glyph tiếng Việt.

Thang chữ (dùng `clamp`, không dùng `vw` thuần):

| Token   | Giá trị                                                    | Ghi chú                                                                 |
| ------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Display | `clamp(2.5rem, 4.2vw, 4.25rem)` / 1.05 / -0.02em / 700–800 | Chỉ hero; **tối đa 3 dòng** ở >= 1280px (container `max-w-5xl` trở lên) |
| H1      | `clamp(2rem, 3.2vw, 3rem)` / 1.1 / -0.015em / 700          |                                                                         |
| H2      | `clamp(1.5rem, 2.4vw, 2.25rem)` / 1.15 / -0.01em / 700     |                                                                         |
| H3      | `1.25rem` / 1.3 / 600                                      |                                                                         |
| Body    | `1rem` / 1.6 / 400 (khu admin: `0.875rem` / 1.5)           | Tối đa **65 ký tự** mỗi dòng                                            |
| Small   | `0.8125rem` / 1.45 / 500                                   |                                                                         |
| Caption | `0.75rem` / 1.4 / 500                                      | Không dưới 12px                                                         |

- Số tiền/thời gian/số km: `font-variant-numeric: tabular-nums`. Khu admin (Density 7): ID, tiền, odometer, mức pin/xăng, thời gian dùng Geist Mono.
- Định dạng tiền VND: `Intl.NumberFormat("vi-VN")` → `900.000đ`; ngày giờ hiển thị theo GMT+7 (xem A13), không hiển thị UTC cho người dùng.
- Cấm: serif trong dashboard/ứng dụng, chữ gradient, chữ trắng 100% trên ảnh không có scrim, mọi nhãn kiểu "SECTION 01", "ABOUT US".

---

## A4. Vật liệu kính (Surface System)

### A4.1 Chiến lược hậu cảnh — không gradient

Kính chỉ "thành kính" khi có hậu cảnh. Hậu cảnh được phép:

| Loại                 | Mô tả                                                                              | Dùng ở                                                        |
| -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Stage Photo**      | Ảnh xe/hành trình thật, `object-fit: cover`, tỉ lệ 16:9 hoặc 21:9, kèm Scrim phẳng | Hero, banner chi nhánh, gallery                               |
| **Stage Ink**        | Khối màu đặc `#0E1A16` (bo góc lớn hoặc cắt vát bằng `clip-path`)                  | Phần "Vì sao chọn", ứng dụng di động, khu kiểm định           |
| **Stage Emerald**    | Khối màu đặc `#047857`                                                             | Phần gói thuê bao (nhấn một lần mỗi trang)                    |
| **Stage Content**    | Chính nội dung cuộn phía sau thanh điều hướng/bảng dính                            | Navbar, sticky booking card, filter bar                       |
| **Grain** (tùy chọn) | Nhiễu SVG `feTurbulence`, `opacity <= .05`, đặt trên pseudo-element cố định        | Chỉ hero, tạo cảm giác chất liệu; **không** thay cho hậu cảnh |

**Cấm:** `linear-gradient`, `radial-gradient`, `conic-gradient`, mesh gradient, "aurora/ambient orb" (khối tròn mờ trôi nổi), blur lớn đặt sau kính để giả lập màu. Mã hiện tại có `ambient-glow-orb`, `orb-drift`, `.specular-border::before` (viền gradient): **phải gỡ** (xem P1 trong bộ prompt).

Nguồn ảnh: khi phát triển dùng `https://picsum.photos/seed/{keyword}/1920/1080` (không dùng Unsplash trực tiếp); khi phát hành dùng ảnh đội xe thật qua Cloudinary. Ảnh nền luôn qua bộ lọc `contrast(1.05) saturate(0.9)` nhẹ, không lọc nặng.

### A4.2 Bốn thành phần của kính (thay gradient bằng bóng trong)

1. **Frost** — `backdrop-filter: blur() saturate()` (kèm `-webkit-`).
2. **Translucency** — nền có alpha, không bao giờ đặc 100% hay trong 100%.
3. **Edge** — viền sáng hơn nền (viền 1px trắng alpha) + **rim light** bằng `inset box-shadow` (không dùng gradient mặt nạ).
4. **Depth** — bóng đổ tinted theo mực (Garage Ink), không có glow màu.

### A4.3 Các tầng kính

| Lớp CSS        | Dùng cho                                                             | Nền                     | Blur           | Ghi chú                                                |
| -------------- | -------------------------------------------------------------------- | ----------------------- | -------------- | ------------------------------------------------------ |
| `.glass-1`     | Navbar pill, chip, nút phụ nổi trên ảnh                              | `rgba(255,255,255,.55)` | 14px           | Chỉ trên Stage                                         |
| `.glass-2`     | Bảng tìm kiếm hero, panel nổi, sticky booking card                   | `rgba(255,255,255,.72)` | 20px           |                                                        |
| `.glass-3`     | Modal, drawer, popover, bottom sheet                                 | `rgba(255,255,255,.88)` | 28px           | Tầng có chữ nhỏ                                        |
| `.glass-ink`   | Khối tối: kiểm định, app di động                                     | `rgba(14,26,22,.72)`    | 24px           | Chữ trắng                                              |
| `.glass-lite`  | **Phần tử lặp lại** (thẻ xe, thẻ gói, thẻ chi nhánh trong danh sách) | `rgba(255,255,255,.78)` | **không blur** | Giữ cảm giác kính bằng viền + rim + bóng               |
| `.glass-admin` | Panel, header, toolbar khu admin                                     | `rgba(255,255,255,.86)` | 10px           | Viền `--line`; vùng nhập liệu bên trong là Surface đặc |

```css
:root {
  /* Neutrals */
  --canvas: #f2f5f3;
  --sunken: #e8eeeb;
  --surface: #ffffff;
  --ink: #0e1a16;
  --ink-2: #34443d;
  --ink-3: #566860;
  --line: rgba(14, 26, 22, 0.1);
  --line-strong: rgba(14, 26, 22, 0.18);

  /* Single accent */
  --primary: #047857;
  --primary-hover: #065f46;
  --primary-press: #064e3b;
  --primary-tint: #e3f4ec;
  --primary-graphic: #059669;

  /* Status pairs */
  --success: #166534;
  --success-bg: #dcfce7;
  --warning: #92400e;
  --warning-bg: #fef3c7;
  --danger: #b91c1c;
  --danger-bg: #fee2e2;
  --info: #1d4ed8;
  --info-bg: #dbeafe;

  /* Stages + scrim (flat) */
  --stage-ink: #0e1a16;
  --stage-emerald: #047857;
  --scrim: rgba(14, 26, 22, 0.38);

  /* Shape */
  --r-control: 10px;
  --r-card: 16px;
  --r-panel: 24px;
  --r-pill: 999px;

  /* Elevation (ink-tinted, no colored glow) */
  --e1: 0 1px 2px rgba(14, 26, 22, 0.06), 0 2px 8px -2px rgba(14, 26, 22, 0.06);
  --e2:
    0 8px 24px -8px rgba(14, 26, 22, 0.16),
    0 2px 6px -2px rgba(14, 26, 22, 0.08);
  --e3:
    0 24px 56px -16px rgba(14, 26, 22, 0.28),
    0 6px 16px -6px rgba(14, 26, 22, 0.12);

  /* Rim light = inset shadows (no gradient) */
  --rim:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(14, 26, 22, 0.05);

  /* Motion tokens (CSS side; GSAP side in A7) */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 160ms;
  --dur-base: 320ms;
  --dur-slow: 640ms;
  --dur-cine: 1100ms;
}

.glass-1 {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  -webkit-backdrop-filter: blur(14px) saturate(1.35);
  backdrop-filter: blur(14px) saturate(1.35);
  box-shadow: var(--e1), var(--rim);
}
.glass-2 {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: var(--e2), var(--rim);
}
.glass-3 {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.95);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  backdrop-filter: blur(28px) saturate(1.4);
  box-shadow: var(--e3), var(--rim);
}
.glass-ink {
  background: rgba(14, 26, 22, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  backdrop-filter: blur(24px) saturate(1.3);
  box-shadow:
    var(--e3),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.glass-lite {
  /* NO backdrop-filter: dùng cho phần tử lặp lại */
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: var(--e1), var(--rim);
}
.glass-admin {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--line);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  backdrop-filter: blur(10px) saturate(1.2);
  box-shadow:
    var(--e1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.glass-lift {
  /* chỉ transform + shadow + border: rẻ */
  transition:
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.glass-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--e3), var(--rim);
  border-color: rgba(4, 120, 87, 0.35);
}
.glass-lift:active {
  transform: translateY(-1px);
}

/* Fallbacks bắt buộc */
@supports not (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .glass-1,
  .glass-2,
  .glass-3,
  .glass-admin {
    background: rgba(255, 255, 255, 0.95);
  }
  .glass-ink {
    background: rgba(14, 26, 22, 0.95);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .glass-1,
  .glass-2,
  .glass-3,
  .glass-lite,
  .glass-admin {
    background: var(--surface);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  .glass-ink {
    background: var(--stage-ink);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media (prefers-contrast: more) {
  .glass-1,
  .glass-2,
  .glass-3,
  .glass-lite,
  .glass-admin {
    border-color: var(--ink-3);
  }
}
@media (forced-colors: active) {
  .glass-1,
  .glass-2,
  .glass-3,
  .glass-ink,
  .glass-lite,
  .glass-admin {
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .glass-lift,
  .glass-lift:hover {
    transition: none;
    transform: none;
  }
}
```

### A4.4 Ngân sách hiệu năng cho kính

`backdrop-filter` làm lại phép blur mỗi khung hình cho mọi phần tử. Quy định cứng:

- Trang công khai: tối đa **4** phần tử có `backdrop-filter` trong cùng một viewport (thường: navbar, bảng tìm kiếm hero, 1–2 panel). Khu admin: tối đa **3** (header, một overlay, một drawer).
- **Cấm** `backdrop-filter` trên phần tử lặp lại (thẻ xe, hàng bảng, thẻ gói): dùng `.glass-lite`.
- Cấm chồng hai phần tử `backdrop-filter` lên nhau; cấm bán kính blur > 40px; cấm animate bán kính blur (chỉ animate `transform`, `opacity`, `box-shadow`, `border-color`).
- `will-change` chỉ gắn trong lúc animate và gỡ sau đó.
- Kiểm thử tự động (FE-20): Playwright đếm phần tử có `getComputedStyle(el).backdropFilter !== "none"` mỗi route và so với ngân sách.

### A4.5 Liquid refraction (tùy chọn, tối đa một chỗ)

Bộ lọc SVG `feDisplacementMap` + `feTurbulence` làm hậu cảnh bị bẻ cong qua kính. Chỉ được áp cho **bảng tìm kiếm hero ở desktop** (`>= 1024px`, không `prefers-reduced-motion`, không thiết bị yếu). `scale` 8–14. Mặc định **tắt**; bật bằng cờ `NEXT_PUBLIC_LIQUID_GLASS=1` sau khi đã đo FPS >= 50 trên máy tầm trung. Không dùng ở admin.

---

## A5. Bố cục, khoảng cách, hình khối

- Container công khai `max-w-[1280px]`; admin co giãn tối đa `1440px`. Padding ngang: 16 (mobile) / 24 (tablet) / 32–40 (desktop).
- Thang khoảng cách: 4, 8, 12, 16, 24, 32, 48, 64, 80, 120. Nhịp dọc giữa các section công khai: `clamp(4rem, 9vw, 8rem)`; admin: 24–32.
- CSS Grid là mặc định; **cấm** hack `calc()` phần trăm trong flex. Chiều cao toàn màn hình dùng `min-h-[100dvh]`, **cấm** `h-screen`.
- Bo góc: control 10px, card 16px, panel/modal 24px, pill 999px. Ảnh trong thẻ bo theo thẻ.
- **Cấm** hàng 3 thẻ bằng nhau làm bố cục tính năng. Dùng bất đối xứng 2/1, zig-zag, bento đặc (`grid-auto-flow: dense`, 3–5 ô, không ô trống) hoặc cuộn ngang.
- **Hero:** H1 tối đa 3 dòng, container rộng (`max-w-5xl` trở lên); tối đa **một** CTA chính; không pill-tag dưới hero; không số liệu thô trong hero; không chữ chồng lên chữ/ảnh (kính chồng lên ảnh là ngoại lệ duy nhất, vì đó là vật liệu); không "Scroll to explore" / mũi tên cuộn.
- Mobile (< 768px): mọi lưới nhiều cột thu về một cột; không cuộn ngang; vùng chạm >= 44px.
- Toàn bộ trang bọc `overflow-x: clip` ở `main` để animation ngoài khung không sinh thanh cuộn ngang.

---

## A6. Thành phần

| Thành phần                | Quy tắc                                                                                                                                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button primary**        | Nền Emerald Deep, chữ trắng, cao 44–48 (admin 36–40), bo `--r-control`; hover Emerald Hover; active `translateY(1px)` + Emerald Press; focus ring A10. Không glow, không gradient.                                                              |
| **Button secondary**      | `.glass-1` trên Stage hoặc Surface + viền `--line-strong` trên canvas; chữ Ink.                                                                                                                                                                 |
| **Button ghost / danger** | Ghost: chữ Ink, hover nền Sunken. Danger: nền `--danger`, chữ trắng (đã >= 5.9:1 — kiểm lại khi đổi màu).                                                                                                                                       |
| **Input**                 | Nền **Surface đặc**, viền Hairline Strong, cao 48 (admin 40), nhãn luôn nằm trên, lỗi nằm dưới có icon + chữ; focus: viền Emerald + vòng `0 0 0 3px` Emerald Tint. Không nhãn nổi (floating label).                                             |
| **Select/Combobox/Date**  | Popover `.glass-3`; danh sách tùy chọn nền đặc. Lịch dùng `react-day-picker`, múi giờ GMT+7.                                                                                                                                                    |
| **Tabs**                  | Thanh trượt chỉ báo bằng `transform: translateX` + `scaleX`; không đổi bố cục.                                                                                                                                                                  |
| **StatusBadge**           | Chip bo pill, cặp màu trạng thái A2, icon Lucide + nhãn chữ. Bảng ánh xạ ở B.§26 và A9.                                                                                                                                                         |
| **VehicleCard**           | Ảnh chiếm >= 60% diện tích, tỉ lệ 4:3; phần thông tin `.glass-lite`; giá lớn, `tabular-nums`; huy hiệu: Có tài xế / Xe điện / Dùng được gói thuê bao / Sẵn sàng. Hover: ảnh `scale(1.04)` trong container `overflow:hidden`, thẻ `.glass-lift`. |
| **Dialog**                | `.glass-3`, focus trap (Radix), nền che `rgba(14,26,22,.45)` phẳng, đóng bằng Esc/nút; vào bằng GSAP (A7).                                                                                                                                      |
| **Drawer / Bottom sheet** | Desktop: drawer phải `.glass-3`. Mobile: bottom sheet (`vaul`) kéo được, có tay nắm.                                                                                                                                                            |
| **Toast**                 | `sonner`, vị trí dưới-phải (mobile: trên), `.glass-2`, `role="status"`/`alert` đúng ngữ cảnh.                                                                                                                                                   |
| **Table (admin)**         | Header Sunken dính trên, thân Surface đặc, hàng cao 44 (chế độ compact 36), phân cách bằng Hairline, hàng chọn nền Emerald Tint. Không blur trên hàng.                                                                                          |
| **Skeleton**              | Khối Sunken bo đúng kích thước nội dung thật, nhấp nháy bằng **opacity** (0.6 ↔ 1, 1.2s). **Cấm shimmer gradient.** Không spinner tròn cho tải trang/danh sách (spinner chỉ cho nút đang gửi).                                                  |
| **Empty state**           | Bố cục có chủ đích: minh họa SVG đơn sắc, tiêu đề, một dòng hướng dẫn, một hành động chính. Không chỉ ghi "No data".                                                                                                                            |
| **Error state**           | Thông điệp thân thiện + nút "Thử lại" + mã tham chiếu (`traceId` từ ProblemDetails) cho staff; không lộ 500/stack.                                                                                                                              |
| **Chart**                 | A9. Màu phẳng, không gradient fill; vùng (area) dùng màu đặc alpha 0.12 + đường viền.                                                                                                                                                           |

> **Biến thể Admin (Transit Desk — A9):** trong `/admin/**`, các thành phần trên dùng token `td-*`: CTA cam amber `td-oxide` (cùng màu thương hiệu với khu khách), control 36px bo 4px, input `.admin-input` 6px, bảng kiểu sổ mở với rule `td-ink`/`td-rule` (không card, không shadow), trạng thái render bằng `AdminStatusBadge` (glyph + mono) thay cho chip pill. Chi tiết tại A9 và `docs/admin-ui.md`.

---

## A7. Chuyển động (Motion) — GSAP

### A7.1 Triết lý

- Chuyển động đi theo **vật liệu**: kính "nghiêng vào ánh sáng" (nổi lên, rim sáng hơn), không phải hình học nhảy nhót.
- Mặc định `expo.out`/`power3.out`. Nảy (`back.out(1.2)`, `elastic.out(1, 0.75)`) chỉ cho bật/tắt, huy hiệu, xác nhận thành công — không dùng cho khối lớn.
- Chỉ animate `transform` và `opacity` (và `box-shadow`/`border-color` cho hover). **Cấm** animate `width`, `height`, `top`, `left`, `margin`, bán kính blur.
- Mọi danh sách vào bằng **stagger** (không mount đột ngột). Mọi animation phải dọn dẹp khi unmount.
- Tôn trọng người dùng: `prefers-reduced-motion` → trạng thái cuối xuất hiện ngay, không di chuyển, không loop; nội dung không bao giờ phụ thuộc animation mới hiển thị.

### A7.2 Mã nguồn dùng chung `src/lib/motion/`

```text
register.ts   đăng ký MỘT LẦN: gsap, useGSAP, ScrollTrigger, Flip, SplitText (chỉ client)
tokens.ts     durations, eases, distances (khớp CSS tokens)
media.ts      gsap.matchMedia(): reduce-motion, mobile (<768), low-power
reveal.ts     useReveal (đơn lẻ), useRevealBatch (ScrollTrigger.batch cho danh sách)
text.ts       useSplitReveal (SplitText, aria tự động)
number.ts     useCountUp (đếm số, tôn trọng reduce-motion)
flip.ts       useFlipList (Flip: sắp xếp/lọc lại lưới)
hover.ts      helper hover bằng gsap.quickTo (không custom cursor)
parallax.ts   useParallax (scrub, chỉ transform)
three.ts      cầu nối scroll/pointer -> camera/model R3F (A8)
index.ts
```

Quy tắc kỹ thuật (theo skill gsap-react/gsap-performance/gsap-scrolltrigger):

- Dùng `useGSAP(() => {...}, { scope: ref })`; chọn phần tử bằng ref/scope, **không** selector toàn cục. Handler chạy sau (click, pointer) bọc `contextSafe`.
- **Không** chạy `gsap`/`ScrollTrigger` khi SSR/prerender: toàn bộ nằm trong client component; dự án đang static export nên các component animation đều có `"use client"`.
- ScrollTrigger chỉ đặt trên timeline/tween cấp cao nhất, không lồng. Danh sách dùng `ScrollTrigger.batch`. `pin` chỉ ở các section landing được chỉ định, không pin phần tử đang animate chính nó. `scrub` mặc định `0.6–1`. `ScrollTrigger.refresh()` chỉ khi bố cục thực sự đổi (ảnh tải xong, filter đổi), có debounce.
- **Không dùng ScrollSmoother/cuộn giả lập** (phá cuộn gốc, sticky, a11y, mobile).
- `gsap.matchMedia()` cho ba nhánh: `reduce` (đặt trạng thái cuối, không loop), `(max-width: 767px)` (giảm quãng đường, tắt pin/parallax), thiết bị yếu (tắt 3D, giảm stagger).
- Tween tần suất cao (theo con trỏ) dùng `gsap.quickTo`. Không tạo hàng trăm tween đồng thời; danh sách dài chỉ animate phần tử trong viewport.
- Chữ tách ký tự bằng `SplitText` (tự thêm `aria-label` cho cha và `aria-hidden` cho ký tự); thay thế `RevealText` CSS hiện tại.

### A7.3 Danh mục chuyển động

| Tên            | Kích hoạt                         | Thuộc tính                                       | Thời lượng / Ease               | Ở đâu                              |
| -------------- | --------------------------------- | ------------------------------------------------ | ------------------------------- | ---------------------------------- |
| Page enter     | Mount route                       | `opacity 0→1`, `y 12→0` trên khối nội dung chính | 0.5s `expo.out`                 | Mọi route                          |
| Section reveal | Vào viewport (`start: "top 85%"`) | `opacity`, `y 28→0`, `scale .98→1`               | 0.7s `expo.out`, stagger 0.07   | Landing, trang công khai           |
| Card batch     | `ScrollTrigger.batch`             | như trên                                         | stagger 0.06                    | Lưới xe, gói, chi nhánh            |
| Card hover     | Pointer hover                     | ảnh `scale 1→1.04`; thẻ `y -4` + bóng            | 0.4s/0.7s `expo.out`            | VehicleCard, PlanCard              |
| Press          | `pointerdown`                     | `y +1`, `scale .98`                              | 0.12s                           | Button                             |
| Headline split | Vào viewport                      | `SplitText` lines/words `y 100%→0` có mask       | 0.8s `power4.out`, stagger 0.04 | Hero, tiêu đề section              |
| Scrub text     | Cuộn                              | opacity từ chữ này sang chữ khác (0.15→1)        | `scrub: 1`                      | 1 đoạn giới thiệu ở landing        |
| Pinned story   | Cuộn                              | Tiêu đề pin trái, danh sách cuộn phải            | `scrub: 0.8`                    | Landing "Cách hoạt động" (desktop) |
| Dialog enter   | Mở                                | panel `y 24→0`, `opacity`; nền che `opacity`     | 0.35s `expo.out`                | Modal/Drawer                       |
| Tab indicator  | Đổi tab                           | `x` + `scaleX` của thanh chỉ báo                 | 0.3s `power3.out`               | Tabs                               |
| Filter reflow  | Đổi bộ lọc                        | `Flip` vị trí thẻ còn lại, thẻ mới fade-in       | 0.45s `power3.inOut`            | `/find`                            |
| Gallery swap   | Chọn ảnh                          | `Flip` thumbnail → ảnh chính                     | 0.5s `expo.out`                 | Chi tiết xe                        |
| Count-up       | Vào viewport / có dữ liệu         | số đếm đến giá trị                               | 0.9s `power2.out`, một lần      | KPI dashboard                      |
| Status pulse   | Trạng thái "đang diễn ra"         | `opacity` chấm trạng thái 1↔0.5                  | 1.6s loop `sine.inOut`          | Chỉ chấm trạng thái live           |
| Marquee        | Liên tục                          | `x`                                              | 35s linear, dừng khi hover      | Hàng logo/đối tác (có thì dùng)    |
| Success pop    | Hành động thành công              | icon `scale .6→1`                                | 0.5s `back.out(1.4)`            | Toast, hoàn tất đặt xe             |
| Skeleton pulse | Đang tải                          | opacity                                          | 1.2s loop                       | Mọi skeleton                       |

"Vi chuyển động vĩnh cửu" (loop) chỉ được ở: chấm trạng thái live, marquee, auto-rotate chậm của mô hình 3D khi đang trong viewport. Khu admin không có loop nào khác.

---

## A8. 3D (React Three Fiber)

3D là **điểm nhấn có chọn lọc**, không phải nền tảng. Chỉ ở hai nơi được duyệt:

| #   | Vị trí                                    | Hành vi                                                                                                                                                | Ghi chú                                                                                                 |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 1   | **Landing hero — "Showroom turntable"**   | Một mô hình xe đứng trên mặt phẳng, xoay theo tiến độ cuộn (GSAP ScrollTrigger scrub → `rotation.y` + dolly camera), kính bảng tìm kiếm phủ phía trước | Desktop + tablet. Mobile: ảnh poster tĩnh                                                               |
| 2   | **Chi tiết xe — tab "Xem 3D (minh họa)"** | Xoay bằng kéo ngang/nút, đổi màu thân theo `vehicles.color`                                                                                            | Ảnh thật luôn là tab mặc định; có chú thích "Mô hình minh họa theo dòng xe; ảnh thực tế ở thư viện ảnh" |

Khu admin: **không** có 3D. Không thêm vị trí thứ ba nếu chưa sửa tài liệu này.

Kỹ thuật & ngân sách:

- Stack: `three`, `@react-three/fiber` (bản tương thích React 19), `@react-three/drei` (`useGLTF`, `ContactShadows`, `Preload`). Tải bằng `next/dynamic(..., { ssr: false })` + `Suspense` có skeleton đúng kích thước (không chữ "Loading 40%").
- Canvas **trong suốt** (`alpha: true`), hậu cảnh là Stage của trang (ảnh/khối đặc) — **không** nền gradient trong cảnh. Đèn: 1 directional + 1 hemisphere + `ContactShadows`; không HDRI tải từ mạng.
- Mô hình: GLB nén Draco/Meshopt + texture WebP, **<= 1.5 MB**, **<= 60k tam giác**, texture <= 2048px, vật liệu thân xe đặt tên `body` (để đổi màu), gốc tọa độ ở tâm sàn, hướng trước +Z. Đặt tại `public/models/{sedan,suv,hatchback,pickup,scooter,ev-scooter}.glb` kèm `poster/*.webp` và `public/models/CREDITS.md` (giấy phép CC0/CC-BY; ghi nguồn).
- Render: `dpr={[1, 1.5]}`, `frameloop="demand"`; chỉ chuyển `always` khi phần tử **đang trong viewport** (IntersectionObserver) và `document.visibilityState === "visible"`, tự dừng sau 20s không tương tác. Hủy tài nguyên khi unmount (`dispose`).
- Phải có **fallback poster** khi: không WebGL; `prefers-reduced-motion`; `navigator.connection.saveData`; `hardwareConcurrency <= 4` hoặc `deviceMemory <= 4`; mất ngữ cảnh WebGL (`webglcontextlost`); tải mô hình lỗi. Poster là ảnh `<img>` có `alt`.
- Không chặn cuộn trang: wrapper canvas `touch-action: pan-y`; chỉ kéo **ngang** xoay mô hình; `enableZoom={false}`, `enablePan={false}`.
- A11y: canvas `aria-hidden="true"`; luôn có văn bản mô tả liền kề và nút "Xoay trái/phải" cho bàn phím ở tab 3D.
- Bảng ánh xạ màu: `Trắng→#F2F2F0, Đen→#1A1A1A, Bạc→#B8BCBF, Xám→#6B7075, Đỏ→#9B1C1C, Xanh dương→#1E3A8A, Xanh lá→#14532D, Vàng→#B7791F`; màu lạ → xám trung tính.
- Nếu thiếu tài sản GLB: component hiển thị poster/ảnh xe và ghi log một lần ở dev; **không** dựng "xe giả" bằng hình khối thô.

---

## A9. Khu vực Admin / Staff — “Transit Desk” (Graphite Glass Deck · Palette A)

**Quy chuẩn triển khai:** xem `docs/admin-ui.md`. Admin dùng ngôn ngữ thị giác **Transit Desk**: nền giấy ấm, mực graphite, CTA cam amber, nhấn champagne; bố cục **folio + sổ mở (open ledger)** thay cho lưới card bo tròn. Component chuẩn: `TransitDeskShell` (khung + điều hướng + theme), `TransitFolio` (tiêu đề trang), `AdminFilters` (bộ lọc), `AdminTable`/`DataTable` (bảng), `AdminStatusBadge` (trạng thái), `FormDialog` (popup). Sửa style tại các component này để mọi trang cập nhật cùng nhau.

**Khung và điều hướng.** Masthead + dải route ngữ cảnh nằm trong một khối **dính đỉnh** (`.topBar`, `position: sticky; top: 0; z-index: 30`), nên cả hai luôn hiện khi cuộn và không bị lệch khi masthead xuống hai dòng ở `≤1280px`. `html[data-admin-theme]` đặt `scroll-padding-top: 132px` để anchor/focus không bị thanh dính che. Route điều hướng theo 8 chương (`Ca trực`, `Vận hành`, `Điều phối`, `Chăm sóc & Sự cố`, `Đội xe`, `Chính sách`, `Tổ chức`, `Cá nhân`), mỗi chương có số hiệu folio cố định (01 OPS · 02 FLT · 03 TRI · 04 OPS/INS · 05 DSP · 06 PLC · 07 ORG · 08 ME). `Ctrl/⌘ + K` mở `TransitDeskRouteIndex`.

**Bảng màu (Palette A).** Light: `td-paper #FAF8F5`, `td-white #FFFFFF`, `td-ink #1F1B22`, `td-muted #58515E`, `td-rule rgba(31,27,34,.12)`, `td-oxide #B45309`, `td-teal #7A5B18`, `td-chalk #F0ECE6`. Dark: `td-paper #17161B`, `td-white #242126`, `td-ink #F5F1EC`, `td-muted #9E97A3`, `td-oxide #F6BA7C`, `td-teal #C8A96B`, `td-chalk #1C1A20`. `td-oxide` tham chiếu `--primary` ở cả hai theme; mọi cổng dùng chung cam amber. Chữ CTA dùng `--on-primary`: trắng ở light, `#17161B` ở dark.

**Hình khối và mực.** Nút/control **4px**, ô nhập `.admin-input` **6px**, bề mặt hồ sơ **4px**; không dùng bo 12/16px cho phần tử mới. Phân tách bằng đường kẻ 1px `td-rule`, rule đầu bảng/khối bằng `td-ink`; **không** dùng `shadow-e1/e2` và không lồng card để trang trí. Nhãn phụ, số liệu, ID, ngày giờ và trạng thái render bằng `font-mono` chữ hoa nhỏ (`10–11px`, `tracking-wider`); tiêu đề folio nhấn bằng `<em class="italic text-td-teal">`.

**Folio header.** Mỗi trang cấp 1 mở bằng `TransitFolio`: số chương + tag mono, kicker viết hoa, `h1` lớn (tối đa `text-5xl`), một câu mô tả, vùng phải chứa **một** số liệu tổng (`TransitFolioMetric`) và/hoặc **một** hành động chính có nhãn chữ. Mobile: vùng phải xuống dòng dưới tiêu đề.

**Sổ mở thay cho card.** Danh sách render kiểu ledger: head mono chữ hoa với rule `td-ink`, hàng phân tách `td-rule`, hover `td-chalk`; bảng rộng cuộn trong wrapper, toàn trang không tràn ngang. Trạng thái hiển thị bằng **glyph hình học + nhãn mono** (`AdminStatusBadge`), không dùng pill màu; bảng ánh xạ duy nhất `status-rules.ts` với các domain `activity`, `vehicle`, `rental`, `maintenance`, `license`, `shift`, `report`, `review`.

**Trang chi tiết/hồ sơ.** Lưới 12 cột: 4 cột hồ sơ định danh (avatar 64px bo 4px, tên, badge, danh sách `dl` dòng `divide-y`), 8 cột biểu mẫu/bảng. Ghi chú quyền/nghiệp vụ dùng `border-l-2 border-td-oxide`; không dùng banner nền tối hay khối nền màu.

**Ngoại lệ `/admin/rentals`.** Trang Vận hành đơn thuê giữ art-direction riêng "Graphite Glass Deck": canvas tối, stage kính, cockpit 3 cột, chuyển theme bằng `RentalLiquidTransition`. Route này **full-bleed** (`[data-subportal="rental-v4"] .mainContent` bỏ padding/max-width; desktop dùng shell `100dvh` và flex chia phần chiều cao còn lại cho workspace, ba cột cuộn độc lập; ở `≤1200px` xếp dọc và cuộn trang tự nhiên) nên không lồng trong khung giấy của shell và không dùng `TransitFolio`.

Các quy tắc vẫn giữ nguyên:

- **Popup:** bắt buộc `FormDialog` với `FormDialogFooter` nằm trong `ValidatedForm`; header/footer sticky, khôi phục focus, khóa đóng/gửi khi busy. `ADMIN_POPUP_FORM` trong design lint kiểm tra cấu trúc.
- **Bộ lọc:** `AdminFilterBar` + `AdminFilterField` + `AdminFilterButton`; nhãn mono, control 36px gạch chân, nút áp dụng cam amber, tách giá trị đang nhập và giá trị đã áp dụng khi submit.
- **Tải dữ liệu:** `SkeletonBlock`, `FormSkeleton`, `AdminTableSkeleton` theo hình dạng nội dung; thông báo tiếng Việt cho trình đọc màn hình; tắt chuyển động khi reduced motion; không hiện dữ liệu trống khi request chưa xong.
- **Thao tác danh sách:** cột `data-actions` dùng `AdminRowAction`, chỉ icon + tooltip tiếng Việt, vùng bấm 36px; ánh xạ `view`/`edit`/`delete`/`activate`/`deactivate` tại `row-action-rules.ts`; không dựng cột trống khi nghiệp vụ không có thao tác.
- **Trạng thái áp dụng:** `activate` = `CirclePlay`, `deactivate` = `PauseCircle`; xác nhận trước gửi, khóa khi chờ, badge đổi sau khi API thành công. Chính sách chỉ đổi `isActive`, điều khoản lưu theo phiên bản (FR-011/ADR-006).
- **Bản đồ:** cơ sở/điểm nhận dùng địa chỉ thật; xe và hành trình dùng tọa độ GPS từ API, không tạo tọa độ dự phòng. Xem `docs/google-maps-frontend.md`.
- **Ngày giờ:** `formatAdminDateTime` (`dd/MM/yyyy HH:mm`) hoặc `formatAdminDate` (`dd/MM/yyyy`) theo `Asia/Ho_Chi_Minh`.
- Motion tối thiểu: fade 160ms khi đổi tab/panel, drawer trượt 320ms, skeleton pulse, count-up KPI một lần, đường biểu đồ 600ms. Không parallax/pin/3D trong Admin (trừ trang thuê xe có liquid transition theo reduced-motion).
- Biểu đồ (Recharts): không gradient fill, dùng 5 màu `--chart-*` kèm nhãn trực tiếp, luôn có nút "Xem dạng bảng", tắt animation khi reduce-motion.

Bảng ánh xạ trạng thái → tone (render bằng `AdminStatusBadge` glyph + mono):

| Nhóm                | Giá trị                                            | Màu                                           | Icon                                                          |
| ------------------- | -------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| rentals.status      | pending                                            | warning                                       | Clock                                                         |
|                     | pre_inspection                                     | info                                          | ClipboardCheck                                                |
|                     | renting                                            | success (có chấm live)                        | Car                                                           |
|                     | post_inspection                                    | info                                          | ClipboardList                                                 |
|                     | completed                                          | neutral (Sunken/Ink)                          | CheckCircle2                                                  |
|                     | cancelled                                          | danger                                        | XCircle                                                       |
| vehicles.status     | available / renting / maintenance / inactive       | success / info / warning / neutral            | CircleCheck / Car / Wrench / PauseCircle                      |
| vehicle_assignments | assigned / reassigned / completed / cancelled      | info / neutral / neutral / danger             | UserCheck / Repeat / Check / X                                |
| invoices/payments   | unpaid·paid·refund requested·refunded·rejected     | warning·success·info·neutral·danger           | Receipt·BadgeCheck·Undo2·Undo2·Ban                            |
| license / GPLX      | pending / approved / rejected / expiring / expired | warning / success / danger / warning / danger | Hourglass / ShieldCheck / ShieldX / AlertTriangle / ShieldOff |

---

## A10. Truy cập & tùy chọn người dùng

- Mục tiêu **WCAG 2.2 AA**. Ngôn ngữ trang `lang="vi"`.
- **Focus:** `:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }`; trên nền tối/kính đen: `outline-color: #FFFFFF` kèm `box-shadow: 0 0 0 4px var(--stage-ink)`. Không bao giờ `outline: none` mà không thay thế.
- Vùng chạm >= 44×44 (công khai), >= 32×32 (admin, thấp nhất 24 theo WCAG 2.2 SC 2.5.8).
- Thông tin không chỉ bằng màu: trạng thái luôn có icon + chữ; biểu đồ có nhãn/họa tiết.
- Bàn phím: mọi tương tác thực hiện được không cần chuột; Dialog/Drawer/Popover/Combobox dùng Radix (đã xử lý focus trap, roving focus, Esc). Có liên kết "Bỏ qua điều hướng" đầu trang. Thay đổi route chuyển focus về `<h1>` hoặc `<main tabindex="-1">`.
- Vùng thông báo: số kết quả tìm kiếm, lưu thành công, lỗi biểu mẫu qua `aria-live="polite"`; lỗi chặn gửi đưa focus tới ô lỗi đầu tiên.
- Tôn trọng: `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, `forced-colors`. Khu công khai giữ `color-scheme: light`; Admin có lựa chọn sáng/tối, mặc định theo `prefers-color-scheme` khi người dùng chưa lưu lựa chọn, khai báo `color-scheme` tương ứng và đổi token thay vì filter đảo màu.
- Chữ tăng 200% không vỡ bố cục; không dùng `user-scalable=no`.

---

## A11. Điều cấm (Anti-patterns)

1. Mọi dạng gradient (`*-gradient`, mesh, text gradient, shimmer gradient, viền gradient), aurora/orb mờ.
2. Emoji ở bất cứ đâu trong giao diện, mã, chú thích; dùng icon Lucide.
3. Font Inter; font thiếu subset tiếng Việt; serif trong dashboard.
4. `#000000`; `#FFFFFF` làm nền trang; chữ `#999999`; chữ cam/vàng nhạt trên trắng.
5. Neon/outer glow, bóng màu; điểm nhấn thứ hai; tím/xanh dương neon.
6. `backdrop-filter` trên phần tử lặp lại; chồng kính lên kính; animate bán kính blur.
7. Hero: pill-tag dưới tiêu đề, huy hiệu/"stamp" nổi trên chữ, số liệu thô, mũi tên "scroll", H1 > 3 dòng, nhiều hơn một CTA chính.
8. Hàng 3 thẻ bằng nhau; thẻ lồng thẻ; lưới có ô trống; nhãn kiểu "SECTION 01"/"ABOUT US".
9. Custom cursor; ScrollSmoother; parallax khắp nơi; 3D ngoài hai vị trí được duyệt.
10. Tên giả ("John Doe", "Acme", "Nexus"), số tròn giả (99.99%, 50%), văn phong AI ("Elevate", "Seamless", "Unleash", "Next-Gen").
11. Spinner tròn cho tải danh sách/trang; trang trống trong lúc tải; hiển thị lỗi kỹ thuật thô cho khách.
12. `h-screen`; cuộn ngang trên mobile; animate `width/height/top/left`.
13. Ảnh Unsplash hotlink; ảnh nền không có scrim khi đặt chữ trực tiếp lên ảnh.

---

## A12. Token cho Tailwind v4 (`src/app/globals.css`)

```css
@import "tailwindcss";

/* Khối :root ở A4.3 đặt ngay dưới. Ánh xạ sang tiện ích Tailwind: */
@theme inline {
  --font-sans:
    var(--font-be-vietnam), system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:
    var(--font-geist-mono), ui-monospace, "SFMono-Regular", Menlo, monospace;

  --color-canvas: var(--canvas);
  --color-sunken: var(--sunken);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-line: var(--line);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-press: var(--primary-press);
  --color-primary-tint: var(--primary-tint);
  --color-primary-graphic: var(--primary-graphic);
  --color-success: var(--success);
  --color-success-bg: var(--success-bg);
  --color-warning: var(--warning);
  --color-warning-bg: var(--warning-bg);
  --color-danger: var(--danger);
  --color-danger-bg: var(--danger-bg);
  --color-info: var(--info);
  --color-info-bg: var(--info-bg);

  --radius-control: var(--r-control);
  --radius-card: var(--r-card);
  --radius-panel: var(--r-panel);

  --shadow-e1: var(--e1);
  --shadow-e2: var(--e2);
  --shadow-e3: var(--e3);
  --ease-out: var(--ease-out);
}

html {
  color-scheme: light;
}
body {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-sans);
}
main {
  overflow-x: clip;
}
```

Ánh xạ từ token cũ sang token mới (dùng cho P1): `--color-text → --ink`, `--color-text-secondary → --ink-2`, `--color-text-muted → --ink-3` (khác giá trị!), `--color-background → --canvas`, `--color-surface (#fff) → --surface`, `--color-border → --line`, `--color-success/warning/error/info → bộ cặp trạng thái mới`, `--radius-sm/md/lg/xl → --r-control/--r-card/--r-panel`, `.glass-nav → .glass-1`, `.glass-search → .glass-2`, `.glass-card → .glass-lite` (danh sách) hoặc `.glass-2` (panel đơn), `.glass-card-elevated → .glass-3` + viền Emerald, `.glass-hover → .glass-lift`, `.glass-dark/.glass-certificate → .glass-ink / .glass-3`, `.specular-border`, `.specular-emerald`, `.ambient-glow-orb`, `.orb-drift*` → **xóa**.

---

## A13. Triển khai, kiểm thử, kiểm soát hồi quy

**Múi giờ:** API trao đổi UTC (ISO-8601, hậu tố `Z`). UI hiển thị và nhập theo `Asia/Ho_Chi_Minh` (GMT+7) bằng `date-fns` + `@date-fns/tz`. Không dùng `new Date(string)` mơ hồ để parse giờ nhập.

**Design lint (CI, `scripts/check-design-rules.mjs`)** — thất bại build nếu trong `src/**/*.{ts,tsx,css}`:
`gradient(`, `bg-gradient-`, `from-`/`via-`/`to-` kết hợp `bg-gradient`, `#000` / `#000000`, emoji (U+1F000–1FAFF, U+2600–27BF trừ ký tự dấu tích), `h-screen`, font `Inter`, chuỗi `Scroll to explore`, `backdrop-blur-*` hoặc `backdrop-filter` ngoài các lớp `.glass-1/2/3/ink/admin` đã khai báo ở `globals.css`.

**Kiểm thử thị giác & hiệu năng (FE-20):**

- Playwright chụp ảnh mỗi route ở 375 / 768 / 1280 / 1920, trạng thái: loading, empty, error, populated, focus, hover, dialog mở; lặp lại với `prefers-reduced-transparency`, `prefers-reduced-motion`, `forced-colors`.
- axe-core (`@axe-core/playwright`) không có vi phạm `serious`/`critical`; tương phản kiểm tra thêm bằng script trên các lớp kính.
- Ngân sách: LCP < 2.5s (4G trung bình), CLS < 0.1, INP < 200ms; số phần tử `backdrop-filter` đúng A4.4; JS mỗi route công khai ≤ 180 KB gzip (không tính chunk 3D tải lười).
- Mọi chuyển động phải có bản `reduce`: test Playwright với `reducedMotion: "reduce"` xác nhận phần tử hiển thị ngay và không có `transform` còn dở.

---

# B. PRODUCT & UX SPECIFICATION

> Phần B giữ nguyên tinh thần v2.0 (đặc tả sản phẩm, luồng, trạng thái, quy tắc). Các mục đã được chỉnh để khớp Phần A: bỏ emoji, thay token cũ, cập nhật bản đồ/đánh giá theo kế hoạch mở rộng, bổ sung quy tắc nghiệp vụ mới (đệm giữa hai lượt thuê, quá giờ, hủy đơn, điểm thưởng).

## 1. Product Overview

The system serves:

- **Customers** — thuê xe (tự lái hoặc có tài xế) và/hoặc mua gói thuê bao
- **Staff** của đơn vị vận hành — điều phối/bán hàng, tài xế (`staffs.is_driver = true`) và nhân viên bảo dưỡng
- **Admin** — tài khoản Staff có role `Admin`, cấu hình policy/plan/RBAC

RBAC roles: `Customer`, `Staff`, `Admin`, `Manager`, `Driver`, `Maintenance` (`roles` + `user_roles`; một user có thể có nhiều role; `Manager` được thêm bởi migration 0005).

The primary customer journey is:

```text
Landing Page
    ↓
Select facility + rental time + hình thức
    ↓
Search available vehicles
    ↓
Filter / sort
    ↓
View vehicle
    ↓
Send rental request
    ↓
Staff xác nhận & gán xe/tài xế
    ↓
Pre-rental inspection + pay deposit
    ↓
Receive vehicle / start trip
    ↓
Return vehicle + post-rental inspection
    ↓
Quyết toán / hoàn cọc
```

Ngoài phạm vi v2.0: thuê xe tải chuyên dụng, tích hợp bảo hiểm tự động, ứng dụng đa ngôn ngữ, chia sẻ xe ngang hàng (peer-to-peer).

The system should feel:

- Modern
- Trustworthy
- Mobile-first
- Simple
- Automotive
- Travel-oriented
- Friendly rather than corporate
- Focused on getting the user from "I need a car" → "I found a car"

---

# 2. Design Principles

## 2.1 Search-first

The most important action is finding a vehicle.

The homepage should immediately answer:

> Where do you want the car, and when do you need it?

Do not overload the hero section with unnecessary information.

---

## 2.2 Trust before conversion

Users are renting relatively expensive physical assets.

Important trust signals:

- Vehicle photos (`vehicle_imgs`, `vehicles.main_img_url`)
- Vehicle type và thông số thật (`car_detail`, `motorbike_detail`, `electric_car_detail`, `electric_motorbike_detail`)
- Chi nhánh sở hữu xe và trạng thái xe (`available` / `renting` / `maintenance`)
- Kết quả kiểm định trước/sau thuê (`inspections`)
- Giá và chính sách thuê đang áp dụng (VAT, % cọc, phí trễ)
- Điều kiện thuê, chính sách huỷ và hoàn cọc
- Trạng thái duyệt GPLX của khách (`pending` / `approved` / `rejected`)

---

## 2.3 Visual vehicle discovery

Cars are visual products.

Vehicle cards should prioritize:

```text
Image
↓
Brand + model
↓
Vehicle type + year / transmission / seats
↓
Status & facility
↓
Price
↓
Nhận xe tại chi nhánh / giao xe tận nơi
```

The vehicle image should occupy the majority of the card.

---

## 2.4 Progressive disclosure

Do not show every vehicle attribute immediately.

Initial card:

```text
Vehicle image
Vehicle name (brand + model)
Vehicle type
Basic specifications
Price (theo giờ / theo tháng)
Facility
```

Detailed page:

```text
Gallery
Description
Specifications (theo loại xe)
Rental policy (VAT, cọc, phí trễ)
Tình trạng / kiểm định gần nhất
Facility & nhận xe
Availability
Booking (trực tiếp hoặc dùng gói)
```

---

# 3. Brand Direction

## 3.1 Brand personality

The interface should communicate:

- Freedom
- Travel
- Reliability
- Convenience
- Community
- Modern technology

Avoid an overly luxury-oriented visual language.

The product should feel accessible to ordinary users renting cars for:

- Travel
- Family trips
- Business
- Weekend trips
- Moving
- Events
- Daily transportation

---

# 4. Color System

Nguồn xác thực: **Phần A, mục A2** (bảng màu, vai trò, tương phản đã đo). Tóm tắt:

- Điểm nhấn duy nhất: **Emerald Deep `#047857`** (hover `#065F46`, press `#064E3B`, tint `#E3F4EC`). Dùng cho CTA chính, link, trạng thái chọn, bộ lọc đang bật, giá nhấn mạnh, focus ring.
- Trung tính (một họ xanh-xám): Canvas `#F2F5F3`, Surface `#FFFFFF`, chữ `#0E1A16` / `#34443D` / `#566860`, viền `rgba(14,26,22,.10)`.
- Trạng thái Success/Warning/Danger/Info dùng theo **cặp chữ/nền** ở A2, luôn kèm icon và nhãn chữ.
- Không tô xanh toàn bộ giao diện: Emerald chiếm tối đa ~10% diện tích mỗi màn hình.
- Các giá trị cũ `#059669` (làm chữ hoặc nền nút chữ trắng: 3.77:1), `#999999` (2.85:1), `#F59E0B` (làm chữ: 2.15:1), `#222222/#666666` (lệch họ trung tính) **bị thay thế**.

---

# 5. Typography

Nguồn xác thực: **Phần A, mục A3**.

- Display + body: **Be Vietnam Pro** (có subset `vietnamese`); số liệu mật độ cao: **Geist Mono**. Inter bị cấm.
- Thang chữ dùng `clamp()`; hero tối đa 3 dòng; thân bài tối đa 65 ký tự mỗi dòng; không dưới 12px.
- Trọng số: 700–800 cho tiêu đề, 600 cho nhãn quan trọng, 400–500 cho chữ thường.
- Bắt buộc nạp subset `vietnamese` và kiểm tra glyph (cổng kiểm tra ở A3).

---

# 6. Layout

Desktop max width:

```text
1200–1280px
```

Horizontal page padding:

```text
Desktop: 24–40px
Tablet:  20–24px
Mobile:  16px
```

General spacing scale:

```text
4
8
12
16
24
32
48
64
80
```

Use large vertical spacing between major homepage sections.

---

# 7. Navigation

## Desktop Header

Thanh điều hướng **nổi dạng pill kính** (`.glass-1`), không phải thanh trắng đặc dính mép:

```text
        ┌──────────────────────────────────────────────────────────────┐
        │ Thong Dong   Thuê xe   Gói thuê bao   Hướng dẫn   Cổng nhân viên │
        │                                          Đăng nhập   Đăng ký  │
        └──────────────────────────────────────────────────────────────┘
```

Header requirements:

- Pill `.glass-1`, cách mép trên 16px, `position: fixed`, rộng tối đa 1160px, đè lên Stage (ảnh hero) hoặc nội dung cuộn phía sau.
- Logo bên trái; điều hướng chính giữa/trái; hành động tài khoản bên phải.
- Khi cuộn xuống pill thu gọn (giảm padding, `scale` nhẹ) bằng GSAP trên `transform`/`opacity`, không gây dịch chuyển bố cục (A7).
- Chữ luôn là Garage Ink (không dùng Ink Muted trong pill); mục đang chọn có chỉ báo Emerald bằng `transform`.
- Mobile: header gọn + thanh điều hướng đáy (xem mục 42).

Primary navigation:

```text
Thuê xe
Gói thuê bao
Hướng dẫn
Cổng nhân viên (Staff/Admin)
```

Account:

```text
Đăng nhập
Đăng ký
```

"Cổng nhân viên" chỉ hiển thị với user có role `Staff`, `Admin`, `Manager` hoặc `Maintenance` (RBAC). Việc ẩn/hiện menu chỉ là tiện ích UX: **BE là nơi quyết định quyền truy cập**.

---

# 8. Homepage

## 8.1 Hero

The hero is the most important section.

Suggested structure:

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Thuê xe cho mọi hành trình             │
│                                                     │
│     Tự do khám phá. Chủ động từng chuyến đi.        │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Địa điểm                                      │   │
│ │ TP. Hồ Chí Minh                               │   │
│ ├──────────────────────┬────────────────────────┤   │
│ │ Nhận xe              │ Trả xe                 │   │
│ │ Date / Time           │ Date / Time            │   │
│ ├──────────────────────┴────────────────────────┤   │
│ │                 TÌM XE                         │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Hero background should use a high-quality vehicle/travel image.

Do not let the background overpower the search interface.

Quy tắc Phần A áp dụng cho hero: Stage Photo + Scrim phẳng (không gradient), bảng tìm kiếm `.glass-2`, H1 tối đa 3 dòng, một CTA chính, không pill-tag, không số liệu thô, không mũi tên cuộn. Mô hình 3D "Showroom turntable" (A8) là tùy chọn, có poster dự phòng.

---

# 9. Search Widget

The search component is the core interaction.

## Fields

### Chi nhánh nhận xe

```text
Chi nhánh nhận xe
Chi nhánh Quận 1, TP. Hồ Chí Minh
```

Allow:

- Chi nhánh (`facilities`) trong danh mục
- Giao xe tận nơi (`pick_up_method`, `pickup_location`)
- Sân bay / địa chỉ cụ thể nếu chi nhánh hỗ trợ

---

### Start date/time

```text
Nhận xe
02/10/2026
09:00
```

---

### End date/time

```text
Trả xe
04/10/2026
18:00
```

---

### Search CTA

```text
Tìm xe
```

Primary button.

---

# 10. Rental Modes

The product supports several orthogonal choices:

```text
Tự lái             (hour_rental_detail.has_driver = false)
Có tài xế          (hour_rental_detail.has_driver = true)
Theo giờ           (rentals.rental_type = 'hourly')
Dài hạn            (rentals.rental_type = 'longterm', không kèm tài xế)
Trả trực tiếp      (is_subscription = false → có Invoice)
Dùng gói thuê bao  (is_subscription = true → trừ remaining_hours)
```

Use tabs:

```text
┌──────────────┬─────────────────┐
│ Tự lái       │ Có tài xế       │
└──────────────┴─────────────────┘
```

Icon Lucide: `Car` (Tự lái), `UserRound` (Có tài xế). Changing mode should change the search form. `Dài hạn` không có lựa chọn tài xế (bảng `longterm_rental_contract` không có cột driver).

---

# 11. Homepage Sections

Recommended order:

```text
Hero / Search
        ↓
Chi nhánh (facilities)
        ↓
Xe được yêu thích
        ↓
Loại phương tiện (4 loại)
        ↓
Vì sao chọn hệ thống
        ↓
How it works
        ↓
Gói thuê bao
        ↓
Mobile application (Flutter)
        ↓
Footer
```

---

# 12. Chi nhánh (Facilities)

Display the branches (`facilities`) customers can pick up from.

Example:

```text
Chi nhánh Quận 1
Chi nhánh Tân Bình
Chi nhánh Sân bay Tân Sơn Nhất
Chi nhánh Hà Nội
```

Card:

```text
┌─────────────────────┐
│                     │
│    Branch Image     │
│                     │
│ Chi nhánh Quận 1    │
│ 12 xe available     │
└─────────────────────┘
```

Lưu ý: `vehicles.current_location` là văn bản (chi nhánh/địa chỉ), không phải toạ độ GPS.

---

# 13. Vehicle Discovery

## Section title

```text
Xe được yêu thích
```

Subtitle:

```text
Khám phá những lựa chọn phù hợp cho hành trình của bạn
```

Horizontal card carousel on desktop/mobile.

---

# 14. Vehicle Card

Primary component:

```text
┌────────────────────────────┐
│                            │
│        VEHICLE IMAGE       │
│                            │
├────────────────────────────┤
│ Toyota Corolla Cross       │
│ Ô tô · Đời 2024            │
│                            │
│ 5 chỗ  ·  Tự động          │
│                            │
│ 90.000đ / giờ              │
│ 12.000.000đ / tháng        │
│ Chi nhánh Quận 1           │
└────────────────────────────┘
```

Icon Lucide thay emoji: `Armchair` (số chỗ), `Settings2` (truyền động), `Zap` (xe điện), `MapPin` (chi nhánh). Phần thông tin thẻ dùng `.glass-lite` (không blur), ảnh >= 60% diện tích thẻ.

Optional badges:

```text
Có tài xế
Xe điện
Dùng được gói thuê bao
Sẵn sàng
```

The search/filter experience exposes filters such as vehicle type, facility, price, seats/transmission (ô tô), bike type (xe máy), battery/range (xe điện), production year, fuel type and hourly vs long-term.

---

# 15. Search Results Page

URL concept:

```text
/find
```

or:

```text
/find/filter
```

Layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Search summary                                          │
│ TP. Hồ Chí Minh · 02/10 → 04/10                         │
├───────────────────┬─────────────────────────────────────┤
│ FILTERS           │ RESULTS                             │
│                   │                                     │
│ Giá               │ 120 xe                             │
│ Hãng xe           │                                     │
│ Loại xe           │ [Card] [Card] [Card]               │
│ Số chỗ             │                                     │
│ Nhiên liệu        │ [Card] [Card] [Card]               │
│ Tính năng         │                                     │
│                   │                                     │
│                   │ Sort                                │
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

---

# 16. Search Filters

### Basic filters

```text
Mức giá (theo giờ / theo tháng)
Loại phương tiện  (Ô tô / Xe máy / Ô tô điện / Xe máy điện)
Hãng xe (brand)
Chi nhánh (facility)
Hình thức (Tự lái / Có tài xế)
Thời hạn (Theo giờ / Dài hạn)
```

### Vehicle

```text
Số chỗ (car_detail)
Truyền động (car_detail)
Loại xe máy (motorbike_detail)
Dung tích pin / quãng đường tối đa (electric_*_detail)
Năm sản xuất
Nhiên liệu (vehicle_types.fuel_type)
```

---

# 17. Search Result Sorting

Options:

```text
Đề xuất
Giá thấp → cao
Giá cao → thấp
Chi nhánh gần nhất
Mới nhất (năm sản xuất)
```

`Chi nhánh gần nhất` chỉ hiển thị khi BE-36 (tìm xe gần đây bằng Google Maps) đã sẵn sàng; trước đó ẩn tùy chọn này.

Keep sorting separate from filtering.

---

# 18. Vị trí xe & bản đồ

**Hiện tại (SRS v2.0 / DDL):** không có bản đồ GPS thời gian thực. DDL chỉ lưu `vehicles.current_location` dạng văn bản; chi nhánh (`facilities`) là đơn vị "vị trí" chính thức.

**Mở rộng theo kế hoạch (BE-35, BE-36, BE-37, FE-26, FE-27, MB-01):** tìm xe gần đây bằng Google Maps (tọa độ, bán kính, khoảng cách/ETA) và theo dõi hành trình. Chỉ bật khi các module đó hoàn tất và có nơi lưu tọa độ; trước đó dùng hiển thị theo chi nhánh bên dưới.

Hiển thị theo chi nhánh:

```text
┌───────────────────────────────────────┐
│ Chi nhánh Quận 1                      │
│ 12 Trần Hưng Đạo, Quận 1, TP.HCM      │
│                                       │
│ Xe tại chi nhánh này: 8 available     │
└───────────────────────────────────────┘
```

Khách chọn chi nhánh khi tìm xe và nhận xe tại đó hoặc yêu cầu giao xe tận nơi (`pick_up_method`, `pickup_location`).

Khi bản đồ được bật: bản đồ là Stage Content, panel điều khiển (bộ lọc, danh sách) là `.glass-2` nổi phía trên; marker dùng Emerald Graphic `#059669`; không chồng nhiều hơn 4 phần tử `backdrop-filter`; có danh sách thay thế cho người dùng bàn phím/trình đọc màn hình.

---

# 19. Vehicle Detail Page

The vehicle detail page should be conversion-focused.

## Header

```text
← Quay lại

Toyota Corolla Cross
Ô tô điện · 2024 · Chi nhánh Quận 1
```

---

## Image Gallery

Large primary image:

```text
┌──────────────────────────────────────┐
│                                      │
│             MAIN IMAGE               │
│                                      │
└──────────────────────────────────────┘

[img] [img] [img] [img] [Xem tất cả]
```

Use:

- 16:9 main image
- Rounded corners
- Thumbnail gallery
- Full-screen lightbox

## Tab nội dung chi tiết xe

```text
[ Ảnh ]  [ Xem 3D (minh họa) ]  [ Lịch trống ]
```

- **Ảnh** (mặc định): gallery + lightbox.
- **Xem 3D (minh họa):** mô hình theo dòng xe, đổi màu theo `vehicles.color`, kèm chú thích minh họa (A8). Ẩn tab khi thiết bị không đủ điều kiện hoặc thiếu mô hình.
- **Lịch trống:** các khoảng đã bận của xe (kèm đệm 60 phút giữa hai lượt), đối chiếu khung giờ khách chọn.

---

# 20. Vehicle Information

```text
Toyota Corolla Cross 1.8V

Ô tô · Đời 2024
32 chuyến

Chi nhánh Quận 1, TP. Hồ Chí Minh
```

Specifications:

```text
Số chỗ       5
Truyền động  Tự động
Nhiên liệu   Xăng
Năm SX       2024
```

---

# 21. Thuộc tính riêng theo loại phương tiện

Mỗi xe chỉ dùng đúng một bảng thuộc tính con tương ứng `vehicle_type_id`. Hiển thị dạng bảng, không đổ hết vào viewport đầu.

```text
Ô tô:          Số chỗ · Truyền động · Dung tích cốp
Xe máy:        Loại xe máy · Có cốp không
Ô tô điện:     Dung lượng pin · Kiểu sạc · Thời gian sạc · Quãng đường tối đa · Loại pin
Xe máy điện:   Dung lượng pin · Kiểu sạc · Thời gian sạc · Quãng đường tối đa · Loại pin
```

Use:

```text
Xem tất cả thông số
```

---

# 22. Chính sách thuê & đặt cọc

Thành phần tin cậy quan trọng — lấy từ `rental_policies` đang `is_active` của `vehicle_type_id`:

```text
┌─────────────────────────────────────┐
│ Chính sách thuê · Ô tô              │
│                                     │
│ VAT            10%                  │
│ Đặt cọc        10% tổng tiền thuê   │
│ Phí trả trễ    theo giờ             │
│                                     │
│ Áp dụng cho đơn này                 │
└─────────────────────────────────────┘
```

Chỉ một policy `is_active` được áp dụng mặc định; nếu có nhiều policy active, dùng policy mới nhất và nói rõ cho người dùng biết.

---

# 23. Pricing

Price must be highly visible.

```text
90.000đ / giờ
```

Booking summary:

```text
30 giờ
× 90.000đ
────────────────
Tiền thuê        2.700.000đ
VAT (10%)          270.000đ
Đặt cọc (10%)      297.000đ
Phí trả trễ        (nếu có)
────────────────
Tổng cộng        3.267.000đ
```

Do not hide mandatory fees until the final step.

Công thức khớp BE (FR-017/FR-019): tiền thuê = số giờ × giá snapshot; VAT = tiền thuê × `vat_rate`; **tổng tiền thuê = tiền thuê + VAT (+ quá giờ khi quyết toán)**; đặt cọc = tổng × `deposit_percentage`; **số tiền thanh toán trên hóa đơn = tổng + cọc**.

---

# 24. Booking CTA

Desktop:

```text
┌───────────────────────────────┐
│ 90.000đ / giờ                │
│                               │
│       ĐẶT XE                  │
└───────────────────────────────┘
```

Use sticky booking card on desktop.

Mobile:

```text
┌─────────────────────────────────┐
│ 90.000đ/giờ     [ĐẶT XE]       │
└─────────────────────────────────┘
```

Sticky bottom CTA.

---

# 25. Booking Flow

Booking flow của hệ thống:

```text
1. Register / Login (hoặc đăng ký bằng OTP)
2. Search vehicle (loại xe, chi nhánh, khung giờ)
3. Apply filters
4. Select vehicle
5. Chọn hình thức: trả trực tiếp hoặc dùng gói thuê bao
6. Kiểm tra GPLX + chính sách/cọc
7. Tạo rental (status = pending)
```

Implement as:

```text
Search
  ↓
Vehicle
  ↓
Rental information (thời gian, tự lái / có tài xế, chi nhánh nhận xe)
  ↓
Customer information + GPLX
  ↓
Price confirmation (VAT, cọc, tổng tiền)
  ↓
Tạo rental (pending) + Invoice (nếu trả trực tiếp)
  ↓
Payment (PayOS)
  ↓
Staff xác nhận, phân xe/tài xế (vehicle_assignments)
  ↓
Pre-rental inspection + bàn giao xe
```

---

# 26. Booking Status

Dùng đúng `rentals.status` trong DDL:

```text
pending
    ↓
pre_inspection
    ↓
renting
    ↓
post_inspection
    ↓
completed
```

Trạng thái kết thúc khác:

```text
cancelled   (chỉ từ pending hoặc pre_inspection)
```

Trạng thái liên quan:

```text
inspections.inspection_type   pre_rental | post_rental
vehicles.status               available | renting | maintenance | inactive
vehicle_assignments.status    assigned → reassigned (bị thay) | completed | cancelled
vehicle_maintenance.status    scheduled → in_progress → completed → verified | cancelled
payment type='refund'         requested → paid | rejected
```

---

# 27. User Dashboard

Navigation:

```text
Tài khoản

├── Hồ sơ (users + customers, GPLX, avatar)
├── Chuyến của tôi (rentals)
├── Gói thuê bao (customer_subscriptions, remaining_hours)
├── Hoá đơn & thanh toán (invoices, payments, hoàn cọc)
├── Báo cáo sự cố (reports)
└── Cài đặt (mật khẩu, phiên đăng nhập)
```

---

# 28. My Trips

Cards:

```text
┌──────────────────────────────────┐
│ Toyota Corolla Cross             │
│                                  │
│ 02/10 → 04/10                    │
│ Chi nhánh Quận 1                 │
│                                  │
│ Trạng thái: Đang thuê            │
│                                  │
│ [Xem chi tiết]                   │
└──────────────────────────────────┘
```

Tabs (map theo `rentals.status`):

```text
Sắp tới            (pending, pre_inspection)
Đang diễn ra       (renting)
Đã hoàn thành      (post_inspection, completed)
Đã huỷ             (cancelled)
```

---

# 29. Gói thuê bao (Subscription)

Đây là luồng chuyển đổi thứ hai của hệ thống (khách trả trước số giờ thuê).

Headline:

```text
Mua gói thuê bao, thuê xe không cần trả từng lượt
```

Supporting message:

```text
Trả trước một lần, dùng dần theo số giờ — theo dõi remaining_hours trong ứng dụng.
```

CTA:

```text
Xem các gói
```

Plan card (từ `subscription_plans`):

```text
┌─────────────────────────────┐
│ Gói Tiết Kiệm               │
│ 20 giờ · 30 ngày            │
│                             │
│ 1.500.000đ                  │
│                             │
│ [Mua gói]                   │
└─────────────────────────────┘
```

Plan không active không được mua mới; plan đã có người dùng chỉ được ngừng kích hoạt (soft-delete), không xoá cứng.

---

# 30. Quy trình tạo xe & chính sách (Staff/Admin)

Khu vực nội bộ — không phải luồng của khách.

```text
Tạo loại phương tiện (vehicle_types)
        ↓
Tạo xe + thuộc tính riêng theo loại
        ↓
Upload hình ảnh (vehicle_imgs, Cloudinary)
        ↓
Gán chi nhánh (facility_id)
        ↓
Tạo/cập nhật rental_policy (VAT, cọc, phí trễ)
        ↓
Xe ở trạng thái available và xuất hiện trong tìm kiếm
```

---

# 31. How It Works

Four-step visual explanation:

```text
01
Đặt xe trên web/app

        ↓

02
Staff kiểm định & bàn giao xe

        ↓

03
Bắt đầu hành trình

        ↓

04
Trả xe, kiểm định sau thuê & quyết toán
```

Use large numbers and simple illustrations.

---

# 32. Trust / Benefits Section

Recommended cards:

```text
An toàn
Kiểm định xe trước và sau mỗi lượt thuê

✓ An tâm đặt xe
Chính sách huỷ và hoàn cọc rõ ràng

Thủ tục đơn giản
CCCD + GPLX (staff duyệt)

Thanh toán dễ dàng
PayOS / ATM / Visa / ví điện tử

Giao xe tận nơi
Nhận xe tại chi nhánh hoặc giao tận nơi

Đa dạng phương tiện
Ô tô / Xe máy / Ô tô điện / Xe máy điện

Gói thuê bao
Dùng dần theo giờ, không trả từng lượt
```

---

# 33. Kiểm định xe (Inspection)

Không có bảng review/rating trong DDL v2. Kế hoạch mở rộng BE-34/FE-25/MB-06 bổ sung đánh giá nhân viên/tài xế (sao, phản hồi, ẩn nội dung xấu); cho tới khi có, thành phần tin cậy chính là phiếu kiểm định.

Phiếu kiểm định (staff nhập, có upload ảnh):

```text
Kiểm định TRƯỚC thuê        ✓ Đạt
Xe: Toyota Corolla Cross

Số km (odometer)     42.150 km
Nhiên liệu / pin     80%
Hư hỏng ghi nhận     Không

[ảnh] [ảnh] [ảnh]

Nhân viên: Nguyễn Văn B
02/10/2026 08:40
```

Prioritize:

- Loại kiểm định (pre_rental / post_rental)
- Kết quả `is_ok`
- Odometer / fuel-battery level
- Damage notes + ảnh
- Nhân viên kiểm tra + thời điểm

---

# 34. Thông báo & email

Hệ thống gửi qua Brevo (email) và FCM (push, mobile):

```text
OTP đăng ký / đặt lại mật khẩu
Xác nhận đặt xe và kết quả thanh toán
Hoá đơn và nhắc hạn thanh toán
Nhắc hết hạn gói thuê bao
Nhắc lịch bảo dưỡng
Nhắc kiểm định trước/sau thuê
```

Thông báo dùng cùng ngôn ngữ trạng thái với `rentals.status`; không dùng nhãn rời rạc gây lệch nghĩa.

---

# 35. Mobile Application

Hai ứng dụng Flutter (ngoài phạm vi Next.js web portal):

```text
Ứng dụng khách hàng        đặt xe, quản lý gói, hoá đơn, báo cáo sự cố
Ứng dụng nhân viên/tài xế  nhận vehicle_assignment, kiểm định, bàn giao xe
```

Layout:

```text
┌───────────────────┐
│                   │
│  App screenshot   │
│                   │
└───────────────────┘

Thuê xe dễ dàng
Mọi lúc, mọi nơi

[App Store]
[Google Play]
```

---

# 36. Footer

Footer should be information-dense.

```text
VRS — VEHICLE RENTAL SYSTEM

VỀ HỆ THỐNG
Giới thiệu
Chi nhánh
Liên hệ

THUÊ XE

Hướng dẫn chung
Hướng dẫn đặt xe
Hướng dẫn thanh toán
Hỏi & đáp

CHÍNH SÁCH

Chính sách thuê & đặt cọc
Chính sách huỷ và hoàn cọc
Bảo dưỡng & an toàn xe
Giải quyết khiếu nại

DỊCH VỤ

Thuê theo giờ
Thuê dài hạn
Gói thuê bao
Thuê xe có tài xế

HỖ TRỢ

1900 xxxx
7AM – 10PM

support@vrs.vn
```

---

# 37. Component Library

Build reusable components instead of page-specific markup.

```text
components/
├── Navbar
├── Footer
├── SearchBox
├── FacilityPicker
├── DateTimePicker
├── RentalModeTabs        (tự lái / có tài xế, theo giờ / dài hạn)
├── VehicleCard
├── VehicleGallery
├── VehicleSpecs          (render theo vehicle_type)
├── RentalPolicyPanel
├── SubscriptionCard
├── SubscriptionUsage     (remaining_hours)
├── PriceBreakdown        (thuê + VAT + cọc + phí trễ)
├── BookingCard
├── InvoiceCard
├── PaymentStatus
├── InspectionChecklist   (pre/post rental, upload ảnh)
├── ReportForm
├── FilterSidebar
├── SortDropdown
├── StatusBadge           (rentals/vehicles/assignments/maintenance)
├── BenefitCard
├── StepCard
├── DataTable             (khu vực Staff/Admin)
├── Modal
├── Drawer
├── Toast
├── Badge
├── Button
└── Input
```

Bổ sung (khu admin và thành phần dùng chung mới), đặt trong `src/features/admin/components/` trừ khi ghi khác:

```text
AdminShell            sidebar Garage Ink + header .glass-admin, menu lọc theo role
PageHeader            tiêu đề, breadcrumbs, hành động chính
DataTable             TanStack Table, phân trang/sắp xếp/lọc phía server, skeleton/empty/error
FilterBar             bộ lọc dạng chip + ô tìm kiếm có debounce, đồng bộ URL
Pagination
FormField / Form      React Hook Form + Zod, nhãn trên, lỗi dưới
ConfirmDialog         xác nhận hành động nguy hiểm, có nhập lý do
Modal / Drawer        Radix Dialog .glass-3 (Drawer mobile: vaul)
StatusBadge           ánh xạ ở A9
StatCard / ChartCard  KPI và biểu đồ Recharts (có bảng thay thế)
EmptyState / ErrorState / Skeleton*
ImageUploader         upload Cloudinary có chữ ký (src/components/ui)
DateTimeRangePicker   react-day-picker, GMT+7 (src/components/ui)
Vehicle3DViewer       R3F tải lười + poster dự phòng (src/features/vehicles)
AuthGate / RequireRole  bảo vệ route phía client (src/features/auth)
```

---

# 38. Component States

Every interactive component should support:

```text
default
hover
active
focus
disabled
loading
error
success
```

Example:

```text
Button
├── primary
├── secondary
├── outline
├── ghost
└── danger
```

---

# 39. Cards

Nguồn xác thực: Phần A (A4, A6).

- Phần tử **lặp lại** (thẻ xe, thẻ gói, thẻ chi nhánh, thẻ chuyến đi): `.glass-lite`, bo 16px, **không** `backdrop-filter`.
- Panel đơn (bảng tìm kiếm, booking card dính, tóm tắt giá): `.glass-2` trên Stage; trên canvas phẳng dùng `.glass-lite`.
- Khối nhiều chữ nhỏ (chính sách thuê, phiếu kiểm định): Surface đặc hoặc `.glass-3`.
- Cấm thẻ lồng thẻ; nhóm thông tin trong thẻ bằng khoảng trắng hoặc đường kẻ Hairline.
- Bóng chỉ dùng `--e1/--e2/--e3` (tinted mực): không glow màu, không bóng nặng.

---

# 40. Buttons

Primary:

```text
Background: Emerald Deep #047857   Text: #FFFFFF (5.5:1)
Radius: 10px   Height: 44-48px
Hover: #065F46   Active: #064E3B + translateY(1px)
```

Secondary:

```text
Trên Stage: .glass-1, chữ Garage Ink
Trên canvas: Surface + viền Hairline Strong, chữ Garage Ink
```

Large CTA:

```text
Height: 52px   (mỗi khu vực tối đa MỘT CTA chính)
```

Disabled: nền Sunken, chữ Ink Muted, `aria-disabled="true"`. Loading: spinner nhỏ trong nút, giữ nguyên chiều rộng, chặn gửi lặp. Focus: A10. Không glow, không gradient.

---

# 41. Forms

Nguồn xác thực: Phần A (A6, A10). Biểu mẫu dùng React Hook Form + Zod.

Inputs:

```text
height: 48px (admin: 40px)
border-radius: 10px
background: Surface đặc (không trong suốt)
border: 1px solid Hairline Strong
```

Focus:

```text
border-color: Emerald Deep
box-shadow: 0 0 0 3px Emerald Tint
```

- Nhãn luôn hiển thị phía trên ô; không nhãn nổi; không dựa vào placeholder.
- Lỗi nằm dưới ô: icon + chữ, `aria-describedby`, `aria-invalid`; gửi lỗi đưa focus tới ô lỗi đầu tiên.
- Trường bắt buộc đánh dấu bằng chữ "(bắt buộc)", không chỉ dấu sao.
- Thời gian nhập theo GMT+7; tiền nhập có phân tách nghìn, lưu số nguyên VND.

---

# 42. Responsive Design

## Desktop

```text
≥ 1200px
```

Use:

- Full navigation
- Sidebar filters
- Grid cards
- Facility filter and branch cards
- Sticky booking panel

---

## Tablet

```text
768–1199px
```

Use:

- Reduced navigation
- 2-column card grid
- Collapsible filters
- Smaller search form

---

## Mobile

```text
< 768px
```

Use:

- Bottom navigation or compact header
- Single-column cards
- Horizontal carousels
- Filter drawer
- Full-screen search modal
- Sticky booking CTA

---

# 43. Mobile Search UX

Instead of showing a huge desktop form:

```text
┌─────────────────────────────┐
│  TP. Hồ Chí Minh          │
│                             │
│  02/10 → 04/10            │
│                             │
│       [ TÌM XE ]            │
└─────────────────────────────┘
```

Clicking any field opens a bottom sheet.

---

# 44. Accessibility

Requirements:

- Keyboard navigable
- Visible focus states
- Semantic HTML
- Accessible labels
- Minimum touch target: 44×44px
- Sufficient color contrast
- Do not communicate information through color alone
- Image `alt` attributes
- Dialogs trap focus correctly

---

# 45. Loading States

Tìm xe dùng **skeleton đúng kích thước thẻ xe** (ảnh 4:3 + ba dòng chữ), khối Sunken nhấp nháy bằng `opacity` (A6). Không dùng shimmer gradient, không spinner tròn cho danh sách/trang.

```text
┌─────────────────────────┐
│ [ảnh 4:3 - khối Sunken]  │
│                         │
│ ███████████             │
│ ██████                  │
│ █████████████           │
└─────────────────────────┘
```

- Không hiển thị màn hình trống khi đang tìm.
- Skeleton hiển thị tối thiểu 300ms để tránh nháy.
- Dữ liệu đã có trong cache được hiển thị ngay và làm mới nền (stale-while-revalidate).

---

# 46. Empty States

Example:

```text
Không tìm thấy xe phù hợp

Hãy thử:
• Thay đổi thời gian
• Mở rộng khu vực
• Bỏ bớt bộ lọc
```

CTA:

```text
Xoá bộ lọc
```

---

# 47. Error States

Example:

```text
Không thể tải danh sách xe

Đã xảy ra lỗi khi kết nối đến hệ thống.

[Thử lại]
```

Avoid technical messages such as:

```text
500 Internal Server Error
```

for normal users.

---

# 48. Design Tokens

Nguồn xác thực: **Phần A, mục A4.3 (khối `:root`) và A12 (ánh xạ Tailwind v4)**. Không khai báo token thứ hai ở nơi khác; mọi giá trị màu/bo góc/bóng/chuyển động phải đi qua biến CSS ở đó.

---

# 49. UX Priority

When implementing the design, prioritize these flows in order:

```text
1. Search vehicle
2. Browse/filter vehicles
3. Vehicle details
4. Booking (trực tiếp hoặc dùng gói)
5. Payment / hoá đơn / hoàn cọc
6. User trips & subscription
7. Khu vực Staff/Admin: xe, chính sách, gán xe/tài xế
8. Kiểm định trước/sau thuê
9. Bảo dưỡng, báo cáo sự cố, dashboard
```

The first five should feel extremely polished.

---

# 50. Core User Journey

The ideal experience should feel like:

```text
"I need a car"
       ↓
"Where?"
       ↓
"When?"
       ↓
"What cars are available?"
       ↓
"Which one can I trust?"
       ↓
"How much?"
       ↓
"Book"
       ↓
"Done"
```

Every major UI decision should reduce friction along this path.

---

# 51. Implementation Guidance

```text
Frontend
├── Next.js 16 (App Router, TypeScript, Tailwind CSS v4) — web portal: khách hàng + Staff/Admin
│   ├── Xuất tĩnh (output: "export"), triển khai Cloudflare Workers static assets
│   ├── Dữ liệu: TanStack Query v5 trên fetch wrapper nội bộ (envelope + ProblemDetails)
│   ├── Biểu mẫu: React Hook Form + Zod; bảng admin: TanStack Table v8; biểu đồ: Recharts
│   ├── UI: Radix UI primitives + vaul (bottom sheet) + sonner (toast); ngày giờ: date-fns + @date-fns/tz + react-day-picker
│   └── Chuyển động: GSAP + @gsap/react (ScrollTrigger, Flip, SplitText); 3D: three + @react-three/fiber + drei (tải lười)
└── Flutter (Android/iOS)                      — app khách hàng + app nhân viên/tài xế

Backend
├── ASP.NET Core Web API (.NET 8), Clean Architecture — modular monolith, truy cập dữ liệu Npgsql thuần (ADR-001)
├── REST API + OpenAPI/Swagger
├── Cookie session (Redis ticket store) + OTP email
├── Vehicles / Rental policy / Subscription / Loyalty
├── Rentals / Vehicle assignment / Inspection / Settlement
├── Invoice / Payment (PayOS) / Refund
├── Maintenance / Reports
└── Notifications (Brevo email, FCM)

Infrastructure
├── PostgreSQL 15+ (26 bảng lõi, không FK tường minh; extension btree_gist, pg_trgm)
├── Redis (session, OTP, rate limit)
├── Cloudinary (ảnh xe, avatar, GPLX, ảnh kiểm định)
└── Docker + Railway (API); Cloudflare (FE)
```

Phiên đăng nhập: cookie `HttpOnly` `__Host-vehicle-rental` do BE phát hành (`SameSite=Lax`, `Secure`). FE và API phải **cùng origin** — Cloudflare Worker proxy `/api/*` về BE (dev: `rewrites` của Next) — để cookie được gửi kèm và không cần CORS. Quyền truy cập trên FE chỉ là lớp tiện ích; BE là nơi thực thi.

Recommended initial architecture:

```text
Next.js Web Portal / Flutter App
   │  HTTPS + cookie session (cùng origin qua proxy /api)
   ▼
ASP.NET Core Web API (modular monolith)
   │
   ├── Account / RBAC
   ├── Organization (departments, facilities, staff)
   ├── Vehicles + availability + rental policies
   ├── Subscriptions + Loyalty
   ├── Rentals + assignments + inspections + settlement
   ├── Invoices / payments / refunds
   ├── Maintenance / reports
   └── Notifications
          │
          ├── PostgreSQL
          ├── Redis
          └── Cloudinary / PayOS / Brevo
```

Do **not** start with microservices unless there is a concrete reason to do so. A modular monolith is sufficient for the initial product.

---

# 52. Important Product Rules

### Vehicle availability

Một xe không được đặt khi:

```text
rental hiện có overlap khoảng thời gian yêu cầu
hoặc xe đang có phiếu bảo dưỡng mở / status = maintenance
```

(Chống double-booking bằng transaction + exclusion constraint/advisory lock — xem TODO-02.)

### Booking

```text
pending → pre_inspection → renting → post_inspection → completed
```

Chỉ được `cancelled` từ `pending` hoặc `pre_inspection`.

### Subscription

```text
is_subscription = true  ⇔  customer_subscription_id có giá trị
is_subscription = true  →  không có Invoice
is_subscription = true  →  trừ remaining_hours sau khi hoàn thành đơn
```

### Invoice / Payment

```text
Invoice chỉ cho direct rental (is_subscription = false)
Payment direct: invoice_id bắt buộc
Payment subscription: invoice_id NULL, is_subscription_payment = true
Hoàn cọc sau post_rental inspection đạt và invoice đã paid
```

### Inspection

```text
pre_rental is_ok = true  →  mới chuyển sang renting
post_rental trước completed; is_ok = false  →  tạo vehicle_maintenance
Tối đa 1 pre_rental và 1 post_rental cho mỗi rental
```

### Cancellation

Cancellation behavior must clearly communicate:

- Ai huỷ (khách hay chi nhánh)
- Thời điểm huỷ (chỉ từ pending/pre_inspection)
- Số tiền hoàn
- Phí phạt (nếu có)
- Xử lý cọc (payment `type='refund'`, trạng thái `requested → paid | rejected`)

### Khoảng đệm giữa hai lượt thuê

Mỗi xe cần **60 phút đệm** (rửa/kiểm tra) sau một lượt thuê trước khi nhận lượt kế tiếp; quy tắc đối xứng: hai khoảng thuê của cùng một xe phải cách nhau ít nhất 60 phút. Nếu kiểm định sau thuê phát hiện hư hại hoặc xe không vận hành được: xe chuyển `maintenance`, có phiếu bảo dưỡng mở và bị loại khỏi tìm kiếm cho tới khi `is_safe = true`.

### Đổi xe / đổi tài xế giữa chừng

Hai thao tác tách biệt: **đổi tài xế** và **đổi xe**. Đổi xe yêu cầu xe thay thế cùng loại (`vehicle_type_id`), còn trống trong phần thời gian còn lại; xe cũ chuyển `maintenance` nếu lý do là hỏng/tai nạn. Lịch sử giữ ở `vehicle_assignments` (bản ghi cũ chuyển `reassigned`).

### Quá giờ khi trả xe

Dung sai 15 phút. Vượt dung sai: tính theo số giờ **bắt đầu** (làm tròn lên). Phí quá giờ = số giờ × giá giờ snapshot × (1 + `overtime_fee_rate`/100), cộng VAT. Hệ thống **tự động trừ vào tiền cọc**; phần thiếu phát sinh **hóa đơn bổ sung** (đơn trực tiếp). Phần cọc còn lại được hoàn.

### Hủy đơn

- Khách tự hủy: chỉ khi `pending`. Trước giờ nhận >= 24h: hoàn 100%. Trong vòng 24h trước giờ nhận: giữ 20% (tiền thuê + VAT), hoàn phần còn lại gồm cọc. Từ giờ nhận trở đi: khách không tự hủy trên ứng dụng, liên hệ chi nhánh.
- Nhân viên hủy từ `pending` hoặc `pre_inspection`, bắt buộc có lý do: chi nhánh chủ động (không phí) hoặc theo yêu cầu khách (áp quy tắc phí như trên). Kiểm định trước thuê không đạt: hệ thống tự hủy, không phí.
- Đơn theo gói không phát sinh tiền khi hủy (số giờ chỉ bị trừ khi hoàn tất).

### Điểm thưởng

**10.000đ tiền thuê (đã gồm VAT, không gồm cọc) = 1 điểm**, nhân hệ số hạng thành viên (Member x1.0, Silver >= 500 điểm tích lũy x1.1, Gold >= 2.000 x1.25, Platinum >= 5.000 x1.5). Điểm được cộng khi đơn `completed` (một lần, bất biến). **1 điểm quy đổi 100đ giảm giá tiền thuê** (tối thiểu 50 điểm, tối đa 30% tiền thuê trước VAT) — tính năng quy đổi bật sau khi chốt tích hợp với tính giá (xem FR-029).

---

# 53. Visual Hierarchy Summary

Every page should follow:

```text
PRIMARY ACTION
      ↓
IMPORTANT INFORMATION
      ↓
TRUST INFORMATION
      ↓
SECONDARY INFORMATION
```

For a vehicle page:

```text
[ĐẶT XE]
    ↓
Price + availability
    ↓
Vehicle image + specifications
    ↓
Chính sách thuê + đặt cọc
    ↓
Chi nhánh / nhận xe
    ↓
Kiểm định gần nhất
    ↓
Thông tin thêm
```

---

# 54. Final Design Direction

The overall visual language should be:

```text
Glass material on a light, flat canvas
     +
Real vehicle photography as the stage
     +
Precise, weighty motion (GSAP) - 2D everywhere, 3D in two approved places
     +
Dense, calm, high-contrast operations console for staff
     +
Trustworthy and Vietnamese-first
```

The system should **not** feel like a generic e-commerce website, and it must not rely on gradients, glows or emoji to look "premium".

It should feel like:

> **Automotive showroom (public) + fleet operations console (admin) + Vietnamese local rental business.**

The most important screen is the **vehicle search → vehicle detail → booking → payment** flow. For Staff/Admin it is the **fleet & rental operations** flow. Optimize those before adding secondary features.
