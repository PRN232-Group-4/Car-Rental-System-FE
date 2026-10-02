"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Hero,
  Marquee,
  WhyChooseUs,
  HowItWorks,
  MobileAppSection,
} from "@/features/landing";
import { FacilityExplorer } from "@/features/facilities";
import { VehicleCatalog } from "@/features/vehicles";
import { InspectionShowcase } from "@/features/inspections";
import { SubscriptionPlans } from "@/features/subscriptions";

export default function Home() {
  const [activeFacilityFilter, setActiveFacilityFilter] = useState<string>("all");

  const handleSearchCriteria = (criteria: { facilityId: string }) => {
    setActiveFacilityFilter(criteria.facilityId);
  };

  const handleSelectFacility = (facilityId: string) => {
    setActiveFacilityFilter(facilityId);
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen relative text-neutral-800 flex flex-col selection:bg-[#059669]/15 selection:text-[#059669]">
      {/* Ambient Glassmorphism Backdrop Canvas - Visible Stacking Context (Priority 4 in ui-ux-pro-max) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#eafff4] via-[#f6faf8] to-[#eef3ff]">
        {/* Top-Right Emerald Aurora Orb */}
        <div className="ambient-glow-orb orb-drift w-[800px] h-[800px] -top-40 -right-40 bg-gradient-to-br from-emerald-400/70 via-teal-300/50 to-emerald-200/30" />
        
        {/* Top-Left Cyan Aurora Orb */}
        <div className="ambient-glow-orb orb-drift-reverse w-[720px] h-[720px] top-40 -left-48 bg-gradient-to-tr from-cyan-400/50 via-teal-300/45 to-transparent" />
        
        {/* Hero Emerald Bloom */}
        <div className="ambient-glow-orb w-[560px] h-[560px] top-[260px] left-1/2 -translate-x-1/2 bg-gradient-to-b from-emerald-400/45 via-teal-300/30 to-transparent" />
        
        {/* Mid-Page Vehicle Catalog Aurora Glow */}
        <div className="ambient-glow-orb orb-drift w-[900px] h-[900px] top-[1050px] right-[-150px] bg-gradient-to-bl from-emerald-400/60 via-teal-300/40 to-cyan-300/30" />
        
        {/* Bento Grid Ambient Light Pool */}
        <div className="ambient-glow-orb orb-drift-reverse w-[880px] h-[880px] top-[1950px] left-[-200px] bg-gradient-to-tr from-emerald-500/50 via-teal-300/40 to-indigo-300/30" />

        {/* Subscription Plans Glow */}
        <div className="ambient-glow-orb orb-drift w-[950px] h-[950px] top-[3100px] right-[-100px] bg-gradient-to-l from-teal-400/55 via-emerald-300/40 to-indigo-300/30" />

        {/* Footer Violet Accent */}
        <div className="ambient-glow-orb orb-drift-reverse w-[700px] h-[700px] top-[4300px] left-[15%] bg-gradient-to-tr from-indigo-400/40 via-violet-300/30 to-transparent" />
        
        {/* Geometric dot matrix pattern that blurs through frosted panels */}
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage: "radial-gradient(#059669 2px, transparent 2px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        {/* Floating Frosted Glass Navigation */}
        <Navbar />

        {/* Attention: Cinematic Center Hero with Frosted Glass Search Console */}
        <div id="gioi-thieu">
          <Hero onSearchCriteriaChange={handleSearchCriteria} />
        </div>

        {/* Infinite Automotive & Trust Marquee */}
        <Marquee />

        {/* Desire: Official Facilities & Pickup Centers */}
        <FacilityExplorer
          selectedFacilityId={activeFacilityFilter === "all" ? "fac-q1" : activeFacilityFilter}
          onSelectFacility={handleSelectFacility}
        />

        {/* Interest & Desire: Vehicle Discovery Catalog with Live Booking Calculation */}
        <VehicleCatalog filterFacilityId={activeFacilityFilter} />

        {/* Interest: Gapless Bento Grid of Core System Commitments */}
        <div id="chinh-sach">
          <WhyChooseUs />
        </div>

        {/* Trust Cornerstone: Pre-rental Inspection Report Certificate */}
        <InspectionShowcase />

        {/* Desire: 4-Step How It Works Workflow */}
        <HowItWorks />

        {/* Action & Conversion: Subscription Plans */}
        <SubscriptionPlans />

        {/* Ecosystem: Mobile App (Flutter) */}
        <MobileAppSection />

        {/* Action: Comprehensive 4-Column Footer */}
        <div id="lien-he">
          <Footer />
        </div>
      </div>
    </main>
  );
}
