import { archivo } from "@/app/(marketing)/fonts";
import DisplayLine from "@/features/landing/components/DisplayLine";

export const metadata = {
  title: "Vietnamese Glyph & Archivo wdth Test | Dev Only",
  robots: {
    index: false,
    follow: false,
  },
};

const TEST_STRING = "Ặ Ữ Ề Ỗ Ự Ổ Ắ Ố Ỷ Ẫ Ợ Ở · THUÊ XE · SIÊU XE · KHÔNG VỘI · ĐẶT XE";

export default function GlyphTestPage() {
  return (
    <div
      data-surface="marketing"
      className={`${archivo.variable} min-h-[100dvh] bg-ink-950 text-bone-100 p-8 md:p-16 flex flex-col gap-12 font-sans`}
    >
      <header className="border-b border-rule pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-sun-600">
          Dev Diagnostic — Step 2 Typography & Glyph Verification (Bản 3.2)
        </span>
        <h1 className="text-2xl font-bold mt-2 text-white font-display">
          Kiểm Thử Dấu Tiếng Việt & Trục Archivo wdth Tĩnh
        </h1>
        <p className="text-sm text-bone-100/70 mt-1 max-w-3xl">
          Xác nhận phông chữ Archivo (trục wdth: [70, 125]) và Be Vietnam Pro hiển thị đúng dấu tiếng Việt không bị cắt ngọn qua line-mask, không đè vạch line-box, và khối H1 hai dòng đạt cùng chiều rộng khối (~65–70vw) không tràn ngang màn hình.
        </p>
      </header>

      {/* 1. TEST TRỰC TIẾP KHỐI H1 HAI DÒNG (Bản 3.2) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-bone-100/60 font-mono">
          <span>Khối H1 Hai Dòng: Dòng 1 (wdth 70) vs Dòng 2 (wdth 125) · Cùng màu bone-100</span>
          <span className="text-sun-600 font-bold">Cân Bằng Quang Học ~65–70vw</span>
        </div>
        <div className="bg-ink-800 p-8 border border-rule overflow-hidden flex flex-col items-center justify-center">
          <div className="w-full max-w-[85vw] text-center">
            <h1 className="font-display font-black uppercase text-bone-100 select-all">
              <DisplayLine
                wdth={70}
                style={{ fontSize: "var(--fs-h1-top)" }}
                className="tracking-tight"
              >
                SIÊU XE.
              </DisplayLine>
              <DisplayLine
                wdth={125}
                style={{ fontSize: "var(--fs-h1-bottom)" }}
                className="tracking-tight"
              >
                KHÔNG VỘI.
              </DisplayLine>
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Cỡ 1: Display Clamp (line-height >= 1.0 và padding-top cho line-mask) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-bone-100/60 font-mono">
          <span>Cỡ 1: Display Clamp — Archivo (wdth 70, leading-[1.05], pt-[0.14em])</span>
          <span className="text-sun-600 font-bold">Line-height ≥ 1.0 ĐẠT</span>
        </div>
        <div className="bg-ink-800 p-6 border border-rule overflow-hidden">
          <div className="pt-[0.14em] overflow-visible">
            <p
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontVariationSettings: "'wdth' 70",
                fontSize: "clamp(3.5rem, 10vw, 12rem)",
                lineHeight: 1.05,
              }}
              className="font-black text-bone-100 tracking-tight break-words select-all"
            >
              {TEST_STRING}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Cỡ 2: Subheading / Statement (wdth 125) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-bone-100/60 font-mono">
          <span>Cỡ 2: Statement (wdth 125, clamp(2rem, 5.5vw, 6rem), leading-[1.15])</span>
          <span className="text-bone-100 font-bold">Chương 2–3</span>
        </div>
        <div className="bg-ink-800 p-6 border border-rule">
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontVariationSettings: "'wdth' 125",
              fontSize: "var(--fs-statement)",
              lineHeight: 1.15,
            }}
            className="font-bold text-bone-100"
          >
            {TEST_STRING}
          </h2>
        </div>
      </section>

      {/* 4. Cỡ 3: Body & Micro — Be Vietnam Pro */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-bone-100/60 font-mono">
          <span>Cỡ 3: Body (17–19px, line-height 1.55) & Micro (12px HOA, tracking 0.24em)</span>
          <span className="text-bone-100/60 font-bold">Be Vietnam Pro</span>
        </div>
        <div className="bg-ink-800 p-6 border border-rule space-y-4">
          <p
            style={{ fontSize: "var(--fs-body)", lineHeight: 1.55 }}
            className="text-bone-100/90 font-normal"
          >
            {TEST_STRING} — Trải nghiệm thuê xe không vội vã. Cung đường dài là để cảm nhận, thưởng ngoạn và làm chủ từng vòng tua máy thay vì chạy đua cùng thời gian.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 border-t border-rule">
            <span
              style={{ fontSize: "var(--fs-micro)", letterSpacing: "var(--ls-micro)" }}
              className="font-semibold text-sun-600 uppercase"
            >
              NÚT ĐẶT XE · LIÊN KẾT ĐIỀU HƯỚNG · KHÓA DỮ KIỆN
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
