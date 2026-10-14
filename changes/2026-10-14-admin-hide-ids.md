# Ẩn ID khỏi bảng Admin

- Bỏ ID dưới tên phương tiện, cột ID phiếu bảo trì và ID ca làm; dùng biển số để nhận diện xe và tìm kiếm.
- Hiển thị tên nhân viên/tài xế và tên xe; khi thiếu thông tin dùng nhãn tiếng Việt thay vì ID dự phòng. Tra cứu nhân viên tuân theo quyền Admin/Manager hiện có.
- Đổi ID đơn thuê trong lịch chuyến thành thao tác “Mở đơn thuê”; giữ nguyên ID trong URL và request để mở/sửa/xóa đúng bản ghi.
- Cập nhật số cột trạng thái trống và tiêu đề popup bảo trì/ca làm.
- Kiểm thử trình duyệt với API giả lập xác minh không hiện ID, tên hiển thị và request cập nhật đúng bản ghi.
