# Tiến trình thuê xe và loại thuê trong hàng đợi

- `/my-rentals?rentalId=...#rental-progress` bị lỗi vì `facility` từ API là object `{id,name,phone}`, nhưng FE khai báo string và render trực tiếp. Đồng bộ kiểu dữ liệu, hiển thị tên hoặc “Chưa có thông tin cơ sở”; sửa cả adapter chi tiết `/account/trips`.
- Thêm “Theo dõi tiến trình thuê xe” → `/my-rentals` vào menu tài khoản customer trên trang chủ (desktop/mobile) và trong Customer Desk. Giữ quyền Customer.
- Hàng đợi Admin trước đây mặc định mọi loại khác `hourly` thành dài hạn; API danh sách chưa có `rentalType`. Backend bổ sung trường từ dữ liệu thật; FE phân biệt giờ/dài hạn, hiện “Chưa rõ loại thuê” khi thiếu. Đơn đang chọn có thể lấy loại từ hồ sơ chi tiết để tương thích backend cũ.
- Test trình duyệt cũ dùng facility string nên bỏ sót crash; thay fixture bằng object đúng contract, tái hiện lỗi trước sửa. Kiểm tra object/null, link trực tiếp, cập nhật trạng thái, lỗi quyền và menu desktop/mobile. Thêm kiểm thử hàng đợi hỗn hợp giờ/dài hạn/thiếu loại.

Kiểm chứng: 9/9 Playwright customer, 1/1 Playwright Admin; 53/53 unit test liên quan; TypeScript và design lint đạt. ESLint không lỗi, 7 cảnh báo sẵn có trong RentalWorkspaceV4. API giả lập ở E2E; backend có kiểm thử SQL riêng. Chưa deploy; backend đang chạy cần khởi động lại để trả trường mới cho toàn bộ danh sách.
