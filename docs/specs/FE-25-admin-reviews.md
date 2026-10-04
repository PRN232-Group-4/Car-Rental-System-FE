# FE-25 — Admin: đánh giá nhân viên / tài xế

- **Priority:** P1; **Milestone:** M7; **Assignee:** Huy
- **Phụ thuộc:** BE-34 (đánh giá — Kiệt, **chưa bắt đầu**), FE-11 (shell), FE-FOUNDATION, FE-02. Liên quan: MB-06 (app — khách gửi đánh giá), FE-24 (hồ sơ staff hiển thị điểm trung bình), FE-07 (đơn gốc).
- **Đặt vào repo FE:** `docs/specs/FE-25-admin-reviews.md`.

## 1. Bối cảnh & rủi ro

**DDL v2 hiện không có bảng review/rating** (`staffs.rating NUMERIC(3,2)` chỉ là một số trung bình). BE-34 chưa tồn tại ⇒ **toàn bộ hợp đồng dưới đây là đề xuất** cho Kiệt; FE làm **mock-first** qua lớp adapter và chỉ chuyển sang BE thật khi BE-34 merge (đối chiếu `contract-snapshot.md`). Mọi chỗ khác biệt ghi vào `docs/open-questions.md`.

Hợp đồng dữ liệu đề xuất cho BE-34 (gửi Kiệt kèm spec này):

* Bảng `staff_reviews`: `id`, `rental_id`, `customer_id`, `staff_id` (tài xế/nhân viên được đánh giá), `rating` (1–5), `comment` (<= 1000), `status` (`visible` | `hidden` | `reported`), `hidden_reason`, `hidden_by`, `reply`, `replied_by`, `replied_at`, `created_at`. Ràng buộc: một đánh giá cho mỗi (`rental_id`, `staff_id`) của khách; chỉ đơn `completed`; `staffs.rating` là **trung bình của các đánh giá `visible`** do CSDL/ứng dụng cập nhật.
* Endpoint đề xuất: `GET /api/admin/reviews` (lọc), `GET /api/admin/reviews/{id}`, `POST /api/admin/reviews/{id}/hide` (`reason`), `POST …/unhide`, `POST …/reply`, `GET /api/staff/{id}/rating-summary` (trung bình, phân bố 1–5, số đánh giá).

Quyền: **Admin, Manager** (kiểm duyệt, phản hồi). Staff **không** xem đánh giá của người khác (riêng tư nhân sự), có thể xem đánh giá của chính mình ở app (ngoài phạm vi).

## 2. Route

| Route | Nội dung |
|---|---|
| `/admin/reviews` | Danh sách đánh giá + bộ lọc + tổng quan |
| `/admin/reviews/detail?id=…` | Chi tiết đánh giá (`Drawer`/trang) |
| Tab *Đánh giá* trong `/admin/staffs/detail` (FE-24) | Tóm tắt điểm + danh sách của một nhân viên (tái dùng thành phần) |

## 3. Màn hình & hành vi

### 3.1 Danh sách & tổng quan

* **Dải tổng quan** (`StatCard`): điểm trung bình toàn hệ thống (kỳ lọc), số đánh giá, % >= 4 sao, số đánh giá **bị báo cáo/chờ kiểm duyệt**.
* **`RatingDistribution`**: 5 thanh ngang (5→1 sao) với số lượng và %; bấm một thanh để lọc theo mức sao. Có bảng thay thế a11y.
* `FilterBar` đồng bộ URL: tìm (tên nhân viên/khách/nội dung), nhân viên/tài xế (combobox), sao (1–5, chọn nhiều), `status` (Hiển thị/Đã ẩn/Bị báo cáo), có/không phản hồi, khoảng ngày, chi nhánh.
* Cột: *Nhân viên/tài xế* (avatar + tên + vai trò), *Điểm* (`RatingStars` read-only: **chữ số + sao**, không chỉ sao), *Nội dung* (cắt 2 dòng), *Khách* (họ tên), *Đơn* (liên kết), *Trạng thái* (`StatusBadge`), *Phản hồi* (có/chưa), *Tạo lúc* (GMT+7). Sắp xếp: mới nhất (mặc định), điểm thấp trước (để xử lý đánh giá xấu), bị báo cáo trước.
* Phân trang phía server; skeleton/empty ("Chưa có đánh giá")/error.

### 3.2 Chi tiết & kiểm duyệt

* Nội dung đầy đủ (**văn bản thuần, không render HTML**), điểm, khách, nhân viên được đánh giá (liên kết FE-24), đơn gốc (tóm tắt xe/giờ/trạng thái — liên kết), trạng thái, lịch sử kiểm duyệt (ai/lúc nào/lý do) nếu BE có.
* **Ẩn/Hiện lại đánh giá:** `ConfirmDialog` với **lý do bắt buộc** (danh sách: *Ngôn từ xúc phạm*, *Thông tin cá nhân*, *Spam/không liên quan*, *Sai sự thật đã xác minh*, *Khác* + ô nhập). Ẩn không xóa; tác động: "Đánh giá sẽ không hiển thị công khai và không tính vào điểm trung bình" (nêu rõ). **Không** cung cấp thao tác xóa vĩnh viễn.
* **Phản hồi:** ô 5–1000 ký tự, hiển thị người/thời điểm phản hồi; sửa/xóa phản hồi chỉ trong 24h (nếu BE hỗ trợ) — nếu BE không nêu thì chỉ cho phản hồi một lần.
* **Xử lý đánh giá bị báo cáo:** nút *Giữ hiển thị* (bác báo cáo) / *Ẩn* (chấp nhận) kèm lý do.
* **Cảnh báo công bằng:** hiển thị "Đánh giá này ảnh hưởng điểm trung bình của <tên> từ 4,62 xuống 4,55" (tính trước từ số liệu BE trả hoặc ẩn nếu BE không trả đủ) để người kiểm duyệt cân nhắc; không bao giờ tự ẩn theo điểm số.
* **Không** hiển thị thông tin liên hệ khách (không cần cho kiểm duyệt); chỉ tên.

### 3.3 Tóm tắt trong hồ sơ nhân viên (FE-24)

Thành phần `StaffRatingPanel`: điểm trung bình (số + sao), số đánh giá, phân bố, 5 đánh giá gần nhất, liên kết "Xem tất cả" sang `/admin/reviews?staffId=`. Chỉ hiển thị cho Admin/Manager.

## 4. Dữ liệu & kiểu

```ts
export type ReviewStatus = "visible" | "hidden" | "reported";
export type ReviewListItem = { id: number; rating: 1 | 2 | 3 | 4 | 5; commentPreview: string; status: ReviewStatus; createdAt: string;
  staff: { id: number; fullName: string; avatarUrl?: string; isDriver: boolean }; customerName: string; rentalId: number; hasReply: boolean };
export type ReviewDetail = ReviewListItem & { comment: string; reply?: { text: string; by?: string; at: string } | null;
  hiddenInfo?: { reason: string; by?: string; at: string } | null; rental?: { vehicleName: string; start: string; end: string; status: string };
  impact?: { averageBefore: number; averageAfter: number } | null };
export type RatingSummary = { average: number | null; count: number; distribution: Record<"1" | "2" | "3" | "4" | "5", number> };
```

* Hooks: `useReviews(params)`, `useReview(id)`, `useHideReview`, `useUnhideReview`, `useReplyReview`, `useRatingSummary(staffId?)`; mọi mutation `invalidateQueries` đúng khóa (danh sách, chi tiết, tóm tắt, `['staff', id]`).
* Số liệu trung bình **do BE trả**; FE không tự tính lại từ danh sách phân trang.
* **Mock** theo hợp đồng đề xuất, kể cả: nhiều mức sao, bị báo cáo, đã ẩn, có phản hồi, nội dung chứa HTML/script, lỗi 409 khi ẩn đánh giá đã bị ẩn, 403 cho Staff.
* Khi BE-34 merge: đối chiếu snapshot, cập nhật adapter + mock + test, ghi sai khác.

## 5. Truy cập & bảo mật

* `RatingStars`: `role="img"` + `aria-label="4 trên 5 sao"` kèm số hiển thị; phân bố có bảng thay thế; badge có chữ; `Drawer` bẫy focus; hành động ẩn/hiện thông báo `aria-live`.
* Nội dung người dùng render dạng text; liên kết trong nội dung bị vô hiệu (chỉ hiện chữ) để tránh lừa đảo; không log nội dung đánh giá.
* Motion admin tối thiểu (A9); count-up KPI một lần.

## 6. Kiểm thử

* **Unit:** `RatingStars` (biên 0.5, làm tròn), ánh xạ trạng thái, lọc sao, tính `impact` hiển thị (khi BE trả), thoát nội dung độc hại.
* **Component (RTL + mock):** danh sách (lọc/URL/skeleton/empty/error), lọc bằng cách bấm phân bố, chi tiết, ẩn có lý do bắt buộc, hiện lại, phản hồi, xử lý báo cáo, 409/403, không có nút xóa, nội dung HTML hiển thị như văn bản, `StaffRatingPanel` trong FE-24; Staff không vào được.
* **A11y:** axe sạch; kiểm duyệt một đánh giá chỉ bằng bàn phím.

## 7. Acceptance criteria

- [ ] Trang `/admin/reviews` + chi tiết + `StaffRatingPanel` hoạt động trên mock đúng hợp đồng đề xuất
- [ ] Ẩn/hiện lại **luôn có lý do**, không có xóa vĩnh viễn, tác động đến điểm trung bình được nêu rõ
- [ ] Điểm trung bình lấy từ BE (không tự tính từ trang dữ liệu)
- [ ] Nội dung không render HTML; liên kết trong nội dung bị vô hiệu
- [ ] Guard Admin/Manager; Staff không xem đánh giá người khác
- [ ] Hợp đồng đề xuất đã gửi Kiệt; khi BE-34 merge, adapter/mock/test được cập nhật theo snapshot
- [ ] Test, axe, `lint:design`, `build` xanh

## 8. Câu hỏi mở

* **O1.** BE-34 sẽ có những endpoint/cột nào? (Gửi hợp đồng đề xuất ở mục 1.)
* **O2.** Ai được đánh giá: chỉ tài xế hay cả nhân viên giao xe? Một đánh giá cho mỗi đơn hay mỗi nhân viên?
* **O3.** Khách sửa/xóa đánh giá của mình trong bao lâu (ngoài phạm vi admin nhưng ảnh hưởng `status`)?
* **O4.** Chính sách kiểm duyệt (lý do hợp lệ để ẩn) cần chủ nghiệp vụ xác nhận.

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (moderation tools, a11y). Hiện thực FE-25 theo ĐÚNG docs/specs/FE-25-admin-reviews.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong. BE-34 CHƯA có ⇒ làm MOCK-FIRST theo hợp đồng đề xuất ở mục 1; nếu BE-34 đã merge thì dùng hợp đồng thật. Nhánh feat/fe-25-reviews.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/); DESIGN.md A6, A9, A10; FE-FOUNDATION; docs/api/contract-snapshot.md (reviews/rating có hay chưa; staffs.rating); ../Car-Rental-System-BE/specs (tìm FR liên quan đánh giá) và docs/open-questions.md; module FE-24 (StaffRatingPanel sẽ gắn vào đó); shared components (F3).

BƯỚC 0 (không code): xác nhận BE-34 đã/chưa có; liệt kê endpoint/cột thực tế nếu có. Nếu chưa có: soạn SẴN một ghi chú ngắn "Hợp đồng đề xuất cho BE-34 (Kiệt)" từ mục 1 vào docs/open-questions.md. Đưa tôi kết quả.

LÀM: (1) kiểu + adapter + mock đủ kịch bản + hooks có test; (2) RatingStars, RatingDistribution, StatusBadge; (3) /admin/reviews danh sách + tổng quan + lọc; (4) chi tiết + ẩn/hiện lại có lý do bắt buộc + phản hồi + xử lý báo cáo; (5) StaffRatingPanel dùng chung cho FE-24; (6) guard + menu; (7) test + axe.

RÀNG BUỘC: KHÔNG có thao tác xóa vĩnh viễn; KHÔNG tự tính trung bình từ dữ liệu phân trang; KHÔNG render HTML từ người dùng và vô hiệu liên kết trong nội dung; không bịa endpoint khi BE đã có hợp đồng khác — dùng hợp đồng thật; mốc giờ chỉ qua lib/time.ts; chuỗi tiếng Việt; không emoji/gradient/Inter; panel .glass-admin, bảng/ô nhập Surface đặc.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp ở 375/1280 (đủ trạng thái); axe; kiểm duyệt chỉ bằng bàn phím; test nội dung độc hại.

BÁO CÁO: file đổi, kết quả lệnh, tình trạng BE-34, điểm cần Kiệt (BE-34), Anh (FE-24 gắn panel) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
