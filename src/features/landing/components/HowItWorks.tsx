"use client";

import { useRef } from "react";
import { Search, FileCheck2, Compass, RotateCcw, ChevronRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      step: "01",
      tag: "ONLINE RESERVATION",
      title: "Đặt xe trực tuyến & chọn gói cước",
      description:
        "Chọn chi nhánh nhận xe thuận tiện, lịch trình di chuyển và gói thuê linh hoạt (theo giờ hoặc dài hạn). Tải ảnh GPLX để hệ thống xác thực tức thì.",
      icon: Search,
      highlight: "Duyệt nhanh trong 5 phút",
    },
    {
      step: "02",
      tag: "DIGITAL HANDOVER",
      title: "Kiểm định thực tế & bàn giao số hoá",
      description:
        "Kỹ thuật viên cùng bạn đối soát xe qua ứng dụng: kiểm tra 6 góc ngoại quan, chốt số Odometer và dung lượng pin SoH lưu trực tiếp lên hợp đồng điện tử.",
      icon: FileCheck2,
      highlight: "Biên bản số hoá có ảnh",
    },
    {
      step: "03",
      tag: "ZERO-EMISSION TOURING",
      title: "Tự do khám phá hành trình",
      description:
        "Tận hưởng chuyến đi êm ái, tiện nghi trên đội xe thuần điện chất lượng cao. Đội ngũ kỹ thuật và cứu hộ pin trực chiến hỗ trợ 24/7 trên toàn tuyến.",
      icon: Compass,
      highlight: "Bảo hiểm & cứu hộ 24/7",
    },
    {
      step: "04",
      tag: "PAYOS INSTANT REFUND",
      title: "Trả xe & hoàn cọc tự động tức thì",
      description:
        "Trả xe tại Smart EV Hub hoặc yêu cầu thu hồi tận nơi. Quyết toán chi phí minh bạch không phí ẩn, tiền cọc hoàn tự động qua PayOS về tài khoản của bạn.",
      icon: RotateCcw,
      highlight: "Hoàn cọc tự động qua PayOS",
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

        // Scrubbed card reveals
        if (cardsRef.current) {
          const cards = cardsRef.current.querySelectorAll(".step-card");
          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0.5, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 80%",
                  end: "top 50%",
                  scrub: 0.5,
                },
              }
            );
          });
        }
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
            kicker="QUY TRÌNH 4 BƯỚC"
            title="Trải nghiệm thuê xe số hoá nhanh chóng & minh bạch"
            subtitle="Đơn giản hoá thủ tục giấy tờ, số hoá toàn bộ biên bản bàn giao giúp bạn khởi hành tự tin chỉ sau 3 phút."
          />

          {/* Quick Step Indicators */}
          <div className="mt-8 space-y-3 hidden sm:block">
            {steps.map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-line shadow-e1"
              >
                <span className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-mono font-black flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <span className="text-xs font-bold text-ink truncate">
                  {item.title}
                </span>
                <span className="ml-auto text-[11px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary-tint shrink-0">
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Scrolling Steps */}
        <div ref={cardsRef} className="lg:col-span-7 space-y-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="step-card glass-lite rounded-3xl p-6 sm:p-8 flex flex-col justify-between group border border-line shadow-e1 hover:shadow-e2 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black tracking-wider uppercase text-primary bg-primary-tint border border-primary/20 px-3 py-1 rounded-lg">
                        BƯỚC {item.step}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 px-2 py-0.5 rounded bg-sunken">
                        {item.tag}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-canvas border border-line text-ink-3 group-hover:text-primary transition-colors flex items-center justify-center shadow-e1">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-2 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs">
                  <span className="text-xs font-semibold text-primary bg-primary-tint px-2.5 py-1 rounded-md">
                    {item.highlight}
                  </span>
                  {index < steps.length - 1 ? (
                    <span className="text-xs font-semibold text-ink-3 group-hover:text-primary transition-colors flex items-center gap-1">
                      Tiếp theo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sẵn sàng khởi hành
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
