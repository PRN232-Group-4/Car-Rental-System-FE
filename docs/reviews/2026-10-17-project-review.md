# Project review — 2026-10-17

Hai agent read-only (`qa-reviewer`, `techlead`) chạy song song trên toàn repo; báo cáo này là bản hợp nhất đã khử trùng lặp.

## Tóm tắt

1. `typecheck`, `npm test` (467 test), `lint:design` đều **PASS** — nhưng ba cổng này không bắt được các vi phạm form/popup/bảng bên dưới.
2. Rủi ro lớn nhất không phải code hỏng mà là **dữ liệu giả hiển thị như thật**: 3 module admin CRUD (users/staff/reviews) chạy in-memory, dashboard 5/7 dataset hardcode, nhiều fallback `MOCK_*` không có cổng `isMockMode`.
3. Có lỗi chức năng thật: prefix `/api/api/...` gây 404 ở trips/reports/policies/dashboard, và `/staff/**` **không có AuthGate** kèm danh tính tài xế bịa.
4. Trang tìm xe công khai bind `MOCK_FACILITIES` → chi nhánh thật không bao giờ xuất hiện trong bộ lọc.
5. Kiến trúc nền tốt (ApiClient tập trung, `inline-validation` 40 caller, rule máy kiểm được); nợ chính là **2 chuẩn format song song** và **37 file tự fetch bằng `useEffect`** thay vì react-query.

## Đã chạy thật

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **PASS**, 0 lỗi |
| `npm test` (`vitest run`) | **PASS** 61/61 file, 467/467 test. Noise không fail: `Not implemented: navigation` (jsdom, test auth click link) |
| `npm run lint:design` | **PASS** — `100% quy tắc DESIGN.md v3.0 Phần A`. Lưu ý: rule này **không** phát hiện vi phạm FormDialog/AdminRowAction/AdminFilterBar nêu dưới |
| `codegraph status` | 425 file index, 3.592 node / 8.293 edge, 54 route |

## Findings hợp nhất (P0 → P2)

| # | Mức | Vấn đề | Vị trí | Cách sửa nhỏ nhất |
|---|---|---|---|---|
| 1 | **P0** | `/staff/**` không có AuthGate; shell tự bịa danh tính (`driver@thongdong.vn`, `0901 234 567`, `staffId: 1`) → khách chưa đăng nhập vẫn vào cổng tài xế | `src/app/staff/layout.tsx:10`, `src/features/driver-portal/DriverPortalShell.tsx:39-49` | Bọc `<AuthGate allowedRoles={DRIVER_PORTAL_ROLES}>` trong layout; bỏ toàn bộ fallback trong `activeAccount` |
| 2 | **P0** | Gọi `apiClient.get("/api/...")` trong khi `baseUrl` đã là `/api` ⇒ URL thật `/api/api/...` (404) → trips luôn hiện 4 chuyến giả, cancel "thành công" cục bộ | `src/features/account/trips/api.ts:388,423,443,503`; `admin/dashboard/api.ts:130,142`; `admin/policies/api.ts:117-212`; `admin/reports/api.ts:199-336` | Bỏ tiền tố `/api/` (dùng `"rentals/mine"`, `"reports"`… như `src/features/admin/api.ts`) |
| 3 | **P0** | Dashboard admin: 5/7 dataset `return MOCK_*` vô điều kiện, KPI fallback mock khi lỗi → số liệu tài chính bịa | `src/features/admin/dashboard/api.ts:136,175-193` | Gọi `backendApiClient.get("dashboard/...")`; lỗi thì `throw` để `ErrorState` hiện |
| 4 | **P0** | CRUD nhân viên & người dùng chạy mảng in-memory (`MOCK_STAFFS_DB`, `MOCK_USERS_DB`, `MOCK_REVIEWS`), 0 lời gọi client, mất dữ liệu khi reload | `features/admin/staff/api.ts:42,275-620`; `features/admin/users/api.ts:42,276-590`; `features/admin/reviews/api.ts:14,262` | Chuyển sang `backendApiClient`, dùng lại DTO/mapper của `features/admin/api.ts:263-279`, giữ nguyên chữ ký hàm cho hook |
| 5 | **P0** | Mock lọt luồng thật không qua `isMockMode`: record bàn giao xe giả cho mọi lỗi; đơn thuê/tài xế giả cho `id ∈ {1,101,98}` | `src/features/inspections/api.ts:5-12` (so với bản đúng `:18`); `src/features/operations/api.ts:19-43,69-113` | Bọc mọi fallback bằng `if (!isMockMode) throw` như `inspections/api.ts:18` |
| 6 | **P0** | Trang tìm xe công khai bind `MOCK_FACILITIES` → chi nhánh thật không xuất hiện trong filter | `src/app/(marketing)/find/page.tsx:21,270,322,409`; `src/features/facilities/api.ts:46` | Dùng `getFacilities()` qua react-query, cùng query key với `SearchWidget` |
| 7 | **P1** | 5 trang admin dùng cột thao tác tự dựng + `DataTable` + filter tay, không dùng `AdminRowAction`/`AdminTableCard`/`AdminFilterBar` — `lint:design` vẫn PASS | `src/app/admin/users/page.tsx:227-255` (cùng `staffs`, `reports`, `reviews`, `subscription-plans`); `users/components/UserFilters.tsx:49-89`; `staff/components/StaffFilters.tsx:35-106` | Mẫu đúng có sẵn: `features/operations/DispatchManager.tsx:59-104`; đổi `<td data-actions>` + `AdminRowAction action="view|edit|delete"` |
| 8 | **P1** | Form tạo nhân viên chỉ có 1 banner lỗi chung, không `aria-invalid`/`aria-describedby`/`role=alert`, không focus trường lỗi; `userId` mặc định `"6"` là giá trị giả | `src/app/admin/staffs/new/page.tsx:18,31,39-45,225-228` | Chuyển sang `useInlineValidation` + `ValidatedForm`/`InlineInput`; `useState("")` cho `userId` |
| 9 | **P1** | Form chi tiết nhân viên: `<form>` thô 604 dòng, không validation/mapping lỗi, mutation chỉ `toast.error` | `src/app/admin/staffs/detail/page.tsx:295,382`; `features/admin/staff/hooks.ts:80-127` | Đưa về `ValidatedForm` + map `ProblemDetails.errors` về trường |
| 10 | **P1** | 2 popup dùng `Modal` thay `FormDialog` + `FormDialogFooter` trong `ValidatedForm` | `features/admin/users/components/UserLockDialog.tsx:46`; `UserLoyaltyDialog.tsx:58` | Đổi sang `FormDialog`+`ValidatedForm`+`InlineTextarea`, giữ logic |
| 11 | **P1** | `ROUTE_ACCESS_RULES`/`canAccessRoute` là dead code → 9 route admin (roles, departments, facilities, vehicle-types, vehicles, dispatch, rentals, maintenance, inspections) không có guard cấp trang | `src/features/auth/access.ts:72,152` | Cho `AuthGate` tự kiểm `canAccessRoute(pathname, roles)` khi không truyền `allowedRoles` |
| 12 | **P1** | Catalog xe seed danh sách tĩnh + `loading` suy từ độ dài mảng → lần tải đầu render xe mẫu như dữ liệu thật; tự fetch bằng `useEffect` | `src/features/vehicles/components/VehicleCatalog.tsx:32-33` | Khởi tạo `[]` + `loading = true`, hoặc `useQuery` như `find/page.tsx` |
| 13 | **P1** | Hai chuẩn format song song: `lib/time.ts` (22 file) vs `lib/date-time.ts` (docs bắt `formatAdminDateTime`, chỉ 7 file); 14 chỗ tự `Intl.NumberFormat("vi-VN")` với hậu tố `đ`/`₫` lẫn lộn | `src/lib/time.ts:83`, `src/lib/date-time.ts:14`; `src/app/admin/page.tsx:27-30`; `driver-portal/DriverRevenueDashboard.tsx:141`; `landing/components/MultiFleetCatalog.tsx:193` | Chốt 1 chuẩn (`formatVnd` + 1 helper ngày), thay 14 chỗ, cập nhật `docs/admin-ui.md` |
| 14 | **P1** | Mapping lỗi `instanceof ApiProblemError ? … : …` lặp 20 chỗ dù đã có helper | `features/admin/users/hooks.ts:74,94,123,139,170,199`; `features/admin/staff/hooks.ts:82,102,122,163`; `policies/components/PolicyDrawer.tsx:87` | 1 helper `mapApiError()` trả `{fields, message}` (dùng `errorMessage` ở `Toaster.tsx:29`) |
| 15 | **P1** | Hai form stack: `react-hook-form`+`zodResolver` chỉ ở 2 file, còn lại `inline-validation` | `policies/components/PolicyDrawer.tsx:42`; `PlanDrawer.tsx:33` | Chốt `inline-validation` theo AGENTS, xoá 2 ngoại lệ |
| 16 | **P1** | Fetch drift: 37 file `useEffect`+`useState` tự fetch vs 31 file react-query (không cache/invalidate) | `driver-portal/DriverRevenueDashboard.tsx:38-90`; `rentals/components/SearchWidget.tsx:77-81` | Chuyển dần sang `useQuery` cùng query key đã có |
| 17 | P2 | `cancelCheckout` nuốt mọi lỗi (kể cả live) → UI không phân biệt "BE chưa có endpoint" với "huỷ thất bại" | `src/features/payments/api.ts:53-61` | Chỉ `return null` khi 404/501, còn lại `throw` |
| 18 | P2 | Dead code còn xuất khẩu; barrel `@/api` re-export cả `MOCK_*` → một import là mock vào bundle | `components/ui/FilterBar.tsx`, `components/ui/DataTable.tsx` (chỉ test dùng), `features/index.ts`, `src/api/index.ts` | Xoá hoặc dùng thật; bỏ re-export `MOCK_*` |
| 19 | P2 | Hai hệ badge trạng thái (22 vs 12 chỗ dùng) | `components/admin/AdminStatusBadge` vs `components/ui/StatusBadge` | Chốt 1, thay chỗ còn lại |
| 20 | P2 | `AdminFilterBar` chỉ 4/26 trang admin dùng; 5 bảng tự dựng `<table>` | `admin/drivers/schedule/page.tsx:201`; `(dashboard)/payment-history/page.tsx:180`; `my-subscriptions/page.tsx:211`; `admin/reviews/components/RatingDistribution.tsx:39`; `driver-portal/DriverRevenueDashboard.tsx:166` | Chuyển sang `AdminFilterBar`/`AdminTable` |
| 21 | P2 | Import chéo feature + 2 vòng lặp: `rentals↔vehicles`, `auth↔profile` | `features/*` (14 admin→auth, 8 operations→admin, 6 auth→profile, 5 landing→rentals) | Rút phần dùng chung xuống `src/components`/`src/lib` khi sửa module đó |
| 22 | P2 | Coupling generated schema thấp: `schema.d.ts` 155 KB nhưng chỉ 4 file import → DTO admin/trips/operations viết tay, `gen:api` không bắt drift | `src/api/generated/schema.d.ts`; `vehicles|rentals|subscriptions/mappers.ts:2`; `profile/api.ts:2` | Chuyển DTO từng module khi có endpoint thật (không làm ồ ạt) |
| 23 | P2 | 24 file >400 dòng (max 712) | `src/app/admin/users/detail/page.tsx:712`; `admin/staffs/detail/page.tsx:604`; `features/admin/users/api.ts:585`; `ProfileManager.tsx:540` | Tách theo tab/section khi sửa file đó |

## Chưa kiểm chứng

- **Không chạy** `npm run test:e2e`, `playwright test`, `npm run test:visual` → mọi kết luận dựa trên đọc code + unit test, chưa xác nhận runtime.
- Không có backend chạy: lỗi `/api/api/...` suy ra từ `src/api/default-api-client.ts:19` + `.env.local`, chưa thấy 404 trên network thật.
- Chưa trace sâu: `/rental-contract`, `/profile`, `/driver-license`, `/my-subscriptions`, `/payment/result`, `/admin/inspections`, `/admin/rentals`.
- A11y chưa kiểm bằng trình duyệt/screen reader, chỉ đọc JSX.
- Chưa đối chiếu swagger thật để biết endpoint nào của admin đã có BE (ảnh hưởng ước lượng việc #3).
- `codegraph` báo "no covering tests" theo tên symbol nên không tuyệt đối tin cậy; số liệu test trong báo cáo lấy từ danh sách file test thật.

## Roadmap (thứ tự thực thi)

| # | Việc | Effort | ROI | Cách kiểm chứng |
|---|---|---|---|---|
| 1 | Bịt mock trong luồng thật: mọi fallback `MOCK_*` phải qua `!isMockMode → throw` (findings 3, 5, 6) | S | Cao | Dựng BE trả 500 → UI phải hiện `ErrorState`, không hiện số liệu giả; `rg 'MOCK_' src/features` chỉ còn trong nhánh `isMockMode` |
| 2 | Sửa prefix `/api/api` + bọc `AuthGate` cho `/staff/**` (findings 1, 2) | S | Cao | Mở `/staff` khi chưa login → bị chặn; Network không còn request `/api/api/*` |
| 3 | Chuyển 3 module admin giả (users, staff, reviews) sang `backendApiClient` (finding 4) | L | Cao | Test hiện có vẫn xanh; trên staging list/detail/lock/role/review đều có request thật |
| 4 | Chốt 1 chuẩn format tiền/ngày, thay 14 chỗ `Intl.NumberFormat` (finding 13) | S | Cao | `rg 'Intl.NumberFormat\("vi-VN"' src` chỉ còn trong `lib/format.ts`; grep `₫` = 0 |
| 5 | 1 helper `mapApiError()` thay 20 chỗ lặp + dùng cho toast và `validation.report` (finding 14) | S | Trung–cao | Sửa wording 1 chỗ → toàn app đổi; `rg 'instanceof ApiProblemError \?'` = 0 ngoài helper |
| 6 | Đưa `admin/staffs/new` + `admin/staffs/detail` về `ValidatedForm`, popup users về `FormDialog` (findings 8, 9, 10) | M | Trung–cao | Submit thiếu trường → lỗi dưới đúng input + focus; BE trả `ProblemDetails.errors` → đúng field; `lint:design` pass |
| 7 | Dọn dead code + thống nhất bảng/filter admin (findings 7, 18, 19, 20) | M | Trung | `<table ` trong `src/app`+`src/features` = 0; `AdminFilterBar` dùng ở mọi trang admin có filter |

**Không nên làm:** không rewrite sang Server Components (toàn bộ auth là client cookie/refresh), không thêm data library (react-query đã đủ), không mở form stack thứ ba, không viết thêm test cho `MOCK_*_DB` (sẽ bị xoá ở việc #3), không trộn đổi màu/token vào commit sửa kiến trúc.
