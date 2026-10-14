"use client";

import Link from "@/components/navigation/NavigationLink";
import { ArrowRight, CarFront, CircleDollarSign, UserRound } from "lucide-react";
import { useDriverPortalAccount } from "./DriverPortalShell";

const shortcuts = [
  {
    href: "/staff/vehicles",
    label: "Phương tiện của tôi",
    detail: "Xem xe có lịch phân công cho bạn.",
    icon: CarFront,
  },
  {
    href: "/staff/revenue",
    label: "Doanh thu",
    detail: "Theo dõi tổng giá trị các chuyến đã hoàn thành.",
    icon: CircleDollarSign,
  },
  {
    href: "/staff/profile",
    label: "Hồ sơ của tôi",
    detail: "Cập nhật thông tin liên hệ nhân viên.",
    icon: UserRound,
  },
];

export default function DriverPortalOverview() {
  const account = useDriverPortalAccount();

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Không gian làm việc của tài xế
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Xin chào, {account.fullName ?? "Tài xế"}
        </h2>
        <p className="mt-2 text-sm text-ink-3">
          Quản lý phương tiện được phân công, xem doanh thu chuyến xe và cập nhật hồ sơ.
        </p>
      </div>

      <section aria-label="Lối tắt" className="grid gap-4 lg:grid-cols-3">
        {shortcuts.map(({ href, label, detail, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-line bg-surface p-5 shadow-e1 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-e2"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 flex items-center justify-between font-bold text-ink">
              {label}
              <ArrowRight className="h-4 w-4 text-ink-3 transition group-hover:translate-x-1 group-hover:text-primary" />
            </h3>
            <p className="mt-1 text-sm text-ink-3">{detail}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
