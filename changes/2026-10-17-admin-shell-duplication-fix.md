# Admin: bỏ shell lồng nhau và sửa bảng ẩn gây tràn ngang

## Nguyên nhân

- 13 trang Admin mới thêm tự bọc thêm `<StaffShell>` trong khi `src/app/admin/layout.tsx` đã bọc sẵn. Kết quả là hai shell lồng nhau trong cùng một trang:
  - header sticky được vẽ lần thứ hai ngay trong vùng nội dung, đè lên tiêu đề trang;
  - sidebar lặp DOM, trùng `id="portal-desktop-navigation"`;
  - vùng nội dung bị thu còn khoảng 688px trong khung 1020px nên lưới thẻ KPI bị bóp, chữ xuống dòng từng từ và cột cuối bị cắt.
- `RatingDistribution` đặt `className="sr-only"` trực tiếp trên `<table>`; bảng vẫn chiếm layout nên đẩy `documentElement.scrollWidth` lên 394px trên mobile.

## Thay đổi

- Bỏ `import StaffShell` và cặp thẻ `<StaffShell>`/`</StaffShell>` ở 13 trang, để layout chung đảm nhận shell:
  `dashboard`, `policies`, `drivers/schedule`, `reports`, `reports/detail`, `reviews`, `reviews/detail`, `staffs`, `staffs/new`, `staffs/detail`, `users`, `users/detail`, `subscription-plans`.
  `AuthGate` cấp trang (giới hạn vai trò riêng của từng màn) giữ nguyên; không đổi nghiệp vụ, request API, phân quyền hay style.
- `src/features/admin/reviews/components/RatingDistribution.tsx`: bọc bảng dành cho trình đọc màn hình trong `<div className="sr-only">` để bảng không còn tham gia layout.

Không đổi component dùng chung, không đổi token, không thêm phụ thuộc.

## Kiểm chứng

- `tsc --noEmit`, `eslint` trên 14 file thay đổi, `lint:design`: đạt.
- Vitest: 61 file / 467 test đạt (bao gồm các test Admin của dashboard, users, staffs, reports, reviews, policies).
- Dev server thật + Playwright với API giả lập, 22 route Admin × 2 viewport (1280×900 và 390×844):
  - không còn `id` trùng, mỗi trang chỉ còn một header, `main` rộng đúng 1020px trên desktop;
  - `documentElement.scrollWidth` bằng viewport ở mọi trang, kể cả `/admin/reviews` trên mobile (trước đó 394px);
  - quét cặp phần tử chồng nhau trong `main` chỉ còn báo trên phần tử trang trí của thẻ hồ sơ (`/admin/profile`) và nút devtools của TanStack Query — cả hai không phải lỗi bố cục.

## Ghi nhận, chưa xử lý

- Bảng `/admin/users` (1007px trong khung 946px) và `/admin/staffs` (1258px trong khung 946px) vẫn phải cuộn ngang mới tới cột "Thao tác": cần quyết định bỏ bớt cột hoặc ẩn cột phụ trên màn hẹp trước khi sửa.
- Nhãn trang trí nền blueprint (ISO-26262, PAYOS-API, OBD-III) vẫn hiện mờ phía trên mép phải bảng ở một số trang.
- Thẻ KPI dashboard chia 6 cột nên chữ còn xuống dòng ("345.6 tr đ"); đây là mật độ dữ liệu, không phải lỗi chồng lớp.
