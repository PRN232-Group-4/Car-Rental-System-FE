# 2026-10-03 — Nền tảng same-origin, auth và data layer (FE-00, FE-21, FE-22 phần đầu)

- **FR/NFR:** NFR-008 (nền tảng FE), NFR-007 (test), FR-003 (session cookie), FR-004..007 (account)
- **Loại:** feat + fix

## Đã làm

### 1. Same-origin proxy `/api/*` (P0)

- `worker/index.ts`: Cloudflare Worker forward `/api/*` sang `env.API_ORIGIN` (strip hop-by-hop headers, giữ nhiều `Set-Cookie`, `redirect: "manual"`, rewrite `Location` nội bộ BE về origin FE).
- `wrangler.jsonc`: `main`, `assets.run_worker_first: ["/api/*"]`, `vars.API_ORIGIN`.
- `next.config.ts`: dev rewrite `/api/:path*` → `BACKEND_ORIGIN` (mặc định Railway) để `next dev` gọi được API thật same-origin; production `output: "export"` + `images.unoptimized`.
- `.env.example` / `.env.local`: `NEXT_PUBLIC_API_URL=/api`, `NEXT_PUBLIC_USE_MOCK=false`, `BACKEND_ORIGIN`.
- Mục đích: cookie `SameSite=Lax` hoạt động, không cần CORS, deep link SPA fallback.

### 2. `ApiClient` (P0.4/P0.5)

- `src/api/api-client.ts`: `credentials: "include"` mặc định; unwrap envelope `{ message, is_success, data }`; `ApiClientError` map message từ `detail` / `message` / `title` / `errors` (ProblemDetails); timeout 15s; 401 → refresh → retry đúng 1 lần (bỏ qua cho `auth/login|refresh|logout`).
- `src/api/token-refresh.ts`: `refreshSessionToken` single-flight (`POST /api/auth/refresh`, dùng chung promise khi nhiều request 401 đồng thời).
- `src/api/default-api-client.ts`: client dùng chung, nhánh mock khi `NEXT_PUBLIC_USE_MOCK != "false"`; export `isMockMode`.

**Fix:** `handleAuthFailure` trước đây luôn redirect `/login` khi refresh thất bại → khách chưa đăng nhập vào trang công khai (`/`, `/login`) bị đá về `/login` vì `AuthProvider` gọi `GET /api/account/profile`. Giờ chỉ redirect khi **có user đã cache** trong `localStorage` (tức phiên đã từng đăng nhập và thực sự hết hạn).

### 3. Auth (P2)

- `features/auth/api.ts`: `loginUser` (BE trả 204 + Set-Cookie → gọi `getProfile`), `getProfile`, `logoutUser`, `getCachedUser`.
- `features/auth/context/AuthContext.tsx`: bootstrap profile khi mount, fallback user đã cache để tránh nháy UI; `localStorage` chỉ là gợi ý, không phải nguồn sự thật.
- Guard: `app/(dashboard)/layout.tsx` redirect `/login?next=...` khi chưa đăng nhập (kèm skeleton "Đang đồng bộ hồ sơ...").

### 4. Data layer (P1)

- `npm run gen:api` (`openapi-typescript` → `src/api/generated/schema.d.ts`, commit output).
- `src/features/{vehicles,subscriptions,rentals,invoices,payments}/mappers.ts`: map BE → UI (tiền, thời gian, category, badge...); type bám schema BE (id số, không còn `id: string`).
- TanStack Query: `src/components/providers/QueryProvider.tsx` + bọc trong `src/app/layout.tsx` (cùng `AuthProvider`).

### 5. An toàn dữ liệu mock (fix)

Trước đây mọi API fallback về mock dữ liệu ở **mọi** môi trường → production hiển thị/ báo thành công giả. Đã gate bằng `isMockMode`:

- Không "chế" thành công: `checkoutInvoice`, `purchaseSubscriptionPlan`, `createHourlyRental`/`createLongTermRental` ném lỗi ở real mode (kèm UI báo lỗi cho `BookingModal`).
- Không "chế" dữ liệu: `getInvoices`, `getInvoiceById`, `getPayments`, `getMySubscriptions`, `getSubscriptionPlans`, `getVehicles`, `getFacilities`, `getLatestInspectionRecord` chỉ fallback mock khi mock mode.
- `getInitial*` trả rỗng ở real mode; component (`VehicleCatalog`, `SubscriptionPlans`, `FacilityExplorer`, `SearchWidget`, `InspectionShowcase`) thêm `.catch` + guard null để không crash khi danh sách rỗng.
- List rỗng hợp lệ (BE trả `data: []`) không còn bị thay bằng mock.

### 6. Test & CI (P6.1, P6.2)

- `vitest.config.ts` + `npm test`; `npm run typecheck`.
- `api-client.test.ts`: envelope, error map, 401 → refresh → retry, refresh fail không loop.
- `mappers.test.ts`: input **camelCase đúng schema OpenAPI** (+ 1 test tương thích PascalCase).
- `.github/workflows/ci.yml`: thêm `typecheck` và `test` trước `build`.

## Test

- `npm run typecheck` xanh; `npm test` **24/24 pass**; `npm run lint` 0 error (3 warning có sẵn); `npm run build` static export 15 route.
- Build local (`NEXT_PUBLIC_USE_MOCK=false`) verify API thật: `next dev` proxy `/api/subscription-plans` → 200 envelope.

## Chưa làm

- **P2.4 / FE-28 (Google OAuth):** hoãn tới khi BE bật `GoogleAuthentication` + `UseForwardedHeaders`.
- **P6.3 (Playwright E2E)** và **P6.4 (deploy lên Cloudflare, set `API_ORIGIN`)** chưa làm.
- `GET /api/facilities` phía BE vẫn chỉ Admin → landing/booking không tải được chi nhánh.

## Quyết định/giả định

- Cookie `SameSite=Lax` là quyết định kiến trúc: bắt buộc đi qua proxy same-origin, không đặt URL BE tuyệt đối vào `NEXT_PUBLIC_API_URL`.
- `localStorage` chỉ để tránh nháy UI, không dùng làm nguồn sự thật của phiên.
