# Admin: đồng bộ toàn bộ theo Transit Desk của dev-huy

## Bối cảnh

Merge `a26ffdf` (Dev huy) đổi giao diện Admin sang Transit Desk: thay `StaffShell` bằng `TransitDeskShell` ở `src/app/admin/layout.tsx` và viết mới 4 route trong `src/features/admin/transit-desk/` (`OperatingPulse` cho `/admin`, `FleetRegistry` cho `/admin/vehicles`, `IncidentTriage` cho `/admin/reports`, `RentalWorkspaceV4` cho `/admin/rentals`).

Vì 4 trang đó dựng markup riêng (không dùng `AdminFilters`/`AdminTableCard`/`AdminStatusBadge`/`AdminRowAction`), Admin tồn tại **hai hệ UI song song**: folio/ledger mới ở 4 route, và card bo 16px + pill trạng thái + CTA amber ở ~20 route còn lại. Palette CTA cũng lệch (amber `#B45309` so với mulberry `#5A2B41`).

## Thay đổi

### 1. Primitive dùng chung

- Thêm `src/features/admin/transit-desk/TransitFolio.tsx`: `TransitFolio` (số chương + tag mono, kicker, `h1` có `<em className="italic text-td-teal">`, mô tả, slot phải) và `TransitFolioMetric`. Ba trang gốc của dev-huy (`OperatingPulse`, `FleetRegistry`, `IncidentTriage`) được chuyển sang dùng component này để chỉ còn một cách viết folio.
- `AdminFilters.module.css`: bỏ card bo 16px → toolbar editorial (nhãn mono chữ hoa, control gạch chân 36px, nút bo 4px, primary `td-oxide`).
- `AdminTable.tsx` + `AdminTable.module.css`: `AdminTableCard` thành khối phẳng có rule trên `td-ink`; bảng kiểu sổ mở (head mono, rule `td-ink`, hàng phân cách `td-rule`, hover `td-chalk`).
- `DataTable` (dùng ở users/staffs/reviews/policies/subscription-plans, dashboard) đồng bộ cùng ngôn ngữ sổ mở.
- `AdminStatusBadge`: render **glyph hình học + nhãn mono** thay pill màu; `LicenseBadge` render qua `AdminStatusBadge`; thêm domain `review` vào `status-rules.ts`. 11 call site `StatusBadge` trong Admin chuyển sang `AdminStatusBadge` đúng domain (activity/license/review/rental/maintenance/report). `StatusBadge` pill giữ cho khu khách.
- `ChartCard`, `KpiStrip`, `DashboardFiltersBar`, `TopVehiclesTable`: bỏ card/bo góc/shadow, về rule + mono + token `td-*`.

### 2. Folio + token cho các trang còn lại

`dashboard`, `reviews`, `policies`, `subscription-plans`, `users` (+detail), `staffs` (+detail/new), `customers`, `departments`/`facilities`/`roles` (DirectoryPage), `vehicle-types`/`policies`/`subscription-plans` (CatalogManager), `maintenance`, `inspections`, `dispatch`, `drivers/schedule`, `reports/detail`, `reviews/detail`, `vehicles/new|edit` (VehicleForm), `profile` (StaffProfileForm + DriverLicenseProfile). Số hiệu chương: 01 OPS · 02 FLT · 03 TRI · 04 OPS/INS · 05 DSP · 06 PLC · 07 ORG · 08 ME.

Quét token/geometry toàn bộ `src/app/admin/**`, `src/features/admin/**`, `src/features/operations/**`: `rounded-2xl|xl|lg|3xl` → `rounded`, bỏ `shadow-e1/e2/e3`, `*-line` → `*-td-rule`, `*-surface` → `*-td-white`, `*-sunken|primary-tint` → `*-td-chalk`, `*-ink-3` → `*-td-muted`, `*-ink-2|text-ink` → `*-td-ink`, `text/bg/border/fill-primary` → `*-td-oxide`.

### 3. Palette và control

- `globals.css`: `--primary` của Admin map về `td-oxide` (light `#5A2B41`, dark `#6E3A52`) kèm `primary-hover/press/tint`, `--on-primary` tương ứng; bỏ rule `!important` chữ nâu trên `.bg-primary` ở dark (chữ sáng 7.8:1 AAA); `.admin-input` về 6px, token `td-*`, focus viền `td-oxide`.
- `operationsButton`/`operationsPanel` trong `features/operations/api.ts`: bo 4px, token `td-*`.

### 4. Sửa lỗi bố cục

- `/admin/rentals` bị lồng 3 lớp nền (giấy của shell → canvas xám → glass stage) và thừa dải trống cuối trang: thêm `:global([data-subportal="rental-v4"]) .mainContent { padding: 0; max-width: none }` và đổi `workspaceRoot` sang `min-height: calc(100dvh - 120px)` (72 masthead + 48 dải route).
- Masthead và dải route ngữ cảnh giờ nằm trong `.topBar` dính đỉnh chung (`position: sticky; top: 0; z-index: 30`); bỏ sticky rời trên `.masthead` để không phải hardcode `top: 72px` khi masthead xuống hai dòng ở `≤1280px`. `html[data-admin-theme]` thêm `scroll-padding-top: 132px`.
- Trang `/admin/profile` thiết kế lại: bỏ banner nền tối, dùng folio + lưới 12 cột (hồ sơ định danh 4 cột với `dl` dòng kẻ, biểu mẫu 8 cột), phần giấy phép lái xe thành ledger + form `admin-input`, bỏ 4 ô box và khối nền màu.
- Sửa lỗi `/admin/profile`: trước đây chỉ tài khoản Admin mới gọi `GET staff/{id}`, nên mọi vai trò khác (Tài xế, CSKH, Kỹ thuật) luôn thấy hồ sơ tổng hợp từ tài khoản — mục giấy phép lái xe trống và tiến trình xác minh sai. Nay mọi vai trò có `staffId` đều tải hồ sơ nhân sự của mình (lỗi quyền vẫn rơi xuống nhánh tổng hợp).}

## Kiểm chứng

- `npm run typecheck`, `npm run lint:design`: đạt.
- `npx vitest run`: 67 file / 517 test đạt. Cập nhật assertion tiêu đề mới ở `ReviewsPage`, `StaffListPage`, `UsersListPage`, `PoliciesPages`, `ReportsPage`; cập nhật `theme-isolation.test.ts` theo CTA mulberry (AAA 7.8:1); sửa test skeleton `DataTable` hỏng sẵn từ merge (`Skeleton` đổi sang `[data-skeleton]`).
- Playwright với API giả lập, chụp light/dark cho toàn bộ route Admin đã sửa ở 1920/1600/1280/1024/390: không tràn ngang, `documentElement.scrollWidth` bằng viewport.
- Test riêng cho sticky: cuộn 900px, khối `.topBar` có `position: sticky` và dải route nằm đúng dưới masthead.

## Ghi nhận, chưa xử lý

- `e2e/graphite-glass-deck-pilot-rentals.spec.ts` hardcode đường dẫn `C:\Users\Huy\...` khi ghi screenshot → sẽ lỗi trên máy khác.
- `npm run build` chưa chạy trong đợt này.
- Các spec `docs/specs/FE-*.md` còn mô tả shell/card cũ; nguồn chuẩn hiện tại là `DESIGN.md` A9 + `docs/admin-ui.md`.
- Row action ở `users`, `staffs`, `reviews`, `policies`, `subscription-plans` vẫn là button/link tự dựng trong cột thao tác (đúng icon nhưng chưa qua `AdminRowAction`); muốn siết cần thêm `revoke`/`lock` vào `row-action-rules.ts` + test.
