# FE-20 — Hoàn thiện UX, truy cập, hiệu năng (toàn bộ FE)

- **Priority:** P1; **Milestone:** M8; **Assignee:** Huy
- **Phụ thuộc:** **toàn bộ FE** (làm cuối cùng), P1 (design system), FE-FOUNDATION. Phối hợp: FE-21 (Phúc — kiểm thử e2e), FE-22 (Phúc — build/deploy).
- **Đặt vào repo FE:** `docs/specs/FE-20-ux-polish.md`.

## 1. Mục tiêu

Biến các module đã làm thành **một sản phẩm nhất quán và đo được**: mọi route có đủ trạng thái, truy cập WCAG 2.2 AA, hiệu năng đạt ngân sách, chuyển động/kính/3D đúng DESIGN.md Phần A, có kiểm thử tự động chặn hồi quy. FE-20 **không thêm tính năng mới**.

## 2. Phạm vi

| # | Hạng mục | Kết quả |
|---|---|---|
| A | **Ma trận trạng thái** | Mỗi route/khối dữ liệu có loading, empty, error, populated; bảng kiểm `docs/ux/state-matrix.md` (route × trạng thái) đều "đạt" |
| B | **Responsive** | Không vỡ bố cục/cuộn ngang ở 320, 375, 768, 1024, 1280, 1536, 1920; vùng chạm >= 44px (công khai), >= 32px (admin); bảng admin cuộn ngang **trong khung** hoặc chuyển dạng thẻ |
| C | **Truy cập (WCAG 2.2 AA)** | axe không có `serious/critical`; kiểm tra thủ công bàn phím + trình đọc màn hình (NVDA/VoiceOver) theo danh sách luồng; focus quản lý khi đổi route, Dialog, Drawer; "Bỏ qua điều hướng"; `lang="vi"`; không bẫy bàn phím |
| D | **Tùy chọn người dùng** | `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, `forced-colors` đúng ở mọi route (A4.3, A10) |
| E | **Hiệu năng** | LCP < 2.5s, CLS < 0.1, INP < 200ms (4G trung bình, thiết bị tầm trung); JS mỗi route công khai <= 180 KB gzip (không tính chunk 3D lười); ngân sách `backdrop-filter` (A4.4) |
| F | **Chuyển động & 3D** | Thống nhất token/hooks (A7.2); không rò `ScrollTrigger`/tween khi đổi route; 3D chỉ đúng hai vị trí và có fallback poster; không có animation `width/height/top/left` |
| G | **Chất lượng trải nghiệm** | `error.tsx`/`global-error.tsx`/`not-found.tsx` theo thiết kế; banner mất kết nối; toast nhất quán (thành công/lỗi/thông tin, thời lượng, vị trí); tiêu đề trang/`<title>` động; trang `/forbidden`; cảnh báo rời trang khi form chưa lưu; copywriting tiếng Việt thống nhất (từ điển thuật ngữ) |
| H | **Hồi quy tự động** | Playwright chụp ảnh + axe + đếm `backdrop-filter` + reduce-motion trong CI; Lighthouse CI có ngân sách; `lint:design` bắt buộc |
| I | **i18n (tùy chọn, có điều kiện)** | **Chỉ** triển khai nếu chủ dự án xác nhận mở rộng phạm vi (SRS v2.0 ghi "ứng dụng đa ngôn ngữ" ngoài phạm vi). Nếu chưa: chỉ rà soát để mọi chuỗi UI nằm trong module có thể trích xuất, **không** thêm thư viện i18n |

## 3. Chi tiết từng hạng mục

### A. Ma trận trạng thái
Lập bảng từ cây route thực tế (công khai, tài khoản, admin, trang lỗi). Với mỗi khối dữ liệu: loading = skeleton đúng kích thước (không spinner danh sách/trang, không trang trống), empty = có hướng dẫn + hành động, error = thông điệp thân thiện + "Thử lại" + `traceId` (staff), populated. Bổ sung thiếu sót ở **thành phần dùng chung** trước, rồi mới sửa từng trang. Đưa bảng vào `docs/ux/state-matrix.md` và cập nhật mỗi khi thêm route.

### B. Responsive
Duyệt từng route ở các độ rộng trên + chiều ngang điện thoại. Quy tắc: lưới nhiều cột thu về một cột < 768px; không cuộn ngang ở `body`; hình dạng nội dung dài (tên xe, email, tên chi nhánh) cắt có kiểm soát (`line-clamp`/`min-w-0`) và có tooltip/đầy đủ ở chi tiết; bàn phím ảo không che ô nhập (cuộn ô vào vùng nhìn thấy); `100dvh`; thanh CTA dính đáy mobile có `padding-bottom: env(safe-area-inset-bottom)`.

### C. Truy cập
* Danh sách luồng kiểm tra thủ công bắt buộc: (1) tìm xe → chi tiết → bắt đầu đặt; (2) đăng nhập/đăng xuất; (3) hủy đơn ở "Chuyến của tôi"; (4) tạo chính sách thuê; (5) đổi vai trò người dùng; (6) gán tài xế; (7) xử lý báo cáo; (8) kiểm duyệt đánh giá; (9) xem dashboard ở dạng bảng.
* Quản lý focus: đổi route → focus `<h1>` (hoặc `main` có `tabindex=-1`); đóng Dialog/Drawer → trả focus phần tử kích hoạt; lỗi form → ô lỗi đầu tiên; vùng `aria-live` cho thông báo kết quả/lỗi, **không** thông báo thừa.
* Tương phản: script tính trên các lớp kính (A2) cho từng cặp chữ/nền dùng thật; sửa mọi cặp < 4.5:1 (chữ thường) / 3:1 (chữ lớn, biểu tượng).
* Hình ảnh có `alt` mô tả (ảnh trang trí `alt=""`); biểu đồ có bảng thay thế; lịch có danh sách thay thế; 3D `aria-hidden` kèm mô tả.

### D–F. Tùy chọn người dùng, hiệu năng, chuyển động
* Kiểm tra bằng Playwright với `reducedMotion: "reduce"`, `forcedColors: "active"`, `contrast: "more"` và emulate `prefers-reduced-transparency` (qua CDP); phần tử hiển thị ngay, không còn `transform`/`opacity` dở; kính chuyển sang nền đặc.
* Đo `backdrop-filter`: script đếm phần tử có `getComputedStyle(el).backdropFilter !== "none"` trong viewport mỗi route; công khai <= 4, admin <= 3; cấm trên phần tử lặp lại (hàng/thẻ).
* Bundle: `@next/bundle-analyzer` (hoặc tương đương tương thích Next 16); chunk Recharts chỉ ở dashboard; chunk three/R3F chỉ khi cần; không tải GSAP plugin không dùng; ảnh qua kích thước đúng (`sizes`), định dạng hiện đại, `priority` đúng chỗ; font chỉ tải subset cần.
* Rò chuyển động: mở/đóng route 30 lần trong test, đếm `ScrollTrigger.getAll().length` và `gsap.globalTimeline.getChildren().length` **không tăng** sau mỗi vòng.
* 3D: kiểm tra WebGL mất ngữ cảnh → poster; không render khi ngoài viewport/tab ẩn (đo số khung hình); GPU thấp → poster.

### G. Chất lượng trải nghiệm
* Trang lỗi/không tìm thấy/403 cùng ngôn ngữ thiết kế, một hành động chính ("Về trang chủ"/"Thử lại").
* Banner mất kết nối (`navigator.onLine` + lỗi mạng của Query) không che nội dung, tự ẩn khi khôi phục.
* Toast: `sonner`, tối đa 3 đồng thời, thành công 4s/lỗi 8s/có hành động không tự ẩn; **không** dùng toast thay cho lỗi biểu mẫu.
* **Từ điển thuật ngữ** (`docs/ux/glossary.md`): thống nhất "Chuyến đi/Đơn thuê", "Đặt cọc", "Hoàn cọc", "Gói thuê bao", "Kiểm định xe"… dùng một cách gọi trên toàn UI.
* Rà soát văn phong: không văn AI sáo rỗng, không dấu chấm than thừa, không thuật ngữ kỹ thuật lộ ra khách (mã lỗi thô, "500").

### H. Hồi quy tự động
Cấu trúc `e2e/`: `visual.spec.ts` (ảnh chụp mọi route × 4 độ rộng × trạng thái chính, so sánh với baseline), `a11y.spec.ts` (axe), `budgets.spec.ts` (backdrop-filter, rò motion), `reduced.spec.ts` (3 chế độ tùy chọn), `smoke.spec.ts` (luồng chính với mock). CI: chạy trên mỗi PR vào `main`; baseline ảnh lưu có chủ đích (cập nhật cần review). Lighthouse CI: ngân sách Performance >= 85, Accessibility >= 95 trên `/`, `/find`, `/vehicles/detail`, `/account/trips`; thất bại làm đỏ CI.

### I. i18n
Mặc định **không làm**. Nếu được duyệt: không dùng định tuyến locale (static export); `next-intl` ở chế độ không routing **hoặc** bộ danh mục tự viết; ngôn ngữ lưu `localStorage`; `lang` cập nhật; chuỗi qua khóa; trích xuất bằng lint rule; số/tiền/ngày qua `Intl` theo locale; tiếng Anh là bản dịch thứ hai. Ghi quyết định vào ADR.

## 4. Kiểm thử & bằng chứng

Mọi mục A–H phải có **bằng chứng trong PR**: ảnh chụp, báo cáo axe, bảng ngân sách (đo thật), kết quả Lighthouse, kết quả test rò motion. Không "đạt" bằng lời.

## 5. Acceptance criteria

- [ ] `docs/ux/state-matrix.md` đủ route × trạng thái, tất cả đạt
- [ ] axe không có `serious/critical` trên mọi route chính; checklist thủ công 9 luồng hoàn thành và ghi lại
- [ ] Không vỡ bố cục/cuộn ngang ở 320–1920; vùng chạm đạt
- [ ] Reduce-motion/transparency/contrast/forced-colors đúng trên mọi route
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms, JS route công khai <= 180 KB gzip; ngân sách `backdrop-filter` đạt (có test)
- [ ] Không rò ScrollTrigger/tween (test 30 vòng); 3D có poster fallback; không animation bố cục
- [ ] Trang lỗi/không tìm thấy/403/mất kết nối nhất quán; toast chuẩn hóa
- [ ] Playwright + Lighthouse CI chạy trong CI với baseline và ngưỡng; `lint:design` bắt buộc
- [ ] Từ điển thuật ngữ + copywriting rà soát; quyết định về i18n được ghi lại (ADR)

## 6. Câu hỏi mở

* **O1.** i18n có mở phạm vi không? (mặc định: không).
* **O2.** Có cần chế độ tối? (v3.1 chỉ sáng và `color-scheme: light` theo Light Editorial Automotive Blueprint.)
* **O3.** Công cụ ảnh chụp hồi quy: Playwright thuần hay dịch vụ ngoài? Mặc định Playwright thuần.

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer chuyên chất lượng sản phẩm (a11y, performance, visual regression). Hiện thực FE-20 theo ĐÚNG docs/specs/FE-20-ux-polish.md. Điều kiện tiên quyết: P1, F1–F3 và các module FE khác đã merge (làm CUỐI CÙNG). Nhánh feat/fe-20-ux-polish. FE-20 KHÔNG thêm tính năng mới.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/ — error/not-found/global-error, static export); DESIGN.md Phần A (đặc biệt A4.4, A7, A8, A10, A13) và B.§38, §45–§47; FE-FOUNDATION; toàn bộ cây route (src/app/**), docs/specs/*.

BƯỚC 1 (không sửa): sinh docs/ux/state-matrix.md từ cây route thật (route × loading/empty/error/populated) và đánh dấu thiếu; chạy axe + Lighthouse + đo backdrop-filter + đếm ScrollTrigger rò trên TẤT CẢ route chính, dán bảng kết quả TRƯỚC khi sửa. Đưa tôi báo cáo hiện trạng này; chờ xác nhận.

BƯỚC 2 (sửa, mỗi hạng mục một commit): A (trạng thái thiếu — sửa ở thành phần dùng chung trước), B (responsive), C (a11y + focus + tương phản), D–F (tùy chọn người dùng, bundle, rò motion, 3D fallback), G (trang lỗi, banner mất kết nối, toast, từ điển thuật ngữ), H (Playwright visual/a11y/budgets/reduced/smoke + Lighthouse CI + baseline), I (CHỈ rà soát chuỗi; KHÔNG thêm thư viện i18n trừ khi tôi xác nhận).

RÀNG BUỘC: không đổi nghiệp vụ/hợp đồng API; không hạ ngưỡng ngân sách để "cho qua"; mọi "đạt" phải có bằng chứng đo thật (ảnh, báo cáo axe, số liệu); không thêm gradient/emoji/Inter; không ScrollSmoother/custom cursor; baseline ảnh chỉ cập nhật có chủ đích và nêu lý do. Phát hiện lỗi chức năng ở module người khác: KHÔNG sửa im lặng — ghi vào docs/open-questions.md kèm cách tái hiện và báo tôi.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build, Playwright (cả 3 chế độ tùy chọn), Lighthouse CI, bảng ngân sách trước/sau, kết quả test rò motion 30 vòng, checklist 9 luồng a11y thủ công (ghi rõ phần nào bạn KHÔNG thể kiểm thủ công và cần tôi làm).

BÁO CÁO: bảng trước/sau theo hạng mục, danh sách vi phạm còn lại và lý do, bug phát hiện ở module khác, các điểm cần Phúc (FE-21/22) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
