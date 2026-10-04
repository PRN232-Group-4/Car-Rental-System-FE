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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
              Tiêu chuẩn Thong Dong
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Nền tảng vận hành chuẩn mực & đáng tin cậy
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-white/80 leading-relaxed font-normal">
            Không đơn thuần là nền tảng kết nối, Thong Dong trực tiếp bảo đảm chất lượng từng chiếc xe, từng hợp đồng và từng giao dịch hoàn cọc.
          </p>
        </div>

        {/* Gapless Bento Grid with mathematical interlocking (grid-auto-flow: dense) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [grid-auto-flow:dense]">
          {/* Card 1: 2-column span */}
          <div className="md:col-span-2 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stage-ink border border-border-dim text-emerald-400 flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                Kiểm định 2 chiều trước và sau thuê
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-xl">
                Mỗi lượt bàn giao đều đi kèm biên bản kiểm tra số km thực tế, mức nhiên liệu/pin, áp suất lốp và ảnh chụp ngoại quan. Không có tình trạng tranh chấp hay đổ lỗi trầy xước không rõ nguyên nhân.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border-dim text-xs font-semibold text-white/90">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stage-ink border border-border-dim">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Chụp ảnh 6 góc xe</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stage-ink border border-border-dim">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Chốt km & pin/xăng</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stage-ink border border-border-dim">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ký biên bản điện tử</span>
              </div>
            </div>
          </div>

          {/* Card 2: 1-column span */}
          <div className="md:col-span-1 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stage-ink border border-border-dim text-white flex items-center justify-center mb-6">
                <Key className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                100% Đội xe chính chủ
              </h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                Không có vai trò đối tác cá nhân, không chia hoa hồng và tuyệt đối không có trường hợp chủ xe tự ý huỷ chuyến sát giờ.
              </p>
            </div>

            <div className="pt-4 border-t border-border-dim flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Award className="w-4 h-4" />
              <span>Cam kết giữ xe 100% khi đơn duyệt</span>
            </div>
          </div>

          {/* Card 3: 1-column span */}
          <div className="md:col-span-1 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stage-ink border border-border-dim text-emerald-400 flex items-center justify-center mb-6">
                <RefreshCw className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Hoàn cọc tự động qua PayOS
              </h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                Sau khi biên bản kiểm định sau thuê (post-rental inspection) đạt chuẩn, tiền cọc được lệnh hoàn trả tự động về tài khoản nguồn.
              </p>
            </div>

            <div className="pt-4 border-t border-border-dim text-xs font-semibold text-white/60">
              Chuẩn thời gian quyết toán · Không giữ cọc
            </div>
          </div>

          {/* Card 4: 2-column span */}
          <div className="md:col-span-2 glass-ink rounded-3xl p-7 sm:p-9 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-elevation-1">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                Linh hoạt nhận tại trạm hoặc giao xe tận nơi
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-xl">
                Chủ động nhận xe tại chuỗi chi nhánh trung tâm, sân bay Tân Sơn Nhất hoạt động 24/7, hoặc đặt dịch vụ giao tận cửa nhà và khách sạn theo khung giờ yêu cầu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border-dim text-xs font-semibold text-white/90">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stage-ink border border-border-dim">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mọi chuyến thuê đều kèm tài xế chuyên nghiệp</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stage-ink border border-border-dim">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gói thuê bao trừ dần theo số giờ thực tế</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
