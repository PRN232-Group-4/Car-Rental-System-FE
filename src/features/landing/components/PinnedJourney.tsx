"use client";

import { useRef } from "react";
import { KeyRound, BatteryCharging, RefreshCw, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

export default function PinnedJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const phases = [
    {
      index: "01",
      tag: "INSTANT DIGITAL UNLOCK",
      title: "Bàn Giao Số Hoá 3 Phút Không Giấy Tờ",
      description:
        "Tạm biệt những thủ tục ký giấy rườm rà. Bạn quét mã QR tại trạm Smart EV Hub để xác thực GPLX và ký biên bản điện tử trực tiếp trên điện thoại chỉ trong 3 phút.",
      icon: KeyRound,
      highlight: "Quy trình số hoá 100%",
    },
    {
      index: "02",
      tag: "UNLIMITED EV TOURING",
      title: "Tự Do Hành Trình Không Khí Thải",
      description:
        "Tận hưởng cảm giác lái êm ái, yên tĩnh trên những cung đường đẹp nhất Việt Nam. Hệ thống trạm sạc nhanh phủ rộng và đội ngũ kỹ thuật cứu hộ pin túc trực 24/7.",
      icon: BatteryCharging,
      highlight: "Mạng lưới sạc nhanh & Cứu hộ 24/7",
    },
    {
      index: "03",
      tag: "ZERO-DEPOSIT SETTLEMENT",
      title: "Trả Xe Nhanh & Quyết Toán Hoàn Cọc PayOS",
      description:
        "Ghé trạm hoặc yêu cầu kỹ thuật viên thu hồi tận nơi. Hệ thống đối soát 6 góc ảnh gốc ban đầu; tiền cọc được lệnh hoàn trả tức thì qua cổng PayOS không chờ đợi.",
      icon: RefreshCw,
      highlight: "Hoàn cọc tự động qua PayOS",
    },
  ];

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current || !leftColRef.current) return;

      const mm = gsap.matchMedia();

      // Desktop Only Pinning (>= 1024px)
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
          const cards = cardsRef.current.querySelectorAll(".phase-card");
          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0.45, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  end: "top 55%",
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
      id="hanh-trinh"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-28 relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Pinned Narrative on Desktop */}
        <div ref={leftColRef} className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-primary" />
            <span>CINEMATIC SCROLL EXPERIENCE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
            Hành Trình 3 Pha Thuần Điện
          </h2>

          <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed">
            Chúng tôi định nghĩa lại trải nghiệm thuê xe ô tô: Nhanh hơn, minh bạch hơn và triệt tiêu hoàn toàn rào cản thủ tục truyền thống.
          </p>

          {/* Quick indicators */}
          <div className="space-y-3 pt-2 hidden sm:block">
            {phases.map((phase) => (
              <div
                key={phase.index}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#13221E] border border-white/10"
              >
                <span className="w-8 h-8 rounded-xl bg-primary text-white font-mono text-xs font-black flex items-center justify-center shrink-0">
                  {phase.index}
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {phase.title}
                </span>
                <span className="ml-auto text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 shrink-0">
                  {phase.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Scrolling Phase Cards */}
        <div ref={cardsRef} className="lg:col-span-7 space-y-8">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.index}
                className="phase-card rounded-[36px] p-8 sm:p-10 bg-[#12221E] border border-white/10 shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-black uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-3 py-1 rounded-xl">
                        PHA {phase.index}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 px-2 py-0.5 rounded bg-white/5">
                        {phase.tag}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                    {phase.title}
                  </h3>

                  <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed mb-8">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-3 py-1 rounded-lg">
                    {phase.highlight}
                  </span>

                  {idx < phases.length - 1 ? (
                    <span className="font-semibold text-white/60 flex items-center gap-1">
                      Tiếp theo
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
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
