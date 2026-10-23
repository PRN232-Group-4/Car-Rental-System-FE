# FE — Dữ liệu thật trong giao diện (2026-10-22)

Yêu cầu: bỏ mock data trong luồng chạy ứng dụng. Yêu cầu hiện tại thay thế các hướng dẫn cũ cho phép mock/fallback nghiệp vụ trong FE-FOUNDATION và FE-04.

- API thực là nguồn dữ liệu nghiệp vụ. Không tự dựng đơn thuê, tài xế, phương tiện, giấy phép, gói thuê bao, ngày hiệu lực hay quyền lợi gói khi API thiếu dữ liệu.
- Không tự điền mẫu đăng ký, không cung cấp ID đơn mẫu hoặc thao tác gán tài xế cho ID cố định. Chỉ thao tác trên bản ghi API/đơn người dùng đã chọn.
- Giá dự toán chỉ hiển thị khi đủ đơn giá và policy thực; thiếu policy, phí tài xế hoặc giá dài hạn phải báo chưa đủ dữ liệu. Không giả VAT/cọc/phí tài xế hay chiết khấu tháng. OvertimeFeeRate là phần trăm cộng vào đơn giá giờ, không phải số tiền/giờ.
- Không hiển thị chứng nhận kiểm tra, số km, pin, nhân sự, ưu đãi hay SLA hoàn cọc/bàn giao bịa đặt. Nội dung giới thiệu mô tả quy trình, không đóng vai bản ghi nghiệp vụ trực tiếp.
- Bộ lọc hãng cho phép nhập hãng cần tìm; gợi ý chỉ dùng dữ liệu do caller cung cấp. Lịch tài xế dùng ID/lịch thuê API và vùng đệm API, kể cả 0 phút.
- Phân biệt đang tải, danh sách rỗng và lỗi tải gói thuê bao. Thiếu trường cho biết chưa có thông tin.
- Giữ fixtures unit/e2e và script seed có chủ đích để kiểm thử. Không xóa dữ liệu đang lưu trong database.

Acceptance: regressions giá/policy và mapper không bịa dữ liệu; kiểm tra trạng thái pending/empty/error gói thuê bao; TypeScript, ESLint và design lint đạt. Backend đã rà soát không có mock/seeder tự chạy trong src; không sửa dữ liệu hoặc logic backend ở phạm vi này.
