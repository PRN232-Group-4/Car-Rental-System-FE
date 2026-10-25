# Ma trận phân quyền và rà soát RBAC — 2026-10-23

Đối tượng: 7 vai trò của hệ thống, 2 cổng nội bộ (`/admin`, `/staff`) và cổng khách hàng.

Nguồn xác thực: `../Car-Rental-System-BE/specs/FR-007-rbac.md`, `../Car-Rental-System-BE/docs/staff-authorization.md`, các `[Authorize]` trong `src/VehicleRental.WebApi/Controllers/*`, `AuthorizationPolicies.Configure`, đối chiếu với `src/features/auth/access.ts`, `src/config/navigation.ts`, `AuthGate` của từng trang và các kiểm tra `hasRole` bên trong component.

## 1. Vai trò

| Vai trò | Bản chất | Ghi chú |
|---|---|---|
| `Admin` | Quản trị hệ thống | Có trong mọi policy; giao diện cố ý không mời Admin vào module vận hành/chăm sóc (tinh gọn menu) |
| `Manager` | Quản lý vận hành | `Management` = Admin, Manager |
| `CustomerService` | Chăm sóc khách hàng & đơn thuê | `CustomerService` = Admin, Manager, CustomerService |
| `Maintenance` | Kỹ thuật/bảo trì | `Maintenance` = Admin, Manager, Maintenance; `Inspection` còn yêu cầu hồ sơ nhân viên |
| `Driver` | Tài xế | `DriverSchedule` = Admin, Manager, Driver (chỉ xem ca của mình) |
| `Staff` | **Chỉ là dấu hiệu nhân viên**, không cấp quyền nghiệp vụ | FR-007: “Staff (employee marker only)” |
| `Customer` | Khách hàng | Chỉ đơn/hồ sơ/giao dịch của chính mình |

## 2. Ma trận chức năng × vai trò (backend là nguồn quyết định)

| Chức năng (endpoint tiêu biểu) | Policy BE | Admin | Manager | CustomerService | Maintenance | Driver | Staff | Customer |
|---|---|---|---|---|---|---|---|---|
| Tổng quan ca trực, navigation counts | `[Authorize]` / Roles có Staff | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ❌ |
| Người dùng, vai trò, phòng ban (ghi) | `RequireAdmin` / `Roles=Admin` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Phòng ban/cơ sở (đọc), nhân sự | `Management` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kho xe, loại xe, gói thuê bao, chính sách giá (ghi) | `Management` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Đọc xe/loại xe (public) | không yêu cầu | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Danh sách đơn thuê, chi tiết vận hành, quá hạn | `CustomerService` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Vòng đời đơn (duyệt/bàn giao/trả/quyết toán) | `CustomerService` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hủy đơn (khách hoặc nhân viên có quyền) | `[Authorize]` + kiểm tra sở hữu/vai trò | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ đơn mình |
| Bàn giao xe | `CustomerService` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kiểm tra xe | `Inspection` (Admin/Manager/Maintenance + hồ sơ nhân viên) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Danh mục kiểm tra (đọc) | `Roles=Admin,Manager,CustomerService,Maintenance` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Bảo trì | `Maintenance` (tạo: `Management`) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Danh mục khách hàng, duyệt GPLX | `CustomerService` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Báo cáo sự cố (đọc/ghi) | `Roles=Admin,Manager,Staff,Maintenance,CustomerService` (+Driver khi đọc) | ✅ | ✅ | ✅ | ✅ | ✅ (đọc) | ✅ | ❌ |
| Ca trực tài xế | `DriverSchedule` | ✅ | ✅ | ❌ | ❌ | ✅ ca mình | ❌ | ❌ |
| Theo dõi/geofence | `Management`/`Admin` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hóa đơn, thanh toán, hoàn cọc | `FinancialRead`/`CustomerService` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ hóa đơn mình |
| GPLX của tôi, đặt xe, mua gói, checkout | `Customer` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

`✅` = được phép, `❌` = bị từ chối, `➖` = không áp dụng.

## 3. Ma trận menu FE hiện tại và điểm lệch

| Route | Rule trong `access.ts` | Menu `navigation.ts` | Cổng trang (`AuthGate`/component) | Backend |
|---|---|---|---|---|
| `/admin/users`, `/admin/roles` | Admin | Admin | Admin | Admin ✅ |
| `/admin/departments` | Admin | Admin | không có cổng trang | Admin/Management ✅ (URL vẫn vào được nhưng API 403) |
| `/admin/facilities` | Admin, Manager | Admin?, Manager | không có cổng trang | Management ✅ |
| `/admin/vehicle-types`, `/admin/subscription-plans`, `/admin/policies`, `/admin/reviews` | Admin, Manager | Manager (+Admin policies?) | AuthGate Admin/Manager | Management ✅ |
| `/admin/rentals` | **Staff**, CustomerService, Manager | Staff, CustomerService, Manager | `AdminRentalsPage` cho Staff; `RentalWorkspaceV4` chỉ cho Admin/Manager/CustomerService thao tác | **CustomerService** (không có Staff) ⚠️ |
| `/admin/handovers` | **Staff**, Manager | Staff, Manager | `HandoverPanel` cho Staff | **CustomerService** ⚠️ |
| `/admin/inspections` | **Staff**, Maintenance, Manager | Staff, Maintenance, Manager | không có cổng trang | **Inspection** = Admin/Manager/Maintenance ⚠️ |
| `/admin/customers`, `/admin/vehicle-license` | **Staff**, CustomerService, Manager | CustomerService, **Staff**, Manager | `CustomerLicenseManager` cho staff | **CustomerService** ⚠️ |
| `/admin/drivers`, `/admin/drivers/schedule` | Admin, Manager, **Staff** | Staff, Manager | AuthGate Admin/Manager/**Staff** | **DriverSchedule** = Admin/Manager/Driver ⚠️ (Staff thừa, Driver thiếu) |
| `/admin/tracking` | Admin, Manager, **Staff** | Staff, Manager | `TrackingManager` chỉ Admin/Manager | `Management` ⚠️ (mâu thuẫn nội bộ FE) |
| `/admin/reports` | Staff, CustomerService, Maintenance, Manager | Staff, CustomerService, Maintenance, Manager | `IncidentTriage` không chặn; trang chi tiết AuthGate | Roles có Staff/Maintenance ✅ |
| `/admin/reports/detail` | (kế thừa `/admin/reports`) | — | **thiếu Maintenance** (đã sửa) | Roles có Maintenance ✅ |
| `/staff/**` | Driver, Admin, Manager, **Staff** | Driver, Admin, Manager, Staff | `usePortalAccess(isDriverStaffAccount)` | `staff/*` = Admin/Manager ⚠️ |
| `/booking`, `/invoices`, `/profile`, `/payment-history`, `/report-incident` | authenticated | authenticated | — | `[Authorize]` ✅ |
| `/my-rentals`, `/driver-license`, `/my-subscriptions`, `/rental-contract`, `/account/trips` | Customer | Customer | AuthGate Customer | `Customer` + lọc theo `email` của chính tài khoản ✅ |

## 4. Kết quả rà soát theo checklist yêu cầu

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Menu/trang/nút theo từng role | Đúng cho Admin/Manager/CustomerService/Maintenance/Driver/Customer; **sai cho Staff** | Mục 3 ⚠️ |
| Chặn truy cập trực tiếp bằng URL | Các trang có `AuthGate` chặn và chuyển `/forbidden`. Các trang chỉ dựa vào `admin/layout.tsx` (dùng chung 5 role cổng nội bộ) vẫn mở được với role không có quyền, sau đó API trả 403 và trang hiển thị lỗi | `src/app/admin/layout.tsx:14`, `src/features/auth/AuthGate.tsx` |
| API backend kiểm tra quyền | Có: mọi controller dùng policy/role, không chỉ ẩn nút | `AuthorizationPolicies.cs`, các `[Authorize]` đã liệt kê |
| Chưa đăng nhập / token hết hạn | 401 → `token-refresh` gọi `/api/auth/refresh`; thất bại phát `auth:unauthorized`, `AuthContext` chuyển anonymous, `AuthGate` đưa về `/login?next=...` | `src/api/token-refresh.ts`, `src/api/api-client.ts:266`, `AuthContext.tsx:129` |
| Điều hướng sau đăng nhập theo role | Admin/Manager → `/admin`; Staff/Driver có hồ sơ tài xế → `/staff`; Staff/CustomerService/Maintenance → `/admin`; còn lại → `/` | `src/features/auth/portal-routing.ts` |
| Customer chỉ thấy dữ liệu của mình | Có: `rentals/mine`, `mine/{id}`, hóa đơn và giao dịch lọc theo `email` từ claim; đơn ngoài phạm vi trả 404 | `RentalQueriesController`, `NpgsqlPaymentRepository`, FR-007 |

## 5. Phát hiện

| # | Mức | Phát hiện | Bằng chứng | Trạng thái |
|---|---|---|---|---|
| R1 | P0 | **FE cấp cho role `Staff` nhiều chức năng mà backend từ chối**, nên tài khoản chỉ có `Staff` thấy menu/trang nhưng mọi request trả 403: đơn thuê, bàn giao, kiểm tra xe, khách hàng/GPLX, lịch tài xế, theo dõi. FR-007 khẳng định Staff là “employee marker only”, và `docs/API.md` ghi rõ policy danh sách đơn “không bao gồm role Staff”. | Mục 3; `access.ts`; `navigation.ts`; `AdminRentalsPage.tsx:29`; `HandoverPanel.tsx:17`; `CustomerLicenseManager.tsx:30` | **Chờ quyết định D1** — không tự sửa theo chỉ dẫn trong `docs/specs/admin-role-simplification-plan.md` (“báo parent trước; không tự giải quyết bằng cấp thêm quyền”) |
| R2 | P1 | Trang chi tiết báo cáo sự cố chặn `Maintenance` dù menu, quy tắc route và API `GET /api/reports` đều cho phép — Maintenance bị đá sang `/forbidden` giữa luồng. | `src/app/admin/reports/detail/page.tsx` (cũ) vs `access.ts` `/admin/reports` | ✅ **Đã sửa** (thêm Maintenance) + test bất biến trong `access.test.ts` |
| R3 | P2 | `access.ts` cho `Staff` vào `/admin/tracking` nhưng chính component `TrackingManager` chỉ cho Admin/Manager ⇒ mục menu dẫn tới màn hình từ chối. | `access.ts`, `TrackingManager.tsx:26` | Cùng nhóm R1, xử lý khi chốt D1 |
| R4 | P2 | Nhiều trang quản trị nặng (phòng ban, cơ sở, loại xe, khách hàng, kiểm tra, bảo trì, theo dõi) không có cổng `AuthGate` riêng, nên bảo vệ URL phụ thuộc hoàn toàn vào `admin/layout.tsx` (5 role) + API 403. | danh sách `gate=False` trong `src/app/admin/**/page.tsx` | Ghi nhận; đề xuất hợp nhất `canAccessRoute` vào cổng route (xem mục 6) |
| R5 | P2 | Cổng trang `/admin/reports/detail` từng cho Admin nhưng rule route không cho Admin ⇒ không có lối vào nhất quán. | `access.ts` vs trang | Đã thống nhất theo rule route (Admin vẫn vào được nếu có link trực tiếp); mục này không đổi |

## 6. Đề xuất xử lý (cần chốt)

1. **D1 — Staff có được làm nghiệp vụ chi nhánh?** Nếu **không**: bỏ `Staff` khỏi các policy nghiệp vụ ở backend là việc đã xong; FE cần bỏ `Staff` khỏi `ROUTE_ACCESS_RULES`, `roles` trong `navigation.ts`, `AdminRentalsPage`, `HandoverPanel`, `CustomerLicenseManager`, và cập nhật `navigation.test.ts`/`access.test.ts`/`rbac-stress.test.ts`. Nếu **có**: backend phải thêm `Staff` vào `CustomerService`/`Inspection`/`DriverSchedule` (đổi FR-007) — không được chỉ bật menu.
2. **Cổng route dùng chung**: thêm tuỳ chọn cho `AuthGate` đánh giá `canAccessRoute(pathname, roles)` để mọi trang trong `/admin`, `/staff`, khu khách hàng được chặn ngay ở tầng URL thay vì chờ API 403. Cách này biến `access.ts` thành nguồn duy nhất cho cả menu và URL, nhưng phải chốt D1 trước để không vô tình chặn role hợp lệ.
3. **Test hợp đồng liên repo**: giữ danh sách role kỳ vọng cho từng module trong một file dữ liệu duy nhất ở FE (sinh từ FR-007) và so với policy thật của BE trong CI, để lệch quyền bị phát hiện tự động thay vì phát hiện khi người dùng gặp 403.

## 7. Cách kiểm chứng lại

```bash
npx vitest run src/__tests__/features/auth src/features/auth
npm run typecheck
```
