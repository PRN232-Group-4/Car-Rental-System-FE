# Rà soát account/role và ma trận phân quyền — 2026-10-23

Báo cáo đầy đủ: `docs/rbac-permission-matrix.md` (vai trò, ma trận chức năng × vai trò theo policy backend, ma trận menu/route/cổng trang hiện tại, kết quả theo checklist, danh sách phát hiện và đề xuất).

## Kết quả

- **Đã sửa (R2)**: trang `/admin/reports/detail` chặn `Maintenance` trong khi menu, quy tắc route (`access.ts` → `/admin/reports`) và API `GET /api/reports` đều cho phép — Maintenance bị đá sang `/forbidden` khi mở chi tiết báo cáo. Cổng trang nay gồm `Admin, Manager, Staff, CustomerService, Maintenance`, kèm test bất biến trong `src/__tests__/features/auth/access.test.ts` để cổng trang không hẹp hơn quy tắc route.
- **Ghi nhận, chờ quyết định (R1/P0)**: FE cấp cho role `Staff` nhiều chức năng mà backend từ chối (đơn thuê, bàn giao, kiểm tra xe, khách hàng/GPLX, lịch tài xế, theo dõi). FR-007 khẳng định `Staff` chỉ là “employee marker” và `docs/API.md` ghi policy danh sách đơn “không bao gồm role Staff”, nên tài khoản chỉ có `Staff` thấy menu nhưng mọi request trả 403. Theo `docs/specs/admin-role-simplification-plan.md` (quyết định D1 còn mở, chỉ dẫn “báo parent trước; không tự giải quyết bằng cấp thêm quyền”), đợt này **không tự đổi quyền**; báo cáo nêu rõ hai phương án và danh sách file cần sửa cho từng phương án.
- **Ghi nhận (R4/P2)**: nhiều trang quản trị nặng (phòng ban, cơ sở, loại xe, khách hàng, kiểm tra, bảo trì, theo dõi) chưa có cổng `AuthGate` riêng nên việc chặn theo URL dựa vào `admin/layout.tsx` (5 role cổng nội bộ) và API 403. Đề xuất dùng chung `canAccessRoute` trong cổng route sau khi chốt D1.

## Đã kiểm chứng

- Đọc policy thật trong `src/VehicleRental.WebApi/Controllers/*` và `AuthorizationPolicies.Configure`, đối chiếu với `src/features/auth/access.ts`, `src/config/navigation.ts`, `AuthGate` từng trang và các `hasRole` trong component.
- Chưa đăng nhập/token hết hạn: 401 → `token-refresh` gọi `/api/auth/refresh`; thất bại phát `auth:unauthorized`, `AuthContext` chuyển anonymous, `AuthGate` đưa về `/login?next=...`.
- Điều hướng sau đăng nhập theo role: `portal-routing.ts` (Admin/Manager → `/admin`; Staff/Driver có hồ sơ tài xế → `/staff`; Staff/CustomerService/Maintenance → `/admin`; còn lại → `/`).
- Dữ liệu theo chủ sở hữu: `rentals/mine`, `mine/{id}` và hóa đơn/giao dịch lọc theo `email` từ claim; đơn ngoài phạm vi trả 404.
- `npx vitest run src/__tests__/features/auth src/features/auth` và `npm run typecheck` đạt.

## Chưa kiểm chứng

- Chưa chạy E2E Playwright theo từng role (cần app + backend đang chạy); các kết luận về hành vi API dựa trên policy và test HTTP của backend.
- Ma trận chưa được team xác nhận: danh sách quyết định D1/D2/D3 nằm trong `docs/specs/admin-role-simplification-plan.md` và mục 6 của báo cáo.
