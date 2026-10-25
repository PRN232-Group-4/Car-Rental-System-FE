# FE-24 — Admin: quản lý nhân viên & tài xế

## Điều chỉnh đã duyệt — 2026-10-22

- Tạm khóa **tạo, sửa, hủy ca trực tài xế** trên giao diện bằng `DRIVER_SHIFT_MANAGEMENT_ENABLED=false` trong `src/config/operational-features.ts`. Các nút bị disable, liên kết mô tả nguyên nhân rõ ràng; không mở form hoặc gửi mutation ca khi đang khóa. Không thay đổi API hay xóa ca đã lưu. Khi mở lại tính năng, đổi cờ và cập nhật kiểm thử theo yêu cầu mới.
- Giữ tra cứu ca và lịch chuyến thật; cổng tài xế thông báo quản lý ca đang tạm khóa. Lịch chuyến/phân công theo đơn thuê không bị khóa theo chức năng xếp ca.
- Trong `/admin/dispatch`, danh bạ/ca/lịch toàn hệ thống chỉ tải cho Admin/Manager đúng quyền API; CustomerService dùng tra cứu và phân công theo đơn, không gọi các API quản lý này.
- Tài xế được gán cho **xe của từng đơn thuê**, không phải gán cố định cho xe. Điểm vào: Vận hành → đơn có tài xế → “Phân xe và tài xế”; hoặc Điều phối → “Mở phân công tài xế” → “Phân chuyến theo mã đơn”. Lịch tài xế vẫn cho phép đổi tài xế của chuyến thật.
- Form dùng `GET /rentals/{id}/assignable-drivers?eligibleOnly=false`; tài xế không hợp lệ bị disable kèm lý do tiếng Việt. Admin/Manager bổ sung email từ danh sách tài xế thật; CustomerService chỉ dùng tên thật do API candidates chưa có email và `/staff/drivers` chỉ cho Admin/Manager. Không gọi API danh bạ ngoài quyền hoặc chặn phân công khi dữ liệu bổ sung này lỗi. Lưu qua `POST /rentals/{id}/assignments/driver` cùng lý do/ghi chú; không gửi `driverStaffId=null` cho đơn có tài xế. Có lỗi inline, tải lại khi lỗi, khóa gửi lặp, giữ dữ liệu khi API từ chối. Tự lái/đơn kết thúc không hiện form tài xế; quyền phân công theo API: Admin/Manager/CustomerService.

Acceptance cho điều chỉnh:

- [x] Tạo/xếp/sửa/hủy ca đều tạm khóa; vẫn xem được dữ liệu thật và phân công tài xế cho đơn thuê.
- [x] Phân công dùng tài xế hợp lệ theo từng đơn; không có lựa chọn tự lái trên đơn có tài xế.
- [x] Kiểm thử thiếu tài xế, tài xế bận, lỗi API/mạng, giữ dữ liệu và retry, quyền chỉ đọc, desktop/mobile và không mutation ca.

- **Priority:** P0; **Milestone:** M3; **Assignee:** Huy
- **Phụ thuộc:** BE-32 (staff/driver, Done), BE-33 (lịch & khả dụng tài xế — Lạc, **chưa xong**), BE-14 (gán/đổi tài xế, `assignable-drivers`), FE-11 (shell, Anh), FE-FOUNDATION (DataTable, ImageUploader…), FE-02. Liên quan: FE-12 (Anh — danh mục phòng ban/cơ sở/vai trò), FE-23 (liên kết tài khoản).
- **Ranh giới với Anh (cần xác nhận):** FE-12 sở hữu `/admin/departments`, `/admin/facilities`, `/admin/roles`. **FE-24 sở hữu toàn bộ `/admin/staffs/**` và `/admin/drivers/**`** (Anh đang có `/admin/staffs` là bảng tĩnh — sẽ được thay).
- **Đặt vào repo FE:** `docs/specs/FE-24-admin-staff-drivers.md`.

## 1. Bối cảnh

`staffs` là hồ sơ mở rộng 1-1 từ `users`: `department_id`, `facility_id`, `hired_date`, `is_driver`, GPLX (`license_number`, `license_type`, `license_issue_date`, `license_expiry_date`, `license_img`), `rating`. Nhân viên có `is_driver = true` đồng thời là **tài xế** (không có bảng Driver riêng). Tài xế được gán cho đơn qua `vehicle_assignments` (BE-14): phải `is_active`, bằng còn hạn đến hết khoảng thuê, không trùng lịch (kể cả đệm 60 phút). BE-33 sẽ bổ sung ca làm/ngày nghỉ/khu vực — **UI phải chạy đúng cả khi chưa có BE-33** (ẩn phần liên quan, không chết).

Quyền (mặc định, đối chiếu `[Authorize]` thật): **Admin, Manager** quản lý hồ sơ/giấy phép/trạng thái; **Admin, Manager, Staff** xem lịch tài xế và gán tài xế cho đơn.

## 2. Route

| Route | Nội dung |
|---|---|
| `/admin/staffs` | Danh sách nhân viên (lọc phòng ban, chi nhánh, tài xế, hoạt động, bằng sắp hết hạn) |
| `/admin/staffs/detail?id=…` | Chi tiết: tab *Hồ sơ* · *Giấy phép* · *Lịch & chuyến* (chỉ tài xế) · *Hoạt động* |
| `/admin/staffs/new` | Tạo hồ sơ nhân viên (gắn vào user có sẵn hoặc tạo user mới nếu BE hỗ trợ) |
| `/admin/drivers/schedule` | Bảng lịch tài xế toàn hệ thống + gán/đổi tài xế |

## 3. Màn hình & hành vi

### 3.1 Danh sách nhân viên

* `FilterBar`: tìm (tên/email/số GPLX), phòng ban, chi nhánh, `isDriver`, `isActive`, **"Bằng sắp hết hạn (≤ 30 ngày)"**, **"Bằng đã hết hạn"**.
* Cột: *Nhân viên* (avatar+tên+email), *Phòng ban*, *Chi nhánh*, *Vai trò hệ thống*, *Tài xế* (icon), *Giấy phép* (`LicenseBadge`), *Điểm đánh giá* (nếu có), *Trạng thái*. Sắp xếp/phân trang phía server; skeleton/empty/error.
* `LicenseBadge` (A9): `Còn hạn` (success), `Sắp hết hạn ≤ 30 ngày` (warning + số ngày còn lại), `Đã hết hạn` (danger), `Chưa có` (neutral). Tính từ `license_expiry_date` so với ngày hiện tại **GMT+7** (`lib/time.ts`).
* Hành động: *Tạo nhân viên*, *Xem*, *Khóa/Mở hoạt động* (qua tài khoản user — liên kết FE-23 nếu BE không có endpoint riêng).

### 3.2 Chi tiết

* **Hồ sơ:** thông tin tài khoản liên kết (họ tên, email, điện thoại → liên kết FE-23), phòng ban, chi nhánh (select từ danh mục FE-12), ngày vào làm, cờ `is_driver` (bật cờ này đòi hỏi GPLX hợp lệ — cảnh báo, không tự chặn nếu BE cho phép), điểm đánh giá trung bình (đọc, từ BE-34 khi có).
* **Giấy phép** (chỉ hiện khi `is_driver` hoặc đã có dữ liệu): số GPLX, hạng, ngày cấp, ngày hết hạn, **ảnh GPLX** (`ImageUploader` Cloudinary có chữ ký — xem mục 5; xem lightbox; thay/xóa ảnh có xác nhận). Ràng buộc: ngày hết hạn > ngày cấp; hạng từ danh sách cho phép (lấy theo BE; **không hard-code bảng hạng bằng lái** — luật hạng đang thay đổi, câu hỏi O2); cảnh báo khi còn ≤ 30 ngày/đã hết hạn kèm hệ quả ("Tài xế không được gán đơn có khoảng thuê quá ngày hết hạn").
* **Lịch & chuyến** (tài xế; yêu cầu `GET /api/drivers/schedule`): lịch tuần/tháng của riêng tài xế: các khoảng đang `assigned` (kèm đệm 60 phút làm vùng nhạt), mỗi khoảng là liên kết tới chi tiết đơn (route vận hành của Trí/FE-15; chưa có thì hiển thị mã đơn không liên kết). Khi BE-33 có: hiển thị **ca làm/ngày nghỉ/khu vực** và form chỉnh (ẩn khi chưa có). Có bảng văn bản thay thế cho lịch.
* **Hoạt động:** trạng thái hoạt động, lịch sử chuyến gần đây (nếu BE có), nhật ký thay đổi hồ sơ (nếu có).
* Lưu thay đổi theo từng tab (RHF + Zod); cảnh báo rời trang khi có thay đổi chưa lưu (`beforeunload` + chặn điều hướng nội bộ).

### 3.3 Tạo nhân viên

Hai chế độ theo BE-32 (xác nhận qua snapshot): (a) chọn **tài khoản có sẵn** chưa có hồ sơ staff (`Combobox` tìm user, loại user đã có hồ sơ staff — ràng buộc `staffs.user_id` duy nhất; lỗi trùng hiển thị thân thiện), (b) tạo mới user + hồ sơ nếu BE có. Trường: phòng ban, chi nhánh, ngày vào làm, `is_driver`, giấy phép (nếu tài xế). Sau tạo → trang chi tiết. Không tự cấp vai trò hệ thống (làm ở FE-23).

### 3.4 Bảng lịch tài xế `/admin/drivers/schedule`

* **Điều phối `/admin/dispatch` (2026-10-22):** có danh sách tài xế đang hoạt động riêng, tải đủ các trang `GET /api/staff/drivers`, không phụ thuộc tài xế đã có ca/chuyến. Hiển thị email, tên, cơ sở và số ca chưa hủy trong khoảng đang xem; thiếu ca ghi rõ "Chưa có ca trong khoảng đang xem". Phân trang 10 tài xế, áp dụng/đặt lại bộ lọc tài xế. Thao tác "Xếp ca" mở form đã chọn đúng tài xế; không tự tạo ca khi tạo hồ sơ/cấp vai trò Driver. Bảng ca và chuyến chỉ hiện dữ liệu đã lưu. Có skeleton, lỗi đọc/tải lại riêng; lỗi ca không được báo là chưa có ca. Danh sách được làm mới sau cập nhật hồ sơ/GPLX hoặc vai trò/trạng thái tài khoản và có nút cập nhật thủ công.

* Bộ chọn khoảng (tuần hiện tại mặc định, ←/→, hôm nay), lọc chi nhánh, tài xế, trạng thái (`assigned`, kèm lịch sử nếu BE có). Dữ liệu từ `GET /api/drivers/schedule?from&to&driverStaffId` (UTC).
* **Bố cục:** hàng = tài xế, cột = ngày (desktop; mobile chuyển sang danh sách nhóm theo ngày). Mỗi khoảng là khối có chữ (mã đơn, giờ GMT+7, xe) + vùng đệm nhạt; **không** chỉ phân biệt bằng màu (viền nét/họa tiết cho `reassigned`/cảnh báo). Tài xế có bằng hết hạn trong tuần hiển thị biểu tượng cảnh báo. Có bảng "Xem dạng danh sách" thay thế cho trình đọc màn hình.
* **Gán/đổi tài xế:** từ khối đơn hoặc mục "Đơn cần tài xế" (đơn `has_driver` đã qua pre-inspection nhưng chưa có `assigned`): mở `Drawer` → `GET /api/rentals/{id}/assignable-drivers` → danh sách tài xế **hợp lệ trước** (kèm điểm, hạn bằng) và tài xế **không hợp lệ kèm lý do** (`BUSY`, `LICENSE_EXPIRING`, `INACTIVE`…, mô tả tiếng Việt) → chọn + lý do (`driver_unavailable|driver_request|customer_request|other`) + ghi chú → `POST /api/rentals/{id}/assignments/driver` → làm mới lịch. Lỗi `DRIVER_BUSY`/`DRIVER_NOT_ELIGIBLE` → hiển thị lý do và tải lại danh sách; `ILLEGAL_RENTAL_STATE`/`PRE_INSPECTION_REQUIRED` → thông báo đúng điều kiện.
* **Không** làm kéo-thả đổi lịch trong phiên bản này (tránh thao tác mơ hồ); mọi thay đổi qua `Drawer` có xác nhận.
* Quyền: Staff xem và gán; Admin/Manager thêm quản lý hồ sơ. Khi chưa có endpoint `assignable-drivers` (BE-14 chưa merge) → mock; ghi open-questions.

## 4. Dữ liệu & kiểu

```ts
export type StaffListItem = { id: number; userId: number; fullName: string; email: string; avatarUrl?: string; department?: { id: number; name: string };
  facility?: { id: number; name: string }; isDriver: boolean; isActive: boolean; rating?: number; license?: LicenseInfo | null; roles?: string[] };
export type LicenseInfo = { number?: string; type?: string; issueDate?: string; expiryDate?: string; imgUrl?: string };
export type LicenseState = "valid" | "expiring" | "expired" | "missing"; // tính ở FE bằng nowGmt7(), ngưỡng 30 ngày (hằng số)
export type DriverScheduleItem = { assignmentId: number; rentalId: number; driverStaffId: number; vehicleId?: number; vehicleName?: string;
  start: string; end: string; bufferMinutes?: number; status: "assigned" | "reassigned" | "completed" | "cancelled" };
export type AssignableDriver = { staffId: number; fullName: string; avatarUrl?: string; rating?: number; licenseExpiry?: string;
  eligible: boolean; reasons: ("BUSY" | "LICENSE_EXPIRING" | "LICENSE_EXPIRED" | "INACTIVE" | "NOT_DRIVER" | string)[] };
```

* Hook: `useStaffs`, `useStaff`, `useCreateStaff`, `useUpdateStaff`, `useUpdateLicense`, `useDriverSchedule`, `useAssignableDrivers`, `useAssignDriver`.
* Mọi mốc giờ: UTC từ API → GMT+7 hiển thị (`lib/time.ts`); phép tính "còn bao nhiêu ngày hết hạn" theo **ngày** GMT+7 (không dùng mili-giây thô).
* Mock: kịch bản bằng còn hạn/sắp hết/hết hạn, tài xế bận, gán thành công, `DRIVER_BUSY` đua tranh, xóa/đổi ảnh GPLX.

## 5. Tải ảnh GPLX

`ImageUploader` dùng chữ ký upload Cloudinary do BE cấp (FE-29 của Phúc). Nếu chưa có: giao diện đầy đủ (chọn/kéo-thả, xem trước, tiến trình, hủy, lỗi) chạy với **mock**; giới hạn: ảnh JPG/PNG/WebP <= 5 MB, tối thiểu 800px cạnh dài; nén phía client trước khi tải; kiểm tra MIME bằng nội dung đầu tệp, không chỉ phần mở rộng. Ảnh GPLX là dữ liệu nhạy cảm: **không** đưa URL vào log, không cache công khai lâu dài, hiển thị cho vai trò được phép.

## 6. Truy cập & chuyển động

* Lịch/bảng: bản danh sách thay thế; thao tác chọn tài xế bằng bàn phím (listbox Radix); `LicenseBadge` có chữ; focus quay lại khối đơn sau khi đóng Drawer; thông báo kết quả `aria-live`.
* Motion admin tối thiểu (A9): Drawer 320ms, fade panel 160ms; không kéo-thả, không loop.
* Panel `.glass-admin`, bảng/ô nhập Surface đặc.

## 7. Kiểm thử

* **Unit:** `licenseState` ở biên 30/31 ngày, đúng hôm hết hạn, quanh nửa đêm GMT+7; Zod giấy phép (hết hạn > cấp; hạng hợp lệ); ánh xạ lý do không hợp lệ → tiếng Việt; dựng lưới lịch từ danh sách khoảng (đệm, qua ngày).
* **Component (RTL + mock):** danh sách (lọc/URL/skeleton/empty/error); tạo nhân viên (user có sẵn, trùng hồ sơ); chi tiết từng tab; tải/đổi ảnh GPLX (giới hạn kích thước/MIME); lịch tài xế (tuần, đổi tuần, mobile danh sách); gán tài xế thành công; `DRIVER_BUSY` tải lại danh sách; chưa có BE-33 → phần liên quan ẩn; cảnh báo thay đổi chưa lưu.
* **Phân quyền:** Staff không vào `/admin/staffs` (chỉ `/admin/drivers/schedule`); Admin/Manager đủ.
* **A11y:** axe sạch; gán tài xế chỉ bằng bàn phím.

## 8. Acceptance criteria

- [ ] `/admin/staffs/**` và `/admin/drivers/**` là trang thật, thay trang tĩnh của Anh (đã thống nhất ranh giới)
- [ ] `LicenseBadge` đúng (30 ngày, GMT+7); lọc "sắp hết hạn/đã hết hạn"
- [ ] Hồ sơ/giấy phép lưu được; ảnh GPLX qua `ImageUploader` (mock nếu chưa có BE) với giới hạn nêu trên
- [ ] Lịch tài xế (cá nhân + toàn hệ thống) có bản danh sách thay thế; gán/đổi tài xế dùng `assignable-drivers` và hiển thị lý do loại
- [ ] Chạy đúng khi chưa có BE-33 (phần ca làm/ngày nghỉ ẩn)
- [ ] Không kéo-thả; mọi thay đổi lịch qua Drawer có xác nhận
- [ ] Guard theo vai trò; thay đổi chưa lưu được cảnh báo
- [ ] Mock + hợp đồng đồng bộ snapshot; test, axe, `lint:design`, `build` xanh

## 9. Câu hỏi mở

* **O1.** Ranh giới FE-12 ↔ FE-24 với Anh (đề xuất: như đầu tài liệu).
* **O2.** Danh sách hạng GPLX hợp lệ theo luật hiện hành — lấy từ BE hay cấu hình? Không hard-code.
* **O3.** BE-32 cho phép tạo user mới cùng lúc với hồ sơ staff không?
* **O4.** Có hiển thị lịch sử `reassigned` trên bảng lịch (mặc định ẩn)?

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js, scheduling UI, accessibility). Hiện thực FE-24 theo ĐÚNG docs/specs/FE-24-admin-staff-drivers.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong; admin shell của Anh đã trong main; BE-14 đã merge hoặc mock đúng hợp đồng FR-014. Nhánh feat/fe-24-staff-drivers.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/ — static export, query-string route); DESIGN.md A6, A9, A10, B.§37, §41; FE-FOUNDATION; docs/api/contract-snapshot.md (staffs, drivers/schedule, assignable-drivers, assignments/driver, departments, facilities, upload signature); ../Car-Rental-System-BE/specs/FR-008, FR-014 và changes/2026-09-30-staff-driver-management.md, changes/2026-10-02-driver-scheduling-assignment.md; src/features/admin/** (trang /admin/staffs tĩnh của Anh), shared components (F3), lib/time.ts.

BƯỚC 0 (không code): liệt kê endpoint THẬT/thiếu (tạo staff, cập nhật giấy phép, upload chữ ký Cloudinary, schedule, assignable-drivers, ca làm/ngày nghỉ BE-33), các trường DTO staff thực tế. Xác nhận với tôi ranh giới FE-12/FE-24 (thông báo Anh) trước khi thay /admin/staffs.

LÀM: (1) kiểu + adapter + mock + hooks có test; licenseState + test biên; (2) /admin/staffs danh sách; (3) /admin/staffs/detail đủ tab; (4) /admin/staffs/new; (5) ImageUploader (mock nếu chưa có BE) theo mục 5; (6) /admin/drivers/schedule (bảng + danh sách thay thế + Drawer gán tài xế); (7) guard + menu; (8) test + axe.

RÀNG BUỘC: không hard-code bảng hạng GPLX; không kéo-thả; không bịa endpoint (thiếu → mock đúng hợp đồng đề xuất + ghi docs/open-questions.md); ảnh GPLX là dữ liệu nhạy cảm (không log URL); mốc giờ chỉ qua lib/time.ts; phần BE-33 ẩn khi chưa có; chuỗi tiếng Việt; không emoji/gradient/Inter; panel .glass-admin, bảng/ô nhập Surface đặc.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp ở 375/1280 (từng tab/trạng thái); axe; gán tài xế chỉ bằng bàn phím; kiểm tra phân quyền.

BÁO CÁO: file đổi, kết quả lệnh, endpoint thiếu, điểm cần Anh (FE-12), Lạc (BE-32/33), Phúc (upload) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
