# Quy chuẩn giao diện Admin — Transit Desk

Áp dụng cho toàn bộ `/admin/**` và mọi component các trang này dùng. Nguồn chuẩn: **Phần A9 của `DESIGN.md`** (bảng màu `td-*`, hình khối, folio/ledger). Khi sửa giao diện, sửa tại component dùng chung trước, chỉ viết riêng khi nghiệp vụ thật sự khác.

## 1. Khung trang và điều hướng

- Dùng `TransitDeskShell` (`src/features/admin/transit-desk/TransitDeskShell.tsx`) cho masthead, chương điều hướng, dải route ngữ cảnh và theme sáng/tối. Không dựng header/sidebar riêng trong trang.
- Masthead và dải route ngữ cảnh nằm trong một khối `.topBar` **dính đỉnh** (`position: sticky; top: 0`), nên cả hai luôn hiện khi cuộn và vẫn dính liền khi masthead xuống hai dòng ở `≤1280px`. `html[data-admin-theme]` có `scroll-padding-top: 132px` để anchor và trường được focus không bị thanh dính che.
- Chương điều hướng (`Ca trực`, `Vận hành`, `Điều phối`, `Chăm sóc & Sự cố`, `Đội xe`, `Chính sách`, `Tổ chức`, `Cá nhân`) lấy từ `ADMIN_NAV_ITEMS` + `ROUTE_CHAPTER_MAP`, lọc theo quyền. Thêm route mới phải thêm vào cả hai nơi.
- `Ctrl/⌘ + K` mở `TransitDeskRouteIndex`. Không thêm phím tắt trùng.
- Theme: dùng chung `localStorage.vrs-admin-theme` (`light|dark`) cho các cổng, chỉ áp dụng khi shell mount, gỡ khi rời cổng; chuyển theme đi qua `RentalLiquidTransition` và tôn trọng `prefers-reduced-motion`.

## 2. Token, hình khối, chữ

- Màu chỉ dùng token `--color-td-*` (khai báo trong `globals.css`): `td-paper` (nền trang), `td-white` (bề mặt), `td-ink` / `td-muted` (chữ), `td-rule` (đường kẻ), `td-oxide` (CTA, nhấn), `td-teal` (nhấn chữ nghiêng), `td-chalk` (nền phụ). Không dùng palette Tailwind thô hoặc hex tuỳ ý.
- CTA mọi cổng dùng **cam amber thương hiệu**. `td-oxide` tham chiếu `--primary`, không khai báo palette tím riêng cho Admin. Light: `#B45309` với chữ trắng; dark: `#F6BA7C` với chữ `#17161B` qua `--on-primary`.
- Hình khối: nút và control **4px**, ô nhập `.admin-input` **6px**, bề mặt hồ sơ **4px**, stage của trang thuê xe 10–18px. Không dùng bo 12/16px cho phần tử mới.
- Đường kẻ thay cho card: `border-td-rule` (1px) phân tách, `border-td-ink` (1px) làm rule đầu bảng/khối. **Không** dùng `shadow-e1/e2`, không lồng card chỉ để trang trí.
- Nhãn phụ, số liệu, ID, ngày giờ, trạng thái dùng `font-mono` chữ hoa nhỏ (`text-[10px]/text-[11px]`, `tracking-wider`). Tiêu đề dùng `font-sans`, nhấn bằng `<span className="text-td-teal">` (không in nghiêng).

## 3. Folio header (bắt buộc cho trang cấp 1)

Dùng `TransitFolio` + `TransitFolioMetric` trong `src/features/admin/transit-desk/TransitFolio.tsx`; không copy markup.

```tsx
<TransitFolio
  index="07" tag="ORG"
  kicker="TỔ CHỨC · NHÂN SỰ"
  title={<>Nhân viên & <span className="text-td-teal">tài xế.</span></>}
  description="Một câu mô tả phạm vi và cách đọc trang."
>
  <TransitFolioMetric label="TỔNG NHÂN SỰ" value={totalCount} />
  <button className="rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white">…</button>
</TransitFolio>
```

- Số chương + tag: `01 OPS` (Ca trực), `02 FLT` (Đội xe), `03 TRI` (Chăm sóc & Sự cố), `04 OPS/INS` (Vận hành), `05 DSP` (Điều phối), `06 PLC` (Chính sách), `07 ORG` (Tổ chức), `08 ME` (Cá nhân).
- Vùng phải chỉ chứa **một** số liệu tổng và/hoặc **một** hành động chính. Nút luôn có nhãn chữ, không icon-only.
- Mobile: vùng phải xuống dòng dưới tiêu đề, không cắt chữ, không tràn ngang.

## 4. Trang danh sách

- Bộ lọc: `AdminFilterBar` + `AdminFilterField` + `AdminFilterButton` (`src/components/admin/AdminFilters.tsx`) — nhãn mono chữ hoa, control gạch chân 36px, nút áp dụng cam amber, "Đặt lại" secondary. Không dựng toolbar lọc riêng.
- Bảng: `AdminTableCard` + `AdminTable` + `AdminTableEmptyRow` (`src/components/admin/AdminTable.tsx`) hoặc `DataTable` (`src/components/ui/DataTable.tsx`, dùng cho bảng có sắp xếp). Cả hai render kiểu **sổ mở**: header trong, chân bảng là đường `td-ink`, hàng phân tách `td-rule`, hover `td-chalk`.
- Cột thao tác đánh dấu `data-actions`, căn phải, chỉ dùng `AdminRowAction` với ánh xạ tại `row-action-rules.ts` (`view`=Eye, `edit`=Pencil, `delete`=Trash2 danger, `activate`=CirclePlay, `deactivate`=PauseCircle). Không tự dựng icon/nhãn trong cột này; không dựng cột Thao tác rỗng.
- Phân trang, số bản ghi, mô tả trạng thái trống dùng mono `text-[11px] text-td-muted`.
- Trạng thái: `AdminStatusBadge` (**badge pill màu nền** — bo tròn, padding nhỏ, glyph nhỏ + nhãn, cặp màu theo `status-tone.ts`) với `domain` + giá trị API; bảng ánh xạ duy nhất `src/components/admin/status-rules.ts` (`activity`, `vehicle`, `rental`, `maintenance`, `license`, `shift`, `report`, `review`). `LicenseBadge` render qua `AdminStatusBadge`. `StatusBadge` dùng cùng một nguồn ánh xạ tone, dùng ngoài Admin.
- Tải dữ liệu: `AdminTableSkeleton` trong `tbody` với đúng số cột, `aria-busy` trên bảng, không hiện "không có dữ liệu" trước khi request xong.
- Ngày giờ theo `formatAdminDateTime`/`formatAdminDate` (`src/lib/date-time`), `Asia/Ho_Chi_Minh`. Không hiện ID kỹ thuật làm tên dự phòng.

## 5. Trang chi tiết và hồ sơ

- Folio + lưới 12 cột: cột trái 4 (hồ sơ định danh trong `rounded border border-td-rule bg-td-white p-6`), cột phải 8 (biểu mẫu/bảng chi tiết). Dưới `lg` xếp một cột.
- Hồ sơ định danh: avatar 64px bo 4px, tên `text-lg font-bold`, `AdminStatusBadge`, rồi danh sách `dl` dòng `flex justify-between` với `divide-y divide-td-rule` (nhãn `text-td-muted`, giá trị `font-semibold text-td-ink`). Không dùng banner nền tối/navy.
- Biểu mẫu: `ValidatedForm` + `FormField`/`InlineInput` với `.admin-input`; tiêu đề mục là `text-sm font-bold text-td-ink` + mô tả mono; hàng lưu có `border-t border-td-rule`, nút cam amber 4px.
- Ghi chú quyền/nghiệp vụ dùng `border-l-2 border-td-oxide pl-3 text-xs text-td-muted`, không dùng khối nền màu.
- Lỗi luôn hiển thị ngay dưới trường (theo `AGENTS.md`), lỗi chung đặt ở vùng lỗi phía trên nội dung.
- Thao tác tạo/cập nhật/xóa hiển thị toast thành công sau API thành công; lỗi chung thêm toast lỗi và giữ nội dung form. Dùng Toaster chung tại root Providers; gọi ở trang hoặc hook xử lý mutation, không gọi ở cả hai tầng. Lỗi đã ánh xạ vào trường không tạo toast rỗng, không thay lỗi inline bằng toast.

## 6. Popup biểu mẫu

- Dùng `FormDialog` (+ `FormDialogFooter` **bên trong** `ValidatedForm`); không tự dựng dialog hay footer. Rule `ADMIN_POPUP_FORM` của `lint:design` kiểm tra cấu trúc này.
- Header/footer giữ nguyên khi nội dung cuộn; footer nền surface đặc, viền trên, nút Hủy secondary + Lưu primary; khóa đóng/gửi khi đang lưu; giữ dữ liệu và lỗi khi API thất bại.
- Nội dung trong dialog dùng `.admin-input`, nhãn mono, `InlineError`; không đặt bảng dữ liệu lớn trong dialog.
- Escape/backdrop đóng khi không busy, giữ focus trong dialog và trả focus về nút mở.

## 7. Ngoại lệ: `/admin/rentals` (Graphite Glass Deck)

- Màu nhấn vẫn dùng cam amber chung; mặt hồ sơ luôn sáng dùng `--stage-amber` để giữ tương phản. Không khai báo lại màu tím trong CSS riêng.
- Trang Vận hành đơn thuê giữ art-direction riêng: `RentalWorkspaceV4` + `rental-workspace-v4.module.css`, canvas tối riêng, stage kính, 3 cột (hàng đợi · hồ sơ · bảng lệnh).
- Route này **full-bleed**: `[data-subportal="rental-v4"] .mainContent` bỏ padding/max-width. Trang cuộn tự nhiên ở mọi kích thước; không khóa shell ở `100dvh`/`overflow:hidden`, không đặt hồ sơ/bảng lệnh trong vùng cuộn lồng có chiều cao cố định. Container workspace `>1200px` giữ ba cột; container `640–1200px` giữ hàng đợi bên trái, hồ sơ và bảng lệnh nối tiếp bên phải. Chỉ container `<640px` mới xếp danh sách phía trên chi tiết. Hàng đợi cuộn riêng, dùng overscroll auto để tiếp tục cuộn trang khi tới biên. Thao tác chính nằm trong luồng trang để không bị header dính che. Không bọc thêm khung giấy của shell.
- Không áp `TransitFolio` cho route này; nhưng vẫn dùng `AdminStatusBadge`/`status-rules` cho trạng thái và tuân thủ a11y/form rules.

## 8. Ảnh và thành phần tham chiếu

- Ảnh phương tiện, tên xe, tên nhân sự dùng component chung `VehicleImage`/`VehicleName`/`StaffName`; không tự ghép chuỗi tên hoặc dựng ảnh riêng trong trang.
- Ảnh thiếu/hỏng có fallback rõ ràng, kích thước cố định, `object-cover`; không thay bằng ảnh xe khác.
- Khi chỉ có ID, dùng query dùng chung có cache và cùng query key; giữ ID cho request, không hiển thị làm tên dự phòng.
- Ô chọn tài khoản/nhân sự hiển thị email; kỹ thuật viên chỉ gồm tài khoản Maintenance đang hoạt động. Cơ sở dùng tên, phương tiện dùng tên và biển số; ID chỉ dùng trong request.
- Khung Admin luôn hiển thị cơ sở và email của tài khoản hiện tại từ hồ sơ tài khoản. Chưa phân công phải hiển thị đúng trạng thái, không đặt cơ sở mặc định giả.

## 9. Lint và kiểm thử

- `npm run lint:design` chặn: gradient, màu palette/hex thô, token màu không tồn tại trong `@theme`, emoji, `h-screen`, backdrop-filter ngoài `globals.css`, kicker dạng chip trên tiêu đề, `statusStyles/statusColors/statusTones` cục bộ, control tự dựng trong `td[data-actions]`, popup thiếu `FormDialogFooter` trong `ValidatedForm`.
- `src/components/admin/status-rules.ts` có test riêng; thêm trạng thái mới phải thêm domain + test.
- Hành động mới trong danh sách phải thêm vào `row-action-rules.ts` và test `scripts/admin-row-action-rules.test.mjs`.

## 10. Kiểm tra trước khi hoàn tất

- `npm run typecheck`, `npm run lint:design`, `npx vitest run`.
- Chụp lại trang ở 1600px và 1280px, cả light và dark; kiểm tra vùng dính đỉnh không che nội dung, không tràn ngang, lỗi inline đúng trường.
- Nếu thêm trang mới: thêm route vào `ADMIN_NAV_ITEMS` + `ROUTE_CHAPTER_MAP`, dùng `TransitFolio`, `AdminFilterBar`, `AdminTableCard`, `AdminStatusBadge` — không tạo bảng màu hay toolbar riêng.
