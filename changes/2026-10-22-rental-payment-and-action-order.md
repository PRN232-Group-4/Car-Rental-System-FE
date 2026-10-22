# Thanh toán trong workspace và thứ tự xác nhận/inspect

Workspace chưa gắn CashReceiptPanel nên Admin không có nút thu tiền trước bàn giao, dù backend yêu cầu direct rental phải thanh toán đủ. Nay bảng lệnh có Thanh toán đơn thuê, đọc hóa đơn trực tiếp hoặc từ rental detail. Tiền mặt có nút Xác nhận đã thanh toán tiền mặt và dialog thực nhận đủ tiền, dùng API cash-confirmation hiện hữu, khóa gửi lặp và cập nhật dữ liệu từ server. Online chỉ đọc trạng thái PayOS, tự cập nhật mỗi 5 giây khi chưa paid và có nút cập nhật thủ công; không ghi nhận tiền online bằng thao tác đánh dấu. Không coi orderId là bằng chứng paid.

Bàn giao direct rental bị khóa khi invoice chưa paid, thiếu hoặc lỗi tải; có hướng dẫn tiếng Việt tại nút, guard cả thao tác chính lẫn ghi đè. Subscription không có hóa đơn, bỏ qua gate thanh toán. Lỗi tiếng Anh Direct rental must be paid before handover được dịch để xử lý cả thay đổi trạng thái trên server giữa hai request.

Theo yêu cầu mới, FE tách thứ tự: Xác nhận đơn thuê → pre_inspection → Đã inspect → hoàn tất thanh toán → Bàn giao xe. Pending chưa mở form/tải danh sách kỹ thuật viên; checked không còn gửi approveRequest=true. Backend giữ API cũ tương thích, không đổi nghiệp vụ tại đây. Đơn có tài xế giữ kết quả kiểm tra mặc định, vẫn phải duyệt và thanh toán trước bàn giao.

Phân công tài xế chỉ hiện/tải/gửi khi hasDriver=true và trạng thái phù hợp, cả V4 và form dùng chung. Tự lái không có form này. Không đổi phương thức lái bằng việc lưu phân công.

Kiểm chứng: 76 unit/integration và 27 Edge E2E liên quan đạt; có desktop, điện thoại và thu tiền ở bố cục 1024px, lỗi duyệt/inspect/thu tiền không tiến bước, online/tiền mặt/subscription, phân công đơn có tài xế và không phân công tự lái. TypeScript/design lint đạt; ESLint 0 lỗi, 7 warning cũ ở workspace. Chỉ sửa source FE, không triển khai backend hoặc giao dịch PayOS thật.
