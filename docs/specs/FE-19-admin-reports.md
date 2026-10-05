# FE-19 — Admin: xử lý báo cáo (khiếu nại/sự cố của khách)

- **Priority:** P2; **Milestone:** M7; **Assignee:** Huy; **FR:** FR-027
- **Phụ thuộc:** BE-25 (báo cáo — Anh, **cùng giai đoạn M7**), FE-11 (shell), FE-FOUNDATION, FE-02. Liên quan: FE-10 (Trí — khách gửi báo cáo), BE-24 (bảo trì — Kiệt, Done), FE-07 (liên kết đơn).
- **Đặt vào repo FE:** `docs/specs/FE-19-admin-reports.md`.

## 1. Bối cảnh

`reports` (SRS FR-RPT): `customer_id`, `rental_id` và/hoặc `maintenance_id`, `type`, `description`, `status` — khách phản ánh sự cố gắn với **một đơn thuê** hoặc **một phiếu bảo dưỡng**. Nhân viên cập nhật `status` (tiếp nhận → đang xử lý → đã giải quyết). **DDL hiện không có** cột ghi **phản hồi/ghi chú xử lý**, **người xử lý**, **thời điểm giải quyết** — nếu BE-25 chưa bổ sung, đề xuất cho Anh (xem O1). UI phải chạy đúng cả khi các trường này **chưa có** (ẩn phần liên quan, không chết).

Quyền (mặc định, đối chiếu `[Authorize]` thật): **Admin, Manager, Staff** xem/xử lý; Customer chỉ qua FE-10.

## 2. Route

| Route | Nội dung |
|---|---|
| `/admin/reports` | Danh sách + bộ lọc |
| `/admin/reports/detail?id=…` | Chi tiết + xử lý (`Drawer` rộng trên desktop khi mở từ danh sách; trang đầy đủ khi vào trực tiếp bằng URL) |

## 3. Màn hình & hành vi

### 3.1 Danh sách

* `FilterBar` đồng bộ URL: `status` (Mới/Đang xử lý/Đã giải quyết/Từ chối nếu BE có), `type` (danh mục BE định nghĩa), khoảng ngày tạo, tìm theo mã đơn/tên khách/nội dung (chỉ khi BE hỗ trợ), `hasRental`/`hasMaintenance`, **"Của tôi"** (chỉ khi BE có người xử lý).
* Cột: *Mã*, *Khách hàng*, *Loại*, *Tóm tắt nội dung* (cắt 2 dòng, đầy đủ ở chi tiết), *Liên kết* (Đơn #123 / Bảo dưỡng #45 — liên kết), *Trạng thái* (`StatusBadge`), *Tạo lúc* (GMT+7), *Thời gian chờ* (chuyển thành chữ "chờ 2 giờ 15 phút"/"chờ 3 ngày"; quá **SLA** nội bộ → icon cảnh báo + chữ; ngưỡng SLA là hằng số cấu hình `REPORT_SLA_HOURS=24`, ghi nhận O3).
* Sắp xếp mặc định: **Mới nhất trước**, nhưng đơn *Mới/Đang xử lý* quá SLA được nổi lên bằng huy hiệu (không đổi thứ tự bất ngờ). Phân trang phía server; skeleton/empty ("Chưa có báo cáo nào")/error.
* Đếm theo trạng thái ở đầu trang (chip: Mới (n) · Đang xử lý (n) · Đã giải quyết (n)) nếu BE trả; ngược lại ẩn.

### 3.2 Chi tiết & xử lý

* **Thông tin:** mã, loại, nội dung đầy đủ (giữ xuống dòng, **hiển thị dạng văn bản thuần — tuyệt đối không render HTML** từ người dùng), trạng thái, thời gian tạo/cập nhật, khách (họ tên, liên hệ cho nhân viên: điện thoại/email hiển thị cho vai trò có quyền; liên kết `/admin/users/detail?id=` nếu Admin).
* **Ngữ cảnh liên kết (nếu có):**
  * *Đơn thuê:* thẻ tóm tắt (xe, khoảng giờ, trạng thái, tài xế, nhân viên giao xe) + liên kết sang chi tiết vận hành (FE của Trí); **không** nhúng dữ liệu nhạy cảm không cần thiết.
  * *Bảo dưỡng:* thẻ tóm tắt phiếu (loại, trạng thái, `is_safe`, chi phí) + liên kết.
  * Không có liên kết nào → hiển thị "Báo cáo chung, không gắn đơn/phiếu".
* **Hành động (chỉ khi BE hỗ trợ từng cái):**
  * *Nhận xử lý* (gán cho tôi) — nếu có người xử lý.
  * *Đổi trạng thái* theo **luồng hợp lệ**: Mới → Đang xử lý → Đã giải quyết; Mới/Đang xử lý → Từ chối (nếu BE có, **bắt buộc lý do**). UI chỉ hiển thị chuyển tiếp hợp lệ tiếp theo; BE vẫn là chốt (409 → làm mới + thông báo). Cập nhật trạng thái dùng **optimistic update + rollback** khi lỗi.
  * *Ghi chú/phản hồi cho khách* (nếu BE có cột): ô nhập 5–1000 ký tự; hiển thị lịch sử ghi chú; khách nhìn thấy hay không (phân biệt *ghi chú nội bộ* và *phản hồi gửi khách* nếu BE phân loại).
  * *Tạo phiếu bảo dưỡng từ báo cáo* (báo cáo gắn xe có vấn đề kỹ thuật): mở form tối thiểu (loại, mô tả sẵn từ báo cáo, chi nhánh) gọi endpoint bảo dưỡng của BE-24 (xác nhận `snapshot`); sau khi tạo, nếu BE cho phép **gắn `maintenance_id`** vào báo cáo thì liên kết ngay; nếu không, hiển thị liên kết hai chiều ở UI và ghi O2. **Không** tự đổi trạng thái xe ở FE (BE-24 làm).
* **Nhật ký thay đổi trạng thái** (nếu BE có): ai/lúc nào/từ→đến/lý do.
* Hết quyền/không tồn tại → trang "Không tìm thấy báo cáo".

## 4. Dữ liệu & kiểu

```ts
export type ReportStatus = "new" | "in_progress" | "resolved" | "rejected" | string; // giá trị thật theo BE; phần chưa biết giữ nguyên chuỗi và hiển thị trung tính
export type ReportListItem = { id: number; type: string; status: ReportStatus; descriptionPreview: string; createdAt: string;
  customer: { id: number; fullName: string }; rentalId?: number | null; maintenanceId?: number | null; handledBy?: string | null };
export type ReportDetail = ReportListItem & { description: string; updatedAt?: string; customer: { id: number; fullName: string; phone?: string; email?: string };
  rental?: { id: number; vehicleName: string; start: string; end: string; status: string } | null;
  maintenance?: { id: number; type?: string; status?: string; isSafe?: boolean | null; cost?: number } | null;
  notes?: { id: number; at: string; by?: string; kind: "internal" | "customer"; text: string }[]; history?: { at: string; by?: string; from?: ReportStatus; to: ReportStatus; reason?: string }[] };
```

* **Từ vựng `status` và `type` lấy từ BE** (DDL để `VARCHAR` tự do — SRS NFR-MNT-07). Bảng ánh xạ trạng thái → nhãn tiếng Việt/badge nằm **một chỗ** (`reportStatus.ts`); giá trị lạ hiển thị nguyên văn với badge trung tính + log dev, **không crash**.
* Hooks: `useReports(params)`, `useReport(id)`, `useUpdateReportStatus` (optimistic), `useAssignReport`, `useAddReportNote`, `useCreateMaintenanceFromReport`. Hàm nào BE chưa có → không tạo, ghi open-questions.
* Mock: kịch bản khác nhau (gắn đơn / gắn bảo dưỡng / không gắn, quá SLA, chuyển trạng thái hợp lệ/không hợp lệ 409, ghi chú, văn bản chứa ký tự HTML/script để kiểm tra thoát an toàn).

## 5. Bảo mật & truy cập

* **XSS:** `description`/ghi chú render bằng text node (React mặc định); không `dangerouslySetInnerHTML`; liên kết tự động trong nội dung chỉ cho `http/https` và `rel="noopener noreferrer nofollow"`.
* Thông tin liên hệ khách chỉ hiển thị cho vai trò được phép; không ghi vào log/analytics.
* Bảng có `caption`, `aria-sort`; `Drawer` bẫy focus, trả focus về hàng; thay đổi trạng thái thông báo `aria-live="polite"`; chuyển trạng thái bằng bàn phím được; badge có chữ; hàng quá SLA có chữ "Quá hạn" (không chỉ màu).
* Motion admin tối thiểu (A9).

## 6. Kiểm thử

* **Unit:** ánh xạ trạng thái/loại (gồm giá trị lạ), luồng chuyển hợp lệ, tính thời gian chờ & quá SLA ở biên, thoát nội dung độc hại.
* **Component (RTL + mock):** danh sách (lọc/URL/skeleton/empty/error); chi tiết 3 kiểu liên kết; đổi trạng thái thành công (optimistic) và **rollback khi 409/lỗi**; từ chối bắt buộc lý do; ghi chú; tạo phiếu bảo dưỡng từ báo cáo; nội dung `<script>`/HTML hiển thị như văn bản; chưa có cột ghi chú → phần ẩn; Staff vào được, Customer bị chặn.
* **A11y:** axe sạch; xử lý một báo cáo từ đầu đến cuối chỉ bằng bàn phím.

## 7. Acceptance criteria

- [ ] Danh sách có lọc/sắp xếp/phân trang, SLA hiển thị bằng chữ + icon
- [ ] Chi tiết đủ ngữ cảnh đơn/bảo dưỡng; liên kết không chết
- [ ] Đổi trạng thái theo luồng hợp lệ, optimistic + rollback; lý do bắt buộc khi từ chối
- [ ] Ghi chú/phản hồi/gán người xử lý chỉ xuất hiện khi BE hỗ trợ (không nút chết)
- [ ] Tạo phiếu bảo dưỡng từ báo cáo qua BE-24 (không đổi trạng thái xe ở FE)
- [ ] Nội dung người dùng không bao giờ render HTML
- [ ] Guard Admin/Manager/Staff; axe sạch; test, `lint:design`, `build` xanh
- [ ] Mock + hợp đồng đồng bộ snapshot; thiếu hụt ghi vào open-questions

## 8. Câu hỏi mở

* **O1.** `reports` thiếu cột ghi chú xử lý/người xử lý/thời điểm giải quyết — đề xuất Anh (BE-25) bổ sung (`resolution_note`, `handled_by`, `resolved_at`) và bảng/cột lịch sử.
* **O2.** BE-25/24 có cho gắn `maintenance_id` vào báo cáo sau khi tạo không?
* **O3.** SLA 24 giờ là mặc định của Claude; xác nhận nghiệp vụ.
* **O4.** Danh mục `type` của báo cáo (tai nạn, hư hỏng, nhân viên, thanh toán, khác)?

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (admin workflows, security-minded UI). Hiện thực FE-19 theo ĐÚNG docs/specs/FE-19-admin-reports.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong; BE-25 đã merge hoặc mock đúng hợp đồng đề xuất. Nhánh feat/fe-19-reports.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/); DESIGN.md A6, A9, A10, B.§37; FE-FOUNDATION; docs/api/contract-snapshot.md (reports, maintenance create); ../Car-Rental-System-BE/specs/FR-027-customer-report.md, FR-026-maintenance.md và SRS FR-RPT; shared components (F3); lib/time.ts.

BƯỚC 0 (không code): liệt kê endpoint THẬT/thiếu (danh sách, chi tiết, đổi trạng thái, gán, ghi chú, lịch sử, gắn maintenance), tập giá trị status/type thực tế, các cột DDL có/không. Đưa tôi bản liệt kê và đề xuất cột còn thiếu cho Anh.

LÀM: (1) kiểu + reportStatus.ts (ánh xạ một chỗ, giá trị lạ không crash) + adapter + mock + hooks có test; (2) /admin/reports danh sách; (3) chi tiết (Drawer + trang trực tiếp); (4) đổi trạng thái optimistic + rollback, lý do bắt buộc khi từ chối; (5) ghi chú/gán/lịch sử CHỈ khi BE hỗ trợ; (6) tạo phiếu bảo dưỡng từ báo cáo qua endpoint BE-24; (7) guard + menu; (8) test + axe.

RÀNG BUỘC: KHÔNG dangerouslySetInnerHTML; không bịa endpoint (thiếu → ẩn chức năng + mock + ghi docs/open-questions.md); không tự đổi trạng thái xe ở FE; thông tin liên hệ khách chỉ cho vai trò được phép, không log; mốc giờ chỉ qua lib/time.ts; chuỗi tiếng Việt; không emoji/gradient/Inter; panel .glass-admin, bảng/ô nhập Surface đặc.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp ở 375/1280 (đủ trạng thái); axe; xử lý báo cáo chỉ bằng bàn phím; test nội dung độc hại hiển thị như văn bản.

BÁO CÁO: file đổi, kết quả lệnh, cột/endpoint thiếu, điểm cần Anh (BE-25), Kiệt (BE-24), Trí (FE-10) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
