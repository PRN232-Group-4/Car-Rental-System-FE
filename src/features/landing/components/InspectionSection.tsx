"use client";

import { useRef } from "react";
import { FileCheck2, ClipboardCheck, ArrowRight, ShieldCheck, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

/**
 * InspectionSection: Bento Grid 5 ô chuẩn mực không có ô trống (Hàng 1: 8 + 4; Hàng 2: 4 + 4 + 4 = 12 cột).
 * Dựa 100% trên dữ liệu kiểm định 2 chiều thực tế của hệ thống (SRS §3.8, §4.4 và InspectionRequest schema).
 * Không sử dụng thẻ lồng thẻ (no card nesting), không nhãn mono trang trí giả lập.
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
    <section id="kiem-dinh" ref={containerRef} className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-ink sm:text-5xl">
            Kiểm định hai chiều và quyết toán
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-2 sm:text-base">
          Biên bản minh bạch trước và sau chuyến đi, làm căn cứ đối chiếu tình trạng xe và hoàn cọc.
        </p>
      </div>

      {/* Bento Grid 5 ô không ô trống: Hàng 1 (8 + 4 = 12 cols); Hàng 2 (4 + 4 + 4 = 12 cols) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
        {/* Ô 1: Tiêu điểm Biên bản 2 chiều (8 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 shadow-sm transition-all sm:col-span-2 lg:col-span-8">
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink">
                  Quy trình kiểm định hai chiều
                </span>
              </div>
              <span className="text-xs font-medium text-primary">
                Đối chiếu bàn giao
              </span>
            </div>

            <h3 className="font-display mb-2 text-xl font-bold text-ink sm:text-2xl">
              Biên bản bàn giao và nhận lại xe
            </h3>
            <p className="mb-6 max-w-xl text-xs leading-relaxed text-ink-2 sm:text-sm">
              Kỹ thuật viên ghi nhận độc lập tại hai đầu hành trình: lúc giao xe và lúc nhận xe hoàn trả.
            </p>

            {/* Hai mốc đối chiếu dạng danh sách phẳng, không lồng viền thẻ */}
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <div className="border-l-2 border-primary/40 pl-4 space-y-1">
                <span className="text-xs font-semibold text-primary">Giao xe ban đầu</span>
                <p className="text-xs text-ink-2 leading-relaxed">
                  Lưu ảnh thân vỏ ban đầu, công-tơ-mét xuất phát và mức nhiên liệu hoặc pin sẵn sàng.
                </p>
              </div>

              <div className="border-l-2 border-line-strong pl-4 space-y-1">
                <span className="text-xs font-semibold text-ink">Nhận xe kết thúc</span>
                <p className="text-xs text-ink-2 leading-relaxed">
                  Đối chiếu số km đã đi, mức năng lượng tiêu hao và ghi nhận sai lệch nếu có.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-ink-3">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span>Biên bản số lưu trữ trên tài khoản người thuê và hệ thống vận hành</span>
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
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-[#1E293B] bg-[#0F172A] text-[#F1F5F9] dark:border-[#334155] dark:bg-[#1A2234] p-7 shadow-sm transition-all sm:col-span-1 lg:col-span-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              Minh bạch tài chính
            </span>

            <h3 className="font-display mt-3 mb-2 text-lg font-bold text-white">
              Không phí ẩn. Không tranh chấp biên bản.
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 dark:text-ink-2 mb-4">
              Ảnh chụp hiện trường và dữ liệu đo đạc được lưu trữ bất biến vào hồ sơ điện tử, bảo đảm quyền lợi đôi bên.
            </p>
          </div>

          <div className="border-t border-slate-800 dark:border-line pt-4 text-xs text-slate-400 dark:text-ink-3">
            Đối soát biên bản trước khi phê duyệt hoàn cọc
          </div>
        </div>

        {/* Ô 4: Kiểm tra kỹ thuật và chỉ số thực tế (4 cột trên Desktop) */}
        <div data-inspection-card className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 shadow-sm transition-all sm:col-span-1 lg:col-span-4">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-line text-primary">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
            </div>

            <h3 className="font-display mb-2 text-lg font-bold text-ink">
              Kiểm tra kỹ thuật &amp; bảo dưỡng
            </h3>
            <p className="text-xs leading-relaxed text-ink-2 mb-4">
              Nếu xe không đạt chuẩn an toàn, hệ thống ngắt vận hành để chuyển sang bảo trì trước khi tiếp nhận chuyến mới.
            </p>
          </div>

          <div className="border-t border-line pt-4">
            <span className="text-xs font-semibold text-primary">
              Ngắt vận hành an toàn
            </span>
            <p className="mt-1 text-xs text-ink-3">
              Chỉ xe đạt chuẩn kỹ thuật mới được phép nhận chuyến mới
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
              Khấu trừ phụ phí (nếu có) theo đúng biên bản đối chiếu và thực hiện phê duyệt hoàn cọc minh bạch qua tài khoản liên kết.
            </p>
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
