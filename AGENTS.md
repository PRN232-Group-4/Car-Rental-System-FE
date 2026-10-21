<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Quy tắc bắt buộc: bảo vệ nhánh main

- Không commit trực tiếp hoặc push trực tiếp lên `main`.
- Không dùng `git push --force`, `--force-with-lease`, refspec có dấu `+` hoặc cách tương đương để ghi đè lịch sử `main`.
- Mọi thay đổi vào `main` phải thông qua Pull Request từ `dev` hoặc nhánh công việc; không merge cục bộ vào `main` rồi push để bỏ qua PR.
- Trước khi commit hoặc push, kiểm tra nhánh hiện tại và nhánh đích. Nếu đang ở `main`, chuyển sang nhánh công việc trước khi commit.

## Quy tắc bắt buộc: lỗi biểu mẫu

- Mọi form được tạo hoặc chỉnh sửa phải hiển thị lỗi ngay dưới trường input/select/textarea hoặc vùng upload tương ứng, với thông báo tiếng Việt rõ ràng và cách sửa.
- Không chỉ dùng toast, banner hoặc popup validation trình duyệt cho lỗi thuộc một trường. Lỗi mạng, quyền truy cập và lỗi không xác định được trường hiển thị ở vùng lỗi chung.
- Validate trước khi gửi, hiển thị tất cả lỗi và focus trường lỗi đầu tiên. Không tự thêm ràng buộc nghiệp vụ ngoài spec/API.
- Ánh xạ lỗi validation backend (ProblemDetails.errors, PascalCase/camelCase, đường dẫn lồng nhau) về đúng trường; giữ lỗi không ánh xạ được trong vùng lỗi chung.
- Khi sửa trường, xóa hoặc validate lại lỗi của chính trường đó; giữ dữ liệu và lỗi của các trường khác.
- Dùng aria-invalid, aria-describedby liên kết tới thông báo có id ổn định, dấu hiệu trực quan và role="alert" hoặc aria-live.
- Kiểm tra trường bắt buộc, định dạng/khoảng giá trị, lỗi API và lỗi mạng khi thay đổi form.
- Ưu tiên tái sử dụng `src/components/forms/inline-validation.tsx` (`useInlineValidation`, `ValidatedForm`, `InlineInput/InlineSelect/InlineTextarea`). Mỗi form độc lập dùng một validation riêng; lỗi nghiệp vụ nhiều trường truyền qua `validate`, lỗi API dùng `report`, lỗi upload dùng `setField` để giữ lỗi của các trường khác.

## Quy tắc bắt buộc: đồng bộ giao diện Admin

- Khi tạo hoặc sửa `/admin/**` hay component dùng trong Admin, đọc và tuân theo `docs/admin-ui.md` cùng Phần A9 của `DESIGN.md` (Transit Desk: folio + sổ mở).
- Trang cấp 1 mở bằng `TransitFolio`; bộ lọc/tìm kiếm/tra cứu dùng `AdminFilterBar`, `AdminFilterField`, `AdminFilterButton`; bảng danh sách dùng `AdminTableCard`, `AdminTable`, `AdminTableEmptyRow` (hoặc `DataTable` khi có sắp xếp); trạng thái dùng `AdminStatusBadge`. Không tự dựng style riêng cho từng trang nếu component chung đã đáp ứng, và không dùng pill `StatusBadge` trong Admin.
- Thay đổi màu, bo góc, kích thước control hoặc bố cục chung tại component dùng chung; dùng token `td-*` trong `globals.css` (CTA `td-oxide`, rule `td-ink`/`td-rule`, bo 4px/6px). Viền đậm `border-td-ink` chỉ dùng làm rule đầu bảng/khối — không dùng làm khung card; không lồng card, không shadow, không toolbar tràn ngang.
- Giữ nguyên phân quyền, validation, điều kiện lọc và request API khi chỉ sửa style. Kiểm tra desktop/mobile, lỗi inline, áp dụng và đặt lại bộ lọc trước khi hoàn tất.

## Quy tắc bắt buộc: popup tạo và chỉnh sửa Admin

- Dùng `FormDialog` và đặt `FormDialogFooter` bên trong `ValidatedForm`; không tự dựng modal, footer hoặc màu riêng. Quy cách đầy đủ tại `docs/admin-ui.md`, mục “Popup biểu mẫu”.
- Header và footer giữ nguyên vị trí khi nội dung cuộn; footer dùng nền surface đặc, viền line, nút Hủy/Đóng secondary và Lưu primary. Bố cục phải xuống hàng trên mobile, không che trường đang focus hoặc lỗi inline.
- Giữ dữ liệu và popup khi API lỗi; khóa gửi lặp và đóng popup khi đang lưu/upload. Không thay quy tắc nghiệp vụ hay kiểu dữ liệu API để sửa style.
- `lint:design` kiểm tra từng `FormDialog` phải có `FormDialogFooter` trong `ValidatedForm`, kể cả nội dung JSX qua biến cục bộ. Chạy `npx vitest run scripts/admin-popup-rules.test.mjs` khi sửa bộ kiểm tra.
- Khi tải dữ liệu dùng `Skeleton`/`FormSkeleton` và `AdminTableSkeleton` chung; có thông báo đọc màn hình và `aria-busy` cho bảng. Không dựng bảng rỗng hoặc form có giá trị mặc định tạm thời trong lúc tải.

## Quy tắc bắt buộc: icon thao tác danh sách

- Trong cột `data-actions`, dùng `AdminRowAction` với loại hành động từ `src/components/admin/row-action-rules.ts`; chỉ hiển thị icon, không thêm chữ hoặc icon riêng tại trang.
- Ánh xạ thống nhất: xem/mở chi tiết = `view`/`Eye`, sửa/cập nhật = `edit`/`Pencil`, xóa = `delete`/`Trash2` màu danger. Thêm hành động mới phải bổ sung quy tắc chung và kiểm thử.
- Đổi trạng thái dùng `activate`/`CirclePlay` để kích hoạt và `deactivate`/`PauseCircle` để tạm ngưng; có xác nhận, loading và chỉ cập nhật trạng thái hiển thị sau API thành công.
- Truyền `label` tiếng Việt mô tả hành động và bản ghi khi có; component giữ `aria-label`, tooltip, focus bàn phím, trạng thái disabled/loading. Giữ nguyên phân quyền, xác nhận xóa và request API.
- Nút ở tiêu đề, bộ lọc và footer biểu mẫu giữ nhãn chữ. Danh sách không có thao tác khả dụng theo thiết kế không dựng cột Thao tác rỗng.
