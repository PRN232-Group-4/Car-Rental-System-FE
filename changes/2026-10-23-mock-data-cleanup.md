# Kiểm tra và dọn dữ liệu giả — 2026-10-23

Phạm vi: `Car-Rental-System-FE` + `Car-Rental-System-BE`. Phương pháp: đọc mã và grep (bỏ `node_modules`, `.git`, `out`, `.next`, `bin`, `obj`), không truy cập database thật.

## Kết luận nhanh

- **FE không còn mock engine**: không có `src/api/mock/**`, không còn hằng `MOCK_*` ngoài thư mục test, không `picsum.photos`/`placehold.co` trong runtime, mọi adapter đều fail closed khi API lỗi.
- **BE không có seeder tự chạy**: `Program.cs` chỉ đăng ký migration / expiry / telemetry / redis; `db/migrations/*.sql` không có `INSERT INTO users|vehicles|rentals`.
- **4 chỗ dữ liệu bịa vẫn lộ ra giao diện** (đã xử lý, xem bảng A).
- **1 rủi ro cấu hình ngoài phạm vi mock** (mục D) — cần người có quyền xử lý.

## A. Dữ liệu bịa lộ ra UI — đã sửa

| # | Vị trí | Vấn đề | Đã sửa |
|---|---|---|---|
| A1 | `src/features/driver-portal/DriverPortalShell.tsx` | Cổng tài xế bịa danh tính: `email ?? "driver@thongdong.vn"`, `fullName ?? "Tài xế Thong Dong"`, `phone: "0901 234 567"`, `roles: ["Driver","Staff"]`, `staffId: 1`, `departmentId/facilityId: 1`; và `app/staff/layout.tsx` **không có cổng đăng nhập**, nên khách chưa đăng nhập vẫn thấy “cổng tài xế”, còn các trang con gọi API thật bằng `staffId = 1` | `/staff/**` nay bọc `AuthGate allowedRoles={DRIVER_PORTAL_ROLES}` + `usePortalAccess(isDriverStaffAccount)`; shell render `DriverShellSkeleton` khi đang kiểm tra, hiện thông báo + nút về đăng nhập khi thiếu hồ sơ; bỏ toàn bộ fallback bịa |
| A2 | `src/features/driver-portal/DriverPortalOverview.tsx` | Fallback `"Tài xế"` / `"Đội xe & Tài xế"` khi thiếu dữ liệu phiên | Hiện tên thật (hoặc email), phòng ban thiếu ghi “Chưa cập nhật phòng ban” |
| A3 | `src/features/admin/users/api.ts` + `hooks.ts` | `reviewCustomerLicense` và `adjustCustomerLoyalty` trả `{ fullName: "khách hàng" }`, toast đọc “Đã phê duyệt GPLX cho khách hàng” như thể là tên thật | Hai hàm trả `void`; toast nêu việc đã làm, không giả tên người |
| A4 | `src/features/landing/components/InteractiveStudio3D.tsx` | 2 xe Porsche hard-code với thông số cụ thể được trình bày như danh mục đội xe | Giữ mô hình (thiết kế có chủ đích, có `public/models/CREDITS.md`) nhưng thêm dòng nhãn dưới tiêu đề: “Mô hình minh họa theo thiết kế · Không thuộc đội xe đang cho thuê” |

## B. Mock/seed còn trong mã nhưng không chạy ở production — giữ, có ghi chú

| # | Vị trí | Trạng thái |
|---|---|---|
| B1 | `src/__tests__/**` (`users-backend-fixture.ts`, `staff-backend-fixture.ts`, `MOCK_KPIS`, `MOCK_FLEET`) | Fixture kiểm thử hợp lệ, chỉ test import. **Giữ** |
| B2 | `e2e/**`, `tests/**` (`page.route` payload tự tạo) | Fixture e2e. **Giữ** |
| B3 | `src/features/admin/policies/pricing-calculator.ts` (`SAMPLE_BASE_RENTAL`) | Đơn giá mẫu **có nhãn** “Mô phỏng tính giá trên đơn mẫu”. **Giữ** |
| B4 | `public/models/*.glb` + `CREDITS.md`, `public/assets/hero-*.jpg` | Tài sản minh hoạ có chủ đích theo `DESIGN.md` A8, có attribution. **Giữ** |
| B5 | BE `docs/db/Init.sql` (seed 5 role nền) | Dữ liệu tham chiếu bắt buộc, idempotent. **Giữ** |
| B6 | BE `tests/**/Seed.cs`, `Scenarios.cs`, `PostgresFixture.cs` | Helper tạo DB tạm mỗi test class. **Giữ** |
| B7 | BE `db/seed/seed_demo_neon.sql` + `rollback_seed_demo_neon.sql` (untracked) | Seed demo chạy tay, **không được tham chiếu ở đâu** trong `src`, docs, CI, compose, railway. Chứa id 100+ và mật khẩu chung `Demo@12345`. **Không commit, không chạy trên DB thật** — lưu ý: file chèn id tường minh vào cột `IDENTITY` nên sequence không nhảy, có nguy cơ trùng PK khi sequence chạm 100 |

## C. Đã dọn phần “mock” còn sót trong cấu hình và tài liệu

| # | Vị trí | Thay đổi |
|---|---|---|
| C1 | `e2e.config.ts` | Bỏ `env: { NEXT_PUBLIC_USE_MOCK: 'true' }` — cờ không còn mã nào đọc |
| C2 | `src/features/rentals/api.test.ts` | Bỏ `isMockMode: false` khỏi `vi.mock` (không còn export) |
| C3 | `docs/specs/FE-FOUNDATION.md`, `docs/specs/FE-02-session-rbac.md` | Ghi rõ mock engine đã gỡ; phần mô tả mock cũ giữ làm mốc lịch sử, có cảnh báo |

## D. Ngoài phạm vi — cần người có quyền xử lý

- `src/VehicleRental.WebApi/appsettings.json` của BE (không tracked, nhưng có trong working tree) chứa **cấu hình production thật** (connection string Neon, Redis, Brevo, PayOS, Google OAuth, Cloudinary, JWT signing key) và là cấu hình mặc định khi `dotnet run`. Dev chạy local sẽ thao tác trên DB production. `docs/deployment.md` của chính BE đã quy định “secrets không để trong `appsettings*.json`” ⇒ cần chuyển sang biến môi trường/user-secrets và **rotate** các key đã lộ. Tôi không in giá trị nào trong báo cáo này.
- **Không truy cập DB thật** nên chưa xác nhận được `seed_demo_neon.sql` đã từng chạy trên DB ứng dụng hay chưa; nếu nghi ngờ, kiểm tra các bản ghi có marker `[seed]` / id ≥ 100 trước khi xoá.
- Chưa xác minh nguồn và license của `public/assets/hero-*.jpg`, `logo*.jpg|png` (ảnh thật / ảnh AI / ảnh mẫu).

## Việc team nên chốt

1. Có commit `db/seed/**` hay không (nếu commit, phải bỏ mật khẩu demo khỏi file và không trỏ vào DB thật).
2. Có cần script kiểm tra “không còn marker `[seed]`” trên DB ứng dụng trước khi phát hành.
