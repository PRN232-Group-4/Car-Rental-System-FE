"use client";

import { Search, FileCheck2, Compass, RotateCcw, ChevronRight } from "lucide-react";
import RevealText from "@/components/ui/RevealText";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Đặt xe trực tuyến",
      description:
        "Chọn chi nhánh, thời gian nhận xe và dịch vụ kèm tài xế chuyên nghiệp. Tải ảnh GPLX để nhân viên duyệt nhanh.",
      icon: Search,
      highlight: "Duyệt nhanh trong 5 phút",
    },
    {
      step: "02",
      title: "Kiểm định & bàn giao",
      description:
        "Kỹ thuật viên cùng bạn kiểm tra xe thực tế, chốt số km và dung tích pin/nhiên liệu trên biên bản số hoá.",
      icon: FileCheck2,
      highlight: "Biên bản số hoá có ảnh",
    },
    {
      step: "03",
      title: "Tự do hành trình",
      description:
        "Tận hưởng chuyến đi riêng tư, an tâm với chính sách bảo hiểm và đội ngũ kỹ thuật hỗ trợ cứu hộ 24/7.",
      icon: Compass,
      highlight: "Bảo hiểm & cứu hộ 24/7",
    },
    {
      step: "04",
      title: "Trả xe & hoàn cọc",
      description:
        "Trả xe tại chi nhánh hoặc yêu cầu thu hồi tận nơi. Quyết toán chi phí minh bạch và hoàn cọc tự động qua PayOS.",
      icon: RotateCcw,
      highlight: "Hoàn cọc tức thì qua PayOS",
    },
  ];

  return (
    <section id="quy-trinh" className="scroll-mt-28 py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <RevealText
            as="h2"
            text="Trải nghiệm thuê xe 4 bước nhanh chóng"
            className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight"
          />
        </div>
        <p className="max-w-md text-sm sm:text-base text-neutral-600 leading-relaxed">
          Đơn giản hoá thủ tục giấy tờ, số hoá toàn bộ biên bản bàn giao giúp bạn bắt đầu chuyến đi chỉ trong 5 phút.
        </p>
      </div>

      {/* Unified Workflow Journey Bar on Desktop */}
      <div className="reveal hidden lg:block mb-8">
        <div className="glass-card rounded-2xl p-2.5 flex items-center justify-between">
          {steps.map((item, idx) => (
            <div key={item.step} className="flex-1 flex items-center">
              <div className="flex items-center gap-3 px-3 py-2 w-full">
                <span className="w-8 h-8 rounded-xl bg-[#059669] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs shadow-[#059669]/20">
                  {item.step}
                </span>
                <span className="text-xs font-bold text-neutral-800 truncate">
                  {item.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="px-2 flex items-center justify-center text-neutral-300 shrink-0">
                  <ChevronRight className="w-4 h-4 text-emerald-600/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4 Step Cards Grid */}
      <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="glass-card glass-hover rounded-3xl p-7 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Header: Step Pill & Clean Minimal Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black tracking-wider uppercase text-[#059669] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    Bước {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/80 border border-neutral-200/60 text-neutral-700 group-hover:text-[#059669] group-hover:border-emerald-300 transition-colors flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mb-2.5 group-hover:text-[#059669] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Bottom Feature Tag & Next Hint */}
              <div className="mt-8 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                  {item.highlight}
                </span>
                {index < steps.length - 1 ? (
                  <span className="text-xs font-semibold text-neutral-400 group-hover:text-[#059669] transition-colors flex items-center gap-1">
                    Tiếp theo
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#059669]">
                    Hoàn tất
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
