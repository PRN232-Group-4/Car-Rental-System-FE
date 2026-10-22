# Sửa lỗi chọn giới tính trong hồ sơ khách hàng

- Nguyên nhân: callback cập nhật state đọc `event.currentTarget.value` sau khi React đã kết thúc xử lý sự kiện, nên `currentTarget` là `null` và trang lỗi ngay khi chọn giới tính.
- Dùng chung handler cập nhật thông tin cá nhân cho input/select; lấy `name` và `value` ngay trong sự kiện trước khi cập nhật state. Thay đổi giới tính cũng xóa thông báo đã lưu của lần trước.
- Giữ giá trị API `Male`/`Female`/`Other`/rỗng và cơ chế lỗi inline hiện tại.
- Kiểm thử hồi quy tái hiện lỗi trước sửa; kiểm tra lưu từng lựa chọn, giữ tên/điện thoại, và ánh xạ lỗi API về đúng select. Sửa giới tính chỉ xóa lỗi của giới tính, giữ lỗi và dữ liệu trường khác.

## Kiểm chứng

- `npx vitest run src/__tests__/features/profile/ProfileManager.test.tsx`: 7 test đạt sau sửa (5 test đầu lỗi `currentTarget` trước sửa), gồm kiểm tra trường bắt buộc và lỗi mạng giữ dữ liệu.
- `e2e/customer-profile-regressions.spec.ts`: 4/4 Playwright Edge đạt tại 1440px/375px, lưu cả bốn giá trị giới tính và gửi GPLX lần đầu từ hồ sơ trống; mọi API được chặn giả lập. Chạy bằng dev server cục bộ port 3105 do port 3000 đang được dùng.
