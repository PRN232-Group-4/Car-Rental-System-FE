# Cấu hình hạng bằng và hiển thị phương tiện

- Phương tiện chưa chọn hạng bằng được thể hiện rõ là chưa cấu hình, đang ẩn khỏi danh sách tìm xe cho khách.
- Bỏ mô tả mảng rỗng là chấp nhận mọi hạng để khớp yêu cầu mới. Giữ mảng rỗng trong request để Admin có thể lưu hồ sơ đang chuẩn bị cấu hình.
- Việc ẩn danh sách được áp dụng trong backend search trước khi đếm tổng và phân trang; giao diện Admin và lịch sử thuê không bị loại xe.
- Cập nhật kiểm thử VehicleForm cho trạng thái chưa cấu hình và đặt lại lựa chọn.
