# FE-26 — Dấu nhắc hồ sơ chờ xử lý trong điều hướng Admin

## Hành vi

- Chương Vận hành hoặc Chăm sóc & Sự cố có một chấm cam ở góc trên phải khi ít nhất một mục con được phép xem có số việc lớn hơn 0.
- Mục con hiển thị chính xác số hồ sơ chờ xử lý bằng nhãn số mono; 0, dữ liệu lỗi/chưa tải hoặc count không hợp lệ không hiện badge. Trình đọc màn hình có mô tả tương ứng; dấu chấm không nhấp nháy.
- “Mới” nghĩa là công việc hiện đang chờ xử lý, không phải chưa đọc theo thời gian hoặc đã xem menu. Mở trang không xóa dấu nhắc; chỉ dữ liệu nghiệp vụ quyết định số lượng.
- Duyệt GPLX vào `/admin/customers?licenseStatus=pending`, khởi tạo bộ lọc chờ duyệt; đặt lại vẫn xem tất cả khách hàng. Admin mở hồ sơ GPLX bằng thao tác xem theo `userId`; Manager giữ chế độ chỉ đọc hiện hữu.
- Menu GPLX dùng quyền đọc Admin/Manager hiện có; không mở thêm quyền vào trang chi tiết người dùng hoặc thay quyền duyệt.

## Hợp đồng và phạm vi

`GET /api/admin/navigation-counts` dùng envelope hiện hữu, `data` gồm năm số nguyên không âm:

| Trường | Mục con | Hồ sơ được tính |
| --- | --- | --- |
| rentals | Vận hành đơn thuê | Đơn `pending` |
| inspections | Kiểm tra xe | Đơn `pre_inspection` / `post_inspection` chưa có biên bản tương ứng của xe hiện tại |
| maintenance | Quản lý bảo trì | Phiếu `open` / `scheduled` |
| reports | Báo cáo sự cố | Báo cáo nhân viên `open` |
| licenses | Duyệt GPLX | GPLX `pending`, số GPLX không rỗng, tài khoản khách tồn tại |

Backend áp quyền và phạm vi của từng danh sách. Admin/Manager xem báo cáo toàn hệ thống; nhân viên khác chỉ tính báo cáo do chính họ tạo theo claim `staff_id`. Các queue khác theo quyền truy cập API; số của queue không được phép là 0. Không tự lọc theo cơ sở khi danh sách nguồn không lọc như vậy. Không đếm biên bản lịch sử đã lập hoặc đánh giá nhân sự (API đánh giá chưa có trạng thái kiểm duyệt).

FE chỉ tổng hợp dấu chấm trên các mục con đã lọc quyền, không cộng tổng để tránh đếm trùng một đơn ở nhiều nghiệp vụ. Cache phân biệt email, vai trò, cơ sở để tránh lẫn tài khoản; request hỗ trợ hủy. Sau khi xác nhận quyền portal, làm mới mỗi 30 giây khi tab hoạt động và khi quay lại cửa sổ. Mutation thành công trong vận hành đơn thuê, lập biên bản, bảo trì, xử lý báo cáo và duyệt GPLX làm mất hiệu lực cache để tải ngay; lỗi mutation giữ số hiện tại.

## Kiểm chứng

- Unit: route mapping, dữ liệu không hợp lệ/0, nhãn số chính xác và a11y, quyền menu GPLX, chưa xác nhận portal, cache tách tài khoản, cập nhật sau duyệt thành công và giữ số khi duyệt lỗi.
- E2E với API giả lập: chấm cha / số con ở 1600, 1280, 390px, light/dark; không tràn trang; link GPLX khởi tạo `pending`; API lỗi hoặc count 0 không dựng chỉ báo giả.
- Dùng token `td-oxide` / `td-rule`, bo 4px cho count; giữ dải điều hướng cuộn ngang hiện hữu và trạng thái focus/current.
