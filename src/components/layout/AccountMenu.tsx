"use client";

import Link from "@/components/navigation/NavigationLink";
import Image from "next/image";
import { LogOut, ChevronDown, Car, FileCheck, KeyRound } from "lucide-react";
import { useAuth, hasAnyRole, STAFF_PORTAL_ROLES } from "@/features/auth";
import { getNavigation } from "@/config/navigation";
import { useMounted } from "@/hooks/use-mounted";
import styles from "./Navbar.module.css";

const MENU_ITEM = "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-bone-100/75 hover:text-sun-400 hover:bg-bone-100/5 transition-colors";
const MENU_ITEM_ACCENT = "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-sun-400 hover:bg-bone-100/5 transition-colors";

function roleLabel(hasRole: (role: string) => boolean) {
  if (hasRole("admin")) return "Quản trị viên";
  if (hasRole("manager")) return "Quản lý";
  if (hasRole("driver")) return "Tài xế";
  if (hasRole("customerservice")) return "Chăm sóc khách hàng";
  if (hasRole("maintenance")) return "Kỹ thuật viên";
  if (hasRole("staff")) return "Nhân viên";
  return "Khách hàng";
}

/**
 * Account button + dropdown shared by the paper-page masthead (Navbar) and the landing nav.
 * Renders nothing until the session is known on the client, so guests see only MENU.
 * `floating` detaches the dropdown from the button (landing has no ink bar to hang it from).
 */
export default function AccountMenu({
  open,
  onOpenChange,
  buttonClassName,
  floating = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonClassName: string;
  floating?: boolean;
}) {
  const mounted = useMounted();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  if (!mounted || !isAuthenticated || !user) return null;

  const isStaff = hasAnyRole(user.roles, STAFF_PORTAL_ROLES);
  const passwordProfile = hasRole("admin") || hasRole("manager")
    ? "/admin/profile"
    : hasRole("driver") ? "/staff/profile"
    : isStaff ? "/admin/profile" : "/profile";
  const close = () => onOpenChange(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Tài khoản"
        aria-expanded={open}
        aria-controls="landing-account-menu"
        onClick={() => onOpenChange(!open)}
        className={buttonClassName}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={18}
            height={18}
            unoptimized
            className="w-[18px] h-[18px] rounded-full object-cover"
          />
        ) : (
          <span aria-hidden="true" className="w-[18px] h-[18px] rounded-full bg-sun-600 text-white flex items-center justify-center text-[10px] font-bold">
            {user.fullName?.charAt(0) || "U"}
          </span>
        )}
        <span className="hidden sm:inline max-w-[160px] truncate font-sans normal-case tracking-normal text-[13px] font-semibold">{user.fullName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-bone-100/60" aria-hidden="true" />
      </button>

      {open && (
        <div id="landing-account-menu" className={floating ? `${styles.accountMenu} ${styles.accountMenuFloating}` : styles.accountMenu}>
          <div className="px-3 py-2 border-b border-bone-100/15 mb-1">
            <p className="text-xs font-bold text-bone-100 truncate">{user.fullName}</p>
            <p className="text-xs text-bone-100/60 truncate mt-0.5">{user.email}</p>
            <span className="block mt-1.5 text-[10px] tracking-[0.22em] uppercase font-bold text-sun-400">
              {roleLabel(hasRole)}
            </span>
          </div>

          <div className="py-1 border-b border-bone-100/15 mb-1 space-y-0.5">
            {isStaff && (
              <Link href="/admin" onClick={close} className={MENU_ITEM_ACCENT}>
                <Car className="size-3.5" />
                <span>Cổng quản trị</span>
              </Link>
            )}

            {hasRole("driver") && (
              <Link href="/staff" onClick={close} className={MENU_ITEM_ACCENT}>
                <Car className="size-3.5" />
                <span>Cổng tài xế</span>
              </Link>
            )}

            {(hasRole("customer") || !isStaff) &&
              getNavigation(user.roles, "customer").map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={close} className={MENU_ITEM}>
                  {Icon && <Icon className="size-3.5" />}
                  <span>{label}</span>
                </Link>
              ))}

            <Link href="/profile" onClick={close} className={MENU_ITEM}>
              <FileCheck className="size-3.5 opacity-0" />
              <span>Hồ sơ cá nhân</span>
            </Link>
            <Link href={`${passwordProfile}#change-password`} onClick={close} className={MENU_ITEM}>
              <KeyRound className="size-3.5" aria-hidden="true" />
              <span>Đổi mật khẩu</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className={`${MENU_ITEM} w-full py-2 cursor-pointer text-left`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
