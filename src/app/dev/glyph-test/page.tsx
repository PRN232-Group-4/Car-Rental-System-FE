import { archivo, cormorant } from "@/app/(marketing)/fonts";

export const metadata = {
  title: "Vietnamese Glyph & Diacritics Test | Dev Only",
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
      className={`${archivo.variable} ${cormorant.variable} min-h-[100dvh] bg-ink-950 text-bone-100 p-8 md:p-16 flex flex-col gap-12 font-sans`}
    >
      <header className="border-b border-line pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-sun-400">
          Dev Diagnostic — Step 1 Token & Glyph Verification
        </span>
        <h1 className="text-2xl font-bold mt-2 text-white">
          Kiểm Thử Dấu Tiếng Việt & Thang Đo Chữ Riso Grand Tour
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          Xác nhận font Archivo, Cormorant Garamond và Be Vietnam Pro hiển thị đúng dấu tiếng Việt không bị cắt ngọn, không đè vạch line-box và không rơi về font hệ thống.
        </p>
      </header>

      {/* Cỡ 1: Display / Hero Clamp (line-height >= 1.0 và padding-top cho line-mask) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-ink-3">
          <span>1. Display Hero — Archivo (clamp(4rem, 18vw, 22rem), leading-[1.05], pt-[0.15em])</span>
          <span className="text-sun-400 font-bold">Line-height ≥ 1.0 ĐẠT</span>
        </div>
        <div className="bg-ink-800 p-6 border border-line overflow-hidden">
          <div className="pt-[0.15em] overflow-visible">
            <p
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(3.5rem, 12vw, 14rem)",
                lineHeight: 1.05,
              }}
              className="font-black text-white tracking-tight break-words select-all"
            >
              {TEST_STRING}
            </p>
          </div>
        </div>
      </section>

      {/* Cỡ 1b: Highlight Từ Nhấn với Cormorant Garamond Italic */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-ink-3">
          <span>1b. Display Hero với Từ Nhấn Cormorant Garamond Italic</span>
          <span className="text-sun-400 font-bold">Editorial Contrast</span>
        </div>
        <div className="bg-ink-800 p-6 border border-line">
          <p
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(2.5rem, 8vw, 8rem)",
              lineHeight: 1.1,
            }}
            className="font-black text-white tracking-tight"
          >
            SIÊU XE.{" "}
            <span
              style={{
                fontFamily: "var(--font-editorial, serif)",
              }}
              className="italic font-normal text-sun-400"
            >
              KHÔNG VỘI.
            </span>
          </p>
        </div>
      </section>

      {/* Cỡ 2: Subheading / H2 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-ink-3">
          <span>2. Subheading H2 (clamp(1.75rem, 4vw, 3rem), leading-[1.2])</span>
          <span className="text-lake-400 font-bold">Section Titles</span>
        </div>
        <div className="bg-ink-800 p-6 border border-line">
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              lineHeight: 1.2,
            }}
            className="font-bold text-bone-100"
          >
            {TEST_STRING}
          </h2>
        </div>
      </section>

      {/* Cỡ 3: Body & Micro — Be Vietnam Pro */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-ink-3">
          <span>3. Body & Micro — Be Vietnam Pro (1rem & 0.75rem, leading-[1.6])</span>
          <span className="text-bone-100 font-bold">Readability AA</span>
        </div>
        <div className="bg-ink-800 p-6 border border-line flex flex-col gap-4">
          <div>
            <span className="text-xs text-ink-3 block mb-1">Body Text (16px / 1rem):</span>
            <p className="text-base text-bone-100 leading-relaxed">
              {TEST_STRING}
            </p>
          </div>
          <div className="border-t border-line pt-3">
            <span className="text-xs text-ink-3 block mb-1">Micro Label / Metadata (12px / 0.75rem):</span>
            <p className="text-xs text-ink-3 leading-normal uppercase tracking-wider">
              {TEST_STRING}
            </p>
          </div>
        </div>
      </section>

      {/* Kiểm tra tương phản trên 2 nền chương: Sun-600 & Lake-600 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          data-chapter="sun"
          className="bg-sun-600 text-white p-6 border border-line flex flex-col gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">
            Chương Sun: Nền Sun-600 (#C84B20)
          </span>
          <p className="text-lg font-bold text-white">
            {TEST_STRING}
          </p>
          <span className="text-xs opacity-80 mt-2">
            Độ tương phản chữ trắng trên Sun-600: Đạt chuẩn WCAG AA
          </span>
        </div>

        <div
          data-chapter="lake"
          className="bg-lake-600 text-white p-6 border border-line flex flex-col gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">
            Chương Lake: Nền Lake-600 (#1177A8)
          </span>
          <p className="text-lg font-bold text-white">
            {TEST_STRING}
          </p>
          <span className="text-xs opacity-80 mt-2">
            Độ tương phản chữ trắng trên Lake-600: Đạt chuẩn WCAG AA
          </span>
        </div>
      </section>
    </div>
  );
}
