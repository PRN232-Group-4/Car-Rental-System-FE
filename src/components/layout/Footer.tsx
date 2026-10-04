"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        if (window.location.hash) {
          window.history.pushState(null, "", "/");
        }
      }
    }
  };

  return (
    <footer className="bg-stage-ink border-t border-border-dim text-white/80 pt-16 pb-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-border-dim">
          {/* Brand & Introduction */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-flex items-center gap-2.5 group"
            >
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                ThongDong.
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm font-normal">
              Hệ thống cho thuê phương tiện theo giờ và dài hạn, kèm tài xế chuyên nghiệp. Đơn vị sở hữu và vận hành trực tiếp toàn bộ đội xe ô tô, xe máy, xe điện với quy trình kiểm định 2 chiều minh bạch.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/80 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Thanh toán an toàn tích hợp cổng PayOS</span>
            </div>
          </div>

          {/* Column 1: Về hệ thống */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Về hệ thống
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#gioi-thieu" className="hover:text-emerald-400 transition-colors">
                  Giới thiệu vận hành
                </a>
              </li>
              <li>
                <a href="#chi-nhanh" className="hover:text-emerald-400 transition-colors">
                  Hệ thống chi nhánh
                </a>
              </li>
              <li>
                <a href="#lien-he" className="hover:text-emerald-400 transition-colors">
                  Liên hệ điều phối
                </a>
              </li>
              <li>
                <span className="inline-block text-xs text-emerald-300 font-semibold bg-primary/20 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Cổng nhân viên / Admin
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Thuê xe */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Thuê xe
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#quy-trinh" className="hover:text-emerald-400 transition-colors">
                  Hướng dẫn quy trình
                </a>
              </li>
              <li>
                <a href="#tim-xe" className="hover:text-emerald-400 transition-colors">
                  Tìm kiếm & đặt xe
                </a>
              </li>
              <li>
                <a href="#goi-thue-bao" className="hover:text-emerald-400 transition-colors">
                  Gói thuê bao trừ dần
                </a>
              </li>
              <li>
                <a href="#kiem-dinh" className="hover:text-emerald-400 transition-colors">
                  Biên bản kiểm định xe
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Chính sách */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Chính sách
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#chinh-sach" className="hover:text-emerald-400 transition-colors">
                  Chính sách thuê & đặt cọc (10%)
                </a>
              </li>
              <li>
                <a href="#chinh-sach" className="hover:text-emerald-400 transition-colors">
                  Chính sách huỷ & hoàn cọc PayOS
                </a>
              </li>
              <li>
                <a href="#kiem-dinh" className="hover:text-emerald-400 transition-colors">
                  Bảo dưỡng & an toàn xe 12 hạng mục
                </a>
              </li>
              <li>
                <a href="#chinh-sach" className="hover:text-emerald-400 transition-colors">
                  Cam kết giữ xe 100% khi duyệt
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Dịch vụ & Hỗ trợ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Hỗ trợ khách hàng
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>1900 xxxx (7AM – 10PM)</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@vrs.vn</span>
              </div>
              <div className="flex items-start gap-2 text-white/70 pt-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>12 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Điều khoản dịch vụ</span>
            <span className="hover:text-white transition-colors cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-white transition-colors cursor-pointer">Bản quyền phần mềm v3.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
