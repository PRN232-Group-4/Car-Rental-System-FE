"use client";

import { useRef } from "react";
import { Search, FileCheck2, Compass, RotateCcw, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      step: "01",
      title: "Đặt xe trực tuyến",
      description:
        "Chọn chi nhánh, thời gian nhận xe và dịch vụ kèm tài xế chuyên nghiệp. Tải ảnh GPLX để nhân viên duyệt nhanh.",
      icon: Search,
      highlight: "Duyệt nhanh trong 5 phút",
    },
    {
      step: "02",
      title: "Kiểm định & bàn giao",
      description:
        "Kỹ thuật viên cùng bạn kiểm tra xe thực tế, chốt số km và dung tích pin/nhiên liệu trên biên bản số hoá.",
      icon: FileCheck2,
      highlight: "Biên bản số hoá có ảnh",
    },
    {
      step: "03",
      title: "Tự do hành trình",
      description:
        "Tận hưởng chuyến đi riêng tư, an tâm với chính sách bảo hiểm và đội ngũ kỹ thuật hỗ trợ cứu hộ 24/7.",
      icon: Compass,
      highlight: "Bảo hiểm & cứu hộ 24/7",
    },
    {
      step: "04",
      title: "Trả xe & hoàn cọc",
      description:
        "Trả xe tại chi nhánh hoặc yêu cầu thu hồi tận nơi. Quyết toán chi phí minh bạch và hoàn cọc tự động qua PayOS.",
      icon: RotateCcw,
      highlight: "Hoàn cọc tức thì qua PayOS",
    },
  ];

  // GSAP desktop pin left column per A7.2 & requirement e
  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current || !leftColRef.current) return;

      const mm = gsap.matchMedia();

      // Desktop only (>= 1024px)
      mm.add("(min-width: 1024px)", () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top 120px",
          end: "bottom bottom",
          pin: leftColRef.current,
          pinSpacing: false,
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="quy-trinh"
      ref={containerRef}
      className="scroll-mt-28 py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Pinned on Desktop (>= 1024px) */}
        <div ref={leftColRef} className="lg:col-span-5 lg:sticky lg:top-28">
          <SectionHeading
            kicker="Quy trình 4 bước"
            title="Trải nghiệm thuê xe nhanh chóng & minh bạch"
            subtitle="Đơn giản hoá thủ tục giấy tờ, số hoá toàn bộ biên bản bàn giao giúp bạn bắt đầu chuyến đi chỉ trong 5 phút."
          />

          {/* Quick Step Indicators */}
          <div className="mt-8 space-y-3 hidden sm:block">
            {steps.map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"
              >
                <span className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <span className="text-xs font-bold text-ink">
                  {item.title}
                </span>
                <span className="ml-auto text-[11px] text-primary font-semibold">
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Scrolling Steps */}
        <div className="lg:col-span-7 space-y-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-lite rounded-3xl p-6 sm:p-8 flex flex-col justify-between group border border-border shadow-elevation-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-wider uppercase text-primary bg-emerald-50 border border-primary/20 px-3 py-1 rounded-lg">
                      Bước {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-canvas border border-border text-ink-muted group-hover:text-primary transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-ink mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-xs font-semibold text-primary bg-emerald-50 px-2.5 py-1 rounded-md">
                    {item.highlight}
                  </span>
                  {index < steps.length - 1 ? (
                    <span className="text-xs font-semibold text-ink-subtle group-hover:text-primary transition-colors flex items-center gap-1">
                      Tiếp theo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-primary">
                      Hoàn tất
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
