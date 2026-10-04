# Hệ Thống Thuê Xe Thong Dong — Frontend (Customer Web App)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Vitest](https://img.shields.io/badge/Vitest-v5-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Wrangler-F38020?logo=cloudflare)](https://workers.cloudflare.com/)

Ứng dụng web Frontend dành cho khách hàng của **Hệ thống thuê xe Thong Dong** (Single-operator Vehicle Rental System). Hệ thống phục vụ nhu cầu thuê ô tô, xe máy, xe điện linh hoạt theo giờ (kèm tài xế), thuê tự lái/dài hạn và gói thuê bao trả trước (Subscription), tích hợp thanh toán trực tuyến qua cổng PayOS.

---

## 🔗 Liên kết & Môi trường

| Môi trường | URL | Ghi chú |
|---|---|---|
| **Production Frontend** | [car-rental-system-fe.phucthan308.workers.dev](https://car-rental-system-fe.phucthan308.workers.dev) | Cloudflare Worker + Static Assets |
| **Production Backend API** | [car-rental-system-be-production.up.railway.app](https://car-rental-system-be-production.up.railway.app) | ASP.NET Core 9 (Railway) |
| **Swagger / OpenAPI Specs** | [Swagger UI](https://car-rental-system-be-production.up.railway.app/swagger/index.html) | API Documentation & Schema |

---

## 🌟 Tính năng nổi bật

### 1. Trang chủ & Trải nghiệm công khai (Marketing Landing)
- **Hero & Giới thiệu dịch vụ**: Giới thiệu mô hình thuê xe Thong Dong với đồ họa và hiệu ứng động mượt mà sử dụng **GSAP**.
- **Danh mục phương tiện (Vehicle Showcase)**: Duyệt xe theo loại (ô tô, xe máy, xe điện), hộp số, số ghế và mức giá.
- **Bảng gói thuê bao (Subscription Plans)**: So sánh các gói giờ thuê trả trước với mức chiết khấu tiết kiệm.
- **Quy trình & Đánh giá**: Hướng dẫn quy trình 5 bước thuê xe đơn giản, các câu hỏi thường gặp (FAQ) và phản hồi khách hàng.

### 2. Xác thực & Quản lý phiên (Authentication & Guards)
- **Đăng ký tài khoản (`/register`)**: Quy trình 2 bước hiện đại — điền thông tin cá nhân kèm mật khẩu an toàn, nhận và xác thực mã OTP 6 chữ số gửi qua email (`/api/account/registrations` & `/api/account/registrations/verify`), có đếm ngược gửi lại OTP.
- **Đăng nhập (`/login`)**: Xác thực an toàn bằng Email / Password, hỗ trợ tài khoản mẫu thử nghiệm nhanh (Demo Accounts).
- **Cơ chế Same-Origin Session Cookie**: Sử dụng cookie bảo mật (`SameSite=Lax; HttpOnly; Secure`).
- **Tự động làm mới Token (Silent Refresh)**: Interceptor tự động bắt mã lỗi `401 Unauthorized` để gọi `POST /api/auth/refresh` và thử lại request liền mạch.
- **Route Guard**: Bảo vệ các trang Dashboard, tự động điều hướng về `/login?next=...` nếu chưa đăng nhập.

### 3. Đặt xe trực tuyến (Vehicle Booking Flow)
- Chọn trạm lấy/trả xe (Facilities), thời gian nhận/trả xe và phương tiện phù hợp.
- **Hỗ trợ 2 hình thức thuê xe**:
  - **Thuê trực tiếp (Direct Rental)**: Tính giá theo giờ/ngày kèm tiền cọc và VAT.
  - **Thuê bằng gói (Subscription Rental)**: Trừ trực tiếp số giờ khả dụng từ gói thuê bao đang hoạt động, không phát sinh hóa đơn tiền mặt.
- **Kiểm tra Giấy phép lái xe (GPLX)**: Bắt buộc GPLX đã được duyệt (`approved`) trước khi hoàn tất đặt xe trực tiếp.

### 4. Gói thuê bao trả trước (Subscription Plans)
- Xem chi tiết danh sách gói: số giờ thuê, hạn dùng, giá cước ưu đãi.
- Mua gói trực tuyến qua cổng PayOS (tự động tạo đơn thanh toán và chuyển hướng checkout).
- **Trang "Gói của tôi" (My Subscriptions)**:
  - Quản lý các gói đã mua, theo dõi số giờ còn lại (`remaining_hours`) và hạn sử dụng.
  - Cảnh báo trực quan khi gói sắp hết giờ (< 5 giờ) hoặc sắp hết hạn (< 3 ngày).

### 5. Hóa đơn & Thanh toán (Invoices & Payments)
- **Danh sách & Chi tiết hóa đơn**: Minh bạch tiền thuê xe, phí đặt cọc và thuế VAT.
- **Thanh toán qua PayOS**: Tích hợp mã QR PayOS, thẻ ngân hàng và ví điện tử.
- **Trang kết quả thanh toán (`/payment/result`)**: Tự động polling trạng thái giao dịch từ hệ thống cho đến khi xác nhận thành công.
- **Lịch sử giao dịch & Hoàn cọc (Ledger)**: Theo dõi dòng tiền thanh toán và tiến trình phê duyệt hoàn tiền cọc sau khi trả xe và kiểm tra xe hoàn tất.

### 6. Quản lý Giấy phép lái xe (Driver License)
- Cập nhật thông tin bằng lái xe và tải ảnh trực tiếp lên **Cloudinary** (client-side upload).
- Theo dõi trạng thái thẩm định hồ sơ: `Chờ duyệt (Pending)`, `Đã duyệt (Approved)`, `Từ chối (Rejected)`.

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Phiên bản | Vai trò trong dự án |
|---|---|---|
| **Next.js** | `16.3.8` | Framework chính (App Router, Static Export, Dev Rewrites) |
| **React** | `19.2.8` | Thư viện UI và React Server/Client Components |
| **TypeScript** | `^5.0` | Đảm bảo Type-Safety toàn diện |
| **Tailwind CSS** | `^4.0` | Styling hệ thống giao diện hiện đại, responsive |
| **@tanstack/react-query** | `^5.104` | Quản lý Server State, caching, refetching và polling |
| **GSAP / @gsap/react** | `^3.15` | Hiệu ứng chuyển động mượt mà trên Landing Page |
| **Lucide React** | `^1.49` | Bộ icon giao diện thống nhất |
| **openapi-typescript** | `^7.13` | Tự động sinh TypeScript Types từ Swagger schema của Backend |
| **Vitest** | `^5.0` | Framework chạy Unit & Integration Test |
| **Playwright** | `^1.63` | Framework kiểm thử luồng người dùng thực tế (E2E Test) |
| **Wrangler / Cloudflare Workers** | `^4.145` | Reverse proxy Same-Origin `/api/*` và phục vụ Static SPA |

---

## 🏛️ Kiến trúc cốt lõi (Core Architecture)

### 1. Cơ chế Same-Origin Reverse Proxy
Để tránh các vấn đề về Cookie Cross-Site (`SameSite=Lax; HttpOnly`) giữa tên miền Frontend và Backend mà không cần cấu hình CORS lỏng lẻo hay chuyển thành `SameSite=None`:

- **Môi trường phát triển cục bộ (Local Dev)**:
  `next.config.ts` sử dụng tính năng `rewrites()` để chuyển hướng toàn bộ request `/api/*` tới Backend Origin (`BACKEND_ORIGIN`). Trình duyệt coi mọi request đều cùng origin `http://localhost:3000`.
- **Môi trường Production (Cloudflare Worker)**:
  `worker/index.ts` tiếp nhận các request bắt đầu bằng `/api/*`, chuyển tiếp đến máy chủ Railway Backend, bảo toàn các header `Set-Cookie` và bổ sung `X-Forwarded-Host`. Các request còn lại được phục vụ từ thư mục static `./out` (SPA fallback).

```text
Browser ──> [ Next.js Dev / Cloudflare Worker ]
                 │
                 ├── /api/*  ─────────>  Backend API (Railway)
                 └── /*      ─────────>  Static SPA Pages (out/)
```

### 2. Mô hình phân tầng theo Feature (Feature-Driven Architecture)
Mã nguồn được cấu trúc theo nghiệp vụ (domain/feature) thay vì theo loại file kỹ thuật. Các route trong `src/app/` chỉ làm nhiệm vụ layout và routing mỏng; toàn bộ logic, type, mapper và component thuộc về `src/features/`.

```text
src/
├── api/                  # HTTP Client, Token Refresh, Generated Schema, Mock Store
│   ├── api-client.ts     # Wrapper fetch unwrap envelope { is_success, data }
│   ├── token-refresh.ts  # Cơ chế bắt 401 tự refresh access token
│   ├── generated/        # schema.d.ts tự động sinh từ OpenAPI
│   └── mock/             # Mock Handlers & In-memory Store cho offline dev
├── app/                  # Next.js App Router
│   ├── (marketing)/      # Trang công khai: landing, xem gói thuê bao
│   ├── (dashboard)/      # Trang nghiệp vụ: booking, my-subscriptions, invoices, payment, driver-license
│   ├── login/            # Trang đăng nhập
│   ├── globals.css       # Tailwind CSS v4 base & design tokens
│   └── layout.tsx        # Root layout, QueryClientProvider, AuthProvider
├── components/           # UI Primitives dùng chung (ui, layout, providers)
├── config/               # Cấu hình hằng số, biến môi trường
├── features/             # Feature Modules độc lập
│   ├── auth/             # Login, logout, user profile, auth context
│   ├── vehicles/         # Danh sách xe, chi tiết xe, bộ lọc
│   ├── facilities/       # Điểm giao nhận xe
│   ├── rentals/          # Đặt xe, tính cước
│   ├── subscriptions/    # Mua gói, danh sách gói của tôi
│   ├── invoices/         # Hóa đơn thuê xe
│   ├── payments/         # Thanh toán PayOS, kết quả, hoàn cọc
│   ├── licenses/         # Quản lý & upload GPLX
│   └── landing/          # Các section của landing page
├── hooks/                # Custom React Hooks dùng chung
worker/                   # Cloudflare Worker proxy cho production
```

### 3. Chuẩn hóa API Envelope & Type Safety
- **Tự động Unwrap Envelope**: Backend trả về dạng `{ message, is_success, data }`. `ApiClient` tự động kiểm tra `is_success` và giải nén dữ liệu trong `data`, đồng thời bắt lỗi `ProblemDetails` theo chuẩn RFC 7807.
- **Offline Mock Support**: Khi `NEXT_PUBLIC_USE_MOCK=true`, hệ thống sử dụng Mock Handlers giả lập toàn bộ API với dữ liệu mẫu trong bộ nhớ, cho phép phát triển FE ngay cả khi mất mạng hoặc Backend bảo trì.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy cục bộ

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 20.x trở lên (khuyến nghị Node 22+ hoặc 24 theo CI).
- **Trình quản lý gói**: `npm` (đi kèm Node.js).

### 1. Cài đặt Dependencies
```bash
git clone https://github.com/phucthan308/Car-Rental-System-FE.git
cd Car-Rental-System-FE
npm install
```

### 2. Thiết lập Biến môi trường
Tạo file `.env.local` từ mẫu `.env.example`:

```bash
cp .env.example .env.local
```

Nội dung `.env.local`:
```env
# Prefix API URL cho Client (mặc định /api qua proxy same-origin)
NEXT_PUBLIC_API_URL=/api

# Origin của Backend phục vụ rewrite trong next.config.ts (chỉ chạy ở dev)
BACKEND_ORIGIN=https://car-rental-system-be-production.up.railway.app

# Chuyển thành true để chạy offline hoàn toàn với dữ liệu Mock
NEXT_PUBLIC_USE_MOCK=false

# Cấu hình Cloudinary upload ảnh GPLX (tùy chọn)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

### 3. Chạy Development Server
```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 📜 Các lệnh Scripts (NPM Scripts)

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi chạy môi trường phát triển cục bộ tại `localhost:3000` |
| `npm run build` | Build ứng dụng và xuất bản tĩnh ra thư mục `./out` |
| `npm run start` | Khởi chạy máy chủ production từ bản build |
| `npm run lint` | Kiểm tra lỗi cú pháp và quy chuẩn code với ESLint |
| `npm run typecheck` | Kiểm tra tĩnh kiểu dữ liệu TypeScript (`tsc --noEmit`) |
| `npm run test` | Chạy bộ kiểm thử tự động Unit/Integration với Vitest |
| `npm run test:e2e` | Chạy toàn bộ kiểm thử E2E với Playwright (Headless mode) |
| `npm run test:e2e:ui` | Mở giao diện tương tác Playwright UI để debug trực quan |
| `npm run gen:api` | Sinh lại TypeScript types từ Swagger OpenAPI schema của Backend |

---

## 🧪 Kiểm thử & Tiêu chuẩn chất lượng (Quality Gates)

Quy trình CI (`.github/workflows/ci.yml`) tự động thực thi các bước kiểm tra nghiêm ngặt trên mọi Pull Request. Trước khi commit, hãy đảm bảo các lệnh sau đều vượt qua:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Hệ thống kiểm thử của dự án bao gồm:

- **Unit & Integration Test (Vitest)**: Kiểm thử bộ giải nén envelope `ApiClient`, cơ chế xử lý lỗi `ProblemDetails`, cơ chế tự động refresh token 401, các hàm mappers dữ liệu từ BE sang UI, và các mock handlers (`npm run test`).
- **End-to-End Test (Playwright)**: Kiểm thử toàn bộ luồng trải nghiệm người dùng thực tế trên trình duyệt (`npm run test:e2e`), bao gồm:
  - `e2e/smoke.spec.ts`: Tải trang chủ, kiểm tra các liên kết menu điều hướng, trang gói cước, form đăng nhập và Route Guard chặn truy cập dashboard chưa đăng nhập.
  - `e2e/auth.spec.ts`: Kiểm tra form validation mật khẩu, tính năng điền nhanh tài khoản mẫu (Demo accounts) và thao tác ẩn/hiện mật khẩu.
  - `e2e/register.spec.ts`: Kiểm tra toàn diện quy trình đăng ký, validation mật khẩu, bước nhập mã OTP xác thực và điều hướng qua lại giữa các trang.
- **Typecheck**: Đảm bảo không có lỗi type `any` không mong muốn và tuân thủ chặt chẽ schema được sinh từ BE (`npm run typecheck`).

---

## 🚢 Quy trình Triển khai (Deployment)

Dự án được cấu hình triển khai dưới dạng **Cloudflare Workers Assets**:

1. **Build tĩnh ứng dụng**:
   ```bash
   npm run build
   ```
   Lệnh này tạo thư mục `./out` chứa toàn bộ trang HTML, JS, CSS đã được tối ưu.

2. **Deploy lên Cloudflare**:
   ```bash
   npx wrangler deploy
   ```
   Wrangler sẽ upload asset trong `./out` và cập nhật Cloudflare Worker proxy tại `worker/index.ts`.

---

## 📚 Tài liệu liên quan

- [CONTRIBUTING.md](CONTRIBUTING.md) — Quy ước commit (Conventional Commits), tạo nhánh, mở PR và kiểm tra trước khi commit.
- [DESIGN.md](DESIGN.md) — Đặc tả chi tiết thiết kế UI/UX, Design Tokens, bảng màu và Customer Journeys.
- [docs/architecture.md](docs/architecture.md) — Kiến trúc tổng thể hệ thống Next.js App Router & phân tầng nghiệp vụ.
- [docs/fe-implementation-plan.md](docs/fe-implementation-plan.md) — Kế hoạch các pha triển khai tính năng chi tiết.
- [changes/CHANGELOG.md](changes/CHANGELOG.md) — Lịch sử và nhật ký thay đổi theo từng đợt cập nhật.
