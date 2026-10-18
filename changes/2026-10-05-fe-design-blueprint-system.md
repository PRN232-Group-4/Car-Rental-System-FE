# 2026-10-05 — Hệ thống đồ họa kỹ thuật Blueprint v3.1, Light Editorial & đồng bộ specs

- **FR/NFR:** NFR-008 (nền tảng/UI), NFR-006 (performance), NFR-007 (test)
- **Loại:** refactor & design system migration (UI/UX)
- **Phiên bản:** DESIGN.md v3.1

Mục tiêu: Chuyển toàn bộ giao diện từ phong cách tối cũ/xanh lá EV rập khuôn sang **Light Editorial Automotive Blueprint** (nền Warm Canvas `#FBFBF9`, Precision Amber `#B45309`, Slate Ink `#0F172A`), triển khai hệ thống đồ họa kỹ thuật chuyên ngành đa phân vùng (Section-Specific Blueprints), tối ưu hóa hiệu năng cuộn 3D/GSAP và đồng bộ hóa toàn bộ tài liệu specs.

## 1. Nâng cấp DESIGN.md v3.1

- Nâng cấp đồng bộ cả 2 file `DESIGN.md` (root) và `Car-Rental-System-FE/DESIGN.md`.
- **Phần A (A1–A13)**:
  - Bảng màu: Nền Warm Canvas `#FBFBF9`, thẻ Surface `#FFFFFF`, mực Slate Ink `#0F172A`, điểm nhấn Precision Amber `#B45309`.
  - Loại bỏ hoàn toàn màu xanh lá EV slop và nền xám xanh Showroom Mist cũ.
  - Hệ thống đồ họa kỹ thuật chuyên ngành độc bản nhúng SVG phẳng (Skateboard Chassis, LiDAR Radar, Trắc địa GPS, NFC Secure Enclave).
  - Typography: Be Vietnam Pro + JetBrains Mono.
  - Tuân thủ 100% A13: Zero gradient, zero emoji, zero `#000`, zero `h-screen`, zero inline `backdrop-blur-*`.
- **Phần B (mục 1–54)**: Bảo toàn nguyên vẹn 100% quy tắc nghiệp vụ, tính tiền, hoàn cọc, webhook PayOS và phân quyền.

## 2. Đồng bộ hóa `docs/specs/`

- **`P1-design-migration.md`**: Cập nhật toàn bộ lộ trình và bảng quy đổi CSS token theo DESIGN.md v3.1.
- **`FE-FOUNDATION.md`**: Bổ sung **Section 11 — Phụ lục Quy Chuẩn Thị Giác v3.1 (Design System & Token Reference)** làm nguồn chân lý duy nhất cho toàn bộ giao diện người dùng.
- **10 specs tính năng (`FE-02` đến `FE-25`)**: Chuẩn hóa để kế thừa token ngữ nghĩa từ Section 11 của `FE-FOUNDATION.md`. Bảo toàn nguyên vẹn mọi hợp đồng API, DDL schema và logic backend.

## 3. Hệ thống đồ họa kỹ thuật đa phân vùng (Landing Page)

- **`MultiFleetCatalog.tsx`**: Khung gầm phẳng EV Skateboard Chassis (Wheelbase 3000mm, Track 1650mm), hệ thống treo Wishbones, động cơ điện kép e-AWD Dual-Motor, đường khí động học hầm gió (`Cd: 0.23`).
- **`InspectionSection.tsx`**: Vòm quét radar quang học LiDAR 360°, 4 vòng cự ly đồng tâm (`R-10M` đến `R-75M`), tia quét góc và 4 chữ thập định vị cảm biến ADAS (`SEN-FL`..`RR`). Tinh giản mật độ chữ thành Bảng Điều Khiển Chẩn Đoán Kỹ Thuật (Visual Diagnostic Cutaway).
- **`PinnedJourney.tsx`**: Trắc địa đường đồng mức cao độ (`+250M` đến `+1500M`) và vector lộ trình GPS 3 trạm mốc (`WP-01 SGN` $\rightarrow$ `WP-02 DL` $\rightarrow$ `WP-03 CR`). Tinh gọn cột trái với Interactive Vertical Progress Rail (rút ngắn chiều cao từ 700px xuống ~260px, chấm dứt lỗi cắt tràn màn hình).
- **`MembershipPasses.tsx`**: Sơ đồ vi mạch bảo mật NFC Secure Enclave, cuộn ăng-ten vòng tròn cảm ứng không chạm và khung bao hình học thẻ chuẩn Apple/Google Wallet PKPASS ISO-7810.
- **`ContinuousBlueprint.tsx`**: Mở rộng trục thước đo kỹ thuật milimet dọc (`0000 MM` đến `6000 MM`) và trục tọa độ GPS hiển thị từ màn hình `xl` (1280px+).
- **`SearchWidget.tsx` & `Hero.tsx`**: Thay thẻ `<select>` native bằng Custom Glass Dropdown Menu `.glass-3`; xử lý container `overflow-visible` để popover lịch trình di chuyển nổi mượt mà trên `z-50` không bị cắt góc.

## 4. Tối ưu hiệu năng & Motion

- Tối ưu vòng lặp render 3D (`InteractiveStudio3D.tsx`): tự động dừng render WebGL vòng lặp RAF khi model cuộn ra khỏi viewport (`useInView`), giảm tải GPU từ 85% xuống < 3%.
- Fix cảnh báo Next.js `data-scroll-behavior="smooth"` trên thẻ `<html>` và gỡ bỏ style smooth-scroll xung đột với GSAP ScrollTrigger.
- Chuẩn hóa toàn bộ chuyển động bằng GSAP timelines và matchMedia (`prefers-reduced-motion`).

## 5. Kiểm thử & xác thực

- `npm run lint:design`: PASSED 100% (0 vi phạm).
- `npm run typecheck`: PASSED (0 lỗi).
- `npm run lint`: PASSED (0 lỗi).
- `npm run test`: PASSED (24/24 unit tests).
- `npm run build`: PASSED (225/225 static pages).
- Playwright E2E visual verification: chụp và kiểm định trọn vẹn toàn bộ các phân vùng blueprint.
