# 2026-10-12 — Tối ưu layout Login & Register fit 1 màn hình desktop

- **FR/NFR:** NFR-008 (nền tảng/UI)
- **Loại:** polish (UI)

## Vấn đề trước khi sửa

- Cả 2 trang `/login` và `/register` dùng layout 2 cột (split-hero): cột trái chứa danh thiếp giới thiệu dài dòng (4 card tính năng, testimonial, checklist, ảnh đại diện) và cột phải chứa form.
- Khi render trên desktop ở các độ phân giải tiêu chuẩn (1366x768, 1440x900, 1920x1080), nội dung trang cao từ **1055px đến 1093px** dẫn tới tình trạng **cuộn trang dọc bất tiện và layout bị rối mắt**.

## Đã thực hiện

1. **Loại bỏ hoàn toàn các thành phần trang trí không cần thiết**:
   - Bỏ cột trái rườm rà (badge giới thiệu, 4 feature cards, testimonial box, danh sách lợi ích không liên quan tới hành vi đăng nhập/đăng ký).
   - Tối giản header chỉ giữ Logo và nút quay lại "Về trang chủ".

2. **Tối ưu form card nằm gọn chính giữa viewport**:
   - Sử dụng layout căn giữa đơn giản: `h-dvh overflow-hidden flex flex-col justify-between`.
   - Card form gọn gàng (`max-w-md`), padding `p-6 sm:p-7`, chiều cao card vừa vặn (640px – 708px), fit 100% không cuộn trên cả màn hình 700px, 768px, 800px và 900px.
   - Thanh demo account thu về 1 dòng nhỏ gọn phía trên form card.
   - Thống nhất các button submit, Google OAuth, link chuyển đổi tài khoản theo đúng tỉ lệ và khoảng cách thiết kế.

3. **Kiểm chứng tự động**:
   - Đo lường scroll: `scrollHeight === innerHeight` (không có thanh cuộn) trên cả 2 trang ở các chiều cao 700px, 768px, 800px, 900px.
   - Chạy toàn bộ 16 Playwright tests: **16/16 pass**.
   - Chạy toàn bộ e2e test suite: **54/54 pass (1 skipped do thiếu AI model)**.
   - Design rules lint và typecheck: **100% clean**.
