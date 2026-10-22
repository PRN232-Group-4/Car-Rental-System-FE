# Xe customer và kiểm tra trước thuê theo hình thức lái

Đơn cancelled hiển thị trực tiếp Lý do hủy đơn và thời gian hủy. Admin đọc `/rentals/{id}/detail` để lấy rental.cancelReason/cancelledAt, dự phòng bằng sự kiện cancelled trong history; không đọc lý do từ flat DTO vốn không chứa trường này. Customer dùng sự kiện cancelled trong timeline ở cả `/my-rentals` và chi tiết account trips. Không lấy lý do từ sự kiện trạng thái khác. Đơn cũ thiếu lý do hiển thị chưa ghi nhận; lỗi tải hiển thị retry, không giả là không có lý do.

Đơn cancelled/completed không có form/nút lưu phân xe và tài xế hoặc ghi đè trạng thái. Điều kiện phân xe khớp backend (pre_inspection/renting), áp dụng cả render, tải danh sách tài xế và hàm gửi. Shared transition guard chặn đổi trạng thái từ đơn đã kết thúc. Lịch sử phân công kỹ thuật và liên kết biên bản vẫn đọc được.

Cập nhật customer: `/my-rentals` có nút Hủy đơn thuê ở cả danh sách và chi tiết khi pending/pre_inspection. Dialog tải preview từ server và hiển thị đúng phí hủy/số tiền hoàn; chưa tải được hoặc không được phép thì khóa gửi, có retry. POST cancel dùng initiator=customer, waiveFee=false, giữ lý do/dialog nếu lỗi. Admin giữ nút hủy trước renting. Lỗi 404 thiếu endpoint checked hiển thị rõ backend chưa triển khai API mới, không thay bằng API ghi kiểm tra kỹ thuật giả.

`/account/trips` và `/account/trips/detail` dùng cùng dialog hủy có preview; nút hủy hiện trước renting, bao gồm pre_inspection có canCancel cũ=false. Preview và POST vẫn do backend xác định quyền/phí hiện hành, không tự mở khóa gửi khi server từ chối.

Cập nhật nút theo yêu cầu: **Đã inspect** đặt ngay dưới **Lưu phân công kiểm tra** trong khối kỹ thuật viên. Admin dùng kỹ thuật viên đã phân công/đang chọn để mở xác nhận kiểm tra đạt. Nút hiện khi đơn pending/pre_inspection chưa đạt kiểm tra, kể cả đơn có tài xế cũ chưa có kết quả mặc định; vẫn chặn ghi đè evidence theo backend.

Nút **Hủy đơn thuê** hiện trực tiếp trong bảng lệnh cho pending/pre_inspection. Từ renting trở đi không hiển thị nút hoặc lựa chọn hủy ở ghi đè; guard phía client và backend vẫn kiểm tra lại. Dialog dùng FormDialog, yêu cầu lý do không rỗng và gọi POST `/rentals/{id}/cancel` với waiveFee=false để áp dụng chính sách server, không dùng đổi status trực tiếp. API lỗi giữ lý do/dialog; chỉ đóng và tải lại đơn/hàng đợi/hóa đơn sau thành công.

Yêu cầu người dùng 2026-10-22 thay thế việc cố định Có tài xế. Mặc định booking có tài xế, cho chọn tự lái; cả hourly/longterm gửi đúng lựa chọn. Dữ liệu danh sách customer dùng `/vehicles/search`, lọc xe đang thuê ở server trước phân trang, không cắt trang ở client. Admin vẫn có toàn bộ đội xe.

Thuê có tài xế không yêu cầu GPLX customer; tự lái cần GPLX approved/chưa hết hạn trước gửi. Lỗi hiển thị tại hasDriver và có đường cập nhật GPLX. Auth vẫn bắt buộc.

Readiness lấy từ backend. Đơn có tài xế được mặc định kiểm tra đạt; không giả phân công tài xế. Đơn tự lái có hai lựa chọn: phân công Maintenance rồi chờ kiểm tra, hoặc Admin chọn kỹ thuật viên và xác nhận đã phân công/kiểm tra. Chỉ Admin có nút xác nhận trực tiếp. POST checked lưu kết quả trước refresh; lỗi không thay trạng thái, giữ dữ liệu để sửa/thử lại. Kiểm tra đạt không tự bắt đầu chuyến; vẫn cần các điều kiện bàn giao do backend xác minh.

Directory hiển thị confirmationSource driver_default/admin_confirmation và confirmedBy để phân biệt với kiểm tra kỹ thuật. Kiểm tra sau trả và thanh toán phí quá hạn không thay đổi.
