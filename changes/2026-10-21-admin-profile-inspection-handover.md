# Sửa hồ sơ admin, phân công kiểm tra và bàn giao xe

- Tách tải tên cơ sở khỏi hồ sơ chính để API danh mục lỗi/chậm không chặn xem, sửa tài khoản. Giữ giới tính khi cập nhật liên hệ; bảo vệ dữ liệu phân trang bằng test hồi quy.
- Thêm phân công kỹ thuật viên trước thuê trong hồ sơ vận hành và trang biên bản, dùng API lưu phân công mới, lọc đúng nhân viên Maintenance đang hoạt động trên mọi trang.
- Chặn bàn giao khi chưa có kiểm tra trước thuê đạt và chặn quyết toán khi chưa có biên bản sau thuê. Bổ sung đường mở biên bản, tải lại kết quả và thông báo tiếng Việt.
- Giữ thông báo thành công sau tải lại hồ sơ; cập nhật trạng thái và hàng đợi sau API thành công.
- Bỏ fallback danh sách tài xế sang nhân viên bất kỳ khi API lỗi; cho phép thử lại lỗi tải.
- Giải quyết dấu merge conflict đã tồn tại tại RentalOperations, RentalLookup và VehicleForm để mã nguồn phân tích được.

Hợp đồng và tiêu chí: [FE-15](../docs/specs/FE-15-rental-inspection-readiness.md). Cần triển khai backend mới (migration `0025_inspection_assignments.sql`) cùng frontend để dùng phân công và hai trường điều kiện kiểm tra.

## Kết quả kiểm tra

- Toàn bộ Vitest tại thời điểm chạy: 73 file / 552 test đạt; các test bổ sung và chỉnh sửa sau đó được chạy riêng đều đạt (nhóm hồ sơ, bàn giao, phân công, API contract).
- Playwright chạy với Edge local: 4/4 test đạt, kiểm tra bàn giao/phân công ở 1600/1280/390px, ảnh light/dark và hồ sơ khi API cơ sở lỗi.
- `lint:design`, ESLint các file thay đổi và `git diff --check` đạt.
- `typecheck` toàn dự án còn lỗi có sẵn trong `TrackingManager.tsx` (component/API bản đồ bị thiếu) và `HandoverPanel.tsx` (thiếu handover-api/confirmHandover). Các file này không được route sử dụng; chưa thay đổi trong phạm vi sửa lỗi này.
- Backend liên quan: 110/110 test đạt trên PostgreSQL, gồm migration, phân quyền, envelope HTTP và điều kiện kiểm tra. Chưa tái hiện lỗi 500 danh sách tài xế của bản production trên source local.
