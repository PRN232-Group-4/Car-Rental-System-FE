"use client";

import { useState, useRef } from "react";
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  Cpu, 
  Gauge, 
  BatteryCharging, 
  Camera, 
  ArrowRight,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { playTactileClick } from "@/lib/audio/haptic-audio";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

type InspectionPhase = "pre" | "post";

export default function InspectionSection() {
  const [phase, setPhase] = useState<InspectionPhase>("pre");
  const containerRef = useRef<HTMLElement>(null);
  const scanContentRef = useRef<HTMLDivElement>(null);

  const handlePhaseSwitch = (newPhase: InspectionPhase) => {
    if (newPhase === phase) return;
    playTactileClick();
    setPhase(newPhase);

    if (
      scanContentRef.current &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.fromTo(
        scanContentRef.current,
        { y: 8 },
        { y: 0, clearProps: "transform", duration: 0.35, ease: "power2.out" }
      );
    }
  };

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-scanner-panel]", {
          y: 16,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section 
      id="cong-nghe" 
      ref={containerRef} 
      className="relative mx-auto w-full max-w-[1720px] scroll-mt-24 px-4 sm:px-6 lg:px-12 py-8 sm:py-10 overflow-hidden"
    >
      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h2 data-kinetic-skew="true" className="font-display text-3xl sm:text-5xl font-black tracking-tight text-ink text-balance">
            Kiểm định minh bạch &amp; Quyết toán tức thì
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm leading-relaxed text-ink-2 text-balance">
          Biên bản số hóa bất biến trước và sau chuyến đi, làm căn cứ đối soát minh bạch và giải phóng tiền cọc qua PayOS trong 15 phút.
        </p>
      </div>

      {/* Interactive Phase Toggle Tabs */}
      <div className="relative z-10 flex items-center justify-start mb-8">
        <div className="p-1 bg-surface border border-line-strong flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePhaseSwitch("pre")}
            className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              phase === "pre"
                ? "bg-stage-ink text-white"
                : "text-ink-2 hover:text-ink hover:bg-sunken"
            }`}
          >
            <span>Bàn giao nhận xe (Pre-Rental)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePhaseSwitch("post")}
            className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              phase === "post"
                ? "bg-stage-ink text-white"
                : "text-ink-2 hover:text-ink hover:bg-sunken"
            }`}
          >
            <span>Đối soát hoàn trả &amp; Hoàn cọc (Post-Rental)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Split Scanner Grid */}
      <div ref={scanContentRef} className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Telemetry Visual Scanner Bay (7 cols) */}
        <div data-scanner-panel className="lg:col-span-7 rounded-3xl bg-surface border border-line-strong p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
              <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-ink">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
                <span>
                  {phase === "pre" 
                    ? "BIÊN BẢN GIAO XE SỐ HÓA TẠI ĐIỂM NHẬN" 
                    : "BIÊN BẢN HOÀN TRẢ & ĐỐI SOÁT DỮ LIỆU TELEMATICS"}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 bg-primary-tint text-primary font-bold">
                {phase === "pre" ? "Trạng thái: Đã niêm phong" : "Trạng thái: Hoàn cọc tự động"}
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-ink mb-2">
              {phase === "pre"
                ? "Kiểm định đa điểm trước giờ lăn bánh"
                : "Đối chiếu tự động giữa hai đầu hành trình"}
            </h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed mb-6">
              {phase === "pre"
                ? "Hệ thống chụp 8 góc ngoại quan độ phân giải cao và ghi nhận tự động chỉ số Odometer, mức pin/nhiên liệu từ cảm biến xe."
                : "Hệ thống đối chiếu từng megapixel ảnh chụp cùng dữ liệu telematics gửi về máy chủ, bảo đảm 100% không phát sinh tranh chấp."}
            </p>

            {/* Telemetry Sensor Inspection List */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-canvas border border-line flex items-center justify-between">
                <div className="flex items-center gap-3 text-ink">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Chỉ số Odometer</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-ink block">
                    {phase === "pre" ? "14.210 km (Khóa ban đầu)" : "14.485 km (+275 km)"}
                  </span>
                  <span className="text-[10px] text-ink-3">
                    {phase === "pre" ? "Ghi nhận bởi Telematics" : "Đúng định mức lộ trình"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-canvas border border-line flex items-center justify-between">
                <div className="flex items-center gap-3 text-ink">
                  <BatteryCharging className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Mức Năng lượng / Pin</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-success block">
                    {/* TODO-DATA (InspectionSection.tsx:188): Hiển thị nhãn Pin 94% và cảm biến BMS cho xe tiêu điểm Carrera 4S (động cơ xăng) */}
                    {phase === "pre" ? "Pin 94% (Sẵn sàng cao tốc)" : "Pin 94% (Khớp 100%)"}
                  </span>
                  <span className="text-[10px] text-ink-3">
                    {phase === "pre" ? "Chứng thực cảm biến BMS" : "0đ phụ phí sạc hoàn trả"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-canvas border border-line flex items-center justify-between">
                <div className="flex items-center gap-3 text-ink">
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Ngoại quan 8 góc</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-success block">
                    {phase === "pre" ? "8 Ảnh HDR nguyên bản" : "0 Vết xước phát sinh"}
                  </span>
                  <span className="text-[10px] text-ink-3">
                    {phase === "pre" ? "Ký số hai bên trong 60 giây" : "Đối soát ảnh AI trùng khớp"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-canvas border border-line flex items-center justify-between">
                <div className="flex items-center gap-3 text-ink">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Cảm biến an toàn TPMS &amp; Phanh</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-success block">
                    {phase === "pre" ? "Áp suất 2.4 Bar [CHUẨN]" : "Má phanh 92% [AN TOÀN]"}
                  </span>
                  <span className="text-[10px] text-ink-3">Đạt chứng chỉ kỹ thuật Thong Dong</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex items-center gap-2 text-xs text-ink-3">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <span>Biên bản mã hóa SHA-256 lưu trữ đồng thời trên ứng dụng khách hàng và máy chủ độc lập</span>
          </div>
        </div>

        {/* Right Telemetry Big-Number HUD & Financial Settlement (5 cols) */}
        <div data-scanner-panel className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Top Big Metric Card */}
          <div className="rounded-3xl bg-surface border border-line-strong p-6 sm:p-8 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-ink-3 mb-2">
                <span>CHỈ SỐ ĐỐI SOÁT CỐT LÕI</span>
                <span className="text-primary font-bold">2 LƯỢT / CHUYẾN</span>
              </div>

              <div className="font-mono text-4xl sm:text-6xl font-black text-primary tracking-tight tabular-nums mb-3">
                {phase === "pre" ? "60s" : "15m"}
              </div>

              <h4 className="font-display text-xl font-bold text-ink mb-1">
                {phase === "pre" ? "Quy trình bàn giao số hóa" : "Giải phóng hoàn cọc PayOS"}
              </h4>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                {phase === "pre"
                  ? "Ký biên bản điện tử trực tiếp trên điện thoại, mở khóa xe qua ứng dụng không cần chờ đợi thủ tục giấy tờ rườm rà."
                  : "Hệ thống tự động kích hoạt lệnh hoàn cọc trực tiếp về tài khoản ngân hàng của bạn ngay khi biên bản trả xe được ký."}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs font-mono">
              <span className="text-ink-3">Chi phí phát sinh ẩn</span>
              <span className="font-bold text-success">0 VNĐ tuyệt đối</span>
            </div>
          </div>

          {/* Bottom Financial Security Box */}
          <div className="rounded-3xl bg-stage-ink text-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-bold mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>BẢO HÀNH MINH BẠCH TÀI CHÍNH</span>
              </div>
              <h4 className="font-display text-xl font-bold text-white mb-2">
                Không phí ẩn. Không tranh chấp biên bản.
              </h4>
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                Mọi hình ảnh vết trầy và dữ liệu km được niêm phong vào hợp đồng. Quyền lợi tiền cọc của khách hàng được pháp lý bảo hộ 100%.
              </p>
            </div>

            <Button
              as="a"
              href="/my-rentals"
              variant="marketing-cta"
              size="md"
              className="w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
            >
              <span>Xem đơn thuê của bạn</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
}
