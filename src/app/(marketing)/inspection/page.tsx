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

        <div className="w-full flex flex-col pt-20">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
              Quy Trình Kiểm Tra Kỹ Thuật Số
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-ink">
              Kiểm Định &amp; Trưng Bày Xe 3D
            </h1>
            <p className="text-base text-ink-2 max-w-2xl mt-3 leading-relaxed">
              Khám phá ngoại thất phương tiện qua mô hình 3D tương tác đa chiều và đối soát biên bản bàn giao xe trước / sau chuyến đi.
            </p>
          </header>

          {/* S04: Interactive 360° 3D Studio */}
          <div id="showroom-3d" className="relative w-full border-t border-line">
            <InteractiveStudioGate />
          </div>

          {/* S05: Dual Inspection & Settlement Ledger */}
          <div id="cong-nghe" className="relative w-full border-t border-line">
            <InspectionSection />
          </div>
        </div>

        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}
