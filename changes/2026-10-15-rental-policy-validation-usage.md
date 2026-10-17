# Loại xe và số lần thuê của chính sách

Form tạo kiểm tra loại xe hợp lệ và chặn active trùng đã có trên trang; backend kiểm tra đầy đủ mọi bản ghi, xác minh loại xe tồn tại và kiểm tra lại trong transaction. Lỗi VehicleTypeId hiển thị dưới select, focus đúng trường, giữ dữ liệu và popup. Theo xác nhận người dùng, cần tạm ngưng bản active cũ trước khi thêm/kích hoạt cùng phạm vi; scope chung null độc lập.

Thêm cột Số lần thuê: rentalCount do backend đếm theo policy_id, gồm mọi trạng thái, policy chưa dùng =0; thông báo giải thích cách đếm. GET danh sách có pagination và tổng server, UI thêm trang trước/sau. Đổi status giữ số đếm trả từ API. Adapter đọc được array cũ, khi thiếu count hiển thị dấu thiếu dữ liệu thay vì giả định0. Luồng đọc policy cho booking cũng được cập nhật để đọc đủ trang mới và giữ tương thích array.

Kiểm chứng: TypeScript/design lint đạt; 122 unit test và 9 E2E chính sách đạt (desktop1280/mobile390, field error, active trùng, count1234/0, pagination, pending/status). Backend có 147 test HTTP/contract đạt; chưa kiểm chứng PostgreSQL thật do cấu hình đăng nhập test. Cần cập nhật FE/BE và migration0019; chưa deploy hoặc ghi dữ liệu thật.
