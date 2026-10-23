# 2026-10-23 — Danh sách thanh toán cho Admin và Manager

- Thêm `/admin/payments` vào chương Vận hành, điều hướng và phân quyền riêng cho Admin/Manager. Trang và query đều kiểm tra quyền; cache phân biệt tài khoản và vai trò.
- Dùng TransitFolio, AdminFilterBar, AdminTable, AdminTableSkeleton và AdminStatusBadge theo Transit Desk. Bảng hiển thị giao dịch, đơn thuê, hóa đơn, loại, số tiền, phương thức, trạng thái, tham chiếu nhà cung cấp và thời điểm GMT+7.
- Bộ lọc tìm mã/tham chiếu, trạng thái, loại giao dịch và phương thức chỉ áp dụng khi nhấn Áp dụng; Đặt lại xóa bộ lọc và về trang đầu. Bảng có phân trang 20 giao dịch, skeleton, trạng thái trống, lỗi quyền/kết nối và tải lại.
- Đọc dữ liệu thật từ `GET /api/payments`; giữ thứ tự ổn định `ORDER BY p.id DESC` của backend. Không thay đổi API khách hàng đang sử dụng. Dữ liệu sai contract gây lỗi tải, không chuyển thành danh sách rỗng hoặc số liệu giả.
- Thêm domain trạng thái payment dùng chung. Ledger hoàn tiền có `type=refund,status=paid` được trình bày và lọc là Đã hoàn tiền; không tính như một khoản thu mới.

## Giới hạn contract hiện tại

`PaymentsController.Payments` hiện trả mảng `PaymentSummary[]`, chỉ hỗ trợ query `invoiceId`. FE tải danh sách đầy đủ rồi lọc/phân trang trên trình duyệt; không gửi tham số server không hỗ trợ. Contract chưa có mã order chính thức, tên khách hàng hoặc tổng tiền thu ròng, nên trang chỉ hiển thị mã đơn thuê/hóa đơn có thật và không suy diễn những trường này. Danh sách bao gồm thanh toán gói đăng ký không gắn đơn thuê. Khi backend bổ sung server pagination, cần cập nhật adapter trước khi dùng envelope phân trang; payload mới không đúng contract hiện tại sẽ báo lỗi rõ ràng.

## Kiểm chứng

- Vitest: API adapter, component directory, phân quyền/điều hướng và status rules (35 tests) đạt.
- TypeScript, ESLint các file liên quan và design lint được kiểm tra cùng thay đổi.
- Không sửa backend hoặc thêm thao tác phê duyệt/thu tiền ngoài yêu cầu xem danh sách.
