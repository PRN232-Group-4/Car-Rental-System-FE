# Kế hoạch triển khai FE — Car Rental System FE

> **Trạng thái: đã chốt phương án auth same-origin bằng Cloudflare Worker proxy `/api/*` → BE.**
> Bản này thay thế plan trước (bản cũ còn để mở 3 lựa chọn ở mục auth).
> Ngày: 2026-10-03 · Base: `main`

---

## 0. Quyết định nền tảng (đã chốt)

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| Auth cross-site | **Cloudflare Worker proxy `/api/*` → BE (same-origin)** | Cookie `SameSite=Lax` gửi được, không cần CORS, không phải sửa BE |
| Response BE | Unwrap `{ message, is_success, data }` trong `ApiClient` | `ApiSuccessResponseFilter` bọc mọi response 2xx |
| API types | Sinh từ Swagger BE bằng `openapi-typescript`, commit file sinh | FE không phụ thuộc BE lúc build/CI |
| Server state | **TanStack Query** | list/detail/polling/optimistic/invalidate |
| UI state | Không thêm Zustand | YAGNI — Query + `AuthContext` đủ |
| Test | **Vitest** (unit) + **Playwright** (E2E) | Repo đã có `*.test.ts` nhưng chưa có runner |
| Google OAuth | **Hoãn** (BE `GoogleAuthentication.Enabled=false`) | Cần `UseForwardedHeaders` ở BE + đăng ký lại redirect URI |

### Vì sao proxy là phương án ít đụng BE nhất

- Browser chỉ thấy **một origin** → cookie `SameSite=Lax; Secure; HttpOnly` hoạt động, không cần CORS, không cần đổi `SameSite=None`.
- `refresh_token` có `Path=/api/auth` → path giữ nguyên nên vẫn khớp.
- wrangler `4.145.0` hỗ trợ `assets.run_worker_first` dạng **mảng glob** → chỉ `/api/*` vào Worker, còn lại vẫn static asset + SPA fallback.

### 0.1. Cấu hình proxy (Phase 0)

**`wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "car-rental-system-fe",
  "main": "worker/index.ts",
  "compatibility_date": "2026-09-30",
  "assets": {
    "directory": "./out",
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*"]
  },
  "vars": { "API_ORIGIN": "https://<be-host>" },
  "observability": { "enabled": true }
}
```

**`worker/index.ts`**

```ts
interface Env { API_ORIGIN: string }

const STRIP = ["host","content-length","connection","keep-alive","proxy-authenticate",
  "proxy-authorization","te","trailer","transfer-encoding","upgrade"];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.API_ORIGIN.replace(/\/+$/, "");
    const target = new URL(url.pathname + url.search, origin);

    const headers = new Headers(request.headers);
    for (const h of STRIP) headers.delete(h);
    headers.set("X-Forwarded-Host", url.host);

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
      redirect: "manual", // không để Worker tự follow 302 (phục vụ OAuth sau này)
    });

    const out = new Headers();
    for (const [k, v] of upstream.headers) if (k.toLowerCase() !== "set-cookie") out.append(k, v);
    for (const cookie of upstream.headers.getSetCookie()) out.append("set-cookie", cookie); // giữ nhiều Set-Cookie

    // redirect nội bộ về chính BE -> kéo về origin FE để không nhảy domain
    const location = upstream.headers.get("location");
    if (location?.startsWith(origin + "/")) out.set("location", url.origin + location.slice(origin.length));

    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: out });
  },
};
```

**Cảnh báo đã biết**

1. **Google OAuth lệch origin** — `GET /api/auth/google` → Google → browser nhảy thẳng `https://<be-host>/api/auth/google/complete`, cookie set trên domain BE rồi trả JSON `{email}`; FE không nhận cookie. Chỉ xử lý khi bật Google: thêm `/signin-google` + `/api/auth/google/complete` vào `run_worker_first`, **và** BE bật `UseForwardedHeaders` để `Url.ActionLink` sinh `redirect_uri` theo host FE, rồi đăng ký lại URI trong Google Console.
2. **Proxy không thay `ApiClient`**: vẫn phải thêm `credentials: "include"` + unwrap envelope.
3. **Local dev**: `next dev` không chạy Worker. Test API thật dùng `wrangler dev` trên `out/`; `next dev` giữ `NEXT_PUBLIC_USE_MOCK=true`.

---

## 1. Pha triển khai (có checkbox)

| Pha | Nội dung | Task | Ước lượng |
|---|---|---|---|
| P0 | Hạ tầng same-origin + `ApiClient` | FE-00 | 1.5 ngày |
| P1 | Data layer & types từ OpenAPI + mapper | FE-00 | 1 ngày |
| P2 | Auth (email/password) + guard | FE-28 (phần email) | 1.5 ngày |
| P3 | Subscription: mua gói → gói của tôi → thuê bằng gói | FE-09 | 3 ngày |
| P4 | Invoice & Payment + PayOS return | FE-08 | 3 ngày |
| P5 | GPLX + Cloudinary upload | FE-29 | 2.5 ngày |
| P6 | Test + Deploy | FE-21, FE-22 | 3 ngày |
| P7 | Google OAuth (sau, khi BE bật) | FE-28 (phần Google) | 1.5 ngày |

### Phase 0 — Hạ tầng same-origin (chặn mọi thứ)

- [x] **P0.1** Tạo `worker/index.ts` (nội dung mục 0.1).
- [x] **P0.2** Sửa `wrangler.jsonc`: thêm `main`, `assets.run_worker_first: ["/api/*"]`, `vars.API_ORIGIN`.
- [x] **P0.3** `.env.example`: `NEXT_PUBLIC_API_URL=/api`, `NEXT_PUBLIC_USE_MOCK=false` (giữ `true` cho dev).
- [x] **P0.4** `src/api/api-client.ts`: thêm `credentials: "include"` mặc định; unwrap `{ is_success, data }`; lỗi đọc `detail` của ProblemDetails.
- [x] **P0.5** `src/api/token-refresh.ts`: gặp 401 → `POST /api/auth/refresh` → retry 1 lần → vẫn 401 thì logout + `/login`.

**DoD:** login thật (không mock) gửi được cookie qua proxy; gọi `GET /api/account/profile` trả đúng user; 401 tự refresh; deep link `/hoa-don/123` vẫn load (SPA fallback).
**Test:** unit cho envelope/401/error map.
**Phụ thuộc:** cần **URL BE** để điền `API_ORIGIN`.

### Phase 1 — Data layer & types

- [x] **P1.1** Thêm `npm run gen:api` (`openapi-typescript` → `src/api/generated/schema.d.ts`), commit output.
- [x] **P1.2** Sửa type FE theo BE: `SubscriptionPlan`, `Vehicle`, `Rental`, `Invoice`, `Payment`, `CustomerSubscription`.
- [x] **P1.3** Thêm `src/features/*/mappers.ts` (BE → UI): `Vehicle`, `SubscriptionPlan`, tiền/thời gian.
- [x] **P1.4** Thêm `QueryClientProvider` vào `src/app/layout.tsx`.

**DoD:** không còn type `id: string`; mọi response đi qua mapper; list/detail hiển thị đúng dữ liệu BE.

### Phase 2 — Auth

- [x] **P2.1** `features/auth/api.ts`: `login` (nhận 204 + Set-Cookie), `logout`, `GET /api/account/profile` dựng `AuthUser`.
- [x] **P2.2** Bỏ localStorage user làm nguồn sự thật — chỉ dùng để tránh nháy UI.
- [x] **P2.3** `app/(dashboard)/layout.tsx` guard bằng `useAuth()` → `redirect("/login?next=...")`.
- [ ] **P2.4** Nút Google: `window.location = "/api/auth/google"` (điều hướng top-level, không fetch) — hoãn kích hoạt tới P7.

**DoD:** đăng nhập/đăng xuất/refresh hồ sơ thật; reload vẫn giữ phiên; vào dashboard khi chưa login bị chặn.

### Phase 3 — FE-09 Subscription

Routes:

```
app/(marketing)/goi-thue-bao/page.tsx        # tách từ section landing
app/(dashboard)/goi-cua-toi/page.tsx         # số giờ còn lại, hạn, trạng thái
app/(dashboard)/dat-xe/page.tsx              # "trả từng lượt" | "dùng gói"
```

- [x] **P3.1** Trang gói: `GET /api/subscription-plans` → card (giờ, hạn, giá/giờ).
- [x] **P3.2** Mua gói: `POST /api/subscription-plans/{id}/purchase` → tạo payment `pending` + trả PayOS `checkoutUrl`; FE redirect sang PayOS, gói được kích hoạt khi webhook xác nhận (poll `GET /api/subscription-plans/purchases/{orderCode}`).
- [x] **P3.3** "Gói của tôi": gọi `GET /api/customer-subscriptions` (có mock/fallback cho tới khi BE merge).
- [x] **P3.4** Hiển thị `remaining_hours` + badge `active/expired` (suy từ `end_date`), cảnh báo `< 5 giờ` hoặc `< 3 ngày` (khớp email FR-025).
- [x] **P3.5** Booking "Dùng gói": chọn gói active, chặn nếu `remaining_hours < duration`, gửi `subscriptionId`.
- [x] **P3.6** Sau thuê bằng gói: **không** sang hoá đơn; invalidate query "gói của tôi"; bắt lỗi `400 "not enough remaining hours"`.

**DoD:** mua gói → thấy giờ còn lại → thuê bằng gói trừ đúng số giờ; gói hết hạn/không đủ giờ bị chặn rõ ràng.

### Phase 4 — FE-08 Invoice & Payment

Routes:

```
app/(dashboard)/hoa-don/page.tsx             # list + filter trạng thái
app/(dashboard)/hoa-don/[id]/page.tsx        # chi tiết + nút thanh toán
app/(dashboard)/thanh-toan/ket-qua/page.tsx  # returnUrl/cancelUrl PayOS
app/(dashboard)/lich-su-thanh-toan/page.tsx  # ledger + refund
```

- [x] **P4.1** `GET /api/invoices`, `GET /api/invoices/{id}` → `amount`, `vatAmount`, `status`.
- [x] **P4.2** Checkout: `POST /api/invoices/{id}/checkout` → `window.location = checkoutUrl`.
- [x] **P4.3** Trang kết quả **poll** `GET /api/invoices/{id}` (`refetchInterval`) tới `paid`/timeout + nút "Kiểm tra lại" (webhook là server-side).
- [x] **P4.4** `GET /api/payments?invoiceId=` → lịch sử; hiện `refund/deposit/requested`.
- [x] **P4.5** Direct rental → chi tiết hoá đơn; subscription rental → **không** hiện bước này.

**DoD:** thanh toán qua PayOS redirect + xác nhận trạng thái đúng; lịch sử giao dịch + hoàn cọc hiển thị đúng.

### Phase 5 — GPLX + Cloudinary (FE-29)

- [x] **P5.1** `features/licenses/`: `GET/PUT /api/customer/license`, hiển thị `pending/approved/rejected`, gate nút đặt xe (BE bắt buộc `approved` cho thuê **trực tiếp**).
- [x] **P5.2** Upload ảnh: preview + nén client-side, lấy chữ ký từ BE, upload direct, trả `secure_url` cho license/avatar.

### Phase 6 — Test + Deploy (FE-21, FE-22)

- [x] **P6.1** Cài Vitest + script `test`; test `api-client` (envelope, 401 refresh, error map) và mapper.
- [x] **P6.2** Thêm `typecheck: tsc --noEmit` vào `package.json` và `.github/workflows/ci.yml`.
- [ ] **P6.3** Playwright: login → đặt xe trực tiếp → checkout; mua gói → thuê bằng gói; hủy đơn.
- [ ] **P6.4** Deploy: `npm run build` → `wrangler deploy`; set `API_ORIGIN`, `NEXT_PUBLIC_API_URL=/api`, `NEXT_PUBLIC_USE_MOCK=false`.

### Phase 7 — Google OAuth (hoãn)

- [ ] **P7.1** BE: bật `GoogleAuthentication`, `UseForwardedHeaders`; Google Console đăng ký URI theo host FE.
- [ ] **P7.2** Worker: thêm `/signin-google`, `/api/auth/google/complete` vào `run_worker_first`.

---

## 2. Phụ thuộc BE cần bổ sung trước FE-08/09

| Endpoint | Dùng cho | Trạng thái |
|---|---|---|
| `GET /api/customer-subscriptions` (của tôi) | FE-09 "Gói của tôi" | ⚠️ chưa có |
| `GET /api/rentals` (của tôi) | trang "Đơn của tôi" | ⚠️ chưa có (chỉ có `/{id}`) |
| `GET /api/facilities` public | booking công khai | ⚠️ đang chỉ `[Authorize(Roles="Admin")]` |

---

## 3. Rủi ro / cần chốt

- `SameSite=Lax` là **quyết định kiến trúc**; nếu bỏ proxy thì phải đổi BE sang `SameSite=None` + CORS credentials.
- PayOS `returnUrl`/`cancelUrl` phải khớp `PayOs__ReturnUrl`/`PayOs__CancelUrl` của BE.
- `API_ORIGIN` phải là HTTPS và là host BE (Railway) — **cần cung cấp**.
- OAuth (mục 0.1 cảnh báo 1) chỉ giải quyết ở P7.
