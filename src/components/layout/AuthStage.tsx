"use client";

import { useRef, type ReactNode } from "react";
import Link from "@/components/navigation/NavigationLink";
import { ChevronLeft } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface AuthStageProps {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}

/**
 * Shared stage for login, register and password recovery: the landing hero scene
 * (Đà Lạt lithograph) behind a paper form, with the hero Porsche parked on the form's top-right corner.
 */
export default function AuthStage({ backHref, backLabel, children }: AuthStageProps) {
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(carRef.current, { x: 160, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.15 });
    });
    return () => mm.revert();
  });

  return (
    <div className="relative min-h-dvh w-full overflow-x-clip bg-ink-950 text-bone-100 flex flex-col selection:bg-sun-600 selection:text-white">
      <picture className="fixed inset-0 z-0 pointer-events-none">
        <source
          type="image/avif"
          srcSet="/assets/landing/scene-a-dalat-full-3840.avif 3840w, /assets/landing/scene-a-dalat-full-2880.avif 2880w, /assets/landing/scene-a-dalat-full-1920.avif 1920w, /assets/landing/scene-a-dalat-full-1280.avif 1280w, /assets/landing/scene-a-dalat-full-960.avif 960w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet="/assets/landing/scene-a-dalat-full-3840.webp 3840w, /assets/landing/scene-a-dalat-full-2880.webp 2880w, /assets/landing/scene-a-dalat-full-1920.webp 1920w, /assets/landing/scene-a-dalat-full-1280.webp 1280w, /assets/landing/scene-a-dalat-full-960.webp 960w"
          sizes="100vw"
        />
        <img
          src="/assets/landing/scene-a-dalat-full-1920.webp"
          alt=""
          className="w-full h-full object-cover object-[70%_center]"
          decoding="async"
        />
      </picture>

      <header className="absolute top-0 inset-x-0 z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-black tracking-tight text-bone-100 hover:text-sun-400 transition-colors select-none"
        >
          ThongDong.
        </Link>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-bone-100 hover:text-sun-400 transition-colors py-1.5 px-3 border border-bone-100/20 hover:border-sun-400 bg-ink-950"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
      </header>

      <main id="main-content" className="relative z-10 flex-1 w-full px-4 pt-36 sm:pt-44 xl:pt-36 pb-6 flex flex-col justify-center">
        {/* main clips overflow-x globally, so it spans the viewport and the column lives inside. */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Parked over the form's top-right corner: tyres sink into the card padding, above the content. */}
          <div
            ref={carRef}
            aria-hidden="true"
            className="absolute right-0 bottom-full z-10 -mb-6 sm:-mb-[30px] w-[clamp(200px,58vw,260px)] sm:w-[340px] translate-x-[4%] sm:translate-x-[34%] pointer-events-none will-change-transform"
          >
            <picture className="block w-full">
              <source
                type="image/avif"
                srcSet="/assets/landing/a4-car-960.avif 960w, /assets/landing/a4-car-640.avif 640w"
                sizes="(min-width: 640px) 340px, 60vw"
              />
              <source
                type="image/webp"
                srcSet="/assets/landing/a4-car-960.webp 960w, /assets/landing/a4-car-640.webp 640w"
                sizes="(min-width: 640px) 340px, 60vw"
              />
              <img
                src="/assets/landing/a4-car-640.webp"
                alt=""
                className="block w-full h-auto contrast-125 brightness-95"
                decoding="async"
              />
            </picture>
          </div>

          <div className="h-1 bg-sun-600" aria-hidden="true" />
          {children}
        </div>
      </main>
    </div>
  );
}
