# Kiểm tra sau trả xe tương tự trước thuê

Workspace và trang biên bản dùng cùng TechnicianAssignmentForm theo giai đoạn: sau nhận xe chuyển sang sau trả, đọc phân công riêng, chọn kỹ thuật viên và chế độ phân công chờ kỹ thuật hoặc Đã inspect cho Admin. Manager chỉ phân công. Hoàn tất vẫn khóa đến khi hasPostInspection từ server, không tự complete khi inspect thành công. Đơn có tài xế cũng cần kiểm tra sau trả, không lấy pass mặc định trước thuê làm kết quả sau trả.

API dùng query inspectionType=post_rental, cache/key theo giai đoạn để không lấy nhầm phân công/kết quả trước thuê. Sau lưu refresh đơn/hàng đợi/count/directory, lỗi giữ lựa chọn/trạng thái. Biên bản đã tồn tại chỉ đọc (kể cả không đạt); hướng dẫn mở biên bản đầy đủ khi có hư hỏng, không tạo số đo/ảnh giả.

Kiểm chứng: 70 unit/integration FE, 21 Edge E2E trước/sau thuê trên desktop/tablet/mobile và 54 backend tests liên quan đạt. TypeScript/design lint/ESLint đạt. Chưa deploy; cần backend mới và migration 0029. Xem thay đổi tương ứng trong BE.
