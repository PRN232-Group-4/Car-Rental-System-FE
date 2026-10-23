# Loading dùng chung cho Admin/Customer và dashboard doanh thu – lượt thuê — 2026-10-23

## 1. Loading page cho Admin và Customer

### Vấn đề
Khi `AuthGate` đang xác thực phiên, cả ba cổng đều rơi về `DefaultShellSkeleton` — một khung giữa màn hình, không giống layout thật. Vì vậy người dùng thấy “màn hình khác” rồi bị giật sang bố cục thật khi phiên xác thực xong. Trang `/staff` còn tệ hơn: không có cổng và bọc shell tự bịa danh tính (xem mục 3).

### Đã làm
- `src/components/layout/PortalShellSkeleton.tsx` — khung xương cấp cổng, bám đúng `TransitDeskShell` / `CustomerDeskShell` (masthead, dải chương, folio, vùng nội dung):
  - `AdminShellSkeleton`: masthead 6 chương + bộ lọc + bảng 6 dòng (giữ số cột) + phân trang.
  - `CustomerShellSkeleton`: masthead 5 chương + folio + lưới 3 card + khối danh sách.
  - `DriverShellSkeleton`: masthead + folio + 3 khối ca trực/phân công.
- Gắn vào `app/admin/layout.tsx`, `app/(dashboard)/layout.tsx`, `app/staff/layout.tsx` qua prop `fallback` của `AuthGate` (và `usePortalAccess` cho cổng tài xế).
- `src/components/ui/Skeleton.tsx` thêm ba khối dùng chung: `CardSkeleton`, `CardGridSkeleton`, `TableSkeleton` — thay cho các cụm `animate-pulse` viết tay và các khối `Skeleton h-96` rỗng.
- Thay spinner/khung rỗng bằng skeleton ở: `VehicleCatalog` (danh sách xe), `MultiFleetCatalog` + `SpatialFleetShowcase` (landing), `SubscriptionPlans` + `MembershipPasses` (gói thuê bao), `payment-history` (bảng sổ cái), `my-subscriptions` (lưới card), `driver-license` (form GPLX), `/vehicles` redirect (trước đây `fallback={null}` → nháy trắng).
- Mọi skeleton đều: `aria-busy`, một vùng `role="status"` có nhãn tiếng Việt, phần xương `aria-hidden="true"`, **không** dùng `animate-spin`, giữ đúng số cột/dòng của nội dung thật để không giật layout.

**Kiểm chứng:** `src/__tests__/components/layout/PortalShellSkeleton.test.tsx` (8 test) — đúng số card/dòng, chỉ một vùng `role=status` mỗi cổng, `data-portal` đúng, không có spinner.

## 2. Dashboard: doanh thu và số lượt thuê

### Đã có sẵn (không làm lại)
`RevenueChart` (doanh thu theo ngày, có bảng thay thế + tooltip), `RentalsStatusChart` (tỉ lệ đơn theo trạng thái), `TopVehiclesTable`, `MaintenanceVsRevenueChart`, `PlanUsageChart`, `DashboardFiltersBar` (7 ngày / 30 ngày / tháng này / tháng trước / tùy chọn, xuất CSV), `ErrorState` + `EmptyState` từng widget.

### Đã bổ sung
- **Biểu đồ số lượt thuê theo thời gian** (`RentalsVolumeChart`): đường theo ngày, dùng chung nguồn `revenue-series` nên không thêm request; hiển thị “Kỳ này / Kỳ trước / Cao nhất”, có bảng số liệu thay thế (a11y), skeleton khi tải, trạng thái trống và lỗi kèm thử lại. Backend cũ chưa trả `rentals` → hiện “Chưa có số liệu lượt thuê” thay vì vẽ đường toàn số 0.
- **Preset “Năm nay”** trong bộ lọc (từ 01/01 GMT+7).
- **Sửa chỉ số sai hợp đồng**: ô KPI thứ 3 trước đây hiển thị “Chi phí bảo dưỡng” nhưng API chỉ trả **số xe** đang bảo dưỡng (`maintenance: count`) ⇒ widget luôn `null` và nhãn sai. Đổi thành “Xe đang bảo dưỡng”, hiển thị đúng số, kèm kỳ trước và xu hướng; xuất CSV cũng theo nhãn mới.
- **Xu hướng dùng số thật**: `parseDashboardSnapshot` đọc thêm khối `previous` của API nên các badge % so sánh kỳ trước không còn luôn là “—”.
- **Trạng thái `expired`** được đưa vào thống kê đơn theo trạng thái.

## 3. Đối chiếu dữ liệu thật — xem `changes/2026-10-23-mock-data-cleanup.md`

## 4. Kiểm tra UI/UX phía Customer — xem `changes/2026-10-23-customer-ui-ux-audit.md`

## Kiểm chứng tổng hợp

- `npm run typecheck` sạch; `npm run lint` **0 error** (11 cảnh báo có sẵn); `npm run lint:design` đạt 100%.
- `npm test`: **120 file / 999 test đạt**.
- `npm run build`: biên dịch thành công, 264 trang tĩnh.
- BE: `dotnet build` 0 warning; `dotnet test --filter Dashboard` 24/24 đạt.
