"use client";

import { Smartphone, CheckCircle2, Download } from "lucide-react";
import { Stage } from "@/components/ui/Stage";
import { Button } from "@/components/ui/Button";

export default function MobileAppSection() {
  return (
    <Stage variant="ink" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-ink text-white rounded-3xl p-8 sm:p-14 overflow-hidden relative shadow-elevation-2 border border-border-dim">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                Thuê xe & quản lý hành trình dễ dàng mọi lúc, mọi nơi
              </h2>

              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-normal">
                Ứng dụng di động Thong Dong dành cho Khách hàng và Tài xế/Nhân viên điều phối. Cho phép mở khoá kiểm tra xe, tra cứu số giờ gói thuê bao còn lại, nhận thông báo đẩy và báo cáo sự cố tức thời.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Theo dõi vị trí chi nhánh và tình trạng khả dụng thời gian thực</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Số hoá toàn bộ hoá đơn điện tử và lịch sử chuyến đi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tài xế nhận phân bổ xe và cập nhật kiểm định trực tiếp</span>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button
                  as="a"
                  href="#"
                  variant="secondary"
                  className="bg-white text-stage-ink hover:bg-neutral-100 border-transparent shadow-elevation-1 py-3 px-5"
                >
                  <Smartphone className="w-5 h-5 text-primary shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] text-ink-muted uppercase block leading-none font-semibold">
                      Tải về trên
                    </span>
                    <span className="text-xs font-extrabold text-ink">Apple App Store</span>
                  </div>
                </Button>

                <Button
                  as="a"
                  href="#"
                  variant="secondary-stage"
                  className="py-3 px-5"
                >
                  <Download className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] text-white/60 uppercase block leading-none font-medium">
                      Cài đặt từ
                    </span>
                    <span className="text-xs font-extrabold text-white">Google Play Store</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 h-[420px] rounded-[36px] p-3 bg-stage-ink border-4 border-border-dim shadow-elevation-2 overflow-hidden">
                <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-stage-ink flex flex-col justify-between p-5 text-white border border-border-dim">
                  <div>
                    <div className="w-16 h-4 bg-border-dim rounded-full mx-auto mb-6" />
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-emerald-400">Thong Dong App</span>
                      <span className="text-xs text-white/60">Phiên bản 2.0</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stage-ink border border-border-dim mb-3">
                      <span className="text-xs text-white/60 block mb-1">Gói thuê bao hiện có</span>
                      <span className="text-lg font-bold text-white block">38 giờ còn lại</span>
                      <span className="text-xs text-emerald-400 font-semibold">Đang hoạt động · Hạn 42 ngày</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stage-ink border border-border-dim">
                      <span className="text-xs text-white/60 block mb-1">Chuyến sắp tới</span>
                      <span className="text-xs font-bold text-white block">Toyota Corolla Cross</span>
                      <span className="text-xs text-white/60">Nhận tại Chi nhánh Q1 · 09:00</span>
                    </div>
                  </div>

                  <div className="w-full py-2.5 bg-primary rounded-xl text-xs font-bold text-center text-white">
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
