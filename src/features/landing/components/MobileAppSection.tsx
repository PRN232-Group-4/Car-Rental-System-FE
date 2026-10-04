"use client";

import { Smartphone, CheckCircle2, Download, Zap } from "lucide-react";
import { Stage } from "@/components/ui/Stage";
import { Button } from "@/components/ui/Button";

export default function MobileAppSection() {
  return (
    <Stage variant="ink" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-ink text-white rounded-3xl p-8 sm:p-14 overflow-hidden relative shadow-e3 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stage-ink border border-white/15 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>NATIVE MOBILE ECOSYSTEM</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-[1.12] text-white">
                Quản Lý Toàn Bộ Chuyến Đi Trong Lòng Bàn Tay
              </h2>

              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-normal">
                Ứng dụng di động Thong Dong đồng bộ hoá toàn diện cho Khách hàng và Đội ngũ kỹ thuật. Hỗ trợ số hoá kiểm định, mở khoá trạm nhận xe, tra cứu số dư giờ thuê bao và yêu cầu cứu hộ khẩn cấp tức thời.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Theo dõi vị trí trạm sạc & lượng pin khả dụng theo thời gian thực</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ký biên bản kiểm định 2 chiều điện tử và lưu trữ hoá đơn PayOS</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kích hoạt cứu hộ pin và hỗ trợ hành trình 24/7 chỉ với 1 chạm</span>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button
                  as="a"
                  href="#tai-app"
                  variant="secondary"
                  className="bg-white text-ink hover:bg-sunken border-transparent shadow-e1 py-3 px-5 group"
                >
                  <Smartphone className="w-5 h-5 text-primary shrink-0" />
                  <div className="text-left ml-2">
                    <span className="text-[10px] text-ink-3 uppercase block leading-none font-bold">
                      Tải về trên
                    </span>
                    <span className="text-xs font-extrabold text-ink">Apple App Store</span>
                  </div>
                </Button>

                <Button
                  as="a"
                  href="#tai-app"
                  variant="secondary-stage"
                  className="py-3 px-5 group"
                >
                  <Download className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-left ml-2">
                    <span className="text-[10px] text-white/60 uppercase block leading-none font-bold">
                      Cài đặt từ
                    </span>
                    <span className="text-xs font-extrabold text-white">Google Play Store</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Smartphone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 h-[440px] rounded-[40px] p-3 bg-stage-ink border-4 border-white/10 shadow-e3 overflow-hidden">
                <div className="w-full h-full rounded-[30px] overflow-hidden relative bg-[#09120e] flex flex-col justify-between p-5 text-white border border-white/10">
                  <div>
                    {/* Dynamic Island / Speaker notch */}
                    <div className="w-20 h-4 bg-white/10 rounded-full mx-auto mb-6" />

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-emerald-400">THONG DONG EV</span>
                      <span className="text-[11px] font-mono text-white/60">v3.0.0</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-3 shadow-e1">
                      <span className="text-[11px] text-white/60 block mb-0.5">Gói thuê bao hiện hữu</span>
                      <span className="font-mono text-xl font-bold text-white block">38 giờ khả dụng</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">Đang kích hoạt · Hạn 42 ngày</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-e1">
                      <span className="text-[11px] text-white/60 block mb-0.5">Hành trình sắp tới</span>
                      <span className="text-xs font-bold text-white block mb-0.5">VinFast VF 8 Plus</span>
                      <span className="text-[11px] text-white/60 block">Smart EV Hub Quận 1 · 09:00</span>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-1.5 border-t border-white/10">
                        <span>Pin: 96%</span>
                        <span>Odo: 12.450 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full py-3 bg-primary rounded-xl text-xs font-bold text-center text-white shadow-e2 select-none">
                    Mở khoá nhận xe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
