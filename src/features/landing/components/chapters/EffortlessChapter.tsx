"use client";

import { CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "XÁC MINH SỐ HÓA",
    subtitle: "60 GIÂY KHÔNG GIẤY TỜ GỐC",
    desc: "Hệ thống tự động đối chiếu CCCD gắn chip và Giấy phép lái xe qua camera điện thoại. Không giữ cọc thế chấp bằng hiện vật, không thủ tục rườm rà.",
    icon: CheckCircle2,
    badge: "BẢO MẬT ĐA LỚP",
  },
  {
    number: "02",
    title: "BÀN GIAO TỨC THÌ",
    subtitle: "TẠI TRẠM HOẶC GIAO TẬN NƠI",
    desc: "Nhận xe tại 6 trạm trung tâm TP.HCM hoặc bàn giao tận cửa trong 45 phút. Chìa khóa kỹ thuật số kích hoạt trực tiếp, xe sẵn sàng khởi hành ngay lập tức.",
    icon: KeyRound,
    badge: "CHÌA KHÓA KỸ THUẬT SỐ",
  },
  {
    number: "03",
    title: "HOÀN CỌC TỰ ĐỘNG",
    subtitle: "PAYOS QUYẾT TOÁN TRONG 15 PHÚT",
    desc: "Biên bản bàn giao số hóa đối soát minh bạch 112 điểm kỹ thuật. Toàn bộ tiền cọc được hệ thống hoàn trả tự động vào tài khoản ngân hàng trong 15 phút.",
    icon: ShieldCheck,
    badge: "ĐỐI SOÁT PAYOS 24/7",
  },
];

export default function EffortlessChapter() {
  return (
    <section
      id="quy-trinh"
      data-chapter="sun"
      className="relative w-full min-h-[160vh] bg-sun-600 text-white px-6 sm:px-12 py-24 sm:py-32 select-none overflow-visible"
    >
      {/* Chapter header */}
      <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
        <span className="font-mono text-xs uppercase tracking-widest text-white/70 block mb-4">
          03 / CHƯƠNG III · TRẢI NGHIỆM
        </span>
        <h2 className="font-display uppercase tracking-tight text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight">
          Nhẹ như không.
        </h2>
        <p className="font-sans text-sm sm:text-base text-white/90 max-w-xl mx-auto mt-4 leading-relaxed">
          Ba bước loại bỏ hoàn toàn ma sát thủ tục hành chính, mang lại trải nghiệm tự do trọn vẹn.
        </p>
      </div>

      {/* 3 Vertical Sticky Printed Plates (rounded-none, no cards) */}
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 pb-24">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="sticky top-28 sm:top-36 bg-ink-950 text-bone-100 border border-bone-100/20 rounded-none p-8 sm:p-12 shadow-2xl transition-transform"
              style={{ zIndex: idx + 1 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-bone-100/15 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-sun-400">
                    {step.number}
                  </span>
                  <h3 className="font-display uppercase tracking-tight text-2xl sm:text-3xl font-black text-bone-100">
                    {step.title}
                  </h3>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-sun-400 border border-sun-400/40 px-2 py-1 rounded-none">
                  {step.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-9 space-y-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-bone-100/60 block">
                    {step.subtitle}
                  </span>
                  <p className="font-sans text-sm sm:text-base text-bone-100/80 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="md:col-span-3 flex justify-start md:justify-end">
                  <div className="w-16 h-16 border border-bone-100/20 rounded-none flex items-center justify-center text-sun-400 bg-ink-800">
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
