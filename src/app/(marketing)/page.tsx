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
    <main className="overflow-x-hidden w-full max-w-full min-h-dvh relative text-neutral-800 flex flex-col selection:bg-[#059669]/15 selection:text-[#059669]">
      {/* Quiet backdrop: one flat tone, no decorative layers. */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-slate-50" />

      <div className="relative z-10 flex flex-col w-full">
        {/* Navigation */}
        <Navbar />

        {/* Hero with search console */}
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
