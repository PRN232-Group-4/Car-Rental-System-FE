# Chọn cơ sở trước khi thuê xe

- Customer chọn cơ sở → hình thức lái → xe; danh sách xe chỉ được gọi khi có cơ sở hợp lệ, hình thức lái và khoảng thời gian hợp lệ. Đổi cơ sở/loại thuê xóa lựa chọn hình thức lái và xe; đổi hình thức lái xóa xe cũ.
- Gọi `vehicles/search` với facilityId/hasDriver/rentalType/from/to, đọc mọi trang và ánh xạ schema search (facility, vehicleType, summary, giá) sang card. Có tài xế lọc tài xế rảnh tại cơ sở ở backend, không dùng dữ liệu phân công đơn pending. Longterm giữ tự lái theo API hiện tại.
- Danh sách cơ sở có loading, empty, lỗi/thử lại; validation/focus inline cho cơ sở, hình thức lái và xe. Đường dẫn từ BookingModal giữ facilityId khi có. Giữ kiểm tra GPLX, giá, thuê bao và submit hiện tại.
- Kiểm chứng: 126 unit tests, 17 ca Playwright booking/GPLX/cơ sở (API giả), ESLint tập trung, TypeScript, design lint và production build/static export đều đạt. Đã xem bố cục mobile 390px. Không tạo đơn thật hoặc deploy.
