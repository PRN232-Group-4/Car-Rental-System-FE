# Biểu đồ tổng quan, icon thao tác và rà soát chính sách thuê xe

## Kết quả

- `/admin` có biểu đồ cột hoạt động hiện tại và biểu đồ tròn cơ cấu đội xe, dùng dữ liệu API thực tế. KPI dùng nhãn tiếng Việt và định dạng tiền VND. Mỗi biểu đồ có bảng số liệu thay thế, skeleton, trạng thái rỗng/lỗi và thử lại riêng; hỗ trợ desktop/mobile, sáng/tối và reduced motion.
- API dashboard chỉ có số tổng, chưa có chuỗi doanh thu theo thời gian. Biểu đồ cột hiển thị số đơn đang thuê, phiếu bảo dưỡng mở và gói thuê còn hiệu lực; cơ cấu xe lấy `totalCount` từ các truy vấn danh sách phân trang theo trạng thái. Không thêm dữ liệu mẫu hoặc endpoint giả định. Phạm vi được ghi tại FE-18.
- Cột thao tác của các danh sách xe, loại xe, gói thuê, danh bạ tổ chức/nhân viên, bảo trì và điều phối dùng `AdminRowAction`: xem = Eye, sửa = Pencil, xóa = Trash2. Chỉ hiện icon; giữ tooltip, tên truy cập, focus, trạng thái chờ và phân quyền. Quy tắc tại `row-action-rules.ts`, `AGENTS.md`, `docs/admin-ui.md`, DESIGN A9 và bộ kiểm tra AST `ADMIN_ROW_ACTION` trong `lint:design`.
- `/admin/policies` giải thích cơ chế lưu phiên bản theo FR-011, bỏ cột Thao tác rỗng, hỗ trợ phạm vi tất cả loại xe (`vehicleTypeId: null`) và giới hạn tỷ lệ 0–100 theo API. Validation inline và dữ liệu biểu mẫu được giữ khi API báo lỗi.

## Rà soát API

GET/POST chính sách cho Admin/Manager đã có và được frontend kết nối; FR-011 không cho sửa/xóa bản đã tạo. Chưa coi backend hoàn chỉnh theo contract chung: còn thiếu phân trang danh sách, endpoint GET chi tiết tương ứng `Location` của POST và kiểm tra tham chiếu loại xe tại Application. Không sửa backend trong đợt này. Xem [báo cáo kiểm tra](../docs/rental-policy-api-audit.md).

## Kiểm chứng

- `npm run lint`, `npm run typecheck`, `npm run lint:design`, `npm run build`: đạt.
- `npm test`: 22 file, 118 kiểm thử đạt, gồm xử lý dữ liệu biểu đồ, component thao tác và quy tắc AST.
- Playwright dùng Chrome cài sẵn với API giả lập: 9 kiểm thử biểu đồ; 5 kiểm thử icon/thao tác/quyền; 3 kiểm thử chính sách; 9 kiểm thử hồi quy danh sách đạt (ca tra cứu xe chạy lại sau khi giữ nguyên tên truy cập nút Cập nhật).
- Ảnh biểu đồ đã được xem ở desktop/mobile và theme sáng/tối; không tràn ngang. Không gọi API triển khai để thay đổi dữ liệu thật.
- Windows sandbox không đọc được một số tệp biên dịch tạm; Vitest/build/Playwright được chạy ngoài sandbox sau khi cơ chế phê duyệt cho phép. Cấu hình kiểm thử trình duyệt tạm nằm trong thư mục bị Git bỏ qua, không đổi cấu hình Playwright mặc định.

Giữ nguyên các thay đổi chưa commit có sẵn trong workspace.
