import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Sparkles,
  ChevronLeft,
  Star,
  FileCheck2,
  Headphones,
} from "lucide-react";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Đăng ký tài khoản | Thong Dong - Hệ Thống Thuê Xe",
  description:
    "Đăng ký tài khoản khách hàng Thong Dong để đặt xe ô tô, xe máy, xe điện linh hoạt theo giờ hoặc dài hạn và mua các gói thuê bao tiết kiệm.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-dvh w-full relative flex flex-col justify-between overflow-x-hidden bg-slate-50 selection:bg-[#059669]/15 selection:text-[#059669]">
      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 group whitespace-nowrap select-none"
        >
          <Image
            src="/logo-car.png"
            alt="Thong Dong Logo"
            width={44}
            height={20}
            className="h-5 sm:h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-[#059669] transition-colors">
            Thong Dong
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-white/60 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Main Content: Split Hero & Register Card */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Benefits of registering */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#059669] text-xs font-semibold w-fit mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gia Nhập Thành Viên Thong Dong</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.15] mb-5">
              Khởi đầu những chuyến đi{" "}
              <span className="text-emerald-700">
                chủ động & thảnh thơi.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mb-8">
              Tạo tài khoản nhanh chóng chỉ trong vài bước để đặt xe tức thì, quản lý số dư giờ gói thuê bao, theo dõi hợp đồng điện tử và nhận ưu đãi độc quyền.
            </p>

            {/* Feature Checklist Pills */}
            <div className="space-y-4 max-w-lg mb-8">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl glass-lite">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Thuê xe theo giờ trừ dần linh hoạt</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Đăng ký gói thuê bao trả trước, thuê xe không cần đặt cọc hay làm thủ tục từng lượt.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl glass-lite">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Quản lý hóa đơn & GPLX trực tuyến</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Hồ sơ bằng lái xe được lưu trữ bảo mật và xét duyệt nhanh chóng bởi đội ngũ vận hành.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl glass-lite">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Đội ngũ kỹ thuật hỗ trợ 24/7</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Hệ thống trạm dịch vụ phủ sóng các quận trung tâm, sẵn sàng giao xe và hỗ trợ mọi lúc.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Trust badge */}
            <div className="flex items-center gap-4 pt-4 border-t border-neutral-200/60 max-w-lg">
              <div className="flex -space-x-2 shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Customer"
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full ring-2 ring-white object-cover"
                />
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Customer"
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full ring-2 ring-white object-cover"
                />
                <Image
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80"
                  alt="Customer"
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full ring-2 ring-white object-cover"
                />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold mb-0.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-neutral-800 ml-1">4.9 / 5.0</span>
                </div>
                <p className="text-neutral-500">
                  Hơn <strong>12,500+ khách hàng</strong> đã đồng hành cùng Thong Dong.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center">
            <Suspense
              fallback={
                <div className="w-full max-w-md h-[560px] glass-card rounded-3xl animate-pulse flex items-center justify-center text-neutral-400 text-sm">
                  Đang tải giao diện đăng ký...
                </div>
              }
            >
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Simple Footer Bar */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 border-t border-neutral-200/50">
        <div>© 2026 Thong Dong Car Rental System. Bảo lưu mọi quyền.</div>
        <div className="flex items-center gap-4">
          <Link href="/#chinh-sach" className="hover:text-neutral-800 transition-colors">
            Điều khoản sử dụng
          </Link>
          <span>•</span>
          <Link href="/#chinh-sach" className="hover:text-neutral-800 transition-colors">
            Chính sách bảo mật
          </Link>
          <span>•</span>
          <Link href="/#quy-trinh" className="hover:text-neutral-800 transition-colors">
            Hỗ trợ khách hàng
          </Link>
        </div>
      </footer>
    </div>
  );
}
