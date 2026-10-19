# Kiểm tra GPLX và chọn xe bằng thẻ

- Trước khi mở biểu mẫu `/booking`, chờ kiểm tra GPLX của khách đăng nhập. Hồ sơ thiếu số GPLX hoặc trạng thái `none` chuyển tới `/driver-license`; lỗi tải có thông báo và nút thử lại. Khách chưa đăng nhập chuyển tới login.
- Giữ query đặt xe (loại thuê, xe, thời gian, cơ sở, thuê bao) trong `returnTo`. Sau cập nhật GPLX có nút quay lại; chỉ cho quay về `/booking`. Các quy tắc phê duyệt/thuê bao/hết hạn hiện có giữ nguyên.
- Thay select phương tiện bằng radio card có ảnh xe, tên, thông số, chi nhánh, giá giờ/tháng và trạng thái chọn. Bố cục responsive, dùng bàn phím, loading/rỗng/lỗi/thử lại và lỗi validation inline. Giữ preselection theo query và tính giá hiện có.
- Kiểm chứng: 14/14 Playwright booking + GPLX đạt với Chrome local và API giả; đã xem giao diện desktop/390px mobile. 126/126 unit tests toàn frontend đạt, TypeScript, ESLint các file liên quan, design lint và production build/static export đạt (245 trang). Không tạo đơn hoặc upload lên dịch vụ thật; chưa deploy.
