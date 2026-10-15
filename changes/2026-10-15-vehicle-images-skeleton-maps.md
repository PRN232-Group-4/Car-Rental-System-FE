# Popup, ảnh xe, Skeleton và Google Maps

## Kết quả

- Quy chuẩn popup tại AGENTS.md, DESIGN.md và docs/admin-ui.md: FormDialog, footer sticky trong ValidatedForm, token chung, khóa đóng/gửi khi busy, giữ lỗi inline. Design lint kiểm tra cấu trúc bằng TypeScript AST, có test hồi quy.
- Ảnh thật của xe hiển thị trong bảng xe, bảo trì, điều phối, chi tiết đơn/phân công, khu tài xế, danh sách công khai, đặt xe và hợp đồng. VehicleImage xử lý thiếu/hỏng ảnh; VehicleName dùng chung cache, gộp request theo xe. Cập nhật xe làm mới cache.
- Trước đây FE có skeleton cục bộ ở danh sách xe công khai, hóa đơn, gói thuê. Bổ sung Skeleton/FormSkeleton/AdminTableSkeleton cho Admin, form, hồ sơ, xác thực shell, tra cứu và các panel Maps. Có nhãn truy cập và reduced motion; không cho sửa bản nháp rỗng khi còn tải dữ liệu.
- Maps Embed và liên kết chỉ đường tại chi nhánh công khai, điểm nhận khi đặt xe, preview địa chỉ cơ sở Admin. Chuẩn hóa facilities mảng/phân trang và tra cứu ID qua danh sách theo API thực tế.
- Form sửa xe xem vị trí GPS gần nhất theo yêu cầu. Vận hành đơn xem điểm GPS cuối, thống kê và lịch sử có phân trang. Không tạo vị trí giả; xử lý không có dữ liệu, lỗi quyền/mạng và thử lại.

## Cấu hình và giới hạn

- Xem [hướng dẫn Maps FE](../docs/google-maps-frontend.md). Maps nhúng cần NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY ở môi trường build FE, key Maps Embed riêng có giới hạn website. Giữ riêng GoogleMaps__ApiKey của backend.
- Chưa cấu hình hoặc xác minh key/billing/provider Google thực tế, chưa deploy. Thiếu Embed key vẫn dùng liên kết chỉ đường.
- Bản đồ hành trình hiện hiển thị điểm cuối; bảng giữ điểm GPS thực tế, chưa vẽ polyline toàn hành trình. Các API tìm địa điểm, ETA/nearby, geofence và xác minh điểm trả xe chưa có giao diện trong đợt này.

## Kiểm chứng

- 98 unit tests đạt, gồm rule popup, URL Maps, facility normalization, cache/ảnh và tọa độ GPS.
- 57 browser tests đạt trên Chrome cài sẵn: 51 Admin/Maps/Skeleton/ảnh/validation và 6 đặt xe/hợp đồng. API giả lập hoàn toàn, không tạo dữ liệu thật.
- TypeScript, design lint, ESLint file sửa và production build/static export đạt (240 trang).
