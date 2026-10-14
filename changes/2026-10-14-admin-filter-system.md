# Đồng bộ bộ lọc và quy chuẩn giao diện Admin

- Thêm `AdminFilterBar`, `AdminFilterField`, `AdminFilterButton` và CSS dùng chung: card viền nhẹ theo token, control 44px, label hiển thị, nút áp dụng/đặt lại và bố cục theo không gian thực tế của panel.
- Áp dụng cho bảo trì, điều phối, danh sách phương tiện, tìm nhân viên và tra cứu đơn thuê; giữ hành vi lọc tức thời hoặc submit của từng màn hình.
- Đặt lại xóa điều kiện và lỗi của bộ lọc, khôi phục dữ liệu không lọc từ cache khi còn mới; phương tiện/nhân viên về trang đầu.
- Panel nghiệp vụ dùng viền line và shadow-e1; tiêu đề nghiệp vụ dùng cùng cỡ chữ responsive. Hiệu ứng sidebar chỉ chạy khi người dùng đóng/mở, tránh lệch nội dung lúc tải trang.
- Bổ sung quy tắc bắt buộc vào `AGENTS.md`, liên kết trong `DESIGN.md` và hướng dẫn triển khai tại `docs/admin-ui.md`.
- Kiểm thử API giả lập cho áp dụng/đặt lại, validation, style control và bố cục desktop/mobile; kiểm tra hồi quy popup, bảng, avatar và sidebar.
