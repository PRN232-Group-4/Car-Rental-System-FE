# Hiển thị lý do hủy đơn

Admin workspace trước đây đọc flat rental không có cancelReason nên chỉ hiện Đã hủy; customer có reason trong timeline nhưng bị ẩn trong lịch sử thu gọn.

Thêm khối Lý do hủy đơn/thời gian hủy trực tiếp trong Admin workspace, tra cứu Admin, Customer my-rentals và chi tiết account trips. Admin đọc nested detail có cancelReason/cancelledAt, dùng cancelled history nếu thiếu; Customer đọc cancelled timeline. Bản ghi cũ không có lý do hiển thị rõ chưa ghi nhận. Lỗi đọc có retry và không biến thành thông báo thiếu lý do. Không lấy lý do từ trạng thái khác, không tự tạo lý do cho đơn cũ, không thay đổi backend/migration.

Kiểm chứng: 29 unit/integration tests và 36 Edge E2E desktop/mobile đạt; gồm lý do đã lưu, dự phòng history, thiếu dữ liệu cũ, retry, hiển thị sau hủy và mở đơn cancelled. TypeScript/design lint/ESLint file mới và sửa liên quan đạt, diff-check sạch. Chưa deploy.
