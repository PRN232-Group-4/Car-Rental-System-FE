# FE-02 — Session & phân quyền phía FE

- **Priority:** P0; **Milestone:** M2; **Assignee:** Huy; **FR:** FR-003, FR-007
- **Phụ thuộc:** FE-FOUNDATION (API layer, Providers, proxy), FE-01 (Trí — trang đăng nhập/đăng ký), BE-04 (cookie session Redis, Done), BE-07 (RBAC, Done).
- **Phục vụ:** mọi route có bảo vệ (FE-03, 05–10, 11–27).
- **Đặt vào repo FE:** `docs/specs/FE-02-session-rbac.md`.

## 1. Bối cảnh & nguyên tắc

* Phiên là cookie **HttpOnly** `__Host-vehicle-rental` do BE phát hành (SameSite=Lax, Secure, sliding 8h, ticket ở Redis). JS **không đọc được** cookie → trạng thái đăng nhập phải hỏi BE bằng `GET /api/account/profile` (trả `email, fullName, gender, phone, avatarUrl, roles[]`; **không có `id`** — nếu cần id, đề xuất BE bổ sung, ghi vào open-questions).
* Dự án **xuất tĩnh**: không middleware/proxy phía Next, không `cookies()`. Vì vậy phân quyền FE là **lớp tiện ích UX** (ẩn menu, chuyển hướng, tránh nháy nội dung); **BE là nơi thực thi quyền**. Mọi mã/spec FE không được coi việc ẩn nút là bảo mật.
* Phiên bản FE-02 phải chạy được ở ba chế độ: BE thật (qua proxy), mock (`NEXT_PUBLIC_USE_MOCK`), và test.

## 2. Phạm vi

1. `AuthProvider`/`useSession`: tải phiên, trạng thái, làm mới, đăng xuất, đồng bộ nhiều tab.
2. Hằng số vai trò, bảng quyền truy cập theo route, cấu hình điều hướng theo vai trò (dùng chung cho Navbar, `AdminShell`, menu tài khoản).
3. `AuthGate`/`RequireRole`: chặn render nội dung bảo vệ cho tới khi biết phiên; chuyển hướng 401 → đăng nhập kèm `next`; 403 → trang `/forbidden`.
4. Xử lý 401 toàn cục (phiên hết hạn giữa chừng) và 403 từ API.
5. Công cụ phát triển: chọn vai trò giả trong mock (chỉ dev).
6. Không làm: giao diện đăng nhập/đăng ký/OTP/quên mật khẩu (FE-01 của Trí) — FE-02 cung cấp API nội bộ để FE-01 dùng.

## 3. Hợp đồng

### 3.1 Vai trò & quyền

```ts
// src/features/auth/roles.ts
export const ROLES = ["Admin", "Manager", "Staff", "Maintenance", "Driver", "Customer"] as const;
export type Role = (typeof ROLES)[number];
export const STAFF_PORTAL_ROLES: Role[] = ["Admin", "Manager", "Staff", "Maintenance"];
export const hasAnyRole = (user: SessionUser | null, roles: readonly Role[]) => !!user && user.roles.some(r => roles.includes(r as Role));
```

Danh sách vai trò thật lấy từ snapshot hợp đồng (seed `roles` + migration 0005 thêm `Manager`); **sai khác → sửa hằng số và báo**. Vai trò không nhận diện được bị bỏ qua (không crash).

```ts
// src/features/auth/access.ts — MỘT nguồn sự thật cho guard, sidebar, menu
export type AccessRule = { pattern: string; roles?: readonly Role[]; authenticated?: true }; // khớp tiền tố dài nhất
export const ROUTE_ACCESS: AccessRule[] = [
  { pattern: "/admin/users",              roles: ["Admin"] },
  { pattern: "/admin/roles",              roles: ["Admin"] },
  { pattern: "/admin/policies",           roles: ["Admin", "Manager"] },
  { pattern: "/admin/subscription-plans", roles: ["Admin", "Manager"] },
  { pattern: "/admin/staffs",             roles: ["Admin", "Manager"] },
  { pattern: "/admin/drivers",            roles: ["Admin", "Manager", "Staff"] },
  { pattern: "/admin/reviews",            roles: ["Admin", "Manager"] },
  { pattern: "/admin/reports",            roles: ["Admin", "Manager", "Staff"] },
  { pattern: "/admin/dashboard",          roles: ["Admin", "Manager"] },
  { pattern: "/admin",                    roles: ["Admin", "Manager", "Staff", "Maintenance"] },
  { pattern: "/account",                  roles: ["Customer"] },
  { pattern: "/profile",                  authenticated: true },
];
```

Bảng trên là **mặc định hợp lý**; phải **đối chiếu** với `[Authorize(Roles=…)]` thực tế trong snapshot hợp đồng và chỉnh cho khớp (BE thắng). Test kiểm tra mọi `pattern` trong `ROUTE_ACCESS` khớp một mục `navigation`.

### 3.2 Phiên

```ts
export type SessionUser = { email: string; fullName: string; gender?: string; phone?: string; avatarUrl?: string; roles: string[] };
export type SessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: SessionUser };

useSession(): SessionState & { refresh(): Promise<void>; logout(): Promise<void>; signedInAs: Role | null };
```

* Nạp bằng TanStack Query khóa `['session']`: `GET /account/profile`; **401 → `anonymous`** (không phải lỗi); lỗi mạng/5xx → giữ trạng thái cũ và hiển thị banner "Mất kết nối" (không đá người dùng ra).
* `staleTime` 60s; làm mới khi `window` lấy lại focus và khi `pageshow` với `event.persisted` (quay lại từ bfcache sau khi đăng xuất ở tab khác).
* `logout()`: gọi endpoint đăng xuất của BE (route lấy từ snapshot), xóa mọi cache TanStack Query (`queryClient.clear()`), phát `BroadcastChannel("vrs-auth")` thông báo `logout`, chuyển về `/`.
* Nhiều tab: nhận `logout`/`login` từ kênh → làm mới phiên ngay.
* `FE-01` sau khi đăng nhập thành công gọi `await session.refresh()` rồi chuyển đến `next` (đã `sanitizeNext`) hoặc trang mặc định theo vai trò: staff-portal → `/admin`, Customer → `/` (hoặc `/account/trips` nếu có đơn đang chạy — không bắt buộc).

### 3.3 Guard

```tsx
<AuthGate allow={["Admin","Manager"]} fallback={<GatePending />}>{children}</AuthGate>
```

* `loading` → hiển thị khung (skeleton kính đúng bố cục shell), **không** render children, **không** gọi API của trang con.
* `anonymous` → `router.replace('/login?next=' + encodeURIComponent(currentPathAndSearch))`.
* `authenticated` nhưng sai vai trò → `router.replace('/forbidden?from=…')` (trang 403 thân thiện, nút về trang mặc định theo vai trò).
* Tách hai tầng: layout nhóm route (`(account)/layout.tsx`, `admin/layout.tsx`) dùng `AuthGate` theo `ROUTE_ACCESS` cho cả cây; trang riêng có thể thu hẹp thêm bằng `RequireRole`.
* `sanitizeNext` (từ `lib/url.ts`): chỉ chấp nhận đường dẫn tương đối bắt đầu bằng một `/`, không `//`, không `\`, không scheme; ngoài ra về mặc định. Giữ nguyên query của trang đích.
* Chống vòng lặp: không chuyển hướng khi đã ở `/login`, `/register`, `/forbidden`; tối đa một lần `replace` mỗi thay đổi trạng thái.

### 3.4 Xử lý 401/403 từ API

* Sự kiện `auth:unauthorized` (từ `request()`): nếu phiên đang `authenticated` → đặt `anonymous`, xóa cache, toast "Phiên đã hết hạn, vui lòng đăng nhập lại", chuyển `/login?next=` (giữ trang hiện tại). Chỉ xử lý **một lần** cho nhiều request 401 đồng thời.
* 403 → không đăng xuất; `request()` ném `ApiProblemError(status 403)`; thành phần hiển thị `ForbiddenNotice` tại chỗ hoặc toast "Bạn không có quyền thực hiện thao tác này". Chỉ trang chính bị 403 mới chuyển `/forbidden`.
* Biểu mẫu dài bị 401: **không** mất dữ liệu — giữ trạng thái form, hiển thị hộp thoại "Đăng nhập lại" (modal, không rời trang) rồi gửi lại (tùy chọn nâng cao; tối thiểu là chuyển hướng kèm `next`).

### 3.5 Điều hướng theo vai trò

`src/config/navigation.ts`: danh sách mục `{ id, label, href, icon, roles? | authenticated?, group }` cho: Navbar công khai (mục "Cổng nhân viên" chỉ với `STAFF_PORTAL_ROLES`), menu tài khoản, sidebar admin. `getNavigation(user, area)` lọc theo vai trò. `AdminShell` của Anh và Navbar **đọc** cấu hình này (không còn mảng cứng). Mục không đủ quyền **không render** (không chỉ vô hiệu hóa).

### 3.6 Chế độ mock (đã gỡ)

> **Cập nhật (2026-10-23):** toàn bộ chế độ mock đã bị gỡ — không còn `src/api/mock/*`, `NEXT_PUBLIC_USE_MOCK`, `isMockMode` hay `localStorage["mock-role"]`. Mục dưới đây chỉ giữ lại làm mốc lịch sử của giai đoạn foundation.

`NEXT_PUBLIC_USE_MOCK=true`: handler `GET /account/profile` đọc vai trò từ `localStorage["mock-role"]` (**chỉ khi** `process.env.NODE_ENV !== "production"`; trong bản production bỏ nhánh này khỏi bundle). Có thanh công cụ dev nhỏ để đổi vai trò (`Anonymous | Customer | Staff | Manager | Admin | Maintenance`), không hiển thị ở production. Mock đăng nhập/đăng xuất khớp hợp đồng FE-01.

## 4. Trạng thái giao diện & biên

| Tình huống | Hành vi |
|---|---|
| Tải lần đầu, chưa biết phiên | Skeleton shell; **không nháy** nội dung bảo vệ hay trang đăng nhập |
| Phiên hết hạn khi đang dùng | Toast + chuyển đăng nhập kèm `next`; sau đăng nhập về đúng trang |
| Đăng xuất ở tab A | Tab B tự về trạng thái ẩn danh trong <= 1s |
| Nút Back sau đăng xuất | `pageshow persisted` → làm mới phiên → bị đẩy ra, không xem được dữ liệu cũ (cache Query đã xóa) |
| Tài khoản bị khóa (`is_active=false`) | BE từ chối đăng nhập (FE-01 hiển thị lỗi); nếu bị khóa giữa phiên, request kế tiếp trả 401 → luồng hết hạn |
| Người dùng nhiều vai trò | Hợp quyền: được vào nếu **có ít nhất một** vai trò hợp lệ; menu hiển thị hợp của các vai trò |
| Vai trò lạ/thiếu | Coi như không có quyền (không crash), ghi log dev |
| BE chết/mạng lỗi khi tải phiên | Giữ trạng thái trước; banner "Mất kết nối"; thử lại theo `retryable` |
| `next` độc hại | `sanitizeNext` → về mặc định |

## 5. Truy cập & hiệu năng

* Skeleton shell có `aria-busy="true"` và nhãn "Đang kiểm tra phiên đăng nhập" (visually hidden). Chuyển hướng đặt focus vào `<h1>` trang đích. Trang `/forbidden` có `<h1>`, mô tả, hành động rõ.
* `AuthProvider` nhẹ (không GSAP/3D); chỉ một request phiên cho mọi component (dedupe bằng Query).

## 6. Kiểm thử

* **Unit:** `hasAnyRole`, khớp `ROUTE_ACCESS` (tiền tố dài nhất, `/admin/users` ưu tiên hơn `/admin`), `getNavigation` theo từng vai trò, `sanitizeNext` (bộ dữ liệu tấn công), kiểm tra tính nhất quán `ROUTE_ACCESS` ↔ `navigation`.
* **Component (RTL + mock):** `AuthGate` — loading (không render children), anonymous → chuyển `/login?next=`, đúng/sai vai trò, nhiều vai trò; 401 đồng thời nhiều request chỉ xử lý một lần; đăng xuất xóa cache; `BroadcastChannel` đồng bộ (mock `BroadcastChannel`); `pageshow persisted`.
* **E2E (cho FE-21 của Phúc, ghi kịch bản trong spec này):** đăng nhập Customer vào `/admin` → `/forbidden`; Staff vào `/admin/users` → `/forbidden`; hết hạn phiên giữa chừng; hai tab.

## 7. Acceptance criteria

- [ ] `AuthProvider`/`useSession` hoạt động với BE thật qua proxy, mock, và test
- [ ] Không có khoảnh khắc nào nội dung bảo vệ hiển thị cho người chưa xác thực/không đủ quyền
- [ ] Mọi route trong `ROUTE_ACCESS` được bảo vệ ở layout; guard dùng một nguồn dữ liệu với menu
- [ ] 401 giữa chừng: toast + chuyển đăng nhập + quay lại đúng trang; 403: thông báo/`/forbidden`
- [ ] Nhiều tab đồng bộ đăng xuất; bfcache không lộ dữ liệu
- [ ] `sanitizeNext` chặn open redirect (test tấn công)
- [ ] Mock role switcher chỉ có ở dev (kiểm tra bundle production không chứa nhánh này)
- [ ] `ROUTE_ACCESS` đã đối chiếu với `[Authorize]` thực tế và ghi sai khác vào open-questions
- [ ] Test unit + component xanh; `build` static export xanh; `lint:design` xanh

## 8. Câu hỏi mở

* **O1.** `GET /account/profile` không trả `id`; nếu các module cần (ví dụ so khớp chủ đơn), đề xuất BE thêm `userId`/`customerId`/`staffId`.
* **O2.** Quyền chi tiết của `Manager` trên từng trang admin: bảng ở 3.1 là giả định, chủ nghiệp vụ xác nhận.
* **O3.** Vai trò `Driver` dùng app di động; có cho vào web hay không (mặc định: không).

---

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js, auth UX, accessibility). Hiện thực FE-02 theo ĐÚNG docs/specs/FE-02-session-rbac.md. Điều kiện tiên quyết: P1, F1 (docs/api/contract-snapshot.md), F2 đã xong; nếu chưa thì DỪNG và báo. Nhánh feat/fe-02-session-rbac.

ĐỌC TRƯỚC: AGENTS.md (đọc node_modules/next/dist/docs/ phần liên quan layout/route group/client components/static export); DESIGN.md A10, A9 và B.§7; FE-FOUNDATION; docs/api/contract-snapshot.md (route đăng nhập/đăng xuất/phiên, danh sách role, [Authorize] từng nhóm); src/api/**; src/components/layout/Navbar.tsx; src/features/admin/StaffShell.tsx (nếu đã merge).

LÀM theo spec mục 3: roles.ts, access.ts (đối chiếu với [Authorize] thật và sửa mặc định cho khớp, ghi sai khác vào docs/open-questions.md), AuthProvider + useSession (TanStack Query, BroadcastChannel, pageshow), AuthGate/RequireRole, trang /forbidden, xử lý 401/403 theo 3.4, config/navigation.ts + đổi Navbar và AdminShell dùng cấu hình này (không đổi giao diện ngoài lọc mục), route group (account)/ và bọc admin/layout.tsx bằng AuthGate, mock role switcher chỉ dev. KHÔNG làm UI đăng nhập (FE-01); cung cấp hook cho FE-01 và viết tài liệu ngắn hướng dẫn Trí cách dùng (docs/specs/FE-02 mục 3.2 là đủ, thêm ví dụ mã).

QUY TẮC: static export không có middleware/cookies(): mọi guard là client-side và chỉ là lớp UX. Không đọc/ghi cookie phiên bằng JS. Không lưu PII vào localStorage (trừ mock-role ở dev). Không nháy nội dung bảo vệ. Chuỗi UI tiếng Việt. Áp dụng DESIGN.md (skeleton, trang 403 theo A6). Không emoji/gradient.

KIỂM CHỨNG và dán kết quả thật: lint, lint:design, typecheck, test (đủ các ca ở mục 6), build; chạy với mock cho từng vai trò và chụp ảnh; nếu chạy được BE local thì chứng minh đăng nhập thật → /admin theo role và đăng xuất đa tab; kiểm tra bundle production không chứa mock-role (grep trong out/).

BÁO CÁO: file đổi, kết quả lệnh, điểm lệch giữa ROUTE_ACCESS mặc định và [Authorize] thật, điểm cần Trí (FE-01), Anh (FE-11) xác nhận. Gặp mâu thuẫn: dừng và hỏi.
```
