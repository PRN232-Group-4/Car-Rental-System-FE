# Tái thiết kế Landing Page theo concept ‘Riso Grand Tour — Siêu xe. Không vội.’ — 2026-11-01

## Bối cảnh

Dựng lại landing page marketing (route `/`, nhóm `(marketing)`) của hệ thống `Car-Rental-System-FE` theo concept thẩm mỹ cao cấp **‘Riso Grand Tour — Siêu xe. Không vội.’** Đạt tiêu chuẩn nghệ thuật Awwwards Of The Year, kết hợp đồ họa in khắc Riso/Lithograph, Three.js tối giản hiệu năng cao, và chuyển động GSAP mượt mà.

Ràng buộc cứng:
- Không can thiệp vào các phân vùng `/admin/**`, `/(dashboard)/**`, `/staff/**`.
- Landing page có đúng **MỘT** nút hành động (CTA duy nhất): "Đặt xe" qua Booking Dock. Mọi tương tác khác là text link.
- Ngôn ngữ hình học nghiêm ngặt: chỉ gồm đĩa tròn (`border-radius: 50%`) và chữ nhật sắc cạnh (`border-radius: 0px`). Không card, không viền bo 1px, không pill nav/chip/badge, không mono HUD, không số ghost, không gradient CSS mượt, không toggle light/dark trên landing.
- Bảo đảm toàn vẹn dữ liệu: không tự bịa hoặc sửa số liệu nghiệp vụ, đánh dấu rõ ràng `TODO-DATA` tại các vị trí mâu thuẫn dữ liệu từ trước.

---

## Chi tiết thực hiện

### Bước 1 — Tokens & Typography Scoped (`globals.css` & `DESIGN.md`)
- Định nghĩa bộ token Riso Grand Tour v3.2 scoped chặt chẽ dưới `[data-surface="marketing"]`:
  - Màu mực: `ink-950` (`#0F1215`), `ink-800` (`#181D22`), `bone-100` (`#E9E4D8`).
  - Màu nhấn: `sun-600` (`#C84B20`), `sun-400` (`#E0662F`), `lake-600` (`#1177A8`), `lake-400` (`#3DA5D9`).
  - Thời lượng: `120ms`, `240ms`, `480ms`, `900ms`, `1400ms`.
  - Hàm gia tốc: Riso Out `cubic-bezier(0.16, 1, 0.3, 1)`, Riso In-Out `cubic-bezier(0.83, 0, 0.17, 1)`.
- Cấu hình font tối ưu: Nạp `Archivo` (kèm trục co giãn `wdth: ["wdth"]`) cho Display H1, `Cormorant Garamond` italic cho từ nhấn editorial, và `Be Vietnam Pro` cho body.
- Gỡ bỏ hoàn toàn `Space Grotesk`, `JetBrains Mono`, `Geist Mono` khỏi bundle landing (giữ nguyên ở admin/dashboard).
- Tạo trang kiểm định dev `/dev/glyph-test` xác nhận độ an toàn của dấu tiếng Việt (mask reveal không bị cắt dấu `0.22em`).

### Bước 2 — Tách các Section và bảo toàn Dữ liệu
- Chuyển hướng các section catalog, trạm và gói thuê bao sang các trang chuyên biệt đã có sẵn: S02 → `/find`, S03 → `/facilities`, S07 → `/subscriptions`.
- Di dời khối kiểm tra xe S04–S05 sang route riêng `/inspection`, tích hợp cơ chế dọn dẹp WebGL (dispose geometries, materials, textures, renderer và controls).
- Ghi nhận `TODO-DATA (file:line)` cho toàn bộ các điểm bất nhất dữ liệu gốc:
  - `use-fleet-vehicles.ts:25`: Giá giờ 1.850.000đ vs giá gói 30 giờ = 250.000đ.
  - `MembershipPasses.tsx:47`: Bộ tên gói fallback vs API.
  - `InspectionSection.tsx:32`: Mâu thuẫn thời gian cam kết tức thì vs 15 phút vs 3 phút.
  - `FacilityExplorer.tsx:28`: Giờ mở cửa 24/7 vs 07:00–22:00.
  - `use-fleet-vehicles.ts:50`: Nhãn dung lượng pin trên dòng xe động cơ đốt trong.
  - `use-fleet-vehicles.ts:121` & `use-fleet-vehicles.ts:144`: Tái sử dụng ảnh xe khác model.

### Bước 3 — Booking Dock (CTA Duy Nhất) & Landing Navigation
- Xây dựng `BookingDock.tsx`: Đĩa tròn `sun-600` 72px chữ trắng ("Đặt xe") làm CTA duy nhất.
- Tái sử dụng trọn vẹn logic từ `SearchWidget`: chọn trạm, thời gian nhận/trả xe, tích hợp submit về `router.push('/find?...')` theo schema `findFilterSchema`.
- Tạo `LandingNav.tsx` tối giản: Logo chữ "ThongDong." và trigger "MENU" dạng text link, không nút bấm, không toggle light/dark.
- Xây dựng `MenuOverlay.tsx`: Menu toàn màn hình trên nền `ink-950` mở mượt mà, đưa nút "Đăng ký" và các liên kết điều hướng vào trong overlay.

### Bước 4 — Cảnh 3D Duy Nhất (Lithograph Shader)
- Cấu hình canvas 3D duy nhất `Hero3DCanvas.tsx` tải mô hình Porsche 911 Carrera 4S GLB (784KB, meshopt compression).
- Phát triển custom shader `lithograph-shader.ts` qua `onBeforeCompile`:
  - Khử màu diffuse sang đơn sắc `ink-950` → `bone-100`.
  - Ánh xạ độ sáng qua LUT 6 bậc với ma trận stipple dither 4x4 Bayer ở các vùng chuyển tiếp.
  - Giữ nguyên độ bóng kim loại PBR (specular highlights sắc cạnh).
  - Đèn pha xe dùng vật liệu emissive `sun-400` (`#E0662F`).
- Thiết lập hệ thống chiếu sáng studio: Key light cứng, Lake-400 Rim light đối diện tôn đường nét xe trên nền tối, ambient thấp và monochrome environment map. Bóng xe là blob đen phẳng mép cứng.
- Khắc phục triệt để 4 cảnh báo GPU stall nhờ tắt `preserveDrawingBuffer`.

### Bước 5 — Năm Chương Kể Chuyện & Đồ Họa Halftone
- Nén ảnh tham chiếu visual poster sang chuẩn WebP ≤ 150KB (`poster-bugatti-heritage.webp` 77KB, `poster-mountain-grand-tour.webp` 68KB).
- Xây dựng thành phần `HalftoneImage.tsx`: Bộ lọc SVG thuần (`feColorMatrix` + `feComponentTransfer` + pattern chấm tròn stipple), hoàn toàn không dùng CSS gradient.
- Triển khai 5 chương narrative:
  1. **Chương 1 (Hero)**: Đĩa sun-600 ~92vw cắt chân trời 58%, tiêu đề Archivo clamp `SIÊU XE. KHÔNG VỘI.`, Porsche 911 ngự trên chân trời.
  2. **Chương 2 (Cung đường)**: `data-chapter="lake"`, 4 lớp parallax SVG (núi xa, rừng thông, đường đèo, mây trời), hiệu ứng xe di chuyển CatmullRom theo scroll, dải typography thương hiệu.
  3. **Chương 3 (Nhẹ như không)**: `data-chapter="sun"`, 3 plate in dính nhẹ (XÁC MINH · NHẬN XE · TRẢ XE) chữ trắng trên nền sun-600, radius 0.
  4. **Chương 4 (Tin cậy)**: Nền `ink-950`, các dòng dữ kiện quy mô lớn, ảnh chụp xe thực tế in hiệu ứng halftone mịn.
  5. **Chương 5 (Đặt xe)**: Đĩa sun-600 lặn xuống đáy, Booking Dock chuyển tiếp mượt mà, chân trang 1 dòng tối giản kèm ghi nhận bản quyền 3D CC BY 4.0.

### Bước 6 — Hệ Sinh Thái Chuyển Động (Motion & A11y)
- Tạo con trỏ `CursorDisc.tsx`: Đĩa tròn 14px `mix-blend-mode: difference`, nội suy vị trí qua `gsap.quickTo`, ẩn trên thiết bị cảm ứng và khi người dùng bật reduced motion.
- Chuyển chương bằng `ScrollDiscTransition.tsx`: Hiệu ứng đĩa mở rộng quy mô (scale disc) theo nhịp cuộn trang mà không sử dụng màn đen che phủ theo thời gian.
- Hiệu ứng car yaw spring: Thân xe nghiêng nhẹ ±8° (`normX * 0.14 rad`) theo tọa độ con trỏ chuột.
- Hỗ trợ toàn diện `prefers-reduced-motion: reduce`: Tắt toàn bộ chuyển động camera, parallax, cursor và cuộn quán tính; chuyển hero thành ảnh poster tĩnh tức thì.

### Bước 7 — Tối Ưu Hiệu Năng Tải Trang
- Tách dynamic import Three.js bên trong `useEffect`: Loại bỏ 100% Three.js (156KB gzip) khỏi các thẻ `<script>` render-blocking ban đầu.
- Tối ưu hóa LCP: Render ảnh composite chất lượng cao (`hero-car-composite-1280.avif` 25.2KB) với `fetchPriority="high"` ngay từ HTML tĩnh, chỉ mount WebGL sau khi tiêu đề H1 đã vẽ xong.
- Tinh giản bộ đăng ký GSAP: Gỡ bỏ các plugin thừa không sử dụng (`ScrollSmoother`, `CustomEase`, `DrawSVGPlugin`).
- Giảm tải dung lượng JS ban đầu: Từ **508.6 KB gzip xuống 302.5 KB gzip (-40.5%)**.

---

## Kiểm chứng Nghiệm Thu (Bước 8)

1. **Độ tương phản WCAG 2.1 (Đo thực tế qua Playwright)**:
   - Chữ trắng (`#FFFFFF`) trên nền `sun-600` (`#C84B20`): **4.68:1** (Đạt chuẩn AA ≥ 4.5:1).
   - Chữ trắng (`#FFFFFF`) trên nền `lake-600` (`#1177A8`): **4.97:1** (Đạt chuẩn AA ≥ 4.5:1).
   - Mực `ink-950` (`#0F1215`) trên nền `bone-100` (`#E9E4D8`): **14.81:1** (Đạt chuẩn AAA ≥ 7.0:1).

2. **Kiểm tra E2E Suite**:
   - `tests/landing.e2e.ts`: **ĐẠT 100%** (Tiêu đề H1, nút CTA Đặt xe duy nhất, thông tin bản quyền và liên hệ footer).
   - `tests/search-console.e2e.ts`: **ĐẠT 100%** (Đóng/mở dropdown trạm nhận xe, popover lịch trình nhận/trả xe, tính loại trừ của 2 popover, đóng khi bấm ra ngoài, cập nhật nhãn khi chọn trạm khác).

3. **CI Checks**:
   - `npm run lint:design`: **ĐẠT 100%** (Không có vi phạm quy tắc thiết kế Phần A).
   - `npm run typecheck`: **0 lỗi** TypeScript.
   - `npm run build`: **266/266 static pages** xuất xưởng thành công.
