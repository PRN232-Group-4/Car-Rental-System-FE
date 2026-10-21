# FE-03 — Đổi mật khẩu bằng OTP

## Luồng

Form dùng chung tại `/profile`, `/admin/profile` và `/staff/profile`. Nhập mật khẩu hiện tại để gọi `POST /api/account/password/otp`; email nhận mã lấy từ tài khoản đăng nhập. Khi API gửi mã thành công mới mở các trường OTP, mật khẩu mới và xác nhận. Gọi `POST /api/account/password` với `{currentPassword, otp, newPassword}`; sau thành công xóa dữ liệu mật khẩu, đăng xuất và chuyển `/login`.

OTP 6 số; mật khẩu mới 6–20 ký tự, không trim/cắt. Gửi lại có cooldown 60 giây theo mặc định backend. Server quyết định TTL/cooldown/khóa mã. Lỗi API map từ `error.errors` PascalCase/camelCase; lỗi mạng ở vùng chung; giữ dữ liệu khi lỗi. Các trường readonly khi đang gửi để vẫn focus được trường lỗi backend; khóa gửi lặp.

## Acceptance

- [x] Không gọi đổi mật khẩu ở bước gửi OTP; không cho client chọn email nhận.
- [x] Validate các trường trước gửi, hiển thị tất cả lỗi inline và focus trường lỗi đầu tiên.
- [x] OTP sai giữ dữ liệu, lỗi đúng trường; gửi lại xóa OTP đã nhập và khóa khi cooldown.
- [x] Thành công yêu cầu đăng nhập lại, thông báo toast rõ ràng.
- [x] Giao diện desktop/mobile không tràn ngang; E2E Chrome kiểm tra cả customer/admin dùng API giả lập.

## Kiểm chứng

630 unit test toàn FE đạt; 2 E2E desktop/mobile đạt; typecheck, ESLint các file thay đổi, design lint và production static export đạt. Chưa gửi email thật/chưa deploy.
