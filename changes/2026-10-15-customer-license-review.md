# Duyệt GPLX khách hàng trên Admin

- Thêm `/admin/vehicle-license`, menu Duyệt giấy phép lái xe ngay dưới Quản lý bảo trì; dành cho Admin, Manager và CustomerService, backend tiếp tục kiểm tra quyền.
- Lấy toàn bộ các trang của GET `/api/customers` với Search/Page/PageSize. Lọc trạng thái GPLX phía FE vì API danh sách chưa có tham số này; phân trang bảng không làm mất hồ sơ từ các trang backend khác.
- Popup dùng GET `/api/customers/{customerId}` để xem thông tin, ngày cấp/hết hạn, ảnh gốc và trạng thái. Xác nhận rồi PUT `/api/customers/{customerId}/license-status` với `status`. Không gửi userId thay customerId.
- Dùng AdminFilterBar/AdminTable/AdminRowAction, FormDialog/Footer, badge và Skeleton chung. Không sửa cấu trúc shell, theme hoặc API khác. Lỗi validation hiển thị tại trường, lỗi mạng giữ popup và dữ liệu, khóa gửi lặp/đóng khi đang lưu.
- Sau khi đồng bộ main, mục menu được khai báo tại `src/config/navigation.ts` và quyền route tại `src/features/auth/access.ts`; giữ nguyên StaffShell mới, không khôi phục bảng menu cũ từ stash.
