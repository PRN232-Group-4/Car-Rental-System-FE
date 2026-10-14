"use client";

import { Key, RefreshCw, Truck, FileCheck, CheckCircle2, Award, ShieldCheck } from "lucide-react";
import { Stage } from "@/components/ui/Stage";

export default function WhyChooseUs() {
  return (
    <Stage variant="ink" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Nền Tảng Vận Hành Chuẩn Mực & Đáng Tin Cậy
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-white/80 leading-relaxed font-normal">
            Không đơn thuần là nền tảng kết nối, Thong Dong trực tiếp bảo đảm chất lượng từng chiếc xe, từng hợp đồng và từng giao dịch hoàn cọc tức thì.
          </p>
        </div>

        {/* Gapless Bento Grid with mathematical interlocking (grid-auto-flow: dense) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [grid-auto-flow:dense]">
          {/* Card 1: 2-column span — Kiểm định 2 chiều Telemetry */}
          <div className="md:col-span-2 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-stage-ink border border-white/10 text-primary-tint flex items-center justify-center shadow-e1">
                  <FileCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                Kiểm Định 2 Chiều Trước & Sau Thuê
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-xl font-normal">
                Mỗi lượt bàn giao đều đi kèm biên bản điện tử: số km thực tế, mức pin SoH, áp suất 4 lốp và ảnh chụp 6 góc xe. Không có tình trạng tranh chấp hay đổ lỗi trầy xước không rõ nguyên nhân.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stage-ink border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-primary-tint shrink-0" />
                <span>Chụp ảnh 6 góc xe</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stage-ink border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-primary-tint shrink-0" />
                <span>Chốt Odometer & Pin</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stage-ink border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-primary-tint shrink-0" />
                <span>Ký biên bản điện tử</span>
              </div>
            </div>
          </div>

          {/* Card 2: 1-column span — 100% Đội xe chính chủ */}
          <div className="md:col-span-1 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-stage-ink border border-white/10 text-white flex items-center justify-center shadow-e1">
                  <Key className="w-6 h-6 stroke-[2.2] text-primary-tint" />
                </div>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                100% Đội Xe Chính Chủ
              </h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4 font-normal">
                Không có vai trò đối tác cá nhân, không chia hoa hồng và tuyệt đối không có trường hợp chủ xe tự ý huỷ chuyến sát giờ khởi hành.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-bold text-primary-tint">
              <Award className="w-4 h-4 shrink-0" />
              <span>Cam kết giữ xe 100% khi duyệt đơn</span>
            </div>
          </div>

          {/* Card 3: 1-column span — Hoàn cọc tự động qua PayOS */}
          <div className="md:col-span-1 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-stage-ink border border-white/10 text-primary-tint flex items-center justify-center shadow-e1">
                  <RefreshCw className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                Hoàn Cọc Tự Động Minh Bạch
              </h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4 font-normal">
                Ngay sau khi biên bản bàn giao trả xe được xác nhận đạt chuẩn, lệnh hoàn cọc được kích hoạt tự động qua cổng thanh toán PayOS về tài khoản nguồn.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs font-mono font-semibold text-white/70">
              Quyết toán tức thì · 0 ngày giam tiền
            </div>
          </div>

          {/* Card 4: 2-column span — Nhận xe tại trạm hoặc giao tận nơi */}
          <div className="md:col-span-2 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-e1">
                  <Truck className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                Nhận Xe Tại Smart Hub Hoặc Giao Tận Nơi 24/7
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-xl font-normal">
                Chủ động nhận xe tại các trung tâm điều phối quận trung tâm hoặc yêu cầu kỹ thuật viên lái xe giao tận sảnh nhà, khách sạn hoặc sân bay đúng giờ hẹn.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-tint" />
                Hỗ trợ kỹ thuật & cứu hộ pin 24/7
              </span>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-tint" />
                Xe sạc đầy pin $\ge 90\%$ trước giờ giao
              </span>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
