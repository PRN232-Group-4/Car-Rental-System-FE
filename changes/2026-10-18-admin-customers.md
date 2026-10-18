# Khách hàng trong cổng quản trị

- Thêm mục Khách hàng cho Admin, Manager và CustomerService, khớp quyền API danh sách khách hàng.
- Hiển thị toàn bộ tài khoản qua phân trang, gồm khách hàng đã ngừng hoạt động; có tìm tên/email/điện thoại, lọc trạng thái tài khoản và GPLX.
- Bộ lọc GPLX chờ phê duyệt gửi `licenseStatus=pending` đến API để lọc trước phân trang; khách chưa cập nhật GPLX dùng trạng thái `none`.
- Dùng bộ lọc, bảng, badge và skeleton Admin chung; áp dụng/đặt lại bộ lọc luôn về trang đầu. API lỗi có thể thử lại.
- Kiểm thử: 5/5 ca `e2e/admin-customers.spec.ts` đạt, bao phủ lọc khách chờ duyệt ở trang sau, tài khoản ngừng hoạt động, tìm kiếm, trạng thái trống/lỗi, đặt lại, lỗi API inline và bố cục desktop/mobile. TypeScript, ESLint tập trung, design lint và production build/static export đạt.
