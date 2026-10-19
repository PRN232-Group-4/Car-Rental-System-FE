# Báº¢NG KIá»‚M TRA TĂNH Sáº´N SĂ€NG PHĂT HĂ€NH (RELEASE READINESS CHECKLIST)
## PhĂ¢n há»‡ Quáº£n trá»‹ Thong Dong Transit Desk â€” Phase 4 Admin Expansion
### Äá»™c láº­p vá»›i Quyáº¿t Ä‘á»‹nh Nghiá»‡m thu Thiáº¿t káº¿ (Separate from Design Acceptance)

> **Káº¾T QUáº¢ CUá»I CĂ™NG:** `READY_FOR_RELEASE_AUTHORIZATION`
> **Dá»° ĂN:** Thong Dong
> **TRáº NG THĂI HIá»†N Táº I:** Äá»§ Ä‘iá»u kiá»‡n ká»¹ thuáº­t Ä‘á»ƒ Ä‘á» xuáº¥t á»§y quyá»n phĂ¡t hĂ nh; **chá» Product Owner phĂª chuáº©n release**.
> **THá»œI ÄIá»‚M ÄĂNH GIĂ:** 2026-10-19T23:45:00+07:00 (GMT+7)

---

## 1. Má»¤C TIĂU VĂ€ NGUYĂN Táº®C ÄĂNH GIĂ

Viá»‡c Product Owner vĂ  Reviewer phĂª chuáº©n nghiá»‡m thu thiáº¿t káº¿ UI/UX (`PHASE_4_UIUX_ACCEPTED_BY_REVIEWER`) lĂ  Ä‘iá»u kiá»‡n cáº§n nhÆ°ng chÆ°a Ä‘á»§ Ä‘á»ƒ Ä‘Æ°a vĂ o mĂ´i trÆ°á»ng Production.

Báº£ng kiá»ƒm tra nĂ y Ä‘Ă¡nh giĂ¡ Ä‘á»™c láº­p 10 Ä‘iá»u kiá»‡n tiĂªn quyáº¿t vá» ká»¹ thuáº­t, Ä‘á»™ á»•n Ä‘á»‹nh, tĂ­nh báº£o máº­t, vĂ  kháº£ nÄƒng váº­n hĂ nh trÆ°á»›c khi ban hĂ nh quyáº¿t Ä‘á»‹nh phĂ¡t hĂ nh chĂ­nh thá»©c.

---

## 2. MA TRáº¬N 10 TIĂU CHĂ TIĂN QUYáº¾T PHĂT HĂ€NH (RELEASE PREREQUISITES)

| STT | TiĂªu chĂ­ TiĂªn quyáº¿t | Báº±ng chá»©ng Ká»¹ thuáº­t Thá»±c táº¿ | Tráº¡ng thĂ¡i ÄĂ¡nh giĂ¡ | Ghi chĂº & RĂ ng buá»™c |
| :---: | :--- | :--- | :---: | :--- |
| **01** | **BiĂªn dá»‹ch Production Build** | `npm run build` (Next.js 16.3.8 Turbopack) hoĂ n táº¥t thĂ nh cĂ´ng. BiĂªn dá»‹ch trong 7.2s, táº¡o 256/256 trang tÄ©nh vĂ  SSG trong 5.4s, 0 lá»—i. | **VERIFIED (PASS)** | ToĂ n bá»™ 26 routes admin Ä‘á»u Ä‘Æ°á»£c táº¡o static HTML thĂ nh cĂ´ng. |
| **02** | **Kiá»ƒm tra Kiá»ƒu tÄ©nh & Lint** | `npm run typecheck` (`tsc --noEmit`) Ä‘áº¡t 0 errors. `node scripts/check-design-rules.mjs` Ä‘áº¡t 100% tuĂ¢n thá»§ DESIGN.md v3.0 Pháº§n A. | **VERIFIED (PASS)** | KhĂ´ng vi pháº¡m quy táº¯c typography, mĂ u sáº¯c, hay cáº¥u trĂºc tháº» lá»“ng tháº». |
| **03** | **Bá»™ Kiá»ƒm thá»­ Há»“i quy Unit/Integration** | `npm test -- --run` thá»±c thi 65/65 test files, **498/498 tests PASSED** trong 13.79s. Bao gá»“m suite cĂ´ láº­p theme [theme-isolation.test.ts](file:///d:/school/Sem%208/PRN232/GroupProject/Thong_Dong/Car-Rental-System-FE/src/__tests__/features/admin/transit-desk/theme-isolation.test.ts). | **VERIFIED (PASS)** | ToĂ n bá»™ cĂ¡c quy táº¯c tĂ­nh toĂ¡n, Ä‘á»‹nh dáº¡ng tiá»n tá»‡ VND, vĂ  mappers Ä‘á»u giá»¯ vá»¯ng tĂ­nh toĂ n váº¹n. |
| **04** | **Phá»§ sĂ³ng Kiá»ƒm thá»­ Playwright E2E** | `npx playwright test e2e/phase-4-admin-expansion.spec.ts` Ä‘áº¡t **9/9 tests PASSED** trong 22.2s. | **VERIFIED (PASS)** | **Giá»›i háº¡n:** Bá»™ test cháº¡y trĂªn mock handlers client-side. KhĂ´ng bao hĂ m giao dá»‹ch ngĂ¢n hĂ ng tháº­t hay thiáº¿t bá»‹ GPS váº­t lĂ½. |
| **05** | **BiĂªn PhĂ¢n quyá»n & Báº£o máº­t (RBAC)** | `AuthGate` kiá»ƒm soĂ¡t nghiĂªm ngáº·t `STAFF_PORTAL_ROLES`. NĂºt hĂ nh Ä‘á»™ng nháº¡y cáº£m nhÆ° `CreateVehicleButton` báº£o vá»‡ bá»Ÿi `canManage` (chá»‰ `Admin`/`Manager`). | **VERIFIED (PASS)** | Kiá»ƒm thá»­ adversarial boundary xĂ¡c nháº­n truy cáº­p trĂ¡i phĂ©p bá»‹ Ä‘iá»u hÆ°á»›ng vá» login portal chuáº©n xĂ¡c. |
| **06** | **TĂ­nh ToĂ n váº¹n Há»£p Ä‘á»“ng API & Mutation** | ToĂ n bá»™ API queries vĂ  mutations trong `src/features/operations/api.ts` vĂ  `src/features/admin/api.ts` giá»¯ nguyĂªn schema, method, headers vĂ  tham sá»‘ URL. | **VERIFIED (PASS)** | PhĂ²ng thá»§ an toĂ n: `notifyApiError` xá»­ lĂ½ báº¯t lá»—i mutation 100% khĂ´ng lĂ m crash giao diá»‡n. |
| **07** | **CĂ´ láº­p Theme LiĂªn Portal (Zero Leakage)** | `TransitDeskShell.tsx` trang bá»‹ hook unmount cleanup: `delete document.documentElement.dataset.adminTheme`. | **VERIFIED (PASS)** | Kiá»ƒm thá»­ Playwright Test 8 vĂ  9 xĂ¡c minh Cá»•ng KhĂ¡ch hĂ ng (`/account`, `/booking`) vĂ  Cá»•ng TĂ i xáº¿ (`/staff`) hoĂ n toĂ n khĂ´ng bá»‹ áº£nh hÆ°á»Ÿng. |
| **08** | **MĂ´i trÆ°á»ng & Cáº¥u hĂ¬nh PhĂ¡t hĂ nh** | á»¨ng dá»¥ng tÆ°Æ¡ng thĂ­ch hoĂ n toĂ n vá»›i Node.js 20+, khĂ´ng sá»­ dá»¥ng cĂ¡c dependency thá»­ nghiá»‡m khĂ´ng an toĂ n. | **VERIFIED (PASS)** | KhĂ´ng cĂ³ hardcoded secrets hay API keys riĂªng tÆ° trong mĂ£ nguá»“n frontend. |
| **09** | **Hiá»‡n tráº¡ng Kiá»ƒm soĂ¡t MĂ£ nguá»“n (Git State)** | NhĂ¡nh `dev-huy`, commit gá»‘c `e00445d`. 18 tá»‡p sá»­a Ä‘á»•i Ä‘ang náº±m trong Working Tree, sáºµn sĂ ng cho cĂ´ng tĂ¡c Ä‘Ă³ng gĂ³i commit cĂ³ kiá»ƒm soĂ¡t. | **VERIFIED (RECORDED)** | ChÆ°a thá»±c hiá»‡n commit, push hay merge khi chÆ°a cĂ³ lá»‡nh tá»« PO. |
| **10** | **Khiáº¿m khuyáº¿t P0/P1 CĂ²n Tá»“n Ä‘á»ng** | KhĂ´ng cĂ²n báº¥t ká»³ lá»—i P0 hoáº·c P1 nĂ o. CĂ¡c lá»—i tÆ°Æ¡ng pháº£n thá»‹ giĂ¡c P1-A, P1-B, P1-C, nhĂ£n trá»¥c Recharts, vĂ  nĂºt CTA chĂ­nh Ä‘Ă£ Ä‘Æ°á»£c Ä‘Ă³ng hoĂ n toĂ n. | **VERIFIED (NONE)** | 100% nhĂ£n vÄƒn báº£n vĂ  nĂºt báº¥m Ä‘áº¡t chuáº©n tÆ°Æ¡ng pháº£n WCAG AA / AAA. |

---

## 3. GIá»I Háº N KIá»‚M THá»¬ VĂ€ LÆ¯U Ă Váº¬N HĂ€NH (OPERATIONAL LIMITATIONS)

TrÆ°á»›c khi kĂ­ch hoáº¡t phĂ¡t hĂ nh ra mĂ´i trÆ°á»ng production, Ä‘á»™i ngÅ© phĂ¡t triá»ƒn ghi nháº­n cĂ¡c lÆ°u Ă½ sau:
1. **Mock Data Isolation:** Trong quĂ¡ trĂ¬nh kiá»ƒm thá»­ E2E vĂ  Unit, há»‡ thá»‘ng sá»­ dá»¥ng lá»›p giáº£ láº­p `mock-handlers.ts`. Khi Ä‘Æ°a lĂªn staging/production, cáº§n Ä‘áº£m báº£o backend API service táº¡i cĂ¡c endpoint `/api/admin/*` vĂ  `/api/rentals/*` Ä‘ang cháº¡y Ä‘á»“ng bá»™ phiĂªn báº£n.
2. **Transition Hardware Acceleration:** Hiá»‡u á»©ng Organic Liquid Flood Reveal yĂªu cáº§u há»— trá»£ SVG `clip-path` vĂ  CSS `will-change`. TrĂªn cĂ¡c thiáº¿t bá»‹ cá»±c cÅ© khĂ´ng há»— trá»£ SVG masks, hook `RentalLiquidTransition` sáº½ tá»± Ä‘á»™ng fallback sang cÆ¡ cháº¿ Ä‘á»•i theme tá»©c thĂ¬ khĂ´ng hiá»‡u á»©ng, Ä‘áº£m báº£o cĂ´ng thĂ¡i há»c.
3. **Quy trĂ¬nh ÄĂ³ng gĂ³i Git:** Khi Ä‘Æ°á»£c PO cháº¥p thuáº­n phĂ¡t hĂ nh, cĂ¡c thay Ä‘á»•i sáº½ Ä‘Æ°á»£c Ä‘Ă³ng gĂ³i thĂ nh má»™t commit duy nháº¥t tuĂ¢n thá»§ Conventional Commits (vĂ­ dá»¥: `feat(admin): implement phase 4 transit desk expansion and a1.1 design baseline`).

---

## 4. Káº¾T LUáº¬N TĂNH Sáº´N SĂ€NG PHĂT HĂ€NH

CÄƒn cá»© vĂ o káº¿t quáº£ kiá»ƒm tra Ä‘á»™c láº­p 10/10 tiĂªu chĂ­ tiĂªn quyáº¿t:

$$\text{TRáº NG THĂI CUá»I CĂ™NG: } \mathbf{READY\_FOR\_RELEASE\_AUTHORIZATION}$$

Há»‡ thá»‘ng mĂ£ nguá»“n Cá»•ng Quáº£n trá»‹ Thong Dong Transit Desk Ä‘Ă£ Ä‘áº¡t Ä‘á»™ chĂ­n muá»“i vá» ká»¹ thuáº­t, vÆ°á»£t qua toĂ n bá»™ cĂ¡c cá»•ng kiá»ƒm tra tá»± Ä‘á»™ng vĂ  sáºµn sĂ ng Ä‘á»ƒ Product Owner ban hĂ nh quyáº¿t Ä‘á»‹nh á»§y quyá»n phĂ¡t hĂ nh (Release Authorization).
