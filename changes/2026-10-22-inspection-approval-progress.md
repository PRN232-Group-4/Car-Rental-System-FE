# Đồng bộ kiểm tra và tiến trình duyệt yêu cầu

Checked trước đây chỉ ghi evidence; tiến trình theo status pending nên vẫn ở Nhận đơn. Admin checked pending nay xác nhận rõ kiểm tra đạt kèm duyệt, gửi approveRequest=true để backend chuyển pre_inspection nguyên tử. Form chỉ hiển thị trạng thái backend sau refetch, làm mới hàng đợi/danh sách/count, khóa gửi lặp và giữ input khi lỗi.

Đơn cũ pending đã pass có giải thích chưa duyệt và nút Duyệt yêu cầu đã kiểm tra qua confirm, không sửa/ghi đè evidence. Banner pending/pass nêu chờ duyệt; pre_inspection/pass nêu đã đạt, cần hoàn tất điều kiện bàn giao. Driver_default không tự duyệt, kiểm tra đạt không tự bắt đầu chuyến hoặc đánh dấu đã thu tiền. Backend cũ bỏ qua flag vẫn giữ pending đúng server và dùng nút confirm riêng.

Kiểm chứng: 43 unit/integration FE và 18 Edge E2E desktop/mobile đạt; backend 58 tests đạt trên PostgreSQL riêng. Gồm pending check+approval, legacy pass/default, backend cũ và API lỗi; TypeScript/design lint đạt, ESLint file liên quan 0 lỗi/7 warning cũ. Không migration mới/chưa deploy, cần backend mới để thực hiện thao tác gộp.
