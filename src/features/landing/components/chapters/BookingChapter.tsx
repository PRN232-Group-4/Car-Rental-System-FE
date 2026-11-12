
import { useRef } from "react";
import { FooterContent } from "@/components/layout/Footer";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface BookingChapterProps {
  onEnterChapter5?: (isInView: boolean) => void;
}

const DEPARTURE_CHARS = ["«", "Đ", "I", "\u00A0", "T", "H", "Ô", "I", ".", "»"];

export default function BookingChapter({ onEnterChapter5 }: BookingChapterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const sunsetStageRef = useRef<HTMLDivElement>(null);

  // Unique Section 4 -> Section 5 Transition: 7-Louver Horizontal Venetian Blind Flip
  // Triggered at `top 62%` (NOT `top 95%`) so it stays 100% closed while the user is reading Section 4, and only flips open when the user actually scrolls into Section 5!
  const louverRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Section 5 Uncut Full-Viewport Hai Van Stage & 3D Perspective Character Lock-In Refs
  const bgImgRef = useRef<HTMLImageElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const svgDialRef = useRef<SVGSVGElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const laserRuleRef = useRef<HTMLDivElement>(null);
  const subBoxRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current || !sunsetStageRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        louverRefs.current.forEach((l) => {
          if (l) gsap.set(l, { scaleY: 0 });
        });
        charRefs.current.forEach((c) => {
          if (c) gsap.set(c, { clearProps: "all", opacity: 1 });
        });
        gsap.set(
          [
            bgImgRef.current,
            mistRef.current,
            svgDialRef.current,
            laserRuleRef.current,
            subBoxRef.current,
            carRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. FIXED SECTION 4 -> SECTION 5 TRANSITION TIMING (`start: "top 62%", end: "top 10%"`)
        // Stays 100% closed (`scaleY: 1`) while Section 5 is at the bottom of the screen (`100% -> 62%`), preventing the premature orange sun strip in `image_d9f15c.jpg`!
        // Once Section 5 enters the main viewing zone (`top 62%`), the 7 horizontal slats flip open in 3D right in front of the user's eyes!
        const validLouvers = louverRefs.current.filter(Boolean);
        if (validLouvers.length > 0) {
          gsap.fromTo(
            validLouvers,
            { scaleY: 1, rotateX: 0 },
            {
              scaleY: 0,
              rotateX: 85,
              stagger: 0.045,
              ease: "none",
              scrollTrigger: {
                trigger: sunsetStageRef.current,
                start: "top 62%",
                end: "top 8%",
                scrub: true,
              },
            }
          );
        }

        // 2. SECTION 5 TYPOGRAPHY MOTION: Bound to `top 55% -> top 5%` so it animates right after the top louvers flip open and finishes 100% as Section 5 locks in!
        const validChars = charRefs.current.filter(Boolean);
        const stageTl = gsap.timeline({
          scrollTrigger: {
            trigger: sunsetStageRef.current,
            start: "top 55%",
            end: "top 5%",
            scrub: true,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (validChars.length > 0) {
          stageTl.fromTo(
            validChars,
            {
              yPercent: 110,
              rotateY: 70,
              opacity: 0,
            },
            {
              yPercent: 0,
              rotateY: 0,
              opacity: 1,
              stagger: 0.04,
              ease: "power2.out",
              duration: 0.7,
            },
            0
          );
        }

        if (laserRuleRef.current) {
          stageTl.fromTo(
            laserRuleRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "power2.out", duration: 0.6 },
            0.2
          );
        }

        if (subBoxRef.current) {
          stageTl.fromTo(
            subBoxRef.current,
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, ease: "power2.out", duration: 0.6 },
            0.25
          );
        }

        // 3. Continuous Panorama & Foreground Car (`b4-car` at z-50) Driving Across the Footer Seam!
        const driveTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 65%",
            end: "bottom bottom",
            scrub: true,
          },
        });

        if (bgImgRef.current) {
          driveTl.fromTo(
            bgImgRef.current,
            { scale: 1.14, yPercent: -6 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (svgDialRef.current) {
          driveTl.fromTo(
            svgDialRef.current,
            { rotate: -90 },
            { rotate: 90, ease: "none" },
            0
          );
        }

        if (carRef.current) {
          driveTl.fromTo(
            carRef.current,
            { xPercent: 20, y: -12, scale: 0.9 },
            { xPercent: -6, y: 12, scale: 1.06, ease: "none" },
            0
          );
        }

        if (mistRef.current) {
          driveTl.fromTo(
            mistRef.current,
            { xPercent: -15, opacity: 0.3 },
            { xPercent: 12, opacity: 0.65, ease: "none" },
            0
          );
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="dat-xe"
      className="relative w-full bg-ink-950 text-bone-100 select-none overflow-hidden"
    >
      {/* ================= PART 1: 100% UNCUT FULL-VIEWPORT HAI VAN SUNSET STAGE ================= */}
      <div
        ref={sunsetStageRef}
        className="relative w-full min-h-[100svh] flex flex-col justify-between pt-28 sm:pt-32"
      >
        {/* UNIQUE SECTION 4 -> 5 TRANSITION OVERLAY: 7 Horizontal Venetian Blind Slats (`bg-bone-100`) */}
        <div
          aria-hidden="true"
          style={{ zIndex: 42, perspective: "1000px" }}
          className="absolute inset-0 w-full h-full flex flex-col pointer-events-none"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              ref={(el) => {
                louverRefs.current[idx] = el;
              }}
              style={{ transformOrigin: "center top" }}
              className="w-full flex-1 bg-bone-100 -my-[1px] will-change-transform"
            />
          ))}
        </div>

        {/* 1. Full-Viewport Uninterrupted Hai Van Sunset Woodcut (`b0-backdrop`) */}
        <picture className="absolute inset-0 w-full h-full block pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
          <source
            type="image/avif"
            srcSet="/assets/landing/b0-backdrop-3840.avif 3840w, /assets/landing/b0-backdrop-2880.avif 2880w, /assets/landing/b0-backdrop-1920.avif 1920w, /assets/landing/b0-backdrop-1280.avif 1280w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/b0-backdrop-3840.webp 3840w, /assets/landing/b0-backdrop-2880.webp 2880w, /assets/landing/b0-backdrop-1920.webp 1920w, /assets/landing/b0-backdrop-1280.webp 1280w"
          />
          <img
            ref={bgImgRef}
            src="/assets/landing/b0-backdrop-1920.webp"
            alt="Hoàng hôn Đèo Hải Vân"
            className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* Rotating Constructivist SVG Horizon Dial in Top-Right Sky */}
        <svg
          ref={svgDialRef}
          aria-hidden="true"
          viewBox="0 0 500 500"
          style={{ zIndex: 10 }}
          className="hidden lg:block absolute right-[6%] top-[6%] w-[440px] h-[440px] text-bone-100/15 pointer-events-none will-change-transform"
        >
          <circle cx="250" cy="250" r="220" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="250" cy="250" r="160" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="250" x2="480" y2="250" stroke="currentColor" strokeWidth="1" />
          <line x1="250" y1="20" x2="250" y2="480" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* 2. Drifting Coastal Mist */}
        <div
          ref={mistRef}
          aria-hidden="true"
          style={{ zIndex: 12, mixBlendMode: "screen", opacity: 0.42 }}
          className="absolute inset-0 pointer-events-none overflow-hidden will-change-transform"
        >
          <img
            src="/assets/landing/b5-mist-1920.webp"
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 3. UNIQUE TYPOGRAPHY MOTION #5: 3D Perspective Character Cascade in the Top-Right Night Sky */}
        <div
          style={{ zIndex: 30, perspective: "1000px" }}
          className="relative w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col items-end text-right pointer-events-none"
        >
          <div className="inline-flex items-center gap-3 bg-ink-950 border border-bone-100/25 px-4 py-1.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-sun-600 inline-block" />
            <span className="text-[10px] sm:text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400">
              05 // KHỞI HÀNH NGAY HÔM NAY
            </span>
          </div>

          <h2
            aria-label="«ĐI THÔI.»"
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(2.75rem, 6.2vw, 7.6rem)",
              lineHeight: 1.12,
              fontVariationSettings: "'wdth' 110",
            }}
            className="font-black uppercase tracking-tight text-bone-100 flex flex-nowrap items-baseline justify-end whitespace-nowrap overflow-hidden pt-[0.2em] pb-[0.06em] -mt-[0.16em] drop-shadow-2xl"
          >
            {DEPARTURE_CHARS.map((ch, idx) => (
              <span
                key={idx}
                ref={(el) => {
                  charRefs.current[idx] = el;
                }}
                className={
                  idx >= 4
                    ? "inline-block text-sun-400 will-change-transform"
                    : "inline-block text-bone-100 will-change-transform"
                }
              >
                {ch}
              </span>
            ))}
          </h2>

          <div
            ref={laserRuleRef}
            style={{ transformOrigin: "right center" }}
            className="w-48 sm:w-72 h-[4px] bg-sun-600 my-4 will-change-transform"
          />

          <div
            ref={subBoxRef}
            className="bg-ink-950 p-5 sm:p-6 border-2 border-bone-100/20 border-r-8 border-r-sun-600 max-w-md shadow-2xl will-change-transform"
          >
            <div className="flex items-center justify-end gap-2 text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 mb-2">
              <span>CHỌN TRẠM · NHẬN KHÓA SỐ · LÊN ĐƯỜNG</span>
              <span>////</span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-bone-100 leading-relaxed font-medium">
              Chọn chi nhánh tiếp nhận và khung giờ khởi hành ngay tại thanh điều khiển phía dưới.
            </p>
          </div>
        </div>

        {/* 4. FOREGROUND PORSCHE (`z-50`) STRADDLING THE EXACT TOP BORDER OF THE FOOTER (`-mb-24 sm:-mb-36`)! */}
        <div
          style={{ zIndex: 50 }}
          className="relative w-full max-w-[1640px] mx-auto mt-auto pt-12 px-6 sm:px-12 pointer-events-none"
        >
          <div
            ref={carRef}
            style={{
              width: "clamp(320px, 48vw, 820px)",
            }}
            className="relative ml-auto mr-[2%] sm:mr-[6%] -mb-24 sm:-mb-36 pointer-events-none will-change-transform"
          >
            <picture className="w-full block">
              <source
                type="image/avif"
                srcSet="/assets/landing/b4-car-2000.avif 2000w, /assets/landing/b4-car-1920.avif 1920w, /assets/landing/b4-car-1280.avif 1280w, /assets/landing/b4-car-960.avif 960w"
              />
              <source
                type="image/webp"
                srcSet="/assets/landing/b4-car-2000.webp 2000w, /assets/landing/b4-car-1920.webp 1920w, /assets/landing/b4-car-1280.webp 1280w, /assets/landing/b4-car-960.webp 960w"
              />
              <img
                src="/assets/landing/b4-car-1280.webp"
                alt="Porsche 911 trên cung đường biển"
                className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95 drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>

      {/* ================= PART 2: COMPREHENSIVE 4-COLUMN ARCHITECTURAL FOOTER (`z-20`, Sitting UNDERNEATH the `z-50` Porsche Tires!) ================= */}
      <footer
        style={{ zIndex: 20 }}
        className="relative w-full bg-ink-950 border-t-4 border-sun-600 px-6 sm:px-12 lg:px-20 pt-32 sm:pt-40 pb-32 text-bone-100"
      >
        <FooterContent />
      </footer>
    </section>
  );
}

