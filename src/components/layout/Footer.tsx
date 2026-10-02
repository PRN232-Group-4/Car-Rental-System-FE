"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-dark border-t border-white/10 text-neutral-300 pt-20 pb-12 px-4 sm:px-6 relative z-10 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto">
        <div className="reveal-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-16 border-b border-white/10">
          {/* Brand & Introduction */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/logo-car-white.png"
                alt="Thong Dong Logo"
                width={56}
                height={26}
                className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Thong Dong
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-sm">
              Hệ thống cho thuê phương tiện theo giờ và dài hạn, kèm tài xế chuyên nghiệp. Đơn vị sở hữu và vận hành trực tiếp toàn bộ đội xe ô tô, xe máy, xe điện với quy trình kiểm định 2 chiều minh bạch.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-300 pt-2">
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
                <span className="inline-block text-xs text-emerald-300 font-semibold bg-[#059669]/20 border border-emerald-500/30 px-2 py-0.5 rounded">
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
                <Phone className="w-4 h-4 text-[#10b981]" />
                <span>1900 xxxx (7AM – 10PM)</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Mail className="w-4 h-4 text-[#10b981]" />
                <span>support@vrs.vn</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-400 pt-1">
                <MapPin className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>12 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 transition-colors">Điều khoản dịch vụ</span>
            <span className="hover:text-neutral-300 transition-colors">Chính sách bảo mật dữ liệu</span>
            <span className="hover:text-neutral-300 transition-colors">Bản quyền phần mềm v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
