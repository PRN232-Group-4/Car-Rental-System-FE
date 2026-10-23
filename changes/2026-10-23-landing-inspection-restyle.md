# Restyle khối kiểm tra xe theo bố cục landing của `dev-huy` — 2026-10-23

## Bối cảnh

Yêu cầu: ưu tiên giao diện landing của nhánh `dev-huy`, giữ nguyên logic hiện tại, chỉ chỉnh style.

Đã đối chiếu `origin/dev` ↔ `origin/dev-huy` (bỏ qua `node_modules`):

| File landing | Khác biệt thực tế |
|---|---|
| `app/(marketing)/page.tsx` | **Giống hệt** — hai nhánh mount đúng 11 component như nhau (`WhyChooseUs`, `DiagnosticDeck`, `MobileAppSection` không được mount ở cả hai) |
| `Hero`, `Marquee`, `PinnedJourney` | Chỉ khác **chữ** (dev-huy thêm các cam kết: “Bàn giao 3 phút”, “Hoàn cọc PayOS 5 phút”, “OBD-II Verified”) |
| `InteractiveStudio3D`, `FacilityExplorer`, `Footer`, `ContinuousBlueprint` | Không khác |
| `InspectionSection` | **Khác bố cục thật**: dev-huy có lưới 12 cột — 4 card chọn được bên trái + panel chi tiết/đối chiếu bên phải; bản `dev` thu gọn còn 3 cột tĩnh |
| `MultiFleetCatalog`, `MembershipPasses`, `find/page`, `subscriptions/page` | dev-huy **mất logic**: bỏ `bookingContext` khi mở card xe, bỏ reset bộ lọc ngày, dùng `getInitialSubscriptionPlans()` (dữ liệu gói hard-code) làm giá trị khởi tạo |
| `CustomerDeskShell`, `Navbar` | dev-huy là bản cũ hơn: bỏ 2 link menu, khác thứ tự/căn giữa điều hướng |

⇒ Chỉ `InspectionSection` có khác biệt **style**. Toàn bộ khác biệt còn lại là nội dung quảng cáo không kiểm chứng được hoặc là bước lùi về logic, nên không lấy.

## Đã làm

`src/features/landing/components/InspectionSection.tsx` — dựng lại theo bố cục dev-huy:

- Lưới `lg:grid-cols-12`: trái 7 cột là 4 card điểm kiểm tra (`sm:grid-cols-2`), phải 5 cột là panel chi tiết.
- Card: chip nhãn + trạng thái (`ĐANG XEM` / `CHI TIẾT`), tiêu đề, mô tả, dải chip thông số; card đang chọn có viền amber + ring; chuyển động 300ms.
- Panel phải: tiêu đề “BIÊN BẢN KIỂM TRA” + chip “TRONG ĐƠN THUÊ”, khối điểm đang chọn (tên + mã), khối “DÙNG KHI QUYẾT TOÁN” (CĂN CỨ = biên bản kiểm tra · PHỤ PHÍ = trừ vào cọc trước) kèm giải thích phụ phí/hoàn cọc, danh sách 3 điểm tin cậy, CTA amber “Xem đơn thuê của bạn” → `/my-rentals` (giữ link thật của bản trước).
- Nội dung viết lại theo đúng những gì hệ thống ghi trong biên bản: ảnh + ghi chú hư hỏng, chỉ số km, mức xăng/pin, kết quả đạt/không đạt và người xác nhận. Không nêu cảm biến, mã ISO, mốc thời gian hay cam kết nào backend chưa bảo đảm (các nội dung dev-huy có: `OBD-II CAN-BUS`, `ISO-VISUAL-360`, `TPMS 2.4 BAR`, `SHA-256 SIGN`, “hoàn cọc < 5 phút”, “chụp 6 góc”, “cứu hộ 24/7”).

Cải thiện a11y so với bản dev-huy: card là `<button aria-pressed>` (dev-huy dùng `div onClick`, không dùng được bàn phím), có `focus-visible` ring; panel dùng `<h4>` + `<ul>` thật.

## Kiểm chứng

- `npm run typecheck` sạch · `npm run lint` 0 error (11 cảnh báo có sẵn) · `npm run lint:design` đạt · `npm test` **120 file / 999 test đạt** · `npm run build` đạt (264 trang).
- Trình duyệt thật (e2e session headless trên `localhost:3000`): section render đúng 12 cột; bấm card “Chỉ số km” → card đổi trạng thái `ĐANG XEM`, panel đổi sang `ODOMETER` và mô tả tương ứng.
- Cập nhật 2 spec e2e đang assert nội dung cũ (`Kiểm Định 2 Chiều & Hoàn Cọc Tự Động`, `CƠ CHẾ HOÀN CỌC PAYOS TỨC THÌ`, 4 nhãn `SHA-256…`) sang nội dung mới: `tests/landing.e2e.ts` (thêm kiểm tra tương tác đổi panel) và `tests/design-system.e2e.ts` (nhãn chữ của trạng thái). Chạy `npx e2e run tests/landing.e2e.ts tests/design-system.e2e.ts`: **19/19 test đạt**.

## Không lấy từ dev-huy (và vì sao)

1. Bản `Hero`/`Marquee`/`PinnedJourney` với các cam kết “3 phút”, “hoàn cọc 5 phút”, “OBD-II” — không có căn cứ trong backend/`PRODUCT.md` (“không được bịa nội dung”).
2. `MobileAppSection` với nút App Store/Google Play — chưa có ứng dụng di động.
3. `MultiFleetCatalog` bỏ `VehicleLicenseRequirement`, `find` bỏ reset bộ lọc ngày, `MembershipPasses` dùng gói hard-code — đều là bước lùi về logic.
4. `WhyChooseUs` / `DiagnosticDeck`: dev-huy có bản giàu hơn nhưng **không được mount** trên landing ở cả hai nhánh, nên không ảnh hưởng giao diện; giữ nguyên bản hiện tại.
