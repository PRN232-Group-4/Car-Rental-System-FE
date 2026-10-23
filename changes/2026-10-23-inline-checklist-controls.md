# Thao tác kiểm tra và thanh toán ngay trong checklist

- Trong bước kiểm tra trước thuê, hiển thị biểu mẫu phân công/xác nhận kiểm tra dưới checkbox kiểm tra; hiển thị hóa đơn và thao tác xác nhận thu tiền mặt dưới checkbox thanh toán.
- Trong bước kiểm tra sau trả xe, hiển thị biểu mẫu kiểm tra sau thuê cùng checkbox tương ứng. Gỡ các disclosure trùng trong các bước này; giai đoạn chưa duyệt và hồ sơ đã kết thúc vẫn có phần tra cứu kiểm tra phù hợp.
- Áp dụng cho `RentalWorkspaceV4` và `StatusForm` chung. Các biểu mẫu là sibling, không lồng form hoặc đặt form trong label. Bố cục nhúng dùng đường phân tách của checklist.
- Giữ nguyên quyền phân công, xác nhận kiểm tra, thu tiền; xác nhận thu tiền mặt vẫn cần popup. Giao dịch online chỉ đọc trạng thái hệ thống. Checkbox tự động chỉ đọc dữ liệu máy chủ; chưa đạt kiểm tra/chưa thanh toán hoặc thiếu xác nhận thủ công vẫn chặn bàn giao.
- Không đổi API và không đổi quy tắc chuyển trạng thái.

Kiểm thử: 5 suite vận hành (71 tests), scoped ESLint và TypeScript typecheck. Test tích hợp mới kiểm tra vị trí control, form độc lập, role và điều kiện bàn giao; các suite cũ tiếp tục kiểm tra lỗi API, loading và gửi lặp.

Selector kiểm tra UI:

- `getByRole('group', { name: 'Điều kiện chuyển bước' })`
- `[data-workflow-condition="inspection"]` / `[data-workflow-condition="payment"]`
- `getByLabel('Kỹ thuật viên phụ trách')`, `getByLabel('Thao tác kiểm tra')`
- `getByRole('button', { name: 'Xác nhận đã thanh toán tiền mặt' })`
- `getByRole('button', { name: 'Xác nhận đã nhận đủ tiền' })`
- `#rental-primary-action`
