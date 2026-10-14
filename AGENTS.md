<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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

- Khi tạo hoặc sửa `/admin/**` hay component dùng trong Admin, đọc và tuân theo `docs/admin-ui.md` cùng Phần A của `DESIGN.md`.
- Bộ lọc/tìm kiếm/tra cứu phải dùng `AdminFilterBar`, `AdminFilterField`, `AdminFilterButton`; bảng danh sách phải dùng `AdminTableCard`, `AdminTable`, `AdminTableEmptyRow`. Không tự dựng style riêng cho từng trang nếu component chung đã đáp ứng.
- Thay đổi màu, bo góc, kích thước control hoặc bố cục chung tại component dùng chung; dùng token trong `globals.css`. Không thêm viền đen đậm, card lồng card hay toolbar tràn ngang.
- Giữ nguyên phân quyền, validation, điều kiện lọc và request API khi chỉ sửa style. Kiểm tra desktop/mobile, lỗi inline, áp dụng và đặt lại bộ lọc trước khi hoàn tất.
