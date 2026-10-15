# Admin: sidebar, Dark mode, trạng thái và popup

## Kết quả

- Sidebar thu gọn căn giữa icon/logo/avatar, giữ gutter scrollbar hai bên bằng nhau.
- Header có nút Chế độ tối; lưu lựa chọn, mặc định theo hệ điều hành khi chưa chọn. Token áp dụng cho nội dung, popup và toast; gỡ theme khi rời Admin.
- Badge dùng ánh xạ nghiệp vụ chung. Active/available/approved xanh lá; inactive và trạng thái lạ không bị nhận nhầm. Design lint chặn bảng màu trạng thái cục bộ và dùng primary cho active.
- Popup tạo/sửa dùng footer sticky; sửa xe mở ngay trên danh sách. Giữ route sửa trực tiếp và xử lý lỗi inline.
- Ngày giờ hiển thị `dd/MM/yyyy HH:mm` theo Asia/Ho_Chi_Minh; ngày thuần `dd/MM/yyyy`. Input native và payload API giữ kiểu ISO; form thời gian có preview dễ đọc.
- Cập nhật DESIGN.md và docs/admin-ui.md để áp dụng cho các thay đổi sau.

## Kiểm chứng

- TypeScript, ESLint các file thay đổi, design lint: đạt.
- Vitest: 77/77 test đạt, gồm 3 test màu trạng thái và 5 test ngày giờ.
- Playwright trên Chrome cài sẵn: 39/39 test đạt cho giao diện Admin, tạo/sửa, lọc, ảnh, ngày giờ và validation. API giả lập hoàn toàn, không ghi vào backend thật.
- Ảnh desktop/mobile xác nhận icon nằm giữa, popup tối đọc được và footer luôn hiện khi cuộn.

## Google Maps / Railway

Hướng dẫn theo adapter backend hiện tại nằm tại `../Car-Rental-System-BE/docs/google-maps-setup.md` (từ thư mục gốc frontend). Đã đối chiếu tài liệu chính thức Railway Variables/Static Outbound IPs và Google Maps Legacy/key restrictions ngày 2026-10-15. Chưa thay đổi Variables hoặc triển khai Railway; chưa kiểm chứng key/billing/provider thật.
