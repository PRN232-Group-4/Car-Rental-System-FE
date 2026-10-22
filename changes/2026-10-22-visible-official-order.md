# Hiển thị mã đơn chính thức trong Admin

Workspace V4 chỉ nổi mã yêu cầu thuê, không hiện orderId dù API đã trả. Thêm RentalIdentifiers dùng chung để tách Mã yêu cầu và Mã đơn chính thức ngay dưới tiêu đề hồ sơ, trong cột Mã hồ sơ của danh sách yêu cầu/bàn giao, phần tra cứu chi tiết, xác nhận thanh toán và bàn giao phương tiện.

Mã lấy trực tiếp từ rental.orderId hoặc invoice.orderId; null hiện Chưa phát hành, thiếu trường hiện Chưa có thông tin. Không lấy rental.id hoặc invoice.id thay orderId, không tự tạo/backfill đơn và không coi orderId là bằng chứng đã thanh toán. Sau cash confirmation, dữ liệu refetch cập nhật mã; tải lại trang vẫn đọc từ server. Giữ nguyên phân quyền menu/vận hành và các API/nghiệp vụ hiện tại.

Kiểm chứng: 35 unit/integration liên quan, 14 navigation tests và 2 Edge E2E desktop/mobile đạt. E2E xác minh null trước thanh toán, mã order khác mã yêu cầu sau thu tiền/reload, danh sách và bàn giao; không tràn ngang. TypeScript/design lint/ESLint đạt. Chỉ sửa FE, chưa deploy.
