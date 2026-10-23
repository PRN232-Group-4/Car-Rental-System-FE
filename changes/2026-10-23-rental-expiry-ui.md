# Hết hạn đơn chưa duyệt/chưa thanh toán trên giao diện khách — 2026-10-23

Phần backend của tính năng nằm ở repo BE: `specs/FR-042-rental-expiry.md`, `changes/2026-10-23-rental-expiry.md`, migration `0030_rental_expiry.sql`.

## Đã làm

- **Chặn chọn giờ nhận xe quá gần**: `src/features/rentals/booking-rules.ts` thêm `BOOKING_MINIMUM_LEAD_MINUTES = 60`, `earliestBookingStart()` và kiểm tra trong `validateBookingTimes` (lỗi hiển thị ngay dưới trường “Ngày giờ nhận xe”); trường `datetime-local` có `min` để trình duyệt gợi ý trước; dòng trợ giúp nêu rõ ngưỡng. Màn hình kết quả đặt xe nhắc cửa sổ 60 phút và việc lịch xe được giải phóng sau khi hết hạn.
- **Đồng hồ đếm ngược**: `src/features/rentals/components/RentalCountdown.tsx` hiển thị `HH:MM:SS` còn lại tới `expireAt` từ backend, cập nhật mỗi giây, `role="timer"`, khi về 0 chỉ thông báo và yêu cầu tải lại trạng thái (trạng thái nghiệp vụ luôn lấy từ máy chủ, không suy diễn ở client).
- **Trạng thái và bộ lọc “Hết hạn”**:
  - `rental-progress.ts` thêm `expired` (dừng tiến trình nhưng không phải “Đã hủy”) và bảng nhãn `rentalStatusLabel`; `RentalStatusTracker` nêu rõ lý do dừng.
  - `/my-rentals` có tab “Đã hết hạn”, hiển thị lý do hết hạn từ lịch sử trạng thái, và ngừng polling khi đơn đã ở trạng thái kết thúc.
  - Admin: `rentalStatuses` có `expired: "Hết hạn"` (bộ lọc danh sách có sẵn), `isClosedRental` thêm `expired` nên nút đổi trạng thái/thao tác bị ẩn đúng, `status-rules` tô tone `danger`, bộ lọc hàng đợi trong workspace có mục “Hết hạn”, và khối lý do dừng đơn hiển thị cả đơn hết hạn.
- **Thông báo chặn thanh toán**: trang chi tiết hóa đơn dịch `paymentBlockedReason` thành câu tiếng Việt thay vì in mã lỗi thô (`INVOICE_NOT_PAYABLE` cho đơn hết hạn).

## Kiểm chứng

- `npx vitest run src/__tests__/features/rentals src/features/rentals/booking-rules.test.ts src/features/rentals/rental-progress.test.ts src/components/admin/status-rules.test.ts` — đạt (bao gồm 4 test mới cho đồng hồ đếm ngược: định dạng, kẹp 0, đếm mỗi giây và chỉ báo hết hạn một lần, và hiển thị ngay khi đã quá hạn).
- `npm test` — 105 file / 889 test đạt; `npm run typecheck`, `npx eslint` (0 lỗi) và `npm run lint:design` đều sạch.

## Chưa làm

- **Email/thông báo khi sắp hết hạn hoặc đã hết hạn**: backend chưa có mẫu email cho tình huống này. Ghi ở `docs/open-questions.md`.
- **Phút chót của đơn đã được duyệt**: đồng hồ chỉ hiển thị cho `pending`/`pre_inspection` — đúng theo quy tắc hết hạn, vì cả hai điều kiện (duyệt + thanh toán) đều phải xong trong cửa sổ.
- Đồng hồ đếm ngược không tự chuyển trạng thái đơn: khi hết giờ, client gọi lại máy chủ và trạng thái thật (job nền chạy mỗi phút) sẽ hiển thị trong vòng tối đa ~1 phút.
