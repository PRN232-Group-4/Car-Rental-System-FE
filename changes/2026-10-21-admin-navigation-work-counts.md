# 2026-10-21 — Dấu nhắc công việc trên menu Admin

- Gắn `GET /api/admin/navigation-counts` vào Transit Desk: dấu chấm ở góc phải chương có việc và số chính xác ở mục con; ẩn khi 0/chưa có dữ liệu/lỗi.
- Thêm mục Duyệt GPLX vào Chăm sóc & Sự cố, mở danh sách khách hàng với bộ lọc chờ duyệt; Admin mở hồ sơ GPLX qua thao tác xem, Manager giữ quyền đọc.
- Cache theo tài khoản/quyền/cơ sở, poll 30 giây khi hoạt động; tải lại sau xử lý đơn thuê, kiểm tra xe, bảo trì, báo cáo hoặc GPLX thành công.
- Phân quyền menu giữ nguyên; số lấy từ phạm vi backend, không suy ra từ số hàng trên trang hoặc đếm lịch sử. “Mới” được hiểu là đang chờ xử lý.
- Spec: `docs/specs/FE-26-admin-navigation-work-counts.md`.
- Đồng bộ Swagger/schema từ backend runtime cho snapshot queue và phản hồi 429 của xác thực. Test cô lập theme mock hook queue để tiếp tục kiểm tra cleanup mà không phụ thuộc provider mạng.
- Kiểm chứng: 636/636 unit test (89 file), 8/8 E2E Edge (1600/1280/390px, light/dark, zero/error và quyền GPLX); typecheck, design lint và production static build đạt. ESLint toàn repo 0 lỗi/25 cảnh báo có sẵn. Lượt Vitest đầu bị mất file tạm của sandbox; chạy lại với TEMP/TMP trong workspace đạt. Build trong sandbox không tiến triển, chạy lại ngoài sandbox đạt. Chưa deploy hoặc gọi provider thật.
