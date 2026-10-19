# Admin: danh sách yêu cầu và đơn thuê

- `/admin/rentals` tải toàn bộ yêu cầu đặt xe và đơn thuê chính thức qua `GET /api/rentals`, mặc định không giới hạn trạng thái. Dùng phân trang server và cho chọn 10/20/50/100 bản ghi mỗi trang.
- Bảng hiển thị khách hàng, phương tiện thật, thời gian, hình thức lái/tài xế, tổng tiền và trạng thái. Phân biệt yêu cầu đặt xe với đơn thuê chính thức bằng `orderId`; không dựng dữ liệu mẫu hoặc dùng ID làm tên trong danh sách.
- Cột **Xem chi tiết** dùng icon `view` chung, cập nhật `rentalId` trên URL và mở phần chi tiết/vận hành hiện có. Chuyển sang bản ghi khác tải đúng chi tiết tương ứng.
- Bộ lọc trạng thái áp dụng sau submit, đặt lại đưa về trang đầu; lỗi trường hiển thị inline, lỗi tải có nút thử lại. Giữ header/skeleton khi tải, không hiển thị thông báo trống khi API lỗi, bảng cuộn ngang trong vùng riêng trên mobile.

## Kiểm tra

- ESLint các file thay đổi và `npm run lint:design` đạt.
- `e2e/admin-rentals.spec.ts` kiểm tra mặc định tất cả trạng thái, phân trang, lọc/đặt lại, icon mở và đổi chi tiết, lỗi/thử lại, viewport mobile.
- Lượt tổng hợp cuối đạt 8/8 ca Admin, gồm refresh bảng/tiến trình sau duyệt và 404 detail không dùng dữ liệu giả. Thêm cột mã yêu cầu/mã đơn, refresh cache danh sách khi thao tác vận hành thành công. Xem `2026-10-18-customer-admin-rental-progress.md` cho kiểm chứng tích hợp và giới hạn build.
