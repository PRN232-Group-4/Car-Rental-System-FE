"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Hero,
  Marquee,
  SpatialFleetShowcase,
  DiagnosticDeck,
  PinnedJourney,
  MembershipPasses,
} from "@/features/landing";

export default function Home() {
  const [activeFacilityFilter, setActiveFacilityFilter] = useState<string>("all");

  const handleSearchCriteria = (criteria: { facilityId: string }) => {
    setActiveFacilityFilter(criteria.facilityId);
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900 bg-[#0A0F0D]">
      {/* Structural base backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[#0A0F0D]" />

      <div className="relative z-10 flex flex-col w-full">
        {/* Navigation */}
        <Navbar />

        {/* 1. Hero with Single-Deck Search Console */}
        <div id="gioi-thieu">
          <Hero onSearchCriteriaChange={handleSearchCriteria} />
        </div>

        {/* 2. Infinite Automotive & Telemetry Marquee */}
        <Marquee />

        {/* 3. Avant-Garde Spatial Fleet Showcase (Replaces Vehicle Catalog) */}
        <div id="doi-xe" className="scroll-mt-24">
          <div id="tim-xe" className="scroll-mt-24">
            <div id="chi-nhanh" className="scroll-mt-24">
              <SpatialFleetShowcase initialFacilityFilter={activeFacilityFilter} />
            </div>
          </div>
        </div>

        {/* 4. Interactive 6-Point Vehicle Telemetry & Inspection Radar */}
        <div id="cong-nghe" className="scroll-mt-24">
          <div id="kiem-dinh" className="scroll-mt-24">
            <DiagnosticDeck />
          </div>
        </div>

        {/* 5. Cinematic GSAP Pinned Journey Narrative (Replaces How It Works) */}
        <div id="quy-trinh">
          <PinnedJourney />
        </div>

        {/* 6. Apple Wallet / NFC Digital Membership Passes (Replaces Subscription Plans) */}
        <div id="goi-thue-bao" className="scroll-mt-28">
          <MembershipPasses />
        </div>

        {/* 7. Comprehensive Tech & Legal Footer */}
        <div id="lien-he">
          <Footer />
        </div>
      </div>
    </main>
  );
}
