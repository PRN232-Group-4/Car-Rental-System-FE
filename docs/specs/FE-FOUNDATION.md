# FE-FOUNDATION — Nền tảng chung cho các module FE của Huy

- **Áp dụng cho:** FE-02, FE-04, FE-07, FE-14, FE-18, FE-19, FE-20, FE-23, FE-24, FE-25 (mọi spec FE khác **tham chiếu tài liệu này** thay vì lặp lại).
- **Làm sau:** P1 (design system) và **trước** mọi module FE.
- **Đặt vào repo FE tại:** `docs/specs/FE-FOUNDATION.md`.

## 1. Hiện trạng (khảo sát)

* Next.js 16.3.8 + React 19.2.8 + Tailwind v4, `output: "export"` (xuất tĩnh), triển khai Cloudflare Workers static assets (`wrangler.jsonc`). Chỉ có `next, react, gsap, @gsap/react, lucide-react` — **không** có thư viện dữ liệu/biểu mẫu/bảng/biểu đồ/toast/ngày giờ/test.
* `ApiClient` viết tay (`src/api/api-client.ts`) + mock in-memory (`src/api/mock/*`, bật bằng `NEXT_PUBLIC_USE_MOCK`); **không** `credentials: "include"`, không đọc `ProblemDetails`, không xử lý 401/403, chưa unwrap envelope `{ message, is_success, data }`.
* Không `middleware`, không session, không role constants. Route đã có: `/` (thật), và trên nhánh `feature/profile` của Anh: `/profile`, `/admin/*` (stub, dữ liệu tĩnh, không phân quyền, bảng/biểu mẫu code inline).
* Quy ước dự án (Anh đã dùng): do static export không có route động, trang chi tiết/sửa dùng **query string**: `/admin/vehicles/edit?id=…`.

## 2. Quyết định

| # | Quyết định | Lý do |
|---|---|---|
| F1 | **Giữ static export** + proxy cùng origin `/api/*` về BE. Không chuyển sang runtime Node/OpenNext trong đợt này | Cookie `__Host-vehicle-rental` có `SameSite=Lax` + `Secure`: FE (Cloudflare) và API (Railway) khác site thì cookie **không** được gửi kèm fetch. Proxy cùng origin giải quyết cả cookie lẫn CORS; không đụng Phúc (FE-22). Hạn chế: trang công khai render phía client (SEO chi tiết xe hạn chế) — chấp nhận vì acquisition qua landing |
| F2 | **TanStack Query v5** cho dữ liệu máy chủ, trên `ApiClient` nội bộ | Cache, dedupe, invalidation, trạng thái loading/error thống nhất; không thay transport |
| F3 | **React Hook Form + Zod** | Biểu mẫu kiểm tra theo schema, dùng lại schema cho cả form và adapter dữ liệu |
| F4 | **TanStack Table v8** (headless) bọc trong `DataTable` | Phân trang/sắp xếp/lọc phía server, tự do giao diện kính |
| F5 | **Recharts** (bản hỗ trợ React 19) | Composable, SVG, kiểm soát màu phẳng; Tremor phụ thuộc Tailwind 3 nên loại; Chart.js (canvas) khó làm bảng thay thế a11y |
| F6 | **Radix UI primitives** (gói hợp nhất `radix-ui`) + `vaul` + `sonner` + `class-variance-authority` + `clsx` + `tailwind-merge` | Truy cập (focus trap, roving focus) làm sẵn; style thuần Tailwind theo token; không cần CLI shadcn |
| F7 | **date-fns v4 + `@date-fns/tz` + `react-day-picker` v9** | Múi giờ GMT+7 tường minh; lịch popover tùy biến kính |
| F8 | **GSAP** (ScrollTrigger, Flip, SplitText) cho 2D; **three + @react-three/fiber + drei** cho 3D, tải lười | Theo DESIGN.md A7/A8 |
| F9 | **Vitest + Testing Library + jsdom** cho unit/component; **Playwright + axe** cho e2e/thị giác (FE-20/FE-21) | |
| F10 | i18n **không** làm trong đợt này (SRS v2.0 ghi ngoài phạm vi); tất cả chuỗi tiếng Việt tập trung theo module để dễ trích xuất sau | Xem FE-20 |

Phiên bản cụ thể: kiểm tra bằng `npm view <gói> version peerDependencies` để tương thích Next 16 / React 19.2 / Tailwind 4 trước khi ghim; nếu `@hookform/resolvers` và `zod` lệch phiên bản, chọn cặp tương thích đã được tài liệu xác nhận và ghi vào ADR.

## 3. Build, runtime, proxy cùng origin

```text
Trình duyệt ──https://app.<domain>/api/*──▶ Cloudflare Worker ──▶ API_ORIGIN (Railway) /api/*
        └──static assets (HTML/JS/CSS)  ◀─── Workers static assets
```

* `NEXT_PUBLIC_API_URL` mặc định **`/api`** (tương đối, cùng origin). Cấu hình biến: `API_ORIGIN` (Worker var, không `NEXT_PUBLIC_`), `NEXT_PUBLIC_USE_MOCK`.
* **Worker** (`worker/index.ts`, khai báo `main` trong `wrangler.jsonc`; `assets.run_worker_first` chỉ cho `/api/*` — **kiểm tra cú pháp hiện hành trong tài liệu Cloudflare/wrangler đã cài**): với đường dẫn bắt đầu `/api/`, forward method, header (loại `host`), query, thân dạng stream, **cookie** sang `API_ORIGIN`; trả nguyên `Set-Cookie` (không thêm `Domain`), không cache (`Cache-Control: no-store` cho phản hồi `/api`), giữ nguyên mã trạng thái; thêm `X-Forwarded-Host`/`X-Forwarded-Proto`; timeout 25s → 504 ProblemDetails.
* **Dev:** `next dev` không dùng `output: "export"`. `next.config.ts`: `output: process.env.NODE_ENV === "production" ? "export" : undefined` và `rewrites()` chỉ ở dev: `/api/:path*` → `process.env.DEV_API_ORIGIN` (ví dụ `https://localhost:5xxx`). Lưu ý: cookie `__Host-` + `Secure` chạy được trên `http://localhost` ở Chrome/Firefox; **Safari không** — ghi vào README dev.
* Kiểm tra static export (`npm run build`) vẫn qua sau mọi thay đổi; không dùng API chỉ có ở runtime (middleware, cookies(), route handler động).

## 4. Lớp API

`src/api/` giữ nguyên cấu trúc, nâng cấp:

* `request()` mặc định `credentials: "include"`, `Accept: application/json`, `AbortController` timeout 15s, không retry trừ `GET` (1 lần cho lỗi mạng/502/503/504).
* **Unwrap envelope:** BE trả `{ message, is_success, data }` (khóa `is_success` snake_case, `data` camelCase). `request()` trả `data` và đưa `message` vào metadata cho toast.
* **ProblemDetails:** lỗi → `ApiProblemError { status, title, detail, code?, errors?, traceId?, retryable }`. `code` là mã nghiệp vụ BE (`VEHICLE_UNAVAILABLE`…). Lỗi mạng → `ApiNetworkError`.
* **401** (trừ chính `GET /account/profile`): phát sự kiện `auth:unauthorized` (một lần, chống lặp) → `AuthProvider` xử lý (FE-02). **403:** ném `ApiProblemError` — UI quyết định (toast hoặc trang 403). **409** `ILLEGAL_TRANSITION`/`ALREADY_IN_STATE`: tầng gọi làm mới dữ liệu.
* Truy cập: mọi module có `features/<x>/api/{types.ts, client.ts, queries.ts, mocks.ts}`; khóa truy vấn theo nhà máy `keys.ts` (`['vehicles', 'search', params]`…). Dữ liệu từ BE đi qua **adapter** (map + Zod parse ở dev) để cách ly thay đổi hợp đồng.
* **Mock:** mỗi module thêm handler vào `src/api/mock/mock-handlers.ts` theo hợp đồng thật; có test cho handler. `NEXT_PUBLIC_USE_MOCK=true` để chạy không cần BE.
* Khuyến nghị (pha 2): xuất `openapi.json` từ BE CI và dùng `openapi-typescript` để sinh kiểu; trước đó kiểu viết tay + snapshot hợp đồng (mục 8).

## 5. Tiện ích dùng chung (`src/lib/`)

```text
format.ts   formatVnd(n) -> "900.000đ"; formatPercent; formatKm; formatDuration
time.ts     toUtcIso(date|input), fromUtcIso(iso) -> TZDate Asia/Ho_Chi_Minh, parseGmt7Input, formatDateTime/formatDate/formatRange, nowGmt7()
cn.ts       clsx + tailwind-merge
url.ts      parse/serialize bộ lọc theo URL (Zod), sanitizeNext(path)
query.ts    queryClient mặc định: staleTime 30s, gcTime 5m, retry theo ApiProblemError.retryable, refetchOnWindowFocus: false (admin form), true (phiên)
```

`Providers` (`src/app/providers.tsx`, client): `QueryClientProvider`, `AuthProvider` (FE-02), `Toaster` (sonner). `ReactQueryDevtools` chỉ ở dev. Mọi giờ trong DB/API là UTC; `time.ts` là **nơi duy nhất** đổi qua GMT+7 (xem DESIGN.md A13).

## 6. Thành phần dùng chung

**Vị trí:** `src/features/admin/components/` (quyết định của Huy) cho thành phần admin; `src/components/ui/` cho thành phần dùng ở cả công khai và admin (`Button`, `Input`, `DateTimeRangePicker`, `ImageUploader`, `Skeleton`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `Modal`, `Drawer`, `Tooltip`, `Tabs`, `Badge`).

**Quy tắc bóc tách từ code của Anh:** mọi thứ Anh code inline (bảng `<table>`, `PageHeader`, badge trạng thái, drawer mobile) được **tách** thành thành phần dùng chung, giữ nguyên hành vi trang của Anh; không viết song song một bản thứ hai.

Hợp đồng chính (rút gọn; props đầy đủ viết trong mã + test):

```ts
// DataTable — phân trang/sắp xếp/lọc phía server
type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[] | undefined; total: number;
  page: number; pageSize: number; onPageChange(p: number): void; onPageSizeChange?(n: number): void;
  sort?: { id: string; desc: boolean }; onSortChange?(s: DataTableProps<T>["sort"]): void;
  isLoading?: boolean; isFetching?: boolean; error?: ApiProblemError | null; onRetry?(): void;
  emptyState?: ReactNode; rowActions?(row: T): ReactNode; onRowClick?(row: T): void;
  selection?: { enabled: boolean; selectedIds: string[]; onChange(ids: string[]): void };
  density?: "comfortable" | "compact"; caption: string; getRowId(row: T): string;
};
// FilterBar — đồng bộ URL, chip + ô tìm kiếm (debounce 300ms)
type FilterBarProps = { schema: ZodObject<any>; value: Record<string, unknown>; onChange(v: Record<string, unknown>): void; fields: FilterField[]; searchPlaceholder?: string };
// ConfirmDialog — xác nhận hành động nguy hiểm, có lý do tùy chọn/bắt buộc
type ConfirmDialogProps = { open: boolean; title: string; description: ReactNode; confirmLabel: string; tone?: "danger" | "primary";
  reason?: { required: boolean; label: string; minLength?: number }; onConfirm(reason?: string): Promise<void> | void; onOpenChange(o: boolean): void };
```

Yêu cầu chung: nền/độ đặc theo DESIGN.md A9; trạng thái loading (skeleton đúng kích thước), empty (có hành động), error (nút "Thử lại" + `traceId`); a11y (`<caption>`, `aria-sort`, `aria-busy`, hàng bấm được có thể focus, thông báo số kết quả `aria-live`); phím tắt Esc/Enter; không `backdrop-filter` trên hàng.

## 7. Test, lint, scripts

* `npm run test` (Vitest, jsdom, Testing Library), `test:watch`, `typecheck` (`tsc --noEmit`), `lint`, `lint:design` (P1). CI chạy cả ba + `build`.
* Test bắt buộc cho nền tảng: `request()` (envelope, ProblemDetails, 401 một lần, timeout, retry GET), `time.ts` (UTC↔GMT+7 quanh nửa đêm và đổi ngày; **không** có DST), `format.ts`, `url.ts` (`sanitizeNext` chống open redirect: `//evil.com`, `/\evil`, `javascript:`, URL tuyệt đối), `DataTable` (loading/empty/error/sort/page/selection/a11y), `FilterBar`, `ConfirmDialog` (lý do bắt buộc).
* Chuyển 9 test tự viết hiện có (`api-client.test.ts`, `mock-handlers.test.ts`) sang Vitest.

## 8. Snapshot hợp đồng API (bước 0 của MỌI module FE)

BE và FE nằm cùng workspace (`../Car-Rental-System-BE`). Tạo `docs/api/contract-snapshot.md` bằng cách **đọc controller thật**: bảng `Method | Path | Roles | Request (query/body, kiểu) | Response data (kiểu) | Mã lỗi | Ghi chú`, theo nhóm Session/Account, Users (BE-31), Staff/Drivers (BE-32/33), Organization, Vehicles, Rental policies, Subscription plans, Invoices/Payments, Rentals, Reports (BE-25), Reviews (BE-34), Dashboard (BE-28), Loyalty (BE-27). Ghi **tường minh** endpoint "chưa có" và quy ước phân trang (`page`, `pageSize`, `items`, `totalCount`). Mỗi lần BE đổi, chạy lại bước này và so khác biệt. Spec module FE chỉ được tin snapshot này, **không** tin ví dụ trong spec khi hai bên khác nhau (ghi vào `docs/open-questions.md`).

## 9. Acceptance criteria

- [ ] Thư viện đã cài, phiên bản tương thích; `npm run build` (static export) vẫn xanh
- [ ] `request()` đạt mục 4; `credentials: "include"`, unwrap envelope, ProblemDetails, 401 một lần
- [ ] Worker proxy `/api/*` + `wrangler.jsonc` + cấu hình dev rewrites; kiểm chứng bằng cookie thật với BE chạy local
- [ ] `time.ts`/`format.ts`/`url.ts`/`query.ts` có test
- [ ] `DataTable`, `FilterBar`, `ConfirmDialog`, `Modal`, `Drawer`, `PageHeader`, `StatusBadge`, `EmptyState`, `ErrorState`, `Skeleton*`, `Pagination`, `FormField` đúng DESIGN.md và có test; các trang admin của Anh dùng lại chúng (không còn bảng/badge inline)
- [ ] `docs/api/contract-snapshot.md` đầy đủ, ghi rõ endpoint thiếu
- [ ] Vitest + RTL chạy trong CI; test cũ đã chuyển
- [ ] README dev: chạy mock, chạy với BE local (proxy), lưu ý Safari/cookie

## 10. Câu hỏi mở

* **O1.** Xác nhận với Phúc (FE-22) về Worker proxy và `API_ORIGIN`; nếu Phúc đã có cách khác (domain con dùng chung site), điều chỉnh mục 3.
* **O2.** Nếu tương lai cần SEO chi tiết xe: chuyển OpenNext/Workers server và giữ tuyến URL tương thích — ghi nhận, không làm bây giờ.

---

## 11. Phụ lục Quy Chuẩn Thị Giác v3.1 (Design System & Token Reference)

Mọi spec chức năng (`FE-02` đến `FE-25`) khi triển khai giao diện người dùng phải tuân thủ nghiêm ngặt **DESIGN.md v3.1 (Light Editorial Automotive Blueprint)**:

| Hạng mục | Quy chuẩn v3.1 | Ghi chú kỹ thuật |
|---|---|---|
| **Canvas** | `var(--canvas)` (`#FBFBF9`) | Nền giấy ấm kỹ thuật, thay cho Showroom Mist xanh xám cũ |
| **Accent chính** | `var(--primary)` (`#B45309`) | Precision Amber (vàng đồng kỹ thuật ô tô), thay thế hoàn toàn cho Emerald `#047857` |
| **Bề mặt & Bảng** | `var(--surface)` (`#FFFFFF`) | Bề mặt đặc, không trong suốt cho toàn bộ bảng biểu, ô nhập, form admin |
| **Vùng lõm / Table Header** | `var(--sunken)` (`#F2F2EE`) | Header của `DataTable`, ô input disabled, skeleton |
| **Chữ chính** | `var(--ink)` (`#0F172A`) | Slate Ink (đạt tương phản AAA 16.5:1 trên Canvas) |
| **Chữ phụ & nhãn** | `var(--ink-2)` (`#334155`), `var(--ink-3)` (`#64748B`) | Đạt chuẩn WCAG AA/AAA |
| **Font chữ** | Be Vietnam Pro (Chính) + JetBrains Mono (Số liệu) | Đầy đủ glyph tiếng Việt, tối đa 3 dòng H1 |
| **Vật liệu kính** | `.glass-1`, `.glass-2`, `.glass-3`, `.glass-admin` | Phục vụ điều khiển; tuyệt đối không dùng backdrop-filter trên hàng lặp lại |
| **Hệ thống Blueprint** | SVG vector phẳng đa phân vùng (`opacity: 0.04 - 0.08`) | Skateboard Chassis, Optical LiDAR, GPS Waypoint, Secure Enclave NFC |
| **Các điều cấm** | Zero gradients, zero emojis, zero `#000`, zero `h-screen` | Kiểm tra tự động 100% bằng `npm run lint:design` |


---

## Prompt thực thi

### F1 — Snapshot hợp đồng API (chạy ở repo FE; không sửa mã)

```text
Bạn đang ở repo FE (Car-Rental-System-FE); BE nằm ở ../Car-Rental-System-BE (đọc được). Nhiệm vụ CHỈ ĐỌC + TẠO MỘT TỆP TÀI LIỆU: docs/api/contract-snapshot.md theo specs mục 8 của docs/specs/FE-FOUNDATION.md.

Cách làm: đọc toàn bộ ../Car-Rental-System-BE/src/VehicleRental.WebApi/Controllers/*.cs, các DTO/record Request/Response, Application/**/Contracts, policy phân quyền và [Authorize(Roles=...)] của từng action; đọc ../Car-Rental-System-BE/specs/FR-*.md để đối chiếu endpoint được hứa nhưng chưa có. KHÔNG suy đoán: thiếu thì ghi "KHÔNG CÓ". Với mỗi endpoint ghi: Method, Path, Roles/Auth, Query/Body (tên, kiểu, ràng buộc), Response data (kiểu đầy đủ), mã lỗi nghiệp vụ nếu thấy, ghi chú. Ghi riêng: (1) route đăng nhập/đăng xuất/phiên hiện tại và cookie, (2) quy ước phân trang và envelope, (3) danh sách vai trò (role) thật trong DB/seed (Init.sql + migration 0005), (4) endpoint cần cho FE-02, 04, 07, 14, 18, 19, 23, 24, 25 nhưng CHƯA CÓ, (5) các trường FE mock đang dùng nhưng DTO BE không có (ví dụ biển số xe).

Trả lời cuối: nêu số endpoint theo nhóm, danh sách endpoint thiếu cho từng module FE, và mọi mâu thuẫn giữa specs BE và code BE. Không sửa file nào khác.
```

### F2 — Cài thư viện, lớp API, proxy, tiện ích (chạy ở repo FE)

```text
Bạn là senior frontend engineer. Hiện thực FE-FOUNDATION mục 2–5, 7 theo ĐÚNG docs/specs/FE-FOUNDATION.md. Nhánh feat/fe-foundation (sau khi P1 và F1 đã xong).

ĐỌC TRƯỚC: AGENTS.md (Next 16 có breaking changes: đọc node_modules/next/dist/docs/ phần liên quan static export, rewrites, font, routing); DESIGN.md Phần A; docs/api/contract-snapshot.md; src/api/**; next.config.ts; wrangler.jsonc; package.json; .github/workflows/ci.yml.

LÀM: (1) cài thư viện mục 2 sau khi kiểm tra tương thích (npm view … peerDependencies), ghi ADR ngắn trong docs/decisions/ nếu chọn cặp zod/resolvers khác mặc định; (2) nâng cấp ApiClient theo mục 4 (credentials, envelope, ProblemDetails, timeout/retry GET, sự kiện 401), giữ mock hoạt động; (3) tiện ích mục 5 + Providers; (4) Worker proxy + wrangler.jsonc + rewrites dev theo mục 3 — đọc tài liệu wrangler/Cloudflare hiện hành (không dựa trí nhớ); (5) Vitest + RTL + scripts + bước CI; chuyển 9 test cũ; (6) README dev.

KIỂM CHỨNG và dán kết quả thật: npm run lint, lint:design, typecheck, test, build (static export phải qua). Chạy BE local nếu được và chứng minh cookie đi qua proxy (curl/Playwright: đăng nhập → /api/account/profile trả 200 với cookie); nếu không chạy được BE thì nói rõ phần nào CHƯA kiểm chứng.

RÀNG BUỘC: không đổi nghiệp vụ; không phá route hiện có; không dùng API chỉ có ở runtime server; không thêm thư viện ngoài danh sách; không emoji/gradient. Gặp mâu thuẫn hoặc thiếu thông tin (ví dụ cú pháp run_worker_first): DỪNG và hỏi.

BÁO CÁO: file đổi, kết quả lệnh, điểm chưa kiểm chứng, điểm cần Phúc (FE-22) xác nhận.
```

### F3 — Bóc tách thành phần dùng chung (chạy ở repo FE, sau khi nhánh của Anh đã merge hoặc đã rebase)

```text
Bạn là senior frontend engineer. Hiện thực FE-FOUNDATION mục 6 theo ĐÚNG docs/specs/FE-FOUNDATION.md. Nhánh feat/fe-shared-components. Điều kiện: nhánh feature/profile của Anh đã vào main (hoặc nhánh của bạn dựng trên đó); nếu chưa thì DỪNG và báo.

ĐỌC TRƯỚC: DESIGN.md A6, A9, A10; src/features/admin/** (StaffShell, VehicleManagement, DirectoryPage, CatalogManager, VehicleForm, StaffProfileForm) và src/app/admin/**; FE-FOUNDATION mục 6.

LÀM: tách phần Anh code inline (bảng, PageHeader, StatusBadge, drawer mobile, form khung) thành thành phần dùng chung trong src/features/admin/components/ và src/components/ui/ theo hợp đồng mục 6; viết thành phần còn thiếu (FilterBar, Pagination, ConfirmDialog, Modal, Drawer, FormField, EmptyState, ErrorState, Skeleton*, StatCard, ChartCard khung). Cập nhật các trang của Anh dùng lại chúng — GIỮ NGUYÊN hành vi/route/dữ liệu của trang. Viết test (RTL) cho từng thành phần: loading/empty/error/sort/page/selection/a11y (role, aria-sort, focus, Esc).

Radix cho Dialog/Popover/Select/Tabs/Tooltip, vaul cho Drawer mobile, TanStack Table cho DataTable (manual pagination/sorting/filtering). Màu/độ đặc theo A9 (panel .glass-admin, thân bảng và ô nhập nền Surface đặc, KHÔNG backdrop-filter trên hàng).

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test, build; ảnh chụp trang admin trước/sau; axe không vi phạm serious/critical trên các trang đã chuyển.

BÁO CÁO: file đổi, thành phần mới và props, điểm cần Anh xác nhận (đã đụng trang của Anh).
```
