# Vận hành đơn thuê bằng checklist

- Bảng lệnh chỉ có thao tác chuyển bước kế tiếp; bỏ menu ghi đè trạng thái trùng lặp. Hủy đơn giữ dialog có lý do và chính sách từ server.
- Checklist phân biệt điều kiện tự động (kiểm tra trước/sau thuê, hóa đơn đã trả) với xác nhận thực tế của nhân viên (hồ sơ, tài xế, bàn giao, nhận trả, đối soát). Chỉ bật nút khi mọi mục hoàn tất; tick không thay thế dữ liệu kiểm tra/thanh toán hoặc guard server.
- Xác nhận gắn theo đơn, phương tiện và giai đoạn; refetch cùng giai đoạn giữ lựa chọn. Khóa checkbox/nút khi gửi và chặn gửi lặp. Lỗi không giả lập trạng thái thành công; dialog quyết toán giữ mở và cho thử lại.
- Thu gọn biểu mẫu kiểm tra, thanh toán và tài xế sau disclosure; trạng thái kết thúc không có nút đổi bước. Legacy RentalOperations dùng cùng checklist.
- Thanh tiến trình V4 dùng cam stage-amber cho bước đã qua, hiện tại và đường nối ở cả theme; glyph giữ chữ trắng trên mặt hồ sơ sáng.

Kiểm chứng: Vitest V4 30 tests và RentalJourney 4 tests (điều kiện thiếu/đủ, thanh toán chưa trả/lỗi, gói thuê, mutation pending/error, dialog completion, background refresh); typecheck và design lint. UI responsive/theme được parent kiểm tra qua Playwright.
