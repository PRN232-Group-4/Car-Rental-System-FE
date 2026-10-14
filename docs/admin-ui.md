# Quy chuẩn giao diện Admin

Áp dụng cho toàn bộ `/admin/**` và các component được các trang này sử dụng. Các trang mới và mọi chỉnh sửa phải dùng quy chuẩn này cùng Phần A của `DESIGN.md`. Ưu tiên tái sử dụng component; thay đổi style chung tại component dùng chung để các trang cập nhật cùng nhau.

## Bố cục và tiêu đề

- Dùng `StaffShell` cho header, sidebar và khoảng đệm responsive. Nội dung trang có `space-y-6`; không thêm lề cố định theo sidebar vào từng trang.
- Tiêu đề nội dung: `text-2xl font-bold tracking-tight sm:text-3xl`. Mô tả: `text-sm text-ink-3`; nhãn phụ dùng `text-xs`.
- Dùng token từ `globals.css`: nền `canvas`, bề mặt `surface`, chữ `ink/ink-2/ink-3`, viền `line/line-strong`, màu hành động `primary`. Không dùng viền đen đậm hoặc màu palette tự đặt.
- Panel dữ liệu dùng nền surface, viền line 1px, bo góc 16px và shadow-e1. Không lồng card chỉ để trang trí.

## Bộ lọc, tìm kiếm và tra cứu

- Bắt buộc dùng `AdminFilterBar`, `AdminFilterField`, `AdminFilterButton` từ `src/components/admin/AdminFilters.tsx`. Không tự dựng toolbar lọc bằng một tập class riêng cho từng trang.
- Thanh lọc nằm trước bảng, có nhãn hiển thị rõ cho từng input/select và mô tả ngắn nếu cần. Không dùng placeholder thay cho label.
- Control cao 44px, chữ 14px, bo theo `--r-control`, viền `--line-strong`, nền surface; label 12px. Icon tìm kiếm/select không chắn thao tác hay nội dung.
- Nút áp dụng là primary, “Đặt lại” là secondary. Trên màn hình đủ rộng, control và nút cùng hàng; khi thiếu chỗ phải xuống hàng gọn, không tràn ngang.
- Bộ lọc áp dụng khi submit phải tách giá trị đang nhập và giá trị đã áp dụng. Bộ lọc tức thời giữ hành vi hiện có. Đặt lại phải xóa điều kiện, đưa phân trang về trang đầu nếu có, và xóa lỗi của form lọc.
- Dùng `ValidatedForm` và `InlineInput/InlineSelect` cho bộ lọc có submit/validation; mỗi form có validation riêng. Giữ lỗi ngay dưới trường, focus lỗi đầu tiên; không thêm ràng buộc nghiệp vụ chỉ để phục vụ style.

## Danh sách và thao tác

- Bắt buộc dùng `AdminTableCard`, `AdminTable`, `AdminTableEmptyRow` cho bảng danh sách. Cột thao tác đánh dấu `data-actions` để căn phải thống nhất.
- Header nền sunken, chữ muted 12px uppercase; thân bảng 14px, đường phân cách nhẹ và hover cùng token. Bảng rộng cuộn trong wrapper; toàn trang không tràn ngang.
- Không hiển thị ID kỹ thuật trong các bảng hoặc làm tên dự phòng. Dùng tên, biển số, email hoặc nhãn thiếu thông tin. Giữ ID trong state, URL, request để các thao tác trỏ đúng bản ghi.
- Thêm mới mở `FormDialog`, giữ dữ liệu khi API lỗi, tải lại danh sách sau khi lưu. Popup dài cuộn bên trong; không đóng lúc đang lưu/upload.
- Loading, lỗi, trạng thái trống và phân trang phải dễ đọc; không đổi kiểu viền, khoảng cách và kiểu nút giữa các trang.

## Kiểm tra trước khi hoàn tất

- Chạy lint các file sửa, TypeScript và `node scripts/check-design-rules.mjs`.
- Kiểm tra ở desktop và mobile: nhãn, chiều cao control, xuống hàng, focus và lỗi inline. Khi thay hành vi lọc, kiểm tra điều kiện gửi API, đặt lại và phân trang bằng API giả lập.
- Tôn trọng reduced motion; tên và trạng thái không được truyền đạt chỉ bằng màu.
