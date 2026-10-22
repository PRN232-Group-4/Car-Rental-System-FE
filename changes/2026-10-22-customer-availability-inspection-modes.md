# Lọc xe customer và kiểm tra theo hình thức lái

Cập nhật theo ảnh người dùng: nút **Đã inspect** nằm ngay dưới nút lưu phân công, dùng được với kỹ thuật viên đã giao sẵn. Bỏ điều kiện ẩn theo hasDriver để Admin xử lý đơn có tài xế cũ chưa đạt kiểm tra; vẫn giữ quyền Admin, xác nhận trước gửi, lỗi inline và chỉ refresh readiness sau API thành công.

Danh sách xe trang chủ, danh mục, xe liên quan và booking dùng public search thống nhất, backend chỉ trả xe chưa được thuê. Admin giữ danh mục đầy đủ.

Booking mở lại lựa chọn Có tài xế/Tự lái, gửi đúng hasDriver cho cả hourly/longterm và giữ lựa chọn/giờ từ trang chi tiết xe. GPLX chỉ được kiểm tra khi chọn tự lái; thiếu/chưa duyệt/lỗi mạng hiển thị ngay tại trường, có retry/link cập nhật. Khách thuê có tài xế không bị chuyển sang GPLX. Tài xế vẫn hiện chưa phân công cho tới khi có nhân sự thật.

Admin hiện đã đạt kiểm tra trước thuê cho đơn có tài xế. Đơn tự lái có thể lưu phân công và chờ kỹ thuật, hoặc chọn kỹ thuật viên, bấm Đã phân công và kiểm tra, rồi xác nhận kiểm tra đạt. API lỗi giữ lựa chọn, không tự mở khóa bàn giao. Directory hiển thị nguồn hệ thống/Admin và người xác nhận. Manager chỉ được phân công, xác nhận trực tiếp là quyền Admin.

Kiểm chứng: 68 unit/component tests, 28 Edge E2E desktop/mobile, TypeScript, design lint và ESLint các file sửa đạt. Backend 244 tests liên quan đạt. Cần backend mới cùng migration 0028; chưa deploy.
