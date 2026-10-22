# Kế hoạch triển khai FE — Car Rental System FE

## Cập nhật 2026-10-22 — Mã yêu cầu và mã đơn chính thức

Hiện tách hai mã tại workspace, danh sách, tra cứu, thanh toán và bàn giao. Đọc orderId từ server, không giả mã khi null/thiếu trường, giữ nguyên phân quyền. 35 unit/integration, 14 navigation tests và 2 Edge E2E đạt; TypeScript/design lint/ESLint đạt. Xem [thay đổi](../changes/2026-10-22-visible-official-order.md). Chỉ FE/chưa deploy.

## Cập nhật 2026-10-22 — Runtime local inspect sau trả

FE trỏ localhost:6789 nhưng tiến trình backend Debug cũ chưa có inspectionType. Đã chạy Release mới/kiểm tra migration trên cấu hình hiện hữu và thay backend local ở cùng cổng; không deploy Railway, không tự thao tác đơn. FE giải thích lỗi 409 legacy ở cả phân công/checked. 28 unit tests đạt, Swagger runtime có GET/PUT/POST post_rental. Xem [thay đổi](../changes/2026-10-22-local-post-inspection-runtime.md).

## Cập nhật 2026-10-22 — Kiểm tra sau trả xe

Sau nhận xe có phân công kỹ thuật hoặc Admin Đã inspect tương tự trước thuê, dùng phân công/kết quả riêng theo post_rental; không mặc định đạt cho đơn có tài xế và không tự hoàn tất. 70 unit/integration FE, 21 Edge E2E và 54 backend tests liên quan đạt, TypeScript/design lint/ESLint đạt. Cần backend mới/migration 0029; chưa deploy. Xem [thay đổi](../changes/2026-10-22-post-inspection-dispatch.md).

## Cập nhật 2026-10-22 — Cuộn tự nhiên trong workspace đơn thuê

Bỏ khóa shell 100dvh/overflow hidden và cuộn panel lồng; hồ sơ/bảng lệnh theo cuộn trang, hàng đợi vẫn cuộn riêng và truyền cuộn khi tới biên. Giữ bố cục trái/phải, bỏ primary sticky dưới header. 18 Edge E2E về con lăn/anchor/popup đạt, TypeScript/design lint đạt. Thay thế quy cách cuộn desktop cố định bên dưới. Xem [thay đổi](../changes/2026-10-22-rental-document-scroll.md). Chỉ FE/chưa deploy.

## Cập nhật 2026-10-22 — Thanh toán và thứ tự xác nhận/inspect

Workspace có thu tiền mặt và cập nhật thanh toán online; chặn bàn giao direct rental chưa paid, subscription không yêu cầu invoice. Chỉ inspect sau duyệt đơn; tự lái không tải/hiện/gửi phân công tài xế. 76 unit/integration, 27 Edge E2E liên quan đạt, TypeScript/design lint đạt. Yêu cầu mới thay thế việc gộp inspect và duyệt bên dưới. Xem [thay đổi](../changes/2026-10-22-rental-payment-and-action-order.md). Chỉ FE/chưa deploy.

## Cập nhật 2026-10-22 — Hàng đợi trái, chi tiết phải

Container 640–1200px giữ danh sách đơn bên trái và hồ sơ/bảng lệnh bên phải, thay vì xếp toàn bộ dọc. Màn hình lớn giữ ba cột; điện thoại xếp dọc. 9 Edge E2E bố cục/chọn đơn/cuộn đạt, TypeScript/design lint đạt. Xem [thay đổi](../changes/2026-10-22-rental-queue-side-layout.md). Chỉ FE/chưa deploy.

## Cập nhật 2026-10-22 — Bảng lệnh gọn và nhận trả xe

Thao tác chính theo giai đoạn có nhãn ngắn, dính đầu cột desktop; link nhận trả đưa tới nút Đã trả xe. Kiểm tra chỉ một submit theo chế độ chọn; lịch sử/phân công/ghi đè thu gọn, không lặp nút duyệt. 45 unit/integration và 36 Edge E2E đạt; TypeScript/design lint đạt. Xem [thay đổi](../changes/2026-10-22-compact-rental-actions.md). Chỉ FE/chưa deploy.

## Cập nhật 2026-10-22 — Kiểm tra và bước duyệt yêu cầu

Admin xác nhận checked pending kèm duyệt bằng approveRequest=true, refetch trạng thái thật và invalidation hàng đợi/count. Pending đã pass có nút duyệt riêng, không tự start/paid/default approval. Banner phân biệt kết quả kiểm tra với chờ duyệt. 43 unit/integration, 18 Edge E2E và 58 backend tests liên quan đạt; TypeScript/design lint đạt. Xem [thay đổi](../changes/2026-10-22-inspection-approval-progress.md). Chưa deploy.

## Cập nhật 2026-10-22 — Quá hạn và thu phí sau trả xe

Đã có nhãn/bộ lọc Quá hạn ở Admin, dấu trả trễ trong hồ sơ và panel thu phí phần thiếu bằng cash/PayOS theo cờ backend; chỉ hiển thị paid từ dữ liệu máy chủ. 60 unit/integration FE, 15 Edge E2E và 109 backend tests liên quan đạt; TypeScript/design lint đạt. Cần backend source mới, chưa deploy/chưa thử PayOS tiền thật. Xem [spec](specs/FE-overdue-collection.md), [thay đổi](../changes/2026-10-22-overdue-collection.md).

## Cập nhật 2026-10-22 — Danh sách tài xế trong điều phối

Điều phối có danh sách tài xế đang hoạt động độc lập với ca/chuyến, phân trang và Xếp ca chọn sẵn người. Có trạng thái chưa có ca, lỗi/tải lại và làm mới sau thay đổi nhân sự/vai trò. 21 unit API và 6 Edge E2E desktop/mobile đạt; TypeScript/design lint/ESLint đạt. Xem [thay đổi](../changes/2026-10-22-dispatch-driver-directory.md). Chưa deploy.

## Cập nhật 2026-10-22 — Lý do hủy đơn

Đã hiện trực tiếp lý do và thời gian hủy trong Admin workspace/tra cứu, Customer my-rentals và account trip detail. Admin đọc nested detail/history, Customer đọc timeline đã lưu; có retry khi lỗi, nêu rõ dữ liệu cũ chưa ghi nhận. Xem [thay đổi](../changes/2026-10-22-show-cancellation-reason.md). Chưa deploy.

## Cập nhật 2026-10-22 — Đơn kết thúc không còn thao tác phân công

Ẩn phân xe/tài xế và ghi đè trạng thái ở cancelled/completed; ngừng tải tài xế và chặn hàm gửi khi trạng thái không cho phép. Giữ lịch sử/biên bản đọc được. 45 unit/integration, 14 E2E, TypeScript/design lint đạt. Xem [thay đổi](../changes/2026-10-22-closed-rental-assignment.md). Chưa deploy.

## Cập nhật 2026-10-22 — Hủy Customer/Admin và lỗi phiên bản inspect

Tiếp tục: đã đồng bộ hủy ở cả account trips list/detail, thay dialog cũ bằng shared preview/validation. 71 unit/integration, 22 Customer E2E và 20 Admin E2E đạt; TypeScript/design lint/ESLint sạch. Người dùng xác nhận chỉ sửa source, không triển khai Railway.

Nút hủy Customer có ở danh sách/chi tiết trước renting, dialog đọc phí/hoàn tiền từ preview và giữ dữ liệu khi lỗi; Admin giữ nút hủy tương ứng. Inspect 404 báo rõ thiếu API trên backend Railway (đã xác nhận bằng Swagger). 53 unit/integration, 38 E2E desktop/mobile, TypeScript/design lint/ESLint đạt; backend 148 tests đạt. Cần triển khai BE/migration 0028 để hoạt động trên môi trường đang mở. Xem [thay đổi](../changes/2026-10-22-inspect-version-and-customer-cancel.md). Chưa deploy.

## Cập nhật 2026-10-22 — Nút Đã inspect và Hủy đơn thuê

Đã đặt nút Đã inspect dưới lưu phân công, dùng kỹ thuật viên giao sẵn. Bảng lệnh thêm Hủy đơn thuê ở pending/pre_inspection, yêu cầu lý do và xác nhận qua lifecycle `/cancel`; renting trở đi ẩn/chặn hủy. 52 unit/integration và 20 E2E đạt; TypeScript/design lint đạt, ESLint không lỗi (7 warning cũ). Xem [thay đổi](../changes/2026-10-22-inspect-and-cancel-actions.md). Chưa deploy.

## Cập nhật 2026-10-22 — Xe chưa thuê và kiểm tra theo hình thức lái

Customer dùng public search thống nhất, chọn có tài xế/tự lái cho cả hourly/longterm. GPLX chỉ chặn tự lái. Admin đọc readiness mặc định của đơn có tài xế; tự lái có phân công chờ kỹ thuật hoặc Admin xác nhận phân công và kiểm tra đạt. Directory phân biệt nguồn/người xác nhận. 68 unit, 28 E2E, TypeScript/design lint/ESLint đạt; backend 244 tests liên quan đạt. Cần backend/migration 0028 đồng bộ. Xem [spec](specs/FE-rental-inspection-modes.md) và [thay đổi](../changes/2026-10-22-customer-availability-inspection-modes.md). Chưa deploy.

## Cập nhật 2026-10-22 — Tài xế, trả xe và phí quá hạn

Booking và tiến trình customer phân biệt yêu cầu tài xế với đã phân công. Admin có tình trạng trả xe/returnedAt/cảnh báo quá hạn và phí từ settlement. Nút nhận xe dùng `/return`; hoàn tất dùng `/complete` để ghi giờ nhận, tính phí theo chính sách và xử lý cọc/hóa đơn sau kiểm tra. 34/34 unit API/workspace, 71/71 backend lifecycle/domain và 18 E2E liên quan đạt; TypeScript/design lint/ESLint đạt. Xem [spec](specs/FE-rental-driver-and-return.md), [thay đổi](../changes/2026-10-22-driver-assignment-and-return.md). Chưa deploy.

## Cập nhật 2026-10-22 — Danh sách Admin mới nhất trước

Sắp toàn bộ danh mục phòng ban/loại xe/gói/cơ sở theo ID giảm dần trước chia trang, mặc định nhân viên theo ID thay vì ngày vào làm. Backend xếp xe/customer/GPLX/cơ sở/vai trò/nhân viên trước phân trang SQL; giữ lịch/ca và dashboard theo nghiệp vụ. 14/14 unit test liên quan, TypeScript và ESLint đạt. Xem [thay đổi](../changes/2026-10-22-admin-newest-first.md). Chưa deploy; cần khởi động lại backend.

## Cập nhật 2026-10-22 — Tiến trình customer và loại thuê Admin

Sửa crash do render object cơ sở tại tiến trình customer, đồng bộ adapter chi tiết chuyến đi, thêm mục theo dõi vào account desktop/mobile. Hàng đợi Admin hiển thị đúng giờ/dài hạn và không suy diễn khi API cũ thiếu loại; backend bổ sung `rentalType` từ DB. 10/10 E2E và 53/53 unit test liên quan, TypeScript/design lint đạt; ESLint 0 lỗi/7 cảnh báo sẵn có. Xem [thay đổi](../changes/2026-10-22-rental-progress-and-types.md). Chưa deploy; cần khởi động lại backend để danh sách trả trường mới.

## Cập nhật 2026-10-22 — Áp lại sửa lỗi hồ sơ customer trên FE mới

Source mới `ae93988` chưa có bản sửa giới tính và GPLX mặc định; đã áp lại handler sự kiện an toàn và kiểm tra số GPLX ở `/profile`, `/driver-license`, giữ backend hiện có. Kiểm chứng trên source mới: 40/40 unit test liên quan và 4/4 Playwright Edge desktop/mobile đạt, API giả lập toàn bộ. Xem [spec](specs/FE-customer-profile-regressions.md) và [thay đổi](../changes/2026-10-22-customer-profile-regressions.md). Chưa deploy.

## Cập nhật 2026-10-21 — Dot và số việc chờ xử lý trên menu

Transit Desk lấy tổng từ `GET /api/admin/navigation-counts`, hiện dot chương và số chính xác ở mục con, cập nhật mỗi 30 giây và sau xử lý thành công. Thêm Duyệt GPLX với bộ lọc pending, giữ quyền hiện hữu; đồng bộ snapshot Swagger/schema có API counts và giới hạn auth mới. 636/636 unit test, 8/8 E2E Edge desktop/mobile sáng/tối, typecheck/design lint và production static build đạt; ESLint 0 lỗi/25 cảnh báo có sẵn. Xem [change](../changes/2026-10-21-admin-navigation-work-counts.md), [spec](specs/FE-26-admin-navigation-work-counts.md). Chưa deploy.

## Cập nhật 2026-10-21 — Đổi mật khẩu OTP

Hoàn tất form đổi mật khẩu dùng chung trên hồ sơ customer/admin/staff, bắt buộc OTP email và đăng nhập lại sau đổi. 630 unit test, 2 E2E desktop/mobile, typecheck/design lint/ESLint và static build đạt; chưa kiểm thử email thật/chưa deploy. Xem [spec](specs/FE-03-password-change-otp.md) và [change](../changes/2026-10-21-password-change-otp.md).

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
- [x] **P6.3** Playwright: Cấu hình runner E2E, cài đặt Chromium, viết test suites (`e2e/smoke.spec.ts`, `e2e/auth.spec.ts`) và scripts `test:e2e`.
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
