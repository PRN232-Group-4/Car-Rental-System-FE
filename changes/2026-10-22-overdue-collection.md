# Quá hạn và thu phí sau trả xe

Admin workspace, danh sách và tra cứu dùng nhãn Quá hạn khi renting chưa trả và quá hạn, cập nhật theo đồng hồ; bộ lọc overdue gọi server trước phân trang. Không thay lifecycle mutation thành overdue. Chuẩn hóa timestamp UTC thiếu zone của API cũ khi so sánh hạn/giờ trả. Sau trả, panel nêu trả trễ và đọc settlement đã lưu.

Phần phí còn thiếu đọc invoice theo shortfallInvoiceId, hiển thị số tiền/trạng thái và hai thao tác theo cờ server: xác nhận thực nhận đủ tiền mặt qua popup hoặc tạo link PayOS. Khóa gửi lặp, giữ form/lỗi khi thất bại, refetch cả khi provider lỗi để tránh đề nghị cash từ cờ cũ. Link HTTPS mở tab riêng, không tự ghi paid khi tạo link; polling/refresh đọc trạng thái đã được backend xác minh. Paid ẩn thao tác thu thêm. User thiếu quyền không fetch invoice; API cũ không có cờ thì không bật nút. Bỏ câu đã tất toán ở completed vì còn có thể thiếu phụ phí.

Kiểm chứng: 60 unit/integration tests FE và 15 Edge E2E (desktop/mobile) đạt, gồm cash/online/error/retry/chờ webhook, thiếu invoice/không còn hóa đơn phần thiếu, overdue filter và regression nhận trả xe/quyết toán. TypeScript/design lint đạt; ESLint file liên quan 0 lỗi, 7 warning cũ ở workspace. Backend 109 tests liên quan đạt. Chưa deploy/chưa thử thanh toán PayOS tiền thật; cần backend source mới cùng schema hiện hữu để nút thu phí hoạt động.
