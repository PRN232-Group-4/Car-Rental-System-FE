# Hướng Dẫn Phát Triển (Developer Guide) — Thong Dong Frontend

> Tài liệu chuẩn hóa môi trường phát triển cục bộ và kiểm thử cho các kỹ sư Frontend dự án Vehicle Rental System (Thong Dong). Tuân thủ chặt chẽ tài liệu nền tảng `docs/specs/FE-FOUNDATION.md`.

---

## 1. Các chế độ khởi chạy (Development Modes)

### Xem FE đang gọi backend nào

Khi chạy `npm run dev`, terminal ghi `[API proxy] /api/* -> https://...` và nguồn cấu hình: `DEV_API_ORIGIN`, `BACKEND_ORIGIN` hoặc Railway mặc định. Trong trình duyệt, mở **F12 → Console**, lọc **`[API server]`** để xem `requestOrigin` (đích trình duyệt gọi), `backendOrigin` (backend phía sau dev proxy) và `via`. Log xuất hiện ở lần gọi API đầu tiên cho mỗi đích, tránh lặp trên mọi request. Nếu `NEXT_PUBLIC_API_URL` trỏ thẳng tới backend khác, log hiển thị đích trực tiếp đó.

Log chỉ bật ở development và chỉ ghi origin; không ghi query, body, cookie, token hoặc header. Đổi biến môi trường cần khởi động lại `npm run dev`. Bản production qua Worker sử dụng `API_ORIGIN` ở runtime, không suy đoán nó từ cấu hình dev.

> Không còn chế độ mock/dữ liệu mẫu: app luôn gọi backend thật. Khi backend không chạy, màn hình hiển thị trạng thái lỗi và nút thử lại.

---

### Chế độ 1: Dev với Backend Local (Cùng máy)
Khi bạn chạy Backend .NET API cục bộ tại cổng `5000` hoặc `5001`:

```bash
DEV_API_ORIGIN=http://localhost:5000 npm run dev
```

Hoặc trong `.env.local`:
```env
DEV_API_ORIGIN=http://localhost:5000
```

- `next.config.ts` sẽ thiết lập rewrite: mọi request bắt đầu bằng `/api/*` sẽ được proxy sang `DEV_API_ORIGIN/api/*`.
- Nhờ proxy cùng origin, trình duyệt gửi và nhận cookie xác thực `access_token` và `refresh_token` mà không gặp rào cản CORS hay chặn cookie bên thứ ba.

---

### Chế độ 3: Dev kết nối Live Staging (Railway)
Khi không chạy BE local nhưng muốn kiểm thử tích hợp thực tế với dữ liệu live:

```bash
npm run dev
```
Mặc định `next.config.ts` sẽ fallback proxy sang máy chủ staging trên Railway: `https://car-rental-system-be-production.up.railway.app`.

---

## 2. Lưu ý đặc biệt về Cookie và Trình duyệt Safari

> [!WARNING] **Cảnh báo tương thích Safari trên localhost**  
> Backend sử dụng cookie bảo mật: `SameSite=Lax`, `HttpOnly`, và cờ `Secure`.
> - **Google Chrome & Mozilla Firefox**: Cho phép lưu và gửi cookie có cờ `Secure` qua giao thức `http://localhost`.
> - **Apple Safari (macOS / iOS)**: Theo chính sách bảo mật WebKit, Safari **từ chối lưu cookie có cờ `Secure` qua kết nối HTTP không mã hóa**, ngay cả trên `localhost`.
> - **Giải pháp**:
>   - Khi phát triển trên môi trường local với Safari, sử dụng HTTPS cục bộ (ví dụ: `next dev --experimental-https` hoặc cấu hình chứng chỉ mkcert).
>   - Hoặc sử dụng Chrome / Firefox / Edge làm trình duyệt phát triển mặc định trên localhost.

---

## 3. Kiến trúc Cloudflare Worker Proxy (Production)

Trong môi trường Production tĩnh (`output: "export"`), Cloudflare Worker đóng vai trò Edge Reverse Proxy:

```text
Trình duyệt ──https://app.thongdong.vn/api/*──▶ Cloudflare Worker (worker/index.ts) ──▶ API_ORIGIN (Railway) /api/*
        └──static assets (HTML/JS/CSS)  ◀─── Workers static assets (./out)
```

- **Quy tắc chuyển tiếp**:
  - Gắn header `X-Forwarded-Host` và `X-Forwarded-Proto`.
  - Loại bỏ các header hop-by-hop không an toàn (`host`, `connection`, `transfer-encoding`...).
  - Bảo toàn 100% các header `Set-Cookie` trả về từ Backend (thông qua `upstream.headers.getSetCookie()`).
  - Thiết lập timeout 25 giây: nếu quá thời gian sẽ tự động ngắt và trả về lỗi chuẩn RFC 7807 ProblemDetails với mã HTTP 504.
  - Áp dụng `Cache-Control: no-store` cho mọi phản hồi API.

---

## 4. Các lệnh kiểm chứng chất lượng bắt buộc (Quality Gates)

Trước khi commit hoặc mở Pull Request, bắt buộc chạy và đảm bảo 100% các lệnh sau đạt kết quả xanh:

```bash
# 1. Kiểm tra quy tắc thiết kế DESIGN.md v3.1 (zero gradient, zero emoji, token v3.1)
npm run lint:design

# 2. Kiểm tra cú pháp và quy chuẩn mã nguồn ESLint
npm run lint

# 3. Kiểm tra an toàn kiểu dữ liệu TypeScript (Strict mode)
npm run typecheck

# 4. Chạy toàn bộ Unit & Integration Tests (Vitest + jsdom)
npm run test

# 5. Kiểm tra build xuất tĩnh hoàn chỉnh (Static HTML/JS export vào ./out)
npm run build
```
