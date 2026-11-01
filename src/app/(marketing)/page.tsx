"use client";

import { useState, useCallback } from "react";
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
  CinematicPreloader,
} from "@/features/landing";
import type { HeroSearchCriteria } from "@/features/landing/components/Hero";
import { cormorant, archivo } from "./fonts";

export default function Home() {
  const [searchCriteria, setSearchCriteria] = useState<HeroSearchCriteria | null>(null);

  const handleHeroSearch = useCallback((criteria: HeroSearchCriteria) => {
    setSearchCriteria(criteria);
    const catalogEl = document.getElementById("danh-muc-xe");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleFacilitySelectForRental = useCallback((facilityId: string) => {
    setSearchCriteria((prev) => ({
      mode: prev?.mode ?? "hourly",
      facilityId,
      startDate: prev?.startDate ?? "",
      startTime: prev?.startTime ?? "09:00",
      endDate: prev?.endDate ?? "",
      endTime: prev?.endTime ?? "09:00",
    }));
    const catalogEl = document.getElementById("danh-muc-xe");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        data-surface="marketing"
        className={`${cormorant.variable} ${archivo.variable} overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col selection:bg-sun-600/20 selection:text-sun-400 bg-canvas focus:outline-none`}
      >
        <CinematicPreloader />

        <Navbar />
        <ChapterRail />

        <div className="w-full min-h-[100dvh] flex flex-col">
          <div className="absolute inset-0 pointer-events-none z-0 bg-canvas" />
          <ContinuousBlueprint />

          <div className="relative z-10 w-full flex flex-col bg-canvas/40">
            {/* 01. Hero & Live Search Console */}
            <div id="gioi-thieu" className="relative w-full">
              <Hero onSearchCriteriaChange={handleHeroSearch} />
            </div>

            {/* 02. Multi-Category Vehicle Showroom Configurator */}
            <div id="danh-muc-xe" className="relative w-full scroll-mt-24 border-t border-line">
              <MultiFleetCatalog
                activeSearchCriteria={searchCriteria}
                onClearSearchCriteria={() => setSearchCriteria(null)}
              />
            </div>

            {/* 03. Facility Network Explorer */}
            <div id="chi-nhanh" className="relative w-full scroll-mt-24 border-t border-line">
              <FacilityExplorer onSelectFacilityForRental={handleFacilitySelectForRental} />
            </div>

            {/* 04. Interactive 360° 3D Studio */}
            <div id="showroom-3d" className="relative w-full scroll-mt-24 border-t border-line">
              <InteractiveStudioGate />
            </div>

            {/* 05. Dual Inspection & Settlement Ledger */}
            <div id="cong-nghe" className="relative w-full scroll-mt-24 border-t border-line">
              <InspectionSection />
            </div>

            {/* 06. 4-Step Autonomous Rental Journey (Matrix Process) */}
            <div id="quy-trinh" className="relative w-full scroll-mt-24 border-t border-line">
              <PinnedJourney />
            </div>

            {/* 07. Membership Passes */}
            <div id="goi-thue-bao" className="relative w-full scroll-mt-24 border-t border-line">
              <MembershipPasses />
            </div>

            {/* 08. Footer */}
            <div id="lien-he" className="relative w-full border-t border-line">
              <Footer />
            </div>
          </div>
        </div>
      </main>
    </SmoothScrollProvider>
  );
}
