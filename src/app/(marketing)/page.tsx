"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import ChapterRail from "@/components/layout/ChapterRail";
import Footer from "@/components/layout/Footer";
import { FacilityExplorer } from "@/features/facilities";
import {
  Hero,
  MultiFleetCatalog,
  InspectionSection,
  PinnedJourney,
  MembershipPasses,
  ContinuousBlueprint,
  InteractiveStudioGate,
} from "@/features/landing";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, ScrollSmoother } from "@/lib/motion/register";
import { bricolage, manrope, jetbrainsMono } from "./fonts";

// Phase 1b/2/3 gate: Disable ScrollSmoother until Phase 4 Pinning integration
const ENABLE_SMOOTHER = false;

export default function Home() {
  const [, setActiveFacilityFilter] = useState<string>("all");
  const smoothWrapperRef = useRef<HTMLDivElement>(null);

  const handleSearchCriteria = (criteria: { facilityId: string }) => {
    setActiveFacilityFilter(criteria.facilityId);
  };

  useGSAP(
    () => {
      if (!ENABLE_SMOOTHER || typeof window === "undefined" || !smoothWrapperRef.current) return;

      // 1. Accessibility: Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // 2. Hardware / Device gate: Disable ScrollSmoother on touch devices
      const isTouch = ScrollTrigger.isTouch === 1 || window.matchMedia("(pointer: coarse)").matches;
      if (isTouch) {
        return;
      }

      // 3. Initialize ScrollSmoother for Desktop Editorial Experience
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: true,
      });

      return () => {
        smoother.kill();
      };
    },
    { scope: smoothWrapperRef }
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-surface="marketing"
      className={`${bricolage.variable} ${manrope.variable} ${jetbrainsMono.variable} overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col selection:bg-primary/20 selection:text-warning bg-canvas focus:outline-none`}
    >
      {/* Navigation: Fixed positioning stays OUTSIDE #smooth-wrapper to prevent transform clipping */}
      <Navbar />
      <ChapterRail />

      {/* GSAP ScrollSmoother Structure (Identical DOM between SSR and Client) */}
      <div id="smooth-wrapper" ref={smoothWrapperRef} className="w-full">
        <div id="smooth-content" className="w-full min-h-[100dvh] flex flex-col">
          {/* Background Architectural Canvas & Subtle Depth */}
          <div className="absolute inset-0 pointer-events-none z-0 bg-canvas" />

          {/* Full Page Engineering Continuous Blueprint Dossier Background */}
          <ContinuousBlueprint />

          <div className="relative z-10 flex flex-col w-full">
            {/* 1. Warm Editorial Hero with Single-Deck Search Console */}
            <div id="gioi-thieu">
              <Hero onSearchCriteriaChange={handleSearchCriteria} />
            </div>

            {/* 2. Dedicated Interactive 3D WebGL Studio (Porsche 1975 Classic vs 2026 Carrera 4S) - Dynamic Import with Intent Gate */}
            <InteractiveStudioGate />

            {/* 3. Multi-Category Vehicle Catalog (4 Groups: Electric/Petrol, Cars/Bikes, Chauffeur/Self-Drive) */}
            <div id="danh-muc-xe" className="scroll-mt-24">
              <MultiFleetCatalog />
            </div>

            <FacilityExplorer />

            {/* 5. Dual Inspection & Settlement Section */}
            <div id="cong-nghe" className="scroll-mt-24">
              <InspectionSection />
            </div>

            {/* 6. Sticky Journey Narrative with GSAP Card Reveals */}
            <div id="quy-trinh" className="scroll-mt-24">
              <PinnedJourney />
            </div>

            {/* 7. Digital Membership Passes */}
            <div id="goi-thue-bao" className="scroll-mt-24">
              <MembershipPasses />
            </div>

            {/* 8. Comprehensive Legal & Network Footer */}
            <div id="lien-he">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
