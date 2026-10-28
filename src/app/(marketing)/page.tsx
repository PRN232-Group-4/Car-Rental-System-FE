"use client";

import Navbar from "@/components/layout/Navbar";
import ChapterRail from "@/components/layout/ChapterRail";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
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
import { bricolage, manrope, jetbrainsMono } from "./fonts";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        data-surface="marketing"
        className={`${bricolage.variable} ${manrope.variable} ${jetbrainsMono.variable} overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col selection:bg-primary/20 selection:text-warning bg-canvas focus:outline-none`}
      >
        {/* Navigation: Fixed positioning stays top */}
        <Navbar />
        <ChapterRail />

        <div className="w-full min-h-[100dvh] flex flex-col">
          {/* Background Architectural Canvas & Subtle Depth */}
          <div className="absolute inset-0 pointer-events-none z-0 bg-canvas" />

          {/* Full Page Engineering Continuous Blueprint Dossier Background */}
          <ContinuousBlueprint />

          <div className="relative z-10 flex flex-col w-full">
            {/* 1. Warm Editorial Hero with Single-Deck Search Console */}
            <div id="gioi-thieu">
              <Hero />
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
      </main>
    </SmoothScrollProvider>
  );
}
