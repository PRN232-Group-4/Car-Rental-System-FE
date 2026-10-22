# Snapshot Hợp Đồng API — Car Rental System (VRS Thong Dong)

## Bổ sung source 22/10/2026 — Quá hạn và thu phí sau trả xe

GET rentals nhận status=overdue, lọc phía server trước phân trang; item thêm isOverdue boolean, lifecycle status vẫn renting. Invoice detail thêm kind/canConfirmCash/canCreateStaffCheckout. Staff POST `/invoices/{id}/staff-checkout` trả CheckoutResult cho overtime liên kết settlement completed; POST cash-confirmation thu overtime tiền mặt trước checkout_started_at, idempotent, có audit. Quyền Admin/Manager/CustomerService, không nhận amount/paid/email từ client, webhook mới ghi paid online. Backend cần cùng phiên bản source; chưa deploy. Xem [spec FE](../specs/FE-overdue-collection.md), [API backend](../../../Car-Rental-System-BE/docs/API.md).

> **Cập nhật:** 15/10/2026  
> **Nguồn đối chiếu:** Toàn bộ 18 controller tại `../Car-Rental-System-BE/src/VehicleRental.WebApi/Controllers/*.cs`, Application Contracts/DTOs, middleware `ApiSuccessResponseFilter`, `AuthorizationPolicies.cs`, DB migrations `0001`–`0018` và `Init.sql`.  
> **Mục đích:** Cung cấp nguồn sự thật duy nhất (Single Source of Truth) cho tất cả module FE (`FE-02` đến `FE-25`) theo quy định tại mục 8 của `docs/specs/FE-FOUNDATION.md`. Mọi spec FE chỉ tin snapshot này; nếu spec có ví dụ khác biệt, snapshot này là căn cứ quyết định.

---

## 1. Quy Ước Chung & Contract Envelope

### 1.1 Envelope Bắt Buộc (Mọi Response JSON)
Mọi response JSON từ Backend (bao gồm cả thành công và lỗi) đều có cấu trúc **6 trường ở cấp ngoài cùng**:
```json
{
  "code": 200,
  "status": "success",
  "is_success": true,
  "data": { ... },
  "message": "Thông báo ngữ cảnh.",
  "error": null
}
```
* `code`: `number` (khớp mã HTTP thực tế: 200, 201, 202, 400, 401, 403, 404, 409, 500...).
* `status`: `"success"` hoặc `"error"`.
* `is_success`: `boolean` (`true` khi thành công, `false` khi lỗi; không dùng số hoặc chuỗi).
* `data`: `T` hoặc `null` khi không có dữ liệu/khi lỗi.
* `message`: `string` (thông báo cho người dùng/developer).
* `error`: `null` khi thành công; khi lỗi chứa đối tượng `ProblemDetails` / `ValidationProblemDetails`. Mã lỗi nghiệp vụ nằm tại `error.code` (hoặc `error.extensions.code`).

> **Lưu ý mã HTTP từ Controller:**
> - Các action trả `NoContent()` (HTTP 204) được `ApiSuccessResponseFilter` chuyển đổi thành **HTTP 200** với envelope `{ code: 200, status: "success", is_success: true, data: null, ... }`.
> - `Accepted()` trả **HTTP 202**.
> - `Created()` trả **HTTP 201**.

### 1.2 Phân Trang Chuẩn (Pagination)
Áp dụng cho mọi API trả về danh sách có phân trang:
* **Query parameters:** `page` (mặc định: `1`, ràng buộc: `page >= 1`), `pageSize` (mặc định: `20`, ràng buộc: `1 <= pageSize <= 100`).
* **Response data schema:**
  ```json
  {
    "items": [ ... ],
    "page": 1,
    "pageSize": 20,
    "totalCount": 120
  }
  ```
* Không bao giờ trả `array` trần cho API phân trang. Khi trang vượt quá tổng số bản ghi, trả `items: []` và giữ nguyên `page`, `pageSize`, `totalCount`.

### 1.3 Cơ Chế Phiên & Cookie
* **Cookie xác thực thật sự trong mã nguồn:**
  * `access_token`: Path `/`, `HttpOnly`, `Secure`, `SameSite=Lax`, thời hạn 15–60 phút theo config.
  * `refresh_token`: Path `/api/auth`, `HttpOnly`, `Secure`, `SameSite=Lax`, thời hạn trượt (sliding 8h–7 ngày).
* **Lưu ý quan trọng:** Spec cũ trong một số tài liệu nhắc đến tên `__Host-vehicle-rental`. Trong code C# thật (`AuthCookies.cs`), BE đang dùng hai cookie tên là **`access_token`** và **`refresh_token`**.
* Client fetch **bắt buộc** bật `credentials: "include"`.

### 1.4 Danh Sách Vai Trò (Roles) Thật Trong Database
Khảo sát từ `Init.sql`, migration `0005_add_manager_role.sql` và `0008_staff_authorization.sql`:
1. `Customer`: Khách hàng thuê xe.
2. `Staff`: Nhân viên vận hành cơ bản.
3. `Admin`: Quản trị viên toàn quyền hệ thống.
4. `Driver`: Tài xế (thuộc nhân sự `staffs.is_driver = true`).
5. `Maintenance`: Kỹ thuật viên bảo trì / kiểm định xe.
6. `Manager`: Quản lý vận hành (quản lý đội xe, duyệt chính sách, phân lịch ca trực).
7. `CustomerService`: Chăm sóc khách hàng (duyệt GPLX, quản lý đơn thuê, đổi xe/tài xế).

### 1.5 Các Authorization Policies (BE WebApi)
* `RequireAdmin`: `Admin`
* `RequireCustomer`: `Customer`
* `Management`: `Admin`, `Manager`
* `CustomerService`: `Admin`, `Manager`, `CustomerService`
* `Inspection`: `Admin`, `Maintenance` (yêu cầu thêm `staff_id > 0` trong claims)
* `Maintenance`: `Admin`, `Manager`, `Maintenance`
* `DriverSchedule`: `Admin`, `Manager`, `Driver`
* `RentalRead`: `Admin`, `Manager`, `CustomerService`, `Maintenance`, `Customer`, `Driver`
* `FinancialRead`: `Admin`, `Manager`, `CustomerService`, `Customer`

---

## 2. Bảng Danh Mục Endpoint Chi Tiết Theo Nhóm

### Nhóm 1: Xác Thực & Tài Khoản (Authentication & Account)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `POST` | `/api/account/registrations` | Anonymous | Body: `StartRegistrationRequest`<br>- `email` (string, email)<br>- `fullName` (string, 2–120 chars)<br>- `password` (string, 6–20 chars) | `null` | 400 (RegistrationException: cooldown, invalid email) | Trả 202 Accepted |
| `POST` | `/api/account/registrations/verify` | Anonymous | Body: `VerifyRegistrationRequest`<br>- `email` (string)<br>- `otp` (string, regex `^[0-9]{6}$`) | `null` | 400 (OTP không hợp lệ/hết hạn) | Trả 201 Created |
| `POST` | `/api/account/registrations/resend` | Anonymous | Body: `ResendRegistrationRequest`<br>- `email` (string) | `null` | 400 (cooldown) | Trả 202 Accepted |
| `POST` | `/api/account/password-resets` | Anonymous | Body: `PasswordResetStartRequest`<br>- `email` (string) | `null` | 400 | Trả 202 Accepted |
| `POST` | `/api/account/password-resets/verify` | Anonymous | Body: `PasswordResetCompleteRequest`<br>- `email` (string)<br>- `otp` (string, 6 số)<br>- `newPassword` (string, 6–20 chars) | `null` | 400 | Trả 200 (gốc NoContent) |
| `GET` | `/api/account/profile` | Authenticated | Không có | `AccountResponse`<br>- `email` (string)<br>- `fullName` (string)<br>- `gender` (string?)<br>- `phone` (string?)<br>- `avatarUrl` (string?)<br>- `roles` (string[])<br>- `staffId` (int?)<br>- `departmentId` (int?)<br>- `departmentName` (string?)<br>- `facilityId` (int?) | 401, 403 | **LƯU Ý:** Không có trường `id` (userId) |
| `PUT` | `/api/account/profile` | Authenticated | Body: `UpdateProfileRequest`<br>- `fullName` (string, 2–120)<br>- `gender` (string?, max 50)<br>- `phone` (string?, max 30) | `AccountResponse` | 400, 401, 403 | Trả profile mới cập nhật |
| `POST` | `/api/account/password` | Authenticated | Body: `ChangePasswordRequest`<br>- `currentPassword` (string)<br>- `newPassword` (string, 6–20) | `null` | 400 ("Mật khẩu hiện tại không chính xác."), 401 | Xóa cookies sau đổi |
| `POST` | `/api/auth/login` | Anonymous | Body: `LoginRequest`<br>- `email` (string)<br>- `password` (string)<br>- `rememberMe` (boolean) | `null` | 401 ("Email hoặc mật khẩu không chính xác.") | Trả 200 OK, Set-Cookie `access_token`, `refresh_token` |
| `POST` | `/api/auth/refresh` | Anonymous (Cookie) | Nhận qua cookie `refresh_token` | `null` | 401 | Trả 200 OK, refresh token trượt |
| `POST` | `/api/auth/logout` | Anonymous (Cookie) | Không có | `null` | 200 | Xóa session Redis & cookies |
| `POST` | `/api/auth/logout-all` | Authenticated | Không có | `null` | 401, 403 | Thu hồi mọi session của user |
| `GET` | `/api/auth/google` | Anonymous | Không có | Redirect 302 | 503 (nếu chưa bật) | Chuyển sang Google OAuth |
| `GET` | `/api/auth/google/complete` | External Auth | Callback từ Google | Redirect 302 | 302 về login?google=error | Set-Cookie và chuyển hướng về FE |

---

### Nhóm 2: Khách Hàng & Duyệt GPLX (Customers & Licenses)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `GET` | `/api/customers` | Policy `CustomerService` (Admin, Manager, CS) | Query: `CustomerListQuery`<br>- `search` (string?)<br>- `isActive` (bool?)<br>- `licenseStatus` (string?)<br>- `page` (int = 1)<br>- `pageSize` (int = 20) | `CustomerPage`<br>- `items`: `CustomerListItem[]`<br>- `page`: int<br>- `pageSize`: int<br>- `totalCount`: int | 400, 401, 403 | Danh bạ khách hàng |
| `GET` | `/api/customers/{customerId:int}` | Policy `CustomerService` | Route: `customerId` (int, >= 1) | `CustomerDetail`<br>- `id`, `userId`, `email`, `fullName`, `gender`, `phone`, `avatarUrl`, `isActive`, `createdAt`<br>- `licenseNumber`, `licenseType`, `licenseIssueDate`, `licenseExpiryDate`, `licenseImageUrl`, `licenseStatus`, `loyaltyPoint` | 400, 401, 403, 404 | Chi tiết hồ sơ khách |
| `GET` | `/api/customer/license` | Policy `Customer` | Không có | `CustomerLicense`<br>- `number`, `type`, `issueDate`, `expiryDate`, `imageUrl`, `status` | 401, 404 | Khách xem GPLX của mình |
| `PUT` | `/api/customer/license` | Policy `Customer` | `multipart/form-data`: `LicenseUploadForm`<br>- `file` (IFormFile <= 5MB)<br>- `number`, `type`, `issueDate`, `expiryDate` | `CustomerLicense` | 400, 401, 404 | Tải ảnh GPLX lên Cloudinary & lưu |
| `PUT` | `/api/customer/license/url` | Policy `Customer` | Body (JSON): `LicenseRequest`<br>- `number`, `type`, `issueDate`, `expiryDate`, `imageUrl` | `CustomerLicense` | 400, 401, 404 | Lưu URL ảnh có sẵn |
| `PUT` | `/api/customers/{customerId:int}/license-status` | Policy `CustomerService` | Route: `customerId`<br>Body: `LicenseReviewRequest`<br>- `status` (string: "approved" / "rejected") | `CustomerLicense` | 400, 401, 403, 404 | Duyệt/từ chối GPLX của khách |

---

### Nhóm 3: Nhân Viên, Tài Xế & Cơ Cấu Tổ Chức (Staff, Drivers & Org)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `GET` | `/api/staff` | Roles: `Admin, Manager` | Query: `search` (string?), `page` (int = 1), `pageSize` (int = 20) | `StaffPage`<br>- `items`: `Staff[]`<br>- `page`, `pageSize`, `totalCount` | 401, 403 | Danh sách nhân viên |
| `GET` | `/api/staff/{id:int}` | Roles: `Admin, Manager` | Route: `id` (int) | `Staff`<br>- `id`, `userId`, `email`, `fullName`, `phone`, `avatarUrl`<br>- `departmentId`, `departmentName`, `facilityId`, `facilityName`<br>- `hiredDate`, `isDriver`<br>- `licenseNumber`, `licenseType`, `licenseIssueDate`, `licenseExpiryDate`, `licenseImg`<br>- `rating`, `isActive`, `roles` | 401, 403, 404 | Chi tiết nhân viên |
| `GET` | `/api/staff/drivers` | Roles: `Admin, Manager` | Query: `search`, `page`, `pageSize` | `StaffPage` (lọc `is_driver = true`) | 401, 403 | Danh sách tài xế |
| `POST` | `/api/staff` | Roles: `Admin` | Body: `CreateStaffRequest`<br>- `userId` (int, required)<br>- `departmentId`, `facilityId` (int?)<br>- `hiredDate` (string?)<br>- `isDriver` (bool)<br>- `licenseNumber`, `licenseType`, `licenseIssueDate`, `licenseExpiryDate`, `licenseImg` (string?) | `Staff` | 400, 401, 403, 409 (User đã có hồ sơ staff) | Tạo hồ sơ nhân viên cho user có sẵn |
| `PUT` | `/api/staff/{id:int}` | Roles: `Admin` | Route: `id`<br>Body: `UpdateStaffRequest` | `Staff` | 400, 401, 403, 404 | Cập nhật hồ sơ nhân viên |
| `DELETE` | `/api/staff/{id:int}` | Roles: `Admin` | Route: `id` | `null` | 401, 403, 404 | Vô hiệu hóa nhân viên (đặt `users.is_active=false`) |
| `PUT` | `/api/departments/{departmentId:int}/members/{userId:int}` | Policy `Management` | Route: `departmentId`, `userId` | `Staff` | 400, 401, 403 (Manager không được gán Admin/Manager), 404 | Gán nhân viên vào phòng ban |
| `PUT` | `/api/facilities/{facilityId:int}/members/{userId:int}` | Policy `Management` | Route: `facilityId`, `userId` | `Staff` | 400, 401, 403, 404 | Gán nhân viên vào chi nhánh |
| `GET` | `/api/departments` | Policy `Management` | Không có | `OrganizationUnit[]`<br>- `id`: int, `name`: string | 401, 403 | Danh mục phòng ban |
| `POST` | `/api/departments` | Roles: `Admin` | Body: `NameRequest { name: string }` | `OrganizationUnit` | 400, 401, 403 | Thêm phòng ban |
| `PUT` | `/api/departments/{id:int}` | Roles: `Admin` | Route: `id`<br>Body: `NameRequest` | `OrganizationUnit` | 400, 401, 403, 404 | Sửa phòng ban |
| `DELETE` | `/api/departments/{id:int}` | Roles: `Admin` | Route: `id` | `null` | 401, 403, 404 | Xóa phòng ban |
| `GET` | `/api/facilities` | Anonymous | Không có | `OrganizationUnit[]`<br>- `id`, `name`, `address` | 200 | Danh mục chi nhánh / trạm xe |
| `POST` | `/api/facilities` | Roles: `Admin` | Body: `FacilityRequest { name: string, address?: string }` | `OrganizationUnit` | 400, 401, 403 | Thêm chi nhánh |
| `PUT` | `/api/facilities/{id:int}` | Roles: `Admin` | Route: `id`<br>Body: `FacilityRequest` | `OrganizationUnit` | 400, 401, 403, 404 | Sửa chi nhánh |
| `DELETE` | `/api/facilities/{id:int}` | Roles: `Admin` | Route: `id` | `null` | 401, 403, 404 | Xóa chi nhánh |
| `GET` | `/api/drivers/schedule` | Policy `DriverSchedule` (Admin, Manager, Driver) | Query:<br>- `from` (DateTime, required)<br>- `to` (DateTime, required)<br>- `driverStaffId` (int?) | `DriverScheduleEntry[]`<br>- `rentalId`, `driverStaffId`, `driverName`, `startTime`, `endTime`, `vehicleId`, `vehicleBrand`, `vehicleModel` | 400 (to <= from), 401, 403 | Lịch chuyến đã gán của tài xế |
| `POST` | `/api/drivers/shifts` | Policy `Management` | Body: `DriverShiftRequest`<br>- `driverStaffId` (int)<br>- `startTime`, `endTime` (DateTime)<br>- `cancelled` (bool?) | `DriverShift`<br>- `id`, `driverStaffId`, `startTime`, `endTime`, `cancelled`, `assignedBy` | 400, 401, 403 | Tạo ca trực cho tài xế |
| `PUT` | `/api/drivers/shifts/{id:int}` | Policy `Management` | Route: `id`<br>Body: `DriverShiftRequest` | `DriverShift` | 400, 401, 403, 404 | Sửa/hủy ca trực |
| `GET` | `/api/drivers/shifts` | Policy `DriverSchedule` | Query: `from`, `to`, `driverStaffId?` | `DriverShift[]` | 401, 403 | Danh sách ca trực |

---

### Nhóm 4: Tìm Xe, Phương Tiện & Khả Dụng (Vehicles & Availability)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `GET` | `/api/vehicles/search` | Anonymous (Rate Limit: 60/m) | Query: `VehicleSearchRequest`<br>- `from`, `to` (DateTime?)<br>- `rentalType` ("hourly" / "longterm")<br>- `vehicleTypeId`, `facilityId` (int?)<br>- `q`, `brand` (string?)<br>- `minPrice`, `maxPrice` (decimal?)<br>- `seatCount` (int?)<br>- `transmission`, `bikeType`, `fuelType` (string?)<br>- `minRangeKm` (decimal?)<br>- `yearFrom` (int?)<br>- `hasDriver` (bool?)<br>- `sort` ("recommended" / "price_asc" / "price_desc" / "year_desc")<br>- `page` (int = 1), `pageSize` (int = 12) | `VehicleSearchResult`<br>- `items`: `VehicleSearchCard[]`<br>- `totalCount`, `page`, `pageSize`<br>- `from`, `to`, `rentalType`<br>- `badges`: Record<string, boolean> | 400 | Tìm kiếm xe khả dụng có chống chồng lịch + đệm 60 phút |
| `GET` | `/api/vehicles/{id:int}/availability` | Anonymous | Route: `id`<br>Query: `from`, `to` (DateTime?) | `AvailabilityResult`<br>- `vehicleId`: int<br>- `available`: bool<br>- `reason`?: string<br>- `nextAvailableFrom`?: string<br>- `conflictingBooking`?: ConflictingBookingInfo | 400 | Kiểm tra nhanh một xe có sẵn sàng không |
| `GET` | `/api/vehicles/{id:int}/busy-slots` | Anonymous | Route: `id`<br>Query: `from`, `to` (DateTime?) | `BusySlot[]`<br>- `from`: string (ISO)<br>- `to`: string (ISO)<br>- `reason`: string<br>- `isBuffer`: bool | 400, 404 | Danh sách khoảng bận (đã bao gồm đệm 60 phút) để vẽ lịch |
| `GET` | `/api/vehicle-types/{id:int}/active-policy` | Anonymous | Route: `id` (vehicleTypeId) | `ActiveRentalPolicy`<br>- `id`, `vehicleTypeId`, `name`<br>- `vatRate`, `overtimeFeeRate`, `depositPercentage`<br>- `dailyLateReturnRate`, `cancellationWithin24hFeeRate`<br>- `effectiveFrom` | 404 | Lấy chính sách thuê đang áp dụng cho loại xe |
| `GET` | `/api/vehicles/{id:int}/affected-rentals` | Roles: `Admin, Manager, Staff, CS, Maintenance` | Route: `id` | `AffectedRental[]`<br>- `rentalId`, `status`, `startTime`, `endTime`, `customerName`, `customerPhone` | 404 | Danh sách đơn thuê bị ảnh hưởng khi xe bảo trì/hỏng |
| `GET` | `/api/vehicle-types` | Anonymous | Không có | `VehicleType[]`<br>- `id`, `name`, `fuelType`, `type` | 200 | Danh mục loại xe |
| `POST` | `/api/vehicle-types` | Policy `Management` | Body: `VehicleTypeRequest { name, fuelType?, type? }` | `VehicleType` | 400, 401, 403 | Thêm loại xe |
| `PUT` | `/api/vehicle-types/{id:int}` | Policy `Management` | Route: `id`<br>Body: `VehicleTypeRequest` | `VehicleType` | 400, 401, 403, 404 | Sửa loại xe |
| `DELETE` | `/api/vehicle-types/{id:int}` | Roles: `Admin` | Route: `id` | `null` | 401, 403, 404 | Xóa loại xe |
| `GET` | `/api/vehicles` | Anonymous | Query: `vehicleTypeId`, `facilityId`, `status`, `from`, `to`, `page` = 1, `pageSize` = 20 | `VehiclePage`<br>- `items`: `Vehicle[]`<br>- `page`, `pageSize`, `totalCount` | 200 | Danh sách phương tiện nội bộ |
| `GET` | `/api/vehicles/{id:int}` | Anonymous | Route: `id` | `Vehicle`<br>- `id`, `facilityId`, `vehicleTypeId`, `status`<br>- `brand`, `model`, `color`, `yearOfManufacture`<br>- `rentalPriceHourly`, `rentalPriceDay`<br>- `batteryCapacity`, `chargingType`, `trunkCapacity`, `seatingCapacity`, `rangeKm`<br>- `mainImageUrl`, `imageUrls` | 404 | Chi tiết phương tiện |
| `POST` | `/api/vehicles` | Policy `Management` | Body: `VehicleRequest` | `Vehicle` | 400, 401, 403 | Tạo phương tiện mới |
| `PUT` | `/api/vehicles/{id:int}` | Policy `Management` | Route: `id`<br>Body: `VehicleRequest` | `Vehicle` | 400, 401, 403, 404 | Sửa phương tiện |
| `DELETE` | `/api/vehicles/{id:int}` | Policy `Management` | Route: `id` | `null` | 401, 403, 404 | Xóa phương tiện |

---

### Nhóm 5: Chính Sách Thuê & Gói Thuê Bao (Policies & Subscriptions)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `GET` | `/api/rental-policies` | Policy `Management` | Không có | `RentalPolicy[]`<br>- `id`, `vehicleTypeId`, `name`<br>- `vatRate`, `overtimeFeeRate`, `depositPercentage`<br>- `isActive`, `createdAt` | 401, 403 | Danh sách chính sách thuê |
| `POST` | `/api/rental-policies` | Policy `Management` | Body: `PolicyRequest`<br>- `vehicleTypeId` (int)<br>- `name` (string)<br>- `vatRate`, `overtimeFeeRate`, `depositPercentage` (decimal)<br>- `isActive` (bool) | `RentalPolicy` | 400, 401, 403 | Tạo phiên bản chính sách mới (**Bất biến**: Không có PUT/DELETE) |
| `GET` | `/api/subscription-plans` | Anonymous | Query: `all` (bool, chỉ có tác dụng với Management) | `SubscriptionPlan[]`<br>- `id`, `name`, `description`, `price`, `durationDays`, `includedHours`, `isActive` | 200 | Danh mục gói thuê bao |
| `GET` | `/api/subscription-plans/{id:int}` | Anonymous | Route: `id` | `SubscriptionPlan` | 404 | Chi tiết gói |
| `POST` | `/api/subscription-plans` | Policy `Management` | Body: `PlanRequest`<br>- `name`, `description?`, `price`, `durationDays`, `includedHours`, `isActive` | `SubscriptionPlan` | 400, 401, 403 | Tạo gói thuê bao |
| `PUT` | `/api/subscription-plans/{id:int}` | Policy `Management` | Route: `id`<br>Body: `PlanRequest` | `SubscriptionPlan` | 400, 401, 403, 404 | Cập nhật thông tin gói |
| `DELETE` | `/api/subscription-plans/{id:int}` | Roles: `Admin` | Route: `id` | `null` | 401, 403, 404 | Xóa gói (chỉ khi chưa có người dùng) |
| `GET` | `/api/customer-subscriptions` | Policy `Customer` | Không có | `CustomerSubscription[]`<br>- `id`, `customerId`, `planId`, `planName`, `startDate`, `endDate`, `remainingHours`, `status` | 401 | Danh sách gói thuê bao của tôi |

---

### Nhóm 6: Đơn Thuê, Vòng Đời & Phân Bổ (Rentals & Lifecycle)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `POST` | `/api/rentals/hourly` | Policy `Customer` | Body: `RentalRequest`<br>- `vehicleId`, `policyId` (int)<br>- `startTime`, `endTime` (DateTime)<br>- `subscriptionId` (int?)<br>- `hasDriver` (bool?) | `Rental` | 400, 401 | Tạo đơn thuê theo giờ |
| `POST` | `/api/rentals/longterm` | Policy `Customer` | Body: `RentalRequest` | `Rental` | 400, 401 | Tạo đơn thuê dài hạn (tự lái) |
| `GET` | `/api/rentals/{id:int}` | Policy `RentalRead` | Route: `id` | `Rental` | 401, 403, 404 | Chi tiết đơn thuê cơ bản |
| `PUT` | `/api/rentals/{id:int}/contract` | Policy `CustomerService` | Route: `id`<br>Body: `RentalContractRequest`<br>- `contractLink` (url string)<br>- `signedAt` (DateTime) | `Rental` | 400, 401, 403, 404 | Lưu chứng từ hợp đồng ký ngoài |
| `GET` | `/api/rentals/mine` | Policy `Customer` | Query: `tab` ("upcoming" / "ongoing" / "completed" / "cancelled"), `page` = 1, `pageSize` = 20 | `PagedResult<CustomerRentalSummary>`<br>- `items`: `CustomerRentalSummary[]`<br>- `totalCount`, `page`, `pageSize` | 401 | Danh sách đơn thuê của khách |
| `GET` | `/api/rentals/mine/{id:int}` | Policy `Customer` | Route: `id` | `CustomerRentalDetail`<br>- xe, tài xế, trạm nhận, thanh toán, inspections, timeline | 401, 404 (`RENTAL_NOT_FOUND`) | Chi tiết đầy đủ chuyến đi của khách |
| `GET` | `/api/rentals` | Policy `CustomerService` | Query: `status`, `customerId`, `vehicleId`, `from`, `to`, `page` = 1, `pageSize` = 20 | `PagedResult<OperationalRentalSummary>` | 401, 403 | Danh sách đơn vận hành cho Staff |
| `GET` | `/api/rentals/{id:int}/detail` | Policy `CustomerService` | Route: `id` | `OperationalRentalDetail`<br>- kèm settlement, audit history, timeline | 401, 403, 404 | Chi tiết đơn vận hành |
| `GET` | `/api/rentals/overdue` | Policy `CustomerService` | Không có | `OverdueRentalItem[]`<br>- `rentalId`, `customerId`, `vehicleId`, `scheduledEndTime`, `hoursOverdue`, `conflictingBookingsCount` | 401, 403 | Danh sách đơn thuê đang quá giờ |
| `POST` | `/api/rentals/{id:int}/confirm` | Policy `CustomerService` | Route: `id` | `RentalLifecycleResult` | 400, 401, 403, 404, 409 (`INVOICE_NOT_PAID`, `ILLEGAL_TRANSITION`) | Xác nhận đơn → chuyển sang `pre_inspection` |
| `POST` | `/api/rentals/{id:int}/start` | Policy `CustomerService` | Route: `id` | `RentalLifecycleResult` | 400, 401, 403, 404, 409 (`PRE_INSPECTION_REQUIRED`, `DRIVER_NOT_ASSIGNED`, `DRIVER_LICENSE_INVALID`) | Bắt đầu giao xe → chuyển sang `renting` |
| `POST` | `/api/rentals/{id:int}/return` | Policy `CustomerService` | Route: `id`<br>Body: `ReturnRentalApiRequest? { returnedAt?: DateTime }` | `RentalLifecycleResult` | 400, 401, 403, 404, 409 (`ILLEGAL_TRANSITION`) | Nhận xe trả lại → chuyển sang `post_inspection` |
| `POST` | `/api/rentals/{id:int}/complete` | Policy `CustomerService` | Route: `id` | `RentalLifecycleResult`<br>- Kèm kết quả quyết toán cọc, quá giờ & kích hoạt hook tích điểm thưởng | 400, 401, 403, 404, 409 (`POST_INSPECTION_REQUIRED`) | Hoàn tất đơn → chuyển sang `completed` |
| `POST` | `/api/rentals/{id:int}/cancel` | Authenticated | Route: `id`<br>Body: `CancelRentalApiRequest`<br>- `reason` (string, required)<br>- `initiator` (string?)<br>- `waiveFee` (bool = false) | `RentalLifecycleResult` | 400, 401, 403, 404, 409 (`SELF_CANCEL_NOT_ALLOWED`, `ILLEGAL_TRANSITION`) | Hủy đơn thuê (khách tự hủy hoặc staff hủy) |
| `GET` | `/api/rentals/{id:int}/cancellation-preview` | Authenticated | Route: `id` | `CancellationPreview`<br>- `rentalId`, `canCancel`, `cancellationFee`, `refundAmount`, `refundPercentage`, `reason` | 401, 404 | Xem trước phí phạt & số tiền hoàn |
| `POST` | `/api/rentals/{id:int}/assignments/driver` | Policy `CustomerService` | Route: `id`<br>Body: `AssignDriverApiRequest`<br>- `driverStaffId` (int?)<br>- `reason` (string = "initial")<br>- `note` (string?) | `AssignmentResponse` | 400, 401, 403, 404, 409 (`DRIVER_BUSY`, `DRIVER_NOT_ELIGIBLE`) | Gán hoặc đổi tài xế |
| `POST` | `/api/rentals/{id:int}/assignments/vehicle` | Policy `CustomerService` | Route: `id`<br>Body: `ReplaceVehicleApiRequest`<br>- `newVehicleId` (int)<br>- `reason` (string)<br>- `note` (string?)<br>- `keepDriver` (bool = true) | `VehicleReplacementResult` | 400, 401, 403, 404, 409 (`VEHICLE_UNAVAILABLE`, `VEHICLE_TYPE_MISMATCH`) | Đổi xe cho đơn đang hoạt động |
| `GET` | `/api/rentals/{id:int}/assignments` | Policy `CustomerService` | Route: `id` | `AssignmentResponse[]` | 401, 403 | Lịch sử phân bổ xe / tài xế |
| `GET` | `/api/rentals/{id:int}/assignable-drivers` | Policy `CustomerService` | Route: `id`<br>Query: `eligibleOnly` (bool = true) | `AssignableDriverItem[]`<br>- `staffId`, `fullName`, `phone`, `rating`, `licenseExpiryDate`, `isEligible`, `ineligibilityReason` | 401, 403, 404 | Danh sách tài xế khả dụng kèm lý do |
| `GET` | `/api/rentals/{id:int}/assignable-vehicles` | Policy `CustomerService` | Route: `id` | `AssignableVehicleItem[]`<br>- `vehicleId`, `brand`, `model`, `color`, `seatCount`, `isAvailable` | 401, 403, 404 | Danh sách xe thay thế cùng loại còn trống |
| `POST` | `/api/rentals/{id:int}/inspections/pre` | Policy `Inspection` (Admin, Maintenance) | Route: `id`<br>Body: `InspectionRequest`<br>- `staffId`, `isOk`, `odometerKm`, `fuelBatteryLevel`, `damageNotes`, `imageUrls` | `Inspection` | 400, 401, 403 (yêu cầu staffId khớp claim) | Kiểm định xe trước khi giao |
| `POST` | `/api/rentals/{id:int}/inspections/post` | Policy `Inspection` | Route: `id`<br>Body: `InspectionRequest` | `Inspection` | 400, 401, 403 | Kiểm định xe sau khi nhận lại |
| `POST` | `/api/rentals/{id:int}/replacement-inspections/{vehicleId:int}` | Policy `Inspection` | Route: `id`, `vehicleId`<br>Body: `InspectionRequest` | `Inspection` | 400, 401, 403 | Kiểm định xe thay thế trước khi điều xe |
| `POST` | `/api/rentals/{id:int}/replacements` | Policy `Management` | Route: `id`<br>Body: `VehicleReplacementRequest`<br>- `vehicleId`, `driverStaffId`, `reportId` | `Rental` | 400, 401, 403 | Điều phối xe thay thế từ sự cố |

---

### Nhóm 7: Hóa Đơn, Thanh Toán & Hoàn Tiền (Payments & Invoices)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `POST` | `/api/invoices/{invoiceId:int}/checkout` | Policy `Customer` | Route: `invoiceId` | `CheckoutResult`<br>- `orderCode` (long), `checkoutUrl`, `qrCode`, `amount`, `description` | 401, 503 (PayOS error) | Tạo link thanh toán PayOS cho hóa đơn |
| `POST` | `/api/subscription-plans/{planId:int}/purchase` | Policy `Customer` | Route: `planId` | `CheckoutResult` | 401, 503 | Mua gói thuê bao qua PayOS |
| `POST` | `/api/payments/checkouts/{orderCode:long}/cancel` | Policy `Customer` | Route: `orderCode` | `CheckoutCancellation`<br>- `orderCode`, `status`, `cancelledAt` | 401, 404, 409 | Khách hủy link thanh toán (gọi khi quay lại từ PayOS cancelUrl) |
| `GET` | `/api/subscription-plans/purchases/{orderCode:long}` | Policy `Customer` | Route: `orderCode` | `PlanPurchaseStatus`<br>- `orderCode`, `planId`, `status`, `activatedAt` | 401, 404 | Polling kiểm tra trạng thái kích hoạt sau thanh toán |
| `POST` | `/api/payments/webhooks/payos` | Anonymous | Header: Signature<br>Body: `PayOsWebhookRequest` | `null` | 400 | Webhook trực tiếp từ PayOS (trả 204 NoContent) |
| `POST` | `/api/payments/{paymentId:int}/refunds` | Policy `CustomerService` | Route: `paymentId`<br>Body: `RefundRequest { amount: decimal }` | `PaymentResult` | 400, 401, 403 | Gửi yêu cầu hoàn tiền (trả 202 Accepted) |
| `GET` | `/api/invoices` | Policy `FinancialRead` | Không có | `InvoiceSummary[]`<br>- `id`, `rentalId`, `invoiceNumber`, `amount`, `vatAmount`, `status`, `issuedAt`, `dueAt`, `kind` | 401, 403 | Danh sách hóa đơn (Customer chỉ thấy của mình) |
| `GET` | `/api/invoices/{invoiceId:int}` | Policy `FinancialRead` | Route: `invoiceId` | `InvoiceSummary` | 401, 403, 404 | Chi tiết hóa đơn |
| `POST` | `/api/rentals/{rentalId:int}/invoice` | Policy `CustomerService` | Route: `rentalId` | `InvoiceSummary` | 400, 401, 403, 404 | Tạo hóa đơn cho đơn thuê |
| `GET` | `/api/payments` | Policy `FinancialRead` | Query: `invoiceId` (int?) | `PaymentSummary[]`<br>- `id`, `rentalId`, `invoiceId`, `type`, `amount`, `status`, `method`, `paidAt` | 401, 403 | Lịch sử thanh toán |
| `POST` | `/api/payments/refunds/{refundId:int}/approve` | Roles: `Admin` | Route: `refundId` | `PaymentSummary` | 400, 401, 403, 404 | Admin duyệt yêu cầu hoàn tiền |
| `POST` | `/api/payments/refunds/{refundId:int}/reject` | Roles: `Admin` | Route: `refundId` | `PaymentSummary` | 400, 401, 403, 404 | Admin từ chối yêu cầu hoàn tiền |

---

### Nhóm 8: Sự Cố, Bảo Trì & Đánh Giá (Incidents, Maintenance & Reviews)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `POST` | `/api/rentals/{id:int}/reports` | Roles: `Admin, Manager, Staff, Maintenance, CS, Driver` | Route: `id`<br>Body: `IncidentReportRequest`<br>- `type`, `description`, `imageUrls` (string[]?) | `IncidentReport`<br>- `id`, `rentalId`, `staffId`, `type`, `description`, `imageUrls`, `status`, `createdAt` | 400, 401, 403, 404 | Báo cáo sự cố khi đang thuê |
| `GET` | `/api/reports` | Roles: `Admin, Manager, Staff, Maintenance, CS, Driver` | Query: `rentalId` (int?) | `IncidentReport[]` | 401, 403 | Xem danh sách báo cáo sự cố (Manager/Admin xem hết, nhân viên xem của mình) |
| `POST` | `/api/reports/{id:int}/maintenance` | Policy `Management` | Route: `id`<br>Body: `ReportMaintenanceRequest`<br>- `assignedStaffId`, `facilityId`, `scheduledDate` | `Maintenance` | 400, 401, 403, 404 | Chuyển sự cố thành phiếu bảo trì |
| `POST` | `/api/reports/{id:int}/resolve` | Policy `Management` | Route: `id` | `null` | 401, 403, 404 | Đóng báo cáo sự cố |
| `GET` | `/api/maintenance` | Policy `Maintenance` | Query: `vehicleId` (int?), `status` (string?) | `Maintenance[]`<br>- `id`, `vehicleId`, `type`, `description`, `cost`, `scheduledDate`, `completedDate`, `status`, `isSafe` | 401, 403 | Danh sách phiếu bảo trì |
| `POST` | `/api/maintenance` | Policy `Management` | Body: `MaintenanceRequest` | `Maintenance` | 400, 401, 403 | Tạo phiếu bảo trì |
| `PUT` | `/api/maintenance/{id:int}` | Policy `Maintenance` | Route: `id`<br>Body: `MaintenanceRequest` | `Maintenance` | 400, 401, 403, 404 | Cập nhật phiếu bảo trì |
| `POST` | `/api/rentals/{rentalId:int}/ratings` | Policy `Customer` | Route: `rentalId`<br>Body: `RateStaffRequest`<br>- `staffId` (int)<br>- `rating` (decimal: 1.0–5.0)<br>- `comment` (string?) | `StaffRating`<br>- `id`, `rentalId`, `staffId`, `rating`, `comment`, `createdAt` | 400, 401, 404 | Khách đánh giá tài xế/nhân viên phục vụ |
| `GET` | `/api/staff/{staffId:int}/ratings` | Policy `Management` | Route: `staffId` (int) | `StaffRating[]` | 401, 403 | Xem danh sách đánh giá của một nhân viên |

---

### Nhóm 9: Điểm Thưởng — Loyalty Phase 1 (BE-27)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `GET` | `/api/loyalty/me` | Policy `Customer` | Không có | `LoyaltySummaryResponse`<br>- `balance`: int<br>- `tier`: string ("Member", "Silver", "Gold", "Platinum")<br>- `multiplier`: decimal (1.0, 1.1, 1.25, 1.5)<br>- `lifetimeEarned`: int<br>- `nextTier`?: string<br>- `pointsToNextTier`?: int | 401, 404 | Tóm tắt điểm thưởng của khách |
| `GET` | `/api/loyalty/me/transactions` | Policy `Customer` | Query: `type` (string?), `page` = 1, `pageSize` = 10 | `PagedLoyaltyTransactionsResponse`<br>- `items`: `LoyaltyTransactionDto[]`<br>- `total`, `page`, `pageSize` | 401, 404 | Sổ cái giao dịch điểm thưởng |
| `GET` | `/api/customers/{id:int}/loyalty` | Policy `Management` (Admin, Manager) | Route: `id` (customerId) | `LoyaltySummaryResponse` | 401, 403, 404 | Xem tóm tắt điểm thưởng của khách bất kỳ |
| `POST` | `/api/customers/{id:int}/loyalty/adjustments` | Policy `Admin` | Route: `id`<br>Header: `Idempotency-Key` (string?)<br>Body: `LoyaltyAdjustmentApiRequest`<br>- `points` (int, != 0)<br>- `reason` (string, 5–255 chars)<br>- `idempotencyKey` (string?) | `LoyaltyTransactionDto`<br>- `id`, `customerId`, `points`, `balanceAfter`, `type`, `reason`, `createdAt` | 400, 401, 403, 404, 409 (`INSUFFICIENT_POINTS`) | Admin điều chỉnh điểm thủ công |
| `GET` | `/api/loyalty/redemption-quote` | Policy `Customer` | Query: `rentAmount` (decimal) | `RedemptionQuoteResponse` | 400, 401, 404, 409 (`REDEMPTION_DISABLED`) | Báo giá tiêu điểm (Pha 1 trả 409 do tắt đổi điểm) |
| `GET` | `/api/admin/loyalty/reconciliation` | Policy `Admin` | Không có | `LoyaltyReconciliationDto[]`<br>- `customerId`, `cachedPoints`, `ledgerSum`, `difference` | 401, 403 | Đối soát số dư đệm vs tổng sổ cái |

---

### Nhóm 10: Tải Ảnh Lên Cloudinary & Hệ Thống (Media & System)

| Method | Path | Roles / Auth | Request (Query / Body) | Response `data` | Mã lỗi | Ghi chú |
|---|---|---|---|---|---|---|
| `POST` | `/api/media/avatar` | Authenticated | `multipart/form-data`: `file` (<= 5MB image) | `StoredImage { secureUrl: string, publicId: string }` | 400, 401 | Tải ảnh đại diện người dùng |
| `POST` | `/api/media/vehicle` | Policy `Management` | `multipart/form-data`: `file` (<= 10MB image) | `StoredImage` | 400, 401, 403 | Tải ảnh phương tiện |
| `POST` | `/api/media/staff-license` | Policy `Admin` | `multipart/form-data`: `file` (<= 5MB image) | `StoredImage` | 400, 401, 403 | Tải ảnh GPLX nhân viên |
| `POST` | `/api/media/inspection` | Policy `Inspection` | `multipart/form-data`: `file` (<= 10MB image) | `StoredImage` | 400, 401, 403 | Tải ảnh kiểm định |
| `POST` | `/api/media/report` | Roles: `Admin, Manager, Staff, Maintenance, CS, Driver` | `multipart/form-data`: `file` (<= 10MB image) | `StoredImage` | 400, 401, 403 | Tải ảnh báo cáo sự cố |
| `GET` | `/api/dashboard` | Policy `Management` | Query: `from`, `to` (DateTime?) | Dynamic object (chứa `revenue`, `rentalsCount`, `utilizationRate`, v.v.) | 401, 403 | Dữ liệu điều hành tổng hợp |
| `GET` | `/Home/status` | Anonymous | Không có | `{ service: string, status: string, timestamp: string }` | 200 | Trạng thái dịch vụ API |
| `GET` | `/health` | Anonymous | Không có | `{ status: "Healthy" }` (bọc envelope) | 503 (nếu DB ngắt) | Kiểm tra kết nối CSDL |

---

## 3. Danh Sách Endpoint Cần Cho Các Module FE Nhưng BE Chưa Có (KHÔNG CÓ)

Dưới đây là các endpoint được mô tả trong spec của từng module FE nhưng qua rà soát mã nguồn Backend là **KHÔNG CÓ**:

### 3.1 Cho module `FE-23` (Admin: Quản lý người dùng)
* `GET /api/admin/users`: **KHÔNG CÓ**. BE chỉ có `GET /api/customers` (dành cho Customer Service, chỉ trả tài khoản có hồ sơ Customer). Hiện không có endpoint nào liệt kê toàn bộ tài khoản `users` hệ thống (bao gồm Admin, Manager, Staff, Maintenance chưa gắn Customer).
* `GET /api/admin/users/{id}`: **KHÔNG CÓ**.
* `PUT /api/admin/users/{id}/roles`: **KHÔNG CÓ**. BE không có endpoint cho phép Admin phân quyền / thay đổi vai trò trong bảng `user_roles`.
* `POST /api/admin/users/{id}/lock` và `unlock`: **KHÔNG CÓ**. (Chỉ có xóa mềm staff làm tắt `users.is_active`, không có API khóa/mở khóa độc lập cho user).
* `POST /api/admin/users/{id}/revoke-sessions`: **KHÔNG CÓ** endpoint để Admin thu hồi phiên của user khác (chỉ có `/api/auth/logout-all` do chính user tự gọi).
* `GET /api/roles`: **KHÔNG CÓ** endpoint trả danh sách vai trò hệ thống cho UI Combobox.
* **Giải pháp cho FE-23:** Chạy mock-first; với Customer có thể dùng tạm `GET /api/customers` và `GET /api/customers/{id}`.

### 3.2 Cho module `FE-25` (Admin: Quản lý đánh giá)
* `GET /api/admin/reviews`: **KHÔNG CÓ**. BE chỉ có `GET /api/staff/{staffId}/ratings` để lấy đánh giá của 1 nhân viên cụ thể; không có endpoint tổng hợp toàn bộ đánh giá với bộ lọc sao, trạng thái, chi nhánh, phân trang.
* `POST /api/admin/reviews/{id}/hide` và `unhide`: **KHÔNG CÓ** (DDL không có cột `status` hay `is_hidden`).
* `POST /api/admin/reviews/{id}/reply`: **KHÔNG CÓ** (DDL không có cột `reply`).
* `GET /api/staff/{id}/rating-summary`: **KHÔNG CÓ** (chỉ có danh sách mảng và điểm trung bình lưu sẵn tại `staffs.rating`).
* **Giải pháp cho FE-25:** Chạy 100% mock-first theo đúng spec `FE-25` mục 1.

### 3.3 Cho module `FE-18` (Admin: Dashboard biểu đồ)
* `GET /api/dashboard/revenue-series`, `useFleetStatus`, `useMaintenanceVsRevenue`, `useTopVehicles`, `usePlanUsage`: **KHÔNG CÓ**. BE chỉ cung cấp 1 endpoint duy nhất là `GET /api/dashboard?from=&to=` trả về 1 object tổng hợp.
* **Giải pháp cho FE-18:** Adapter của FE-18 phải bóc tách dữ liệu từ object đơn này, hoặc mock các trường phụ còn thiếu.

### 3.4 Cho module `FE-19` (Admin: Xử lý báo cáo sự cố/khiếu nại)
* `PUT /api/reports/{id}/status`: **KHÔNG CÓ** (BE chỉ có `POST /api/reports/{id}/resolve` để đóng).
* `POST /api/reports/{id}/notes` (ghi chú xử lý/phản hồi gửi khách): **KHÔNG CÓ** (DDL `reports` không có cột này).
* Gán người xử lý (`assigned_to`): **KHÔNG CÓ**.
* **Giải pháp cho FE-19:** Ẩn các nút hành động này trên UI, chỉ giữ nút "Giải quyết sự cố" (`resolve`) và "Chuyển bảo trì" (`maintenance`).

### 3.5 Cho module `FE-24` (Admin: Nhân viên & Tài xế)
* Các endpoint nâng cao ca làm việc / ngày nghỉ / khu vực của tài xế thuộc BE-33 (Lạc): **KHÔNG CÓ**. (Hiện tại chỉ có `GET/POST/PUT /api/drivers/shifts` cơ bản).
* **Giải pháp cho FE-24:** Ẩn tab ca làm việc nâng cao và khu vực cho tới khi BE-33 hoàn tất.

### 3.6 Cho module `FE-14` (Admin: Chính sách & Gói)
* Trường `subscribersCount` trong `SubscriptionPlan`: **KHÔNG CÓ** trong DTO trả về của BE.

---

## 4. Các Trường FE Mock Đang Dùng Nhưng BE DTO/DDL Không Có

| Trường Mock Trong FE | Nơi Sử Dụng Trong FE | Hiện Trạng Trong BE | Giải Pháp / Đề Xuất |
|---|---|---|---|
| **Biển số xe** (`licensePlate` / `plateNumber`) | `mock-grading.ts`, `InspectionShowcase.tsx`, `VehicleManagement.tsx` | CSDL PostgreSQL DDL và thực thể `vehicles` **hoàn toàn không có cột `license_plate`**. | Giữ nguyên mock khi test; trên UI thật hiển thị Mã xe `#ID` hoặc `Brand Model (Năm)` thay vì biển số. Không tự ý thêm cột vào DB. |
| **Mã biên bản kiểm định** (`recordNumber`, ví dụ `KD-2026-08819`) | `mock-grading.ts` | Bảng `inspections` chỉ có khóa chính integer `id`. | Hiển thị mã dạng `KD-${id}` ở UI. |
| **Tên/Mã giám định viên** (`inspectorName`, `inspectorCode`) | `mock-grading.ts` | Bảng `inspections` chỉ lưu `staff_id` (integer). | Hiển thị `Kỹ thuật viên #${staffId}` hoặc nối bảng nếu có thông tin staff. |
| **Điểm số & Hạng kiểm định** (`gradingScore`: 98, `grade`: "A+") | `mock-grading.ts` | Bảng `inspections` chỉ có `is_ok` (boolean: Đạt / Không đạt). | Quy ước: `is_ok = true` hiển thị "Đạt chuẩn an toàn", `is_ok = false` hiển thị "Không đạt chuẩn". Không bịa điểm số. |
| **Checklist chi tiết từng hạng mục** (`checkItems[]`: lốp, phanh, pin...) | `mock-grading.ts` | BE chỉ lưu text thuần `damage_notes` và mảng ảnh `image_urls`. | Hiển thị ghi chú và thư viện ảnh chụp thực tế. |
| **Hash niêm phong số** (`digitalSealHash`) | `mock-grading.ts` | BE không có trường này. | Ẩn trường này khỏi giao diện thật. |
| **Định danh chuỗi String ID** (`usr-cust-001`, `VRS-2026-H892`, `fac-q1`) | `mock-store.ts`, `mock-catalog.ts` | Toàn bộ ID khóa chính của BE đều là số nguyên tự tăng `int` (Identity/Serial). | Chuẩn hóa mọi kiểu dữ liệu ID trên client sang `number`. |
| **Số lượt đăng ký gói** (`subscribersCount`) | `mock-store.ts`, `FE-14` | DTO `SubscriptionPlan` của BE không có trường này. | Hiển thị `—` hoặc ẩn số người dùng ở giao diện admin gói. |

---

## 5. Mâu Thuẫn Giữa Specs BE và Code BE

1. **Spec SRS v2.0 vs Code Thật:**
   - SRS v2.0 mô tả EF Core và JWT Bearer token truyền qua Authorization Header.
   - Code thật: Dùng Npgsql thuần + Dapper-style manual mapping (ADR-001), session Redis và xác thực bằng **Cookie HttpOnly (`access_token`, `refresh_token`)**. Specs FE phải tuân thủ theo **code thật**, không theo SRS cũ.
2. **Tên Cookie Xác Thực:**
   - Trong `FE-FOUNDATION.md` và `FE-02-session-rbac.md` nhắc đến cookie `__Host-vehicle-rental`.
   - Trong code C# thật (`AuthCookies.cs`), tên cookie được hard-code là `access_token` và `refresh_token`.
3. **Mã Lỗi Khi Đổi Điểm Thưởng (Redeem Loyalty):**
   - Spec `FR-029` ghi chú tiêu điểm có thể bật cấu hình.
   - Code thật `LoyaltyController.cs`: Mặc định `Redemption.Enabled = false`, gọi `GET /api/loyalty/redemption-quote` sẽ ném `BusinessRuleException("REDEMPTION_DISABLED", ...)` trả về **HTTP 409 Conflict**.
4. **Kiểm Định Xe Thay Thế (Vehicle Replacement Inspection):**
   - Bảng `inspections` có ràng buộc duy nhất `UNIQUE(rental_id, inspection_type)`. Do đó, xe thay thế ghi nhận inspection qua endpoint riêng `/replacement-inspections/{vehicleId}` và chưa thể ghi đè pre-inspection vào bảng chính nếu cùng loại.
5. **Đổi Xe Khác Loại (Vehicle Swap):**
   - Code `NpgsqlAssignmentRepository.cs` kiểm tra nghiêm ngặt `vehicle_type_id`: Đổi xe khác loại sẽ trả lỗi **409 `VEHICLE_TYPE_MISMATCH`** để tránh phá vỡ bảng giá snapshot của đơn thuê.
