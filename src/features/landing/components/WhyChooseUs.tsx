"use client";

import { ShieldCheck, Key, RefreshCw, Truck, FileCheck, CheckCircle2, Award } from "lucide-react";
import RevealText from "@/components/ui/RevealText";

export default function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-2 block">
            Cam kết hệ thống
          </span>
          <RevealText
            as="h2"
            text="Nền tảng vận hành chuẩn mực & đáng tin cậy"
            className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight"
          />
        </div>
        <p className="max-w-md text-sm sm:text-base text-neutral-600 leading-relaxed">
          Không đơn thuần là nền tảng kết nối, Thong Dong trực tiếp bảo đảm chất lượng từng chiếc xe, từng hợp đồng và từng giao dịch hoàn cọc.
        </p>
      </div>

      {/* Gapless Bento Grid with mathematical interlocking */}
      <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-6 grid-flow-dense">
        {/* Card 1: 2-column span */}
        <div className="md:col-span-2 glass-card glass-hover specular-border rounded-3xl p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.18),transparent_70%)] pointer-events-none" />
          
          <div>
            <div className="w-12 h-12 rounded-2xl glass-pill text-[#059669] flex items-center justify-center mb-6 shadow-xs border-emerald-300/40">
              <FileCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
              Kiểm định 2 chiều trước và sau thuê
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 max-w-xl">
              Mỗi lượt bàn giao đều đi kèm biên bản kiểm tra số km thực tế, mức nhiên liệu/pin, áp suất lốp và ảnh chụp ngoại quan. Không có tình trạng tranh chấp hay đổ lỗi trầy xước không rõ nguyên nhân.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/60 text-xs font-semibold text-neutral-800">
            <div className="flex items-center gap-2 glass-sub p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chụp ảnh 6 góc xe</span>
            </div>
            <div className="flex items-center gap-2 glass-sub p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chốt km & pin/xăng</span>
            </div>
            <div className="flex items-center gap-2 glass-sub p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ký biên bản điện tử</span>
            </div>
          </div>
        </div>

        {/* Card 2: 1-column span */}
        <div className="md:col-span-1 glass-card glass-hover specular-border rounded-3xl p-7 sm:p-9 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl glass-pill text-neutral-900 flex items-center justify-center mb-6">
              <Key className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">
              100% Đội xe chính chủ
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Không có vai trò đối tác cá nhân, không chia hoa hồng và tuyệt đối không có trường hợp chủ xe tự ý huỷ chuyến sát giờ.
            </p>
          </div>

          <div className="pt-4 border-t border-white/60 flex items-center gap-2 text-xs font-bold text-[#059669]">
            <Award className="w-4 h-4" />
            <span>Cam kết giữ xe 100% khi đơn duyệt</span>
          </div>
        </div>

        {/* Card 3: 1-column span */}
        <div className="md:col-span-1 glass-card glass-hover specular-border rounded-3xl p-7 sm:p-9 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl glass-pill text-[#059669] flex items-center justify-center mb-6 shadow-xs border-emerald-300/40">
              <RefreshCw className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">
              Hoàn cọc tự động qua PayOS
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Sau khi biên bản kiểm định sau thuê (post-rental inspection) đạt chuẩn, tiền cọc được lệnh hoàn trả tự động về tài khoản nguồn.
            </p>
          </div>

          <div className="pt-4 border-t border-white/60 text-xs font-semibold text-neutral-600">
            Chuẩn thời gian quyết toán · Không giữ cọc
          </div>
        </div>

        {/* Card 4: 2-column span */}
        <div className="md:col-span-2 glass-card glass-hover specular-border rounded-3xl p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.12),transparent_70%)] pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#059669] text-white flex items-center justify-center mb-6 shadow-md shadow-[#059669]/30">
              <Truck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
              Linh hoạt nhận tại trạm hoặc giao xe tận nơi
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 max-w-xl">
              Chủ động nhận xe tại chuỗi chi nhánh trung tâm, sân bay Tân Sơn Nhất hoạt động 24/7, hoặc đặt dịch vụ giao tận cửa nhà và khách sạn theo khung giờ yêu cầu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/60 text-xs font-semibold text-neutral-800">
            <div className="flex items-center gap-2 glass-sub p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Mọi chuyến thuê đều kèm tài xế chuyên nghiệp</span>
            </div>
            <div className="flex items-center gap-2 glass-sub p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Gói thuê bao trừ dần theo số giờ thực tế</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
