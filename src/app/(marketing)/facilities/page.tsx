import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FacilityExplorer } from "@/features/facilities";

export const metadata = {
  title: "Chi nhánh & Điểm giao nhận xe | Thong Dong",
  description:
    "Danh sách các chi nhánh trung tâm, điểm giao nhận xe sân bay và trung tâm thành phố của hệ thống Thong Dong.",
};

export default function FacilitiesPage() {
  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col selection:bg-primary/20 selection:text-warning">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <FacilityExplorer />
      </main>
      <Footer />
    </div>
  );
}
