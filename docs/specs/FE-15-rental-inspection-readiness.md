# Vận hành đơn thuê: phân công kiểm tra và bàn giao

## Điều kiện chấp nhận

- Admin/Manager có thể chọn một nhân viên `Maintenance` đang hoạt động để kiểm tra trước thuê, ngay trong hồ sơ vận hành và trang kiểm tra xe.
- Danh sách kỹ thuật viên đọc toàn bộ các trang của `GET /api/staff`; không dùng tài xế hoặc nhân viên khác thay thế khi API lỗi.
- Đọc phân công bằng `GET /api/rentals/{id}/inspection-assignment`; lưu bằng `PUT` cùng route với `technicianStaffId`. Backend lưu người giao, thời điểm và xe hiện tại. Maintenance/CustomerService xem được phân công; Admin/Manager được lưu.
- Chỉ hiển thị biểu mẫu giao việc ở `pending`/`pre_inspection` trước khi kiểm tra đạt. API xác minh lại trạng thái, nhân viên và biên bản trước khi lưu.
- Nút bàn giao chỉ khả dụng khi `GET /api/rentals/{id}` trả `hasPassingPreInspection=true`. Khi thiếu/không đạt, chỉ rõ điều kiện, dẫn đến phiếu đúng đơn và cho tải lại kết quả.
- Hoàn tất đơn cần `hasPostInspection=true`; đây là đã có biên bản, không bắt buộc kết luận đạt. Backend tiếp tục quyết định thanh toán, phân xe, giấy phép và các điều kiện còn lại.
- Sau đổi trạng thái thành công, tải lại hồ sơ/hàng đợi và giữ thông báo thành công. API lỗi không giả lập trạng thái mới.
- Lỗi trường kỹ thuật viên hiển thị ngay dưới select, có aria liên kết; lỗi tải/API chung có thông báo và thao tác thử lại.
- Trang kiểm tra mở bằng lịch sử mọi biên bản có phân trang, không yêu cầu nhập mã đơn trước. Lọc theo đơn và loại trước/sau thuê; xem được email người lập, kết quả, km, pin/xăng, ghi chú và ảnh. Hàng đợi đơn cần kiểm tra trước/sau thuê dùng API vận hành thật và dẫn tới phiếu đúng đơn.
- Phân công trả 404 do route chưa deploy phải báo cần cập nhật backend; không coi lỗi tải là chưa phân công. Giữ API mặc định trỏ backend Railway đã deploy.
- Hồ sơ cá nhân hiển thị ngay khi tải được tài khoản/nhân viên. Danh mục cơ sở phụ chậm hoặc lỗi không được làm mất hồ sơ; không ghi đè giới tính khi lưu tên/số điện thoại.

## Kiểm chứng

- Vitest: hồi quy hồ sơ, phân trang cơ sở/kỹ thuật viên/tài xế, phân quyền giao việc, lỗi inline/API, điều kiện kiểm tra và làm mới trạng thái.
- Kiểm thử HTTP client dùng envelope 6 trường và route flat `/api/rentals/{id}` thật mà màn hình sử dụng.
- Playwright: giao việc → tải lại kiểm tra đạt → bàn giao, ở 1600/1280/390px, light/dark; hồ sơ vẫn dùng được khi API cơ sở lỗi.
