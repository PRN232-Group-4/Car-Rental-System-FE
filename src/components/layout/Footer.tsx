"use client";

import Link from "@/components/navigation/NavigationLink";
import { MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";

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
    <footer id="lien-he" className="bg-stage-ink border-t border-white/10 text-white/80 pt-16 pb-12 px-4 sm:px-6 pr-14 md:pr-16 relative z-10 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Introduction */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-flex items-center gap-2.5 group"
            >
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-primary-tint transition-colors">
                ThongDong.
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm font-normal">
              Hệ thống cho thuê phương tiện theo giờ và dài hạn, kèm tài xế chuyên nghiệp. Đơn vị sở hữu và vận hành trực tiếp toàn bộ đội xe ô tô, xe máy, xe điện với quy trình kiểm định 2 chiều minh bạch.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/80 pt-2">
              <ShieldCheck className="w-4 h-4 text-primary-tint" aria-hidden="true" />
              <span>Thanh toán an toàn tích hợp cổng PayOS</span>
            </div>
          </div>

          {/* Column 1: Về hệ thống */}
          <div className="space-y-3 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              Về hệ thống
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li>
                <a href="#gioi-thieu" className="hover:text-white transition-colors">
                  Giới thiệu vận hành
                </a>
              </li>
              <li>
                <a href="#chi-nhanh" className="hover:text-white transition-colors">
                  Hệ thống chi nhánh
                </a>
              </li>
              <li>
                <a href="#lien-he" className="hover:text-white transition-colors">
                  Liên hệ điều phối
                </a>
              </li>
              <li>
                <Link href="/admin" className="inline-block text-xs text-primary font-semibold bg-primary-tint/20 border border-primary/30 px-2 py-0.5 rounded hover:bg-primary-tint/30 transition-colors">
                  Cổng nhân viên / Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Thuê xe */}
          <div className="space-y-3 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              Thuê xe
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li>
                <a href="#quy-trinh" className="hover:text-white transition-colors">
                  Hướng dẫn quy trình
                </a>
              </li>
              <li>
                <a href="#danh-muc-xe" className="hover:text-white transition-colors">
                  Tìm kiếm & đặt xe
                </a>
              </li>
              <li>
                <a href="#goi-thue-bao" className="hover:text-white transition-colors">
                  Gói thuê bao trừ dần
                </a>
              </li>
              <li>
                <a href="#cong-nghe" className="hover:text-white transition-colors">
                  Biên bản kiểm định xe
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Chính sách */}
          <div className="space-y-3 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              Chính sách
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li>
                <a href="#cong-nghe" className="hover:text-white transition-colors">
                  Chính sách thuê & đặt cọc
                </a>
              </li>
              <li>
                <a href="#cong-nghe" className="hover:text-white transition-colors">
                  Quy trình quyết toán & hoàn cọc
                </a>
              </li>
              <li>
                <a href="#cong-nghe" className="hover:text-white transition-colors">
                  Kiểm định an toàn hai chiều
                </a>
              </li>
              <li>
                <a href="#goi-thue-bao" className="hover:text-white transition-colors">
                  Chính sách giữ xe khi xác nhận
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Dịch vụ & Hỗ trợ */}
          <div className="space-y-3 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-white">
              Hỗ trợ khách hàng
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-tint shrink-0" aria-hidden="true" />
                <a href="#chi-nhanh" className="hover:text-white transition-colors font-medium">
                  Mạng lưới trạm ThongDong
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-primary-tint shrink-0 mt-0.5" aria-hidden="true" />
                <a href="#cong-nghe" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Hỗ trợ sự cố & kiểm định</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Model Asset Attribution (CC BY 4.0) */}
        <div className="py-6 border-b border-white/10 text-xs text-white/70">
          <p className="leading-relaxed">
            <strong className="text-white font-semibold">Ghi nhận bản quyền mô hình 3D (CC BY 4.0):</strong>{" "}
            1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
          </p>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
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
