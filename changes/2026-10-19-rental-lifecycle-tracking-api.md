# Đồng bộ API vận hành, bàn giao và định vị

- GPLX: lọc licenseStatus phía BE, mặc định pending, phân trang 20 hồ sơ; chi tiết và duyệt approved/rejected theo customer ID.
- Khách: danh sách và chi tiết dùng rentals/mine, ánh xạ DTO vào Chuyến của tôi; bỏ kho dữ liệu mẫu và fallback thành công giả khi API lỗi.
- Admin/Manager/CustomerService: danh sách rentals, chi tiết rentals/{id}/detail; lọc trạng thái/khách/xe/thời gian và phân trang từ BE.
- Sửa yêu cầu qua PUT rentals/{id}; duyệt qua POST rentals/{id}/confirm. Quyền và điều kiện nghiệp vụ cuối cùng do BE kiểm tra.
- Bàn giao: trang /admin/handovers, danh sách/chi tiết riêng, POST confirm không body. Thanh toán tiền mặt cũng gửi không body.
- Invoice: giữ canPay/paymentBlockedReason, bỏ fallback hóa đơn và checkout giả; lấy hóa đơn từ liên kết của chi tiết rental.
- Phân công: đọc assignable-drivers theo rental, lưu assignments/driver. Giữ ca làm và lịch tài xế.
- FE-26: /nearby-vehicles, tọa độ người dùng/nhập tay, bán kính, phân trang, marker xe, routeMeters/etaSeconds; không gửi bộ lọc status.
- FE-27: vẽ đường GPS từ dữ liệu route; /admin/tracking cho Admin/Manager xem geofence, sự kiện và xử lý cảnh báo, có phân trang và bộ lọc BE hỗ trợ.
- Phân biệt mã yêu cầu id và mã đơn chính thức orderId; URL thao tác luôn dùng id.
- Giữ API client với credentials include và envelope code/status/is_success/data/message/error; lỗi thật được trả về UI.

## Cấu hình bản đồ

Google Maps JavaScript cần NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (bật Maps JavaScript API, giới hạn HTTP referrer theo domain local/deploy). Có thể dùng khóa NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY hiện có nếu khóa đó cũng bật JavaScript API. NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID tùy chọn; chưa đặt dùng map ID mẫu của Google, không thay thế dữ liệu tọa độ. Chưa có khóa thì UI báo thiếu cấu hình và giữ danh sách API thật. Biến NEXT_PUBLIC cần có lúc build trên host deploy.

## Kiểm tra

Không chạy test, build hoặc lint theo yêu cầu của người dùng. Chưa xác nhận kết quả chạy UI/local/deploy.
