# Quy chuẩn giao diện Admin

Áp dụng cho toàn bộ `/admin/**` và các component được các trang này sử dụng. Các trang mới và mọi chỉnh sửa phải dùng quy chuẩn này cùng Phần A của `DESIGN.md`. Ưu tiên tái sử dụng component; thay đổi style chung tại component dùng chung để các trang cập nhật cùng nhau.

## Bố cục và tiêu đề

- Dùng `StaffShell` cho header, sidebar và khoảng đệm responsive. Nội dung trang có `space-y-6`; không thêm lề cố định theo sidebar vào từng trang.
- Tiêu đề nội dung: `text-2xl font-bold tracking-tight sm:text-3xl`. Mô tả: `text-sm text-ink-3`; nhãn phụ dùng `text-xs`.
- Dùng token từ `globals.css`: nền `canvas`, bề mặt `surface`, chữ `ink/ink-2/ink-3`, viền `line/line-strong`, màu hành động `primary`. Không dùng viền đen đậm hoặc màu palette tự đặt.
- Panel dữ liệu dùng nền surface, viền line 1px, bo góc 16px và shadow-e1. Không lồng card chỉ để trang trí.
- Khi thu gọn sidebar, căn icon theo tâm của ô bấm bằng flex; ẩn hoàn toàn nhãn/chevron và giữ gutter cuộn đối xứng.
- Admin có nút đổi sáng/tối trên header. Lưu lựa chọn `light|dark` tại `localStorage.vrs-admin-theme`; chưa có lựa chọn thì theo hệ điều hành. Theme chỉ áp dụng khi shell Admin đang mount, bao gồm portal popup, và được gỡ khi rời Admin. Dùng token để cả hai theme giữ tương phản.

## Màu trạng thái

- Bắt buộc dùng `AdminStatusBadge` từ `src/components/admin/AdminStatusBadge.tsx` cho badge trạng thái, với domain và giá trị API; nhãn tiếng Việt giữ ở nơi sử dụng. Không tự dựng bảng màu trạng thái ở mỗi trang.
- `isActive/active = true`, trạng thái `active`, xe `available`, GPLX `approved` dùng **xanh lá** (`bg-success-bg text-success`), tuyệt đối không dùng `primary` (màu hành động/chọn menu). `false/inactive/unavailable` dùng neutral.
- Bảng ánh xạ duy nhất tại `src/components/admin/status-rules.ts` phân biệt từng nghiệp vụ theo Phần A9: đơn `renting` là success; xe `rented/renting` là info; chờ duyệt là warning; từ chối/hết hạn GPLX là danger; đơn đã hoàn tất là neutral. Bổ sung trạng thái phải bổ sung ánh xạ và kiểm thử tại đây.
- Chỉ so khớp toàn bộ giá trị sau trim/lowercase; cấm suy luận bằng `includes("active")` vì `inactive` sẽ bị tô sai. Trạng thái lạ/rỗng dùng neutral, không tự coi là hoạt động.
- Mọi badge luôn có icon và nhãn chữ; các cặp token success/warning/danger/info phải đọc rõ ở cả theme sáng/tối. Kiểm thử `status-rules.test.ts` bảo vệ trạng thái phủ định, khác biệt nghiệp vụ và màu xanh lá.
- `lint:design` chặn bảng màu `statusStyles/statusColors/statusTones` cục bộ trong Admin/vận hành và điều kiện `active/isActive` tô màu primary; bảng ánh xạ chung và `AdminStatusBadge` là nơi sửa quy tắc.

## Bộ lọc, tìm kiếm và tra cứu

- Bắt buộc dùng `AdminFilterBar`, `AdminFilterField`, `AdminFilterButton` từ `src/components/admin/AdminFilters.tsx`. Không tự dựng toolbar lọc bằng một tập class riêng cho từng trang.
- Thanh lọc nằm trước bảng, có nhãn hiển thị rõ cho từng input/select và mô tả ngắn nếu cần. Không dùng placeholder thay cho label.
- Control cao 44px, chữ 14px, bo theo `--r-control`, viền `--line-strong`, nền surface; label 12px. Icon tìm kiếm/select không chắn thao tác hay nội dung.
- Nút áp dụng là primary, “Đặt lại” là secondary. Trên màn hình đủ rộng, control và nút cùng hàng; khi thiếu chỗ phải xuống hàng gọn, không tràn ngang.
- Bộ lọc áp dụng khi submit phải tách giá trị đang nhập và giá trị đã áp dụng. Bộ lọc tức thời giữ hành vi hiện có. Đặt lại phải xóa điều kiện, đưa phân trang về trang đầu nếu có, và xóa lỗi của form lọc.
- Dùng `ValidatedForm` và `InlineInput/InlineSelect` cho bộ lọc có submit/validation; mỗi form có validation riêng. Giữ lỗi ngay dưới trường, focus lỗi đầu tiên; không thêm ràng buộc nghiệp vụ chỉ để phục vụ style.

## Danh sách và thao tác

- Bắt buộc dùng `AdminTableCard`, `AdminTable`, `AdminTableEmptyRow` cho bảng danh sách. Cột thao tác đánh dấu `data-actions` để căn phải thống nhất.
- Nút/link trong cột thao tác chỉ hiển thị icon qua `AdminRowAction`; không tự dựng icon hoặc nhãn chữ trong từng trang. Ánh xạ tại `src/components/admin/row-action-rules.ts`: `view` = `Eye` (xem/mở chi tiết), `edit` = `Pencil` (sửa/cập nhật), `delete` = `Trash2` (xóa, màu danger). Hành động mới bổ sung tại ánh xạ chung cùng kiểm thử.
- Truyền `label` tiếng Việt rõ nghĩa, kèm tên bản ghi khi có, để component tạo `aria-label` và tooltip. Vùng bấm 36 × 36px, icon 16px, có focus bàn phím; disabled/loading và kiểm tra quyền giữ nguyên. Không truyền children hoặc tự đổi style/icon tại trang. Nút tiêu đề, bộ lọc, footer biểu mẫu vẫn có chữ.
- Không dựng cột Thao tác rỗng khi danh sách không hỗ trợ thao tác theo thiết kế. Chính sách thuê xe lưu phiên bản theo FR-011; tạo phiên bản mới khi đổi điều khoản, không dựng nút sửa điều khoản/xóa. Đổi riêng trạng thái dùng `AdminRowAction`: `activate` = `CirclePlay` (kích hoạt), `deactivate` = `PauseCircle` (tạm ngưng), có xác nhận và khóa gửi lặp; cập nhật badge sau API thành công.
- `lint:design` áp dụng `ADMIN_ROW_ACTION` để chặn control/icon riêng trong `td[data-actions]`, kể cả JSX qua biến cục bộ. Component chung và bảng ánh xạ quyết định icon; kiểm thử tại `scripts/admin-row-action-rules.test.mjs` bảo vệ quy tắc.
- Header nền sunken, chữ muted 12px uppercase; thân bảng 14px, đường phân cách nhẹ và hover cùng token. Bảng rộng cuộn trong wrapper; toàn trang không tràn ngang.
- Không hiển thị ID kỹ thuật trong các bảng hoặc làm tên dự phòng. Dùng tên, biển số, email hoặc nhãn thiếu thông tin. Giữ ID trong state, URL, request để các thao tác trỏ đúng bản ghi.
- Ngày giờ hiển thị dùng `formatAdminDateTime` từ `src/lib/date-time` theo `dd/MM/yyyy HH:mm`, múi giờ `Asia/Ho_Chi_Minh`; ngày lịch không có giờ dùng `formatAdminDate` (`dd/MM/yyyy`). Giá trị input native `date/datetime-local` vẫn giữ ISO để trình duyệt và API xử lý đúng.
- Loading, lỗi, trạng thái trống và phân trang phải dễ đọc; không đổi kiểu viền, khoảng cách và kiểu nút giữa các trang.

## Popup biểu mẫu

- Tạo/chỉnh sửa trên danh sách dùng `FormDialog` từ `src/components/ui/FormDialog.tsx`; chỉnh sửa phương tiện mở cùng popup, route chỉnh sửa trực tiếp vẫn dùng được khi truy cập bằng liên kết.
- Dùng token surface/ink/line, bo góc 16px và shadow-e2; cỡ `md` tối đa 672px, `xl` tối đa 1024px, chiều cao tối đa `90dvh`, chừa lề viewport 16px mỗi phía. Không tự đặt màu hoặc wrapper modal riêng ở từng trang.
- Header sticky chứa tiêu đề mô tả hành động và nút đóng có tên truy cập. Nội dung dài cuộn bên trong dialog; `scroll-padding` chừa chỗ cho header/footer khi focus trường lỗi.
- Bắt buộc dùng `FormDialogFooter` bên trong `ValidatedForm`; các nút giữ nguyên liên kết với form để Enter/submit/validation hoạt động. Footer sticky ở đáy, nền surface đặc, viền line phía trên, padding chung và safe-area mobile; nhóm nút căn phải và xuống hàng khi thiếu chỗ. Không tự dựng thanh nút bằng `div` có style riêng.
- Hủy/Đóng dùng secondary, Lưu/Thêm mới dùng primary; khóa gửi lặp và nút đóng khi đang lưu/upload. Giữ nguyên dữ liệu, lỗi inline và popup khi API thất bại; sau lưu thành công đóng popup và tải lại danh sách.
- Escape và click backdrop đóng khi không busy; giữ focus trong dialog và khôi phục focus về nút mở khi đóng. Kiểm tra bàn phím, lỗi đầu tiên, desktop/mobile và cả theme sáng/tối.
- `lint:design` có quy tắc `ADMIN_POPUP_FORM`: chặn thẻ `dialog` tự dựng trong Admin và thiếu footer hoặc footer đặt ngoài `ValidatedForm`. Nội dung JSX có thể nằm trong biến cục bộ; các form popup mới phải giữ cấu trúc kiểm tra được tại nơi dùng `FormDialog`.

## Ảnh phương tiện

- Bảng/danh sách và thông tin tham chiếu xe trong trang chi tiết dùng `VehicleName`/`VehicleImage` chung; hiển thị `mainImageUrl` thật với alt mô tả xe, kích thước cố định và object-fit phù hợp để giữ bố cục.
- Ảnh thiếu, URL không hợp lệ hoặc tải lỗi dùng fallback icon/nhãn thiếu ảnh tại component chung. Không dùng ảnh một chiếc xe không liên quan làm placeholder.
- Khi chỉ có ID, dùng truy vấn xe chung có cache và cùng query key để các tham chiếu lặp lại dùng chung một lần tải; giữ nguyên ID cho request và thao tác nghiệp vụ.

## Loading và skeleton

- Dùng `Skeleton`, `SkeletonBlock`, `FormSkeleton` từ `src/components/ui/Skeleton.tsx`; primitive `Skeleton` chỉ trang trí (`aria-hidden`), nhóm độc lập dùng `SkeletonBlock` có nhãn tiếng Việt và thông báo `role="status"`.
- Bảng giữ header và bộ lọc, đặt `aria-busy` trong lúc tải và render `AdminTableSkeleton` từ `src/components/admin/AdminTableSkeleton.tsx` trong `tbody` với đúng số cột. Không hiển thị “Không có dữ liệu” trước khi request kết thúc. Skeleton thay các hàng trong lúc tải để tránh thao tác nhầm dữ liệu cũ.
- Form phải đợi dữ liệu tải xong bằng `FormSkeleton`; không cho nhập vào bản nháp mặc định rồi ghi đè khi request về. Lỗi mạng vẫn có thông báo và khả năng thử lại/thao tác sẵn có.
- Skeleton dùng màu token phẳng và pulse opacity nhẹ, không shimmer/gradient; tắt animation khi `prefers-reduced-motion: reduce`, hỗ trợ theme tối và forced-colors.
- Phạm vi đã có trước đợt chuẩn hóa: danh sách xe công khai, hóa đơn và gói thuê khách hàng dùng skeleton cục bộ. Admin nay dùng component chung cho danh sách, tải form phương tiện/hồ sơ và xác thực shell; các thao tác gửi/lưu/upload tiếp tục dùng nhãn tiến trình, vì cần giữ nội dung người dùng đã nhập.

## Kiểm tra trước khi hoàn tất

- Chạy lint các file sửa, TypeScript và `node scripts/check-design-rules.mjs`.
- Kiểm tra ở desktop và mobile: nhãn, chiều cao control, xuống hàng, focus và lỗi inline. Khi thay hành vi lọc, kiểm tra điều kiện gửi API, đặt lại và phân trang bằng API giả lập.
- Tôn trọng reduced motion; tên và trạng thái không được truyền đạt chỉ bằng màu.
