"use client";

import Link from "@/components/navigation/NavigationLink";
import { MapPin, Phone, Mail, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";

export function FooterContent() {
  return (
    <div className="max-w-[1640px] mx-auto space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-bone-100/20">
        <div className="lg:col-span-4 space-y-4">
          <div className="font-display font-black text-3xl tracking-tight text-bone-100">
            ThongDong<span className="text-sun-600">.</span>
          </div>
          <p className="font-sans text-sm text-bone-100/75 leading-relaxed max-w-sm">
            Hệ thống cho thuê siêu xe và xe sang hiệu năng cao. Bàn giao chìa khóa số chuẩn xác, kiểm định kỹ thuật đa điểm và đối soát hoàn cọc tự động.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-sans font-bold text-sun-400">
            <ShieldCheck className="w-4 h-4" />
            <span>100% ĐỘI XE BẢO HIỂM VẬT CHẤT TOÀN DIỆN</span>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 block mb-4">
            KHÁM PHÁ HỆ THỐNG
          </span>
          <ul className="space-y-2.5 text-sm font-sans">
            <li>
              <Link href="/find" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                <span>Đội xe tuyển chọn (Fleet)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </li>
            <li>
              <Link href="/facilities" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                <span>Mạng lưới trạm bàn giao</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </li>
            <li>
              <Link href="/inspection" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                <span>Trạm mô phỏng kiểm định 3D</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </li>
            <li>
              <Link href="/subscriptions" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                <span>Gói thuê bao hội viên</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-lake-400 block mb-4">
            KHÁCH HÀNG
          </span>
          <ul className="space-y-2.5 text-sm font-sans">
            <li>
              <Link href="/register" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                Đăng ký thành viên
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                Đăng nhập hệ thống
              </Link>
            </li>
            <li>
              <Link href="/my-rentals" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                Quản lý chuyến đi
              </Link>
            </li>
            <li>
              <Link href="/driver-license" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                Hồ sơ giấy phép lái xe
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 block mb-4">
            TRUNG TÂM ĐIỀU HÀNH
          </span>
          <div className="space-y-2.5 text-xs sm:text-base text-bone-100/80 font-sans">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-sun-400 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm">Hệ thống trạm trung tâm Quận 1, Quận 2 (Thảo Điền), Quận 7 — TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-sun-400 shrink-0" />
              <span className="text-xs sm:text-sm">Hotline Concierge: 1900 8888</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sun-400 shrink-0" />
              <span className="text-xs sm:text-sm">Email hỗ trợ: support@vrs.vn</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-sun-400 shrink-0" />
              <span className="text-xs sm:text-sm">Khung giờ bàn giao trạm: 07:00 – 22:00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-xs text-bone-100/60">
        <div className="leading-relaxed border-b border-bone-100/15 pb-4 text-[11px] text-bone-100/50">
          <strong className="text-bone-100 font-medium">
            Ghi nhận bản quyền mô hình 3D (CC BY 4.0):
          </strong>{" "}
          1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-wider">
          <span>
            © 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu.
          </span>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/find" className="hover:text-sun-400 transition-colors">
              ĐỘI XE
            </Link>
            <Link href="/facilities" className="hover:text-sun-400 transition-colors">
              CHI NHÁNH
            </Link>
            <Link href="/inspection" className="hover:text-sun-400 transition-colors">
              KIỂM ĐỊNH 3D
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      id="lien-he"
      className="relative z-10 w-full bg-ink-950 border-t-4 border-sun-600 pt-16 sm:pt-20 pb-12 px-6 sm:px-12 lg:px-20 text-bone-100 scroll-mt-24"
    >
      <FooterContent />
    </footer>
  );
}
