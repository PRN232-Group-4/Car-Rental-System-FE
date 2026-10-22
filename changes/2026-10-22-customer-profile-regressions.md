# Sửa giới tính và trạng thái GPLX trên FE mới

- Áp dụng lại trên source FE `ae93988` sau khi người dùng lấy bản mới.
- Sửa select giới tính dùng handler lấy name/value ngay trong sự kiện; không đọc `currentTarget` trong callback state sau khi React đã kết thúc sự kiện.
- Hồ sơ chưa có số GPLX không còn bị coi đã gửi vì `pending` mặc định. Dùng helper chung cho `/profile` và `/driver-license`, tương thích response `none` của backend đã sửa và `pending` của backend cũ.
- Khôi phục kiểm thử hồi quy cho chọn/lưu giới tính, lỗi inline/mạng, hồ sơ GPLX trống và gửi lần đầu; thêm luồng Edge desktop/mobile với API giả lập.
- Không thay đổi dữ liệu GPLX đã lưu. Chuỗi `TEST-GPLX-0007` trong ảnh chưa xác định nguồn; bản sửa này xử lý hồ sơ trống.

Kiểm chứng lại trên source mới: 40/40 unit test liên quan (7 hồ sơ, 29 form GPLX, 4 helper); 4/4 Playwright Edge tại 1440px/375px với API giả lập; TypeScript, ESLint các file thay đổi và `git diff --check` đạt. Chưa commit/push/deploy.
