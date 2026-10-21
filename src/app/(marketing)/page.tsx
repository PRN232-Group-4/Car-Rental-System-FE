"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FacilityExplorer } from "@/features/facilities";
import {
  Hero,
  Marquee,
  InteractiveStudio3D,
  MultiFleetCatalog,
  InspectionSection,
  PinnedJourney,
  MembershipPasses,
  ContinuousBlueprint,
} from "@/features/landing";

export default function Home() {
  const [, setActiveFacilityFilter] = useState<string>("all");

  const handleSearchCriteria = (criteria: { facilityId: string }) => {
    setActiveFacilityFilter(criteria.facilityId);
  };

  return (
    <main id="main-content" tabIndex={-1} className="overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col selection:bg-primary/20 selection:text-warning bg-canvas focus:outline-none">
      {/* Background Architectural Canvas & Subtle Depth */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-canvas" />

      {/* Full Page Engineering Continuous Blueprint Dossier Background */}
      <ContinuousBlueprint />

      <div className="relative z-10 flex flex-col w-full">
        {/* Navigation */}
        <Navbar />

        {/* 1. Warm Editorial Hero with Single-Deck Search Console */}
        <div id="gioi-thieu">
          <Hero onSearchCriteriaChange={handleSearchCriteria} />
        </div>

        {/* 2. System Trust & Capability Marquee */}
        <Marquee />

        {/* 3. Dedicated Interactive 3D WebGL Studio (Porsche 1975 Classic vs 2026 Carrera 4S) */}
        <InteractiveStudio3D />

        {/* 4. Multi-Category Vehicle Catalog (4 Groups: Electric/Petrol, Cars/Bikes, Chauffeur/Self-Drive) */}
        <div id="doi-xe" className="scroll-mt-24">
          <MultiFleetCatalog />
        </div>

        <FacilityExplorer />

        {/* 5. Dual Inspection & Automated PayOS Refund Terminal */}
        <div id="cong-nghe" className="scroll-mt-24">
          <InspectionSection />
        </div>

        {/* 6. Sticky Journey Narrative with GSAP Card Reveals */}
        <div id="quy-trinh" className="scroll-mt-24">
          <PinnedJourney />
        </div>

        {/* 7. Apple Wallet & NFC Digital Membership Passes */}
        <div id="goi-thue-bao" className="scroll-mt-24">
          <MembershipPasses />
        </div>

        {/* 8. Comprehensive Legal & Network Footer */}
        <div id="lien-he">
          <Footer />
        </div>
      </div>
    </main>
  );
}
