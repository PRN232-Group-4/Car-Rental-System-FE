"use client";

import Link from "@/components/navigation/NavigationLink";
import { ArrowRight } from "lucide-react";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { useDriverPortalAccount } from "./DriverPortalShell";

const shortcuts = [
  {
    href: "/staff/vehicles",
    label: "Phương tiện của tôi",
    detail: "Xem xe có lịch phân công cho bạn.",
  },
  {
    href: "/staff/revenue",
    label: "Doanh thu",
    detail: "Theo dõi tổng giá trị các chuyến đã hoàn thành.",
  },
  {
    href: "/staff/profile",
    label: "Hồ sơ của tôi",
    detail: "Cập nhật thông tin liên hệ nhân viên.",
  },
];

export default function DriverPortalOverview() {
  const account = useDriverPortalAccount();

  return (
    <div className="space-y-8">
      <TransitFolio
        title={<>Xin chào, {account.fullName?.trim() || account.email || "bạn"}</>}
        description="Quản lý phương tiện được phân công, xem doanh thu chuyến xe và cập nhật hồ sơ."
      >
        <div className="border-l border-td-rule pl-4 text-right">
          <span className="block text-xs text-td-muted">Bộ phận</span>
          <strong className="block text-sm font-bold text-td-ink">
            {account.departmentName?.trim() || "Chưa cập nhật phòng ban"}
          </strong>
        </div>
      </TransitFolio>

      <section aria-label="Lối tắt" className="border-t border-td-ink">
        {shortcuts.map(({ href, label, detail }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between gap-4 border-b border-td-rule py-4 transition-colors hover:bg-td-chalk/50"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-td-ink">{label}</span>
              <span className="mt-0.5 block text-xs text-td-muted">{detail}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-td-muted transition-colors group-hover:text-primary" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </div>
  );
}
