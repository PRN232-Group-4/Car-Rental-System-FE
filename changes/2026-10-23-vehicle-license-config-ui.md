# Cấu hình hạng bằng lái theo phương tiện

- Thay ô nhập hạng bằng bằng 25 lựa chọn checkbox, gồm các hạng đang dùng và các hạng cũ; vùng chọn tự xuống hàng trên màn hình nhỏ.
- Hiện card của các hạng đã chọn phía dưới, cập nhật ngay khi chọn hoặc bỏ chọn.
- Làm rõ chế độ chấp nhận mọi hạng hợp lệ khi cấu hình rỗng; vẫn yêu cầu GPLX được duyệt và còn hạn đến hết chuyến. Không suy diễn tương đương giữa các hạng.
- Giữ các hạng riêng đang có trong dữ liệu qua trường bổ sung, chuẩn hóa chữ hoa và bỏ trùng khi lưu; giữ API và giới hạn 30 hạng.
- Giữ lỗi inline và liên kết aria ở nhóm chọn/trường bổ sung; khóa chỉnh sửa trong khi lưu hoặc upload.

Kiểm chứng: `VehicleForm.test.tsx` kiểm tra nạp/chọn/lưu hạng, card bằng lái, cấu hình không giới hạn, dữ liệu riêng, lỗi đầu vào và lỗi backend; ESLint các file liên quan.
