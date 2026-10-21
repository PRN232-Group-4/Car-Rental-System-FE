# Ghép main vào Tri

- Giải quyết 12 conflict ở changelog, chuyến của khách, hóa đơn, hành trình và vận hành.
- Giữ giao diện Transit Desk/Graphite Glass Deck từ main, giữ API mới và quyền truy cập của Tri.
- Giữ phân biệt id/orderId, lỗi API thật, canPay/paymentBlockedReason, xác nhận thu tiền mặt không body.
- Buồng lái mới đọc rental detail đúng endpoint và tài xế đủ điều kiện theo rental; không gửi hai lần khi phân công.
- Giữ danh sách có phân trang/bộ lọc, sửa yêu cầu và thanh toán qua chế độ view=list, có liên kết từ hàng đợi buồng lái.
- Giữ Mapbox từ main, bổ sung đường nối GPS thực tế vào component dùng chung để không mất hành trình của Tri.
- Thêm các route GPLX/bàn giao/định vị vào nhóm menu mới.

Kiểm tra tĩnh: không còn dấu conflict, phân tích cú pháp mã nguồn. Không chạy test hoặc build. package.json/package-lock.json từ main có dependency mới; cần đồng bộ bằng npm install trước khi chạy local nếu máy chưa có.
