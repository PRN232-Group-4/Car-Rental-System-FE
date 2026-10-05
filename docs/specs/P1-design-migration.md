# P1 — Áp dụng DESIGN.md v3.1 và hoàn thiện Hệ Thống Automotive Blueprint Toàn Trang

**Chạy ở:** repo FE (`Car-Rental-System-FE`). **Làm đầu tiên** (trước mọi spec FE). **Chủ sở hữu token:** Huy (toàn quyền sửa token, restyle toàn bộ web).

## Điều kiện tiên quyết

1. Đồng bộ `DESIGN.md` mới (v3.1) tại gốc repo FE và gốc dự án: `docs: DESIGN.md v3.1 light editorial automotive blueprint (warm canvas, zero gradient)`.
2. Duy trì nhánh làm việc ổn định, kiểm soát xung đột giao diện và phong cách.
3. Nhánh làm việc: `dev-huy`.

## Việc cần làm (tóm tắt)

| Nhóm | Nội dung |
|---|---|
| Hạ tầng | `src/lib/motion/*` (A7.2), `scripts/check-design-rules.mjs` + `npm run lint:design` + bước CI, bộ test thị giác Playwright (`npm run test:visual`) |
| Token & font | Chuẩn hóa `globals.css` theo v3.1: Warm Canvas `#FBFBF9`, Precision Amber `#B45309`, Slate Ink `#0F172A`; Be Vietnam Pro + JetBrains Mono; `lang="vi"`, `color-scheme: light` |
| Gỡ bỏ | Mọi gradient, `ambient-glow-orb`, `orb-drift`, `.specular-border*`, emoji, `bg-gradient-*`, `backdrop-blur` trên phần tử lặp lại |
| Blueprint Đa Phân Vùng | Đồ họa kỹ thuật SVG vector phẳng chuyên ngành cho từng section: Skateboard Chassis (Catalog), Radar 360° LiDAR (Inspection), Trắc địa cao độ GPS (Journey), Vi mạch NFC (Membership Passes) |
| Restyle landing | Hero (Cinematic Stage, H1 <= 3 dòng), Navbar (`.glass-1`), SearchWidget (`.glass-2` + Custom Station Dropdown `.glass-3`), VehicleCatalog (`.glass-lite`), InspectionSection (`.glass-ink` + Visual Cutaway), PinnedJourney (Interactive Vertical Progress Rail), MembershipPasses, BookingModal (`.glass-3`) |
| Motion | GSAP ScrollTrigger pinning, scrubbed reveals, `gsap.matchMedia` cho reduce-motion/mobile |
| Admin & profile | StaffShell (sidebar Slate Ink, header `.glass-admin`), các trang admin theo chuẩn v3.1 — **chỉ thị giác**, không đổi logic |
| 3D Studio | InteractiveStudio3D WebGL WebGL Canvas (Porsche 1975 Classic & 2026 Carrera 4S), tự động dừng render khi cuộn ra khỏi viewport |

## Bản đồ chuyển đổi lớp CSS (cũ → mới)

| Cũ | Mới |
|---|---|
| `.glass-nav` | `.glass-1` |
| `.glass-search` | `.glass-2` |
| `.glass-card` (danh sách) | `.glass-lite` |
| `.glass-card` (panel đơn) | `.glass-2` |
| `.glass-card-elevated` | `.glass-3` + viền `--primary` |
| `.glass-hover` | `.glass-lift` |
| `.glass-pill`, `.glass-sub` | `.glass-1` / `.glass-lite` tùy ngữ cảnh |
| `.glass-dark`, `.glass-certificate` | `.glass-ink` / `.glass-3` |
| `.specular-border`, `.specular-emerald`, `.ambient-glow-orb`, `.orb-drift*` | **xóa** |
| `.char-kinetic-jump`, `.reveal*` (CSS) | GSAP hooks (`useSplitReveal`, `useRevealBatch`) |

## Prompt thực thi (Claude Code — repo FE)

```text
Bạn là senior frontend engineer (Next.js + design systems + GSAP). Nhiệm vụ P1: áp dụng DESIGN.md v3.1 (Phần A là nguồn xác thực) và hoàn thiện giao diện theo phong cách Light Editorial Automotive Blueprint. Nhánh dev-huy.

BẮT BUỘC TRƯỚC KHI CODE:
1. Đọc AGENTS.md. Phiên bản Next ở đây (16.x) có breaking changes: đọc hướng dẫn liên quan trong node_modules/next/dist/docs/ (font, static export, route, metadata) trước khi viết code; chú ý deprecation.
2. Đọc TOÀN BỘ DESIGN.md Phần A (A1–A13) và các mục Phần B bạn sẽ chạm (4, 5, 7, 8, 14, 39–41, 45). Phần A thắng khi mâu thuẫn.
3. Đọc src/app/globals.css, layout.tsx, (marketing)/page.tsx, toàn bộ src/components/**, src/features/**/components/**.
4. Liệt kê (chưa sửa) mọi chỗ vi phạm Phần A: gradient (css và class Tailwind bg-gradient-*, from-/via-/to-), emoji, backdrop-blur/backdrop-filter trên phần tử lặp lại, #000, h-screen, font Inter/Geist cho body, animation CSS thay vì GSAP, glow màu. Đưa tôi bản liệt kê + bảng đếm backdrop-filter theo route. Chờ tôi xác nhận rồi mới làm bước 5.

BƯỚC 5 — THỰC HIỆN theo thứ tự (mỗi bước một commit nhỏ, build + lint xanh mới sang bước sau):
a) Hạ tầng: tạo scripts/check-design-rules.mjs (quy tắc ở A13), thêm script "lint:design" vào package.json và bước chạy trong .github/workflows/ci.yml; tạo src/lib/motion/* theo A7.2 (register.ts đăng ký plugin MỘT lần: gsap, useGSAP, ScrollTrigger, Flip, SplitText; kiểm tra gsap đã cài có các plugin này trong node_modules/gsap/). Mọi hook dùng useGSAP với scope; gsap.matchMedia cho reduce-motion/mobile/thiết bị yếu; không chạy GSAP khi SSR.
b) Font: next/font/google Be Vietnam Pro (weights 400–800, subsets latin, latin-ext, vietnamese, display swap) + Geist/JetBrains Mono; gán biến --font-be-vietnam; html lang="vi". CỔNG KIỂM TRA: render chuỗi "Thuê xe ô tô điện — Quản lý bảo dưỡng, hoàn cọc, đặt xe ngày Chủ nhật" ở 400/600/800, xác nhận tệp subset vietnamese được tải và không có glyph rơi về font hệ thống; nếu không đạt, DỪNG và báo (không tự đổi font khác).
c) Tokens: viết lại globals.css đúng khối :root + @theme inline + lớp .glass-1/2/3/ink/lite/admin/lift + fallback (A4.3, A12). Xóa toàn bộ lớp cũ theo bảng chuyển đổi. KHÔNG còn gradient dù ở bất kỳ dạng nào (kể cả viền mặt nạ).
d) Thành phần dùng chung: Button, GlassPanel, Stage (photo/ink/amber), SectionHeading theo A6; thay RevealText/ScrollReveal bằng useSplitReveal/useRevealBatch (SplitText phải giữ aria: ký tự aria-hidden, cha có aria-label).
e) Restyle landing theo bản đồ lớp CSS: Hero (Stage Photo: dùng picsum.photos/seed/{keyword} khi dev; scrim PHẲNG; H1 <= 3 dòng ở 1280px; đúng MỘT CTA chính; không pill-tag/số liệu thô/mũi tên cuộn), Navbar (.glass-1, thu gọn khi cuộn bằng GSAP transform), SearchWidget (.glass-2 + Custom Station Dropdown .glass-3), VehicleCatalog (.glass-lite KHÔNG blur, ảnh >= 60% thẻ, skeleton + empty + error state đúng A6/B.§45–47), SubscriptionPlans (Stage Amber một lần; không 3 thẻ bằng nhau — dùng bất đối xứng), FacilityExplorer, WhyChooseUs (Stage Ink + bento đặc grid-auto-flow: dense, 3–5 ô, không ô trống), HowItWorks (pin tiêu đề trái + danh sách phải ở >= 1024px, tắt pin ở mobile), InspectionShowcase (.glass-ink), MobileAppSection, Marquee, Footer, BookingModal (.glass-3, focus trap). Thay mọi emoji bằng icon lucide-react.
f) Admin & profile (nếu đã có): StaffShell (sidebar Garage Ink đặc, header .glass-admin cao 64px), các trang admin stub và /profile theo A9 — CHỈ thị giác, không đổi logic/route/props. Bảng, ô nhập luôn nền Surface đặc.
g) 3D (tùy chọn có điều kiện): nếu public/models/ có GLB hợp lệ thì dựng HeroShowroom3D theo A8; nếu KHÔNG có thì chỉ dựng component với poster fallback và ghi chú rõ — KHÔNG dựng xe giả bằng hình khối.
h) Hồi quy: thêm Playwright (dev dependency) + kịch bản chụp ảnh landing ở 375/768/1280/1920 và các trạng thái hover/focus/dialog; bản chụp với prefers-reduced-transparency, prefers-reduced-motion, forced-colors.

KIỂM CHỨNG và dán kết quả thật cho mỗi nhóm: npm run lint, npm run lint:design, npm run build (static export phải qua), số phần tử backdrop-filter mỗi viewport (<= 4 công khai / <= 3 admin) đo bằng script Playwright, ảnh chụp, kiểm tra tương phản các lớp kính (script tính theo A2), Lighthouse (Performance/Accessibility) cho "/" trên mobile, xác nhận reduce-motion: phần tử hiển thị ngay, không còn transform dở.

RÀNG BUỘC: không đổi nghiệp vụ, route, props công khai của component; không thêm thư viện ngoài những gì trong DESIGN.md/spec; không gradient; không emoji; không Inter; không #000; không ScrollSmoother; không custom cursor. Chữ hiển thị tiếng Việt. Nếu spec mâu thuẫn với code thực tế hoặc thiếu tài sản (ảnh, GLB): DỪNG, mô tả và hỏi — không tự bịa.

BÁO CÁO CUỐI: danh sách file đổi theo nhóm, kết quả từng lệnh, ảnh chụp trước/sau, các chỗ chưa đạt A-spec và lý do, các điểm cần Anh/Phúc xác nhận.
```
