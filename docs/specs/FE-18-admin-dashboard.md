# FE-18 — Admin: dashboard biểu đồ

- **Priority:** P2; **Milestone:** M7; **Assignee:** Huy; **FR:** FR-030
- **Phụ thuộc:** BE-28 (API dashboard — Kiệt; đánh dấu Done nhưng phụ thuộc BE-19/22 của Phúc, **phải xác nhận dữ liệu thật**), FE-11 (shell), FE-FOUNDATION (`StatCard`, `ChartCard`, Recharts), FE-02 (guard `Admin`, `Manager`). Số liệu liên quan: FR-DASH-01..04 của SRS.
- **Đặt vào repo FE:** `docs/specs/FE-18-admin-dashboard.md`.

## 1. Mục tiêu

Một màn hình điều hành cho Admin/Manager: **doanh thu, đơn thuê, tình trạng đội xe, tỉ lệ khai thác, chi phí bảo dưỡng, hiệu quả gói thuê bao** trong một khoảng thời gian, so với kỳ trước, lọc theo chi nhánh/loại xe. Mật độ cao (Density 7), chuyển động tối thiểu (A9): đọc số liệu nhanh, không trang trí.

## 2. Route

`/admin/dashboard` (và `/admin` có thể là liên kết/hiển thị tóm tắt của cùng dữ liệu — quyết định theo Anh; tối thiểu `/admin` có thẻ dẫn tới dashboard). Guard `Admin`, `Manager`; `Staff` không thấy (hoặc thấy bản vận hành rút gọn nếu BE cung cấp endpoint riêng — mặc định không).

## 3. Bố cục & widget

```text
[ Khoảng thời gian: 7 ngày | 30 ngày | Tháng này | Tháng trước | Tùy chọn ]  [Chi nhánh v] [Loại xe v]  [Làm mới] [Xuất CSV]
┌ KPI strip: Doanh thu | Số đơn hoàn tất | Xe đang thuê/Tổng xe | Tỉ lệ khai thác | Chi phí bảo dưỡng | Gói đang hoạt động ┐
┌ Doanh thu theo thời gian (cột/đường, chia theo loại xe hoặc chi nhánh) ┐ ┌ Tình trạng đội xe (cột ngang xếp chồng 1 thanh) ┐
┌ Đơn thuê theo trạng thái (cột ngang) ┐ ┌ Top xe theo doanh thu / khai thác (bảng) ┐
┌ Chi phí bảo dưỡng so với doanh thu theo xe (bảng + cột đôi) ┐ ┌ Gói thuê bao: giờ đã dùng / giờ kèm theo (thanh tiến độ theo gói) ┐
```

| Widget | Nội dung | Ghi chú |
|---|---|---|
| **KPI** (`StatCard`) | Giá trị kỳ này + **chênh lệch so với kỳ trước** (`▲ +12,4%` bằng icon Lucide + chữ, không chỉ màu) | Count-up một lần (A7.3); `—` khi không có kỳ trước; chia 0 → hiển thị `—`, không `NaN` |
| **Doanh thu theo thời gian** | Theo ngày/tuần/tháng tự chọn theo độ dài khoảng; chia nhóm theo loại xe hoặc chi nhánh; tổng thanh toán đã **thu** (không tính hoàn) | Tiền VND, trục rút gọn "1,2 tr"; tooltip đầy đủ |
| **Tình trạng đội xe** | `available / renting / maintenance / inactive` | Nhãn trực tiếp + số; thứ tự cố định |
| **Đơn theo trạng thái** | 6 trạng thái | Cùng bảng màu badge A9 |
| **Top xe** | Doanh thu, số lượt, giờ thuê, tỉ lệ khai thác | `DataTable` nhỏ, sắp xếp phía client trong top 10 |
| **Bảo dưỡng vs doanh thu** | Tổng `cost` bảo dưỡng và doanh thu theo xe (FR-DASH-03) | Đánh dấu xe có chi phí > doanh thu bằng icon cảnh báo + chữ |
| **Gói thuê bao** | `giờ đã dùng / included_hours` theo gói (FR-DASH-04), số gói đang hoạt động | Thanh tiến độ có nhãn % |

* **Bộ lọc** đồng bộ URL (`from`,`to`,`preset`,`facilityId`,`vehicleTypeId`); khoảng tối đa 366 ngày; `to` không vượt hôm nay (GMT+7); kỳ trước = khoảng cùng độ dài liền trước.
* **Mỗi widget có truy vấn riêng** (`useQueries`) và trạng thái riêng: skeleton đúng kích thước, empty ("Chưa có dữ liệu trong khoảng này"), error cục bộ + "Thử lại" — **một widget lỗi không làm sập cả trang**. Nhãn "Dữ liệu tính đến HH:mm" (GMT+7) theo thời điểm tải.
* **Tự làm mới** 60s khi tab hiển thị và khoảng thời gian bao gồm hôm nay; nút "Làm mới" thủ công; không làm mới khi tab ẩn.
* **Xuất CSV:** từ dữ liệu đang hiển thị, phía client; mã hóa UTF-8 **có BOM** để Excel đọc đúng tiếng Việt; dấu phân tách `,` với số không có định dạng nghìn; tên tệp `thong-dong-dashboard-YYYYMMDD-YYYYMMDD.csv`; chống **CSV injection** (ô bắt đầu bằng `= + - @` được thêm tiền tố `'`).
* **Dạng bảng thay thế:** mỗi biểu đồ có nút "Xem dạng bảng" (bảng thật, đọc được bởi trình đọc màn hình); bảng/biểu đồ dùng cùng nguồn dữ liệu.
* **Chuyển động:** KPI count-up một lần; biểu đồ vẽ vào 600ms (`isAnimationActive` tắt khi reduce-motion); fade panel 160ms. Không parallax/3D/loop.

## 4. Biểu đồ (Recharts) — quy tắc thị giác

* Màu theo `--chart-1..5` (A2), **phẳng** (không gradient fill; vùng dùng màu đặc alpha 0.12 + đường viền); phân biệt chuỗi bằng nhãn trực tiếp/họa tiết nét (`<pattern>`) và marker khác nhau, không chỉ màu.
* Trục: chữ Ink Muted 12px; lưới Hairline; tooltip `.glass-2` có đủ chuỗi và tổng; legend dạng chip bấm bật/tắt chuỗi (bàn phím được).
* Khung `ChartCard` (`.glass-admin`): tiêu đề, mô tả ngắn, chú thích đơn vị, nút "Xem dạng bảng" và "Tải ảnh"? (không — tránh phức tạp), chỉ giữ "Xem dạng bảng".
* Responsive: biểu đồ đổi kích thước theo container (`ResponsiveContainer`), mobile xếp một cột, nhãn trục xoay/giảm mật độ; chiều cao tối thiểu cố định để không CLS.
* Số liệu lớn (hàng nghìn điểm): **gộp phía BE** (ngày/tuần/tháng); FE không vẽ quá 400 điểm/chuỗi (cảnh báo và đề nghị đổi độ phân giải).

## 5. Dữ liệu & kiểu

Hợp đồng thật từ BE-28 (snapshot). FE dùng lớp **adapter** để cách ly:

```ts
export type DashboardFilters = { from: string; to: string; facilityId?: number; vehicleTypeId?: number }; // UTC
export type KpiValue = { value: number | null; previous: number | null };
export type DashboardKpis = { revenue: KpiValue; completedRentals: KpiValue; rentingVehicles: KpiValue; totalVehicles: KpiValue; utilizationRate: KpiValue; maintenanceCost: KpiValue; activeSubscriptions: KpiValue };
export type RevenuePoint = { bucket: string; total: number; byGroup?: Record<string, number> };
export type FleetStatus = Record<"available" | "renting" | "maintenance" | "inactive", number>;
export type TopVehicleRow = { vehicleId: number; name: string; revenue: number; rentals: number; hours: number; utilization: number };
export type MaintenanceVsRevenueRow = { vehicleId: number; name: string; maintenanceCost: number; revenue: number };
export type PlanUsageRow = { planId: number; name: string; usedHours: number; includedHours: number; activeSubscribers: number };
```

* Thời gian/bucket: BE trả UTC; chuẩn hóa nhãn ngày theo **GMT+7** (bucket ngày bắt đầu 00:00 GMT+7); xác nhận quy ước bucket với BE-28 và ghi vào open-questions nếu khác.
* **Không tự tính lại số liệu nghiệp vụ ở FE** ngoài chênh lệch % kỳ trước và gộp hiển thị; định nghĩa "doanh thu" (đã thu, không gồm cọc/hoàn) lấy từ BE-28 — nếu BE không nêu, ghi open-questions và hiển thị chú thích "Doanh thu = tổng thanh toán đã thu, chưa trừ hoàn tiền" chỉ khi BE xác nhận.
* Hooks: `useDashboardKpis`, `useRevenueSeries`, `useFleetStatus`, `useRentalsByStatus`, `useTopVehicles`, `useMaintenanceVsRevenue`, `usePlanUsage`; endpoint nào BE-28 chưa có → mock và ghi open-questions, widget tương ứng hiển thị nhãn "Dữ liệu mẫu" **chỉ ở chế độ mock**.
* Mock: bộ dữ liệu xác định (seed cố định) gồm kỳ có/không dữ liệu, chia 0, kỳ trước rỗng, chi phí bảo dưỡng vượt doanh thu, lỗi một widget.

## 6. Truy cập

* Mỗi biểu đồ: `role="img"` + `aria-label` tóm tắt ("Doanh thu 30 ngày: tổng 245 triệu, cao nhất ngày 12/10"), kèm bảng thay thế; KPI là `<dl>`; chênh lệch có chữ ("tăng 12,4% so với kỳ trước"); legend bàn phím được; focus ring A10; màu không là tín hiệu duy nhất; tương phản nhãn trục >= 4.5:1 (Ink Muted trên Surface 5.4:1).
* Thông báo cập nhật tự động **không** đọc mỗi 60s (`aria-live="off"`); chỉ nút "Làm mới" thông báo kết quả.

## 7. Kiểm thử

* **Unit:** tính chênh lệch % (kỳ trước 0/null/âm), định dạng tiền rút gọn, bucket GMT+7 quanh nửa đêm, xuất CSV (BOM, dấu phẩy/ngoặc kép trong tên xe, **CSV injection**), giới hạn điểm vẽ, chọn preset khoảng thời gian (tháng này/tháng trước ở biên tháng).
* **Component (RTL + mock):** từng widget loading/empty/error độc lập; đổi bộ lọc cập nhật URL và gọi lại; kỳ trước rỗng; xem dạng bảng; làm mới nền không chạy khi tab ẩn (mock `visibilityState`); reduce-motion tắt hoạt họa; KPI count-up không chạy lại khi refetch cùng giá trị.
* **A11y:** axe sạch; điều hướng legend/tooltip bằng bàn phím.
* **Phân quyền:** Staff/Customer vào `/admin/dashboard` → `/forbidden`.

## 8. Acceptance criteria

- [ ] Đủ 7 widget với dữ liệu BE-28 (hoặc mock đánh dấu rõ), kèm so sánh kỳ trước
- [ ] Mỗi widget độc lập loading/empty/error; một widget lỗi không sập trang
- [ ] Bộ lọc đồng bộ URL; giới hạn khoảng; bucket theo GMT+7
- [ ] Biểu đồ phẳng (không gradient), có nhãn/họa tiết, có "Xem dạng bảng"
- [ ] Xuất CSV đúng (UTF-8 BOM, chống CSV injection)
- [ ] Tự làm mới 60s chỉ khi tab hiển thị; reduce-motion đúng
- [ ] Guard Admin/Manager; axe sạch; test, `lint:design`, `build` xanh
- [ ] Định nghĩa số liệu đối chiếu BE-28 và ghi vào open-questions nếu lệch

## 9. Câu hỏi mở

### Phạm vi đã triển khai ngày 15/10/2026

- `/admin` có biểu đồ cột hoạt động hiện tại và biểu đồ tròn cơ cấu đội xe, hỗ trợ bảng dữ liệu thay thế, trạng thái tải/rỗng/lỗi, thử lại riêng và theme sáng/tối. SVG phẳng dùng token `--chart-*`, không thêm thư viện biểu đồ.
- Đối chiếu `NpgsqlOperationsRepository.DashboardAsync`: `GET /api/dashboard` chỉ có `revenue`, `renting`, `maintenance`, `activeSubscriptions`. Doanh thu là tổng `invoices.amount` với `status = paid`; `from/to` lọc theo `issued_at`. `renting` là số đơn đang thuê, `maintenance` là số phiếu chưa completed/cancelled, không phải số xe bảo dưỡng. Gói còn hiệu lực có trạng thái active và end_date chưa hết hạn.
- Biểu đồ cột chỉ dùng ba số đếm có đơn vị rõ ràng; doanh thu nằm riêng ở KPI và không dựng chuỗi doanh thu giả. Giá trị thiếu hiển thị `—`, không đổi thành 0.
- Biểu đồ tròn dùng `totalCount` từ `GET /api/vehicles?page=1&pageSize=1` và bộ lọc status `available/rented/renting/maintenance`; hai cách ghi trạng thái đang thuê được gộp để hiển thị. Phần còn lại của tổng được ghi rõ “Tạm ngưng / khác”. Dữ liệu chỉ tổng hợp để hiển thị, không lấy mẫu trang đầu và không suy số xe từ số phiếu/đơn.
- Các mục mở rộng trong spec (chuỗi thời gian, kỳ trước, chi nhánh/loại xe, chi phí, khai thác, top xe, giờ gói thuê) vẫn cần API thống kê phù hợp; chưa đánh dấu hoàn tất toàn bộ FE-18.

* **O1.** BE-28 thực sự trả những số liệu nào? (phụ thuộc BE-19/22 chưa xong ⇒ có thể rỗng).
* **O2.** Định nghĩa doanh thu/tỉ lệ khai thác (mẫu số = giờ khả dụng nào?) — chốt với Kiệt.
* **O3.** Staff có dashboard vận hành rút gọn không?

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (data visualization, a11y, performance). Hiện thực FE-18 theo ĐÚNG docs/specs/FE-18-admin-dashboard.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong; BE-28 đã merge hoặc mock đúng hợp đồng. Nhánh feat/fe-18-dashboard.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/); DESIGN.md A2 (màu biểu đồ), A6, A7, A9, A10; FE-FOUNDATION; docs/api/contract-snapshot.md (dashboard, bucket, định nghĩa số liệu); ../Car-Rental-System-BE/specs/FR-030-dashboard.md và SRS FR-DASH-01..04; shared components (StatCard, ChartCard, DataTable); lib/time.ts.

BƯỚC 0 (không code): liệt kê endpoint dashboard THẬT (tham số, response, bucket, múi giờ), widget nào BE chưa có dữ liệu, định nghĩa doanh thu/khai thác. Đưa tôi bản liệt kê.

LÀM: (1) kiểu + adapter + mock xác định + hooks có test; (2) bộ lọc đồng bộ URL + preset; (3) StatCard/ChartCard hoàn chỉnh (count-up, so sánh kỳ trước, bảng thay thế); (4) từng widget độc lập (useQueries) với skeleton/empty/error; (5) xuất CSV (BOM, chống injection); (6) tự làm mới 60s theo visibility; (7) guard + menu; (8) test + axe.

RÀNG BUỘC: biểu đồ màu PHẲNG theo --chart-1..5, không gradient fill/shimmer; mỗi biểu đồ có "Xem dạng bảng"; không tự tính lại số liệu nghiệp vụ ngoài chênh lệch % và gộp hiển thị; mốc ngày theo GMT+7 chỉ qua lib/time.ts; không bịa endpoint (thiếu → mock + ghi docs/open-questions.md, nhãn "Dữ liệu mẫu" chỉ ở mock); chuỗi tiếng Việt; không emoji/gradient/Inter; panel .glass-admin; không quá 400 điểm/chuỗi; Recharts chỉ tải ở route dashboard (dynamic import) để không phình bundle công khai.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp ở 375/768/1280 (đủ trạng thái, một widget lỗi); axe; kích thước chunk của route dashboard; reduce-motion.

BÁO CÁO: file đổi, kết quả lệnh, số liệu BE thiếu/lệch định nghĩa, điểm cần Kiệt (BE-28), Phúc (dữ liệu thanh toán/gói) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
