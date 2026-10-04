"use client";

import { Smartphone, CheckCircle2, Download } from "lucide-react";
import RevealText from "@/components/ui/RevealText";

export default function MobileAppSection() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="glass-dark text-white rounded-3xl p-8 sm:p-14 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.28),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="reveal lg:col-span-7 space-y-6">
            <RevealText
              as="h2"
              text="Thuê xe & quản lý hành trình dễ dàng mọi lúc, mọi nơi"
              className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
            />

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-normal">
              Ứng dụng di động Thong Dong dành cho Khách hàng và Tài xế/Nhân viên điều phối. Cho phép mở khoá kiểm tra xe, tra cứu số giờ gói thuê bao còn lại, nhận thông báo đẩy qua FCM và báo cáo sự cố tức thời.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Theo dõi vị trí chi nhánh và tình trạng khả dụng thời gian thực</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Số hoá toàn bộ hoá đơn điện tử và lịch sử chuyến đi</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tài xế nhận phân bổ xe (vehicle assignments) và cập nhật kiểm định trực tiếp</span>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                className="px-6 py-3.5 bg-white text-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-100 transition-colors flex items-center gap-3 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <Smartphone className="w-5 h-5 text-[#059669]" />
                <div className="text-left">
                  <span className="text-xs text-neutral-500 uppercase block leading-none font-semibold">
                    Tải về trên
                  </span>
                  <span className="text-xs font-extrabold">Apple App Store</span>
                </div>
              </button>

              <button
                type="button"
                className="px-6 py-3.5 glass-pill border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer backdrop-blur-xl"
              >
                <Download className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <span className="text-xs text-neutral-400 uppercase block leading-none font-medium">
                    Cài đặt từ
                  </span>
                  <span className="text-xs font-extrabold">Google Play Store</span>
                </div>
              </button>
            </div>
          </div>

          <div className="reveal lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 h-[420px] rounded-[36px] p-3 bg-neutral-800 border-4 border-neutral-700 shadow-2xl overflow-hidden">
              <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-neutral-950 flex flex-col justify-between p-5 text-white">
                <div>
                  <div className="w-16 h-4 bg-neutral-800 rounded-full mx-auto mb-6" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-emerald-400">Thong Dong App</span>
                    <span className="text-xs text-neutral-400">Phiên bản 2.0</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 mb-3">
                    <span className="text-xs text-neutral-400 block mb-1">Gói thuê bao hiện có</span>
                    <span className="text-lg font-bold text-white block">38 giờ còn lại</span>
                    <span className="text-xs text-emerald-400 font-semibold">Đang hoạt động · Hạn 42 ngày</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <span className="text-xs text-neutral-400 block mb-1">Chuyến sắp tới</span>
                    <span className="text-xs font-bold text-white block">Toyota Corolla Cross</span>
                    <span className="text-xs text-neutral-400">Nhận tại Chi nhánh Q1 · 09:00</span>
                  </div>
                </div>

                <div className="w-full py-2.5 bg-[#059669] rounded-xl text-xs font-bold text-center text-white">
                  Mở khoá nhận xe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
