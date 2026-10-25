# Rà soát toast cho thao tác Admin

- Toaster chung đã được mount tại root Providers. Nhân viên, người dùng, phương tiện, loại xe, phòng ban, cơ sở, chính sách và gói thuê bao đã có toast thành công cho các thao tác đang hỗ trợ; xóa có thông báo khi API thành công hoặc thất bại.
- Bổ sung toast còn thiếu cho tạo/cập nhật phiếu bảo trì, tạo/sửa/hủy ca làm, lưu biên bản kiểm tra, phân công kỹ thuật viên/tài xế, đổi trạng thái và bàn giao đơn thuê, ghi nhận tiền mặt, hồ sơ cá nhân và GPLX.
- Bổ sung tại hooks báo cáo/đánh giá cho đổi trạng thái sự cố, tạo phiếu bảo trì từ sự cố, ẩn/hiện và phản hồi đánh giá. Mỗi mutation chỉ thông báo ở một tầng.
- Lỗi trường vẫn nằm ngay dưới trường và giữ dữ liệu. Chỉ lỗi chung của thao tác gửi mới thêm toast; bỏ qua chuỗi rỗng do lỗi đã được ánh xạ vào trường. Không thêm toast cho thao tác lọc hoặc tải dữ liệu nền.
- Bổ sung toast lỗi chung khi lưu danh mục, tổ chức, phương tiện và đổi trạng thái chính sách. Giữ bản dịch lỗi điều kiện bàn giao tiếng Việt.
- Không thay API, phân quyền hay cấu hình backend Railway.

Kiểm chứng: toàn bộ suite chạy 612 test; 611 đạt ngay, một hồi quy bản dịch bàn giao được sửa và chạy lại toàn bộ nhóm RentalWorkspaceV4 đạt 22/22. ESLint không có lỗi (còn cảnh báo cũ của RentalJourney/RentalWorkspaceV4); design lint và diff check đạt. Typecheck vẫn bị chặn bởi import có sẵn trong TrackingManager/HandoverPanel, không có lỗi mới tại các file vừa sửa. Chưa deploy.
