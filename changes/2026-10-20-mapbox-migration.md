# Thay Google Maps bằng Mapbox — 2026-10-20

Các bản đồ chi nhánh, điểm nhận xe, preview địa chỉ Admin và GPS xe/đơn thuê dùng `MapboxMap`. SDK import động gần viewport; hiển thị marker thật, skeleton, lỗi/thử lại, resize và cleanup/abort khi đổi vị trí hoặc đóng popup. Thiếu token hoặc địa chỉ thì báo trạng thái, không đặt ghim mặc định.

Chỉ đường dùng geolocation sau khi bấm nút, lấy tuyến GeoJSON từ Mapbox Directions và hiển thị mét/km, ETA. Không còn iframe/link Google Maps. Giữ snapshot địa chỉ trong popup, cách tải GPS theo nhu cầu và lịch sử GPS phân trang. Geocoding FE là temporary, không cache/lưu DB. Backend chuyển sang Mapbox với token riêng; tìm địa chỉ Việt Nam bằng Geocoding v6, không cam kết POI Search Box.

## Kiểm chứng

- Typecheck, ESLint các file sửa, design lint: đạt.
- 512 unit tests (67 files): đạt; 10 tests Mapbox chạy lại sau thay đổi thông báo lỗi đạt.
- Production static export webpack: đạt, 258 trang. Đã build thiếu token và build token giả phục vụ E2E (artifact local, không deploy).
- 6/6 E2E đạt trên server static riêng cổng3100 bằng Chrome cài sẵn, gồm map ready, đổi chi nhánh, geolocation giả, route/ETA và các panel Admin; mọi request provider/telemetry mock, không gọi dịch vụ trả phí. Cấu hình thử tạm trong node_modules/.cache không đưa vào source.
- Chưa có token Mapbox thật nên chưa xác nhận quyền token, domain restrictions, billing hoặc coverage thực tế.

Thêm `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk...` vào `.env.local` hoặc môi trường build frontend rồi restart/rebuild. [Hướng dẫn](../docs/mapbox-frontend.md). Backend đọc `Mapbox__Enabled`/`Mapbox__AccessToken`; cấu hình Google Maps cũ không còn dùng. Không thay Google OAuth.
