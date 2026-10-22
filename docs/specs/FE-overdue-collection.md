# Quá hạn và thu phí khi trả xe

Admin hiển thị nhãn/bộ lọc Quá hạn cho đơn renting chưa trả và quá endTime, không thay status dùng cho lifecycle. Bộ lọc chạy phía server trước phân trang. Đồng hồ/danh sách cập nhật định kỳ. Khi nhận xe lưu returnedAt; khi quyết toán hiển thị settlement đã lưu, phí/VAT, trừ cọc và hóa đơn còn thiếu.

Panel phí còn thiếu đọc invoice detail từ ID settlement, nêu số tiền và trạng thái thực. Quyền Admin/Manager/CustomerService được chọn thu tiền mặt (popup xác nhận đã nhận đủ tiền) hoặc tạo link PayOS để khách thanh toán. Cash/online chỉ được bật theo cờ cho phép từ backend; không gửi số tiền hay cờ paid từ client. Link online dùng tab mới, không tự mở khi API trả URL không hợp lệ; trạng thái chỉ thành đã thu sau refetch trả paid. Provider lỗi giữ nội dung, tải lại trước thử phương thức khác. Có polling/thử lại/làm mới để nhận webhook.

Desktop/mobile, filter/reset, tiền mặt lỗi/thành công/gửi lặp, online tạo link/chờ webhook/đã paid, lỗi đọc invoice, không còn phí thiếu và user không đủ quyền đều phải được kiểm chứng. Không deploy trong yêu cầu này.
