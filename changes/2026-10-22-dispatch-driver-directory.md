# Tài xế chưa có ca vẫn hiện trong điều phối

Trang điều phối trước đây chỉ hiển thị ca đã tạo và chuyến đã phân công. Hồ sơ có vai trò Driver không tự có bản ghi ca làm nên không xuất hiện như một hàng trong hai bảng đó. API danh sách tài xế hiện có đã lọc theo vai trò Driver; không cần sửa backend hay tự tạo ca.

Thêm danh sách tài xế đang hoạt động từ toàn bộ trang `/staff/drivers`, phân trang hiển thị 10 người, gồm email/tên/cơ sở và số ca chưa hủy trong khoảng đang xem. Tài xế chưa có ca được ghi rõ; lỗi tải ca có thông báo riêng. Xếp ca từ hàng tài xế mở form chọn sẵn đúng người, giữ validation và API lưu ca hiện hữu. Lọc/đặt lại áp dụng cho danh sách; có cập nhật thủ công và invalidation sau thay đổi hồ sơ/GPLX, vai trò hoặc trạng thái tài khoản.

Kiểm chứng: 21 unit API tests, 6 Edge E2E trên 1440px/390px với API giả lập (tài xế ở trang API thứ hai, chưa có ca, xếp ca/validation, lọc/đặt lại, lỗi danh sách và tải lại, lỗi ca) đạt. TypeScript/design lint/ESLint các file liên quan đạt. Chưa kiểm thử dữ liệu tài khoản thật, chưa deploy.
