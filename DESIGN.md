# Design Specification — Hệ Thống Thuê Xe Thong Dong (Vehicle Rental System)

> A design and UX specification for Thong Dong — a **single-operator** vehicle rental business (ô tô, xe máy, ô tô điện, xe máy điện) offering thuê theo giờ (tự lái / có tài xế), thuê dài hạn và gói thuê bao trả trước.
>
> **Nguồn xác thực:** `docs/SRS_CarRental.md` (SRS v2.0), `Car-Rental-System-BE/specs` (FR/NFR), `Car-Rental-System-BE/docs/db/Init.sql` (DDL v2 — 26 bảng).
>
> Quyết định kiến trúc: đây là **system**, không phải **platform**. Một đơn vị vận hành sở hữu và quản lý toàn bộ đội xe — không có vai trò "chủ xe/đối tác", không chia hoa hồng, không có bước chủ xe duyệt đơn.

---

## 1. Product Overview

The system serves:

* **Customers** — thuê xe (tự lái hoặc có tài xế) và/hoặc mua gói thuê bao
* **Staff** của đơn vị vận hành — điều phối/bán hàng, tài xế (`staffs.is_driver = true`) và nhân viên bảo dưỡng
* **Admin** — tài khoản Staff có role `Admin`, cấu hình policy/plan/RBAC

RBAC roles: `Customer`, `Staff`, `Admin`, `Driver`, `Maintenance` (`roles` + `user_roles`; một user có thể có nhiều role).

The primary customer journey is:

```text
Landing Page
    ↓
Select facility + rental time + hình thức
    ↓
Search available vehicles
    ↓
Filter / sort
    ↓
View vehicle
    ↓
Send rental request
    ↓
Staff xác nhận & gán xe/tài xế
    ↓
Pre-rental inspection + pay deposit
    ↓
Receive vehicle / start trip
    ↓
Return vehicle + post-rental inspection
    ↓
Quyết toán / hoàn cọc
```

Ngoài phạm vi v2.0: thuê xe tải chuyên dụng, tích hợp bảo hiểm tự động, ứng dụng đa ngôn ngữ, chia sẻ xe ngang hàng (peer-to-peer).

The system should feel:

* Modern
* Trustworthy
* Mobile-first
* Simple
* Automotive
* Travel-oriented
* Friendly rather than corporate
* Focused on getting the user from "I need a car" → "I found a car"

---

# 2. Design Principles

## 2.1 Search-first

The most important action is finding a vehicle.

The homepage should immediately answer:

> Where do you want the car, and when do you need it?

Do not overload the hero section with unnecessary information.

---

## 2.2 Trust before conversion

Users are renting relatively expensive physical assets.

Important trust signals:

* Vehicle photos (`vehicle_imgs`, `vehicles.main_img_url`)
* Vehicle type và thông số thật (`car_detail`, `motorbike_detail`, `electric_car_detail`, `electric_motorbike_detail`)
* Chi nhánh sở hữu xe và trạng thái xe (`available` / `renting` / `maintenance`)
* Kết quả kiểm định trước/sau thuê (`inspections`)
* Giá và chính sách thuê đang áp dụng (VAT, % cọc, phí trễ)
* Điều kiện thuê, chính sách huỷ và hoàn cọc
* Trạng thái duyệt GPLX của khách (`pending` / `approved` / `rejected`)

---

## 2.3 Visual vehicle discovery

Cars are visual products.

Vehicle cards should prioritize:

```text
Image
↓
Brand + model
↓
Vehicle type + year / transmission / seats
↓
Status & facility
↓
Price
↓
Nhận xe tại chi nhánh / giao xe tận nơi
```

The vehicle image should occupy the majority of the card.

---

## 2.4 Progressive disclosure

Do not show every vehicle attribute immediately.

Initial card:

```text
Vehicle image
Vehicle name (brand + model)
Vehicle type
Basic specifications
Price (theo giờ / theo tháng)
Facility
```

Detailed page:

```text
Gallery
Description
Specifications (theo loại xe)
Rental policy (VAT, cọc, phí trễ)
Tình trạng / kiểm định gần nhất
Facility & nhận xe
Availability
Booking (trực tiếp hoặc dùng gói)
```

---

# 3. Brand Direction

## 3.1 Brand personality

The interface should communicate:

* Freedom
* Travel
* Reliability
* Convenience
* Community
* Modern technology

Avoid an overly luxury-oriented visual language.

The product should feel accessible to ordinary users renting cars for:

* Travel
* Family trips
* Business
* Weekend trips
* Moving
* Events
* Daily transportation

---

# 4. Color System

Use a modern eco-friendly emerald green primary brand color.

### Primary

```text
Primary:        #059669
Primary Hover:  #047857
Primary Light:  #ECFDF5
```

### Neutral

```text
Text Primary:   #222222
Text Secondary: #666666
Text Muted:     #999999

Background:     #FFFFFF
Surface:        #F8F8F8
Border:         #E5E5E5
```

### Semantic

```text
Success: #16A34A
Warning: #F59E0B
Error:   #DC2626
Info:    #2563EB
```

The primary color should be used primarily for:

* Primary CTA
* Active states
* Selected filters
* Important prices
* Links
* Booking actions

Do not make the entire interface green.

---

# 5. Typography

Use a modern sans-serif font.

Preferred:

```text
Inter
```

Fallback:

```text
system-ui
-apple-system
BlinkMacSystemFont
"Segoe UI"
sans-serif
```

### Scale

```text
Display:   40–48px
H1:        32–40px
H2:        26–32px
H3:        20–24px
Body:      14–16px
Small:     12–14px
Caption:   11–12px
```

Use:

* 700–800 weight for headings
* 500–600 for important labels
* 400 for normal text

---

# 6. Layout

Desktop max width:

```text
1200–1280px
```

Horizontal page padding:

```text
Desktop: 24–40px
Tablet:  20–24px
Mobile:  16px
```

General spacing scale:

```text
4
8
12
16
24
32
48
64
80
```

Use large vertical spacing between major homepage sections.

---

# 7. Navigation

## Desktop Header

Structure:

```text
┌────────────────────────────────────────────────────────────┐
│ VRS     Thuê xe   Gói thuê bao   Hướng dẫn   Cổng nhân viên │
│                                         Đăng nhập  Đăng ký  │
└────────────────────────────────────────────────────────────┘
```

Header requirements:

* White background
* Sticky on scroll
* Logo on left
* Main navigation center/left
* User actions right
* Subtle bottom border or shadow

Primary navigation:

```text
Thuê xe
Gói thuê bao
Hướng dẫn
Cổng nhân viên (Staff/Admin)
```

Account:

```text
Đăng nhập
Đăng ký
```

"Cổng nhân viên" chỉ hiển thị với user có role `Staff`, `Admin` hoặc `Maintenance` (RBAC).

---

# 8. Homepage

## 8.1 Hero

The hero is the most important section.

Suggested structure:

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Thuê xe cho mọi hành trình             │
│                                                     │
│     Tự do khám phá. Chủ động từng chuyến đi.        │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Địa điểm                                      │   │
│ │ TP. Hồ Chí Minh                               │   │
│ ├──────────────────────┬────────────────────────┤   │
│ │ Nhận xe              │ Trả xe                 │   │
│ │ Date / Time           │ Date / Time            │   │
│ ├──────────────────────┴────────────────────────┤   │
│ │                 TÌM XE                         │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Hero background should use a high-quality vehicle/travel image.

Do not let the background overpower the search interface.

---

# 9. Search Widget

The search component is the core interaction.

## Fields

### Chi nhánh nhận xe

```text
Chi nhánh nhận xe
Chi nhánh Quận 1, TP. Hồ Chí Minh
```

Allow:

* Chi nhánh (`facilities`) trong danh mục
* Giao xe tận nơi (`pick_up_method`, `pickup_location`)
* Sân bay / địa chỉ cụ thể nếu chi nhánh hỗ trợ

---

### Start date/time

```text
Nhận xe
02/10/2026
09:00
```

---

### End date/time

```text
Trả xe
04/10/2026
18:00
```

---

### Search CTA

```text
Tìm xe
```

Primary button.

---

# 10. Rental Modes

The product supports several orthogonal choices:

```text
Tự lái             (hour_rental_detail.has_driver = false)
Có tài xế          (hour_rental_detail.has_driver = true)
Theo giờ           (rentals.rental_type = 'hourly')
Dài hạn            (rentals.rental_type = 'longterm', không kèm tài xế)
Trả trực tiếp      (is_subscription = false → có Invoice)
Dùng gói thuê bao  (is_subscription = true → trừ remaining_hours)
```

Use tabs:

```text
┌──────────────┬─────────────────┐
│ 🚗 Tự lái    │ 👨‍✈️ Có tài xế   │
└──────────────┴─────────────────┘
```

Changing mode should change the search form. `Dài hạn` không có lựa chọn tài xế (bảng `longterm_rental_contract` không có cột driver).

---

# 11. Homepage Sections

Recommended order:

```text
Hero / Search
        ↓
Chi nhánh (facilities)
        ↓
Xe được yêu thích
        ↓
Loại phương tiện (4 loại)
        ↓
Vì sao chọn hệ thống
        ↓
How it works
        ↓
Gói thuê bao
        ↓
Mobile application (Flutter)
        ↓
Footer
```

---

# 12. Chi nhánh (Facilities)

Display the branches (`facilities`) customers can pick up from.

Example:

```text
Chi nhánh Quận 1
Chi nhánh Tân Bình
Chi nhánh Sân bay Tân Sơn Nhất
Chi nhánh Hà Nội
```

Card:

```text
┌─────────────────────┐
│                     │
│    Branch Image     │
│                     │
│ Chi nhánh Quận 1    │
│ 12 xe available     │
└─────────────────────┘
```

Lưu ý: `vehicles.current_location` là văn bản (chi nhánh/địa chỉ), không phải toạ độ GPS.

---

# 13. Vehicle Discovery

## Section title

```text
Xe được yêu thích
```

Subtitle:

```text
Khám phá những lựa chọn phù hợp cho hành trình của bạn
```

Horizontal card carousel on desktop/mobile.

---

# 14. Vehicle Card

Primary component:

```text
┌────────────────────────────┐
│                            │
│        VEHICLE IMAGE       │
│                            │
├────────────────────────────┤
│ Toyota Corolla Cross       │
│ Ô tô · Đời 2024            │
│                            │
│ 🚗 5 chỗ  ·  ⚙ Tự động    │
│                            │
│ 90.000đ / giờ              │
│ 12.000.000đ / tháng        │
│ Chi nhánh Quận 1           │
└────────────────────────────┘
```

Optional badges:

```text
Có tài xế
Xe điện
Dùng được gói thuê bao
Sẵn sàng
```

The search/filter experience exposes filters such as vehicle type, facility, price, seats/transmission (ô tô), bike type (xe máy), battery/range (xe điện), production year, fuel type and hourly vs long-term.

---

# 15. Search Results Page

URL concept:

```text
/find
```

or:

```text
/find/filter
```

Layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Search summary                                          │
│ TP. Hồ Chí Minh · 02/10 → 04/10                         │
├───────────────────┬─────────────────────────────────────┤
│ FILTERS           │ RESULTS                             │
│                   │                                     │
│ Giá               │ 120 xe                             │
│ Hãng xe           │                                     │
│ Loại xe           │ [Card] [Card] [Card]               │
│ Số chỗ             │                                     │
│ Nhiên liệu        │ [Card] [Card] [Card]               │
│ Tính năng         │                                     │
│                   │                                     │
│                   │ Sort                                │
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

---

# 16. Search Filters

### Basic filters

```text
Mức giá (theo giờ / theo tháng)
Loại phương tiện  (Ô tô / Xe máy / Ô tô điện / Xe máy điện)
Hãng xe (brand)
Chi nhánh (facility)
Hình thức (Tự lái / Có tài xế)
Thời hạn (Theo giờ / Dài hạn)
```

### Vehicle

```text
Số chỗ (car_detail)
Truyền động (car_detail)
Loại xe máy (motorbike_detail)
Dung tích pin / quãng đường tối đa (electric_*_detail)
Năm sản xuất
Nhiên liệu (vehicle_types.fuel_type)
```

---

# 17. Search Result Sorting

Options:

```text
Đề xuất
Giá thấp → cao
Giá cao → thấp
Chi nhánh gần nhất
Mới nhất (năm sản xuất)
```

Keep sorting separate from filtering.

---

# 18. Vị trí xe (theo chi nhánh)

Không có bản đồ GPS thời gian thực: DDL v2 chỉ lưu `vehicles.current_location` dạng văn bản; bảng vị trí đã bị bỏ khỏi phạm vi v2.0.

Hiển thị thay thế:

```text
┌───────────────────────────────────────┐
│ Chi nhánh Quận 1                      │
│ 12 Trần Hưng Đạo, Quận 1, TP.HCM      │
│                                       │
│ Xe tại chi nhánh này: 8 available     │
└───────────────────────────────────────┘
```

Chi nhánh (facility) là đơn vị "vị trí" chính thức; khách chọn chi nhánh khi tìm xe và nhận xe tại đó hoặc yêu cầu giao xe tận nơi (`pick_up_method`, `pickup_location`).

---

# 19. Vehicle Detail Page

The vehicle detail page should be conversion-focused.

## Header

```text
← Quay lại

Toyota Corolla Cross
Ô tô điện · 2024 · Chi nhánh Quận 1
```

---

## Image Gallery

Large primary image:

```text
┌──────────────────────────────────────┐
│                                      │
│             MAIN IMAGE               │
│                                      │
└──────────────────────────────────────┘

[img] [img] [img] [img] [Xem tất cả]
```

Use:

* 16:9 main image
* Rounded corners
* Thumbnail gallery
* Full-screen lightbox

---

# 20. Vehicle Information

```text
Toyota Corolla Cross 1.8V

Ô tô · Đời 2024
32 chuyến

📍 Chi nhánh Quận 1, TP. Hồ Chí Minh
```

Specifications:

```text
Số chỗ       5
Truyền động  Tự động
Nhiên liệu   Xăng
Năm SX       2024
```

---

# 21. Thuộc tính riêng theo loại phương tiện

Mỗi xe chỉ dùng đúng một bảng thuộc tính con tương ứng `vehicle_type_id`. Hiển thị dạng bảng, không đổ hết vào viewport đầu.

```text
Ô tô:          Số chỗ · Truyền động · Dung tích cốp
Xe máy:        Loại xe máy · Có cốp không
Ô tô điện:     Dung lượng pin · Kiểu sạc · Thời gian sạc · Quãng đường tối đa · Loại pin
Xe máy điện:   Dung lượng pin · Kiểu sạc · Thời gian sạc · Quãng đường tối đa · Loại pin
```

Use:

```text
Xem tất cả thông số
```

---

# 22. Chính sách thuê & đặt cọc

Thành phần tin cậy quan trọng — lấy từ `rental_policies` đang `is_active` của `vehicle_type_id`:

```text
┌─────────────────────────────────────┐
│ Chính sách thuê · Ô tô              │
│                                     │
│ VAT            10%                  │
│ Đặt cọc        10% tổng tiền thuê   │
│ Phí trả trễ    theo giờ             │
│                                     │
│ Áp dụng cho đơn này                 │
└─────────────────────────────────────┘
```

Chỉ một policy `is_active` được áp dụng mặc định; nếu có nhiều policy active, dùng policy mới nhất và nói rõ cho người dùng biết.

---

# 23. Pricing

Price must be highly visible.

```text
900.000đ / ngày
```

Booking summary:

```text
3 ngày
× 900.000đ
────────────────
Tiền thuê        2.700.000đ
VAT (10%)          270.000đ
Đặt cọc (10%)      297.000đ
Phí trả trễ        (nếu có)
────────────────
Tổng cộng        3.267.000đ
```

Do not hide mandatory fees until the final step.

---

# 24. Booking CTA

Desktop:

```text
┌───────────────────────────────┐
│ 900.000đ / ngày              │
│                               │
│       ĐẶT XE                  │
└───────────────────────────────┘
```

Use sticky booking card on desktop.

Mobile:

```text
┌─────────────────────────────────┐
│ 900.000đ/ngày   [ĐẶT XE]       │
└─────────────────────────────────┘
```

Sticky bottom CTA.

---

# 25. Booking Flow

Booking flow của hệ thống:

```text
1. Register / Login (hoặc đăng ký bằng OTP)
2. Search vehicle (loại xe, chi nhánh, khung giờ)
3. Apply filters
4. Select vehicle
5. Chọn hình thức: trả trực tiếp hoặc dùng gói thuê bao
6. Kiểm tra GPLX + chính sách/cọc
7. Tạo rental (status = pending)
```

Implement as:

```text
Search
  ↓
Vehicle
  ↓
Rental information (thời gian, tự lái / có tài xế, chi nhánh nhận xe)
  ↓
Customer information + GPLX
  ↓
Price confirmation (VAT, cọc, tổng tiền)
  ↓
Tạo rental (pending) + Invoice (nếu trả trực tiếp)
  ↓
Payment (PayOS)
  ↓
Staff xác nhận, phân xe/tài xế (vehicle_assignments)
  ↓
Pre-rental inspection + bàn giao xe
```

---

# 26. Booking Status

Dùng đúng `rentals.status` trong DDL:

```text
pending
    ↓
pre_inspection
    ↓
renting
    ↓
post_inspection
    ↓
completed
```

Trạng thái kết thúc khác:

```text
cancelled   (chỉ từ pending hoặc pre_inspection)
```

Trạng thái liên quan:

```text
inspections.inspection_type   pre_rental | post_rental
vehicles.status               available | renting | maintenance | inactive
vehicle_assignments.status    assigned → active → completed | replaced
vehicle_maintenance.status    scheduled → in_progress → completed → verified | cancelled
payment type='refund'         requested → paid | rejected
```

---

# 27. User Dashboard

Navigation:

```text
Tài khoản

├── Hồ sơ (users + customers, GPLX, avatar)
├── Chuyến của tôi (rentals)
├── Gói thuê bao (customer_subscriptions, remaining_hours)
├── Hoá đơn & thanh toán (invoices, payments, hoàn cọc)
├── Báo cáo sự cố (reports)
└── Cài đặt (mật khẩu, phiên đăng nhập)
```

---

# 28. My Trips

Cards:

```text
┌──────────────────────────────────┐
│ Toyota Corolla Cross             │
│                                  │
│ 02/10 → 04/10                    │
│ Chi nhánh Quận 1                 │
│                                  │
│ Trạng thái: Đang thuê            │
│                                  │
│ [Xem chi tiết]                   │
└──────────────────────────────────┘
```

Tabs (map theo `rentals.status`):

```text
Sắp tới            (pending, pre_inspection)
Đang diễn ra       (renting)
Đã hoàn thành      (post_inspection, completed)
Đã huỷ             (cancelled)
```

---

# 29. Gói thuê bao (Subscription)

Đây là luồng chuyển đổi thứ hai của hệ thống (khách trả trước số giờ thuê).

Headline:

```text
Mua gói thuê bao, thuê xe không cần trả từng lượt
```

Supporting message:

```text
Trả trước một lần, dùng dần theo số giờ — theo dõi remaining_hours trong ứng dụng.
```

CTA:

```text
Xem các gói
```

Plan card (từ `subscription_plans`):

```text
┌─────────────────────────────┐
│ Gói Tiết Kiệm               │
│ 20 giờ · 30 ngày            │
│                             │
│ 1.500.000đ                  │
│                             │
│ [Mua gói]                   │
└─────────────────────────────┘
```

Plan không active không được mua mới; plan đã có người dùng chỉ được ngừng kích hoạt (soft-delete), không xoá cứng.

---

# 30. Quy trình tạo xe & chính sách (Staff/Admin)

Khu vực nội bộ — không phải luồng của khách.

```text
Tạo loại phương tiện (vehicle_types)
        ↓
Tạo xe + thuộc tính riêng theo loại
        ↓
Upload hình ảnh (vehicle_imgs, Cloudinary)
        ↓
Gán chi nhánh (facility_id)
        ↓
Tạo/cập nhật rental_policy (VAT, cọc, phí trễ)
        ↓
Xe ở trạng thái available và xuất hiện trong tìm kiếm
```

---

# 31. How It Works

Four-step visual explanation:

```text
01
Đặt xe trên web/app

        ↓

02
Staff kiểm định & bàn giao xe

        ↓

03
Bắt đầu hành trình

        ↓

04
Trả xe, kiểm định sau thuê & quyết toán
```

Use large numbers and simple illustrations.

---

# 32. Trust / Benefits Section

Recommended cards:

```text
🛡 An toàn
Kiểm định xe trước và sau mỗi lượt thuê

✓ An tâm đặt xe
Chính sách huỷ và hoàn cọc rõ ràng

📄 Thủ tục đơn giản
CCCD + GPLX (staff duyệt)

💳 Thanh toán dễ dàng
PayOS / ATM / Visa / ví điện tử

🚚 Giao xe tận nơi
Nhận xe tại chi nhánh hoặc giao tận nơi

🚗 Đa dạng phương tiện
Ô tô / Xe máy / Ô tô điện / Xe máy điện

🔁 Gói thuê bao
Dùng dần theo giờ, không trả từng lượt
```

---

# 33. Kiểm định xe (Inspection)

Không có bảng review/rating trong DDL v2. Thành phần tin cậy tương ứng là phiếu kiểm định.

Phiếu kiểm định (staff nhập, có upload ảnh):

```text
Kiểm định TRƯỚC thuê        ✓ Đạt
Xe: Toyota Corolla Cross

Số km (odometer)     42.150 km
Nhiên liệu / pin     80%
Hư hỏng ghi nhận     Không

[ảnh] [ảnh] [ảnh]

Nhân viên: Nguyễn Văn B
02/10/2026 08:40
```

Prioritize:

* Loại kiểm định (pre_rental / post_rental)
* Kết quả `is_ok`
* Odometer / fuel-battery level
* Damage notes + ảnh
* Nhân viên kiểm tra + thời điểm

---

# 34. Thông báo & email

Hệ thống gửi qua Brevo (email) và FCM (push, mobile):

```text
OTP đăng ký / đặt lại mật khẩu
Xác nhận đặt xe và kết quả thanh toán
Hoá đơn và nhắc hạn thanh toán
Nhắc hết hạn gói thuê bao
Nhắc lịch bảo dưỡng
Nhắc kiểm định trước/sau thuê
```

Thông báo dùng cùng ngôn ngữ trạng thái với `rentals.status`; không dùng nhãn rời rạc gây lệch nghĩa.

---

# 35. Mobile Application

Hai ứng dụng Flutter (ngoài phạm vi Next.js web portal):

```text
Ứng dụng khách hàng        đặt xe, quản lý gói, hoá đơn, báo cáo sự cố
Ứng dụng nhân viên/tài xế  nhận vehicle_assignment, kiểm định, bàn giao xe
```

Layout:

```text
┌───────────────────┐
│                   │
│  App screenshot   │
│                   │
└───────────────────┘

Thuê xe dễ dàng
Mọi lúc, mọi nơi

[App Store]
[Google Play]
```

---

# 36. Footer

Footer should be information-dense.

```text
VRS — VEHICLE RENTAL SYSTEM

VỀ HỆ THỐNG
Giới thiệu
Chi nhánh
Liên hệ

THUÊ XE

Hướng dẫn chung
Hướng dẫn đặt xe
Hướng dẫn thanh toán
Hỏi & đáp

CHÍNH SÁCH

Chính sách thuê & đặt cọc
Chính sách huỷ và hoàn cọc
Bảo dưỡng & an toàn xe
Giải quyết khiếu nại

DỊCH VỤ

Thuê theo giờ
Thuê dài hạn
Gói thuê bao
Thuê xe có tài xế

HỖ TRỢ

1900 xxxx
7AM – 10PM

support@vrs.vn
```

---

# 37. Component Library

Build reusable components instead of page-specific markup.

```text
components/
├── Navbar
├── Footer
├── SearchBox
├── FacilityPicker
├── DateTimePicker
├── RentalModeTabs        (tự lái / có tài xế, theo giờ / dài hạn)
├── VehicleCard
├── VehicleGallery
├── VehicleSpecs          (render theo vehicle_type)
├── RentalPolicyPanel
├── SubscriptionCard
├── SubscriptionUsage     (remaining_hours)
├── PriceBreakdown        (thuê + VAT + cọc + phí trễ)
├── BookingCard
├── InvoiceCard
├── PaymentStatus
├── InspectionChecklist   (pre/post rental, upload ảnh)
├── ReportForm
├── FilterSidebar
├── SortDropdown
├── StatusBadge           (rentals/vehicles/assignments/maintenance)
├── BenefitCard
├── StepCard
├── DataTable             (khu vực Staff/Admin)
├── Modal
├── Drawer
├── Toast
├── Badge
├── Button
└── Input
```

---

# 38. Component States

Every interactive component should support:

```text
default
hover
active
focus
disabled
loading
error
success
```

Example:

```text
Button
├── primary
├── secondary
├── outline
├── ghost
└── danger
```

---

# 39. Cards

Use:

```text
border-radius: 12px
```

or:

```text
border-radius: 16px
```

Cards should have:

* White background
* Subtle border
* Minimal shadow
* Clear hierarchy

Avoid excessive shadows.

---

# 40. Buttons

Primary:

```text
Background: Primary
Text: White
Radius: 8–12px
Height: 44–48px
```

Secondary:

```text
Background: White
Border: #DDDDDD
Text: #222222
```

Large CTA:

```text
Height: 48–52px
```

---

# 41. Forms

Inputs:

```text
height: 48px
border-radius: 8px
border: 1px solid #DDD
```

Focus:

```text
border-color: Primary
box-shadow: 0 0 0 3px PrimaryLight
```

Labels should always remain visible.

Do not rely only on placeholders.

---

# 42. Responsive Design

## Desktop

```text
≥ 1200px
```

Use:

* Full navigation
* Sidebar filters
* Grid cards
* Facility filter and branch cards
* Sticky booking panel

---

## Tablet

```text
768–1199px
```

Use:

* Reduced navigation
* 2-column card grid
* Collapsible filters
* Smaller search form

---

## Mobile

```text
< 768px
```

Use:

* Bottom navigation or compact header
* Single-column cards
* Horizontal carousels
* Filter drawer
* Full-screen search modal
* Sticky booking CTA

---

# 43. Mobile Search UX

Instead of showing a huge desktop form:

```text
┌─────────────────────────────┐
│ 📍 TP. Hồ Chí Minh          │
│                             │
│ 📅 02/10 → 04/10            │
│                             │
│       [ TÌM XE ]            │
└─────────────────────────────┘
```

Clicking any field opens a bottom sheet.

---

# 44. Accessibility

Requirements:

* Keyboard navigable
* Visible focus states
* Semantic HTML
* Accessible labels
* Minimum touch target: 44×44px
* Sufficient color contrast
* Do not communicate information through color alone
* Image `alt` attributes
* Dialogs trap focus correctly

---

# 45. Loading States

Vehicle search should use skeletons.

```text
┌─────────────────────────┐
│ ██████████████████████  │
│                         │
│ ███████████             │
│ ██████                  │
│ █████████████           │
└─────────────────────────┘
```

Do not display a blank screen while searching.

---

# 46. Empty States

Example:

```text
Không tìm thấy xe phù hợp

Hãy thử:
• Thay đổi thời gian
• Mở rộng khu vực
• Bỏ bớt bộ lọc
```

CTA:

```text
Xoá bộ lọc
```

---

# 47. Error States

Example:

```text
Không thể tải danh sách xe

Đã xảy ra lỗi khi kết nối đến hệ thống.

[Thử lại]
```

Avoid technical messages such as:

```text
500 Internal Server Error
```

for normal users.

---

# 48. Design Tokens

```css
:root {
  --color-primary: #059669;
  --color-primary-hover: #047857;
  --color-primary-light: #ecfdf5;

  --color-text: #222222;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;

  --color-background: #ffffff;
  --color-surface: #f8f8f8;
  --color-border: #e5e5e5;

  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-error: #dc2626;
  --color-info: #2563eb;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-sm: 0 1px 3px rgba(0,0,0,.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,.08);

  --container-width: 1280px;
}
```

---

# 49. UX Priority

When implementing the design, prioritize these flows in order:

```text
1. Search vehicle
2. Browse/filter vehicles
3. Vehicle details
4. Booking (trực tiếp hoặc dùng gói)
5. Payment / hoá đơn / hoàn cọc
6. User trips & subscription
7. Khu vực Staff/Admin: xe, chính sách, gán xe/tài xế
8. Kiểm định trước/sau thuê
9. Bảo dưỡng, báo cáo sự cố, dashboard
```

The first five should feel extremely polished.

---

# 50. Core User Journey

The ideal experience should feel like:

```text
"I need a car"
       ↓
"Where?"
       ↓
"When?"
       ↓
"What cars are available?"
       ↓
"Which one can I trust?"
       ↓
"How much?"
       ↓
"Book"
       ↓
"Done"
```

Every major UI decision should reduce friction along this path.

---

# 51. Implementation Guidance

If implementing this as a modern web application:

```text
Frontend
├── Next.js (React, TypeScript, Tailwind CSS)  — web portal: khách hàng + Staff/Admin
└── Flutter (Android/iOS)                      — app khách hàng + app nhân viên/tài xế

Backend
├── ASP.NET Core Web API (.NET 8), Clean Architecture — modular monolith
├── REST API + OpenAPI/Swagger
├── Cookie session (Redis ticket store) + OTP email
├── Vehicles / Rental policy / Subscription
├── Rentals / Vehicle assignment / Inspection
├── Invoice / Payment (PayOS) / Refund
├── Maintenance / Reports
└── Notifications (Brevo email, FCM)

Infrastructure
├── PostgreSQL 15 (26 bảng, không FK tường minh)
├── Redis (session, OTP, rate limit)
├── Cloudinary (ảnh xe, avatar, GPLX, ảnh kiểm định)
└── Docker + Railway
```

Recommended initial architecture:

```text
Next.js Web Portal / Flutter App
   │  HTTPS + cookie session
   ▼
ASP.NET Core Web API (modular monolith)
   │
   ├── Account / RBAC
   ├── Organization (departments, facilities, staff)
   ├── Vehicles + rental policies
   ├── Subscriptions
   ├── Rentals + assignments + inspections
   ├── Invoices / payments / refunds
   ├── Maintenance / reports
   └── Notifications
          │
          ├── PostgreSQL
          ├── Redis
          └── Cloudinary / PayOS / Brevo
```

Do **not** start with microservices unless there is a concrete reason to do so. A modular monolith is sufficient for the initial product.

---

# 52. Important Product Rules

### Vehicle availability

Một xe không được đặt khi:

```text
rental hiện có overlap khoảng thời gian yêu cầu
hoặc xe đang có phiếu bảo dưỡng mở / status = maintenance
```

(Chống double-booking bằng transaction + exclusion constraint/advisory lock — xem TODO-02.)

### Booking

```text
pending → pre_inspection → renting → post_inspection → completed
```

Chỉ được `cancelled` từ `pending` hoặc `pre_inspection`.

### Subscription

```text
is_subscription = true  ⇔  customer_subscription_id có giá trị
is_subscription = true  →  không có Invoice
is_subscription = true  →  trừ remaining_hours sau khi hoàn thành đơn
```

### Invoice / Payment

```text
Invoice chỉ cho direct rental (is_subscription = false)
Payment direct: invoice_id bắt buộc
Payment subscription: invoice_id NULL, is_subscription_payment = true
Hoàn cọc sau post_rental inspection đạt và invoice đã paid
```

### Inspection

```text
pre_rental is_ok = true  →  mới chuyển sang renting
post_rental trước completed; is_ok = false  →  tạo vehicle_maintenance
Tối đa 1 pre_rental và 1 post_rental cho mỗi rental
```

### Cancellation

Cancellation behavior must clearly communicate:

* Ai huỷ (khách hay chi nhánh)
* Thời điểm huỷ (chỉ từ pending/pre_inspection)
* Số tiền hoàn
* Phí phạt (nếu có)
* Xử lý cọc (payment `type='refund'`, trạng thái `requested → paid | rejected`)

---

# 53. Visual Hierarchy Summary

Every page should follow:

```text
PRIMARY ACTION
      ↓
IMPORTANT INFORMATION
      ↓
TRUST INFORMATION
      ↓
SECONDARY INFORMATION
```

For a vehicle page:

```text
[ĐẶT XE]
    ↓
Price + availability
    ↓
Vehicle image + specifications
    ↓
Chính sách thuê + đặt cọc
    ↓
Chi nhánh / nhận xe
    ↓
Kiểm định gần nhất
    ↓
Thông tin thêm
```

---

# 54. Final Design Direction

The overall visual language should be:

```text
Clean
     +
Friendly
     +
Automotive
     +
Travel
     +
Trustworthy
     +
Conversion-focused
```

The system should **not** feel like a generic e-commerce website.

It should feel like:

> **Automotive rental service + fleet operations console + Vietnamese local rental business.**

The most important screen is the **vehicle search → vehicle detail → booking → payment** flow. For Staff/Admin it is the **fleet & rental operations** flow.

Optimize that flow before adding secondary features.
