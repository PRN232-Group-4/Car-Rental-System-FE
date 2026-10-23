# Kiểm tra UI/UX phía Customer — 2026-10-23

Rà soát 22 trang khách (marketing + dashboard + auth), đối chiếu quy tắc form/a11y trong `AGENTS.md`. Không có lỗi P0. Dưới đây là bảng lỗi tìm được và trạng thái sửa.

## Bảng lỗi

| # | Mức | Trang/luồng | Vấn đề | Đã sửa |
|---|---|---|---|---|
| 1 | P1 | `/vehicles/detail` → `/booking` | Bật công tắc “Kèm tài xế” làm **mất toàn bộ bảng dự toán giá**: `StickyBookingCard` không truyền `driverFeePerDay` nên `PriceBreakdown` trả `null`. Đồng thời copy cứng “+500.000đ/ngày” không lấy từ policy (bảng giá backend không có phụ phí tài xế) | `PriceBreakdown` chỉ trả `null` khi thiếu chính sách/thiếu đơn giá tháng; dòng “Tài xế riêng” chỉ hiện khi có nguồn phí thật; copy đổi thành “Không phụ phí riêng · Tài xế do đơn vị phân công” |
| 2 | P1 | `/payment-history` | Lỗi API hiển thị y như “Chưa có giao dịch” — thất bại im lặng, không có nút thử lại | Thêm nhánh `error` → `ErrorState` + thử lại; loading đổi sang `TableSkeleton` |
| 3 | P1 | `/my-subscriptions` | Cùng lỗi: mất mạng/500 hiện “Bạn chưa có gói thuê bao nào đang hoạt động” | Thêm `error` + `ErrorState` + thử lại; loading đổi sang `CardGridSkeleton` |
| 4 | P1 | `/login`, `/register`, `/forgot-password` | Wrapper `h-dvh + overflow-hidden` khoá cuộn: viewport thấp (điện thoại nằm ngang, zoom ≥150%) bị cắt, không cuộn tới được nút gửi/checkbox điều khoản | Đổi `min-h-dvh` + `overflow-y-auto`, `main` có `py-6` (giữ căn giữa dọc khi còn chỗ) |
| 5 | P1 | `/invoices`, `/account/trips`, `TripCard` | Sổ cái `grid-cols-12` cố định, không breakpoint, không `overflow-x-auto` → ~360px tràn/đè chữ | Bọc `overflow-x-auto` + `min-w-[720px]` cho sổ cái hóa đơn |
| 6 | P1 | `/invoices`, `/invoices/[id]`, `/payment-history`, `/my-subscriptions`, `/payment/result` | Ngày giờ dùng `new Date().toLocaleDateString("vi-VN")` → phụ thuộc múi giờ trình duyệt, lệch 1 ngày ở mốc UTC tối muộn, khác chuẩn `lib/time` | Thay toàn bộ bằng `formatDate` / `formatDateTime` (GMT+7) |
| 7 | P2 | Các trang tiền | Định dạng tiền phân mảnh: `toLocaleString()+" đ"`, helper `money()` trong `BookingForm`, `formatVND()` trong `SubscriptionPlans` → cùng hệ thống hiển thị “1.000.000 đ” / “1.000.000đ” | Xoá helper cục bộ, dùng `formatVnd` từ `@/lib/format` ở 7 file |
| 8 | P2 | `/driver-license` | Nhánh lỗi không có nút thử lại; loading chỉ một dòng chữ | Thêm nút “Thử lại” + `FormSkeleton` |
| 9 | P2 | `/subscriptions`, landing `MembershipPasses` | Lỗi tải gói không có nút thử lại; lỗi mua gói đổ chung hộp `role="status"` trung tính nên khó phân biệt thành công/thất bại | Tách `notice` thành `{type, message}` (`role="alert"` + `bg-danger-bg` cho lỗi), thêm nút “Tải lại gói”; loading đổi sang `CardGridSkeleton` |
| 10 | P2 | `/login`, `/register`, `/forgot-password` | Hộp lỗi tổng thiếu `role="alert"`/`aria-live` → trình đọc màn hình không đọc lỗi đăng nhập/OTP | Thêm `role="alert" aria-live="assertive"` cho 4 banner |
| 11 | P2 | `/find`, `/vehicles/detail` | Vùng chạm < 44px: nút ngày lịch `w-9 h-9`, nút chuyển tháng `w-8 h-8`, CTA “Chi tiết” trên card xe ~32px | `min-h-11 min-w-11` cho nút lịch/chuyển tháng, `min-h-11 px-4 py-2.5` cho CTA card |
| 12 | P2 | `/my-rentals` vs `/account/trips`; toàn hệ thống | Trùng nghĩa điều hướng với nhãn tab lệch nhau (“Đang thuê” vs “Đang diễn ra”, “Đã trả xe” vs “Đã hoàn thành”); chính tả “Hoá đơn” / “Hóa đơn” lẫn lộn | Thống nhất tab `Sắp tới / Đang thuê / Đã trả xe / Đã hủy`; chuẩn hoá **toàn bộ** “Hoá/hóa” → “Hóa” (16 file, 0 chỗ còn lại) |

## Lỗi phụ đã sửa kèm

- `/vehicles` chỉ là redirect nhưng `Suspense fallback={null}` → nháy màn trắng; nay dùng `PageFallback`.
- `EmptyState` render khối “Hãy thử:” **hai lần** với hai hệ token khác nhau → bỏ bản trùng.
- `/nearby-vehicles` có trong menu khách nhưng thiếu trong dải chương của `CustomerDeskShell` → masthead highlight nhầm chương; nay thêm vào chương “Chuyến đi”.
- `#rental-progress` thiếu `scroll-mt` nên deep-link `…/my-rentals?rentalId=…#rental-progress` bị masthead sticky che tiêu đề; nay có `scroll-mt-32`.

## Đã kiểm chứng (đọc mã)

- Có đủ trạng thái loading/empty/error ở: `/find`, `/vehicles/detail`, `/invoices`, `/account/trips` + chi tiết, `/booking`, `/report-incident`, `/profile`, `/payment/result` (có nút “Kiểm tra lại”), `/nearby-vehicles`, `FacilityExplorer`.
- Form: `ValidatedForm` validate trước khi gửi, `show()` focus trường lỗi đầu tiên, map lỗi API về đúng trường, `aria-invalid`/`aria-describedby`/`role="alert"`, nút disable khi đang gửi. Không form nào thiếu khoá gửi lặp.
- Luồng đặt xe → thanh toán có đường quay lại ở mọi màn; không có nút chết; `submissionLock`/`paymentLock` chống double-submit.

## Chưa kiểm chứng (cần thiết bị thật)

- #4 và #5: điểm vỡ layout cụ thể ở 320/360/390px và landscape — cần DevTools/thiết bị.
- #11: số đo vùng chạm thật và việc masthead sticky che `#rental-progress` trên từng kích thước.
- #6: lệch ngày theo múi giờ chỉ lộ với dữ liệu ở biên TZ — chưa xác nhận bằng dữ liệu runtime.
- `/invoices/[id]` chỉ prerender id 1..200 (`generateStaticParams`); id > 200 rơi vào SPA fallback — cần xác nhận trên bản deploy.

## Kết quả kiểm chứng

`npm run typecheck` sạch · `npm run lint` 0 error · `npm run lint:design` đạt · `npm test` 120 file / 999 test đạt · `npm run build` đạt (264 trang).
