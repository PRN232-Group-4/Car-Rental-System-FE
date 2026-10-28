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
  TelemetryBridgeBar,
} from "@/features/landing";
import { bricolage, manrope, jetbrainsMono } from "./fonts";

/**
 * Landing Page Thong Dong Luxury Mobility Platform (Awwwards SOTD v4.0).
 * Cấu trúc Khung Monolith Kiến Trúc Liên Tục (Architectural Swiss Grid Frame) 1600px
 * kết hợp nền Kinetic Blueprint tương tác và dải Telemetry Bridge triệt tiêu khoảng trắng chết.
 */
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

          {/* Full Page Engineering Continuous Blueprint Kinetic Background */}
          <ContinuousBlueprint />

          {/* Continuous Architectural Monolith Grid Frame (1600px) */}
          <div className="relative z-10 w-full max-w-[1480px] xl:max-w-[1600px] mx-auto border-x border-line-strong flex flex-col bg-canvas/30">
            {/* 1. Warm Editorial Hero with Single-Deck Search Console */}
            <div id="gioi-thieu" className="relative">
              <Hero />
            </div>

            {/* 2. Dedicated Interactive 3D WebGL Studio */}
            <div id="showroom-3d" className="relative border-t border-line-strong">
              <InteractiveStudioGate />
            </div>

            {/* Technical Telemetry Bridge Bar: Kết nối liền mạch Studio 3D sang Danh mục hạm đội */}
            <TelemetryBridgeBar />

            {/* 3. Multi-Category Vehicle Catalog (Asymmetric Interactive Fleet Exhibition Matrix) */}
            <div id="danh-muc-xe" className="relative scroll-mt-24 border-t border-line-strong">
              <MultiFleetCatalog />
            </div>

            {/* 4. Facility Network Explorer */}
            <div id="chi-nhanh" className="relative scroll-mt-24 border-t border-line-strong">
              <FacilityExplorer />
            </div>

            {/* 5. Dual Inspection & Settlement Section */}
            <div id="cong-nghe" className="relative scroll-mt-24 border-t border-line-strong">
              <InspectionSection />
            </div>

            {/* 6. Sticky Journey Narrative with GSAP Card Reveals */}
            <div id="quy-trinh" className="relative scroll-mt-24 border-t border-line-strong">
              <PinnedJourney />
            </div>

            {/* 7. Digital Membership Passes */}
            <div id="goi-thue-bao" className="relative scroll-mt-24 border-t border-line-strong">
              <MembershipPasses />
            </div>

            {/* 8. Comprehensive Legal & Network Footer */}
            <div id="lien-he" className="relative border-t border-line-strong">
              <Footer />
            </div>
          </div>
        </div>
      </main>
    </SmoothScrollProvider>
  );
}
