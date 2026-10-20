# Từ Điển Thuật Ngữ Giao Diện Thong Dong (VRS UI/UX Glossary)

> **Mục tiêu:** Thống nhất 100% thuật ngữ hiển thị trên giao diện người dùng (khu công khai khách hàng, cổng nhân viên, quản trị viên), loại bỏ hoàn toàn biệt ngữ kỹ thuật thô, từ ngữ AI sáo rỗng, đảm bảo tính chuyên nghiệp của hệ thống xe tự sở hữu.

---

## 1. Nguyên Tắc Ngôn Ngữ & Văn Phong

1. **Thương hiệu & Tên hệ thống:**
   - Khách hàng nhìn thấy: **Thong Dong** (viết cách, hoa hai chữ cái đầu).
   - Kỹ thuật / Tài liệu nội bộ: **VRS** (Vehicle Rental System).
2. **Không văn AI sáo rỗng:**
   - Tránh: *"Trải nghiệm tương lai đỉnh cao vô song"*, *"Công nghệ vượt bậc"*, *"Khám phá ngay hôm nay!"*.
   - Thay bằng: Ngôn ngữ cơ khí, chuẩn xác, định lượng: *"Đội xe sở hữu trực tiếp 100%"*, *"Kiểm định 12 hạng mục nghiêm ngặt"*, *"Hoàn cọc tức thì qua cổng PayOS"*.
3. **Không dấu chấm than thừa (`!`):** Chỉ dùng dấu chấm hoặc không dùng dấu cuối câu với nhãn/nút.
4. **Không lộ mã lỗi kỹ thuật ra khách hàng:**
   - Tránh: `Error 500: Internal Server Error`, `Failed to fetch`.
   - Thay bằng: *"Không thể tải dữ liệu đội xe. Vui lòng kiểm tra kết nối mạng và thử lại."* kèm mã đối soát kỹ thuật `traceId` (nếu có).

---

## 2. Bảng Tra Cứu Thuật Ngữ Chuẩn

| Khái niệm tiếng Anh | Thuật ngữ chuẩn tiếng Việt | Cụm từ cấm / Tránh dùng | Ngữ cảnh sử dụng |
|---|---|---|---|
| **Rental / Booking / Trip** | **Chuyến đi** (khách hàng) / **Đơn thuê** (vận hành / admin) | "Cuộc book xe", "Kèo xe", "Giao dịch" | "Chuyến của tôi", "Chi tiết đơn thuê #TD-1024" |
| **Deposit / Security Deposit** | **Tiền cọc** / **Ký quỹ thế chấp** | "Tiền giữ chân", "Đặt cọc xe máy" | Khoản tiền tạm giữ bảo đảm khi nhận xe |
| **Deposit Refund** | **Hoàn cọc tự động** (qua PayOS) | "Trả lại cọc", "Giải ngân cọc" | Quá trình hoàn tiền về tài khoản ngân hàng sau khi trả xe |
| **Subscription Pass** | **Gói thuê bao** / **Thẻ thành viên số** | "Vé tháng", "Combo tiết kiệm" | Gói đi lại định kỳ (Standard, Unlimited Touring, Chauffeur) |
| **Inspection** | **Biên bản kiểm định** (12 hạng mục) | "Soi xe", "Check xe", "Khám xe" | Giao nhận xe, đối soát hình ảnh 6 góc và telemetry |
| **Facility / Hub** | **Chi nhánh** / **Trạm xe** | "Điểm đỗ", "Bãi xe", "Showroom" | Cơ sở tiếp nhận, giao nhận và sạc điện của Thong Dong |
| **Fleet / Vehicles** | **Đội xe** / **Danh mục phương tiện** | "Dàn xe", "Xe của đối tác" | Toàn bộ phương tiện do công ty sở hữu 100% |
| **Maintenance** | **Bảo dưỡng kỹ thuật** | "Sửa chữa vặt", "Đem đi gara" | Theo dõi chu kỳ Odometer, thay phụ tùng, kiểm tra pin EV |
| **Driver / Chauffeur** | **Tài xế chuyên nghiệp** / **Chuyên viên vận hành** | "Bác tài", "Tài xế công nghệ" | Nhân viên thuộc biên chế phục vụ gói có tài xế |
| **Customer Service** | **Chăm sóc khách hàng (CSKH)** | "Tổng đài viên", "Tư vấn viên" | Hỗ trợ giải quyết khiếu nại, sự cố dọc đường 24/7 |
| **Rental Policy** | **Chính sách thuê xe** | "Luật thuê xe", "Quy tắc cấm" | Điều khoản giờ nhận/trả, phụ phí quá giờ, giới hạn km |
| **Incident Report** | **Báo cáo sự cố** | "Tố cáo", "Vụ việc", "Phốt" | Sự cố va quẹt, hỏng hóc kỹ thuật trên đường |
| **Review Moderation** | **Kiểm duyệt đánh giá** | "Lọc bình luận", "Chặn review" | Kiểm duyệt tính xác thực và văn hóa đánh giá của khách |

---

## 3. Quy Chuẩn Định Dạng Số Liệu & Tiền Tệ

- **Tiền tệ VND:** Sử dụng `Intl.NumberFormat("vi-VN")` với hậu tố `đ` (ví dụ: `450.000đ/giờ`, `1.800.000đ/ngày`). Không viết `VND`, `VNĐ` trên nhãn ngắn.
- **Ngày & Giờ:** Theo múi giờ GMT+7 (Hà Nội, TP.HCM), định dạng `DD/MM/YYYY HH:mm` (ví dụ: `15/10/2026 14:30`). Tuyệt đối không để lộ múi giờ UTC (`Z`, `+00:00`) ra người dùng.
- **Biển số xe:** Viết hoa toàn bộ theo chuẩn đăng kiểm Việt Nam: `51K-999.88`, `29A-888.66`.
- **Số liệu kỹ thuật (Khu Admin - Density 7):** Dùng `font-mono` (`tabular-nums`) cho ID, số Odometer (`45.210 km`), dung lượng pin (`85%`), công suất (`443 HP`).

---

## 4. Từ Vựng Nội Bộ Transit Desk (chỉ dùng trong tài liệu/code Admin)

Không hiển thị các từ này cho khách hàng; đây là tên gọi thống nhất trong code, tài liệu và trao đổi nội bộ.

| Thuật ngữ | Nghĩa | Quy ước dùng |
|---|---|---|
| **Folio** | Khối tiêu đề đầu trang Admin: số chương + tag mono, kicker, tiêu đề, mô tả, số liệu/hành động bên phải | Component `TransitFolio` + `TransitFolioMetric` |
| **Sổ mở (Open ledger)** | Danh sách kiểu sổ: head mono chữ hoa, rule `td-ink`, hàng phân cách `td-rule`, không card | `AdminTable`, `DataTable` |
| **Chương (Chapter)** | Nhóm route trong masthead (Ca trực, Vận hành, Điều phối, Chăm sóc & Sự cố, Đội xe, Chính sách, Tổ chức, Cá nhân) | `ROUTE_CHAPTER_MAP`, `ADMIN_NAV_ITEMS` |
| **Dải route ngữ cảnh** | Thanh route con nằm dưới masthead, dính đỉnh cùng masthead | `.topBar` trong `TransitDeskShell` |
| **Hồ sơ định danh** | Cột trái 4/12 của trang chi tiết: avatar, tên, trạng thái, danh sách `dl` | `StaffProfileForm`, `users/detail`, `staffs/detail` |
| **Deck / Cockpit** | Bố cục 3 cột riêng của `/admin/rentals` (hàng đợi · hồ sơ · bảng lệnh) | `RentalWorkspaceV4` |
