# Backend local cũ chặn inspect sau trả

FE đang cấu hình BACKEND_ORIGIN=http://localhost:6789. Swagger runtime ở cổng này chỉ có parameter id cho checked và mô tả pre-rental, dù source đã hỗ trợ post_rental. Tiến trình chạy bin/Debug cũ từ dotnet run; phản hồi 409 INSPECTION_ASSIGNMENT_NOT_ALLOWED với thông báo chỉ phân công trước chuyến.

Đã kiểm tra bản Release mới ở cổng tạm 6790, khởi động với cấu hình Development hiện hữu và migration runner thành công, rồi thay đúng tiến trình backend dự án ở 6789. Cổng 6790 đã dừng, không thay địa chỉ FE hoặc triển khai Railway, không tự xác nhận biên bản hay đổi trạng thái đơn của người dùng.

FE nhận diện đúng thông báo legacy khi thao tác sau trả, hướng dẫn khởi động lại backend thay vì thông báo như lỗi nghiệp vụ trước thuê. Áp dụng cả phân công và checked; không che lỗi trạng thái thật của backend mới. Unit test giữ lựa chọn và không refresh/tiến trạng thái khi thất bại. 28 unit tests liên quan đạt; Swagger runtime xác minh GET/PUT/POST hỗ trợ inspectionType=post_rental.
