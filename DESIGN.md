# Design Specification — Hệ Thống Thuê Xe Thong Dong (Vehicle Rental System)

> A design and UX specification for Thong Dong — a **single-operator** vehicle rental business (ô tô, xe máy, ô tô điện, xe máy điện) offering thuê theo giờ (kèm tài xế), thuê dài hạn và gói thuê bao trả trước.
>
> **Nguồn xác thực:** `docs/SRS_CarRental.md` (SRS v2.0), `Car-Rental-System-BE/specs` (FR/NFR), `Car-Rental-System-BE/docs/db/Init.sql` (DDL v2 — 26 bảng).
>
> Quyết định kiến trúc: đây là **system**, không phải **platform**. Một đơn vị vận hành sở hữu và quản lý toàn bộ đội xe — không có vai trò "chủ xe/đối tác", không chia hoa hồng, không có bước chủ xe duyệt đơn.

---

## 1. Product Overview

The system serves:

* **Customers** — thuê xe theo giờ (kèm tài xế) hoặc dài hạn, và/hoặc mua gói thuê bao
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

Use **Manrope** as the primary font — a modern geometric/humanist sans-serif typeface with exceptional legibility for both Latin and Vietnamese diacritics.

### Primary Font

```text
Manrope (Google Font)
Subsets: latin, vietnamese
Variable: --font-manrope
Weights: 300, 400, 500, 600, 700, 800
```

### Fallback

```text
system-ui
-apple-system
BlinkMacSystemFont
"Segoe UI"
Roboto
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
* 500–600 for important labels, tabs, and buttons
* 400 for normal copy and descriptions

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

## Floating Glass Header (Glassmorphic Navigation)

Structure:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo] Thong Dong    Thuê xe  Chi nhánh  Gói thuê bao  Hướng dẫn  Kiểm định │
│                      [Đăng nhập] / [User Pill + Dropdown]  [Đăng ký]  │
└────────────────────────────────────────────────────────────────────────┘
```

Header requirements:

* **Glassmorphism pill layout**: `glass-nav specular-border` (translucent frosted backdrop `backdrop-filter: blur(28px)`, specular rim highlight, rounded-2xl).
* Fixed floating positioned at top (`fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6`).
* Brand logo + typography lockup on the left (`/logo-car.png` + "Thong Dong").
* Text-only navigation links in 1 single horizontal row.
* **Authentication State**:
  * **Unauthenticated**:
    * Button "Đăng nhập" linking directly to `/login`.
    * CTA "Đăng ký" linking to `/#tim-xe`.
  * **Authenticated** (`useAuth` context synchronized with backend cookie session):
    * User profile pill button showing avatar (or initials avatar) + Full Name + ChevronDown.
    * Interactive glass dropdown menu with: Full Name, Email, Role badge (`Khách hàng`, `Nhân viên`, `Quản trị viên`), and "Đăng xuất" action.
* Responsive Mobile Menu: Hamburger toggle button opening full-width frosted dropdown sheet.

---

# 8. Homepage & Hero Banner

## 8.1 Hero Banner (Mioto-inspired Card Layout)

The hero section utilizes a bounded card layout with a high-impact scenic automotive backdrop:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │            Thong Dong - Cùng Bạn Trên Mọi Hành Trình            │ │
│ │            ─────────────────────────────────────────            │ │
│ │   Trải nghiệm sự khác biệt từ hơn 50+ xe tiêu chuẩn kiểm định   │ │
│ │                     đời mới khắp Việt Nam                       │ │
│ │                                                                 │ │
│ └─┬─────────────────────────────────────────────────────────────┬─┘ │
│   │ [🚗 Xe tự lái]  [👤 Xe có tài xế]  [📅 Thuê xe dài hạn]     │   │
│   │ ┌─────────────────────────┬───────────────────┬───────────┐ │   │
│   │ │ 📍 Địa điểm: TP.HCM (v) │ 📅 Thời gian thuê │  [TÌM XE] │ │   │
│   │ └─────────────────────────┴───────────────────┴───────────┘ │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

Hero Banner requirements:

* **Bounded Hero Card**: `max-w-7xl mx-auto`, `rounded-3xl sm:rounded-[36px]`, `shadow-2xl`, `overflow-hidden`.
* **Background Image**: Scenic automotive journey photo — **Đèo Hải Vân** (`/assets/hero-hai-van.jpg`).
* **Cinematic Scrim Overlay**: Multi-stop dark gradient (`bg-gradient-to-b from-black/50 via-black/30 to-black/60`) and subtle emerald wash (`bg-emerald-950/15`) ensuring high-contrast readability for white typography while retaining the rich beauty of the mountain and coastal highway.
* **Typography**:
  * H1: "Thong Dong - Cùng Bạn Trên Mọi Hành Trình" (font-extrabold text-white text-3xl sm:text-5xl lg:text-6xl drop-shadow-md).
  * Divider: Horizontal subtle white gradient line (`h-0.5 w-48 sm:w-64 mx-auto`).
  * Subtitle: "Trải nghiệm sự khác biệt từ hơn 50+ xe tiêu chuẩn kiểm định đời mới khắp Việt Nam".

---

# 9. Search Console (Floating Docked Bar)

The search console is docked halfway over the bottom edge of the hero card (`-mt-14` to `-mt-16`), creating a seamless transition into the page below.

## Structure & Fields

### 1. Rental Mode Tabs (Platter Header)
Positioned directly atop the search console:
* **Xe tự lái** (Active default: emerald `#059669` pill with car icon `Car`).
* **Xe có tài xế** (Frosted white pill with `UserCheck` icon).
* **Thuê xe dài hạn** (Frosted white pill with `CalendarRange` icon).

### 2. Search Console (Single Row Bar)
Glassmorphic container (`glass-search specular-border`, `bg-white/95 backdrop-blur-2xl shadow-2xl rounded-2xl sm:rounded-3xl`):

1. **Địa điểm / Chi nhánh**:
   * Icon `MapPin` (emerald `#059669`).
   * Label "ĐỊA ĐIỂM" (uppercase, text-[11px] font-semibold text-neutral-500).
   * Dropdown selector: "TP. Hồ Chí Minh (Tất cả chi nhánh)", or specific branches: Q.1 (Bến Thành), Thủ Đức (Thảo Điền), Tân Bình (Sân bay TSN), Giao tận nơi TP.HCM.
2. **Vách ngăn mờ (Divider)**:
   * Vertical separator `w-px h-10 bg-neutral-200/80` (desktop only).
3. **Thời gian thuê**:
   * Icon `Calendar` (emerald `#059669`).
   * Label "THỜI GIAN THUÊ".
   * Formatted summary: `21:00 T7, 03/10 - 20:00 CN, 04/10`.
   * Quick inline date & time editor popover for modifying start/end dates and times.
4. **Nút Tìm Xe**:
   * Icon `Search` + Label "Tìm Xe".
   * Primary button: Emerald `#059669`, rounded-xl sm:rounded-2xl, shadow-lg, active scale effect.
   * Smoothly scrolls to the vehicle catalog section (`#danh-sach-xe`).

---

# 10. Rental Modes

Hệ thống hỗ trợ 3 hình thức thuê linh hoạt:

1. **Xe tự lái** (`mode = 'self_drive'`): Khách hàng tự điều khiển xe đã kiểm định an toàn, nhận tại chi nhánh hoặc giao tận nơi.
2. **Xe có tài xế** (`mode = 'with_driver'`, `rentals.rental_type = 'hourly'`): Thuê theo giờ kèm tài xế chuyên nghiệp của đơn vị vận hành.
3. **Thuê xe dài hạn** (`mode = 'long_term'`, `rentals.rental_type = 'longterm'`): Hợp đồng thuê theo tháng cho cá nhân và doanh nghiệp, có thể kết hợp gói thuê bao trả trước (`is_subscription = true`).

---

# 10.1 Authentication & Login Portal (`/login`)

Trang đăng nhập chuyên biệt phục vụ khách hàng, nhân viên và quản trị viên:

### Layout
* **Split Layout**:
  * **Cột trái (Cinematic Showcase)**: Nhận diện thương hiệu Thong Dong, 4 cam kết cốt lõi (*Kiểm định minh bạch 4 cấp, nhận xe 15 phút, gói thuê bao linh hoạt, cứu hộ 24/7 toàn quốc*), thẻ đánh giá uy tín (*4.9/5★ từ 12,500+ khách hàng*).
  * **Cột phải (Glassmorphism Login Card)**: Khung kính mờ (`glass-card specular-border`), viền phản quang, nền aurora ambient orbs.
* **Tính năng xác thực**:
  * **1-Click Demo Account Picker**: Thẻ bấm nhanh cho Khách hàng (`customer@example.com`), Quản trị viên (`admin@thongdong.vn`), Nhân viên điều phối (`staff@thongdong.vn`).
  * **Validation**: Kiểm tra email hợp lệ, đếm và bắt buộc mật khẩu tối thiểu 12 ký tự theo đúng chuẩn backend `SessionController.cs`.
  * **Nút ẩn/hiện mật khẩu**: Toggle eye icon.
  * **Ghi nhớ đăng nhập**: Checkbox lưu phiên.
  * **Google OAuth**: Nút đăng nhập Google qua `/api/auth/google`.
  * **Tương thích backend**: Đăng nhập bằng session cookie (Redis Ticket Store), đồng bộ với `GET /api/account/profile` và `POST /api/auth/logout`.

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
Hình thức (Thuê theo giờ / Thuê dài hạn)
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
90.000đ / giờ
```

Booking summary (thuê theo giờ, kèm tài xế):

```text
24 giờ
× (90.000đ + 40.000đ phí tài xế/giờ)
────────────────
Tiền thuê        3.120.000đ
VAT (10%)          312.000đ
Đặt cọc (10%)      343.200đ
Phí trả trễ        (nếu có)
────────────────
Tổng cộng        3.432.000đ
```

Do not hide mandatory fees until the final step.

---

# 24. Booking CTA

Desktop:

```text
┌───────────────────────────────┐
│ 90.000đ / giờ              │
│                               │
│       ĐẶT XE                  │
└───────────────────────────────┘
```

Use sticky booking card on desktop.

Mobile:

```text
┌─────────────────────────────────┐
│ 90.000đ/giờ   [ĐẶT XE]       │
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
Rental information (thời gian, hình thức theo giờ / dài hạn, chi nhánh nhận xe)
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
├── RentalModeTabs        (thuê theo giờ / thuê dài hạn)
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

### Core CSS Variables

```css
:root {
  /* Typography */
  --font-manrope: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Primary Brand Colors */
  --color-primary: #059669;
  --color-primary-hover: #047857;
  --color-primary-light: #ecfdf5;

  /* Neutrals */
  --color-text: #222222;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;

  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  /* Semantic Feedback */
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-error: #dc2626;
  --color-info: #2563eb;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;

  /* Shadows & Elevation */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-glass: 0 28px 64px -14px rgba(15, 23, 42, 0.12), 0 8px 24px -4px rgba(5, 150, 105, 0.1);

  --container-width: 1280px;
}
```

### Glassmorphism System Primitives

```css
/* Floating Navigation Pill */
.glass-nav {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.85);
}

/* Floating Search Console */
.glass-search {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(36px) saturate(210%);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

/* Specular Rim Highlight */
.specular-border {
  position: relative;
}
.specular-border::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.4) 40%, rgba(5, 150, 105, 0.45));
  mask-composite: exclude;
  pointer-events: none;
}
```

### Static Asset Storage

All client image assets are organized under `/assets/` (served from `public/assets/`):
* Hero background: `/assets/hero-hai-van.jpg`
* Brand logos: `/assets/logo-car.png`, `/assets/logo-car-emerald.png`, `/assets/logo-car-white.png`
* Module source mirror: `src/assets/`

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
