# Admin: ảnh tài khoản, tên xe bảo trì và style danh sách

- Hiển thị ảnh đại diện tài khoản tại header, sidebar và hồ sơ nhân viên; dùng chữ viết tắt khi ảnh trống hoặc không tải được. Cập nhật hồ sơ làm mới thông tin tài khoản trong giao diện.
- Logo sidebar dùng ảnh thương hiệu hiện có tại `/assets/logo.jpg`.
- Cột Xe của phiếu bảo trì hiển thị hãng và mẫu xe, kèm biển số nếu có. Các phiếu cùng xe dùng chung cache; lỗi tải tên xe không chặn danh sách và có nút thử lại.
- Dùng `AdminTableCard`, `AdminTable` và `AdminTableEmptyRow` để thống nhất bảng phương tiện, danh mục, tổ chức, nhân viên, vai trò, bảo trì, ca làm và lịch chuyến: nền/viền, header, khoảng cách ô, hover, cột thao tác và trạng thái trống.
- Kiểm thử trình duyệt dùng API giả lập: ảnh desktop/mobile/hồ sơ, ảnh lỗi, tên xe/cache/thử lại và so sánh computed style của các bảng với `/admin/vehicles`.
