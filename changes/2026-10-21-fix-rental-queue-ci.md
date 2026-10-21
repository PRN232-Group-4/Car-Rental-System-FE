# Sửa lỗi TypeScript sau merge ở hàng đợi vận hành

- Phân biệt kiểu dữ liệu hàng đợi với hồ sơ đơn thuê đầy đủ. Trường chỉ có ở detail là tùy chọn ở queue; không thêm giá trị giả vào response.
- Khi danh sách không trả rentalType, hiển thị chưa có hình thức thuê thay vì mặc định dài hạn.
- Cập nhật mock tài xế theo assignable-drivers và DTO staffId/eligible; chờ danh sách trả về trước thao tác trong test hiện có.
- Đồng bộ các kiểm tra quyền trong test với API hiện tại: Staff/phiên chưa xác thực không tải danh sách hoặc hồ sơ vận hành.
- Cài dependency từ package-lock hiện tại để có Mapbox trên máy local, không sửa package-lock. Sinh lại kiểu route bị cũ do profile được chuyển thư mục; đây là file sinh tự động, không commit.

Kiểm tra: lint và design lint không có lỗi; TypeScript --noEmit --incremental false thành công. Không chạy test hoặc build theo yêu cầu của người dùng. Trạng thái CI/Cloudflare phải được xác nhận ở lần chạy sau khi push.
