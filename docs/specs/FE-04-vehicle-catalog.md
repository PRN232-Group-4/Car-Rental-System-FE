# FE-04 — Danh sách, tìm kiếm & chi tiết xe (công khai)

- **Priority:** P0; **Milestone:** M3; **Assignee:** Huy; **FR:** FR-010
- **Phụ thuộc:** BE-10 (`/api/vehicles/search`, `availability`, `busy-slots`, `active-policy`), FE-FOUNDATION, P1 (token/kính), FE-FOUNDATION F1 (snapshot hợp đồng). Giá/báo giá: BE-12 (Lạc) — dùng mock có công thức DESIGN.md §23 cho tới khi có.
- **Phục vụ:** FE-05 (Trí — luồng đặt xe nhận tham số từ trang chi tiết).
- **Đặt vào repo FE:** `docs/specs/FE-04-vehicle-catalog.md`.

## 1. Mục tiêu

Người chưa đăng nhập tìm xe theo thời gian/chi nhánh/loại/giá/thông số, thấy **chỉ xe còn trống**, xem chi tiết (ảnh, thông số, chính sách, giá, lịch trống, 3D minh họa) và bấm "Đặt xe" để sang luồng đặt. Trải nghiệm theo DESIGN.md B.§9–§24, vật liệu theo Phần A.

## 2. Route (static export → trạng thái nằm ở query string)

| Route | Nội dung |
|---|---|
| `/find` | Kết quả tìm kiếm + bộ lọc + sắp xếp; mọi bộ lọc đồng bộ URL (chia sẻ/refresh/back đúng) |
| `/vehicles` | Chuyển hướng về `/find` (giữ query) |
| `/vehicles/detail?id=12&from=…&to=…&mode=self|driver|subscription` | Chi tiết xe; `from/to/mode` là ngữ cảnh tìm kiếm mang sang |

Tham số URL của `/find`: `from`, `to` (UTC ISO **hoặc** `YYYY-MM-DDTHH:mm` GMT+7 — chuẩn hóa nội bộ thành UTC), `mode` (`self`→`hasDriver=false`, `driver`→`hasDriver=true`, `subscription`→ lọc `subscriptionEligible`), `rentalType`, `facilityId`, `vehicleTypeId`, `q`, `brand`, `minPrice`, `maxPrice`, `seatCount`, `transmission`, `bikeType`, `minRangeKm`, `yearFrom`, `fuelType`, `sort`, `page`. Parse bằng Zod (`lib/url.ts`); giá trị sai bị bỏ và hiển thị chip "Bộ lọc không hợp lệ đã bị bỏ qua", **không** sập trang.

## 3. Màn hình & hành vi

### 3.1 `/find`

```text
[ SearchSummaryBar: chi nhánh · 10/10 09:00 → 11/10 15:00 · Có tài xế · [Sửa] ]
┌ FilterSidebar (>=1024) ┐ ┌ Kết quả: "120 xe phù hợp"        Sắp xếp [Đề xuất v] ┐
│ Loại xe | Chi nhánh     │ │ VehicleCard  VehicleCard  VehicleCard (lưới 3/2/1 cột)│
│ Khoảng giá (slider)     │ │ ...                                                  │
│ Số chỗ | Hộp số         │ │ Pagination (12/trang)                                 │
│ Xe điện: tầm xa tối thiểu│ └──────────────────────────────────────────────────────┘
└─────────────────────────┘   (mobile: nút "Bộ lọc (n)" mở bottom sheet vaul)
```

* **SearchSummaryBar** (`.glass-1` dính khi cuộn): mở `SearchEditor` (popover/bottom sheet) với `RentalModeTabs` (Tự lái / Có tài xế / Thuê bao), `FacilityPicker`, **`DateTimeRangePicker`** (react-day-picker, GMT+7, bước 30 phút, chặn quá khứ, tối thiểu 1 giờ hourly, tối đa 366 ngày), nút "Tìm xe". Thay đổi chỉ áp khi bấm "Tìm xe" (không gọi API mỗi lần gõ), riêng ô tìm `q` debounce 300ms.
* **FilterSidebar/FilterDrawer:** nhóm có thể thu gọn; chip lọc đang bật hiển thị phía trên lưới kèm "Xóa tất cả"; slider giá có hai tay nắm bàn phím được (Radix Slider), hiển thị `formatVnd`; trường chỉ có nghĩa với loại xe nào chỉ hiện khi loại đó được chọn hoặc không lọc loại (ví dụ `bikeType` cho xe máy, `minRangeKm` cho xe điện).
* **Sắp xếp:** Đề xuất, Giá thấp→cao, Giá cao→thấp, Mới nhất. **Không** hiển thị "Gần nhất" cho tới khi BE-36 sẵn sàng (cờ `capabilities.nearestSort` lấy từ snapshot/cấu hình, mặc định false).
* **Kết quả:** `VehicleCard` (A6): ảnh 4:3 >= 60% diện tích, tên + năm, chip thông số (Lucide: `Armchair`, `Settings2`, `Zap`, `MapPin`), huy hiệu `Có tài xế` / `Xe điện` / `Dùng được gói` (chỉ khi `badges.*` true), giá giờ lớn `tabular-nums`; nếu có `from/to` hiển thị "Ước tính cho 30 giờ" lấy từ **hook báo giá** (mục 4) — ẩn khi chưa có API báo giá thay vì tự tính sai. Toàn thẻ là liên kết tới trang chi tiết (giữ `from/to/mode`); `.glass-lite` + `.glass-lift`; ảnh `loading="lazy"` trừ 4 thẻ đầu (`priority`), `sizes` đúng, chiều cao cố định theo tỉ lệ (không CLS).
* **Phân trang:** số trang, 12/trang, `page` trong URL; đổi trang cuộn lên đầu lưới và đặt focus vào tiêu đề kết quả; thông báo `aria-live="polite"` "Hiển thị 13–24 trong 120 xe".
* **Trạng thái:** loading = 12 skeleton đúng kích thước thẻ (không spinner); empty = "Không tìm thấy xe phù hợp" + gợi ý cụ thể (nới khoảng giờ ±1 ngày, bỏ lọc giá, đổi chi nhánh — mỗi gợi ý là nút áp dụng ngay) + "Xóa bộ lọc"; error = "Không thể tải danh sách xe" + "Thử lại" + `traceId`; `isFetching` khi đổi bộ lọc: giữ kết quả cũ mờ nhẹ (`placeholderData: keepPreviousData`), không nháy trống.
* **Chuyển động:** vào lưới bằng `useRevealBatch` (stagger 0.06); đổi bộ lọc/sắp xếp dùng `useFlipList` để các thẻ còn lại trượt về vị trí mới (Flip), thẻ mới fade-in; **tắt Flip khi > 24 thẻ hoặc reduce-motion** (đặt trạng thái cuối ngay).
* **Lỗi nghiệp vụ BE:** `INVALID_TIME_RANGE` → thông báo cụ thể tại ô thời gian; `SORT_NOT_SUPPORTED` → bỏ sắp xếp và báo nhẹ.

### 3.2 `/vehicles/detail`

Bố cục hai cột >= 1024px (trái: nội dung; phải: **BookingCard** `.glass-2` dính), một cột trên mobile với thanh CTA dính đáy.

* **Thiếu `id` hoặc xe không tồn tại/không còn công khai:** trang "Không tìm thấy xe" + nút "Xem xe khác".
* **Tab nội dung:** `Ảnh` (mặc định) · `Xem 3D (minh họa)` (ẩn khi thiếu GLB/thiết bị yếu) · `Lịch trống`.
  * **Ảnh:** gallery ảnh chính + thumbnail (`vehicle_imgs` + `mainImageUrl`), lightbox bàn phím được (←/→/Esc), chuyển ảnh bằng `useFlipList`-kiểu Flip thumbnail→ảnh chính; ảnh có `alt` mô tả (`"Toyota Corolla Cross trắng — ảnh 2"`).
  * **3D (A8):** `Vehicle3DViewer` tải lười (`next/dynamic`, `ssr:false`), poster fallback, đổi màu thân theo `vehicles.color` (bảng ánh xạ A8), kéo ngang xoay + nút "Xoay trái/phải", chú thích minh họa, không chặn cuộn (`touch-action: pan-y`), dừng khi rời viewport/tab ẩn; không WebGL/reduce-motion/saveData/thiết bị yếu → poster.
  * **Lịch trống:** `AvailabilityCalendar` dựng từ `busy-slots` (31 ngày tới, chuyển trang theo tháng), tô các khoảng bận (đã gồm đệm 60 phút) bằng họa tiết nét + nhãn (không chỉ màu); chọn khoảng giờ trống sẽ cập nhật BookingCard; gọi `availability` để xác nhận trước khi bấm Đặt.
* **Thông số** theo loại (`VehicleSpecs`): ô tô (chỗ, hộp số, cốp), xe máy (loại, cốp), xe điện (pin, kiểu sạc, thời gian sạc, tầm xa, loại pin). Chỉ hiển thị trường có giá trị.
* **Chính sách thuê** (`RentalPolicyPanel`, `GET /api/vehicle-types/{id}/active-policy`): VAT, đặt cọc (% tổng tiền thuê), phí trả trễ, **chính sách hủy** (24h/20% — lấy từ cấu hình/nội dung BE-17 khi có; trước đó chuỗi cố định trích từ DESIGN.md §52, ghi nguồn).
* **Giá & BookingCard:** chọn khoảng giờ (`DateTimeRangePicker`), chế độ tự lái/có tài xế (chỉ bật "Có tài xế" khi `driverAvailable`), dùng gói (chỉ khi `subscriptionEligible` và đã đăng nhập có gói — nếu chưa đăng nhập hiển thị gợi ý đăng nhập, **không** tự gọi API cần quyền). `PriceBreakdown`: tiền thuê, VAT, tổng, đặt cọc, **tổng thanh toán** — công thức khớp BE (DESIGN.md §23: tổng = thuê + VAT; cọc = tổng × `deposit_percentage`; thanh toán = tổng + cọc). Không ẩn phí đến bước cuối.
* **CTA "Đặt xe":** điều hướng `/booking?vehicleId=&from=&to=&mode=` (route do FE-05 của Trí dựng; nếu chưa có, nút dẫn tới `/login?next=…` hoặc hiển thị "Sắp ra mắt" theo cờ). Trước khi điều hướng gọi `availability`: `available:false` → hiển thị lý do (`BOOKED` "Xe vừa được đặt trong khung giờ này", `MAINTENANCE`…), gợi ý khung giờ/xe khác; không điều hướng.
* **Xe tương tự** (cuối trang): 3–4 xe cùng loại/chi nhánh còn trống trong cùng khung giờ (gọi `search` với `vehicleTypeId`, loại trừ xe hiện tại); ẩn nếu rỗng.
* Metadata trang: `document.title` động ("Toyota Corolla Cross — Thong Dong"), `<meta name="description">` cập nhật phía client (hạn chế SEO của static export — ghi nhận).

### 3.3 Trang chủ

`VehicleCatalog` ở landing dùng lại `VehicleCard` và hook tìm kiếm (không còn dữ liệu mock riêng); `SearchWidget` đẩy sang `/find` với query chuẩn (một cách điều hướng duy nhất).

## 4. Dữ liệu & kiểu

```ts
// features/vehicles/api/types.ts (adapter từ BE; kiểm tra với contract-snapshot)
export type VehicleSearchItem = {
  id: number; vehicleType: { id: number; name: string; fuelType?: string };
  brand: string; model: string; yearOfManufacture?: number; color?: string;
  mainImageUrl?: string; location?: string; facility?: { id: number; name: string };
  priceHourly?: number; priceLongterm?: number;
  summary: { seatCount?: number; transmission?: string; bikeType?: string; hasStorageBox?: boolean; maxRangeKm?: number; batteryCapacity?: number };
  badges: { electric: boolean; driverAvailable?: boolean; subscriptionEligible: boolean };
  durationHours?: number;
};
export type VehiclePage = { items: VehicleSearchItem[]; page: number; pageSize: number; totalCount: number; appliedWindow?: { from: string; to: string; bufferMinutes: number } };
export type BusySlot = { from: string; to: string; kind: "booking" | "maintenance" };
export type Availability = { available: boolean; reason?: "BOOKED" | "MAINTENANCE" | "INACTIVE" | "NOT_FOUND"; conflictsWith?: { from: string; to: string } };
```

* Hooks: `useVehicleSearch(params)`, `useVehicle(id)` (**chi tiết từng xe cần endpoint** — nếu snapshot cho thấy BE chưa có `GET /api/vehicles/{id}` công khai, ghi vào open-questions và đề xuất bổ sung ở BE-10; trong lúc chờ dùng mock), `useBusySlots`, `useAvailability`, `useActivePolicy`, `usePriceQuote(vehicleId, window, mode)` (**endpoint báo giá của BE-12; chưa có → mock theo công thức, hiển thị nhãn "Ước tính"**).
* Tất cả thời gian trao đổi UTC; hiển thị GMT+7 qua `lib/time.ts`. Khóa Query: `['vehicles','search',normalizedParams]`.
* Mock: thêm handler cho search/availability/busy-slots/active-policy/quote theo đúng hợp đồng BE-10, kể cả đệm 60 phút và `INVALID_TIME_RANGE`.
* Không hiển thị biển số (BE chưa có cột); nếu mock cũ có, **gỡ**.

## 5. Truy cập

* Lưới là danh sách (`<ul>` + `<li>`); bộ lọc là `<form role="search">`; slider/DateTimeRangePicker thao tác bàn phím đầy đủ; Dialog/Drawer bẫy focus và trả focus; kết quả đổi → `aria-live`; lịch trống có bảng văn bản thay thế ("Các khoảng đã bận: …"); 3D `aria-hidden` kèm mô tả và nút điều khiển; tab theo mẫu WAI-ARIA Tabs; mục tiêu chạm >= 44px; mọi ảnh có `alt`.
* Màu: chip trạng thái theo A9; chữ trên `.glass-lite` mọi token; chữ trên ảnh phải có scrim phẳng (A2).

## 6. Hiệu năng

* LCP của `/find` < 2.5s (4G): 4 ảnh đầu `priority`, còn lại lazy; không `backdrop-filter` trên thẻ (<= 4 phần tử blur/viewport); JS route <= 180 KB gzip (không tính chunk 3D); chunk 3D chỉ tải khi mở tab 3D hoặc khi vào hero có điều kiện.
* Không waterfall: `useVehicle` + `useActivePolicy` + `useBusySlots` song song (`useQueries`).
* Hủy request cũ khi đổi bộ lọc (`signal` của Query).

## 7. Kiểm thử

* **Unit:** `lib/url.ts` (parse/serialize bộ lọc, giá trị sai, round-trip), chuyển GMT+7↔UTC ở ranh giới nửa đêm, công thức `PriceBreakdown`, ánh xạ màu 3D, điều kiện bật 3D.
* **Component (RTL + mock):** `/find` loading→kết quả→empty→error; đổi bộ lọc cập nhật URL và gọi lại đúng tham số; "Xóa bộ lọc"; phân trang + focus; `FilterDrawer` mobile; chi tiết xe đủ loại (ô tô, xe máy, ô tô điện, xe máy điện); `availability:false` chặn điều hướng và hiển thị lý do; poster fallback khi không WebGL/reduce-motion; lịch trống hiển thị đệm.
* **A11y:** axe không vi phạm serious/critical trên `/find` và chi tiết ở desktop + mobile; điều hướng chỉ bằng bàn phím hoàn chỉnh (kịch bản liệt kê).
* **E2E (FE-21):** tìm theo giờ → chi tiết → Đặt xe (chuyển đúng tham số); xe vừa bị đặt → thông báo.

## 8. Acceptance criteria

- [ ] `/find` lọc/sắp xếp/phân trang, đồng bộ URL, chỉ xe còn trống theo khoảng giờ
- [ ] Skeleton/empty (gợi ý có hành động)/error đúng DESIGN.md; không nháy trống khi đổi bộ lọc
- [ ] Chi tiết xe: gallery, thông số theo loại, chính sách, giá minh bạch, lịch trống, 3D có fallback
- [ ] `availability` được kiểm tra trước khi sang luồng đặt; lý do hiển thị thân thiện
- [ ] Không có biển số; không "Gần nhất" khi BE chưa hỗ trợ; báo giá ẩn/nhãn "Ước tính" khi chưa có API
- [ ] VehicleCard dùng chung với landing (không còn bản sao); không `backdrop-filter` trên thẻ
- [ ] Reduce-motion/transparency/forced-colors đúng; ngân sách hiệu năng đạt; `lint:design` xanh
- [ ] Test unit + component xanh; axe sạch; `build` static export xanh
- [ ] Mock + hợp đồng đồng bộ với `contract-snapshot.md`; chênh lệch ghi vào open-questions

## 9. Câu hỏi mở

* **O1.** BE chưa chắc có `GET /api/vehicles/{id}` công khai và endpoint báo giá — xác nhận qua snapshot, đề xuất bổ sung.
* **O2.** GLB theo dòng xe: cần cung cấp tài sản (xem DESIGN.md A8); không có thì chỉ poster.
* **O3.** Ảnh xe thật (Cloudinary) cho môi trường staging/production.

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js, a11y, performance, GSAP/R3F). Hiện thực FE-04 theo ĐÚNG docs/specs/FE-04-vehicle-catalog.md. Điều kiện tiên quyết: P1, F1, F2, F3 đã xong; BE-10 đã merge hoặc đã có mock đúng hợp đồng. Nhánh feat/fe-04-vehicle-catalog.

ĐỌC TRƯỚC: AGENTS.md (đọc node_modules/next/dist/docs/ — static export, routing, dynamic import); DESIGN.md Phần A (A3–A8, A10) và B.§9–§24, §43, §45–§47; FE-FOUNDATION; docs/api/contract-snapshot.md (vehicles/search, availability, busy-slots, active-policy; xác nhận có GET vehicle detail và báo giá chưa); src/features/vehicles, src/features/rentals/components/SearchWidget.tsx, BookingModal.tsx; src/lib/motion/*; src/components/ui/*.

BƯỚC 0 (không code): liệt kê (1) endpoint nào đã có/chưa có cho 3.2 và 4, (2) thành phần dùng chung đã có để tái dùng, (3) mọi chỗ VehicleCatalog/SearchWidget đang dùng dữ liệu hoặc biển số mock cần gỡ. Đưa tôi bản liệt kê; chỉ tiếp tục nếu không có mâu thuẫn lớn với spec.

LÀM theo thứ tự: (1) kiểu + adapter + mock + hooks (mục 4) có test; (2) lib/url.ts bộ lọc + test; (3) DateTimeRangePicker (react-day-picker, GMT+7) + test; (4) VehicleCard dùng chung + FilterSidebar/FilterDrawer + SearchSummaryBar/SearchEditor; (5) /find đủ trạng thái, phân trang, Flip, a11y; (6) /vehicles/detail: gallery, specs theo loại, policy, PriceBreakdown, BookingCard, AvailabilityCalendar; (7) Vehicle3DViewer theo A8 — chỉ bật khi có GLB trong public/models/ và thiết bị đủ điều kiện, còn lại poster; KHÔNG dựng xe giả; (8) nối landing dùng lại VehicleCard + hook; (9) test + axe + đo hiệu năng.

RÀNG BUỘC: static export (không route động; trạng thái ở query string); không backdrop-filter trên VehicleCard; không biển số; không "Gần nhất"; không tự bịa API — thiếu endpoint thì dùng mock đúng hợp đồng đề xuất và ghi docs/open-questions.md; mọi giờ UTC↔GMT+7 chỉ qua lib/time.ts; chuỗi tiếng Việt; không emoji/gradient/Inter; GSAP chỉ qua src/lib/motion với useGSAP + scope + matchMedia.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp /find và chi tiết ở 375/768/1280 (loading/empty/error/populated, hover, focus, dialog), với reduce-motion/transparency/forced-colors; axe; số phần tử backdrop-filter/viewport; Lighthouse mobile cho /find; kích thước JS route.

BÁO CÁO: file đổi, kết quả lệnh, endpoint thiếu và cách đã xử lý, điểm cần Trí (FE-05), Lạc (BE-12 báo giá), Phúc (hạ tầng ảnh) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
