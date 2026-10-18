# Danh sách đơn thuê và thanh tiến trình cho customer/Admin

- Admin `/admin/rentals` hiển thị mọi trạng thái qua phân trang server, cột mã yêu cầu/mã đơn chính thức và icon xem chi tiết. Chi tiết dùng lại màn hình vận hành; sau duyệt/đổi trạng thái/thu tiền, tải lại chi tiết và danh sách để trạng thái thống nhất.
- Customer có mục **Đơn thuê của tôi** tại `/my-rentals`, xem cả thuê giờ và dài hạn, phân trang 20 bản ghi, lọc theo nhóm trạng thái. Chọn chi tiết xem cơ sở, xe, lịch thuê, tài xế, mã order, hóa đơn và lịch sử. Trạng thái đang xử lý tự cập nhật mỗi 15 giây; có nút tải lại. Kết quả gửi yêu cầu đặt xe có link theo dõi trực tiếp.
- Shared `RentalStatusTracker` dùng đường nối xanh và năm mốc: Chờ duyệt → Chuẩn bị xe → Đang thuê → Kiểm tra trả xe → Hoàn tất. Phân biệt đã qua/hiện tại/chưa đến, có aria-current và nhãn đọc màn hình. Hủy dừng tiến trình, trạng thái lạ không suy diễn đã hoàn thành. Không coi pre_inspection là đã thanh toán.
- Tracker dùng tại chi tiết Admin, danh sách/chi tiết customer và hợp đồng dài hạn. Responsive được kiểm tra 320/390px. Bỏ nút ID mẫu và fallback rental giả khi API không tìm thấy để không hiển thị sai đơn thực tế.
- Backend bổ sung orderId nullable từ cùng rental_orders vào các projection list/detail, giữ mã yêu cầu và các policy/phân trang hiện có. Không cần migration mới ngoài 0021 của luồng thanh toán trước đó.

## Kiểm chứng

- 141/141 unit FE đạt; typecheck, ESLint tập trung và design lint đạt.
- 20 kịch bản E2E liên quan chạy đạt qua các lượt: Admin 8, customer progress 3, shared tracker 3, payment approval 6. API giả, không tạo đơn hoặc giao dịch thật. Có kiểm tra mọi trạng thái, phân trang/lọc/đặt lại, chuyển chi tiết, refresh sau staff duyệt, API từ chối và mobile.
- Backend build -warnaserror và 44/44 test PostgreSQL/HTTP/Application liên quan đạt, theo change backend cùng ngày.
- Production build frontend mới chưa chạy: automatic approval review không hoàn tất vì tài khoản đạt giới hạn sử dụng. Không tuyên bố build mới đã đạt. Chưa deploy.
