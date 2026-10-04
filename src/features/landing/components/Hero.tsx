"use client";

import { Stage } from "@/components/ui/Stage";
import { Button } from "@/components/ui/Button";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";
import { ArrowDown } from "lucide-react";

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
    <section className="relative w-full pt-20 pb-16 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* Stage Photo with flat scrim according to A4.1 & A6 */}
        <Stage
          variant="photo"
          imageUrl="/assets/hero-hai-van.jpg"
          imageAlt="Cung đường Đèo Hải Vân - Thong Dong"
          className="rounded-3xl sm:rounded-[32px] min-h-[460px] sm:min-h-[500px] flex flex-col justify-center items-center px-6 sm:px-12 text-center border border-border-dim"
        >
          <div className="flex flex-col items-center max-w-3xl mx-auto py-12">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-4">
              Thong Dong — Cùng Bạn Trên Mọi Hành Trình
            </h1>

            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed mb-8">
              Hệ thống thuê xe ô tô điện và xe tiêu chuẩn minh bạch hàng đầu, phục vụ hành trình khám phá Việt Nam.
            </p>

            {/* Exactly ONE primary CTA per A6 specification */}
            <div className="flex items-center justify-center">
              <Button
                as="a"
                href="#tim-xe"
                variant="primary"
                size="lg"
                className="shadow-elevation-2"
              >
                <span>Đặt xe ngay</span>
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Stage>

        {/* Overlapping Search Console (.glass-2) */}
        <div id="tim-xe" className="relative z-20 -mt-14 sm:-mt-16 w-full max-w-5xl px-2 sm:px-4 scroll-mt-28">
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
