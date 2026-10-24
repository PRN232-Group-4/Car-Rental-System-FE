# Gắn nhật ký kiểm toán vào API thật — 2026-10-23

## Bối cảnh

Backend đã có `GET /api/audit-logs` (policy `Management` → Admin, Manager). Trang `/admin/audit-logs` ở FE **đã** gọi endpoint này, nhưng còn ba điểm khiến nó không dùng được thực tế:

1. Banner lỗi luôn khẳng định "Backend hiện chưa triển khai endpoint truy vấn nhật ký (GET /api/audit-logs)" — sai thời sự; đo thật trên backend đang chạy: `GET https://api-car-rental.mpdev.tech/api/audit-logs` → **401** (route tồn tại; 404 mới là chưa có).
2. Bộ lọc hành động có `profile_created` — backend **không bao giờ** ghi action này, nên chọn vào là chắc chắn rỗng.
3. Ô tìm kiếm/khoá hành động áp dụng ngay mỗi lần gõ (bắn 1 request mỗi ký tự) và không có nút "Áp dụng" như mọi trang Admin khác.

## Đã làm

`src/features/admin/audit-logs/api.ts`
- `AUDIT_ACTIONS` đúng **5** action backend chuẩn hoá từ `user_administration_audit`: `role_assigned`, `role_removed`, `account_locked`, `account_unlocked`, `session_revoked` (bỏ `profile_created`).
- `auditActionLabel` / `auditStatusLabel`: giá trị lạ hiển thị **nguyên văn**, không tự gán nhãn ("Cảnh báo") cho dữ liệu chưa biết.
- `toAuditLogQuery`: trim từ khoá, bỏ `action=all`, mặc định `page=1&pageSize=20`, chặn giá trị ≤ 0.
- `getAuditLogs`: giữ `page`/`pageSize`/`totalCount` **do server trả** (phân trang không lệch), chịu được payload thiếu `items`.
- DTO bổ sung `actorId`, `targetUserId` (backend đã trả) để hiển thị mã đối tượng.

`src/app/admin/audit-logs/page.tsx`
- Bộ lọc theo đúng mẫu Admin: `ValidatedForm` + `AdminFilterBar` với **Áp dụng / Đặt lại**, không gọi API khi đang gõ; lỗi 400 của backend map về đúng trường (`search`/`action`) bằng `mapValidationErrors` và focus trường lỗi đầu tiên.
- Bỏ banner "chưa triển khai"; thay bằng lỗi thật kèm **HTTP status**, gợi ý đăng nhập bằng tài khoản Admin/Manager và nút thử lại.
- Bảng: thêm tiêu đề khối + số bản ghi ("mới nhất trước" — khớp `ORDER BY created_at DESC, id DESC`), cột Đối tượng hiển thị email **và** `#id`.
- Trạng thái: `success` → tone thành công, `blocked` → tone chặn, giá trị lạ hiển thị nguyên văn (không dùng badge để không ngụ ý mức độ).
- Trạng thái rỗng phân biệt rõ: chưa có bản ghi · không khớp bộ lọc · lỗi tải.

## Kiểm chứng

- `src/features/admin/audit-logs/api.test.ts` (6 test): mapping query, giữ số trang của server, payload thiếu field, đúng 5 action, nhãn hành động/trạng thái không bịa.
- `src/__tests__/features/admin/audit-logs/AuditLogsPage.test.tsx` (7 test): render dữ liệu thật, không gọi API khi đang gõ, Áp dụng/Đặt lại, lỗi 403 có HTTP status + thử lại, hai trạng thái rỗng, trạng thái lạ.
- `e2e/admin-audit-logs.spec.ts` (2 test Playwright, chạy Chromium thật): hiển thị + lọc theo hành động + đặt lại; lỗi 403 → `(HTTP 403)` + nút thử lại. **2/2 đạt**.
- Toàn bộ: `typecheck` sạch · `lint` 0 error · `lint:design` đạt · `npm test` **122 file / 1012 test đạt** · `build` đạt (264 trang).

## Ghi chú ngoài phạm vi

Log dev server có `[Facilities API] ... The origin web server returned an invalid or incomplete response to Cloudflare` — đây là lỗi 5xx từ **backend đang chạy** (`api-car-rental.mpdev.tech` quá tải/origin lỗi), không phải lỗi FE: FE đã hiện trạng thái lỗi + nút thử lại cho khối chi nhánh. Cần kiểm tra log/origin của backend.
