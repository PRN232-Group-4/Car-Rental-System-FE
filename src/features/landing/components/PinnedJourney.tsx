"use client";

import { useRef } from "react";
import { KeyRound, BatteryCharging, RefreshCw, ChevronRight, CheckCircle2 } from "lucide-react";
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
      className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-28 relative overflow-hidden"
    >
      {/* Background Topographic Elevation & GPS Waypoints Route Blueprint */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg 
          className="w-full h-full opacity-[0.06]" 
          viewBox="0 0 1280 1000" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          {/* Engineering Boundary Marks */}
          <line x1="0" y1="40" x2="1280" y2="40" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="6 6" />
          <line x1="0" y1="90" x2="1280" y2="90" stroke="#b45309" strokeWidth="0.8" />
          
          <g stroke="#0f172a" strokeWidth="0.8">
            <line x1="40" y1="80" x2="40" y2="100" />
            <line x1="320" y1="80" x2="320" y2="100" />
            <text x="180" y="86" fill="#0f172a" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
              TOPOGRAPHIC ROUTE SURVEY // GPS TELEMETRY
            </text>
          </g>

          {/* Topographic Contour Elevation Curves */}
          <path d="M -60 280 C 180 240, 420 320, 680 260 C 940 200, 1120 280, 1340 240" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M -40 380 C 220 310, 480 410, 720 340 C 960 270, 1160 360, 1360 320" stroke="#b45309" strokeWidth="1.2" />
          <path d="M -20 480 C 240 400, 520 500, 780 430 C 1020 360, 1200 440, 1380 400" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="6 6" />
          <path d="M 0 620 C 280 540, 560 640, 840 570 C 1080 500, 1240 580, 1400 540" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M -40 760 C 260 680, 600 780, 880 710 C 1120 640, 1280 720, 1420 680" stroke="#b45309" strokeWidth="1.2" strokeDasharray="8 6" />
          <path d="M -60 900 C 240 820, 640 920, 920 850 C 1160 780, 1320 860, 1440 820" stroke="#0f172a" strokeWidth="0.8" />

          {/* Elevation Level Labels */}
          <text x="70" y="270" fill="#0f172a" fontSize="9" fontFamily="monospace">ELEV: +250M</text>
          <text x="70" y="370" fill="#b45309" fontSize="9" fontFamily="monospace">ELEV: +580M [HIGHWAY 1A]</text>
          <text x="70" y="470" fill="#0f172a" fontSize="9" fontFamily="monospace">ELEV: +920M [PASS CLIMB]</text>
          <text x="70" y="750" fill="#b45309" fontSize="9" fontFamily="monospace">ELEV: +1500M [DALAT PLATEAU]</text>

          {/* Geodetic Waypoint Nodes (SGN -> DL -> CR) */}
          <g stroke="#b45309" strokeWidth="1">
            {/* Waypoint 1: SGN */}
            <circle cx="220" cy="820" r="14" strokeDasharray="3 3" />
            <circle cx="220" cy="820" r="4" fill="#b45309" />
            <text x="245" y="824" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">WP-01: SGN HUB [000 KM]</text>

            {/* Connecting Route Line */}
            <path d="M 220 820 L 480 620 L 820 480 L 1080 340" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Waypoint 2: DL */}
            <circle cx="820" cy="480" r="14" strokeDasharray="3 3" />
            <circle cx="820" cy="480" r="4" fill="#b45309" />
            <text x="845" y="484" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">WP-02: DL PLATEAU [305 KM]</text>

            {/* Waypoint 3: CAM RANH */}
            <circle cx="1080" cy="340" r="14" strokeDasharray="3 3" />
            <circle cx="1080" cy="340" r="4" fill="#b45309" />
            <text x="1105" y="344" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">WP-03: CR COAST [440 KM]</text>
          </g>
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Pinned Narrative on Desktop (Slim ~260px height to prevent any viewport clipping) */}
        <div ref={leftColRef} className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-tint border border-primary/30 text-primary text-xs font-mono font-bold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>CINEMATIC SCROLL EXPERIENCE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight leading-[1.08]">
            Hành Trình 3 Pha Thuê Xe Tối Giản
          </h2>

          <p className="text-sm sm:text-base text-ink-2 font-normal leading-relaxed">
            Chúng tôi định nghĩa lại trải nghiệm thuê phương tiện: Nhanh hơn, minh bạch hơn và triệt tiêu hoàn toàn rào cản thủ tục truyền thống.
          </p>

          {/* Interactive Vertical Progress Rail (Slim ~130px, 0% clipping on any laptop screen) */}
          <div className="pt-2 hidden sm:block">
            <div className="relative pl-6 space-y-4 border-l-2 border-line">
              {phases.map((phase) => (
                <div key={phase.index} className="relative group cursor-default">
                  {/* Rail Node Dot */}
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-surface border-2 border-line group-hover:border-primary group-hover:bg-primary transition-colors flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-stage-ink" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-ink group-hover:text-primary transition-colors">
                      PHA {phase.index}
                    </span>
                    <span className="text-ink-3 text-xs">/</span>
                    <span className="text-xs font-semibold text-ink-2 truncate">
                      {phase.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Scrolling Phase Cards with Subtle Avant-Garde Watermark */}
        <div ref={cardsRef} className="lg:col-span-7 space-y-8">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.index}
                className="phase-card relative overflow-hidden rounded-[var(--r-panel)] p-8 sm:p-10 bg-surface border border-line-strong shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Subtle Editorial Watermark Number */}
                <div
                  aria-hidden="true"
                  className="absolute -right-2 -bottom-6 font-mono font-black text-8xl sm:text-9xl text-ink/[0.04] pointer-events-none select-none tracking-tighter"
                >
                  {phase.index}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-black uppercase text-primary bg-primary-tint border border-primary/30 px-3 py-1 rounded-xl">
                        PHA {phase.index}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-ink-3 px-2 py-0.5 rounded bg-sunken">
                        {phase.tag}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-primary-tint border border-primary/30 text-primary flex items-center justify-center">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-black text-ink mb-3 tracking-tight">
                    {phase.title}
                  </h3>

                  <p className="text-sm sm:text-base text-ink-2 font-normal leading-relaxed mb-8">
                    {phase.description}
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-line flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary bg-primary-tint border border-primary/30 px-3 py-1 rounded-lg">
                    {phase.highlight}
                  </span>

                  {idx < phases.length - 1 ? (
                    <span className="font-semibold text-ink-3 flex items-center gap-1">
                      Tiếp theo
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="font-bold text-primary flex items-center gap-1.5">
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
