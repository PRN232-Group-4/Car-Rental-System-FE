# Cải tiến cấu hình và vận hành — 23/10/2026

## Tiêu chí nghiệm thu

- Cấu hình phương tiện liệt kê toàn bộ hạng bằng đang hỗ trợ bằng checkbox, hiển thị card của những hạng đã chọn bên dưới. Giữ dữ liệu hạng riêng hiện có. Theo yêu cầu bổ sung, mảng rỗng thể hiện chưa cấu hình và xe được ẩn khỏi danh sách tìm xe cho khách; Admin vẫn có thể xem/sửa.
- Admin và Manager truy cập được danh sách thanh toán đơn thuê từ menu, có trạng thái tải/lỗi/rỗng, bộ lọc và phân trang; không mở quyền tài chính cho vai trò khác.
- Khung Admin, khách hàng và bảng tìm chức năng không còn dòng đếm “CHỨC NĂNG KHẢ DỤNG”; số hồ sơ cần xử lý vẫn giữ nguyên.
- Thanh tiến trình thuê xe sử dụng màu cam thương hiệu cho các bước hiện tại/đã qua. Bước chưa đến vẫn phân biệt bằng màu trung tính; không thay ý nghĩa tiến trình hủy/chưa biết.
- Vận hành hiển thị checklist theo từng giai đoạn. Chỉ mở nút cập nhật sang bước kế tiếp khi đủ checkbox xác nhận và điều kiện nghiệp vụ từ server. Tick xác nhận không thay thế thanh toán, kiểm tra kỹ thuật hoặc bàn giao.
- Khi API lỗi, giữ trạng thái hiện tại và các dữ liệu biểu mẫu; chặn gửi lặp và không cho nhảy qua giai đoạn bằng menu trạng thái tự do.

## Bổ sung: thao tác tại chỗ và giữ lựa chọn xe

- Biểu mẫu kỹ thuật viên và thanh toán nằm ngay dưới checkbox tương ứng; không bắt mở lại khối thao tác ở bên dưới và không lồng các form HTML.
- Phân công kỹ thuật viên chưa đồng nghĩa kiểm tra đạt; nhận tiền được xác nhận qua API rồi mới tick điều kiện thanh toán. Chỉ mở bàn giao khi đủ kết quả server và xác nhận nhân viên.
- Liên kết từ danh sách giữ xe đã chọn, cơ sở và ngữ cảnh tìm kiếm vào trang chi tiết/đặt xe. URL trực tiếp có mã xe tra cứu thông tin chuẩn từ API để xác định cơ sở.
- Thanh tiến trình khách hiển thị số `01`–`05` cho bước hiện tại/chưa đến và dấu tick cho bước đã qua, dùng màu cam thương hiệu.

## Hạng bằng theo xe và hợp đồng dài hạn đã ký

- Card xe ở danh sách, trang chi tiết và thẻ chọn xe khi đặt thuê hiển thị `allowedLicenseTypes` thực tế. Ví dụ “Tự lái: GPLX B hoặc B2”; chỉ cần một hạng được chấp nhận, không tự suy diễn hạng tương đương.
- Dữ liệu thiếu cấu hình trong hồ sơ cũ không được trình bày là chấp nhận mọi hạng. Không dùng hạng bằng mặc định theo loại xe.
- Đơn dài hạn cần bản hợp đồng đã ký trước khi bàn giao/bắt đầu thuê. Sau khi tạo yêu cầu, khách đi tới hồ sơ hợp đồng của đúng đơn để tải PDF/JPEG/PNG/WebP tối đa 10 MB và ghi nhận thời điểm ký.
- Tải tài liệu là request multipart có kiểm tra định dạng/dung lượng ở FE và BE. Lỗi trường nằm dưới upload/ngày giờ; lỗi kết nối giữ file và dữ liệu để thử lại; khóa gửi lặp.
- Tài liệu lưu gắn theo rentalId, được tải xuống qua API có kiểm tra chủ đơn/quyền nhân viên. Đường dẫn nhập tay hoặc timestamp cũ không thay thế bằng chứng upload trên server.
- Checklist bàn giao dùng readiness từ server; đơn theo giờ không yêu cầu hợp đồng dài hạn. Giữ các điều kiện kiểm tra xe, thanh toán và GPLX hiện có.

## Giới hạn contract hiện tại

`GET /api/payments` hiện trả danh sách giao dịch và nhận bộ lọc `invoiceId`. Bộ lọc bổ sung và phân trang danh sách quản lý được xử lý phía client theo dữ liệu API trả về; không giả định server hỗ trợ query chưa tồn tại.

## Kiểm chứng tích hợp

- Vitest: 109 file, 920 kiểm thử đạt.
- Playwright: 7 kiểm thử liên quan đạt (`operations-ui-refinements.spec.ts`, `rental-status-tracker.spec.ts`), gồm quyền Admin/Manager/Staff, đủ/thiếu checklist, màu tiến trình, 1600px/1280px/390px và sáng/tối.
- TypeScript, ESLint các file thay đổi và design lint đạt; ảnh giao diện đã được kiểm tra trực quan.
- Build production đạt, xuất thành công 264 trang, bao gồm `/admin/payments`.
- Bộ E2E cũ `admin-navigation-counts.spec.ts` còn 6 ca lệch với quyền/nhãn điều hướng hiện tại (Admin không còn quyền vận hành, nhãn duyệt GPLX và quyền xem hồ sơ Manager). Không thay đổi phân quyền để khớp các kỳ vọng cũ; kiểm thử quyền của trang thanh toán mới đã đạt.

## Kiểm chứng yêu cầu bổ sung

- Vitest tổng hợp FE: 112 file, 930 kiểm thử đạt.
- Playwright: 12 ca trong `inline-checklist-controls.spec.ts`, `rental-status-tracker.spec.ts`, `selected-vehicle-context.spec.ts` đạt. Kiểm tra phân công tại chỗ, thu tiền có xác nhận, automatic checkbox theo server, không bypass kiểm tra, không lồng form, giữ xe/cơ sở/lịch qua điều hướng và tải lại, giá lấy từ API, số bước customer.
- Giao diện checklist đã kiểm tra ở 1600px, 1280px, 390px, cả sáng/tối. Luồng chọn xe đã kiểm tra desktop/mobile.
- Backend: build `-warnaserror` sạch và 77 kiểm thử liên quan đạt, gồm PostgreSQL integration lọc xe chưa cấu hình trước phân trang, quản trị/lịch sử giữ xe và xe xuất hiện lại sau cấu hình.
- FE production build, TypeScript, design lint và ESLint liên quan đạt.
- Backend local đang chạy giữ bản build cũ; cần nạp lại tiến trình để áp dụng bộ lọc mới. Không triển khai hoặc thay đổi dữ liệu ứng dụng trong quá trình kiểm thử.
