"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Tải Three.js InteractiveStudio3D CHỈ khi có ý định (Intent-based loading)
const InteractiveStudio3D = dynamic(
  () => import("@/features/landing/components/InteractiveStudio3D"),
  {
    ssr: false,
    loading: () => (
      <section
        id="showroom-3d"
        aria-label="Đang tải không gian mô phỏng 3D"
        className="relative w-full bg-stage-ink text-white py-14 lg:py-16 border-y border-line-strong scroll-mt-24 overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center justify-center"
      >
        <div className="w-full max-w-[1680px] h-[580px] lg:h-[680px] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-primary animate-spin" />
          <p className="text-xs font-mono text-white/60">Đang khởi tạo không gian mô phỏng 3D Obsidian...</p>
        </div>
      </section>
    ),
  }
);

export default function InteractiveStudioGate() {
  const [shouldLoad, setShouldLoad] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Kiểm tra kích thước màn hình
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    // Trên desktop: Nạp ngay lập tức để không bị trễ hoặc để trống khung khi cuộn trang / chụp ảnh màn hình
    if (!isMobile) {
      setShouldLoad(true);
      return;
    }

    // Dưới 768px: KHÔNG tự động nạp chunk Three.js. Chỉ nạp khi người dùng bấm "Xem xe 3D".
  }, []);

  if (shouldLoad) {
    return <InteractiveStudio3D />;
  }

  // Khung chứa ban đầu (chưa nạp Three.js): 0 request mạng Three.js trên mobile
  return (
    <div ref={containerRef}>
      <section
        id="showroom-3d"
        aria-label="Không gian mô phỏng 3D"
        className="relative w-full bg-stage-ink text-white py-14 lg:py-16 border-y border-line-strong scroll-mt-24 overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center justify-center"
      >
        <div className="w-full max-w-4xl h-[480px] rounded-3xl bg-surface/10 border border-white/15 p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-surface/20 border border-white/20 text-primary flex items-center justify-center mb-4 shadow-sm">
            <Box className="w-7 h-7 stroke-[2]" aria-hidden="true" />
          </div>
          <span className="text-[13px] font-medium text-white/70 mb-2">
            Không gian mô phỏng 3D Obsidian
          </span>
          <h3 className="font-display text-2xl font-bold text-white mb-3">
            Khám phá Porsche 911 thời gian thực
          </h3>
          <p className="text-sm text-white/70 max-w-md mb-6 leading-relaxed">
            Tương tác góc xoay 360°, quan sát ngoại thất và thay đổi màu sơn theo ý muốn.
          </p>
          <Button
            type="button"
            variant="marketing-cta"
            size="md"
            onClick={() => setShouldLoad(true)}
            className="font-bold px-6 py-3 shadow-md"
          >
            <span>Xem xe 3D</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
