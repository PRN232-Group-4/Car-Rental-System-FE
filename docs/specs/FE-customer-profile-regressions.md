# Hồ sơ khách hàng — lỗi giới tính và trạng thái GPLX (2026-10-22)

## Hành vi

- Bản ghi GPLX có số null, rỗng hoặc chỉ khoảng trắng là chưa gửi, kể cả API cũ trả `pending`; `none` cũng là chưa gửi. Áp dụng tại `/profile` và `/driver-license`.
- Customer chưa gửi không thấy “Đã gửi tài liệu” hoặc “Chờ phê duyệt” và được gửi bộ thông tin/ảnh GPLX đầu tiên. Chỉ sau API lưu thành công mới hiển thị chờ duyệt.
- Chọn Nam, Nữ, Khác hoặc bỏ lựa chọn không làm trang lỗi; lưu giữ nguyên các giá trị API `Male`, `Female`, `Other`, rỗng. Thay đổi lựa chọn xóa thông báo lưu cũ.
- Lỗi validation API hiển thị dưới trường tương ứng; sửa giới tính chỉ xóa lỗi của trường đó. Lỗi mạng giữ dữ liệu để thử lại.

## Acceptance

- [x] Kiểm thử thành phần cho các lựa chọn giới tính, payload, lỗi API, trường bắt buộc và lỗi mạng.
- [x] Kiểm thử GPLX trống với các trạng thái mặc định và gửi lần đầu ở cả hai trang.
- [x] Kiểm thử trình duyệt desktop/mobile cho trạng thái ban đầu, chọn/lưu giới tính và gửi GPLX lần đầu (4/4 Edge, 1440px/375px; API được chặn giả lập).

Nguồn backend: FR-005/FR-006; API GET GPLX chuẩn hóa số trống thành `status=none`. Không sửa hoặc xóa dữ liệu giấy phép đang tồn tại.
