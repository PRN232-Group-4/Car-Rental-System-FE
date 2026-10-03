"use client";

import Image from "next/image";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";

interface HeroProps {
  onSearchCriteriaChange?: (criteria: {
    mode: RentalMode;
    facilityId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function Hero({ onSearchCriteriaChange }: HeroProps) {
  return (
    <section className="relative w-full pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center">

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* Rounded Hero Banner Card (Mioto Layout) with Hai Van Pass */}
        <div className="relative w-full rounded-3xl sm:rounded-[32px] overflow-hidden shadow-xl min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between pt-16 sm:pt-20 pb-20 sm:pb-24 px-6 sm:px-12 text-center border border-white/20">
          {/* Scenic Background Image: Hai Van Pass */}
          <Image
            src="/assets/hero-hai-van.jpg"
            alt="Thong Dong - Đèo Hải Vân"
            fill
            priority
            className="object-cover object-center filter contrast-[1.08] brightness-[0.88]"
          />

          {/* Cinematic Dark & Emerald Scrim Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-emerald-950/15 pointer-events-none" />

          {/* Centered Hero Headings */}
          <div className="relative z-10 flex flex-col items-center my-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md max-w-4xl mx-auto leading-[1.2]">
              Thong Dong - Cùng Bạn Trên Mọi Hành Trình
            </h1>

            {/* Divider */}
            <div className="w-48 sm:w-64 h-px bg-white/40 my-4 rounded-full" />

            <p className="text-white/95 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium drop-shadow leading-relaxed">
              Trải nghiệm sự khác biệt từ hơn 50+ xe tiêu chuẩn kiểm định đời mới khắp Việt Nam
            </p>
          </div>

          {/* Spacer for bottom overlap breathing room */}
          <div className="h-6 sm:h-8" />
        </div>

        {/* Overlapping Tabs & Search Console (Docked Over Bottom Border) */}
        <div id="tim-xe" className="relative z-20 -mt-14 sm:-mt-16 w-full max-w-5xl px-2 sm:px-4 scroll-mt-28">
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
