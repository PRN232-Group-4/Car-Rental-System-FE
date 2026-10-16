# FE-15 / FE-16 — Vận hành đơn thuê và kiểm tra xe

- `/admin/rentals`: tra cứu đơn bằng mã, xem xe/thời gian/trạng thái, phân công tài xế, chuyển trạng thái bàn giao / nhận xe / hoàn tất / hủy. Xe phân công là xe có sẵn trong đơn theo AssignmentRequest.
- `/admin/inspections`: checklist, ghi chú hư hỏng, odometer, mức nhiên liệu/pin, ảnh kiểm tra và kết luận đạt/không đạt. Ảnh upload multipart tới `/api/media/inspection`, URL trả về được lưu dưới dạng chuỗi JSON trong `imageUrls`. Checklist được lưu cùng `damageNotes` vì API chưa có trường checklist riêng.
- Các request đi qua backendApiClient tới API thật, giữ session cookie qua proxy. Backend quyết định quyền truy cập và điều kiện chuyển trạng thái; FE không giả lập thành công.
- Theo Swagger được cung cấp, chưa có GET danh sách đơn thuê hoặc GET lịch sử kiểm tra. Màn hình dùng tra cứu mã đơn, không tạo danh sách/lịch sử giả.
