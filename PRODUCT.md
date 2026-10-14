# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Customer (khách thuê)** — thuê xe tự lái hoặc kèm tài xế, và/hoặc mua gói thuê bao. Vào bằng trình duyệt, thường bằng điện thoại, và thường đang ở ngoài đường, cần biết ngay còn xe nào, giá bao nhiêu, thủ tục gồm những gì.
- **Staff / CustomerService (điều phối, bán hàng)** — xác nhận đơn, gán xe và tài xế, giao nhận xe, thu tiền, xử lý sự cố. Làm việc trên màn hình rộng trong ca, cần mật độ thông tin cao và thao tác nhanh.
- **Driver (tài xế)** — xem ca làm, xe được phân công, doanh thu, hồ sơ. Dùng điện thoại.
- **Maintenance (kỹ thuật/bảo trì)** — kiểm định xe trước/sau thuê, ghi nhận hư hỏng, mở phiếu bảo trì.
- **Admin / Manager** — cấu hình chính sách giá, gói thuê bao, chi nhánh, phòng ban, nhân viên, vai trò.

## Product Purpose

Hệ thống thuê xe trọn vòng đời cho **một đơn vị tự sở hữu đội xe**: từ khách tìm xe, đặt xe, ký hợp đồng, kiểm định giao nhận, theo dõi hành trình, trả xe, quyết toán và hoàn cọc — cùng toàn bộ mặt vận hành phía sau (điều phối, bảo trì, doanh thu, phân quyền).

Thành công nghĩa là: khách đặt được xe trong vài phút mà không phải gọi điện; nhân viên xử lý một đơn mà không cần rời hệ thống; và tiền (cọc, hóa đơn, hoàn cọc, phụ phí quá giờ) luôn khớp giữa hợp đồng và sao kê.

## Positioning

Đây là **system**, không phải **platform**. Một đơn vị vận hành sở hữu toàn bộ đội xe — không có chủ xe/đối tác thứ ba, không có hoa hồng chia sẻ, không có marketplace hai phía. Cơ chế khác biệt nằm ở chỗ **kiểm định số hoá hai chiều gắn với hợp đồng**: mỗi lượt thuê đều có biên bản ảnh trước và sau, đối chiếu odometer/pin/hư hỏng, và chính biên bản đó là căn cứ tính phụ phí quá giờ và hoàn cọc — thay vì tin vào tranh luận sau chuyến đi.

## Operating Context

- Khách: trình duyệt, thường mobile; tra cứu theo **chi nhánh + khoảng thời gian + hình thức thuê (theo giờ / dài hạn / bằng gói)**.
- Vận hành: bảng quản trị dày thông tin trên desktop; tra cứu đơn bằng **mã đơn thuê**.
- Thanh toán và hoàn tiền qua **PayOS** (checkout link + webhook). Khách huỷ không có webhook nên FE phải hỏi lại trạng thái rồi mới đánh dấu `cancelled`.
- Thuê bằng gói: trừ giờ trong `customer_subscriptions`, **không** sinh hóa đơn thuê; hết giờ/hết hạn thì có phụ phí.
- Quá giờ trả xe: tính theo `overtime_fee_rate` của `rental_policies`, cấn trừ cọc trước, phần thiếu hụt mới thành hóa đơn bổ sung (hạn 72 giờ).
- Ảnh (avatar, ảnh xe, GPLX, biên bản kiểm định, ảnh sự cố) đi qua **Cloudinary**, upload phía server.
- Hợp đồng dài hạn: lưu **đường dẫn tài liệu + thời điểm ký**, không lưu file trong hệ thống.
- Đơn vị tiền VND; thời gian trao đổi UTC, hiển thị/nhập theo **GMT+7**.

## Capabilities and Constraints

Đã có: đăng ký/đăng nhập email + OTP, phiên cookie, quên mật khẩu qua OTP; RBAC nhiều vai trò trên một tài khoản; catalog xe theo loại/chi nhánh/trạng thái; đặt xe theo giờ và dài hạn; thuê bằng gói; hóa đơn và thanh toán/hoàn cọc PayOS; quản lý gói thuê bao; GPLX khách; điều phối & phân ca tài xế; kiểm định trước/sau thuê; bảo trì; báo cáo sự cố; doanh thu; đối soát và quyết toán.

Ràng buộc kỹ thuật: Next.js App Router + React 19 + TanStack Query + Tailwind v4; API gọi cùng origin qua proxy giữ cookie phiên; mọi màu/bo góc/đổ bóng đi qua token trong `src/app/globals.css`, không dùng giá trị thô; `scripts/check-design-rules.mjs` chặn build khi vi phạm; `npm run test:e2e:playwright` chạy 22 kịch bản trên Chromium.

Chưa quyết định: cổng thanh toán nào ngoài PayOS; chính sách sau 72 giờ không thanh toán hóa đơn quá giờ; phạm vi đa ngôn ngữ.

## Brand Commitments

- Tên hiển thị cho khách: **Thong Dong** (chuỗi hiển thị) và wordmark `ThongDong.`; tên kỹ thuật trong mã nguồn: **VRS**.
- Hệ thống thị giác đã cam kết và ghi tại `DESIGN.md` v3.1 — đây là nguồn xác thực duy nhất cho mọi quyết định thị giác; khi Phần A và Phần B mâu thuẫn, Phần A thắng.
- Điểm nhấn màu duy nhất: **Precision Amber `#B45309`** (tông vàng đồng kỹ thuật), diện tích điểm nhấn ≤ 10% mỗi màn hình.
- Không gradient, không emoji, không font Inter, không `#000000`.
- Giọng tiếng Việt, trực tiếp, nghiệp vụ; nhãn điều khiển gọi tên việc chúng làm.

## Evidence on Hand

- `/e2e` — 22 kịch bản Playwright: đăng nhập/đăng ký, đặt xe theo giờ và dài hạn, hợp đồng, kiểm định GPLX, smoke từng trang, kiểm chứng token thiết kế.
- `DESIGN.md` (v3.1) — hệ thống thị giác đầy đủ và đặc tả sản phẩm/UX.
- `docs/SRS_CarRental.md`, `docs/specs/FE-*.md` — yêu cầu chức năng và đặc tả bề mặt.
- `tests/TestSprite.pdf` — báo cáo kiểm thử tự động bên ngoài trên bản deploy (51 kịch bản), dùng làm danh sách lỗi đã biết.
- Ảnh xe: hiện là ảnh minh hoạ qua `picsum.photos` khi phát triển; **chưa có** ảnh đội xe thật, chưa có testimonial, chưa có số liệu khách hàng thật — không được bịa các nội dung này.
- `screenshots/` — ảnh chụp 375/768/1280/1920 làm mốc hồi quy thị giác.

## Product Principles

1. **Đọc được trước, đẹp sau.** Mọi chữ đạt WCAG AA trên vùng nền sáng nhất; trên khối tối dùng bậc chữ sáng của khối tối, không dùng bậc chữ của nền sáng.
2. **Một nguồn sự thật cho mỗi thứ.** Một token, một nhãn điều hướng, một hợp đồng API — chép lại thành bản thứ hai là lỗi.
3. **Tiền phải khớp và phải nhìn thấy được.** Hóa đơn, cọc, hoàn cọc và phụ phí luôn truy được về hợp đồng và biên bản kiểm định.
4. **Trạng thái là nội dung.** Tải, rỗng, lỗi, quá hạn, chờ duyệt đều được thiết kế, không để trắng màn hình.
5. **Chuyển động trả lời một câu hỏi.** "Cái gì vừa xuất hiện / thay đổi / có thể bấm?" — không có chuyển động nào để trang trí.

## Accessibility & Inclusion

- Chuẩn bắt buộc: **WCAG 2.1 AA** cho toàn bộ bề mặt khách và vận hành; tương phản chữ thân và placeholder ≥ 4.5:1, chữ lớn ≥ 3:1.
- Mọi trạng thái phải có nhãn chữ, không dùng màu làm tín hiệu duy nhất.
- Mọi chuyển động phải có bản `prefers-reduced-motion` hiển thị ngay, không để `transform` dở dang.
- Vùng chạm ≥ 44px trên mobile; lưới nhiều cột thu về một cột dưới 768px; không cuộn ngang.
- Focus ring không bao giờ bị gỡ mà không có thay thế.
