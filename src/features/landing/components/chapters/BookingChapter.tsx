"use client";

import Link from "@/components/navigation/NavigationLink";

export default function BookingChapter() {
  return (
    <section
      id="dat-xe"
      className="relative w-full min-h-[90vh] bg-ink-950 text-bone-100 flex flex-col justify-between pt-24 sm:pt-32 pb-16 px-6 sm:px-12 border-t border-bone-100/10 select-none overflow-hidden"
    >
      {/* Central Horizon Sun Setting Stage */}
      <div className="relative z-10 max-w-4xl mx-auto text-center my-auto flex flex-col items-center">
        <span className="font-mono text-xs uppercase tracking-widest text-sun-400 block mb-4">
          05 / CHƯƠNG V · KHỞI HÀNH
        </span>
        <h2 className="font-display uppercase tracking-tight text-4xl sm:text-6xl md:text-7xl font-black text-bone-100 leading-tight">
          Chọn xe. Chọn ngày.
          <br />
          <span className="font-serif italic font-normal text-sun-400">
            Lên đường.
          </span>
        </h2>
        <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-xl mx-auto mt-6 leading-relaxed">
          Sẵn sàng trải nghiệm cảm giác làm chủ những cung đường tuyệt mỹ nhất cùng hệ thống bàn giao số hóa không ma sát.
        </p>

        {/* Setting Sun Disc graphical element */}
        <div
          aria-hidden="true"
          className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-sun-600 my-10 flex items-center justify-center border-4 border-bone-100/20"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-white/80">
            THONG DONG 2026
          </span>
        </div>
      </div>

      {/* Minimalist 1-Line Footer & Attribution */}
      <footer className="relative z-20 max-w-6xl w-full mx-auto border-t border-bone-100/15 pt-8 space-y-4 text-xs text-bone-100/60">
        {/* CC BY 4.0 Attribution */}
        <div className="leading-relaxed border-b border-bone-100/10 pb-4 text-[11px] text-bone-100/50">
          <strong className="text-bone-100 font-medium">Ghi nhận bản quyền mô hình 3D (CC BY 4.0):</strong>{" "}
          1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
        </div>

        {/* 1-Line Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <span>© 2026 HỆ THỐNG THUÊ XE THÔNG DONG. RISO GRAND TOUR.</span>
          <div className="flex items-center gap-6">
            <Link href="/find" className="hover:text-sun-400 transition-colors">
              ĐỘI XE
            </Link>
            <Link href="/facilities" className="hover:text-sun-400 transition-colors">
              CHI NHÁNH
            </Link>
            <Link href="/inspection" className="hover:text-sun-400 transition-colors">
              KIỂM ĐỊNH 3D
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
