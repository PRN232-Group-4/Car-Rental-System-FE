# Xem trước ảnh GPLX khi upload — 2026-10-23

## Vấn đề

Hai biểu mẫu GPLX (`/driver-license` và `/profile`) xử lý ảnh khác nhau: trang GPLX có ảnh xem trước nhưng không có nút bỏ ảnh và chỉ kiểm tra `image/*` (cho qua cả SVG/HEIC/BMP rồi bị backend từ chối), còn trang hồ sơ có nút bỏ ảnh và kiểm tra chặt hơn nhưng chỉ hiển thị dòng tên tệp, không xem được ảnh. Không nơi nào phóng to được ảnh để kiểm tra chữ số trên giấy phép.

## Đã làm

- Thêm `src/features/licenses/components/LicenseImageField.tsx` dùng chung cho cả hai biểu mẫu:
  - xem trước ảnh ngay sau khi chọn tệp bằng object URL, không cần gửi biểu mẫu;
  - nếu chưa chọn ảnh mới thì hiển thị ảnh đã có trên hồ sơ kèm nhãn “Ảnh đang lưu trên hồ sơ”;
  - nút **Bỏ ảnh đã chọn** (chỉ xoá tệp vừa chọn, không xoá ảnh đã lưu) và nút **Chọn ảnh khác**;
  - hộp thoại phóng to (Radix Dialog: khoá tiêu điểm, `aria-modal`, đóng bằng Escape hoặc nút đóng);
  - câu thông báo lỗi tiếng Việt kèm cách sửa hiển thị ngay dưới vùng tải qua `InlineError`;
  - trạng thái đang tải ảnh khi hồ sơ đang được gửi;
  - `URL.revokeObjectURL` khi đổi ảnh hoặc unmount;
  - bố cục một cột trên mobile, `min-h-11` cho mọi nút (vùng chạm ≥ 44px).
- Giới hạn định dạng và dung lượng đặt trong module dùng chung và **khớp whitelist của backend** (`image/jpeg`, `image/png`, `image/gif`, `image/webp`; tối đa 5 MB) nên ảnh không còn bị từ chối sau khi khách đã chờ tải.
- `src/app/(dashboard)/driver-license/page.tsx` và `src/features/profile/components/ProfileManager.tsx` dùng component này; bỏ mã upload/preview trùng lặp ở hai nơi.

## Kiểm chứng

- `npx vitest run src/__tests__/features/licenses/LicenseImageField.test.tsx` — 9 test: xem trước ngay, hiển thị ảnh cũ, bỏ ảnh, giải phóng object URL khi đổi ảnh và khi unmount, chặn sai định dạng, chặn vượt 5 MB kèm dung lượng, xoá lỗi khi chọn lại ảnh hợp lệ, mở/đóng hộp thoại phóng to, whitelist định dạng.
- `npx vitest run src/__tests__/features/profile/LicenseForms.test.tsx` — 29 test cũ vẫn đạt (bao gồm chặn gửi trống, ánh xạ lỗi API về đúng trường, giữ dữ liệu khi lỗi mạng).
- `npm run typecheck`, `npx eslint`, `npm run lint:design` đều sạch.

## Ghi chú

- Admin xem ảnh GPLX tại `/admin/vehicle-license`: backend chỉ lưu secure URL Cloudinary sau khi upload thành công nên ảnh Admin thấy đúng là ảnh khách đã gửi (ảnh không có URL http(s) sẽ hiển thị thông báo “Khách hàng chưa có ảnh GPLX hợp lệ”).
- Yêu cầu “mặt trước/mặt sau nếu có” chưa làm được: `customer_license` chỉ có một trường ảnh (`imageUrl`). Muốn hai mặt phải đổi schema + API (ghi ở `docs/open-questions.md`).
