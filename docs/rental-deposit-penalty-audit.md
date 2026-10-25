# Rà soát luồng tiền cọc / tiền phạt — 2026-10-23

Phạm vi: từ lúc đặt xe đến khi quyết toán và hoàn cọc, đối chiếu số tiền giữa backend, database và giao diện.

Nguồn xác thực công thức: `VehicleRental.Domain/Lifecycle` (`OvertimeCalculator`, `SettlementCalculator`, `CancellationPolicy`, `MoneyRounding`), `NpgsqlOperationsRepository.CreateRentalAsync`, `RentalLifecycleService`.
Bảng số đối chiếu được khóa bằng test `tests/VehicleRental.Tests/RentalMoneyReconciliationTests.cs` (23 test, chạy thật và đạt).

---

## 1. Luồng hiện tại

```text
Đặt xe (pending, giữ lịch xe, sinh hóa đơn unpaid)
   ↓ nhân viên duyệt (confirm)         → pre_inspection + confirmed_at
   ↓ khách thanh toán (PayOS webhook / thu tiền mặt) → payments paid
   ↓ giao xe (start)                   → renting  (bắt buộc: kiểm tra trước đạt, phân công, đã thanh toán)
   ↓ trả xe (return)                   → post_inspection (ghi returned_at)
   ↓ kiểm tra sau thuê + hoàn tất      → completed (tính phụ phí quá giờ, cấn trừ cọc, sinh hoàn cọc)
   ↓ Admin duyệt yêu cầu hoàn tiền     → payments(type='refund') paid

Nhánh khác: pending|pre_inspection --hủy--> cancelled (tính phí hủy theo mốc 24h)
             pending|pre_inspection --quá hạn duyệt/thanh toán--> expired (FR-042, không phí)
```

Trạng thái chỉ đi theo `pending → pre_inspection → renting → post_inspection → completed`, hoặc rẽ sang `cancelled`/`expired`; `RentalStateMachine` chặn nhảy bước (xem `RentalExpiryDomainTests`).

## 2. Công thức đã xác định

| Khoản | Công thức | Nguồn |
|---|---|---|
| Tiền thuê (hourly) | `đơn giá giờ × số giờ` | `CreateRentalAsync` |
| Tiền thuê (longterm) | `đơn giá tháng × max(1, ceil(số giờ / 720))` | `CreateRentalAsync` |
| VAT | `tiền thuê × vat_rate%` (làm tròn VND) | policy snapshot |
| **Tiền cọc** | `tiền thuê × deposit_percentage%` — **không** tính trên VAT | `CreateRentalAsync` |
| Hóa đơn thuê | `tiền thuê + VAT + cọc` | `CreateRentalAsync` |
| Phụ phí quá giờ | `ceil(phút trễ / 60) × đơn giá giờ × (1 + overtime_fee_rate%)`, miễn 15 phút đầu | `OvertimeCalculator` |
| VAT phụ phí | `phụ phí × vat_rate%` | `OvertimeCalculator` |
| Cọc bị trừ | `min(tổng phụ phí, cọc đang giữ)` | `SettlementCalculator` |
| Thiếu hụt | `tổng phụ phí − cọc bị trừ` ⇒ hóa đơn bổ sung (hạn 72 giờ; gói trả trước trừ giờ gói) | `RentalLifecycleService.CompleteAsync` |
| Hoàn cọc | `cọc đang giữ − cọc bị trừ` | `SettlementCalculator` |
| Phí hủy muộn | `20% × (tiền thuê + VAT)` khi hủy trong vòng 24 giờ trước giờ nhận | `CancellationPolicy` |
| Hoàn khi hủy | `max(0, đã thanh toán − phí hủy)` | `CancellationPolicy` |

Ghi chú: đơn vị tiền là VND và mọi phép tính tiền đi qua `MoneyRounding.RoundVnd` (làm tròn 0 chữ số, away-from-zero). Mốc thời gian trao đổi là UTC, hiển thị GMT+7; phí hủy so sánh `now` (UTC) với `start_time` nên không phụ thuộc múi giờ máy chủ.

## 3. Bảng đối chiếu kịch bản

Kịch bản gốc: đơn giá 100/giờ, thuê 2 giờ, VAT 10%, cọc 20%, phí quá giờ cộng 20% ⇒ tiền thuê 200, VAT 20, cọc 40, hóa đơn 260.

| # | Kịch bản | Kỳ vọng | Thực tế (test) | Kết quả |
|---|---|---|---|---|
| 1 | Đặt 2 giờ | thuê 200 · VAT 20 · cọc 40 · hóa đơn 260 | đúng | ✅ |
| 2 | Đổi VAT 0% | cọc vẫn 40 (cọc không phụ thuộc VAT) | đúng | ✅ |
| 3 | Trả đúng hạn | phụ phí 0 · trừ cọc 0 · hoàn 40 · thiếu hụt 0 | đúng | ✅ |
| 4 | Trễ 15 phút | trong ân hạn · phụ phí 0 | đúng | ✅ |
| 5 | Trễ 16–60 phút | làm tròn 1 giờ · phụ phí 120 · VAT 12 · tổng 132 | đúng | ✅ |
| 6 | Trễ 150 phút | 3 giờ · phụ phí 360 · VAT 36 · tổng 396 | đúng | ✅ |
| 7 | Trễ 150 phút, cọc 40 | trừ 40 · hoàn 0 · thiếu hụt 356 → hóa đơn bổ sung | đúng | ✅ |
| 8 | Trễ 150 phút, cọc 500 | trừ 396 · hoàn 104 · thiếu hụt 0 | đúng | ✅ |
| 9 | Hủy trước 30 giờ | phí 0 · hoàn 260 | đúng | ✅ |
| 10 | Hủy trước 10 giờ | phí 44 (20% × 220) · hoàn 216 | đúng | ✅ |
| 11 | Hủy muộn khi mới trả 10 | phí 44 · hoàn 0 (không âm) | đúng | ✅ |
| 12 | Chi nhánh/hệ thống hủy | phí 0 · hoàn 260 | đúng | ✅ |
| 13 | Khách hủy khi đang thuê | bị chặn (`SELF_CANCEL_NOT_ALLOWED`) | đúng | ✅ |
| 14 | Đơn hết hạn (FR-042) | phí 0 · hoàn lại toàn bộ số đã thu | đúng | ✅ |
| 15 | Làm tròn 10.5 → 11 | `RoundVnd` away-from-zero | đúng | ✅ |

## 4. Lỗi tìm được và đã sửa

| # | Mức | Lỗi | Bằng chứng | Sửa |
|---|---|---|---|---|
| F1 | P1 | Bản dự toán của khách tính cọc **trên tổng đã gồm VAT** nên luôn cao hơn hóa đơn thật | `src/features/rentals/booking-rules.ts:15` (cũ: `total = rentalFee + vat; deposit = total * %`), đối chiếu `NpgsqlOperationsRepository.CreateRentalAsync` | `calculateHourlyEstimate` tính cọc trên tiền thuê; test `booking-rules.test.ts` + `pricing-reconciliation.test.ts` khóa số 200/20/40/260 |
| F2 | P1 | Bảng dự toán trên trang chi tiết xe cộng thêm **phụ phí tài xế 500.000đ/ngày** không tồn tại trong bảng giá backend, và cọc cũng tính gộp VAT | `src/features/vehicles/components/PriceBreakdown.tsx` (cũ: `driverFeePerDay = 500000`), BE `CreateRentalAsync` chỉ có `unit × hours` | Bỏ phụ phí tài xế; cọc tính trên tiền thuê; longterm dùng `max(1, ceil(giờ/720))` như BE; chưa có chính sách thì hiển thị “—” thay vì tự bịa 8%/30% |
| F3 | P1 | Khối chính sách trên trang xe nêu **các mức phạt không có trong hệ thống**: “12h–24h phí 30% cọc”, “dưới 12h phí 100% cọc”, “phạt 500.000đ hút thuốc”, “phí vệ sinh 150.000–300.000đ”, và hiển thị `overtime_fee_rate` (một **tỷ lệ %**) như số tiền đồng/giờ | `src/features/vehicles/components/RentalPolicyPanel.tsx` (cũ) so với `CancellationPolicy` (24h/20% tiền thuê+VAT) và `overtime_fee_rate` | Viết lại theo đúng quy tắc đang chạy (mốc 24h, 20% tiền thuê gồm VAT, phụ phí quá giờ theo % cộng thêm, hư hại/nhiên liệu/vệ sinh xử lý theo biên bản kiểm định) |
| F4 | P2 | `PriceBreakdown` làm tròn số giờ tối thiểu 1 và dùng `days/30` cho thuê dài hạn ⇒ dự toán lệch công thức BE khi thuê dưới 1 giờ hoặc lẻ tháng | `PriceBreakdown.tsx` (cũ: `Math.max(1, hours)`, `safeDays / 30`) | Dùng số giờ thực và `ceil(giờ/720)` |

## 5. Chưa xử lý (cần quyết định sản phẩm)

- **Bồi thường hư hỏng, thiếu nhiên liệu, vệ sinh không có công thức tự động.** Hệ thống chỉ ghi `damage_review_required` khi biên bản sau thuê không đạt và để nhân viên xử lý. Nếu muốn tự động hóa thì cần bảng mức phạt + luồng duyệt (D3 trong `docs/specs/admin-role-simplification-plan.md`).
- **Hoàn cọc chưa có payout thật qua PayOS** (đã ghi trong FR-021): hiện chỉ tạo bản ghi `refund` và Admin duyệt trong DB.
- **Hóa đơn quá hạn 72 giờ không thanh toán**: chưa có quy tắc xử lý (nằm trong “Chưa quyết định” của PRODUCT.md).
- `TripPriceBreakdown` hiển thị dòng “Tiền thuê xe” đã bao gồm phần phụ phí quá giờ (vì BE trả `rent = total_price − vat_price` sau khi cộng phụ phí) rồi cộng thêm dòng “Phí quá giờ”, nên tổng các dòng lớn hơn dòng “Tổng giá trị đơn”; cần chốt cách trình bày (tách phụ phí khỏi tiền thuê trong DTO `CustomerPriceDto`) trước khi sửa để không phá hợp đồng API.

## 6. Cách kiểm chứng lại

```bash
# Backend: bảng đối chiếu tiền (Domain, không cần DB)
dotnet test --filter "FullyQualifiedName~RentalMoneyReconciliationTests"
# Backend: vòng đời + quyết toán trên PostgreSQL tạm
dotnet test --filter "FullyQualifiedName~RentalLifecycle"
# Frontend: công thức dự toán của khách
npx vitest run src/features/rentals/booking-rules.test.ts src/__tests__/features/rentals/pricing-reconciliation.test.ts
```
