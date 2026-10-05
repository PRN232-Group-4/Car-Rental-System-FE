# FE-23 — Admin: quản lý người dùng

- **Priority:** P0; **Milestone:** M3; **Assignee:** Huy
- **Phụ thuộc:** BE-31 (admin quản lý tài khoản, Done — Lạc), FE-11 (shell, Anh), FE-FOUNDATION, FE-02. Tích hợp tùy chọn: BE-27 (điểm thưởng), BE-04 (thu hồi phiên theo email).
- **Đặt vào repo FE:** `docs/specs/FE-23-admin-users.md`.

## 1. Bối cảnh

Một `users` là tài khoản gốc; `staffs` và `customers` là hồ sơ mở rộng 1-1 (tối đa một mỗi loại); một user có thể có **nhiều vai trò** (`user_roles`). `users.is_active=false` chặn đăng nhập. Admin cần: tìm/lọc người dùng, xem hồ sơ, **gán/gỡ vai trò**, **khóa/mở khóa**, **thu hồi phiên**, kích hoạt đặt lại mật khẩu/xác minh email, xem nhật ký thay đổi — **nếu BE-31 cung cấp** (xác nhận từng chức năng bằng `contract-snapshot.md`; chức năng chưa có thì ẩn khỏi UI và ghi open-questions, không bịa endpoint).

Quyền mặc định: **Admin** toàn quyền; **Manager** chỉ đọc (giả định, đối chiếu `[Authorize]` thật).

## 2. Route

| Route | Nội dung |
|---|---|
| `/admin/users` | Danh sách, tìm kiếm, lọc |
| `/admin/users/detail?id=…` | Chi tiết tài khoản (tab: Tổng quan · Vai trò · Hồ sơ · Bảo mật · Nhật ký) |

Guard: `AuthGate allow={["Admin"]}` cho thao tác ghi; `Manager` vào được trang nhưng mọi nút ghi bị ẩn (theo `useSession` + 403 từ BE là lớp cuối).

## 3. Màn hình & hành vi

### 3.1 Danh sách

* `FilterBar` đồng bộ URL: ô tìm (email/họ tên/điện thoại, debounce 300ms), `role` (nhiều lựa chọn), `isActive` (Tất cả/Hoạt động/Đã khóa), `profile` (Có hồ sơ Staff/Customer/Không), khoảng ngày tạo (nếu BE hỗ trợ). Bộ lọc nào BE không hỗ trợ **không hiển thị**.
* `DataTable` phía server: cột *Người dùng* (avatar + họ tên + email), *Điện thoại*, *Vai trò* (chip nhiều giá trị, tối đa 3 + "+n"), *Hồ sơ* (icon Staff/Customer), *Trạng thái* (`Hoạt động`/`Đã khóa` kèm icon), *Tạo lúc* (GMT+7). Sắp xếp theo cột BE cho phép. Nhấn hàng → chi tiết. Hàng bị khóa mờ nhẹ + nhãn chữ.
* Trạng thái: skeleton 10 hàng; empty "Không có người dùng phù hợp" + "Xóa bộ lọc"; error + "Thử lại".
* Hành động nhanh theo hàng (menu `…`, chỉ Admin): *Khóa/Mở khóa*, *Thu hồi phiên*, *Xem chi tiết*. Có chọn nhiều hàng **không** làm hàng loạt trong phiên bản này (tránh thao tác nguy hiểm).

### 3.2 Chi tiết

* **Đầu trang:** avatar, họ tên, email, chip vai trò, badge trạng thái, nút hành động chính (*Khóa/Mở khóa*).
* **Tổng quan:** thông tin tài khoản (email, họ tên, giới tính, điện thoại, ngày tạo, lần đăng nhập gần nhất nếu BE có), xác minh email.
* **Vai trò:** danh sách vai trò hiện có + `Combobox` thêm vai trò + nút gỡ từng vai trò. **Bảo vệ an toàn (bắt buộc ở UI, BE vẫn là chốt):**
  * không cho gỡ vai trò `Admin` của **chính mình**; không cho tự khóa mình;
  * nếu gỡ vai trò/khóa tài khoản sẽ khiến hệ thống **không còn Admin hoạt động**, BE phải từ chối — UI hiển thị lỗi rõ ràng (`code` từ BE) và khuyến cáo trước khi gọi (nếu BE cung cấp số Admin còn lại);
  * mọi thay đổi vai trò qua `ConfirmDialog` có tóm tắt "Trước → Sau" và hậu quả ("Người này sẽ truy cập được /admin"); thay đổi có hiệu lực ở **request kế tiếp** của họ, phiên hiện tại của họ có thể cần làm mới — nhắc "Có thể cần thu hồi phiên để áp dụng ngay" kèm nút.
* **Hồ sơ:** thẻ *Hồ sơ khách hàng* (trạng thái GPLX: `pending/approved/rejected`, số GPLX, hạn, ảnh GPLX; điểm thưởng + liên kết "Xem lịch sử điểm" nếu BE-27 có `GET /api/customers/{id}/loyalty`; nút "Điều chỉnh điểm" chỉ Admin → dialog nhập số điểm ≠ 0 + lý do 5–255 ký tự + `idempotencyKey` sinh tự động) và thẻ *Hồ sơ nhân viên* (phòng ban, chi nhánh, `is_driver`, hạn bằng lái; liên kết sang `/admin/staffs/detail?id=` của FE-24). Duyệt GPLX khách: dùng endpoint BE-06 nếu có (xác nhận snapshot), ngược lại chỉ hiển thị.
* **Bảo mật:** *Thu hồi mọi phiên* (xác nhận), *Gửi lại email xác minh*, *Kích hoạt đặt lại mật khẩu* (chỉ khi BE-31 có; hành động gửi email cho người dùng — hộp thoại nêu rõ), *Khóa/Mở khóa* với **lý do bắt buộc** (nếu BE nhận) và hiển thị lý do/ai khóa/lúc nào (nếu BE trả).
* **Nhật ký:** `DataTable` các thay đổi (thời điểm GMT+7, người thực hiện, hành động, trước/sau) nếu BE-31 có audit; ngược lại tab ẩn.
* Không hiển thị `password_hash`, OTP, ticket phiên, hay bất kỳ bí mật nào dù BE có lỡ trả; adapter **loại** các khóa nhạy cảm đã biết.

## 4. Dữ liệu & kiểu

```ts
export type AdminUserListItem = { id: number; email: string; fullName: string; phone?: string; avatarUrl?: string;
  roles: string[]; isActive: boolean; hasStaffProfile: boolean; hasCustomerProfile: boolean; createdAt: string };
export type AdminUserDetail = AdminUserListItem & { gender?: string; emailVerified?: boolean; lastLoginAt?: string;
  customer?: { id: number; licenseStatus?: string; licenseNumber?: string; licenseExpiry?: string; licenseImgUrl?: string; loyaltyPoint?: number } | null;
  staff?: { id: number; department?: string; facility?: string; isDriver: boolean; licenseExpiry?: string } | null;
  lockInfo?: { reason?: string; by?: string; at?: string } | null };
```

* Hook: `useAdminUsers(params)`, `useAdminUser(id)`, `useSetUserActive`, `useAssignRole`, `useRemoveRole`, `useRevokeSessions`, `useResendVerification`, `useResetPassword`, `useUserAudit(id)`. Tên/route/body thật lấy từ snapshot; hàm nào BE chưa có → không tạo hook, ghi open-questions.
* Danh sách vai trò: từ `GET roles` nếu có, ngược lại hằng số `ROLES` của FE-02 (sai khác báo).
* Mock: các kịch bản — nhiều vai trò, khóa/mở khóa, gỡ vai trò Admin cuối cùng → 409 `LAST_ADMIN`, 403 cho Manager ghi.

## 5. Truy cập & chuyển động

* Bảng có `caption`, `aria-sort`; menu hành động Radix; `ConfirmDialog` bẫy focus; lỗi theo trường; chip vai trò không dùng màu làm tín hiệu duy nhất; tab theo WAI-ARIA.
* Motion tối thiểu theo A9; không loop.

## 6. Kiểm thử

* **Unit:** adapter loại khóa nhạy cảm; quy tắc bảo vệ tự thân (không tự khóa/gỡ Admin của mình); định dạng ngày GMT+7.
* **Component (RTL + mock):** danh sách (loading/empty/error, lọc, phân trang, sắp xếp, URL); chi tiết đầy đủ tab; gán/gỡ vai trò với `ConfirmDialog`; tự khóa bị chặn; `LAST_ADMIN` hiển thị đúng; Manager chỉ đọc (không thấy nút ghi); khóa với lý do bắt buộc; thu hồi phiên; điều chỉnh điểm (nếu BE-27 có); không hiển thị bí mật.
* **Phân quyền:** `Staff`/`Customer` vào `/admin/users` → `/forbidden`.
* **A11y:** axe sạch; đổi vai trò chỉ bằng bàn phím.

## 7. Acceptance criteria

- [ ] Danh sách có tìm/lọc/sắp xếp/phân trang phía server, trạng thái đầy đủ, đồng bộ URL
- [ ] Chi tiết: tổng quan, vai trò (gán/gỡ có xác nhận + bảo vệ tự thân), hồ sơ, bảo mật, nhật ký (nếu BE có)
- [ ] Khóa/mở khóa có lý do; thu hồi phiên; các hành động gửi email nêu rõ hậu quả
- [ ] Không hiển thị bí mật; adapter loại khóa nhạy cảm
- [ ] Chức năng BE chưa có bị ẩn (không nút chết) và ghi open-questions
- [ ] Manager chỉ đọc; guard Admin; menu theo vai trò
- [ ] Mock đồng bộ snapshot; test, axe, `lint:design`, `build` xanh

## 8. Câu hỏi mở

* **O1.** BE-31 có những chức năng nào thực sự (audit, reset mật khẩu, thu hồi phiên, duyệt GPLX)? — chốt qua snapshot.
* **O2.** Có cho Admin tạo tài khoản staff mới ở đây hay ở FE-24 (tạo staff gắn user)? Mặc định: tạo user + hồ sơ staff ở FE-24.
* **O3.** BE có bảo vệ "Admin cuối cùng" chưa? Nếu chưa, báo Lạc.

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js, admin UI, security-minded). Hiện thực FE-23 theo ĐÚNG docs/specs/FE-23-admin-users.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong; admin shell của Anh đã trong main. Nhánh feat/fe-23-admin-users.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/ — static export, query-string route); DESIGN.md A6, A9, A10, B.§37, §41; FE-FOUNDATION; docs/api/contract-snapshot.md (users admin, roles, sessions, GPLX duyệt, loyalty); ../Car-Rental-System-BE/specs/FR-005..FR-008 và changes/2026-09-30-account-basics.md; shared components (F3); src/features/auth (FE-02).

BƯỚC 0 (không code): liệt kê endpoint THẬT cho từng chức năng ở mục 3 (danh sách/lọc, chi tiết, gán/gỡ vai trò, khóa/mở khóa, thu hồi phiên, gửi xác minh, reset mật khẩu, audit, duyệt GPLX, loyalty) và chức năng nào chưa có; BE có chặn tự khóa/gỡ Admin cuối cùng chưa. Đưa tôi bản liệt kê.

LÀM: (1) kiểu + adapter (loại khóa nhạy cảm) + mock + hooks có test; (2) /admin/users danh sách; (3) /admin/users/detail với các tab (ẩn tab/nút khi BE chưa có); (4) bảo vệ tự thân + ConfirmDialog; (5) guard Admin/Manager chỉ đọc; (6) test + axe.

RÀNG BUỘC: không bịa endpoint; không bao giờ hiển thị/ghi log password_hash/OTP/token; không thao tác hàng loạt; mọi hành động ghi qua ConfirmDialog; UI ẩn nút chỉ là tiện ích, BE là chốt quyền; chuỗi tiếng Việt; không emoji/gradient/Inter; panel .glass-admin, ô nhập/thân bảng Surface đặc.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp ở 375/1280 (từng tab, trạng thái); axe; đổi vai trò bằng bàn phím; kiểm tra Manager/Staff.

BÁO CÁO: file đổi, kết quả lệnh, chức năng BE thiếu, điểm cần Lạc (BE-31), Anh (FE-11), Trí/Phúc xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
