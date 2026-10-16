# FE-17, FE-10 và phần có API của FE-27

- `/admin/maintenance`: danh sách/lọc phiếu bảo trì, tạo/cập nhật, mã nhân viên/cơ sở phụ trách, trạng thái, ngày dự kiến, chi phí và kết luận an toàn. GET/POST/PUT `/api/maintenance`.
- `/report-incident?rentalId=...`: khách hàng tra cứu mã đơn và gửi loại/mô tả/ảnh sự cố. Upload `/api/media/report` trả URL; POST `/api/rentals/{id}/reports` lưu báo cáo; GET `/api/reports?rentalId=` hiển thị báo cáo theo quyền backend.
- `/admin/dispatch`: xem, tạo và sửa/hủy ca qua `/api/drivers/shifts`; xem lịch phân công qua `/api/drivers/schedule`; phân chuyến qua `/api/rentals/{id}/assignments`.
- FE-07 chưa có trang đơn của tôi: thêm mục báo cáo sự cố trong menu khách hàng và cho nhập mã đơn.
- Theo yêu cầu người dùng, hoãn FE-26 và phần hành trình/geofence của FE-27 vì Swagger được cung cấp chưa có các endpoint tương ứng.
- Gọi backend thật qua proxy same-origin, giữ session cookie; backend quyết định quyền và quy tắc nghiệp vụ.
