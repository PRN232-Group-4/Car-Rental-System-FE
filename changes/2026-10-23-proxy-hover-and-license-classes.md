# Proxy startup, hover vận hành và GPLX theo xe

- Log proxy chỉ in một lần dù Next gọi rewrites cho routing và route types.
- Bỏ GSAP xoay stage theo chuột, sheen nền và hover bg/press scale ở workspace đơn thuê; vị trí nút đứng yên, giữ điều kiện disabled nghiệp vụ.
- Admin cấu hình allowedLicenseTypes trong danh sách/form xe; trống giữ tương thích xe cũ.
- Khách thêm nhiều GPLX, chọn bằng để sửa theo ID. Mỗi bằng có xét duyệt riêng; Admin chọn đúng bằng khi duyệt.
- Tự lái kiểm tra tất cả bằng với hạng xe và ngày kết thúc. Có bằng approved phù hợp đi tiếp; pending báo chờ; thiếu bằng phù hợp mới chuyển bổ sung GPLX, giữ lựa chọn đặt xe.
- Cần backend migration 0030_customer_licenses_and_vehicle_classes.sql trước khi dùng API mới.

Kiểm chứng: typecheck/design lint, kiểm thử form xe, GPLX, booking và workspace. Chrome hover regression 6/6 đạt (1600/1280/390px, light/dark). Toàn bộ FE unit 893/893 đạt; bổ sung regression giữ nút khi refetch nền.

Backend build 0 lỗi/0 cảnh báo; 133 ca GPLX/xe/booking/handover liên quan đạt trên PostgreSQL kiểm thử riêng. Một test cũ về quyền Manager upload staff-license kỳ vọng 403 nhưng API hiện cho phép 200, ngoài phạm vi thay đổi này.
