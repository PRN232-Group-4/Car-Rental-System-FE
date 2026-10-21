# API/field còn thiếu để bỏ hoàn toàn dữ liệu mock

Cập nhật: 2026-10-20. Nguồn đối chiếu: `src/api/generated/swagger.json` và Swagger production (`/swagger/v1/swagger.json`). Tài liệu phản ánh Swagger production tại thời điểm đối chiếu. Khi gộp ngày 2026-10-21, backend trong workspace đã có `UsersController` (`GET /api/users`, `GET /api/users/{id}`, đổi trạng thái, gán/gỡ vai trò, thu hồi phiên) và `POST /api/staff/from-user`; FE giữ tích hợp thật cho các API này. Các mục 1–5, 14–15 bên dưới là thiếu sót của bản Swagger cũ, không còn là giới hạn của mã nguồn hiện tại. Những API còn thiếu vẫn được FE chặn hoặc hiển thị “API chưa hỗ trợ”; không thay bằng dữ liệu giả.

## 1. Cần endpoint mới

| # | Màn hình / tính năng | Endpoint đề xuất | Vì sao không làm được ở FE |
|---|---|---|---|
| 1 | `/admin/users` danh sách tài khoản | `GET /api/users?search&role&isActive&page&pageSize` | Chỉ có `GET /api/staff` và `GET /api/customers`; không có danh sách user gốc, không có filter vai trò/hồ sơ. Hai nguồn không join được vì `Staff`/`Customer` không trả `roles[]` đầy đủ. |
| 2 | `/admin/users/detail` | `GET /api/users/{id}` | Không có endpoint user theo User ID; `account/profile` chỉ trả chính mình. |
| 3 | Khóa/mở khóa tài khoản Admin | `PATCH /api/users/{id}/status` body `{isActive, reason}` | Không có endpoint quản trị trạng thái tài khoản. `PUT /api/staff/{id}` không đổi `users.is_active` và không nhận lý do khóa. |
| 4 | Gán/gỡ vai trò | `POST/DELETE /api/users/{id}/roles` | Không có endpoint `user_roles`. `staffRole` trong `Staff` chỉ là 1 chuỗi chuyên môn, không phải tập vai trò. |
| 5 | Thu hồi phiên người dùng khác | `POST /api/users/{id}/sessions/revoke` (hoặc `logout-all` có tham số user) | `POST /api/auth/logout-all` chỉ thu hồi phiên của chính mình. |
| 6 | Kiểm duyệt đánh giá | `PATCH /api/ratings/{id}` `{status, reason}`; `POST /api/ratings/{id}/reply` `{text}` | Chỉ có `POST /api/rentals/{rentalId}/ratings` và `GET /api/staff/{staffId}/ratings`. Không có trạng thái ẩn/báo cáo, không có phản hồi. |
| 7 | Đổi trạng thái báo cáo sự cố | `PATCH /api/reports/{id}/status` `{status, reason}` | Chỉ có `POST /api/reports/{id}/resolve` và `POST /api/reports/{id}/maintenance`. Nút “Tiếp nhận xử lý”, “Từ chối” đang khóa. |
| 8 | Dashboard: doanh thu theo ngày | `GET /api/dashboard/revenue-series?from&to` → `[{bucket, dateIso, total, byGroup}]` | `GET /api/dashboard` trả `object` không có schema trong Swagger, không có chuỗi thời gian. |
| 9 | Dashboard: xếp hạng xe | `GET /api/dashboard/top-vehicles?from&to` → `[{vehicleId,name,category,revenue,rentals,hours,utilization}]` | Không có endpoint; không thể suy ra `revenue/hours/utilization` từ `/api/vehicles` và `/api/rentals`. |
| 10 | Dashboard: chi phí bảo dưỡng theo xe và kỳ | `GET /api/dashboard/maintenance-vs-revenue?from&to` | `GET /api/maintenance` không nhận `from/to`, không trả doanh thu theo xe. |
| 11 | Dashboard: mức sử dụng gói thuê | `GET /api/dashboard/plan-usage?from&to` → `[{planId,name,usedHours,includedHours,activeSubscribers,usagePercentage}]` | `GET /api/customer-subscriptions` chỉ trả gói của chính mình; thiếu tổng hợp toàn hệ thống. |
| 12 | Dashboard: so sánh kỳ trước | Cùng các endpoint trên trả thêm `previous` (giá trị kỳ liền trước) hoặc `compareFrom/compareTo` | Không có số liệu kỳ trước; mọi % so sánh hiện là `—`, không tính giả. |
| 13 | Lọc KPI/thống kê theo cơ sở & loại xe | `facilityId`, `vehicleTypeId` cho các endpoint dashboard | `GET /api/dashboard` chỉ nhận `from`, `to`. |
| 14 | Duyệt GPLX ngay trong hồ sơ tài khoản | Đã dùng `PUT /api/customers/{id}/license-status`; cần `GET /api/customers/{id}` trả `userId` để mở từ trang User | `CustomerListItem`/`CustomerDetail` có `userId`, nhưng trang User không có danh sách user để dẫn tới. |
| 15 | Điều chỉnh điểm thưởng trong hồ sơ tài khoản | Đã dùng `POST /api/customers/{id}/loyalty/adjustments` (có `Idempotency-Key`); cần `userId` trên `CustomerDetail` | Như trên: thiếu nguồn userId → customerId ở màn `/admin/users`. |

## 2. Cần bổ sung field trong endpoint đã có

### `GET /api/dashboard` (đang là `object` không có schema)
Cần khai báo schema tối thiểu: `revenue`, `renting`, `maintenance`, `activeSubscriptions`. FE đang đọc 4 field này qua `parseDashboardSnapshot`; field thiếu → `—`.

### `GET /api/reports` → `IncidentReport` (thiếu 6 field)
`createdAt`, `resolvedAt`, `customer {id, fullName, phone, email}`, `rental {id, vehicleName, licensePlate, start, end, status, driverName}`, `maintenance {type, status, cost, scheduledDate}`, `history[]`, `notes[]`.
Thiếu `createdAt` nên không tính được SLA 24h; thiếu `customer` nên UI ghi “API chưa cung cấp thông tin khách hàng”.

### `GET /api/staff` → `Staff` (thiếu 3 field)
`avatarUrl`, `gender`, `address`. Danh sách/chi tiết nhân viên hiện không có avatar; trang chi tiết hiển thị “Chưa cập nhật”.
Thêm: `totalTrips`, `activeTripId` nếu muốn thẻ “Tổng quan hoạt động” hiển thị số chuyến thật.

### `GET /api/staff/{staffId}/ratings` → `StaffRating` (thiếu 3 field)
`customerName`, `status` (`visible|hidden|reported`), `reply {text, by, at}`, `vehicleName/licensePlate` của đơn. Hiện trạng thái luôn là “Chưa có dữ liệu kiểm duyệt”, cột Khách hàng là placeholder.

### `GET /api/rentals/mine` → `CustomerRentalSummary` (thiếu 6 field)
`licensePlate`, `vehicleCategory`, `canCancel`, `nextAction`, `facility {id,name,phone}`, `subscriptionHoursUsed`.
Hệ quả: danh sách chuyến đi luôn `canCancel=false`, `nextAction="view"`; phải mở chi tiết mới biết được hủy.

### `GET /api/rentals/mine/{id}` → `CustomerRentalDetail` (thiếu 2 field)
`subscriptionHoursUsed` (đơn theo gói đang ghi “API chưa cung cấp”), `facility` chỉ là chuỗi nên không có `id`/`phone` để hiển thị hotline trạm.

### `GET /api/vehicles` → `Vehicle` (thiếu 3 field)
`driverAvailable` (FE đang map `hasDriverOption`; `/api/vehicles/search` có `badges.driverAvailable` nhưng `/api/vehicles` không), `supportsSubscription` (FE đang mặc định `true`), `features[]`.
Ngoài ra: `yearOfManufacture`, `seatCount`, `transmission`, `batteryCapacity` đang `null` ở nhiều xe → UI hiện “Chưa có năm sản xuất/Chưa có hộp số”.

### `GET /api/rental-policies` → `RentalPolicy` (thiếu 3 field)
`vehicleTypeName`, `managedBy`, `createdAt`. Trang chính sách đang hiển thị theo `vehicleTypeId`; thiếu `createdAt` nên thứ tự “phiên bản mới nhất” chỉ dựa vào `id`.

### `GET /api/maintenance` → `Maintenance` (thiếu 2 field)
`createdAt`, `rentalId`. Thiếu `createdAt` nên không hiển thị được thời điểm tạo phiếu; thiếu `rentalId` nên không liên kết ngược về đơn thuê.

### `POST /api/reports/{id}/maintenance` → `ReportMaintenanceRequest`
Hiện chỉ nhận `assignedStaffId`, `facilityId`, `scheduledDate`. Nếu muốn giữ ô “Hạng mục bảo dưỡng” và “Mô tả” trong popup, cần thêm `maintenanceType`, `description` (đang khóa và lấy từ báo cáo).

### `POST /api/rentals/{id}/assignments/driver`
Đã gửi `driverStaffId`, `reason`, `note`. Cần trả kèm `vehicleName`, `licensePlate`, `bufferMinutes` trong `AssignmentResponse` để lịch tài xế hiển thị đủ; hiện `DriverScheduleEntry` không có 3 field này.

## 3. Ghi chú triển khai FE

- Mọi adapter gọi đường dẫn tương đối (`vehicles`, `rental-policies`…) để dùng chung `NEXT_PUBLIC_API_URL`/proxy; **không** hardcode `/api/...` trong service.
- Truy vấn danh sách dài đã phân trang 100/lần (`vehicles`, `rental-policies`, `staff`) và ném lỗi nếu thiếu trang, thay vì trả danh sách một phần.
- Bảng đọc theo `totalCount` với `pageSize=1` (fleet, trạng thái đơn, đơn hoàn tất) — cần đảm bảo backend trả `totalCount` đúng khi có filter `status`, `from`, `to`.
- Không còn fallback mock: lỗi mạng/401/403/404 hiển thị lỗi thật; chức năng thiếu API trả `501` qua `src/api/unsupported.ts` và UI hiển thị thông báo thay vì bảng rỗng.
