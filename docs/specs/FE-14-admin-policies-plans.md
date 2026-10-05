# FE-14 — Admin: chính sách thuê & gói thuê bao

- **Priority:** P1; **Milestone:** M3; **Assignee:** Huy; **FR:** FR-011, FR-022
- **Phụ thuộc:** FE-11 (Admin shell của Anh), FE-FOUNDATION (DataTable, FilterBar, ConfirmDialog…), FE-02 (guard `Admin`, `Manager`), BE-11 (rental policies, Done), BE-20 (subscription plans — Phúc; một phần đã có: tạo/xóa gói).
- **Ranh giới với Anh:** Anh đã tạo route rỗng `/admin/policies` và `/admin/subscription-plans` (dùng `CatalogManager` dữ liệu giả). **FE-14 sở hữu hai route này**; sau khi merge không còn `CatalogManager` giả cho hai trang này. Thông báo Anh trước khi sửa.
- **Đặt vào repo FE:** `docs/specs/FE-14-admin-policies-plans.md`.

## 1. Bối cảnh nghiệp vụ

* **Rental policy là bất biến theo phiên bản** (FR-011): không sửa, không xóa; muốn đổi điều khoản → **tạo phiên bản mới** (`POST /api/rental-policies`), phiên bản cũ giữ làm lịch sử cho các đơn đã tạo; đơn mới dùng policy `is_active` (nếu nhiều policy active cho cùng loại xe, dùng policy **mới nhất** — DESIGN.md B.§22). Đơn đã tạo giữ snapshot giá/policy.
* Quyền: policy — **Admin, Manager** (đọc và tạo). Gói thuê bao — theo snapshot hợp đồng (mặc định Admin, Manager).
* **Gói thuê bao** (`subscription_plans`): `name, description, price, duration_days, included_hours, is_active`. Gói đã có người mua **không được xóa cứng**; chỉ ngừng kích hoạt.

## 2. Route

| Route | Nội dung |
|---|---|
| `/admin/policies` | Danh sách phiên bản chính sách, lọc theo loại xe/trạng thái; tạo phiên bản mới |
| `/admin/subscription-plans` | Danh sách gói; tạo/sửa/ngừng kích hoạt/xóa (khi chưa ai mua) |

Guard: `AuthGate allow={["Admin","Manager"]}` (khớp `ROUTE_ACCESS` của FE-02). Menu sidebar lấy từ `navigation.ts`.

## 3. Màn hình & hành vi — Chính sách thuê

* **Danh sách** (`DataTable`, phân trang/sắp xếp phía server hoặc client nếu BE trả toàn bộ — theo snapshot): cột *Loại xe*, *Tên*, *VAT %*, *Đặt cọc %*, *Phí trả trễ %*, *Trạng thái* (badge `Đang áp dụng`/`Đã ngừng`), *Tạo lúc*, *Người quản lý*. Nhóm/nhãn "Đang áp dụng cho loại xe X" nổi bật; hàng cùng loại xe được gom bằng bộ lọc loại xe. **Không có nút Sửa/Xóa** (hiển thị chú thích "Chính sách là bất biến, tạo phiên bản mới để thay đổi" bằng `Tooltip` + dòng mô tả dưới tiêu đề).
* **Cảnh báo:** nếu một loại xe có **nhiều hơn một** policy `is_active`, hiển thị banner cảnh báo "Có 2 chính sách đang áp dụng cho Ô tô; hệ thống dùng bản mới nhất" kèm liên kết lọc. Nếu loại xe **không có** policy active → banner lỗi "Loại xe này chưa có chính sách — không thể tạo đơn" (đây là chặn nghiệp vụ).
* **Tạo phiên bản mới** (`Drawer`/`Modal` `.glass-3` + RHF/Zod):
  * Trường: *Loại xe* (bắt buộc; `vehicle_type_id` có thể null theo DDL nhưng UI **yêu cầu chọn** trừ khi snapshot cho phép "áp dụng chung" — nếu cho phép thì thêm lựa chọn rõ ràng), *Tên phiên bản*, *VAT %*, *Phí trả trễ %*, *Đặt cọc %*, *Áp dụng ngay* (mặc định bật).
  * Giới hạn: số trong `[0, 100]`, tối đa 2 chữ số thập phân (`NUMERIC(5,2)`), tên 3–120 ký tự.
  * **Sao chép từ phiên bản đang áp dụng:** nút điền sẵn giá trị hiện hành; **bảng so sánh** (Hiện tại → Mới) với phần chênh lệch tô nhấn (icon mũi tên + chữ, không chỉ màu).
  * **Tác động:** khối "Áp dụng cho đơn tạo từ bây giờ; đơn đã tạo giữ nguyên snapshot" + ví dụ minh họa tính cọc/VAT cho đơn mẫu 2.700.000đ bằng đúng công thức của DESIGN.md §23 (chỉ hiển thị minh họa, không gọi BE).
  * Xác nhận qua `ConfirmDialog` khi "Áp dụng ngay" làm một policy đang áp dụng bị thay (nêu rõ tên bản sắp bị thay thế). Thành công: toast + làm mới danh sách + đóng; lỗi BE hiển thị theo `code`/`errors` tại trường tương ứng.
  * **Không** tự vô hiệu hóa policy cũ ở FE: hành vi (BE tự tắt bản cũ hay không) lấy từ snapshot; nếu BE không tự tắt thì ghi open-questions và hiển thị cảnh báo "nhiều policy active" như trên.

## 4. Màn hình & hành vi — Gói thuê bao

* **Danh sách:** thẻ/hàng gói: tên, mô tả ngắn, giá (`formatVnd`), thời hạn (ngày), số giờ kèm theo, **giá/giờ quy đổi** (`price / included_hours`), trạng thái (`Đang bán`/`Ngừng bán`), số người đang dùng (nếu BE trả), hành động *Sửa*, *Ngừng bán/Mở bán lại*, *Xóa* (chỉ khi `subscribersCount === 0` hoặc BE cho phép; nếu BE trả 409 vì đã có người mua → hộp thoại gợi ý "Ngừng bán thay vì xóa").
* **Tạo/Sửa** (`Drawer` + RHF/Zod):

| Trường | Ràng buộc |
|---|---|
| Tên | 3–80 ký tự, bắt buộc |
| Mô tả | tối đa 500 ký tự |
| Giá (VND) | số nguyên >= 0 (`NUMERIC(14,2)` nhưng UI chỉ nhập số nguyên), tối đa 1.000.000.000 |
| Thời hạn (ngày) | số nguyên 1–365 |
| Số giờ kèm theo | số nguyên 1–2000 |
| Đang bán | công tắc |

* **Xem trước:** `PlanCard` (cùng thành phần dùng ở trang công khai/landing) cập nhật trực tiếp khi nhập.
* **Sửa gói đã có người mua:** cảnh báo rõ "Thay đổi chỉ áp dụng cho người mua sau này" **nếu** BE cho phép sửa; nếu BE không có `PUT` (snapshot) thì chỉ hiển thị Tạo/Ngừng bán/Xóa và ghi open-questions. Không tự suy đoán endpoint.
* Xóa: `ConfirmDialog` danger có nhập lại tên gói.
* Hạng mục dữ liệu mở: tên các endpoint thật (Phúc đã có tạo/xóa; sửa/danh sách có thể chưa) — **lấy từ snapshot**, dùng mock cho phần chưa có.

## 5. Dữ liệu & kiểu

```ts
export type RentalPolicy = { id: number; vehicleTypeId: number | null; vehicleTypeName?: string; name: string;
  vatRate: number; overtimeFeeRate: number; depositPercentage: number; isActive: boolean; managedBy?: string; createdAt?: string };
export type PolicyInput = { vehicleTypeId: number; name: string; vatRate: number; overtimeFeeRate: number; depositPercentage: number; isActive: boolean };
export type SubscriptionPlan = { id: number; name: string; description?: string; price: number; durationDays: number; includedHours: number; isActive: boolean; subscribersCount?: number };
export type PlanInput = Omit<SubscriptionPlan, "id" | "subscribersCount">;
```

* Zod `policySchema`, `planSchema` dùng chung cho form và adapter.
* Hooks: `usePolicies`, `useCreatePolicy`, `usePlans`, `useCreatePlan`, `useUpdatePlan`, `useDeactivatePlan`, `useDeletePlan`; `invalidateQueries` đúng khóa sau mutation.
* Danh sách loại xe cho dropdown: dùng chung `useVehicleTypes` (module vehicles của Kiệt/FE-12 nếu có; nếu chưa thì thêm vào `features/vehicles/api` và dùng lại).
* Mock: handler theo hợp đồng thật, kể cả lỗi `409` khi xóa gói đã có người mua và `400` kèm `errors`.

## 6. Truy cập & chuyển động

* Form: nhãn trên ô, lỗi dưới ô (`aria-describedby`), focus vào ô lỗi đầu tiên; so sánh "Hiện tại → Mới" có văn bản thay thế ("VAT tăng từ 8% lên 10%"); công tắc `role="switch"`; Drawer bẫy focus; bảng có `caption`.
* Motion admin tối thiểu (A9): Drawer trượt 320ms, fade panel 160ms, toast. Không parallax/3D/loop.
* Panel `.glass-admin`; ô nhập và thân bảng Surface đặc.

## 7. Kiểm thử

* **Unit:** `policySchema`/`planSchema` (biên 0/100, 2 chữ số thập phân, tên rỗng/dài), tính giá/giờ quy đổi, ví dụ minh họa cọc/VAT khớp công thức §23, phát hiện "nhiều policy active"/"không có policy active".
* **Component (RTL + mock):** danh sách policy (loading/empty/error), banner cảnh báo, tạo phiên bản mới (hợp lệ, sai ràng buộc, lỗi BE theo `errors`), `ConfirmDialog` khi thay policy đang áp dụng, **không có nút Sửa/Xóa** policy; danh sách gói, tạo/sửa/ngừng bán/xóa, xóa 409 → gợi ý ngừng bán, xem trước `PlanCard`.
* **Phân quyền:** `Staff` vào `/admin/policies` bị `/forbidden`; `Manager` thấy cả hai trang.
* **A11y:** axe sạch; thao tác tạo policy chỉ bằng bàn phím.

## 8. Acceptance criteria

- [ ] `/admin/policies` và `/admin/subscription-plans` là trang thật (không còn dữ liệu giả của `CatalogManager`), dùng thành phần dùng chung
- [ ] Policy **bất biến**: không có sửa/xóa; tạo phiên bản mới có so sánh, tác động và xác nhận
- [ ] Cảnh báo đúng khi nhiều/không có policy active cho một loại xe
- [ ] Gói thuê bao: tạo/sửa (nếu BE hỗ trợ)/ngừng bán/xóa khi chưa ai mua; 409 được xử lý
- [ ] Zod chặn mọi giá trị ngoài ràng buộc; lỗi BE hiển thị đúng trường
- [ ] Guard `Admin`/`Manager`; menu theo vai trò
- [ ] Mock + hợp đồng đồng bộ snapshot; endpoint thiếu ghi vào open-questions
- [ ] Test, axe, `lint:design`, `build` xanh; đã báo Anh về việc thay trang stub

## 9. Câu hỏi mở

* **O1.** Khi tạo policy mới `is_active=true`, BE có tự tắt bản cũ cùng loại xe không? (Xác nhận qua snapshot/Lạc.)
* **O2.** Policy chung (`vehicle_type_id = null`) có được dùng không?
* **O3.** BE có `PUT` sửa gói và trả `subscribersCount` không? (Phúc, BE-20.)

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js, forms, admin UI). Hiện thực FE-14 theo ĐÚNG docs/specs/FE-14-admin-policies-plans.md. Điều kiện tiên quyết: P1, F1–F3, FE-02 đã xong; nhánh của Anh (admin shell + stub) đã nằm trong main. Nhánh feat/fe-14-policies-plans.

ĐỌC TRƯỚC: AGENTS.md (node_modules/next/dist/docs/ — static export); DESIGN.md A6, A9, A10 và B.§22–§24, §40–§41; FE-FOUNDATION; docs/api/contract-snapshot.md (rental-policies, subscription-plans — endpoint THẬT, quyền, lỗi); ../Car-Rental-System-BE/specs/FR-011-rental-policy.md và FR-022; src/features/admin/** (CatalogManager, các trang policies/subscription-plans), shared components đã tách ở F3; src/features/subscriptions (PlanCard/SubscriptionPlans ở landing).

BƯỚC 0 (không code): liệt kê endpoint đã có/chưa có (đặc biệt: sửa gói, subscribersCount, hành vi tắt policy cũ khi tạo mới, policy chung vehicle_type_id=null). Đưa tôi bản liệt kê.

LÀM: (1) kiểu + Zod + adapter + mock + hooks có test; (2) thay hai trang stub bằng trang thật theo mục 3–4, dùng DataTable/FilterBar/Drawer/ConfirmDialog dùng chung; (3) PolicyDiff (so sánh Hiện tại → Mới) và ví dụ minh họa cọc/VAT theo §23 (chỉ hiển thị); (4) PlanCard dùng chung với landing cho phần xem trước; (5) guard + menu; (6) test + axe.

RÀNG BUỘC: KHÔNG có nút sửa/xóa policy; không tự tắt policy cũ ở FE; không tự bịa endpoint — thiếu thì mock đúng hợp đồng đề xuất và ghi docs/open-questions.md; panel .glass-admin, ô nhập/thân bảng nền Surface đặc; chuỗi tiếng Việt; không emoji/gradient/Inter. Báo Anh trước khi xóa CatalogManager giả (nếu còn dùng ở trang khác thì giữ).

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp từng trạng thái ở 375/1280; axe; tạo policy chỉ bằng bàn phím; kiểm tra Staff bị chặn.

BÁO CÁO: file đổi, kết quả lệnh, endpoint thiếu và cách xử lý, điểm cần Anh (đã thay stub), Lạc (BE-11), Phúc (BE-20) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
