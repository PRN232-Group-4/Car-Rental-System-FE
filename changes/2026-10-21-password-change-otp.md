# Đổi mật khẩu có OTP — 2026-10-21

Thêm `ChangePasswordForm` dùng chung trên hồ sơ customer/admin/staff. Bước đầu chỉ kiểm tra mật khẩu hiện tại và yêu cầu gửi OTP email; bước sau mới nhập OTP + mật khẩu mới + xác nhận và gọi API đổi mật khẩu. Backend bắt buộc OTP riêng cho đổi mật khẩu. Form có cooldown/gửi lại, kiểm tra 6 số và mật khẩu 6–20 ký tự, lỗi inline, focus lỗi backend, khóa gửi lặp; sau thành công đăng xuất và về login. Không lưu mật khẩu/OTP vào storage.

Đồng bộ hai endpoint và request schemas từ Swagger đã kiểm thử, sinh lại types. Playwright hỗ trợ `PLAYWRIGHT_BROWSER_CHANNEL=chrome` để dùng trình duyệt cài sẵn khi máy chưa có Chromium bundled.

Kiểm chứng: 630/630 unit test, 2 E2E Chrome desktop/mobile, typecheck, ESLint file thay đổi, design lint và static production build đạt. E2E xác minh không gọi đổi mật khẩu trước OTP, focus lỗi, giữ dữ liệu khi mã sai, thành công về login và không tràn ngang. API được giả lập, chưa gửi OTP thật/chưa deploy. Xem [spec](../docs/specs/FE-03-password-change-otp.md).
