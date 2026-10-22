# Trạng thái tài xế và trả xe — 2026-10-22

- Booking là yêu cầu dịch vụ kèm tài xế; khi chưa có phân công không hiển thị như đã có tài xế phục vụ. Loading/lỗi/không có xe đều giữ thông tin chưa phân công.
- Customer detail có driver null hoặc không có tên: hiển thị yêu cầu có tài xế/chưa phân công. Tên thực tế chỉ hiển thị từ driver.fullName.
- Admin → Vận hành đơn thuê: có hạn trả, tình trạng đã nhận lại hay chưa và thời điểm returnedAt thật. Đang thuê quá hạn phải có cảnh báo; không cảnh báo đang chưa trả sau khi returnedAt được ghi nhận.
- “Xác nhận đã nhận lại xe” gọi POST `/rentals/{id}/return`, server ghi giờ nhận và chuyển post_inspection. Không yêu cầu biên bản sau thuê trước khi nhận lại xe.
- Chỉ sau kiểm tra sau thuê mới hoàn tất qua POST `/rentals/{id}/complete`; backend áp chính sách phí quá giờ, xử lý cọc và hóa đơn còn thiếu. FE chỉ hiển thị settlement, không tự tính/phát hành phạt.
- Lỗi API không đổi trạng thái hiển thị thành thành công; xem trang quá hạn không thực hiện mutation. Giữ quyền vận hành hiện có.

Acceptance: E2E desktop/mobile cho nhãn tài xế, luồng nhận lại/kiểm tra/quyết toán và lỗi API; unit adapter xác nhận các endpoint chuẩn; backend lifecycle/domain giữ kiểm thử chính sách hiện có.
