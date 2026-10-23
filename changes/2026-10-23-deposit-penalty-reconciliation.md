# Đối chiếu tiền cọc/phạt và sửa dự toán giá — 2026-10-23

Báo cáo đầy đủ: `docs/rental-deposit-penalty-audit.md` (luồng, công thức, bảng 15 kịch bản đối chiếu, danh sách lỗi và phần chưa xử lý).

## Vấn đề

Ba nơi trong FE tự tính tiền theo công thức khác backend, nên con số khách nhìn thấy trước khi đặt không khớp hóa đơn thật:

1. `calculateHourlyEstimate` tính cọc trên tổng **đã gồm VAT** ⇒ cọc cao hơn hóa đơn (VAT 10% + cọc 20% thì lệch 10% số cọc).
2. `PriceBreakdown` (trang chi tiết xe) cộng thêm **phụ phí tài xế 500.000đ/ngày** không tồn tại trong bảng giá backend, vẫn tính cọc gộp VAT, làm tròn số giờ tối thiểu 1 và dùng `days/30` cho thuê dài hạn trong khi backend dùng `ceil(giờ/720)`.
3. `RentalPolicyPanel` nêu các mức phạt không có trong hệ thống (30% cọc khi hủy 12–24h, 100% cọc khi hủy dưới 12h, phạt hút thuốc 500.000đ, phí vệ sinh 150.000–300.000đ) và hiển thị `overtime_fee_rate` (một tỷ lệ phần trăm) như số tiền đồng/giờ.

## Đã sửa

- `calculateHourlyEstimate`: `cọc = tiền thuê × deposit%` (không gồm VAT), `total = tiền thuê + VAT + cọc` — khớp `NpgsqlOperationsRepository.CreateRentalAsync` và kịch bản kiểm thử backend (100/giờ × 2 giờ, VAT 10%, cọc 20% ⇒ 200/20/40/260).
- `PriceBreakdown`: bỏ phụ phí tài xế; dùng số giờ thực; thuê dài hạn theo `max(1, ceil(giờ/720))`; khi chưa tải được chính sách thì hiển thị “—” và ghi rõ “chưa gồm VAT và tiền cọc” thay vì tự bịa tỷ lệ 8%/30%.
- `RentalPolicyPanel`: viết lại theo quy tắc đang chạy — cọc theo % tiền thuê, hủy trước 24 giờ miễn phí / hủy muộn 20% tiền thuê gồm VAT (phần còn lại được hoàn, không vượt số đã trả), phụ phí quá giờ cộng thêm `overtime_fee_rate%` theo giờ làm tròn lên và miễn 15 phút đầu, hư hại/nhiên liệu/vệ sinh xử lý theo biên bản kiểm định.
- Thêm test `src/__tests__/features/rentals/pricing-reconciliation.test.ts` khóa công thức FE vào đúng các con số của kịch bản backend, và `src/__tests__/features/vehicles/PriceBreakdown.test.tsx` render thật bảng dự toán để khẳng định 200/20/40/260, không có dòng “Tài xế riêng”, không tự bịa tỷ lệ khi thiếu chính sách, và thuê dài hạn làm tròn số tháng như backend.

## Kiểm chứng

- FE: `npx vitest run src/__tests__/features/rentals src/__tests__/features/vehicles/PriceBreakdown.test.tsx src/features/rentals/booking-rules.test.ts` đạt; `npm test` 106 file / 894 test đạt; `npm run typecheck` + `npx eslint` sạch.
- BE: `dotnet test --filter "FullyQualifiedName~RentalMoneyReconciliationTests"` — 23 test mới đạt, mỗi dòng của bảng đối chiếu là một khẳng định chạy thật.

## Chưa xử lý

- Bồi thường hư hỏng/thiếu nhiên liệu/vệ sinh chưa có công thức tự động (cần bảng mức phạt và luồng duyệt).
- Hoàn cọc chưa có payout thật qua PayOS (FR-021 vẫn đang mở).
- `TripPriceBreakdown` cộng trùng phần phụ phí quá giờ (vì `CustomerPriceDto.Rent` đã bao gồm phụ phí sau khi hoàn tất) — cần chốt cách trình bày/đổi DTO trước khi sửa.
