# Xe customer và kiểm tra trước thuê theo hình thức lái

Mã hồ sơ: workspace và danh sách/chi tiết Admin hiển thị tách Mã yêu cầu (rental.id) và Mã đơn chính thức (orderId từ server). Sau thanh toán refetch cập nhật mã order, không lấy mã yêu cầu/hóa đơn thay thế; null ghi Chưa phát hành, field thiếu ghi Chưa có thông tin. Giữ nguyên điều kiện phát hành và phân quyền.

Sau trả xe: status post_inspection hiện phần kiểm tra sau trả tương tự trước thuê, phân công chờ kỹ thuật hoặc Admin xác nhận Đã inspect thực tế đạt. Dùng GET/PUT inspection-assignment và POST checked với inspectionType=post_rental, cache theo giai đoạn, không lấy phân công/evidence trước thuê hoặc mặc định có tài xế làm kết quả sau trả. Chỉ server hasPostInspection mở nút Hoàn tất, không tự complete sau checked. Biên bản đã có chỉ đọc, không ghi đè kể cả không đạt; trường hợp hư hỏng mở biên bản đầy đủ. Cần backend mới/migration 0029.

Cập nhật gọn bảng lệnh: workspace dùng compact inspection form, chọn Phân công chờ kiểm tra hoặc Đã inspect, chỉ một nút gửi theo lựa chọn; không lặp bước xác nhận inline. Mode inspect chỉ dùng khi thực tế đạt và đơn đã được xác nhận sang pre_inspection. Không lặp nút duyệt trong khối kỹ thuật; kết quả đã đạt/history thu gọn. Phân xe/tài xế chỉ hiện khi hasDriver=true và status pre_inspection/renting; tự lái không tải danh sách tài xế và không có form này. Một thao tác chính theo status: Xác nhận đơn thuê, Bàn giao xe, Đã trả xe, Hoàn tất; nhãn truy cập giữ mô tả đầy đủ. Primary nằm trong luồng cuộn trang, panel trả xe có link cuộn tới nút; trước renting nêu rõ cần bàn giao trước nhận trả.

Cập nhật theo yêu cầu mới: Xác nhận đơn thuê qua POST confirm trước, refetch sang pre_inspection rồi mới tải kỹ thuật viên và mở thao tác Đã inspect. FE không gộp inspect với duyệt và không gửi approveRequest=true nữa; backend giữ contract tùy chọn để tương thích. Pending đã có pass (dữ liệu cũ/driver_default/kiểm tra kỹ thuật) vẫn cần xác nhận đơn, không ghi lại evidence. Driver_default không tự duyệt hoặc bắt đầu thuê. Sau thành công làm mới detail/hàng đợi/count; lỗi giữ trạng thái và dữ liệu nhập.

Thanh toán hiện trực tiếp trong bảng lệnh trước bàn giao. Direct rental phải có invoice.status=paid; thiếu/lỗi hóa đơn giữ khóa bàn giao và chỉ rõ cách cập nhật. Tiền mặt dùng dialog xác nhận thực nhận đủ tiền, POST cash-confirmation, khóa gửi lặp và refetch invoice trước hiện paid. Online không có nút đánh dấu thủ công, đọc trạng thái từ server/PayOS qua polling và nút cập nhật. Subscription không có hóa đơn và không bị chặn thanh toán.

Đơn cancelled hiển thị trực tiếp Lý do hủy đơn và thời gian hủy. Admin đọc `/rentals/{id}/detail` để lấy rental.cancelReason/cancelledAt, dự phòng bằng sự kiện cancelled trong history; không đọc lý do từ flat DTO vốn không chứa trường này. Customer dùng sự kiện cancelled trong timeline ở cả `/my-rentals` và chi tiết account trips. Không lấy lý do từ sự kiện trạng thái khác. Đơn cũ thiếu lý do hiển thị chưa ghi nhận; lỗi tải hiển thị retry, không giả là không có lý do.

Đơn cancelled/completed không có form/nút lưu phân xe và tài xế hoặc ghi đè trạng thái. Điều kiện phân xe khớp backend (pre_inspection/renting), áp dụng cả render, tải danh sách tài xế và hàm gửi. Shared transition guard chặn đổi trạng thái từ đơn đã kết thúc. Lịch sử phân công kỹ thuật và liên kết biên bản vẫn đọc được.

Cập nhật customer: `/my-rentals` có nút Hủy đơn thuê ở cả danh sách và chi tiết khi pending/pre_inspection. Dialog tải preview từ server và hiển thị đúng phí hủy/số tiền hoàn; chưa tải được hoặc không được phép thì khóa gửi, có retry. POST cancel dùng initiator=customer, waiveFee=false, giữ lý do/dialog nếu lỗi. Admin giữ nút hủy trước renting. Lỗi 404 thiếu endpoint checked hiển thị rõ backend chưa triển khai API mới, không thay bằng API ghi kiểm tra kỹ thuật giả.

`/account/trips` và `/account/trips/detail` dùng cùng dialog hủy có preview; nút hủy hiện trước renting, bao gồm pre_inspection có canCancel cũ=false. Preview và POST vẫn do backend xác định quyền/phí hiện hành, không tự mở khóa gửi khi server từ chối.

Cập nhật nút theo yêu cầu: **Đã inspect** thuộc khối kỹ thuật viên. Admin dùng kỹ thuật viên đã phân công/đang chọn để xác nhận kiểm tra đạt. Chỉ mở thao tác khi đơn pre_inspection chưa đạt kiểm tra, kể cả đơn có tài xế cũ chưa có kết quả mặc định; vẫn chặn ghi đè evidence theo backend.

Nút **Hủy đơn thuê** hiện trực tiếp trong bảng lệnh cho pending/pre_inspection. Từ renting trở đi không hiển thị nút hoặc lựa chọn hủy ở ghi đè; guard phía client và backend vẫn kiểm tra lại. Dialog dùng FormDialog, yêu cầu lý do không rỗng và gọi POST `/rentals/{id}/cancel` với waiveFee=false để áp dụng chính sách server, không dùng đổi status trực tiếp. API lỗi giữ lý do/dialog; chỉ đóng và tải lại đơn/hàng đợi/hóa đơn sau thành công.

Yêu cầu người dùng 2026-10-22 thay thế việc cố định Có tài xế. Mặc định booking có tài xế, cho chọn tự lái; cả hourly/longterm gửi đúng lựa chọn. Dữ liệu danh sách customer dùng `/vehicles/search`, lọc xe đang thuê ở server trước phân trang, không cắt trang ở client. Admin vẫn có toàn bộ đội xe.

Thuê có tài xế không yêu cầu GPLX customer; tự lái cần GPLX approved/chưa hết hạn trước gửi. Lỗi hiển thị tại hasDriver và có đường cập nhật GPLX. Auth vẫn bắt buộc.

Readiness lấy từ backend. Đơn có tài xế được mặc định kiểm tra đạt; không giả phân công tài xế. Đơn tự lái có hai lựa chọn: phân công Maintenance rồi chờ kiểm tra, hoặc Admin chọn kỹ thuật viên và xác nhận đã phân công/kiểm tra. Chỉ Admin có nút xác nhận trực tiếp. POST checked lưu kết quả trước refresh; lỗi không thay trạng thái, giữ dữ liệu để sửa/thử lại. Kiểm tra đạt không tự bắt đầu chuyến; vẫn cần các điều kiện bàn giao do backend xác minh.

Directory hiển thị confirmationSource driver_default/admin_confirmation và confirmedBy để phân biệt với kiểm tra kỹ thuật. Kiểm tra sau trả và thanh toán phí quá hạn không thay đổi.
