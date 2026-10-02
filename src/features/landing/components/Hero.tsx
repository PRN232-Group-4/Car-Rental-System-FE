"use client";

import { type CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { SearchWidget } from "@/features/rentals";
import RevealText from "@/components/ui/RevealText";

interface HeroProps {
  onSearchCriteriaChange?: (criteria: {
    mode: "with_driver" | "long_term";
    facilityId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function Hero({ onSearchCriteriaChange }: HeroProps) {
  return (
    <section className="relative min-h-[95vh] flex flex-col justify-center items-center pt-36 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Cinematic Ambient Backdrop for Glass Refraction */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Large Emerald Aurora Glow */}
        <div className="ambient-glow-orb w-[700px] h-[500px] top-12 left-1/2 -translate-x-1/2 bg-gradient-to-b from-emerald-500/20 via-teal-400/10 to-transparent" />
        
        {/* Soft Side Tint Orbs */}
        <div className="ambient-glow-orb w-[450px] h-[450px] top-40 -left-20 bg-emerald-400/15" />
        <div className="ambient-glow-orb w-[450px] h-[450px] top-40 -right-20 bg-teal-400/15" />

        {/* Ambient Automotive Blurred Background Layer */}
        <div className="absolute inset-x-0 bottom-0 h-96 opacity-20 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80"
            alt="Automotive Ambient"
            fill
            priority
            className="object-cover object-bottom filter blur-sm contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/80 to-transparent" />
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Editorial Sub-hook with Glass Pill & Inline Typography Image */}
        <div className="reveal glass-pill specular-border inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-800 mb-6 backdrop-blur-xl">
          <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
          <span>Hệ thống vận hành trực tiếp</span>
          <span
            className="inline-block w-8 h-4 rounded-full align-middle bg-cover bg-center border border-white/80 shadow-xs"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=120&q=80')",
            }}
          />
          <span>Đội xe tiêu chuẩn kiểm định</span>
        </div>

        {/* H1 Heading adhering strictly to the 2-Line Iron Rule */}
        <RevealText
          as="h1"
          text="Thuê xe cho mọi hành trình, tự do khám phá mọi cung đường"
          className="w-full max-w-5xl text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] mb-6"
          stagger={18}
        />

        {/* Sub-headline */}
        <p
          className="reveal w-full max-w-3xl text-base sm:text-lg text-neutral-600 leading-relaxed mb-10 font-normal"
          style={{ "--reveal-delay": "250ms" } as CSSProperties}
        >
          Hệ thống cho thuê và điều phối đội xe ô tô, xe máy, xe điện hiện đại do đơn vị trực tiếp sở hữu. Quy trình kiểm định hai chiều minh bạch, nhận xe tại chi nhánh hoặc giao tận nơi.
        </p>

        {/* Primary CTA and Secondary Glass Link */}
        <div
          className="reveal flex flex-wrap items-center justify-center gap-3.5 mb-14"
          style={{ "--reveal-delay": "350ms" } as CSSProperties}
        >
          <a
            href="#danh-sach-xe"
            className="px-7 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-[#059669]/30 hover:shadow-xl hover:shadow-[#059669]/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer border border-emerald-400/30"
          >
            <span>Khám phá 50+ xe sẵn sàng</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#goi-thue-bao"
            className="glass-pill px-6 py-3.5 hover:bg-white/70 text-neutral-800 font-semibold text-sm sm:text-base rounded-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <span>Gói thuê bao trả trước</span>
          </a>
        </div>

        {/* Core Vehicle Search Console with Frosted Glass Elevation */}
        <div id="tim-xe" className="reveal w-full scroll-mt-28" style={{ "--reveal-delay": "450ms" } as CSSProperties}>
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
