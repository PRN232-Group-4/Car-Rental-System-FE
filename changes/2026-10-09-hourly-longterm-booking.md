# Đặt xe theo giờ và thuê dài hạn — FE-05, FE-06

- Form đặt xe dùng API `rentals/hourly` và `rentals/longterm`, truy vấn xe khả dụng theo thời gian và áp dụng chính sách theo loại xe.
- Bỏ phí tài xế, VAT, tiền cọc và mã đơn/hóa đơn tự đặt. Giá cuối cùng và mã đơn lấy từ máy chủ. Giá dài hạn hiển thị theo tháng, số tiền chính thức do backend tính.
- Trang `/rental-contract?rentalId=...` đọc đơn thuê, mở tài liệu và ghi nhận hợp đồng đã ký bằng `PUT /api/rentals/{id}/contract`. API cung cấp khả năng ghi nhận, không cung cấp dịch vụ chữ ký điện tử.
- Modal trên trang chủ dẫn vào form đặt xe. Giữ lựa chọn xe/hình thức thuê khi chuyển qua đăng nhập.
- API thật qua `/api` là mặc định khi không có biến môi trường. Dùng `NEXT_PUBLIC_USE_MOCK=true` khi chủ động cần chế độ dữ liệu mẫu.
- Đọc lỗi ProblemDetails lồng trong envelope để hiển thị lỗi tại trường tương ứng.

Đã chạy thành công lint, typecheck, 63 unit test và production build. Bộ kiểm thử trình duyệt mới chưa chạy; theo yêu cầu người dùng dừng kiểm tra thêm để đưa code lên Git và deploy.
