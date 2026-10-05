import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  ChevronLeft,
  CheckCircle2,
  Star,
} from "lucide-react";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Đăng nhập | Thong Dong - Hệ Thống Thuê Xe",
  description:
    "Đăng nhập tài khoản Thong Dong để quản lý lịch trình thuê xe, hợp đồng và các ưu đãi thành viên.",
};

export default function LoginPage() {
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

      {/* Main Content: Split Hero & Login Card */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Automotive Brand Showcase */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-primary/20 text-primary text-xs font-semibold w-fit mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Thuê Xe Trực Tuyến Hàng Đầu</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-ink tracking-tight leading-[1.15] mb-5">
              Hành trình thong dong, <br />
              <span className="text-primary">
                trải nghiệm đẳng cấp.
              </span>
            </h1>

            <p className="text-ink-muted text-base xl:text-lg leading-relaxed max-w-xl mb-8 font-normal">
              Khám phá đội xe đa dạng từ ô tô điện, SUV 7 chỗ đến xe máy cao cấp. 
              Mọi chiếc xe đều được kiểm định tiêu chuẩn kỹ thuật số và bảo hiểm trọn gói trước khi lăn bánh.
            </p>

            {/* Feature Matrix Badges */}
            <div className="grid grid-cols-2 gap-4 max-w-xl mb-10">
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-elevation-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-primary mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-ink mb-1">Kiểm Định Minh Bạch</h2>
                <p className="text-xs text-ink-muted leading-snug">
                  Biên bản điện tử 4 cấp độ chi tiết từng vết trầy xước và lốp xe trước khi giao.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border shadow-elevation-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-primary mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-ink mb-1">Nhận Xe Trong 15 Phút</h2>
                <p className="text-xs text-ink-muted leading-snug">
                  Thủ tục trực tuyến gọn nhẹ, hỗ trợ giao tận nơi hoặc tại 3 chi nhánh lớn TP.HCM.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border shadow-elevation-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-primary mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-ink mb-1">Gói Thuê Bao Linh Hoạt</h2>
                <p className="text-xs text-ink-muted leading-snug">
                  Tiết kiệm đến 30% khi đăng ký theo tháng hoặc năm cho cá nhân và doanh nghiệp.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border shadow-elevation-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-primary mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-ink mb-1">Cứu Hộ 24/7 Toàn Quốc</h2>
                <p className="text-xs text-ink-muted leading-snug">
                  Đội phản ứng nhanh luôn sẵn sàng đồng hành trên mọi cung đường của bạn.
                </p>
              </div>
            </div>

            {/* Testimonial / Social Proof Pill */}
            <div className="flex items-center gap-4 max-w-lg p-3 rounded-2xl glass-sub border border-neutral-200/60 bg-white/40">
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
                  Được tin cậy bởi hơn <strong>12,500+ khách hàng</strong> cá nhân và doanh nghiệp.
                </p>
              </div>
            </div>
          </div>

          {/* Login form */}
          <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center">
            <Suspense
              fallback={
                <div className="w-full max-w-md h-[560px] glass-card rounded-3xl animate-pulse flex items-center justify-center text-neutral-400 text-sm">
                  Đang tải giao diện đăng nhập...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-neutral-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          © {new Date().getFullYear()} Hệ Thống Thuê Xe Thong Dong. Giữ toàn quyền bảo lưu.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/#chinh-sach" className="hover:text-emerald-700 transition-colors">
            Điều khoản dịch vụ
          </Link>
          <Link href="/#chinh-sach" className="hover:text-emerald-700 transition-colors">
            Chính sách hoàn cọc
          </Link>
          <Link href="/#chi-nhanh" className="hover:text-emerald-700 transition-colors">
            Liên hệ hỗ trợ
          </Link>
        </div>
      </footer>
    </div>
  );
}
