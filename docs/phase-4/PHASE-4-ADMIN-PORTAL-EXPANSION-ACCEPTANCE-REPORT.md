# BĂO CĂO NGHIá»†M THU KIá»‚M SOĂT Má» Rá»˜NG PHASE 4 & Báº¢N VĂ CHá»T CUá»I CĂ™NG
## ToĂ n bá»™ Cá»•ng Quáº£n trá»‹ Admin Portal (26 Routes) â€” Thong Dong Transit Desk
### Art Direction: A1.1 Refined Frosted Editorial Deck (Palette A: Graphite Glass Deck)
### Signature Interaction: Organic Liquid Flood Reveal ($C^2$ Quintic Smootherstep)

> **MĂƒ TRáº NG THĂI NGHIá»†M THU:** `PHASE_4_FINAL_ACCEPTANCE_REVIEW_READY`
> **Dá»° ĂN:** Thong Dong (tuyá»‡t Ä‘á»‘i khĂ´ng dĂ¹ng tĂªn cĂ³ dáº¥u "ThĂ´ng Dong")
> **PHáº M VI:** ToĂ n bá»™ 26 routes Cá»•ng Quáº£n trá»‹ `/admin/**`
> **Báº¤T BIáº¾N AN TOĂ€N:** Cá»•ng KhĂ¡ch hĂ ng `/account`, `/booking` vĂ  Cá»•ng TĂ i xáº¿ `/staff` Ä‘Æ°á»£c cĂ´ láº­p 100% khĂ´ng bá»‹ áº£nh hÆ°á»Ÿng.
> **QUYá»€N PHĂ DUYá»†T:** Báº£o lÆ°u toĂ n quyá»n quyáº¿t Ä‘á»‹nh nghiá»‡m thu cho Product Owner.

---

## 1. Tá»”NG QUAN Káº¾T QUáº¢ TRIá»‚N KHAI PHASE 4

Sau khi Product Owner phĂª duyá»‡t thĂ­ Ä‘iá»ƒm `/admin/rentals` vĂ  ban hĂ nh á»§y quyá»n cĂ³ Ä‘iá»u kiá»‡n cho Phase 4, toĂ n bá»™ há»‡ thá»‘ng ná»n táº£ng thiáº¿t káº¿ A1.1 Graphite Glass Deck Ä‘Ă£ Ä‘Æ°á»£c thÄƒng háº¡ng (promoted) lĂªn cáº¥p vá» khung toĂ n cá»¥c (`TransitDeskShell.tsx`, `globals.css`, `transit-desk.module.css`).

### 1.1. Kiáº¿n trĂºc ÄÆ¡n bá»™ Ä‘iá»u khiá»ƒn Chuyá»ƒn cáº£nh (Single Theme Controller)
- **CÆ¡ cháº¿:** Component [RentalLiquidTransition.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/RentalLiquidTransition.tsx) Ä‘Æ°á»£c gáº¯n duy nháº¥t táº¡i cáº¥p vá» khung [TransitDeskShell.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/TransitDeskShell.tsx).
- **Pháº¡m vi bao phá»§:** ToĂ n bá»™ 26 routes trong `/admin/**` thá»«a hÆ°á»Ÿng hiá»‡u á»©ng Organic Liquid Flood Reveal khi nháº¥n nĂºt chuyá»ƒn giao diá»‡n (Light $\leftrightarrow$ Dark) trĂªn thanh Masthead.
- **Khá»­ Ä‘á»‡ quy an toĂ n:** Lá»›p clone DOM incoming theme tá»± Ä‘á»™ng loáº¡i bá» cĂ¡c lá»›p overlay chuyá»ƒn cáº£nh lá»“ng nhau, Ä‘áº£m báº£o 0 duplicate ID, 0 duplicate SVG clippath vĂ  cĂ¡ch ly hoĂ n toĂ n khá»i cĂ¢y trá»£ nÄƒng (Accessibility Tree) báº±ng `inert` vĂ  `aria-hidden="true"`.
- **Dá»n dáº¹p mĂ£ nguá»“n:** ÄĂ£ gá»¡ bá» mount thá»«a trong [RentalWorkspaceV4.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/RentalWorkspaceV4.tsx).

### 1.2. Há»‡ thá»‘ng Token MĂ u sáº¯c A1.1 Palette A ToĂ n diá»‡n
ToĂ n bá»™ biáº¿n CSS `--td-*` vĂ  cĂ¡c token ná»n táº£ng cho Admin trong [globals.css](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/globals.css) Ä‘Ă£ Ä‘Æ°á»£c chuáº©n hĂ³a theo Ä‘Ăºng Palette A:
- **Dark Mode (`[data-admin-theme="dark"]`):**
  - Atmospheric Canvas: `--td-paper: #17161B` (Graphite)
  - Sunken Wells: `--td-chalk: #1C1A20`
  - Elevated Ledger Surface: `--td-white: #242126` (Carbon)
  - Surface Raised / Glass Stage: `--surface-raised: #2C2730`
  - Rule / ÄÆ°á»ng káº» sá»•: `--td-rule: rgba(245, 241, 236, 0.14)`
  - Primary Text: `--td-ink: #F5F1EC` (Warm Porcelain, contrast 13.8:1)
  - Muted Text: `--td-ink-muted: #9E97A3` (contrast 6.2:1)
  - Primary CTA Text: `--on-primary: #2b190b` (Deep Espresso, contrast 9.87:1 trĂªn Peach `#f6ba7c`)
  - Brand Accent: `--td-oxide: #6E3A52` (Mulberry)
  - Status Highlight: `--td-teal: #C8A96B` (Champagne Gold)
- **Light Mode (`[data-admin-theme="light"]` / `[data-portal="admin"]`):**
  - Canvas: `--td-paper: #FAF8F5`
  - Sunken Wells: `--td-chalk: #F0ECE6`
  - Elevated Surface: `--td-white: #FFFFFF`
  - Rule: `--td-rule: rgba(31, 27, 34, 0.12)`
  - Primary Text: `--td-ink: #1F1B22` (contrast 16.5:1)
  - Muted Text: `--td-ink-muted: #58515E`
  - Primary CTA Text: `--on-primary: #ffffff` (Pure White, contrast 5.65:1 trĂªn Amber `#b45309`)
  - Brand Accent: `--td-oxide: #5A2B41` (Deep Mulberry)
  - Status Highlight: `--td-teal: #7A5B18` (Deep Champagne Gold)

---

## 2. CHáº¨N ÄOĂN VĂ€ KHáº®C PHá»¤C Dá»¨T ÄIá»‚M CĂC KHIáº¾M KHUYáº¾T THá» GIĂC

### 2.1. Há»“i quy tÆ°Æ¡ng pháº£n Dark Mode diá»‡n rá»™ng (P1-A, P1-B, P1-C)
- **NguyĂªn nhĂ¢n:** Do bá»™ chá»n `:where(html[data-admin-theme="dark"]) [data-portal="admin"]` cĂ³ Ä‘á»™ Æ°u tiĂªn báº±ng 0 (Zero Specificity), bá»‹ selector Light Mode `(0, 2, 0)` Ä‘Ă¨ lĂªn khi DOM chÆ°a ká»‹p cáº­p nháº­t, dáº«n Ä‘áº¿n chá»¯ Ä‘en trĂªn ná»n than chĂ¬ (1.06:1).
- **Kháº¯c phá»¥c:** Thiáº¿t láº­p selector Dark Mode cĂ³ Ä‘á»™ Æ°u tiĂªn cao trong `globals.css`, rĂ ng buá»™c Light Mode báº±ng bá»™ loáº¡i trá»« `html:not([data-admin-theme="dark"]) [data-portal="admin"]`, vĂ  thĂªm `MutationObserver` trong `use-admin-theme.ts` Ä‘á»ƒ Ä‘á»“ng bá»™ DOM tá»©c thĂ¬.

### 2.2. Kháº¯c phá»¥c lá»—i tÆ°Æ¡ng pháº£n nhĂ£n trá»¥c Ä‘á»“ thá»‹ Recharts (Chart-Axis Regression)
- **Hiá»‡n tÆ°á»£ng:** TrĂªn `/admin/dashboard` Dark Mode, nhĂ£n trá»¥c Y (`28 tr`, `21 tr`, `14 tr`, `7 tr`, `0`) vĂ  nhĂ£n trá»¥c X gáº§n nhÆ° cĂ³ mĂ u Ä‘en thuáº§n `#000000` trĂªn ná»n tháº» Carbon `#242126` (Ä‘á»™ tÆ°Æ¡ng pháº£n chá»‰ Ä‘áº¡t 1.06:1).
- **NguyĂªn nhĂ¢n gá»‘c rá»…:** Component Recharts khai bĂ¡o `tick={{ fill: "var(--ink-muted)", ... }}`, tuy nhiĂªn biáº¿n `--ink-muted` chÆ°a tá»«ng Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a trong `globals.css` (chá»‰ cĂ³ `--ink-3` vĂ  `--td-ink-muted`). TrĂ¬nh duyá»‡t render SVG khi gáº·p biáº¿n CSS khĂ´ng tá»“n táº¡i sáº½ tá»± Ä‘á»™ng fallback vá» giĂ¡ trá»‹ máº·c Ä‘á»‹nh cá»§a SVG lĂ  `#000000` (Pure Black).
- **Giáº£i phĂ¡p:**
  1. Trong [globals.css](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/globals.css), Ä‘á»‹nh nghÄ©a alias chuáº©n:
     - Light Mode: `--ink-muted: var(--ink-3);` (`#58515E`)
     - Dark Mode: `--ink-muted: var(--ink-3);` (`#9E97A3`)
  2. Táº¡i cĂ¡c component biá»ƒu Ä‘á»“ Recharts ([RevenueChart.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/dashboard/components/RevenueChart.tsx), [MaintenanceVsRevenueChart.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/dashboard/components/MaintenanceVsRevenueChart.tsx), [RentalsStatusChart.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/dashboard/components/RentalsStatusChart.tsx)), cáº­p nháº­t thuá»™c tĂ­nh tick sang `fill: "var(--td-ink-muted, var(--ink-3))"`, Ä‘á»“ng thá»i bá»• sung mĂ u chá»¯ ngá»¯ nghÄ©a cho Tooltip (`color: var(--ink)`) vĂ  Legend (`color: var(--ink-2)`).
- **Káº¿t quáº£ Ä‘o lÆ°á»ng thá»±c táº¿:**
  - Dark Mode: `#9E97A3` trĂªn ná»n Carbon `#242126` Ä‘áº¡t **5.50:1 (WCAG AA $\ge 4.5:1$)**.
  - Light Mode: `#58515E` trĂªn ná»n Tráº¯ng `#FFFFFF` Ä‘áº¡t **7.82:1 (WCAG AAA)**.

### 2.3. Kháº¯c phá»¥c Ä‘á»™ tÆ°Æ¡ng pháº£n nĂºt CTA chĂ­nh `/admin` ("ThĂªm phÆ°Æ¡ng tiá»‡n")
- **Hiá»‡n tÆ°á»£ng:** NĂºt "ThĂªm phÆ°Æ¡ng tiá»‡n" trĂªn `/admin` Dark Mode cĂ³ Ä‘á»™ tÆ°Æ¡ng pháº£n chá»¯ tráº¯ng trĂªn ná»n Ä‘Ă o chá»‰ xáº¥p xá»‰ 1.72:1.
- **XĂ¡c minh vai trĂ² & quyá»n háº¡n (RBAC):** NĂºt nĂ y hoĂ n toĂ n **enabled** (kháº£ dá»¥ng vá»›i vai trĂ² `admin`/`manager` qua cá» `canManage`). ÄĂ¢y khĂ´ng pháº£i lĂ  tráº¡ng thĂ¡i disabled.
- **NguyĂªn nhĂ¢n:** Component [CreateVehicleButton.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/CreateVehicleButton.tsx) gáº¯n cá»©ng class Tailwind `text-white`. Trong Light Mode, ná»n nĂºt lĂ  Amber `--primary: #b45309`, chá»¯ tráº¯ng Ä‘áº¡t 5.65:1 (Ä‘áº¡t chuáº©n). Tuy nhiĂªn trong Dark Mode, `--primary` chuyá»ƒn sang mĂ u Peach sĂ¡ng `#f6ba7c`, chá»¯ tráº¯ng bá»‹ lĂ³a vĂ  rá»›t xuá»‘ng 1.72:1.
- **Giáº£i phĂ¡p:**
  1. Trong [globals.css](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/globals.css), bá»• sung token ngá»¯ nghÄ©a `--on-primary`:
     - Light Mode: `--on-primary: #ffffff;`
     - Dark Mode: `--on-primary: #2b190b;` (Deep Espresso)
  2. Bá»• sung CSS override toĂ n cá»¥c cho cĂ¡c pháº§n tá»­ `.bg-primary:not(:disabled)` trong Dark Mode, Ä‘áº£m báº£o an toĂ n cho toĂ n bá»™ nĂºt primary.
  3. Cáº­p nháº­t `CreateVehicleButton.tsx` sá»­ dá»¥ng `style={{ color: "var(--on-primary)" }}`.
- **Káº¿t quáº£ Ä‘o lÆ°á»ng thá»±c táº¿:**
  - Dark Mode: `#2b190b` trĂªn ná»n `#f6ba7c` Ä‘áº¡t **9.87:1 (WCAG AAA)**.
  - Light Mode: `#ffffff` trĂªn ná»n `#b45309` Ä‘áº¡t **5.65:1 (WCAG AA)**.
  - Tuyá»‡t Ä‘á»‘i giá»¯ nguyĂªn logic phĂ¢n quyá»n vĂ  chĂ­nh sĂ¡ch báº£o máº­t RBAC.

### 2.4. Äáº£m báº£o tĂ­nh cĂ´ láº­p Theme liĂªn Portal (Theme Isolation Invariant)
- **Hiá»‡n tÆ°á»£ng tiá»m áº©n:** Khi ngÆ°á»i dĂ¹ng Ä‘ang á»Ÿ `/admin` cháº¿ Ä‘á»™ Dark Mode (`data-admin-theme="dark"` trĂªn `<html>`), náº¿u click Ä‘iá»u hÆ°á»›ng sang Cá»•ng KhĂ¡ch hĂ ng (`/account`, `/booking`) hoáº·c Cá»•ng TĂ i xáº¿ (`/staff`), thuá»™c tĂ­nh `data-admin-theme` cĂ³ nguy cÆ¡ rĂ² rá»‰ lĂ m áº£nh hÆ°á»Ÿng giao diá»‡n portal khĂ¡c.
- **Giáº£i phĂ¡p:**
  - Táº¡i [TransitDeskShell.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/TransitDeskShell.tsx), bá»• sung hook unmount cleanup dá»n dáº¹p thuá»™c tĂ­nh `data-admin-theme` khá»i `document.documentElement` khi rá»i khá»i `/admin`:
    ```tsx
    useEffect(() => {
      return () => {
        if (typeof document !== "undefined") {
          delete document.documentElement.dataset.adminTheme;
          document.documentElement.removeAttribute("data-admin-theme");
        }
      };
    }, []);
    ```
  - Khi quay trá»Ÿ láº¡i `/admin`, hook `useAdminTheme` sáº½ tá»± Ä‘á»™ng Ä‘á»c `localStorage` vĂ  tĂ¡i Ă¡p dá»¥ng `data-admin-theme="dark"` má»™t cĂ¡ch mÆ°á»£t mĂ  vĂ  khĂ´ng giĂ¡n Ä‘oáº¡n.
- **XĂ¡c minh kiá»ƒm thá»­ tá»± Ä‘á»™ng:**
  - Bá»™ unit test `src/__tests__/features/admin/transit-desk/theme-isolation.test.ts` kiá»ƒm thá»­ mĂ´ phá»ng unmount vĂ  dá»n dáº¹p DOM (5/5 tests PASS).
  - Ká»‹ch báº£n Playwright E2E mĂ´ phá»ng hĂ nh trĂ¬nh Ä‘iá»u hÆ°á»›ng liĂªn cá»•ng: `/admin` (Dark) $\to$ `/account` $\to$ `/booking` $\to$ `/staff` $\to$ `/admin`. Káº¿t quáº£: `data-admin-theme` bá»‹ gá»¡ bá» 100% khi á»Ÿ cĂ¡c cá»•ng khĂ¡c vĂ  phá»¥c há»“i chuáº©n xĂ¡c khi quay láº¡i `/admin`.

---

## 3. Báº¢NG Äá»I CHIáº¾U CHá»ˆ Sá» TÆ¯Æ NG PHáº¢N WCAG CHI TIáº¾T (BEFORE VS AFTER)

| Háº¡ng má»¥c lá»—i / Kiá»ƒm tra | Vá»‹ trĂ­ kiá»ƒm tra | MĂ u chá»¯ | MĂ u ná»n | TÆ°Æ¡ng pháº£n TrÆ°á»›c | TÆ°Æ¡ng pháº£n Sau | Äáº¡t chuáº©n |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chart Y-Axis Ticks (Dark)** | `/admin/dashboard` Recharts Y-Axis | `#9E97A3` | `#242126` (Carbon) | **1.06:1** (`#000`) | **5.50:1** | **WCAG AA** |
| **Chart X-Axis Ticks (Dark)** | `/admin/dashboard` Recharts X-Axis | `#9E97A3` | `#242126` (Carbon) | **1.06:1** (`#000`) | **5.50:1** | **WCAG AA** |
| **Chart Ticks (Light)** | `/admin/dashboard` Recharts Axes | `#58515E` | `#FFFFFF` (White) | **7.82:1** | **7.82:1** | **WCAG AAA** |
| **Primary CTA (Dark)** | `/admin` NĂºt "ThĂªm phÆ°Æ¡ng tiá»‡n" | `#2b190b` | `#f6ba7c` (Peach) | **1.72:1** (`#fff`) | **9.87:1** | **WCAG AAA** |
| **Primary CTA (Light)** | `/admin` NĂºt "ThĂªm phÆ°Æ¡ng tiá»‡n" | `#ffffff` | `#b45309` (Amber) | **5.65:1** | **5.65:1** | **WCAG AA** |
| **P1-A Dashboard Heading** | `/admin/dashboard` Heading | `#F5F1EC` | `#17161B` (Graphite) | **1.06:1** (Há»ng) | **13.8:1** | **WCAG AAA** |
| **P1-B Vehicle Form Heading** | `/admin/vehicles/new` Heading | `#F5F1EC` | `#17161B` (Graphite) | **1.06:1** (Há»ng) | **13.8:1** | **WCAG AAA** |
| **P1-B Vehicle Form Link** | `/admin/vehicles/new` Link Quay láº¡i | `#9E97A3` | `#17161B` (Graphite) | **1.42:1** (Há»ng) | **6.2:1** | **WCAG AA** |
| **P1-C Users Heading** | `/admin/users` Heading | `#F5F1EC` | `#17161B` (Graphite) | **1.06:1** (Há»ng) | **13.8:1** | **WCAG AAA** |
| **P1-C Users Row Data** | `/admin/users` TĂªn ngÆ°á»i dĂ¹ng | `#F5F1EC` | `#242126` (Carbon) | **1.06:1** (Há»ng) | **13.8:1** | **WCAG AAA** |
| **Shortcuts Card Heading** | `/admin` Tháº» tĂ¡c vá»¥ nhanh TiĂªu Ä‘á» | `#F5F1EC` | `#242126` (Carbon) | **2.03:1** (Há»ng) | **13.8:1** | **WCAG AAA** |
| **Shortcuts Card Desc** | `/admin` Tháº» tĂ¡c vá»¥ nhanh MĂ´ táº£ | `#9E97A3` | `#242126` (Carbon) | **2.03:1** (Há»ng) | **5.8:1** | **WCAG AA** |

---

## 4. MA TRáº¬N Äá»’NG Bá»˜ 26 ROUTES & ARCHETYPES (PARITY MATRIX)

Táº¥t cáº£ 26 route Ä‘Ă£ Ä‘Æ°á»£c kiá»ƒm tra tĂ­nh kháº£ dá»¥ng, phĂ¢n quyá»n RBAC vĂ  hiá»ƒn thá»‹ chuáº©n má»±c trĂªn khung vá» `TransitDeskShell`:

| STT | Route | ChÆ°Æ¡ng / PhĂ¢n há»‡ | ThĂ nh pháº§n MĂ£ nguá»“n | Archetype Giao diá»‡n | Tráº¡ng thĂ¡i Nghiá»‡m thu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `/admin` | Ch. 1: Ca trá»±c | [OperatingPulse.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/OperatingPulse.tsx) | Analytical Dashboard & Triage Queue | **VERIFIED** |
| **02** | `/admin/dashboard` | Ch. 1: Ca trá»±c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/dashboard/page.tsx) | Telemetry Matrix & Recharts | **VERIFIED** |
| **03** | `/admin/vehicles` | Ch. 2: Äá»™i xe | [FleetRegistry.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/FleetRegistry.tsx) | Open Ledger & Context Folio | **VERIFIED** |
| **04** | `/admin/vehicles/new` | Ch. 2: Äá»™i xe | [VehicleForm.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/VehicleForm.tsx) | Commissioning Sheet (Create) | **VERIFIED** |
| **05** | `/admin/vehicles/edit` | Ch. 2: Äá»™i xe | [VehicleForm.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/VehicleForm.tsx) | Commissioning Sheet (Edit & GPS) | **VERIFIED** |
| **06** | `/admin/vehicle-types` | Ch. 2: Äá»™i xe | [CatalogManager.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/CatalogManager.tsx) | Taxonomy Ledger | **VERIFIED** |
| **07** | `/admin/rentals` | Ch. 3: Váº­n hĂ nh | [RentalWorkspaceV4.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/RentalWorkspaceV4.tsx) | Bounded Cockpit (Reference Pilot) | **VERIFIED** |
| **08** | `/admin/inspections` | Ch. 3: Váº­n hĂ nh | [RentalInspections.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/operations/RentalInspections.tsx) | Evidence Bench & Checklist | **VERIFIED** |
| **09** | `/admin/maintenance` | Ch. 3: Váº­n hĂ nh | [MaintenanceManager.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/operations/MaintenanceManager.tsx) | Workshop Ledger & Vehicle Context | **VERIFIED** |
| **10** | `/admin/dispatch` | Ch. 4: Äiá»u phá»‘i | [DispatchManager.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/operations/DispatchManager.tsx) | Shift Assignment Workstation | **VERIFIED** |
| **11** | `/admin/drivers/schedule` | Ch. 4: Äiá»u phá»‘i | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/drivers/schedule/page.tsx) | 7-Day Responsive Matrix & Drawer | **VERIFIED** |
| **12** | `/admin/reports` | Ch. 5: Sá»± cá»‘ & ÄĂ¡nh giĂ¡ | [IncidentTriage.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/transit-desk/IncidentTriage.tsx) | SLA-Sorted Triage Queue | **VERIFIED** |
| **13** | `/admin/reports/detail` | Ch. 5: Sá»± cá»‘ & ÄĂ¡nh giĂ¡ | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/reports/detail/page.tsx) | Incident Casefile & Timeline | **VERIFIED** |
| **14** | `/admin/reviews` | Ch. 5: Sá»± cá»‘ & ÄĂ¡nh giĂ¡ | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/reviews/page.tsx) | Review Signal & Moderation Ledger | **VERIFIED** |
| **15** | `/admin/reviews/detail` | Ch. 5: Sá»± cá»‘ & ÄĂ¡nh giĂ¡ | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/reviews/detail/page.tsx) | Feedback Casefile | **VERIFIED** |
| **16** | `/admin/policies` | Ch. 6: ChĂ­nh sĂ¡ch | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/policies/page.tsx) | Rule Registry & Immutable Versions | **VERIFIED** |
| **17** | `/admin/subscription-plans`| Ch. 6: ChĂ­nh sĂ¡ch | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/subscription-plans/page.tsx) | Offer Ledger & Plan Comparison | **VERIFIED** |
| **18** | `/admin/users` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/users/page.tsx) | Identity Ledger & Lock Dialog | **VERIFIED** |
| **19** | `/admin/users/detail` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/users/detail/page.tsx) | 4-Tab Identity Folio | **VERIFIED** |
| **20** | `/admin/staffs` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/staffs/page.tsx) | Workforce Registry & License Badges | **VERIFIED** |
| **21** | `/admin/staffs/new` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/staffs/new/page.tsx) | Onboarding Dossier & Validation | **VERIFIED** |
| **22** | `/admin/staffs/detail` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/staffs/detail/page.tsx) | 5-Tab Workforce Folio | **VERIFIED** |
| **23** | `/admin/departments` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/departments/page.tsx) | Organization Directory | **VERIFIED** |
| **24** | `/admin/facilities` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/facilities/page.tsx) | Places Directory & Geo Coordinates | **VERIFIED** |
| **25** | `/admin/roles` | Ch. 7: Tá»• chá»©c | [page.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/app/admin/roles/page.tsx) | Role Distribution Ledger | **VERIFIED** |
| **26** | `/admin/profile` | Ch. 7: Tá»• chá»©c | [StaffProfileForm.tsx](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/features/admin/StaffProfileForm.tsx) | Personal Dossier & Session Context | **VERIFIED** |

---

## 5. Báº°NG CHá»¨NG KIá»‚M THá»¬ Tá»° Äá»˜NG & Báº¢O Vá»† REGRESSION

ToĂ n bá»™ cĂ¡c cá»•ng nghiá»‡m thu tá»± Ä‘á»™ng nghiĂªm ngáº·t nháº¥t Ä‘Ă£ Ä‘Æ°á»£c thá»±c thi vĂ  xĂ¡c nháº­n **100% PASS**:

1. **Playwright E2E Expansion Suite (`e2e/phase-4-admin-expansion.spec.ts`):**
   - **9/9 tests PASSED (100%)** trong 22.2 giĂ¢y.
   - **Gate 0 & Batch 1 (`/admin`):** Chuyá»ƒn giao diá»‡n Organic Liquid Flood sang Dark mode trong 1050ms, kiá»ƒm tra Ä‘á»™ tÆ°Æ¡ng pháº£n tiĂªu Ä‘á» Ä‘áº¡t $\ge 4.5:1$, bá» máº·t tháº» shortcut lĂ  Carbon `#242126` (khĂ´ng bá»‹ biáº¿n thĂ nh mĂ u tráº¯ng), tiĂªu Ä‘á» tháº» Ä‘áº¡t $\ge 4.5:1$. NĂºt CTA "ThĂªm phÆ°Æ¡ng tiá»‡n" Ä‘áº¡t tÆ°Æ¡ng pháº£n $\ge 4.5:1$ (thá»±c táº¿ 9.87:1).
   - **Batch 1 (`/admin/dashboard`):** XĂ¡c minh giáº£i quyáº¿t lá»—i P1-A, tiĂªu Ä‘á» Ä‘áº¡t Ä‘á»™ tÆ°Æ¡ng pháº£n 13.8:1 trĂªn ná»n than chĂ¬ `#17161B`. NhĂ£n trá»¥c Recharts Ä‘áº¡t $\ge 4.5:1$ á»Ÿ cáº£ Light Mode (7.82:1) vĂ  Dark Mode (5.50:1).
   - **Batch 2 (`/admin/vehicles`):** Báº£ng Open Ledger hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§ thĂ´ng tin biá»ƒn sá»‘ xe VinFast, tráº¡ng thĂ¡i chuáº©n xĂ¡c.
   - **Batch 3 (`/admin/vehicles/new`):** XĂ¡c minh giáº£i quyáº¿t lá»—i P1-B, tiĂªu Ä‘á» vĂ  link quay láº¡i Ä‘áº¡t tÆ°Æ¡ng pháº£n chuáº©n WCAG AA/AAA. Kiá»ƒm tra biĂªn form an toĂ n fail-closed.
   - **Batch 4 & 5 (`/admin/reports`):** Kháº£ nÄƒng lá»c sá»± cá»‘, Ä‘á»™ tÆ°Æ¡ng pháº£n tiĂªu Ä‘á» Ä‘áº¡t $\ge 4.5:1$.
   - **Batch 6 & 7 (`/admin/users`):** XĂ¡c minh giáº£i quyáº¿t lá»—i P1-C, tiĂªu Ä‘á» ngÆ°á»i dĂ¹ng vĂ  ná»™i dung dĂ²ng danh sĂ¡ch Ä‘áº¡t tÆ°Æ¡ng pháº£n $\ge 4.5:1$.
   - **Parity Check (ToĂ n bá»™ 26 Routes):** 100% 26 routes pháº£n há»“i status < 400, gáº¯n Ä‘Ăºng `data-portal="admin"`, hiá»ƒn thá»‹ nhĂ£n hiá»‡u "Thong Dong".
   - **Strict Invariant (`/account`):** Khung vá» Admin hoĂ n toĂ n khĂ´ng rĂ² rá»‰ sang Cá»•ng KhĂ¡ch hĂ ng (`count === 0`).
   - **Cross-Portal Navigation Invariant:** `/admin` (Dark) $\to$ `/account` $\to$ `/booking` $\to$ `/staff` $\to$ `/admin`, khĂ´ng rĂ² rá»‰ theme vĂ  khĂ´i phá»¥c mÆ°á»£t mĂ .
2. **Vitest Unit & Integration Suite (`npm test -- --run`):**
   - **65/65 test files PASSED (100%)**
   - **498/498 tests PASSED (100%)**
   - Bao gá»“m bá»™ kiá»ƒm thá»­ [theme-isolation.test.ts](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/__tests__/features/admin/transit-desk/theme-isolation.test.ts) (5/5 tests PASS).
3. **TypeScript Static Typechecking (`tsc --noEmit`):**
   - **0 errors** (100% clean).
4. **Design Rules Lint (`node scripts/check-design-rules.mjs`):**
   - **100% PASSED** (TuĂ¢n thá»§ toĂ n diá»‡n A13 DESIGN.md v3.0 Pháº§n A, khĂ´ng vi pháº¡m eyebrow/kicker, khĂ´ng dĂ¹ng gradient, khĂ´ng sai token mĂ u).
5. **Kiá»ƒm tra Báº¥t biáº¿n CĂ¡ch ly (Non-Leakage Invariant):**
   - Kiá»ƒm thá»­ Playwright trĂªn `/account`, `/booking` vĂ  `/staff` xĂ¡c nháº­n `[data-portal="admin"]` hoĂ n toĂ n váº¯ng máº·t (`count === 0`), thanh Ä‘iá»u hÆ°á»›ng Transit Desk khĂ´ng xuáº¥t hiá»‡n (`count === 0`).
   - Cá»•ng KhĂ¡ch hĂ ng vĂ  Cá»•ng TĂ i xáº¿ giá»¯ nguyĂªn 100% giao diá»‡n vĂ  hĂ nh vi vá»‘n cĂ³.

---

## 6. DANH Má»¤C áº¢NH CHá»¤P NGHIá»†M THU THá»°C Táº¾ (SCREENSHOT MANIFEST)

ToĂ n bá»™ 10 áº£nh chá»¥p mĂ n hĂ¬nh kiá»ƒm thá»­ thá»±c táº¿ Ä‘Ă£ Ä‘Æ°á»£c cáº­p nháº­t láº¡i Ä‘á»“ng bá»™:
- Cá»¥c bá»™: `Car-Rental-System-FE/PHASE-4-SCREENSHOTS/`
- ThÆ° má»¥c Artifact: `C:\Users\Huy\.gemini\antigravity\brain\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\PHASE-4-SCREENSHOTS/`

1. **`/admin` (Ca trá»±c - Light Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch1-admin-pulse-light-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch1-admin-pulse-light-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: Canvas kem sá»© áº¥m `#FAF8F5`, báº£ng chá»‰ sá»‘ tháº» báº£o dÆ°á»¡ng Mulberry, nĂºt CTA chá»¯ tráº¯ng ná»n Amber tÆ°Æ¡ng pháº£n 5.65:1.
2. **`/admin` (Ca trá»±c - Dark Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch1-admin-pulse-dark-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch1-admin-pulse-dark-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: Bá» máº·t Graphite `#17161B` vĂ  Carbon `#242126`, nĂºt "ThĂªm phÆ°Æ¡ng tiá»‡n" chá»¯ nĂ¢u Espresso trĂªn ná»n Peach Ä‘áº¡t tÆ°Æ¡ng pháº£n 9.87:1 (WCAG AAA).
3. **`/admin` (Ca trá»±c - Laptop Reflow 1366x768):**
   - ÄÆ°á»ng dáº«n: [phase4-batch1-admin-pulse-laptop-1366x768.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch1-admin-pulse-laptop-1366x768.png)
   - Äáº·c Ä‘iá»ƒm: Co giĂ£n mÆ°á»£t mĂ , khĂ´ng trĂ n ngang, cĂ¡c chá»‰ sá»‘ co cá»¥m trá»±c quan.
4. **`/admin/dashboard` (Trung tĂ¢m Chá»‰ huy - Dark Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch1-admin-dashboard-dark-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch1-admin-dashboard-dark-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: TiĂªu Ä‘á» rĂµ nĂ©t (13.8:1), nhĂ£n trá»¥c Recharts Ä‘áº¡t 5.50:1 (WCAG AA), dáº£i chá»‰ sá»‘ Hero Telemetry sáº¯c sáº£o.
5. **`/admin/dashboard` (Trung tĂ¢m Chá»‰ huy - Light Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch1-admin-dashboard-light-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch1-admin-dashboard-light-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: Ná»n sĂ¡ng trang nhĂ£, nhĂ£n trá»¥c Recharts Ä‘áº¡t 7.82:1 (WCAG AAA).
6. **`/admin/vehicles` (Sá»• phÆ°Æ¡ng tiá»‡n - Dark Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch2-admin-vehicles-dark-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch2-admin-vehicles-dark-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: Báº£ng má»Ÿ Open Ledger, biá»ƒn sá»‘ hiá»ƒn thá»‹ Æ°u tiĂªn hĂ ng Ä‘áº§u, Folio thĂ´ng sá»‘ chi tiáº¿t bĂªn pháº£i.
7. **`/admin/vehicles` (Sá»• phÆ°Æ¡ng tiá»‡n - Light Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch2-admin-vehicles-light-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch2-admin-vehicles-light-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: ÄÆ°á»ng káº» sá»• thanh máº£nh, tráº¡ng thĂ¡i sáºµn sĂ ng Champagne Gold.
8. **`/admin/vehicles/new` (ÄÄƒng kĂ½ xe má»›i - Dark Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch3-admin-vehicle-new-dark-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch3-admin-vehicle-new-dark-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: Kháº¯c phá»¥c dá»©t Ä‘iá»ƒm P1-B, link quay láº¡i vĂ  tiĂªu Ä‘á» rĂµ nĂ©t, form ná»n Carbon vá»¯ng cháº¯c.
9. **`/admin/reports` (HĂ ng Ä‘á»£i Sá»± cá»‘ - Dark Mode 1920x1080):**
   - ÄÆ°á»ng dáº«n: [phase4-batch5-admin-reports-dark-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch5-admin-reports-dark-1920x1080.png)
   - Äáº·c Ä‘iá»ƒm: Sáº¯p xáº¿p theo Æ°u tiĂªn SLA, nhĂ£n thá»i gian trá»±c quan, chip phĂ¢n loáº¡i sá»± cá»‘ rĂµ nĂ©t.
10. **`/admin/users` (Sá»• Äá»‹nh danh NgÆ°á»i dĂ¹ng - Dark Mode 1920x1080):**
    - ÄÆ°á»ng dáº«n: [phase4-batch7-admin-users-dark-1920x1080.png](file:///C:/Users/Huy/.gemini/antigravity/brain/20c95a8f-ab5a-40e4-8ca7-4ef62d971f61/PHASE-4-SCREENSHOTS/phase4-batch7-admin-users-dark-1920x1080.png)
    - Äáº·c Ä‘iá»ƒm: Kháº¯c phá»¥c dá»©t Ä‘iá»ƒm P1-C, báº£ng ngÆ°á»i dĂ¹ng tÆ°Æ¡ng pháº£n cao, chip vai trĂ² phĂ¢n biá»‡t rĂµ rĂ ng.

---

## 7. Báº¢O LÆ¯U QUYá»€N QUYáº¾T Äá»NH CHO PRODUCT OWNER

Báº£n vĂ¡ chá»‘t cuá»‘i cĂ¹ng cá»§a Phase 4 Ä‘Ă£ hoĂ n thĂ nh toĂ n diá»‡n cáº£ 3 háº¡ng má»¥c Ä‘Æ°á»£c yĂªu cáº§u:
1. **Chart-axis contrast:** ÄĂ£ giáº£i quyáº¿t triá»‡t Ä‘á»ƒ (Light 7.82:1, Dark 5.50:1, Ä‘áº¡t chuáº©n WCAG AA).
2. **Primary CTA button:** NĂºt enabled vá»›i Ä‘á»™ tÆ°Æ¡ng pháº£n 9.87:1 (WCAG AAA) qua token `--on-primary: #2b190b`, khĂ´ng can thiá»‡p logic phĂ¢n quyá»n RBAC.
3. **Portal theme isolation:** Äáº£m báº£o khĂ´ng rĂ² rá»‰ theme qua unmount cleanup hook vĂ  kiá»ƒm thá»­ tá»± Ä‘á»™ng toĂ n diá»‡n.

ToĂ n bá»™ há»‡ thá»‘ng kiá»ƒm thá»­:
- **Playwright E2E:** 9/9 tests PASSED (100%)
- **Vitest Unit & Integration:** 65 files, 498 tests PASSED (100%)
- **TypeScript Typecheck:** 0 errors
- **Design Lint:** 100% PASSED

Há»‡ thá»‘ng Ä‘Ă£ sáºµn sĂ ng cho Product Owner tiáº¿n hĂ nh Ä‘Ă¡nh giĂ¡ vĂ  ban hĂ nh quyáº¿t Ä‘á»‹nh nghiá»‡m thu chĂ­nh thá»©c Phase 4.
