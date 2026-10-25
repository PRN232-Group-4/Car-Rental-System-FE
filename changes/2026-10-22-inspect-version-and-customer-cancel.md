# Lỗi phiên bản API inspect và hủy đơn customer

Đã xác nhận read-only Swagger Railway thiếu POST inspection-assignment/checked trong khi FE gọi đúng route source mới. Thay Not Found chung bằng thông báo backend cần cập nhật API/migration 0028, giữ kỹ thuật viên và trạng thái chưa đạt, không dùng fallback ghi evidence giả.

Customer `/my-rentals` có nút Hủy đơn thuê ở danh sách lẫn chi tiết cho pending/pre_inspection. Dùng chung dialog với Admin nhưng customer phải tải preview; hiển thị phí/số hoàn từ server, khóa xác nhận nếu preview lỗi/không cho hủy. POST initiator=customer, waiveFee=false, yêu cầu lý do; lỗi giữ dữ liệu/dialog, thành công refresh các cache customer/trip/invoice. Admin giữ nút hủy và guard trước renting.

Cần deploy backend mới để route inspect và quyền customer hủy ở pre_inspection hoạt động trên Railway. Source FE không thể bổ sung route còn thiếu vào backend đang triển khai. Chưa deploy.

Kiểm chứng: 53 unit/integration, 38 Edge E2E desktop/mobile, TypeScript/design lint/ESLint các file sửa đạt. Backend 148 tests liên quan đạt trên PostgreSQL riêng. Browser tests giả lập API, không hủy đơn/ghi inspect thật trên Railway; kiểm tra môi trường thật chỉ đọc Swagger và một GET không đăng nhập (401).

Tiếp tục theo yêu cầu chỉ sửa source: đồng bộ thêm `/account/trips` và chi tiết chuyến. Danh sách hiển thị nút hủy ở pending/pre_inspection, dùng cùng dialog preview/reason/API với `/my-rentals`; không giữ form hủy cũ có thể gửi khi preview lỗi. Adapter giữ canCancel từ server và không cho status renting trở đi. Cập nhật tài liệu deployment theo migration runner/workflow thực tế. Kiểm chứng cuối: 71 unit/integration, 22 Customer E2E (gồm 4 account list/detail mới) đạt; 20 Admin inspect/cancel đã đạt trước đó. TypeScript/design lint/ESLint và diff-check sạch. Người dùng xác nhận không cần triển khai Railway.
