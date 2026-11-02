"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import SceneLayerStack from "../SceneLayerStack";
import DisplayLine from "../DisplayLine";

export default function HeroChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const h1ContainerRef = useRef<HTMLDivElement>(null);

  // Layer Refs for Parallax and Intro
  const sunRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (headingLine1Ref.current) gsap.set(headingLine1Ref.current, { yPercent: 0, opacity: 1 });
        if (headingLine2Ref.current) gsap.set(headingLine2Ref.current, { yPercent: 0, opacity: 1 });
        if (sunRef.current) gsap.set(sunRef.current, { yPercent: 0, opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Sun disc rises from behind a2-far-mountains (translateY +18% -> 0, 1.6s)
        if (sunRef.current) {
          tl.fromTo(
            sunRef.current,
            { yPercent: 18, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.6, ease: "power2.out" },
            0.1
          );
        }

        // 2. Layers fade in from far to near with stagger 120ms
        const orderedLayers = [
          farRef.current,
          midRef.current,
          roadRef.current,
          carRef.current,
          mistRef.current,
          branchRef.current,
          dustRef.current,
        ].filter(Boolean);

        if (orderedLayers.length > 0) {
          tl.fromTo(
            orderedLayers,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: "power3.out" },
            0.3
          );
        }

        // 3. Line-mask reveal for H1 typography
        if (headingLine1Ref.current && headingLine2Ref.current) {
          tl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" },
            0.4
          );
        }

        // 4. Parallax scroll (scrub, NO pin)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        if (sunRef.current) scrollTl.to(sunRef.current, { yPercent: -15, ease: "none" }, 0);
        if (farRef.current) scrollTl.to(farRef.current, { yPercent: -25, ease: "none" }, 0);
        if (midRef.current) scrollTl.to(midRef.current, { yPercent: -45, ease: "none" }, 0);
        if (h1ContainerRef.current) {
          scrollTl.to(h1ContainerRef.current, { yPercent: -35, ease: "none" }, 0);
        }
        if (roadRef.current) scrollTl.to(roadRef.current, { yPercent: -60, ease: "none" }, 0);
        if (carRef.current) scrollTl.to(carRef.current, { yPercent: -55, ease: "none" }, 0);
        if (branchRef.current) scrollTl.to(branchRef.current, { yPercent: -75, ease: "none" }, 0);
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="gioi-thieu"
      className="relative w-full h-[100svh] min-h-[100svh] bg-ink-950 text-bone-100 overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Multi-plane Layered Illustration Stack (Bản 3.2 Cảnh A) */}
      <SceneLayerStack
        scene="A"
        className="absolute inset-0 w-full h-full"
        layerRefs={{
          "a1-sun": sunRef,
          "a2-far-mountains": farRef,
          "a3-mid-pines": midRef,
          "a4-road": roadRef,
          "a4-car": carRef,
          "a5-mist": mistRef,
          "a6-fg-branch": branchRef,
          "a7-dust": dustRef,
        }}
      >
        {/*
          DOM H1 Headline (z-index 30, strictly between a3-mid-pines z-20 and a4-road z-40)
          Optical block width balance (~65–70vw) with static Archivo wdth 70 and 125
        */}
        <div
          ref={h1ContainerRef}
          style={{ zIndex: 30 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4 pt-12 pb-24"
        >
          <div className="w-full max-w-[85vw] mx-auto">
            <h1 className="font-display font-black uppercase text-bone-100 flex flex-col items-center justify-center">
              <DisplayLine
                ref={headingLine1Ref}
                wdth={70}
                style={{ fontSize: "var(--fs-h1-top)" }}
                className="tracking-tight"
              >
                SIÊU XE.
              </DisplayLine>
              <DisplayLine
                ref={headingLine2Ref}
                wdth={125}
                style={{ fontSize: "var(--fs-h1-bottom)" }}
                className="tracking-tight -mt-[1.5vw]"
              >
                KHÔNG VỘI.
              </DisplayLine>
            </h1>
          </div>
        </div>
      </SceneLayerStack>
    </section>
  );
}
