# Bỏ dữ liệu mẫu khỏi runtime

- Bỏ nút điền mẫu đăng ký, ID đơn mẫu và nút gán driver cho đơn #104 cố định; lịch và drawer lấy thông tin từ bản ghi API hoặc báo thiếu.
- Bỏ fallback VAT/cọc/phí tài xế/giá tháng, chính sách phạt và SLA không có nguồn; dùng policy thực, diễn giải overtime theo phần trăm. Không có đủ dữ liệu thì báo chưa thể dự toán.
- Mapper không tự dựng ngày thuê bao/quyền lợi giao xe/trạng thái active; tôn trọng supportsSubscription từ API. Bộ lọc hãng cho phép nhập, không giả danh mục xe.
- Bỏ chứng nhận, số liệu cảm biến, nhân sự, ảnh chụp tài khoản/app giả và SLA 3/5 phút trong các component giới thiệu. Phân biệt loading/empty/error cho gói thuê bao.
- Xóa adapter upload giấy phép không dùng vốn trả base64 giả thành URL upload thành công; luồng thực tiếp tục dùng multipart/backend Cloudinary.
- Không thay fixtures kiểm thử hoặc dữ liệu database. Audit src backend không tìm thấy mock/seeder runtime.

Kiểm chứng: 21 regressions mapper/giá/policy/loading-empty-error đạt. Spec: docs/specs/FE-runtime-data.md. Chưa deploy.
