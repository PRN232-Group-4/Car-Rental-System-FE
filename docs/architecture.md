# Kiến trúc dự án (Next.js App Router)

> Ghi chú kiến trúc cho `Car-Rental-System-FE`. Mục tiêu: **tổ chức theo feature (domain),
> không theo loại file**. `app/` chỉ chứa routing, logic nằm trong `features/`.

## 1. Cấu trúc mục tiêu

```
my-app/
├── src/
│   ├── app/                      # Chỉ routing + layout, giữ mỏng
│   │   ├── (marketing)/          # Route group: trang public
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/                  # Route handlers (webhook, public API)
│   │   │   └── webhooks/stripe/route.ts
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── global-error.tsx
│   │
│   ├── features/                 # Mỗi feature là 1 module độc lập
│   │   ├── orders/
│   │   │   ├── components/       # UI riêng của feature
│   │   │   ├── actions.ts        # Server Actions (mutations)
│   │   │   ├── queries.ts        # Data fetching (server-only)
│   │   │   ├── schemas.ts        # Zod schemas
│   │   │   ├── hooks/            # Client hooks
│   │   │   ├── types.ts
│   │   │   └── index.ts          # Public API của feature
│   │   ├── auth/
│   │   └── billing/
│   │
│   ├── components/               # Dùng chung toàn app
│   │   ├── ui/                   # Primitive: Button, Input, Dialog (shadcn/ui)
│   │   └── layout/               # Header, Sidebar, Footer
│   │
│   ├── server/                   # Code chỉ chạy phía server
│   │   ├── db/
│   │   │   ├── client.ts         # Prisma/Drizzle client
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── services/             # Business logic
│   │   ├── repositories/         # Data access layer
│   │   ├── auth/                 # Session, JWT, RBAC
│   │   └── jobs/                 # Queue, cron
│   │
│   ├── lib/                      # Helper dùng chung, không phụ thuộc framework
│   │   ├── utils.ts
│   │   ├── fetcher.ts
│   │   ├── logger.ts
│   │   └── errors.ts
│   │
│   ├── config/
│   │   ├── env.ts                # Validate env bằng Zod (t3-env)
│   │   ├── site.ts
│   │   └── constants.ts
│   │
│   ├── providers/                # React context providers (Query, Theme)
│   ├── hooks/                    # Hook dùng chung
│   ├── types/                    # Type global
│   ├── styles/
│   ├── i18n/                     # Đa ngôn ngữ (next-intl)
│   └── middleware.ts             # Auth, i18n, rate limit
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                      # Playwright
├── public/
├── .github/workflows/            # CI: lint, typecheck, test, build
├── Dockerfile
├── next.config.ts
├── tsconfig.json                 # Path alias: @/features/*, @/server/*
├── eslint.config.mjs
└── .env.example
```

## 2. Các quyết định quan trọng để scale

**1. Phân tầng rõ ràng (layered)**
`page.tsx` → `features/*/queries|actions` → `server/services` → `server/repositories` → DB.
Component không gọi DB trực tiếp. Nhờ vậy dễ test, dễ đổi ORM, dễ tách backend sau này.

**2. Ranh giới Server/Client**
- Mặc định dùng Server Components, chỉ thêm `"use client"` ở lá của cây component.
- Dùng package `server-only` cho code trong `server/` để tránh lộ secret ra client.
- Mutations dùng Server Actions và luôn validate input bằng Zod.

**3. Ràng buộc import giữa các module**
- `features/A` không import trực tiếp nội bộ của `features/B`, chỉ qua `index.ts`.
- `components/ui` và `lib` không import từ `features`.
- Enforce bằng ESLint (`eslint-plugin-boundaries` hoặc `no-restricted-imports`).

**4. Data fetching & cache**
- Cache theo tag (`revalidateTag`) và `unstable_cache`/`use cache` tùy phiên bản.
- Client state dùng TanStack Query cho dữ liệu cần realtime/optimistic. State UI nhỏ dùng Zustand.
- Dùng `Suspense` + `loading.tsx` để streaming.

**5. Độ tin cậy**
- Validate env ngay lúc build (`config/env.ts`).
- Logging có cấu trúc (pino), tracking lỗi (Sentry), tracing (OpenTelemetry).
- Rate limit ở `middleware.ts` (Upstash) và có error boundary theo route.

**6. Hiệu năng**
- `next/image`, `next/font`, dynamic import cho component nặng.
- Phân tích bundle bằng `@next/bundle-analyzer`.
- ISR/PPR cho trang ít thay đổi.

## 3. Khi dự án lớn hơn: chuyển sang monorepo (Turborepo + pnpm)

```
apps/
  web/            # Next.js
  admin/          # Next.js khác
  api/            # Backend riêng (Go/.NET/NestJS) nếu cần
packages/
  ui/             # Design system dùng chung
  db/             # Schema + client
  config/         # eslint, tsconfig, tailwind preset
  validators/     # Zod schemas dùng chung FE/BE
```

## 4. Lời khuyên thực tế

- **Đừng over-engineer từ đầu.** Bắt đầu với `features/` + `server/`, tách monorepo khi có
  từ 2 app trở lên hoặc nhiều team.
- Nếu backend phức tạp (như Go/.NET), để Next.js làm **BFF/UI layer**, gọi API qua một client
  có type (OpenAPI codegen hoặc tRPC), còn `server/` trong Next chỉ giữ auth/session và gọi API.

---

## 5. Trạng thái áp dụng trong repo này

Repo hiện là **static export** (`output: "export"`), chưa có DB/backend thật — dữ liệu đi qua
một **mock API layer** (`src/api/`). Vì vậy chỉ áp dụng phần cấu trúc phù hợp; các thư mục
chỉ có nghĩa khi có backend/auth thật thì **chưa tạo** (tránh scaffolding rỗng).

### Đã áp dụng

```
src/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx              # Route group — chỉ lắp ghép feature
│   ├── layout.tsx                # Root layout + metadata (config/site)
│   └── globals.css
├── components/
│   ├── layout/                   # Navbar, Footer
│   └── ui/                       # RevealText, ScrollReveal
├── config/
│   └── site.ts                   # Metadata site dùng chung
├── features/                     # domain modules — public API qua index.ts
│   ├── facilities/               # types.ts · api.ts · index.ts · components/FacilityExplorer
│   ├── vehicles/                 # types.ts · api.ts · index.ts · components/VehicleCatalog
│   ├── rentals/                  # types.ts · api.ts · index.ts · components/{SearchWidget,BookingModal}
│   ├── subscriptions/            # types.ts · api.ts · index.ts · components/SubscriptionPlans
│   ├── inspections/              # types.ts · api.ts · index.ts · components/InspectionShowcase
│   ├── landing/                  # index.ts · components/{Hero,Marquee,WhyChooseUs,HowItWorks,MobileAppSection}
│   └── index.ts
└── api/                          # Mock backend: client + mock handler/store/catalog
```

- `app/(marketing)/page.tsx` chỉ import từ **feature barrel**, không import file nội bộ.
- `features/rentals` là feature dùng chéo: `vehicles` (BookingModal) và `landing` (SearchWidget)
  đều import qua `@/features/rentals`.
- `src/api/index.ts` **không** re-export `@/features` nữa (tránh vòng lặp api ↔ features và
  tránh kéo React component vào tầng data).

### Chưa áp dụng (thêm khi có nhu cầu thật)

| Mục trong guide | Lý do hoãn |
|---|---|
| `server/{db,services,repositories,jobs}` | Chưa có DB/backend; `src/api` đóng vai data layer |
| `features/*/{actions,schemas,hooks}` | Chưa có mutation cần validate / form phức tạp |
| `providers/`, `hooks/`, `types/`, `styles/`, `i18n/` | Chưa có nội dung — tránh thư mục rỗng |
| `middleware.ts` | Chưa có auth/i18n/rate-limit |
| `tests/{unit,integration,e2e}` | Test hiện đặt cạnh code (`src/api/*.test.ts`); **chưa cấu hình test runner** |
| `config/env.ts` | Chưa có biến môi trường runtime cần validate |
| ESLint boundaries | Cần thêm dep (`eslint-plugin-boundaries`) |
| Monorepo Turborepo | Chỉ nên tách khi có ≥ 2 app |
| `Dockerfile` | Deploy hiện tại là Cloudflare static assets |

### Quy ước import (đang dùng)

| Từ | Được import |
|---|---|
| `app/**` | `@/features/*`, `@/components/{layout,ui}/*`, `@/config/*` |
| `features/X/components/**` | nội bộ feature qua đường dẫn tương đối (`../api`, `../types`); feature khác qua `@/features/Y`; UI chung qua `@/components/ui/*` |
| `features/X/api.ts` | `@/api/default-api-client`, `@/api/mock/*` |
| `components/ui`, `config` | không import từ `features` |
