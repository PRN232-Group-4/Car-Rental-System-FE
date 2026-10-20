# Mapbox trên giao diện Thong Dong

`src/components/maps/MapboxMap.tsx` dùng chung cho chi nhánh trên trang chủ, điểm nhận xe lúc đặt xe, xem trước địa chỉ trong Admin và panel GPS xe/đơn thuê. Mapbox GL JS được import động khi bản đồ đến gần viewport; có marker, zoom, attribution mặc định, loading/error/retry và xử lý resize trong popup. Map được hủy và request bị abort khi đổi chi nhánh/đóng panel.

## Cấu hình

Tạo public token `pk.` tại [Mapbox Access Tokens](https://account.mapbox.com/access-tokens/), giữ public scopes mặc định phục vụ maps (`styles:read`, `styles:tiles`, `fonts:read`) và giới hạn URL cho localhost/domain frontend. Không dùng token secret `sk.` hoặc token backend trong FE. Xem [token security](https://docs.mapbox.com/help/dive-deeper/how-to-use-mapbox-securely/).

Thêm vào `.env.local` ở gốc FE:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.YOUR_BROWSER_PUBLIC_TOKEN
```

Khởi động lại `next dev`. Khi deploy static export, đặt biến ở môi trường **build frontend**, sau đó build/deploy lại; đặt trên Railway backend hoặc Worker runtime không cập nhật bundle đã build. Token trình duyệt hiển thị trong request theo thiết kế, cần allowed URLs đúng domain. Không commit token.

## Hành vi

- Dùng tọa độ API nếu hợp lệ (kể cả 0), thứ tự Mapbox `[longitude, latitude]`. Nếu chỉ có địa chỉ, geocode qua Geocoding v6, ưu tiên tiếng Việt/Việt Nam. Không gửi Google Place ID sang Mapbox và không tự tạo tọa độ thay thế.
- Thiếu địa chỉ/tọa độ: thông báo trống. Thiếu token: thông báo bản đồ chưa khả dụng. Lỗi API/SDK/WebGL có thông báo và nút thử lại.
- **Chỉ đường từ vị trí hiện tại** chỉ xin geolocation khi bấm nút, cần HTTPS/localhost và cho phép truy cập vị trí. Directions v5 trả route GeoJSON thật; hiển thị quãng đường và thời gian dự kiến. Từ chối quyền giữ bản đồ đích và báo lỗi, không tự chọn điểm xuất phát.
- Có thể truyền `origin` và `destination` để vẽ tuyến tự động. Không còn liên kết chỉ đường Google Maps.
- Tuyến gợi ý không phải lịch sử GPS xe đã đi. Panel hành trình vẫn hiển thị điểm GPS cuối cùng và bảng lịch sử có phân trang. Không polling tự động.
- Địa chỉ trong popup cơ sở giữ snapshot khi bấm “Xem địa chỉ trên bản đồ”; sửa input chỉ đổi preview sau khi đóng/mở lại như trước.
- Geocoding FE là temporary, không lưu DB/localStorage/cache. Backend dùng token riêng và permanent khi kết quả có thể lưu trong cảnh báo; xem [cấu hình backend](../../Car-Rental-System-BE/docs/mapbox-setup.md).
- Tìm POI tương đương Google Places tại Việt Nam chưa có: [Search Box](https://docs.mapbox.com/api/search/search-box/#language-and-geography-support) chỉ công bố hỗ trợ Mỹ, Canada và châu Âu. Backend `/api/map/places` dùng Geocoding v6 để tìm địa chỉ, trả pagination trên tối đa10 provider matches.

## Kiểm tra

Unit tests mock SDK/fetch, kiểm tra địa chỉ tiếng Việt, tọa độ, abort, lỗi/thử lại, thiếu token và route từ vị trí hiện tại. E2E `mapbox-public.spec.ts` và `maps-tracking.spec.ts` mock mọi request provider, gồm telemetry; dùng `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.e2e-test` khi khởi động dev server kiểm thử. Không gọi API trả phí.

Trước khi phát hành cần thử token thật trên domain được phép, WebGL/mobile, quyền định vị bị từ chối và address coverage tại Việt Nam. Các kiểm thử fixtures không xác nhận token hoặc billing thật.
