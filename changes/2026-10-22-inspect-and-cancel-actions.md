# Nút Đã inspect và hủy trước bàn giao

Theo vị trí trong ảnh người dùng, đổi hành động xác nhận kiểm tra thành **Đã inspect** ngay dưới nút lưu phân công. Admin có thể dùng kỹ thuật viên đã được giao sẵn; không còn ẩn riêng theo hasDriver khi đơn cũ chưa đạt kiểm tra. Quyền Admin và xác nhận trước gửi giữ nguyên.

Thêm **Hủy đơn thuê** trực tiếp trong bảng lệnh khi pending/pre_inspection. Không cho hủy từ renting trở đi; ẩn lựa chọn hủy trong ghi đè ở các trạng thái đó và thêm shared transition guard. Dialog chuẩn yêu cầu lý do, khóa gửi/đóng khi đang lưu, giữ dữ liệu/lỗi inline nếu API thất bại. Gọi lifecycle `/cancel` để xử lý lịch/phân công/hóa đơn/refund theo chính sách, waiveFee=false. Chỉ refresh đơn/hàng đợi/hóa đơn sau thành công. Không đổi backend hoặc thêm migration.

Kiểm chứng: 52 unit/integration tests và 20 Edge E2E desktop/mobile đạt (6 inspect, 14 hủy gồm tất cả trạng thái và lỗi API). TypeScript/design lint đạt; ESLint không lỗi, 7 cảnh báo cũ ở workspace. Chưa deploy.
