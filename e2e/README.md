# E2E Testing — Car Rental System FE

Thư mục này chứa toàn bộ các kịch bản kiểm thử luồng người dùng thực tế (End-to-End Test) sử dụng **[Playwright](https://playwright.dev/)**.

---

## 🚀 Các lệnh thực thi

```bash
# Chạy toàn bộ test E2E (chế độ dòng lệnh / headless)
npm run test:e2e

# Chạy test với giao diện Playwright UI (chế độ trực quan để quan sát và debug)
npm run test:e2e:ui

# Chạy riêng một file test cụ thể
npx playwright test e2e/smoke.spec.ts

# Xem báo cáo HTML chi tiết sau khi chạy test
npx playwright show-report
```

*Lưu ý: File cấu hình `playwright.config.ts` đã được thiết lập `webServer` để tự động khởi chạy `npm run dev` (tại `http://localhost:3000`) nếu chưa có server chạy trước đó.*

---

## 📂 Các kịch bản kiểm thử hiện tại

### 1. `smoke.spec.ts` (Smoke Tests)
- **Tải trang chủ**: Xác minh Header, thương hiệu `ThongDong.`, các liên kết menu (Thuê xe, Gói thuê bao), nút Đăng nhập và Footer.
- **Trang Gói thuê bao (`/subscriptions`)**: Xác minh tiêu đề chính và các nút xem gói cước.
- **Trang Đăng nhập (`/login`)**: Kiểm tra sự hiện diện của input email, password, nút đăng nhập và danh sách tài khoản mẫu.
- **Route Guard**: Đảm bảo người dùng chưa xác thực khi truy cập trực tiếp vào các route được bảo vệ (`/booking`, `/invoices`, v.v.) sẽ tự động bị điều hướng về `/login?next=...`.

### 2. `auth.spec.ts` (Xác thực & Form Đăng nhập)
- **Validation**: Kiểm tra thông báo lỗi khi mật khẩu nhập dưới 12 ký tự theo chuẩn an toàn.
- **Tài khoản mẫu (Demo Accounts)**: Kiểm tra tính năng tự động điền form khi bấm vào các tài khoản mẫu ("Khách hàng", "Quản trị viên").
- **Tương tác UI**: Kiểm tra nút toggle ẩn/hiện mật khẩu thay đổi đúng thuộc tính `type="password"` và `type="text"`.
