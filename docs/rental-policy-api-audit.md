# Kiểm tra API chính sách thuê xe — 15/10/2026

## Kết luận

Trang `/admin/policies` đã kết nối xem danh sách, tạo phiên bản và đặt trạng thái kích hoạt/tạm ngưng. Theo yêu cầu bổ sung ngày 15/10/2026, FR-011/ADR-006 cho phép PATCH riêng `isActive`; điều khoản vẫn không sửa/xóa để bảo toàn lịch sử thuê xe. Chưa thể coi API hoàn chỉnh theo toàn bộ quy chuẩn contract chung vì các điểm nêu dưới đây.

Kiểm tra bằng mã nguồn tại workspace, chưa gọi API triển khai hoặc thay đổi dữ liệu thật.

## Đối chiếu endpoint

| Endpoint | Quyền | Trạng thái |
| --- | --- | --- |
| `GET /api/rental-policies` | Admin, Manager | Có; phân trang items/page/pageSize/totalCount, mỗi policy có rentalCount. |
| `POST /api/rental-policies` | Admin, Manager | Có; frontend dùng `createRentalPolicy()`, tạo bản ghi mới. |
| `GET /api/rental-policies/{id}` | — | Không có route. |
| `PATCH /api/rental-policies/{id}/status` | Admin, Manager | Có; nhận `{ "isActive": true/false }`, trả policy cập nhật; giữ nguyên điều khoản/snapshot. |
| `PUT/PATCH/DELETE /api/rental-policies/{id}` sửa điều khoản/xóa | — | Không có; FR-011 quy định tạo phiên bản mới khi đổi điều khoản. |
| `GET /api/vehicle-types/{id}/active-policy` | Công khai | Có; lấy bản active mới nhất cho loại xe, nếu không có thì lấy bản active chung mới nhất. |

`PolicyRequest` hỗ trợ `vehicleTypeId: int?`, `name` bắt buộc, tỷ lệ 0–100 và `isActive` mặc định true. Loại xe phải còn tồn tại; theo xác nhận người dùng, không được tạo nếu cùng phạm vi có policy active, phải tạm ngưng bản cũ trước. PATCH kích hoạt bản inactive cũng kiểm tra active khác. Repository kiểm tra lại dưới khóa trong transaction. Không tự tắt dữ liệu trùng cũ; lookup cũ vẫn ưu tiên bản mới nhất. Scope null chỉ trùng scope null.

## Những điểm backend còn thiếu hoặc chưa nhất quán

- GET danh sách nay đã có pagination 1/20, tối đa100 và rentalCount; FE hỗ trợ array cũ trong thời gian rollout và hiển thị thiếu dữ liệu nếu backend cũ chưa có số đếm.
- POST trả `Created("api/rental-policies/{id}", ...)`, nhưng chưa có endpoint GET chi tiết tương ứng để theo `Location`.
- Khoảng trống kiểm tra tham chiếu đã được sửa ở Application và repository; required/range được kiểm tra cả HTTP/Application. Chặn trùng active và trả lỗi VehicleTypeId theo scope, không chặn chính sách loại xe riêng chỉ vì có policy chung.
- Tài liệu thay đổi `2026-10-02-manager-rental-policy-access.md` còn mô tả update/retire; dùng FR-011, quyết định immutable và controller hiện tại để xác định hành vi thực tế.

Đợt rà soát ban đầu chưa sửa backend; đợt bổ sung status đã thêm endpoint PATCH qua Application/Repository và cập nhật Swagger/contract tests. Cần triển khai backend cùng frontend; chưa thay dữ liệu production.

## Điều chỉnh frontend

- Thay thông báo “API chưa có cập nhật hoặc xóa” bằng giải thích chính sách được lưu theo phiên bản.
- Cột “Thao tác” hiển thị icon kích hoạt/tạm ngưng cùng tooltip, xác nhận, loading và lỗi chung; chỉ cập nhật badge khi API thành công. Số cột skeleton và trạng thái rỗng được đồng bộ.
- Cho chọn “Tất cả loại phương tiện”, gửi `vehicleTypeId: null` và hiển thị đúng nhãn cho policy chung. Trước đây form bắt buộc chọn loại xe mặc dù API cho phép null.
- Giới hạn ba tỷ lệ 0–100 theo API; hiển thị lỗi inline bằng cơ chế validation chung, giữ dữ liệu khi backend báo lỗi.
- Thêm kiểm thử trình duyệt `e2e/admin-rental-policies.spec.ts` cho desktop/mobile, số cột, lựa chọn phạm vi, request POST, giới hạn tỷ lệ và ánh xạ lỗi backend.

Kiểm chứng hiện tại: 9 test Playwright chính sách đạt (desktop/mobile, tạo, trùng active, field error, count0 và pagination, status giữ count), 122 unit FE, 147 test HTTP/backend liên quan đạt. Test SQL/snapshot/concurrency PostgreSQL đã bổ sung nhưng vẫn cần cấu hình test database hợp lệ. Cần triển khai backend/frontend kèm migration0019 để áp dụng trên môi trường thật.

## Nguồn đối chiếu

Các đường dẫn backend dưới đây tính từ thư mục dự án cha, frontend tính từ repository này:

- `../Car-Rental-System-BE/specs/FR-011-rental-policy.md`
- `../Car-Rental-System-BE/changes/2026-10-02-immutable-rental-policies.md`
- `../Car-Rental-System-BE/src/VehicleRental.WebApi/Controllers/OperationsController.cs`
- `../Car-Rental-System-BE/src/VehicleRental.WebApi/Controllers/VehicleSearchController.cs`
- `../Car-Rental-System-BE/src/VehicleRental.WebApi/Middlewares/Authentication/AuthorizationPolicies.cs`
- `../Car-Rental-System-BE/src/VehicleRental.Application/DTOs/Operations/OperationsRequestDtos.cs`
- `../Car-Rental-System-BE/src/VehicleRental.Application/Services/OperationsService.cs`
- `../Car-Rental-System-BE/src/VehicleRental.Infrastructure/Repositories/NpgsqlOperationsRepository.cs`
- `../Car-Rental-System-BE/src/VehicleRental.Infrastructure/Availability/NpgsqlVehicleSearchRepository.cs`
- `../Car-Rental-System-BE/tests/VehicleRental.Tests/UnitTests.cs`: kiểm tra không còn `EditPolicy`.
- `../Car-Rental-System-BE/tests/VehicleRental.Tests/AuthorizationTests.cs`: Manager được phép đọc policies, CustomerService không được phép.
- `src/features/admin/api.ts`, `src/features/admin/CatalogManager.tsx`
