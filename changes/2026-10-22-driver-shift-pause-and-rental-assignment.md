# Tạm khóa ca trực và phân công tài xế theo đơn thuê

## Thay đổi

- Theo yêu cầu đã xác nhận, tạm khóa tạo/xếp/sửa/hủy ca trực bằng cờ `DRIVER_SHIFT_MANAGEMENT_ENABLED=false`. Giao diện thông báo rõ nguyên nhân, chặn mở form và giữ các ca/chuyến đã lưu ở chế độ xem.
- Cổng tài xế vẫn hiển thị các chuyến thực đã được phân công, cùng thông báo tạm khóa quản lý ca.
- Thống nhất form phân công trong Vận hành đơn thuê và Điều phối. Dùng danh sách tài xế hợp lệ theo đơn và endpoint `/assignments/driver`; hiện email thật, khóa tài xế không hợp lệ và lý do, bắt buộc chọn tài xế, lý do/ghi chú, lỗi inline, retry và chặn gửi lặp.
- Không có quan hệ tài xế–xe cố định: phân công gắn với xe của mỗi đơn thuê. Điều phối có liên kết “Mở phân công tài xế”; lịch chuyến thật vẫn hỗ trợ đổi tài xế.
- CustomerService phân công bằng danh sách candidates theo đơn, không gọi `/staff/drivers` chỉ dành cho Admin/Manager. API candidates hiện chưa trả email nên dùng tên thật khi không có quyền danh bạ hoặc danh bạ lỗi. Không mở rộng phân quyền backend.
- Các bảng danh bạ, ca và lịch điều phối trong `/admin/dispatch` chỉ tải cho Admin/Manager theo quyền API; CustomerService vẫn tra cứu đơn và phân công bình thường, không gửi request tới API quản lý ngoài quyền.

## Kiểm chứng

- Typecheck và design lint đạt; eslint các file sửa không có lỗi (workspace còn warning tồn tại trước thay đổi).
- 37 kiểm thử Vitest mục tiêu đạt: form mới (gồm CustomerService không gọi danh bạ ngoài quyền) và hai bộ kiểm thử Vận hành.
- Playwright **13/13 đạt**: 6 kiểm thử danh bạ desktop/mobile + 6 kiểm thử phân công Admin ở 1600/1280/390px, cả sáng và tối + 1 luồng CustomerService mobile chứng minh không gọi API quản lý ngoài quyền. Kiểm tra disable ca, phân công, validation, lỗi API/retry, không tràn ngang; chạy qua Chrome cài sẵn (`PLAYWRIGHT_BROWSER_CHANNEL=chrome`) vì Chromium bundled chưa có. Ảnh kiểm chứng ở `../.validation/ui/driver-assignment-*.png`.
- Cờ chỉ khóa giao diện quản lý ca; API ca hiện có được giữ nguyên. Không xóa hoặc chỉnh dữ liệu ca đã lưu.
