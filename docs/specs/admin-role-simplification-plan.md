# Kế hoạch tinh gọn cổng nội bộ và trách nhiệm vai trò

## Mục tiêu và nguyên tắc

Giảm việc Admin phải xử lý và giảm thao tác đi nhầm chức năng, không loại bỏ nghiệp vụ cần thiết của vòng đời thuê xe. `/admin` là cổng nội bộ dùng chung, không phải mọi nghiệp vụ ở đây đều thuộc vai trò Admin. Giữ một ứng dụng và module dùng chung; chưa đổi URL, thêm role, thêm dependency hay tách portal.

Phân biệt ba khái niệm: hiển thị menu, quyền thực hiện hành động, phạm vi dữ liệu. Backend phải quyết định quyền; menu không phải hàng rào bảo mật. Người dùng có thể kiêm nhiều role nhưng không tự duyệt yêu cầu của mình khi nghiệp vụ yêu cầu kiểm soát chéo.

## Hiện trạng đã kiểm chứng ở FE

- `src/features/auth/roles.ts`: bảy role; cổng nội bộ phục vụ Admin, Manager, Staff, CustomerService, Maintenance.
- `src/config/navigation.ts`: menu cho Staff thấy đơn thuê, Manager thấy người dùng, CustomerService thấy lịch tài xế.
- `src/features/auth/access.ts`: route tương ứng không cho ba role trên truy cập; không mở rộng route để khớp menu.
- `src/features/operations/AdminRentalsPage.tsx`: trang đơn thuê chỉ nhận Admin/Manager/CustomerService.
- `src/features/admin/transit-desk/TransitDeskShell.tsx`: tự lọc ADMIN_NAV_ITEMS, chưa tái sử dụng getNavigation; masthead và command palette lấy từ permittedItems.
- `docs/specs/FE-15-rental-inspection-readiness.md`: Admin/Manager được phân công kỹ thuật viên, có nguy cơ trở thành điểm nghẽn nếu mọi đơn đều cần quản lý phân người.
- Hai mục điều hướng có nghĩa duyệt GPLX; chưa kết luận trùng hoàn toàn chức năng hoặc hợp đồng API.

Các ghi nhận là bằng chứng FE/tài liệu, không phải kết luận quyền thực tế trên backend. Đối chiếu lại khi triển khai mỗi giai đoạn.

## Trạng thái thực thi và nghiệm thu toàn diện

- **Phân quyền vai trò đầy đủ (Full Role Matrix) đã hoàn tất 100%:**
  1. `Admin`: Tinh gọn tuyệt đối, chỉ thấy 8 mục cốt lõi thuộc Quản trị hệ thống & Tổ chức (`/admin`, `/admin/users`, `/admin/roles`, `/admin/departments`, `/admin/facilities`, `/admin/staffs`, `/admin/audit-logs`, `/admin/profile`). Hoàn toàn không bị ôm đồm các module Vận hành đơn, Bàn giao xe, Kiểm tra xe, Bảo trì, Chăm sóc & Sự cố (Duyệt GPLX, Báo cáo sự cố), hay Chính sách giá. Đã bổ sung cơ chế cấm tự cấp quyền cho chính mình (chặn 409 Conflict + khóa submit).
  2. `Staff`: Chuyên trách Vận hành & Sự cố chi nhánh (`/admin`, `/admin/rentals`, `/admin/handovers`, `/admin/inspections`, `/admin/dispatch`, `/admin/drivers/schedule`, `/admin/tracking`, `/admin/reports`, `/admin/customers`, `/admin/vehicles`, `/admin/profile`). Chủ trì phân công KTV tại trạm (FE-15), bàn giao xe và xử lý hiện trường.
  3. `CustomerService`: Chuyên trách Chăm sóc Khách hàng & Hỗ trợ Đơn thuê (`/admin`, `/admin/customers` - chủ trì thẩm định & duyệt GPLX, `/admin/reports` - tiếp nhận khiếu nại, `/admin/rentals` - hỗ trợ đơn từ xa, `/admin/profile`). Đã rút hoàn toàn khỏi các khâu vật lý tại garage (`handovers` bàn giao xe và `dispatch` điều phối đội xe).
  4. `Maintenance`: Chuyên trách Kỹ thuật & Bảo dưỡng Đội xe (`/admin`, `/admin/inspections`, `/admin/maintenance`, `/admin/vehicles`, `/admin/reports` - xem báo cáo sự cố hỏng hóc kỹ thuật xe, `/admin/profile`).
  5. `Manager`: Điều hành, Giám sát Đội xe, Chính sách & Đánh giá (`/admin`, `/admin/dashboard`, `/admin/vehicles`, `/admin/vehicle-types`, `/admin/rentals`, `/admin/maintenance`, `/admin/dispatch`, `/admin/drivers/schedule`, `/admin/tracking`, `/admin/reports`, `/admin/reviews`, `/admin/policies`, `/admin/subscription-plans`, `/admin/staffs`, `/admin/customers`, `/admin/handovers`, `/admin/inspections`, `/admin/audit-logs`, `/admin/profile`). Sở hữu quyền xem giám sát (`View`) ở các khâu then chốt và duyệt ngoại lệ tài chính/chính sách.
  6. `Driver`: Cổng tài xế riêng tại `/staff`.
- **Gộp điểm vào duyệt GPLX:** Rút gọn về 1 điểm vào duy nhất trên thanh điều hướng tại `/admin/customers` với tên gọi `"Khách hàng & GPLX"` kèm bộ đếm hồ sơ chờ duyệt `?licenseStatus=pending`. CS là chủ trì duyệt, Staff và Manager xem tra cứu.
- **Bổ sung Nhật ký kiểm toán:** Tạo mới trang `/admin/audit-logs` phục vụ Admin và Manager truy vết bất biến các can thiệp tài khoản, thay đổi quyền, khóa tài khoản và thu hồi phiên.
- **Đã kiểm chứng kiểm thử toàn diện:**
  - 197 unit tests (`auth`, `admin/users`, `transit-desk`, `navigation-counts`, `operations`) đều đạt 100%.
  - `npm run typecheck`: 0 lỗi TypeScript (`tsc --noEmit` exit 0).
  - `npm run lint:design`: Đạt 100% quy tắc DESIGN.md v3.0 Phần A.
  - `npx eslint`: 0 lỗi, 0 cảnh báo.
  - `git diff --check`: Sạch sẽ.

## Xử lý lỗi: "An employee profile is required for this role" khi gán vai trò

- **Bản chất nghiệp vụ:** Trong kiến trúc hệ thống, `users` là tài khoản định danh gốc, còn `staffs` là hồ sơ mở rộng của nhân sự nội bộ (gắn với `department_id`, `facility_id`, ngày vào làm, GPLX nếu là tài xế). Backend ASP.NET Core kiểm tra nghiêm ngặt: không thể cấp các vai trò nhân sự (`Staff`, `Manager`, `CustomerService`, `Maintenance`, `Driver`) cho một tài khoản nếu người đó chưa được khởi tạo hồ sơ nhân viên trong bảng `staffs`.
- **Giải pháp toàn diện đã triển khai:**
  1. `src/features/admin/users/components/UserRoleDialog.tsx`: Nhận `hasStaffProfile`. Khi tài khoản chưa có hồ sơ nhân viên, các vai trò nhân sự trong dropdown được đánh dấu `(Yêu cầu hồ sơ nhân viên)`, form hiển thị hộp cảnh báo giải thích rõ lý do, nút submit chuyển thành `"Cần tạo hồ sơ nhân viên trước"` (disabled), đồng thời cung cấp nút chuyển hướng trực tiếp tới `/admin/staffs/new?userId={userId}`.
  2. `src/features/admin/users/api.ts`: Bắt lỗi từ backend nếu có chứa `"employee profile is required"` và dịch sang thông điệp tiếng Việt thân thiện, rõ ràng, hướng dẫn tạo hồ sơ.
  3. `src/app/admin/staffs/new/page.tsx`: Hỗ trợ đọc `searchParams.get("userId")` để tự động chọn đúng tài khoản khi chuyển từ trang chi tiết người dùng sang.
  4. `src/app/admin/users/detail/page.tsx`: Tab *Hồ sơ tích hợp* bổ sung nút hành động `"+ Tạo hồ sơ nhân viên cho người dùng này"` dẫn sang `/admin/staffs/new?userId={id}` thay vì hiển thị ngõ cụt.
  5. `src/__tests__/features/admin/users/UserDialogs.test.tsx`: Bổ sung 3 test hồi quy kiểm chứng: chặn submit khi thiếu hồ sơ, cho phép khi đã có hồ sơ, và xử lý thông điệp lỗi kèm liên kết tạo hồ sơ (8/8 test đạt).

## Mô hình trách nhiệm mục tiêu (đề xuất, chưa phải quyền được triển khai)

| Vai trò | Công việc chính | Giới hạn cần chốt |
| --- | --- | --- |
| Admin | Tài khoản, cấp/thu hồi quyền, cấu hình hệ thống, cơ cấu tổ chức, truy vết quản trị | Không mặc nhiên làm vận hành hoặc duyệt tài chính |
| Manager | Hiệu quả vận hành, năng lực đội xe, chính sách kinh doanh trong thẩm quyền, ngoại lệ | Không mặc nhiên cấp quyền Admin; không bỏ qua điều kiện an toàn |
| Staff | Xử lý đơn, phân công xe/nhân sự, tổ chức giao nhận, theo dõi tiến độ | Giới hạn chi nhánh/phạm vi; không tự duyệt ngoại lệ tài chính |
| CustomerService | Hồ sơ khách/GPLX, hỗ trợ thuê, tiếp nhận khiếu nại, trao đổi khách | Không kết luận an toàn kỹ thuật hoặc tự quyết mọi khoản hoàn |
| Maintenance | Kiểm tra trước/sau thuê, bằng chứng hư hỏng, sửa chữa, kết luận kỹ thuật | Không quyết định trách nhiệm bồi thường hoặc giá bán |
| Driver | Nhiệm vụ được giao, tiến độ chuyến, sự cố | Không tự phân chuyến hoặc xem dữ liệu ngoài nhiệm vụ |
| Customer | Đặt thuê, hồ sơ và giao dịch của mình | Không có quyền cổng nội bộ |

Phải phân biệt hồ sơ nhân viên với role Staff. Chốt người chịu trách nhiệm đối soát và người duyệt ngoại lệ tài chính; chưa tự thêm Accountant. Chưa quy định ngưỡng tiền nếu chưa có chính sách được xác nhận.

## Giai đoạn 1 — Đồng bộ điều hướng với quyền FE hiện hành (thực thi ngay)

Một seam duy nhất: lựa chọn mục điều hướng nội bộ. Một writer DeepSeek, parent lập kế hoạch và duyệt sau khi writer hoàn thành.

### Thay đổi

1. Sửa ba danh sách role của menu đã lệch: đơn thuê bỏ Staff; người dùng bỏ Manager; lịch tài xế bỏ CustomerService, theo route hiện hành.
2. Tái sử dụng canAccessRoute trong getNavigation cho vùng admin: một mục chỉ hiện khi đồng thời đạt role hiển thị và quyền route. Không dùng quyền route để tự mở rộng tập role hiển thị vốn hẹp hơn. Giữ nguyên public/customer/driver trong đợt này.
3. TransitDeskShell dùng getNavigation(userRoles, "admin") thay vì tự lọc. Giữ masthead, command palette, defaultQuery, badge, thứ tự và nhóm menu hoạt động như hiện tại.
4. Thêm/cập nhật kiểm thử hồi quy cho ba trường hợp bị chặn, trường hợp được phép, nhiều role và invariant mọi mục admin được trả về đều qua canAccessRoute. Kiểm tra role hiển thị hẹp hơn route không bị nới (ví dụ customers/reports).
5. Kiểm thử shell chứng minh các link/command palette không lọt mục bị chặn; ưu tiên test hành vi theo pattern có sẵn, không test snapshot source mong manh.

### Không làm trong giai đoạn 1

Không đổi ROUTE_ACCESS_RULES, quyền mutation, kiểm tra profile/department, API, DB, quy trình thu/hoàn tiền; không đổi tên hàng loạt, style, forms, dashboard; không xóa/gộp GPLX; không ẩn tính năng kỹ thuật chỉ dựa trên phỏng đoán. Đợt này loại bỏ lối vào bị chặn, chưa hiện thực toàn bộ mô hình trách nhiệm mục tiêu.

### Phạm vi file dự kiến

- `src/config/navigation.ts`
- `src/features/admin/transit-desk/TransitDeskShell.tsx`
- `src/__tests__/features/auth/navigation.test.ts` và test liên quan trực tiếp
- Test shell hiện có hoặc một test shell nhỏ nếu chưa có coverage phù hợp

Nếu cần sửa ngoài seam này hoặc phát hiện mâu thuẫn quyền trang/API, báo parent trước; không tự giải quyết bằng cấp thêm quyền.

### Tiêu chí duyệt

- Staff không được menu dẫn tới rentals, Manager không được menu dẫn tới users, CustomerService không được menu dẫn tới drivers/schedule khi chỉ có role đó.
- Admin và các tổ hợp nhiều role vẫn truy cập đúng phần hợp lệ; không loại role theo kiểu ưu tiên role đầu tiên.
- Không thay đổi quyền truy cập thực tế; không có menu bị hiện lại qua command palette.
- Giữ metadata điều hướng và badge/defaultQuery.
- Chạy focused Vitest cho auth/navigation và shell/navigation-counts, typecheck, lint:design, ESLint file thay đổi; báo lệnh và kết quả thật. Không sửa lỗi có sẵn ngoài scope.
- Parent đọc diff và kiểm tra độc lập trước khi duyệt; không commit/push/deploy.

## Xác minh bổ sung cho giai đoạn 2–4 (đọc code, không sửa)

- Hai mục GPLX **không** phải trùng lặp component: `/admin/vehicle-license` render `CustomerLicenseManager`, còn `/admin/customers` render `CustomerDirectory` với `initialLicenseStatus`. Mục “Duyệt GPLX” mở `/admin/customers?licenseStatus=pending` là chủ đích của FE-26 (`docs/specs/FE-26-admin-navigation-work-counts.md:8`) và được E2E `e2e/admin-navigation-counts.spec.ts` khẳng định theo nhãn; đổi nhãn/bỏ `defaultQuery` phải sửa spec và test cùng lúc. Đây là quyết định sản phẩm, không phải lỗi.
- `/admin` render `OperatingPulse` (tổng quan ca trực), `/admin/dashboard` render dashboard biểu đồ KPI/doanh thu. Hai nội dung khác nhau; gộp là thiết kế lại IA chứ không phải sửa nhãn.
- `src/features/admin/reviews` đã có UI và hooks, nhưng theo `docs/open-questions.md` bảng `staff_reviews`/BE-34 chưa tồn tại ở backend; menu “Đánh giá nhân sự” đang dựa trên hợp đồng đề xuất.
- Giai đoạn 2 cần backend: quyền theo chi nhánh, phân công, tự duyệt. Không thể hoàn tất chỉ bằng FE.

## Danh sách quyết định cần chủ sản phẩm duyệt

| Mã | Quyết định | Đề xuất mặc định | Ảnh hưởng nếu đổi |
| --- | --- | --- | --- |
| D1 | Staff có được xử lý đơn thuê (xem danh sách, phân công, bàn giao)? | Có, giới hạn theo chi nhánh; cần BE xác nhận | Nếu không: giữ hiện trạng, Staff chỉ làm kiểm tra/bảo trì |
| D2 | Ai được phân công kỹ thuật viên kiểm tra? | Staff điều phối thường nhật; Manager xử lý ngoại lệ | Cần sửa FE-15 và endpoint BE |
| D3 | Ai duyệt ngoại lệ tài chính (hoàn cọc, phụ phí, bồi thường)? | Manager theo ngưỡng do chính sách, có ghi vết; chưa tạo role Accountant | Cần chốt ngưỡng và API duyệt |
| D4 | Gộp hai điểm vào GPLX? | Giữ cả hai: “Duyệt GPLX” = hàng đợi chờ, “Duyệt giấy phép lái xe” = bàn duyệt đầy đủ; chỉnh mô tả cho khác nghĩa | Nếu gộp: sửa FE-26, E2E, badge đếm |
| D5 | Gộp `/admin` và `/admin/dashboard`? | Giữ hai trang; `/admin` theo vai trò, dashboard chỉ Admin/Manager | Nếu gộp: thiết kế lại IA và test |
| D6 | Giữ menu “Đánh giá nhân sự” khi BE-34 chưa có? | Giữ nhưng đánh dấu tính năng chờ backend | Nếu ẩn: bỏ mục menu + quyền, hoàn lại khi BE xong |

## Giai đoạn 2 — Chốt và thực thi ma trận quyền nghiệp vụ FE + BE

Điều kiện bắt đầu: thống nhất owner Staff/CS, phạm vi Manager, người đối soát và quyền duyệt tài chính; đối chiếu backend service/endpoint thực tế.

- Lập ma trận nghiệp vụ → người thực hiện → người duyệt nếu cần → phạm vi dữ liệu → điều kiện trạng thái.
- Xác minh Staff có nên nhận xử lý đơn, phân kỹ thuật viên/giao nhận; nếu chốt có thì sửa FE và BE đồng thời, không chỉ bật menu.
- Tách quyền xem/sửa/duyệt; kiểm soát branch/assignment/self và trạng thái. Luồng chuẩn không thêm cấp phê duyệt không cần thiết.
- Viết test API từ chối truy cập ngang chi nhánh, nhiệm vụ của người khác và tự duyệt ở nghiệp vụ có kiểm soát chéo.
- Tiêu chí: một ca thuê tiêu chuẩn chạy được bằng các role nghiệp vụ, không phải mượn tài khoản Admin.

## Giai đoạn 3 — Tinh gọn điểm vào và hàng đợi công việc

Điều kiện bắt đầu: ma trận giai đoạn 2 được duyệt và API hỗ trợ.

- Một điểm vào duyệt GPLX sau khi xác minh hai bề mặt hiện tại; giữ deep link/redirect và toàn bộ hành vi cần thiết.
- Một khu vực điều phối/lịch tài xế; tổng quan theo vai trò, không hai dashboard chồng ý nghĩa.
- Hồ sơ đơn thuê liên kết xác minh → điều phối → kiểm tra → giao xe → chuyến đi → nhận xe → quyết toán. Hàng đợi chuyên trách vẫn tồn tại, không ép mọi vai trò vào một màn hình khổng lồ.
- Mỗi hồ sơ nêu bước hiện tại, người chịu trách nhiệm tiếp, điều kiện thiếu, thời gian chờ; không bịa dữ liệu khi API chưa cung cấp.
- Tận dụng Transit Desk, đọc docs/admin-ui.md và DESIGN.md A9, giữ mobile/a11y và lỗi inline.
- Tiêu chí: test luồng theo vai trò, desktop/mobile, lỗi mạng và chuyển giao công việc; không mất chức năng khi gộp điểm vào.

## Giai đoạn 4 — Đo và thu hẹp phạm vi thứ yếu

Đo thời gian xử lý đơn, thời gian chờ giữa bộ phận, số lần cần Admin, thao tác giao/nhận và tính năng ít dùng. Xác nhận owner/tần suất/quyết định cần hỗ trợ trước khi ưu tiên đánh giá nhân sự, analytics nâng cao, geofence/cảnh báo. Không xóa vì chỉ muốn ít menu.

## Rủi ro và điểm cần quyết định

- Ẩn link bị chặn không sửa được khoảng trống nghiệp vụ Staff; phải giải quyết có chủ đích ở giai đoạn 2.
- RBAC FE không chứng minh an toàn backend; scope chi nhánh và quyền tài chính chưa được kiểm chứng trong đợt 1.
- Tài liệu cũ có thể lệch code/API: ghi rõ hiện trạng và mục tiêu, không coi đề xuất là tính năng đã hoàn thành.
- Không triển khai các giai đoạn 2–4 bằng suy đoán khi còn quyết định nghiệp vụ hoặc hợp đồng API chưa chốt.
