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
        className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 overflow-hidden min-h-[560px] flex items-center justify-center"
      >
        <div className="w-full max-w-4xl h-[480px] rounded-3xl bg-surface border border-line-strong flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-line border-t-primary animate-spin" />
          <p className="text-xs font-mono text-ink-3">Đang khởi tạo không gian mô phỏng 3D...</p>
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

    // Dưới 768px: KHÔNG tự động nạp chunk Three.js. Chỉ nạp khi người dùng bấm "Xem xe 3D".
    if (isMobile) {
      return;
    }

    // Trên desktop: Nạp khi vào gần viewport (rootMargin: 300px) hoặc khi trình duyệt rảnh rỗi (idle)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Dự phòng rảnh sau khi tải xong toàn bộ trang
    let idleId: number | null = null;
    if ("requestIdleCallback" in window) {
      idleId = (window as Window).requestIdleCallback(
        () => {
          setShouldLoad(true);
        },
        { timeout: 5000 }
      );
    }

    return () => {
      observer.disconnect();
      if (idleId !== null && "cancelIdleCallback" in window) {
        (window as Window).cancelIdleCallback(idleId);
      }
    };
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
        className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 overflow-hidden min-h-[560px] flex items-center justify-center"
      >
        <div className="w-full max-w-4xl h-[480px] rounded-3xl bg-surface border border-line-strong p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-line-strong text-primary flex items-center justify-center mb-4 shadow-sm">
            <Box className="w-7 h-7 stroke-[2]" aria-hidden="true" />
          </div>
          <span className="text-[13px] font-medium text-ink-2 mb-2">
            Không gian mô phỏng 3D
          </span>
          <h3 className="font-display text-2xl font-bold text-ink mb-3">
            Khám phá Porsche 911 thời gian thực
          </h3>
          <p className="text-sm text-ink-2 max-w-md mb-6 leading-relaxed">
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
