"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { Car, CircleUserRound, LogOut } from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  icon: ElementType;
}

export interface AppSidebarProps {
  /** Nhãn dưới wordmark, phân biệt hai cổng: "Khu khách hàng" / "Khu nhân viên". */
  portalLabel: string;
  items: AppNavItem[];
  pathname: string;
  /** Bấm vào mục nav (dùng để đóng drawer mobile). */
  onNavigate?: () => void;
  user: { name: string; subtitle: string; initials: string };
  profileHref: string;
  onLogout: () => void;
  loggingOut?: boolean;
  /** Lỗi hồ sơ không chặn điều hướng — hiển thị mờ dưới thẻ người dùng. */
  notice?: string;
}

/**
 * Rail điều hướng dùng chung cho cả ba cổng (khách hàng, nhân viên, tài xế).
 * Một nguồn duy nhất cho vật liệu, bề rộng, trạng thái active và thẻ người dùng,
 * nên không còn chuyện mỗi cổng trôi đi một kiểu.
 */
export default function AppSidebar({
  portalLabel,
  items,
  pathname,
  onNavigate,
  user,
  profileHref,
  onLogout,
  loggingOut = false,
  notice,
}: AppSidebarProps) {
  return (
    <>
      <div className="flex h-[76px] shrink-0 items-center border-b border-line px-6">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-e1">
            <Car className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold leading-tight tracking-tight text-ink">
              Thong Dong
            </span>
            <span className="block text-xs font-semibold uppercase tracking-widest text-primary">
              {portalLabel}
            </span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-3">
          Không gian làm việc
        </p>
        <nav aria-label={`Điều hướng ${portalLabel.toLocaleLowerCase()}`} className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary font-bold text-white shadow-e1"
                    : "text-ink-3 hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-ink-3"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-line p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-e1">
            {user.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-ink">{user.name}</span>
            <span className="block truncate text-xs text-ink-3">{user.subtitle}</span>
          </span>
        </div>
        {notice && (
          <p role="status" className="mt-2 text-xs text-ink-3">
            {notice}
          </p>
        )}
        <Link
          href={profileHref}
          onClick={onNavigate}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-line-strong px-3 py-2.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
        >
          <CircleUserRound className="h-4 w-4" />
          Hồ sơ
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-ink-3 transition-colors hover:bg-sunken hover:text-ink disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </>
  );
}
