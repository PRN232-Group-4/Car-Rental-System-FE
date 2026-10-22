# Thu gọn bảng lệnh và làm rõ nút nhận trả xe

Thao tác chính trước đây dùng nhãn dài và nằm trên phần phân công nên dễ khuất khi cuộn. Workspace nay hiển thị ngắn theo status: Xác nhận đơn, Bàn giao xe, Đã trả xe, Hoàn tất; giữ aria-label đầy đủ và API/lifecycle/permission cũ. Primary dính đầu cột desktop, phần trả xe có link cuộn thẳng đến nút. Pending/pre_inspection giải thích phải bàn giao trước khi có nút Đã trả xe; không tự nhận xe khi mới phân công.

Inspection compact có chọn Phân công chờ kỹ thuật hoặc Đã inspect, chỉ một nút submit tương ứng Xác nhận/Đã inspect. Chế độ inspect cần Admin, nêu rõ xác nhận đạt thực tế và pending kèm duyệt như contract đã có; bỏ các nút lặp và xác nhận inline thứ hai trong workspace. Legacy form giữ hành vi hiện hữu. Kết quả đã đạt chỉ hiện tóm tắt, lịch sử/liên kết ở Chi tiết kiểm tra. Không lặp nút duyệt trong khối kỹ thuật.

Phân xe/tài xế mặc định thu gọn khi renting, mở ở pre_inspection và tự đóng sau lưu thành công; vẫn mở lại được. Ghi đè thủ công nằm trong Thao tác khác. Không thay nghiệp vụ nhận trả xe hay thanh toán.

Kiểm chứng: 45 unit/integration tests và 36 Edge E2E desktop/mobile đạt, gồm nút return tìm được sau cuộn/anchor, lưu returnedAt, API lỗi không đổi trạng thái, kiểm tra/phân công, lưu phân công tự thu gọn, không tràn ngang và lỗi backend thiếu route. TypeScript/design lint đạt; ESLint file liên quan 0 lỗi/7 warning cũ. Đã xem ảnh 1440px/390px. Chỉ sửa FE, chưa deploy.
