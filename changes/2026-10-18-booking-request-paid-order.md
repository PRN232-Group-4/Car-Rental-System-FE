# Yêu cầu đặt xe và đơn thuê chính thức

- Thuê trực tiếp chọn PayOS/tiền mặt khi gửi yêu cầu. Kết quả hiển thị mã yêu cầu, chờ staff duyệt; đọc hóa đơn đã tạo thay vì gọi API tạo hóa đơn dành cho staff.
- Hóa đơn đọc canPay từ server, chặn checkout trước duyệt/sau hủy, hiển thị tiền mặt chờ staff xác nhận thu. Thăm dò lại trạng thái và hiển thị mã order riêng sau khi server phát hành. Giá/VAT dùng số liệu hóa đơn, bỏ cọc/VAT hardcode.
- Staff duyệt qua endpoint confirm; panel thanh toán cho phép xác nhận đã thực nhận đủ tiền mặt với hộp thoại số tiền, khóa gửi lặp và refresh invoice/rental/order. Phân quyền được kiểm tra ở backend.
- Trang kết quả PayOS chỉ báo thành công sau khi server xác nhận paid và có orderId, không dựa status=PAID trên URL. Thông báo chờ chuẩn bị/kiểm định/bàn giao sau khi có đơn.
- Kiểm chứng: 126 unit test và 24 Playwright booking/GPLX/cơ sở/payment đạt (API giả), gồm duyệt trước pay, cash dialog cancel/confirm, cập nhật order và URL PAID giả. TypeScript, ESLint tập trung, design lint, production build/static export đạt. Chưa tạo giao dịch thật hoặc deploy; backend cần migration 0021 tương ứng.
