# Kế hoạch Đồng bộ Hệ thống FE – BE & Chuyển dịch Mô hình Thuê xe Kèm Tài xế (Chauffeur-Only)

Tài liệu này là bản kế hoạch tổng thể (Master Implementation Plan) thống nhất giữa hai repository:
- **Frontend (FE):** `Car-Rental-System-FE` (Next.js 16 / React 19 / Transit Desk UI)
- **Backend (BE):** `Car-Rental-System-BE` (ASP.NET Core 8 / PostgreSQL / Npgsql)

Cập nhật ngày: **2026-10-21**.

---

## I. Mục tiêu & Nguyên tắc Chỉ đạo

1. **Vá triệt để các điểm đứt gãy hợp đồng (Contract Mismatch) hiện hữu:** Xử lý ngay các lỗi lệch kiểu dữ liệu phân trang, lỗi policy quyền truy cập và nguy cơ tính sai tiền (VAT/cọc = 0).
2. **Khai thác toàn diện các API Backend mới:** Xóa bỏ trạng thái `unsupportedApi` và dữ liệu giả/mock trên các màn hình Báo cáo, Đánh giá, Nhật ký kiểm toán và Danh mục vai trò.
3. **Chuyển đổi dứt điểm sang mô hình "Thuê xe có tài xế 100%":**
   - Đóng toàn bộ luồng thuê tự lái (`self-drive`).
   - Thiết lập cơ chế phân công tài xế phụ trách xe/ca trực trước khi mở nhận đặt chuyến.
   - Gỡ bỏ rào cản bắt buộc GPLX đối với khách hàng (chỉ kiểm tra nghiêm ngặt GPLX của tài xế).
   - Tái định nghĩa quy trình bàn giao tại garage: Giao xe cho tài xế nội bộ, khách hàng nghiệm thu dịch vụ.
4. **Không phá vỡ dữ liệu lịch sử:** Đảm bảo các đơn hàng tự lái cũ, hợp đồng đã ký và hóa đơn trong quá khứ tiếp tục được tra cứu và quyết toán toàn vẹn.

---

## II. Lộ trình Triển khai 3 Giai đoạn (Phased Roadmap)

```
[ Giai đoạn 1: Ổn định Nền tảng & Vá lỗi Tích hợp ]
   ├── Sửa lỗi policy giá (VAT/Cọc = 0)
   ├── Chuẩn hóa Adapter bóc tách phân trang OperationsPage<T>
   ├── Thực thi cấm tự cấp vai trò ở Backend
   └── Mở quyền báo cáo sự cố cho Khách hàng
                   │
                   ▼
[ Giai đoạn 2: Tích hợp Toàn bộ API Backend mới ]
   ├── Kết nối API Xử lý Báo cáo sự cố (PATCH /reports/{id}/status)
   ├── Kết nối API Kiểm duyệt Đánh giá (PATCH /ratings/{id})
   ├── Hoàn thiện trang Audit Logs với phân trang & bộ lọc thật
   └── Tích hợp CRUD Danh mục vai trò (/api/roles)
                   │
                   ▼
[ Giai đoạn 3: Chuyển đổi Mô hình Xe Kèm Tài xế 100% ]
   ├── BE: Phân công tài xế theo ca/xe trước khi tìm kiếm
   ├── BE & FE: Engine tìm kiếm lọc theo cặp Xe + Tài xế khả dụng
   ├── BE & FE: Bỏ tùy chọn tự lái, bỏ ràng buộc GPLX khách khi đặt
   ├── BE & FE: Tái định nghĩa bàn giao (Nội bộ -> Tài xế)
   └── Xử lý chuyển tiếp đơn cũ & Di chuyển dữ liệu
```

---

## III. Chi tiết Kỹ thuật Từng Giai đoạn

### GIAI ĐOẠN 1: Vá lỗi Tích hợp & Bảo vệ Tính Toàn vẹn Dữ liệu (P0 - Khẩn cấp)

#### 1.1 Sửa lỗi tính VAT và tiền cọc bằng 0 khi khách đặt xe
- **Hiện trạng:** Khách hàng (role `Customer`) gọi `GET /api/rental-policies` bị lỗi 403 Forbidden (chỉ cho Admin/Manager). FE fallback gửi `policyId: null`, khiến BE `CreateRentalAsync` tính `vat=0`, `deposit=0`.
- **Giải pháp Backend (`Car-Rental-System-BE`):**
  - Trong `NpgsqlOperationsRepository.CreateRentalAsync`: Nếu `policyId` gửi lên là `null`, BE tự động truy vấn policy đang `is_active = true` tương ứng với `vehicle_type_id` của xe (thông qua `GetActivePolicyAsync`). Nếu không tìm thấy policy hợp lệ, từ chối tạo đơn với lỗi `400 ACTIVE_POLICY_REQUIRED`.
- **Giải pháp Frontend (`Car-Rental-System-FE`):**
  - Trong `src/features/rentals/api.ts`: Thay thế hàm gọi `getBookingPolicies()` bằng hàm gọi endpoint công khai `GET /api/vehicle-types/{vehicleTypeId}/active-policy`.
  - Trong `BookingForm.tsx`: Khi người dùng chọn xe, tự động nạp chính sách tương ứng của loại xe đó để tính dự toán tạm tính chính xác.

#### 1.2 Chuẩn hóa Adapter FE bóc tách Envelope Phân trang `OperationsPage<T>`
- **Hiện trạng:** BE mới đã chuyển đổi các API danh sách sang cấu trúc `{ items: T[], page: number, pageSize: number, totalCount: number }`. FE adapter vẫn ép kiểu mảng `T[]`, dẫn đến crash runtime hoặc lỗi `map is not a function`.
- **Giải pháp Frontend:**
  - Cập nhật các adapter trong `src/features/operations/extended-api.ts`:
    - `getReports`: bóc tách `result.items ?? []`.
    - `getMaintenance`: bóc tách `result.items ?? []`.
    - `getDispatchSchedule`: bóc tách `result.items ?? []`.
  - Cập nhật `src/features/driver-portal/api.ts`:
    - `getDriverSchedule`: trả về `{ items, totalCount }` hoặc unwrap `items` an toàn.
  - Cập nhật `src/features/admin/reports/api.ts` và `src/features/admin/reviews/api.ts`:
    - Kiểm tra `Array.isArray(result)` hoặc đọc `result.items`.

#### 1.3 Thực thi Chặn Tự cấp Vai trò (Self-Role Assignment) ở Backend
- **Hiện trạng:** FE đã chặn giao diện và ném lỗi 409 tại client, nhưng BE `NpgsqlUserAdministrationRepository.SetRoleAsync` chưa kiểm tra `actorUserId == targetUserId`.
- **Giải pháp Backend:**
  - Trong `NpgsqlUserAdministrationRepository.SetRoleAsync`: Thêm điều kiện:
    ```csharp
    if (assigned && id == actorUserId)
        throw new UserAdministrationException(409, "You cannot assign additional roles to yourself.");
    ```
  - Bổ sung test kiểm thử xUnit trong `UserAdministrationTests.cs`.

#### 1.4 Mở quyền Báo cáo Sự cố cho Khách hàng
- **Hiện trạng:** `POST /api/rentals/{id}/reports` yêu cầu `staff_id > 0` và các role nhân viên, khiến khách hàng không thể báo sự cố chuyến đi trên `IncidentReporter.tsx`.
- **Giải pháp Backend:**
  - Bổ sung policy `Customer` hoặc cho phép người tạo đơn gửi report: Nếu user là chủ sở hữu của `rentals.customer_id`, lưu `reporter_staff_id = NULL` và lưu `customer_id` của khách.
- **Giải pháp Frontend:**
  - Giao diện `IncidentReporter.tsx` nhận diện ngữ cảnh đăng nhập (nếu là khách thì tự động lấy thông tin từ session, không yêu cầu mã nhân viên).

---

### GIAI ĐOẠN 2: Tích hợp Toàn bộ API Backend mới vào FE (P1)

#### 2.1 Xử lý Báo cáo Sự cố (Incident Reports)
- **Backend đã có:** `PATCH /api/reports/{id}/status` nhận body `{ status: "in_progress" | "rejected", reason: string }` và `POST /api/reports/{id}/resolve`. DTO trả về đầy đủ thông tin khách hàng (`customer`), xe (`vehicle`), hợp đồng (`rental`) và lịch sử (`history`).
- **Nhiệm vụ Frontend:**
  - Trong `src/features/admin/reports/api.ts`: Xóa bỏ `unsupportedApi`, kết nối thật với `PATCH /api/reports/{id}/status`.
  - Trong `ReportDetailView.tsx`: Hiển thị thông tin khách hàng thật, biển số xe, thời gian tạo báo cáo (tính SLA 24h từ `createdAt`) và danh sách ghi chú lịch sử xử lý.

#### 2.2 Quản trị Đánh giá Nhân sự & Tài xế (Staff Ratings)
- **Backend đã có:** `PATCH /api/ratings/{id}` nhận `{ status: "visible" | "hidden" | "reported", reason: string }` và `POST /api/ratings/{id}/reply` nhận `{ text: string }`.
- **Nhiệm vụ Frontend:**
  - Trong `src/features/admin/reviews/api.ts`: Xóa bỏ `unsupportedApi`, gọi API thật để ẩn/hiện đánh giá kèm lý do kiểm duyệt.
  - Kết nối tính năng gửi phản hồi chính thức từ ban quản lý tới khách hàng.

#### 2.3 Hoàn thiện Trang Nhật ký Kiểm toán (`/admin/audit-logs`)
- **Backend đã có:** `GET /api/audit-logs` trả về `AuditLogPage (items, page, pageSize, totalCount)` ghi nhận chi tiết actor, IP, hành động, target user và trạng thái.
- **Nhiệm vụ Frontend:**
  - Cập nhật `src/app/admin/audit-logs/page.tsx`:
    - Bổ sung thanh điều khiển chuyển trang (`ResultPagination`) liên kết với `totalCount` của máy chủ.
    - Sửa thông báo lỗi: Phân biệt rõ lỗi mạng tạm thời và trạng thái 403 (không đủ quyền).

#### 2.4 Quản lý Danh mục Vai trò (`/admin/roles`)
- **Backend đã có:** `RolesController` hỗ trợ đầy đủ `GET/POST/PUT/DELETE /api/roles`.
- **Nhiệm vụ Frontend:**
  - Kết nối giao diện danh mục vai trò với API thật của backend, bảo vệ vai trò hệ thống cốt lõi không bị xóa nhầm.

---

### GIAI ĐOẠN 3: Chuyển đổi Mô hình Sang "Thuê Xe Có Tài Xế 100%" (P2 - Trọng tâm Nghiệp vụ)

#### 3.1 Cơ chế Phân công Tài xế Trước Chuyến (Pre-assignment & Duty Shifts)
- **Mục tiêu:** Một chiếc xe chỉ được phép nhận đặt lịch khi đã có tài xế trực ca hợp lệ phụ trách chiếc xe đó trong khoảng thời gian tương ứng.
- **Giải pháp Backend:**
  - Bảng `vehicle_assignments` hoặc bảng ca trực `driver_shifts`: Mở rộng khả năng liên kết `vehicle_id` với `driver_staff_id` cho một khung giờ trực (`start_time` -> `end_time`).
  - Trong `VehicleSearchService` (`/api/vehicles/search`):
    - Đổi điều kiện tìm kiếm: Không chỉ kiểm tra xe trống và tài xế ngẫu nhiên rảnh. Bắt buộc kiểm tra: **Tồn tại ít nhất một tài xế đủ điều kiện (GPLX hợp lệ, active) đã được phân ca trực cho chính chiếc xe này trong toàn bộ khung giờ thuê (kèm đệm 60 phút)**.
- **Giải pháp Frontend:**
  - Màn hình Điều phối (`/admin/dispatch`): Bổ sung giao diện trực quan cho phép nhân viên trạm lập lịch phân công "Xe - Tài xế" theo ngày/tuần trước khi xe hiển thị lên website cho khách thuê.

#### 3.2 Tinh gọn Quy trình Đặt xe Phía Khách hàng (Booking Flow)
- **Frontend (`BookingForm.tsx`, `BookingVehicleCards.tsx`):**
  - Loại bỏ hoàn toàn dropdown lựa chọn "Hình thức lái" (`Tự lái / Có tài xế`).
  - Mặc định toàn bộ chuyến đi là `hasDriver = true`.
  - Loại bỏ trường kiểm tra/bắt buộc Giấy phép lái xe (`CustomerLicense`) trong form đặt xe. Khách hàng chỉ cần đăng ký tài khoản định danh (SĐT/Email), không cần chờ duyệt GPLX mới được đặt chuyến.
  - Nhãn hiển thị giá ghi rõ: *"Đã bao gồm chi phí tài xế phục vụ theo ca"*.
- **Backend (`CreateRentalAsync`):**
  - Chặn đứng mọi payload gửi `hasDriver = false` (ném lỗi `400 SELF_DRIVE_DISCONTINUED`).
  - Khi tạo đơn thuê (`rentals`), tự động tạo bản ghi phân bổ ban đầu (`vehicle_assignments`) gắn tài xế đang trực ca của xe đó vào đơn thuê.
  - Gỡ bỏ điều kiện `customer.license_status == "approved"` khi tạo đơn thuê mới.

#### 3.3 Hợp đồng Dài hạn (Long-term Rentals)
- **Chính sách mới:** Chuyển đổi gói thuê dài hạn thành mô hình "Thuê xe phục vụ dài hạn theo hợp đồng doanh nghiệp/cá nhân có tài xế chuyên trách".
- **Backend & FE:**
  - `POST /api/rentals/longterm` bắt buộc cấu hình tài xế phục vụ định kỳ.
  - Biên bản hợp đồng (`PUT /api/rentals/{id}/contract`) cập nhật điều khoản về ca làm việc, thời gian chờ và trách nhiệm của tài xế.

#### 3.4 Quy trình Bàn giao & Vận hành Chuyến đi
- **Bản chất mới của Bàn giao (`/admin/handovers`):**
  - **Khâu 1 (Nội bộ garage):** Kỹ thuật viên kiểm tra an toàn (`pre_inspection`), Nhân viên trạm bàn giao chìa khóa và phương tiện cho **Tài xế nhận ca** (ghi nhận biên bản giao xe nội bộ).
  - **Khâu 2 (Phục vụ khách):** Tài xế đưa xe đến điểm đón, đón khách và kích hoạt trạng thái hành trình `renting` trên ứng dụng/hệ thống.
  - **Khâu 3 (Kết thúc chuyến):** Tài xế trả khách, đưa xe về trạm; Kỹ thuật viên kiểm định sau chuyến (`post_inspection`) và quyết toán.

#### 3.5 Quản lý Dữ liệu Lịch sử & Đơn hàng Cũ
- Không chạy script update ép buộc các đơn hàng tự lái cũ thành có tài xế.
- Các đơn hàng tự lái cũ có trạng thái `completed` hoặc `cancelled` giữ nguyên cờ `has_driver = false` để làm căn cứ kế toán, hóa đơn và đối soát lịch sử.
- Đơn tự lái cũ đang trong trạng thái `pending`/`pre_inspection`: Nhân viên liên hệ chăm sóc khách hàng để hỗ trợ phân công tài xế miễn phí hoặc hoàn tiền 100% nếu khách không đồng ý.

---

## IV. Bảng Ma trận Quyền hạn Mục tiêu (RBAC Alignment)

| Module / Hành động | Route / Endpoint | Admin | Manager | Staff | CustomerService | Maintenance | Driver | Customer |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Quản trị Tài khoản & Phân vai trò** | `/api/users/**` | Full (No self-assign) | — | — | — | — | — | — |
| **Quản lý Danh mục Vai trò** | `/api/roles/**` | Full | — | — | — | — | — | — |
| **Nhật ký Kiểm toán** | `/api/audit-logs` | View | View | — | — | — | — | — |
| **Cơ cấu Phòng ban & Chi nhánh** | `/api/facilities`, `/departments` | Full | View | — | — | — | — | — |
| **Phân công Tài xế trước ca** | `/api/drivers/shifts`, `/assignments` | Approve | Approve | Create/Update | — | — | View (own) | — |
| **Tìm xe khả dụng kèm tài xế** | `/api/vehicles/search` | View | View | View | View | View | View | View |
| **Tạo yêu cầu thuê (Chauffeur)** | `/api/rentals/hourly`, `/longterm` | — | — | Create (hộ) | Create (hộ) | — | — | **Create** |
| **Duyệt yêu cầu thuê & Bàn giao** | `/api/rentals/{id}/confirm`, `/start` | Override | Approve | **Execute** | Support | — | — | — |
| **Kiểm tra Kỹ thuật (Pre/Post)** | `/api/rentals/{id}/inspections/**` | View | View | View | — | **Full** | — | — |
| **Tiếp nhận & Xử lý Sự cố** | `/api/reports/**` | View | Approve | Handle | **Handle** | View (hỏng hóc) | Report | **Report** |
| **Kiểm duyệt Đánh giá Tài xế** | `/api/ratings/**` | Moderate | **Moderate/Reply** | — | — | — | View (own) | Rate |
| **Bảo dưỡng & Sửa chữa Xe** | `/api/maintenance/**` | View | Approve chi | — | — | **Full** | — | — |
| **Xem Tiến trình & Hóa đơn** | `/api/rentals/mine`, `/invoices` | — | — | — | — | — | — | **View** |

---

## V. Tiêu chuẩn Kiểm thử & Kịch bản Nghiệm thu (Acceptance Criteria)

### Kịch bản 1: Đặt xe thành công mô hình Chauffeur-only
1. Khách hàng mở trang đặt xe, chọn chi nhánh và khung thời gian.
2. Form không hiển thị trường chọn tự lái, không yêu cầu GPLX khách hàng.
3. Dự toán hiển thị đầy đủ Đơn giá giờ + VAT + Cọc dựa theo policy của loại xe.
4. Gửi yêu cầu đặt xe thành công, backend tạo đơn kèm theo liên kết tài xế trực ca khả dụng.

### Kịch bản 2: Bảo vệ tài xế không bị phân công chồng chéo (Race condition)
1. Giả lập 2 yêu cầu đặt xe gửi đồng thời cho 2 chiếc xe khác nhau nhưng chi nhánh chỉ có 1 tài xế trực ca hợp lệ trong khung giờ đó.
2. Backend sử dụng transaction và exclusion lock: Yêu cầu 1 được xác nhận; Yêu cầu 2 bị từ chối với mã lỗi `409 DRIVER_BUSY`.

### Kịch bản 3: Xử lý Báo cáo sự cố từ Khách hàng đến Trạm bảo dưỡng
1. Khách hàng gửi sự cố cho đơn đang chạy qua `/api/rentals/{id}/reports`.
2. CustomerService hoặc Staff nhìn thấy báo cáo trên `/admin/reports` với đầy đủ tên khách hàng, mã đơn, SLA 24h.
3. Nhân viên đổi trạng thái sang `in_progress` thành công (không bị lỗi 501/unsupported).
4. Manager tạo phiếu bảo dưỡng từ báo cáo, chuyển xe sang trạng thái `maintenance`. Xe tự động biến mất khỏi kết quả tìm kiếm khả dụng.

### Kịch bản 4: Nghiệm thu Nhật ký kiểm toán & Chặn tự nâng quyền
1. Admin A cố gắng gọi API để gán thêm vai trò cho chính mình -> Backend trả về `409 Conflict`.
2. Admin B gán vai trò Staff cho nhân viên C -> Thao tác thành công.
3. Admin và Manager mở trang `/admin/audit-logs`: Bản ghi gán quyền của Admin B và bản ghi bị chặn của Admin A xuất hiện chính xác, có đầy đủ IP và phân trang hoạt động chuẩn xác.
