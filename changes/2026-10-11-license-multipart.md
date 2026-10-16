# Cập nhật GPLX qua multipart

Trang `/driver-license` gửi `PUT /api/customer/license` bằng FormData với `Number`, `Type`, `IssueDate` (nếu có), `ExpiryDate`, `File` theo API mới. Gửi file gốc trực tiếp, không chuyển thành base64 hoặc upload qua Cloudinary ở frontend. Trình duyệt tự đặt multipart boundary.

Giữ giao diện hiện tại, kiểm tra file bắt buộc và hiển thị lỗi trường tương ứng. Ngày cấp là tùy chọn theo hợp đồng API. Sau khi lưu, cập nhật ảnh và trạng thái từ phản hồi máy chủ. Luồng JSON theo URL ở trang profile chuyển sang endpoint `/api/customer/license/url`.
