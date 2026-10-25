# FE-07 — Đơn thuê của tôi (My Trips)

## Sửa lỗi 2026-10-22 — Tiến trình và menu account

- [x] `/my-rentals?rentalId=...#rental-progress` hiển thị tên cơ sở từ API `facility: {id,name,phone}|null`; thiếu cơ sở có thông báo rõ ràng, không crash React. Adapter `/account/trips/detail` giữ cùng contract.
- [x] Menu tài khoản customer trên trang chủ (desktop/mobile) và Customer Desk có “Theo dõi tiến trình thuê xe” → `/my-rentals`.
- [x] E2E dùng facility object thật theo contract, kiểm tra null, link trực tiếp, làm mới, lỗi quyền và menu ở desktop/mobile.

- **Priority:** P0; **Milestone:** M4; **Assignee:** Huy; **FR:** FR-018
- **Phụ thuộc:** BE-17 (`/api/rentals/mine`, `/mine/{id}`, `cancel`, `cancellation-preview`), FE-02 (phiên + guard), FE-FOUNDATION, P1. **Liên quan:** FE-08 (Phúc — hóa đơn/thanh toán), FE-09/10 (Trí — gói, báo sự cố), FE-05 (Trí — luồng đặt xe tạo đơn).
- **Đặt vào repo FE:** `docs/specs/FE-07-my-trips.md`.

## 1. Mục tiêu

Khách xem **tất cả đơn của mình** theo giai đoạn, theo dõi tiến trình, xem giá/hóa đơn/kết quả kiểm định, **tự hủy khi được phép** (có xem trước phí/hoàn tiền) và đi tiếp sang thanh toán hoặc báo sự cố. Theo DESIGN.md B.§27–§28, vật liệu theo Phần A.

## 2. Route (nhóm `(account)`, bọc `AuthGate` vai trò `Customer`)

| Route | Nội dung |
|---|---|
| `/account/trips` | Danh sách theo tab; `?tab=upcoming|ongoing|completed|cancelled&page=` |
| `/account/trips/detail?id=123` | Chi tiết đơn |

Menu tài khoản (cấu hình ở `navigation.ts` của FE-02) có mục "Chuyến của tôi". Khách vào `?id` của đơn không phải của mình: BE trả 404 → trang "Không tìm thấy chuyến đi" (không lộ sự tồn tại).

## 3. Màn hình & hành vi

### 3.1 Danh sách `/account/trips`

* **Tab** (WAI-ARIA Tabs; chỉ báo trượt bằng `transform`): *Sắp tới* (pending, pre_inspection) · *Đang diễn ra* (renting) · *Đã hoàn thành* (post_inspection, completed) · *Đã hủy*. Số đơn từng tab hiển thị nếu BE cung cấp, ngược lại không đoán. Tab mặc định: *Đang diễn ra* nếu có, ngược lại *Sắp tới*.
* **TripCard** (`.glass-lite`, không blur): ảnh xe nhỏ, tên xe, khoảng giờ (`formatRange` GMT+7), `StatusBadge` (A9; `renting` có chấm live), loại (Tự lái/Có tài xế/Thuê bao/Dài hạn), chi nhánh/địa điểm nhận, số tiền (hoặc "Đã dùng gói" với đơn gói), CTA ngữ cảnh theo `nextAction` từ BE: *Thanh toán cọc*, *Xem chi tiết*, *Báo sự cố* (khi `renting`), *Đặt lại* (khi `completed`).
* Phân trang (12/trang, `page` trong URL), skeleton đúng kích thước, empty theo tab ("Bạn chưa có chuyến nào sắp tới" + nút "Tìm xe"), error + "Thử lại".
* Làm mới: tab *Đang diễn ra*/*Sắp tới* refetch mỗi 30s khi tab trình duyệt hiển thị (`refetchInterval` + `refetchIntervalInBackground:false`).

### 3.2 Chi tiết `/account/trips/detail`

Bố cục hai cột >= 1024px; một cột mobile với thanh hành động dính đáy.

* **Đầu trang:** tên xe + `StatusBadge`; mã đơn; nếu `renting`: **đếm ngược** "Còn 2 giờ 15 phút" tới `end` (tick mỗi phút bằng `useNow(60_000)`, `aria-live="off"`, văn bản tĩnh dành cho trình đọc màn hình); quá giờ → cảnh báo "Đã quá giờ trả xe — phí quá giờ sẽ được tính khi hoàn tất".
* **Stepper tiến trình** (A9): Đã đặt → Kiểm tra xe → Đang thuê → Trả xe & kiểm tra → Hoàn tất; nhánh *Đã hủy* thay các bước còn lại bằng nút trạng thái hủy kèm lý do/giờ. Bước hiện tại nổi bật bằng `transform`/`opacity` (GSAP một lần khi vào).
* **Thông tin chuyến:** xe (ảnh, hãng/mẫu/màu/năm), khoảng giờ nhận–trả, chi nhánh/địa chỉ nhận (`pick_up_method`, `pickup_location`), tài xế (tên, ảnh, điểm đánh giá — **không** hiện điện thoại/email nhân viên), ghi chú.
* **Giá:** `PriceBreakdown` — tiền thuê, VAT, đặt cọc, quá giờ (nếu có), tổng; với đơn gói hiển thị giờ gói đã dùng. Trường **hoàn cọc**: số tiền hoàn + trạng thái (`requested`/`paid`/`rejected`) lấy từ `settlement`/refund; có chú thích cách tính quá giờ (trừ vào cọc, thiếu thì có hóa đơn bổ sung).
* **Hóa đơn & thanh toán:** thẻ tóm tắt (số hóa đơn, trạng thái, số tiền) + liên kết sang trang hóa đơn của FE-08 (nếu route chưa có thì ẩn liên kết, không để chết). Hóa đơn bổ sung quá giờ hiển thị riêng với hạn thanh toán.
* **Kết quả kiểm định xe:** hai thẻ *Trước khi giao* và *Sau khi trả* — kết quả (`Đạt/Không đạt` bằng icon + chữ), số km, mức xăng/pin, ghi chú hư hại, thư viện ảnh (`img_urls`) với lightbox; trạng thái "Chưa kiểm định" nếu chưa có. Đây là yếu tố tin cậy chính (B.§33).
* **Timeline:** từ `timeline[]` — mỗi mốc: tên trạng thái tiếng Việt, giờ GMT+7, tác nhân (`Bạn`/`Nhân viên`/`Hệ thống`), lý do (nếu có). Không hiển thị email/tên nhân viên cụ thể.
* **Hành động:**
  * **Hủy đơn** (chỉ khi `canCancel`): mở `CancelDialog` → gọi `GET …/cancellation-preview` → hiển thị **phí giữ lại và số tiền hoàn** trước khi xác nhận ("Hủy miễn phí đến 09:00 10/10" / "Hủy trong vòng 24h: giữ 20% tiền thuê + VAT = …"), chọn lý do (danh sách + "Khác" có ô nhập, tối đa 500 ký tự), nút "Xác nhận hủy" (danger) có trạng thái đang gửi. Thành công: toast + làm mới đơn + đặt focus vào tiêu đề; thất bại: lỗi ProblemDetails theo `code` (`SELF_CANCEL_NOT_ALLOWED` → "Đã đến giờ nhận xe, vui lòng liên hệ chi nhánh" + thông tin liên hệ chi nhánh; `ILLEGAL_TRANSITION`/`ALREADY_IN_STATE` → làm mới và thông báo trạng thái hiện tại).
  * **Thanh toán cọc/hóa đơn:** liên kết FE-08.
  * **Báo sự cố** (khi `renting`/`post_inspection`): liên kết FE-10 kèm `rentalId`.
  * **Đặt lại** (khi `completed`/`cancelled`): `/vehicles/detail?id=…` của xe đó.
  * **Liên hệ chi nhánh:** số điện thoại chi nhánh (nếu có trong snapshot) — liên kết `tel:`.
* Đơn **theo gói** không hiển thị phần hóa đơn/cọc (không có), chỉ hiển thị giờ gói đã trừ; không bao giờ hiển thị nút thanh toán hóa đơn.
* `403`/`404` từ BE → trang không tìm thấy (không phân biệt).

## 4. Dữ liệu & kiểu

```ts
export type TripStatus = "pending" | "pre_inspection" | "renting" | "post_inspection" | "completed" | "cancelled";
export type TripListItem = { id: number; status: TripStatus; rentalType: "hourly" | "longterm"; isSubscription: boolean;
  vehicle: { id: number; brand: string; model: string; mainImageUrl?: string }; start: string; end: string;
  totalPrice: number; nextAction?: "pay_deposit" | "view" | "report_issue" | "rebook"; canCancel: boolean };
export type TripDetail = TripListItem & { color?: string; facility?: { id: number; name: string; phone?: string };
  hasDriver: boolean; pickup?: { method?: string; location?: string }; driver?: { fullName: string; avatarUrl?: string; rating?: number } | null;
  price: { rent: number; vat: number; deposit: number; overtime: number; total: number };
  invoice?: { id: number; number: string; status: string; amount: number } | null;
  inspections: { type: "pre_rental" | "post_rental"; isOk: boolean | null; odometerKm?: number; fuelBatteryLevel?: number; damageNotes?: string; imgUrls: string[]; inspectedAt?: string }[];
  settlement?: { overtimeHours: number; depositHeld: number; depositDeducted: number; refundAmount: number; refundStatus?: string; shortfallInvoiceId?: number } | null;
  timeline: { to: TripStatus; at: string; actor: "customer" | "staff" | "system"; reason?: string }[];
  cancellation?: { allowed: boolean; feeAmount: number; refundAmount: number; freeUntil?: string; reasons?: string[] } };
```

* Hook: `useMyTrips({tab,page})`, `useMyTrip(id)`, `useCancellationPreview(id, enabled)`, `useCancelTrip()` (mutation; thành công → `invalidateQueries(['trips'])`, `invalidateQueries(['trip', id])`).
* Hợp đồng thật lấy từ `contract-snapshot.md`; **BE-17 chưa merge thì dùng mock đúng hợp đồng trong FR-018** (mục 7) và đánh dấu trong open-questions.
* Mock: thêm các kịch bản (pending trước 24h/trong 24h/quá giờ nhận, renting đúng hạn/quá giờ, completed có quá giờ + hóa đơn bổ sung, cancelled bởi khách/nhân viên/hệ thống, đơn gói) để phát triển và test.
* Thời gian UTC→GMT+7 chỉ qua `lib/time.ts`; tiền chỉ qua `formatVnd`.

## 5. Truy cập

* Danh sách là `<ul>`; mỗi `TripCard` là một liên kết duy nhất (`aria-label` tóm tắt: xe, giờ, trạng thái); `StatusBadge` có chữ; stepper là `<ol>` với `aria-current="step"`; timeline là `<ol>`; thư viện ảnh/lightbox bàn phím được; `CancelDialog` bẫy focus, đóng bằng Esc, trả focus; đếm ngược không ồn ào (không `aria-live` mỗi phút).
* Màu: trạng thái theo A9 (icon + chữ); chữ trên `.glass-lite` mọi token; không dùng màu làm tín hiệu duy nhất.

## 6. Chuyển động

* Vào trang: `useReveal` cho khối nội dung chính; danh sách `useRevealBatch`; stepper highlight một lần; hover thẻ `.glass-lift` (transform); dialog vào bằng GSAP (A7.3). Tất cả có bản reduce-motion (hiển thị ngay).
* Không loop ngoài chấm live của `renting`.

## 7. Kiểm thử

* **Unit:** ánh xạ trạng thái → tab/stepper/badge; tính "còn lại"/quá giờ; chọn `nextAction`; định dạng hoàn tiền/phí.
* **Component (RTL + mock):** đủ kịch bản mục 4 (loading/empty/error mỗi tab); chi tiết đơn từng trạng thái; hủy trước 24h (miễn phí), trong 24h (có phí), không được hủy (`canCancel=false`), lỗi `SELF_CANCEL_NOT_ALLOWED`, lỗi `ALREADY_IN_STATE` → làm mới; xem trước phí hiển thị **trước** khi xác nhận; đơn gói không có hóa đơn/cọc; không rò dữ liệu nhân viên; 404 → trang không tìm thấy.
* **A11y:** axe sạch; chỉ bàn phím hoàn thành hủy đơn.
* **E2E (FE-21):** khách hủy đơn pending → tab *Đã hủy*; khách A không xem được đơn khách B.

## 8. Acceptance criteria

- [ ] Danh sách 4 tab, phân trang, làm mới nền cho đơn đang chạy; skeleton/empty/error đúng
- [ ] Chi tiết đủ: stepper, giá + quá giờ + hoàn cọc, hóa đơn, kiểm định trước/sau có ảnh, timeline, tài xế (không lộ liên hệ nhân viên)
- [ ] Hủy đơn có **xem trước phí/hoàn tiền**, lý do, xử lý đúng mọi mã lỗi BE
- [ ] Đơn theo gói không có hóa đơn/cọc/nút thanh toán
- [ ] Mọi hành động điều hướng sang FE-08/09/10 ẩn khi route chưa có (không link chết)
- [ ] Guard `Customer`; 404 không phân biệt "không tồn tại" với "không phải của bạn"
- [ ] Reduce-motion/transparency/forced-colors; `lint:design`, test, axe, `build` xanh
- [ ] Mock đồng bộ hợp đồng FR-018; sai khác ghi vào open-questions

## 9. Câu hỏi mở

* **O1.** Chuỗi chính sách hủy hiển thị: lấy từ BE (`cancellation-preview`) — không hard-code số 24h/20% trong FE.
* **O2.** Số điện thoại chi nhánh có trong `facilities` không? Nếu không, ẩn nút gọi.
* **O3.** Có cần "tải hóa đơn PDF"? Ngoài phạm vi (FE-08).

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js, a11y, data-heavy UI). Hiện thực FE-07 theo ĐÚNG docs/specs/FE-07-my-trips.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong; BE-17 đã merge hoặc mock đúng hợp đồng FR-018. Nhánh feat/fe-07-my-trips.

ĐỌC TRƯỚC: AGENTS.md (đọc node_modules/next/dist/docs/ phần route group, static export); DESIGN.md A6, A7, A9, A10 và B.§27–§28, §33, §45–§47; FE-FOUNDATION; docs/api/contract-snapshot.md (rentals mine/detail/cancel/preview, invoices, inspections); specs BE: ../Car-Rental-System-BE/specs/FR-018-rental-lifecycle.md; src/features/auth (FE-02), src/config/navigation.ts; thành phần dùng chung đã có.

BƯỚC 0 (không code): liệt kê endpoint đã có/chưa có cho 3.1–3.2, các trường spec cần mà BE chưa trả, route FE-08/09/10 đã tồn tại chưa (để quyết định ẩn/hiện liên kết). Đưa tôi bản liệt kê.

LÀM: (1) kiểu + adapter + mock đủ kịch bản + hooks (mục 4) có test; (2) route group (account) + layout AuthGate(Customer) + mục menu; (3) danh sách với tab/TripCard/phân trang/refetch nền; (4) chi tiết: stepper, thông tin, PriceBreakdown, hóa đơn, kiểm định + lightbox, timeline; (5) CancelDialog với cancellation-preview và xử lý mã lỗi; (6) đếm ngược useNow; (7) chuyển động qua src/lib/motion; (8) test + axe.

RÀNG BUỘC: không tự tính phí hủy/hoàn tiền ở FE (luôn lấy từ BE preview); không hiện email/điện thoại nhân viên; không route động (query string); không tự bịa API — thiếu thì mock đúng hợp đồng và ghi open-questions; chuỗi tiếng Việt; không emoji/gradient/Inter; GSAP qua src/lib/motion.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp từng trạng thái đơn ở 375/768/1280, với reduce-motion/transparency/forced-colors; axe; hoàn tất hủy đơn chỉ bằng bàn phím.

BÁO CÁO: file đổi, kết quả lệnh, trường/endpoint thiếu và cách xử lý, điểm cần Phúc (FE-08), Trí (FE-09/10), BE-17 xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
