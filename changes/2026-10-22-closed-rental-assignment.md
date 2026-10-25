# Ẩn phân công sau khi hủy hoặc hoàn tất đơn

Lỗi: workspace vẫn render form phân xe/tài xế và ghi đè thủ công dù status cancelled. Nút lưu vì thế vẫn xuất hiện trong ảnh người dùng.

Đã dùng điều kiện trạng thái khớp backend: chỉ pre_inspection/renting có form phân xe, tải driver options và gửi assignment. Cancelled/completed không còn form phân công hoặc ghi đè trạng thái; shared transition blocker cũng chặn chuyển trạng thái từ hai trạng thái kết thúc. Áp dụng cùng điều kiện cho màn vận hành dạng danh sách. Lịch sử kỹ thuật và biên bản vẫn đọc được.

Kiểm chứng: 45 unit/integration và 14 Edge E2E desktop/mobile đạt, gồm mở trực tiếp cancelled/completed và hủy từ pending/pre_inspection rồi xác minh nút biến mất. TypeScript/design lint/diff-check đạt, ESLint 0 errors và 7 cảnh báo có sẵn ở workspace. Không đổi backend, migration hoặc deploy.
