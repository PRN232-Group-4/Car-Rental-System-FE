# Phân biệt yêu cầu tài xế và xác nhận trả xe

- Booking trước đây chỉ cần chọn cơ sở đã hiện “Có tài xế phục vụ”. Đổi thành “Tài xế: Chưa phân công”, giải thích thông tin tài xế hiển thị sau khi nhân viên phân công. Giữ hình thức dịch vụ và request hasDriver=true.
- Tiến trình customer có hasDriver=true nhưng chưa có tên tài xế hiển thị “Yêu cầu có tài xế · Chưa phân công”; có tên thực tế mới hiển thị tài xế được phân công. Không coi kết quả tìm xe là phân công hay giữ chỗ tài xế.
- Trong `/admin/rentals`, thêm khối “Trả xe và phí quá hạn” với hạn trả, returnedAt từ API chi tiết, cảnh báo quá hạn khi đang thuê và chưa ghi nhận nhận xe; hiển thị số giờ/phí/VAT/trừ cọc/hóa đơn thiếu từ settlement server.
- Nút khi đang thuê đổi thành “Xác nhận đã nhận lại xe”. FE chuyển xác nhận/bắt đầu/trả/hoàn tất sang các endpoint `/confirm`, `/start`, `/return`, `/complete`, sau đó tải lại flat rental. Endpoint status cũ không thực hiện đủ cơ chế timestamp/quyết toán; không dùng cho bốn bước này nữa.
- Server ghi thời điểm trả khi nhận xe; chỉ quyết toán sau kiểm tra sau thuê, tính phí bằng chính sách hiện có (không tính tiền ở FE), trừ cọc và tạo hóa đơn phần thiếu. Mở trang hoặc chỉ quá hạn không tự xác nhận trả hay phát hành phí. Lỗi API giữ trạng thái cũ.

Kiểm chứng: unit API/workspace 34/34; cơ chế backend lifecycle/domain hiện có 71/71; TypeScript/design lint/ESLint đạt. 18 E2E liên quan đạt: booking loading/empty/error/available desktop/mobile, customer chưa phân công, nhận xe thành công/lỗi và quyết toán sau kiểm tra. API E2E giả lập toàn bộ; không thực hiện thao tác trên dữ liệu thật. Chưa deploy.
