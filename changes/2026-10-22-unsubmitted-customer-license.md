# GPLX của khách hàng chưa gửi hồ sơ

- `/profile` trước đây đánh dấu “Đã gửi tài liệu” và khóa gửi chỉ dựa trên status, nên bản ghi customer mới với mặc định backend `pending` bị coi là hồ sơ đã gửi.
- Dùng cùng quy tắc có số GPLX với luồng đặt xe; số null/rỗng/khoảng trắng hoặc `status=none` không hiển thị chờ duyệt. Áp dụng cho cả `/profile` và badge ở `/driver-license`.
- Hồ sơ thực sự đã gửi vẫn hiện pending và `/profile` vẫn chặn gửi lặp; sau lần gửi đầu thành công mới chuyển sang đã gửi/chờ duyệt.
- Kiểm chứng: **33/33 tests pass** trong `LicenseForms.test.tsx` và `booking-license.test.ts`, bao gồm response pending cũ, none, upload đầu tiên, pending thực sự, file/date validation, backend validation và lỗi mạng.
- Backend tương ứng chuẩn hóa GET customer chưa có số GPLX thành none; frontend vẫn xử lý đúng khi backend cũ trả pending. Chưa deploy; không thay đổi hoặc xóa GPLX đã lưu.
- Playwright Edge: 4/4 đạt tại 1440px/375px, gồm chọn/lưu giới tính và gửi GPLX đầu tiên từ response `pending`/`none` trống; API giả lập toàn bộ.
- Ảnh báo lỗi có số `TEST-GPLX-0007`; chuỗi này không xuất hiện trong mã nguồn đã tìm. Bản sửa trên xử lý hồ sơ trống, chưa xác định nguồn số/metadata đã có trong tài khoản ở ảnh.
