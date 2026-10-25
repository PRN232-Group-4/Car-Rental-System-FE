# Danh sách kiểm tra, email bảo trì và trạng thái người dùng

- Xe đang bảo dưỡng hiển thị email kỹ thuật viên từ `maintenanceTechnicianEmails` ở sổ xe, chi tiết và form sửa; chưa có người phụ trách hiển thị rõ chưa phân công.
- Trang kiểm tra tải toàn bộ lịch sử qua `GET /api/inspections` có phân trang, lọc đơn/loại kiểm tra và xem đầy đủ kết quả, người kiểm tra, chỉ số, ghi chú, ảnh. Hàng đợi trước/sau thuê hiển thị ngay, liên kết tới phiếu đúng đơn; bỏ mã đơn mẫu giả.
- Quản trị người dùng chuyển từ mock sang API thật cho danh sách, chi tiết, khóa/mở khóa, vai trò và thu hồi phiên. Chỉ cập nhật sau API thành công; mở khóa có lý do audit và trạng thái được đọc lại từ backend khi tải lại trang.
- Phân công kiểm tra phân biệt lỗi route chưa deploy, quyền, đơn không tồn tại và mạng. API lỗi không được giả thành chưa phân công hoặc cho lưu.
- Giữ mặc định API Railway trên Next dev proxy và Worker; `.env` dùng backend Railway và `NEXT_PUBLIC_USE_MOCK=false`. Không đổi runtime sang backend localhost.

Kiểm chứng: toàn bộ 611 test frontend đạt; sau bổ sung kiểm tra lỗi bộ lọc, 6 test InspectionDirectory đạt. 6 test Edge đạt cho 1600/1280/390px, light/dark, email bảo trì, tải lại sau mở khóa và route phân công thiếu. ESLint, design lint và diff check đạt. Backend build không warning/error, 75 test tích hợp liên quan đạt. Typecheck còn lỗi import có sẵn ở TrackingManager/HandoverPanel.

Chưa deploy: backend Railway được kiểm tra trực tiếp trả 404 và Swagger chưa có `/api/rentals/{id}/inspection-assignment`. Cần deploy backend mới cùng migration `0025_inspection_assignments.sql`, API danh sách kiểm tra và projection email bảo trì để dùng đủ chức năng trên môi trường deploy.
