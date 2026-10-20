# Google Maps trên giao diện Thong Dong

## Những nơi sử dụng

- Trang chủ, mục **Chi nhánh & điểm nhận xe**: chọn chi nhánh để xem địa chỉ, bản đồ và chỉ đường.
- Đặt xe: địa chỉ điểm nhận xe được lấy theo `facilityId` của phương tiện.
- Khu vận hành: các panel GPS dùng tọa độ từ API theo quyền tài khoản. Vị trí cuối cùng và chỉ đường do Google gợi ý không đồng nghĩa với hành trình xe đã thực sự đi.
- Admin → Chi nhánh → tạo/chỉnh sửa: xem trước địa chỉ bằng nút “Xem địa chỉ trên bản đồ”; chỉ cập nhật snapshot khi chủ động mở lại.
- Admin → sửa xe: “Xem vị trí xe” đọc GPS gần nhất. Admin → vận hành/kiểm tra đơn: “Xem hành trình” đọc điểm GPS, thống kê và lịch sử có phân trang. Dữ liệu GPS chỉ tải khi mở panel; không polling tự động.

Phạm vi hiện tại chưa vẽ polyline lịch sử toàn hành trình, chưa có giao diện tìm địa điểm bằng Places, ETA/xe gần đây, geofence hoặc xác minh vị trí trả xe. Các API backend tương ứng vẫn có sẵn cho đợt tích hợp tiếp theo.

Component dùng chung: `src/components/maps/GoogleMap.tsx`. Truyền `location` (địa chỉ hoặc tọa độ), hoặc `origin` và `destination` để xem đường đi. Tọa độ phải là số hữu hạn, vĩ độ trong `[-90, 90]`, kinh độ trong `[-180, 180]`. Không có dữ liệu thì hiển thị thông báo; không đặt ghim giả. Thiếu khóa thì vẫn có liên kết chỉ đường sang Google Maps.

## Cấu hình Google Cloud và FE

1. Dùng project Google Cloud đã thiết lập billing, bật **Maps Embed API** theo [hướng dẫn thiết lập của Google](https://developers.google.com/maps/documentation/embed/get-api-key).
2. Tạo khóa riêng cho trình duyệt. Trong **Application restrictions**, chọn **Websites** và thêm origin giao diện, ví dụ `https://your-frontend.example/*`; khi phát triển thêm `http://localhost:3000/*`. Trong **API restrictions**, chỉ cho phép **Maps Embed API**. Xem [bảo vệ khóa bằng website restrictions](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys).
3. Khai báo trên môi trường **build của FE**:

```env
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY=YOUR_BROWSER_EMBED_KEY
```

Local: đặt trong `.env.local` tại gốc FE, khởi động lại `next dev`. Khi deploy, đặt biến trong service dựng FE rồi build/deploy lại. Dự án hiện xuất bản tĩnh (`output: "export"`); `NEXT_PUBLIC_*` được đóng vào JavaScript khi build. Chỉ đổi biến lúc chạy hoặc trên service BE sẽ không cập nhật bản FE đã dựng. Xem [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser).

Nếu FE được build trên Railway: thêm biến trên **FE service → Variables** trước build; deploy lại service. Nếu Railway chỉ chạy BE còn FE ở Cloudflare, đặt biến ở cấu hình build Cloudflare của FE.

Khóa Embed xuất hiện trong iframe của trình duyệt theo thiết kế; giới hạn theo website/API là bắt buộc khi triển khai. Giữ riêng khóa server `GoogleMaps__ApiKey` của BE; không sao chép khóa server vào biến `NEXT_PUBLIC_*`. FE dùng Embed trực tiếp, không cần mở quyền server APIs cho khóa trình duyệt.

## Hiển thị và kiểm tra

- [Maps Embed](https://developers.google.com/maps/documentation/embed/embedding-map) dùng iframe lazy load, kích thước tối thiểu 200 × 200px, ngôn ngữ Việt và `referrerPolicy="strict-origin-when-cross-origin"` để gửi origin phù hợp website restrictions.
- [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) cho liên kết chỉ đường không cần API key. Khi không có điểm xuất phát, Google tự cho người dùng chọn điểm xuất phát.
- Nếu Google báo khóa/restriction/billing trong iframe: kiểm tra khóa build FE, API đã bật và đúng domain; rebuild sau khi đổi key. Do iframe khác origin, ứng dụng không đọc được trang lỗi bên trong Google. Sự kiện `load` không xác nhận khóa hợp lệ; liên kết mở Google Maps luôn sẵn có. `onError` xử lý lỗi tải mà trình duyệt phát hiện được.
- Kiểm tra thiếu key, có key hợp lệ, đổi chi nhánh, địa chỉ có dấu/ký tự `&`, xem mobile, mở chỉ đường và API không có tọa độ. Kiểm thử URL tự động dùng khóa giả, không gọi dịch vụ trả phí của Google.

Map giữ giao diện nguyên bản do Google cung cấp. Khung, trạng thái tải, nút và nội dung hỗ trợ dùng token màu giao diện sáng/tối; không đảo màu ảnh bản đồ.
