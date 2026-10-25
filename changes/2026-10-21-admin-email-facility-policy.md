# Email nhân sự, cơ sở tài khoản và giao diện chính sách

- Tạo hồ sơ nhân viên chọn email từ toàn bộ các trang user directory thật. GPLX chỉ hiển thị khi tài khoản có Driver; gửi userId nội bộ tới POST staff/from-user, không tự thay role hoặc tạo mật khẩu.
- Staff list/detail/create/update và danh mục phòng ban/cơ sở dùng API thật. Giữ GPLX khi thay cơ sở, bộ lọc danh sách hiện có và lỗi inline.
- Khung Admin hiển thị cơ sở và email tài khoản hiện tại ở desktop/mobile. Tên cơ sở lấy từ account/profile; đổi tài khoản xóa ngay ngữ cảnh cũ và bỏ qua response cũ đến muộn. Không đoán trạm mặc định hoặc yêu cầu role thấp đọc directory bị cấm.
- Bảo trì chọn email Maintenance đang hoạt động và tên cơ sở; chi tiết nhận email/tên cơ sở kèm phiếu. Maintenance đọc phân công mà không gọi directory Admin. Bộ lọc kỹ thuật viên hỗ trợ đầy đủ roles.
- Selector tài xế/kiểm tra và nhân sự dùng email. Biên bản kiểm tra hiển thị email người đang lập, server tự xác định staffId. Bỏ dòng User ID trùng thông tin trong chi tiết tài khoản.
- Bỏ hai banner trùng chính sách/thiếu chính sách theo yêu cầu giao diện.

Kiểm chứng: toàn bộ 585 test frontend đạt trước chỉnh bổ sung bộ lọc nhiều role; test liên quan sau chỉnh sửa đạt. 8 test Edge đạt (1600/1280/390px, light/dark, bảo trì, cơ sở của Manager/CustomerService/Maintenance và Chính sách). Design lint, ESLint và diff check đạt. Typecheck còn lỗi import có sẵn ở TrackingManager/HandoverPanel; không có lỗi thuộc các file vừa sửa.

Cần triển khai backend cùng frontend: staff/from-user, AccountResponse.facilityName, Staff.roles, InspectionAssignment.technicianEmail, Maintenance.assignedStaffEmail/facilityName. Chưa deploy.
