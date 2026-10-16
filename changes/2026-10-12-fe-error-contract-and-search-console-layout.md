# 2026-10-12 — Lỗi API trả về & layout dropdown SearchWidget

- **FR/NFR:** NFR-007 (chất lượng), NFR-008 (UX)
- **Loại:** fix

## Đã làm

### 1. FE bám đúng lỗi do API trả về

BE bọc mọi response trong `ApiResponse { code, status, is_success, data, message, error }`, nên `ProblemDetails` nằm ở `error` chứ không ở gốc. FE lại đọc `data.errors` / `data.detail` ở gốc → không bao giờ khớp, lỗi theo trường của BE bị mất và người dùng chỉ thấy thông báo chung.

- **`src/api/api-client.ts`** — `ApiClientError` lấy `problem = data.error ?? data`, đọc `errors` để ghép thông báo theo trường, fallback theo thứ tự `error.detail` → `message` (thông báo BE soạn) → `error.title`. Thêm helper `asRecord`. Vẫn nhận `ProblemDetails` trần (timeout 408 và 401 sau refresh không đổi hành vi).
- **`src/components/forms/inline-validation.tsx`** — `mapValidationErrors` đọc `problem.errors` với cùng cách unwrap, nên lỗi `errors` của BE (PascalCase, đường dẫn lồng như `RentalRequest.EndTime`) map về đúng trường; lỗi không map được giữ ở vùng lỗi chung (`remaining`) theo AGENTS.md.
- **`src/features/auth/components/LoginForm.tsx`** — bỏ nhánh tự đặt lỗi `401 → "Email hoặc mật khẩu không chính xác"` và nhánh chết `"detail" in err.data`; hiển thị thẳng `ApiClientError.message` (thông báo BE) để không che các lý do khác như khoá tài khoản hay sai định dạng.

### 2. Dropdown "Trạm nhận xe" và "Lịch trình di chuyển" bị section phía sau đè lên

- **`src/features/landing/components/Hero.tsx`** — `z-10` → `z-30` ở wrapper nội dung Hero. Trước đó wrapper tạo stacking context z-10, nên `z-50` của popover bị nhốt bên trong và `<div class="relative z-10">` của `InteractiveStudio3D`/`MultiFleetCatalog` (đứng sau trong DOM) vẽ đè lên đúng phần thân dropdown. `z-30` vẫn dưới navbar và `BookingModal` (z-50).
- **`src/features/rentals/components/SearchWidget.tsx`** — thêm `min-w-0` cho hai cột `flex-1`: ở `md`(768)–`1024px`, `min-width:auto` giữ cột ở bề rộng nội dung nên cả dải console (kèm nút "Tìm Xe") tràn ra ngoài khung `glass-2`, kéo popover neo theo cột văng khỏi màn hình. Thêm `sm:max-w-[calc(100vw-2rem)]` cho popover thời gian.

## Test

- `npm run typecheck` xanh; `npm test` **57/57 pass** (thêm 2 test `api-client` cho envelope `error.errors`/`message`, 1 test `mapValidationErrors` cho envelope thật).
- Kiểm chứng layout bằng Playwright ở 1280/768/375px: `elementFromPoint` tại 3 điểm nửa dưới mỗi panel phải trả về chính panel đó — trước fix **0/3**, sau fix **3/3** ở cả 6 tổ hợp; console ở 768/900/1024px không còn tràn khung.

## Chưa làm

- `RegisterForm.tsx` vẫn còn 3 nhánh `"detail" in err.data` (không còn khớp envelope, nhưng rơi xuống `err.message` nên vẫn hiện đúng thông báo BE) — dọn ở lần đụng file sau.
- Ở `md` (768px) nhãn cột bị truncate (`TP. Hồ Chí Mi…`, `21:00 T2, 12/…`) — chấp nhận, ưu tiên không tràn khung.

## Quyết định/giả định

- Chỉ sửa 1 điểm z-index ở Hero thay vì portal hoá popover: ít thay đổi nhất mà vẫn thoát stacking context.
- FE không tự thêm ràng buộc/ thông báo lỗi nghiệp vụ mới; các gate hiện có của `dat-xe` (GPLX `approved`, số giờ gói còn lại) giữ nguyên vì đã có trong spec P3.5/P5.1.
