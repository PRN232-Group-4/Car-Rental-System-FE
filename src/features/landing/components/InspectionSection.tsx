"use client";

import { useRef } from "react";
import { FileCheck2, ClipboardCheck, ArrowRight, ShieldCheck, ArrowLeftRight, CheckCircle2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

/**
 * InspectionSection: Bento Grid 5 ô chuẩn mực không có ô trống (Hàng 1: 8 + 4; Hàng 2: 4 + 4 + 4 = 12 cột).
 * Dựa 100% trên dữ liệu kiểm định 2 chiều thực tế của hệ thống (SRS §3.8, §4.4 và InspectionRequest schema).
 * Bổ sung Telemetry Ledger thực tế giữa Pre-Rental và Post-Rental minh bạch.
 */
export default function InspectionSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Tối ưu hiệu năng render hàng loạt phần tử DOM mà vẫn đảm bảo nhịp điệu đọc.
  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const cards = el.querySelectorAll("[data-inspection-card]");
        gsap.set(cards, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.batch("[data-inspection-card]", {
          interval: 0.1,
          batchMax: 5,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.08, overwrite: "auto" }
            ),
          start: "top 85%",
          once: true,
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section id="cong-nghe" ref={containerRef} className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
            TELEMETICS &amp; BIÊN BẢN SỐ HÓA // SRS §3.8 &amp; §4.4
          </span>
          <h2 className="font-display text-3xl font-black tracking-tight text-ink sm:text-5xl text-balance">
            Kiểm định hai chiều và quyết toán
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-2 sm:text-base text-balance">
          Biên bản minh bạch trước và sau chuyến đi, làm căn cứ đối chiếu tình trạng xe và hoàn cọc tự động qua PayOS.
        </p>
      </div>

      {/* Bento Grid 5 ô không ô trống: Hàng 1 (8 + 4 = 12 cols); Hàng 2 (4 + 4 + 4 = 12 cols) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
        {/* Ô 1: Tiêu điểm Biên bản 2 chiều kèm Telemetry Ledger (8 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 shadow-sm transition-all sm:col-span-2 lg:col-span-8">
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink">
                  Đối soát dữ liệu hành trình hai chiều
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10">
                LIVE TELEMETRY
              </span>
            </div>

            <h3 className="font-display mb-2 text-xl font-bold text-ink sm:text-2xl">
              Biên bản bàn giao và đối soát số hóa
            </h3>
            <p className="mb-6 max-w-xl text-xs leading-relaxed text-ink-2 sm:text-sm">
              Kỹ thuật viên cùng cảm biến xe ghi nhận tự động tại hai đầu hành trình: lúc giao xe và lúc nhận hoàn trả.
            </p>

            {/* Structured 3-column comparison ledger */}
            <div className="rounded-2xl border border-line bg-canvas p-4 sm:p-5 font-mono text-xs">
              <div className="grid grid-cols-12 pb-3 mb-3 border-b border-line text-[11px] font-bold text-ink-3 uppercase tracking-wider">
                <div className="col-span-4">Hạng mục kiểm tra</div>
                <div className="col-span-4 text-center">Lúc nhận (Pre-Rental)</div>
                <div className="col-span-4 text-right">Lúc trả (Post-Rental)</div>
              </div>

              {/* Row 1: Odometer */}
              <div className="grid grid-cols-12 items-center py-2.5 border-b border-line/60 tabular-nums">
                <div className="col-span-4 font-semibold text-ink flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Odometer</span>
                </div>
                <div className="col-span-4 text-center text-ink-2">14.210 km</div>
                <div className="col-span-4 text-right text-success font-semibold">
                  14.485 km <span className="text-[10px] text-ink-3">(+275 km · Chuẩn)</span>
                </div>
              </div>

              {/* Row 2: Mức Năng Lượng */}
              <div className="grid grid-cols-12 items-center py-2.5 border-b border-line/60 tabular-nums">
                <div className="col-span-4 font-semibold text-ink flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Mức Năng Lượng</span>
                </div>
                <div className="col-span-4 text-center text-ink-2">Pin 94%</div>
                <div className="col-span-4 text-right text-success font-semibold">
                  Pin 94% <span className="text-[10px] text-ink-3">(Khớp chuẩn)</span>
                </div>
              </div>

              {/* Row 3: Ngoại quan 8 góc */}
              <div className="grid grid-cols-12 items-center pt-2.5 tabular-nums">
                <div className="col-span-4 font-semibold text-ink flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Ngoại quan 8 góc</span>
                </div>
                <div className="col-span-4 text-center text-ink-2">8 ảnh HDR gốc</div>
                <div className="col-span-4 text-right text-success font-semibold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>0 vết xước mới [ĐẠT 100%]</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-ink-3">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span>Biên bản số ký mã hóa SHA-256 lưu trữ đồng thời trên tài khoản khách hàng và máy chủ</span>
          </div>
        </div>

        {/* Ô 2: Ô số liệu lớn - 2 lượt kiểm định mỗi chuyến (4 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 shadow-sm transition-all sm:col-span-1 lg:col-span-4">
          <div>
            <div className="font-display text-5xl sm:text-6xl font-black text-primary tracking-tight leading-none mb-3">
              2
            </div>

            <h3 className="font-display mb-2 text-lg font-bold text-ink">
              Lượt kiểm định mỗi chuyến
            </h3>
            <p className="text-xs leading-relaxed text-ink-2 mb-4">
              Bắt buộc khi nhận xe (pre_rental) và khi trả xe (post_rental). Đối soát hai chiều bằng hình ảnh thực tế và chỉ số đo đạc minh bạch.
            </p>
          </div>

          <div className="border-t border-line pt-4 text-xs font-mono text-ink-3">
            Quy trình chuẩn SRS FR-015 &amp; FR-016
          </div>
        </div>

        {/* Ô 3: Ô nhịp tương phản - Minh bạch tài chính (4 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-stage-ink text-white p-7 shadow-sm transition-all sm:col-span-1 lg:col-span-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              Minh bạch tài chính
            </span>

            <h3 className="font-display mt-3 mb-2 text-lg font-bold text-white">
              Không phí ẩn. Không tranh chấp biên bản.
            </h3>
            <p className="text-xs leading-relaxed text-white/70 mb-4">
              Ảnh chụp hiện trường và dữ liệu đo đạc được lưu trữ bất biến vào hồ sơ điện tử, bảo đảm quyền lợi đôi bên.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-white/60">
            Đối soát biên bản trước khi phê duyệt hoàn cọc
          </div>
        </div>

        {/* Ô 4: Kiểm tra kỹ thuật và chỉ số thực tế (4 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 shadow-sm transition-all sm:col-span-1 lg:col-span-4">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-line text-primary">
              <Cpu className="h-5 w-5" aria-hidden="true" />
            </div>

            <h3 className="font-display mb-2 text-lg font-bold text-ink">
              Cảm biến kỹ thuật &amp; Telematics
            </h3>
            <p className="text-xs leading-relaxed text-ink-2 mb-4">
              Hệ thống đọc dữ liệu cảm biến thời gian thực trước mỗi lần giao xe:
            </p>

            {/* 3-row technical sensor readout */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-line">
                <span className="text-ink-2">Áp suất lốp TPMS</span>
                <span className="font-bold text-success">2.4 Bar [CHUẨN]</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-line">
                <span className="text-ink-2">Độ dày má phanh</span>
                <span className="font-bold text-success">92% [AN TOÀN]</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-line">
                <span className="text-ink-2">Điện áp Pin / Ắc quy</span>
                <span className="font-bold text-success">100% [SẴN SÀNG]</span>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <span className="text-xs font-semibold text-primary">
              Ngắt vận hành an toàn
            </span>
            <p className="mt-1 text-xs text-ink-3">
              Chỉ xe đạt 100% tiêu chí cảm biến mới được hệ thống mở khóa bàn giao
            </p>
          </div>
        </div>

        {/* Ô 5: Quyết toán và hoàn cọc minh bạch (4 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 shadow-sm transition-all sm:col-span-1 lg:col-span-4">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-line text-primary">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            </div>

            <h3 className="font-display mb-2 text-lg font-bold text-ink">
              Quyết toán và hoàn cọc
            </h3>
            <p className="text-xs leading-relaxed text-ink-2 mb-4">
              Khấu trừ phụ phí (nếu có) theo đúng biên bản đối chiếu và thực hiện phê duyệt hoàn cọc tự động qua cổng PayOS.
            </p>

            {/* 2-step settlement status pill */}
            <div className="space-y-2 mb-4 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-canvas border border-line flex items-center justify-between">
                <span className="text-ink-2">[01] Đối soát tự động</span>
                <span className="font-bold text-primary">0đ phụ phí</span>
              </div>
              <div className="p-2.5 rounded-xl bg-canvas border border-line flex items-center justify-between">
                <span className="text-ink-2">[02] Hoàn cọc PayOS</span>
                <span className="font-bold text-success">&lt; 15 phút</span>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <Button
              as="a"
              href="/my-rentals"
              variant="marketing-cta"
              className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold"
            >
              <span>Xem đơn thuê của bạn</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
