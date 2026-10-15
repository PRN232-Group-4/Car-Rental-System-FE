# Kích hoạt/tạm ngưng chính sách thuê xe

Trang chính sách trước đây chỉ có xem/tạo nên không thể đặt lại trạng thái. Bổ sung nút icon ở cột Thao tác cho Admin/Manager: `CirclePlay` kích hoạt, `PauseCircle` tạm ngưng qua ánh xạ `AdminRowAction` dùng chung. Có tooltip/tên truy cập tiếng Việt, xác nhận trước gửi và khóa toàn bộ nút status trong lúc chờ. API lỗi giữ badge cũ, hiển thị lỗi chung và cho thử lại; thành công cập nhật bằng policy server trả về.

Gọi `PATCH /api/rental-policies/{id}/status` với `{ "isActive": true/false }`. Backend đã bổ sung endpoint tương ứng, giữ nguyên điều khoản và snapshot giá. Nhiều policy active vẫn ưu tiên bản mới nhất theo phạm vi; không tự tắt bản khác. Cập nhật banner, quy tắc icon, FE-14 và báo cáo API để phản ánh thay đổi.

ESLint các file sửa, TypeScript, design lint và build production đạt; 118 unit test đạt. Kiểm thử trình duyệt với API giả lập: 6 ca đạt gồm desktop/mobile, icon, xác nhận/hủy, gửi đúng ID/boolean, pending, lỗi/thử lại và regression tạo chính sách. Kiểm tra SQL PostgreSQL còn cần test database hợp lệ. Cần triển khai cả backend và frontend để dùng trên môi trường đang chạy; không deploy hoặc ghi dữ liệu production trong đợt này.
