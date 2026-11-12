import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import InteractiveStudioGate from "@/features/landing/components/InteractiveStudioGate";
import InspectionSection from "@/features/landing/components/InspectionSection";

export const metadata: Metadata = {
  title: "Kiểm Định Xe & Mô Phỏng 3D | Thong Dong",
  description:
    "Trải nghiệm mô phỏng 3D 360° tương tác và biên bản kiểm định đối soát số hóa hai chiều tại Thong Dong.",
};

export default function InspectionPage() {
  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        className="w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col bg-canvas focus:outline-none"
      >
        <Navbar />

        {/* The studio opens directly under the fixed nav (~53px); its own heading leads the page. */}
        <div className="w-full flex flex-col pt-[53px]">
          <h1 className="sr-only">Kiểm định và trưng bày xe 3D</h1>

          {/* Interactive 360° 3D Studio */}
          <div id="showroom-3d" className="relative w-full">
            <InteractiveStudioGate />
          </div>

          {/* Dual Inspection & Settlement Ledger */}
          <div id="cong-nghe" className="relative w-full border-t border-line">
            <InspectionSection />
          </div>
        </div>

        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}
