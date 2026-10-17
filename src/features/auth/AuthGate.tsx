"use client";

import React, { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useSession } from "./AuthContext";
import { Role } from "./roles";
import { hasAnyRole } from "./access";
import { sanitizeNext } from "@/lib/url";
import { Loader2 } from "lucide-react";

export interface AuthGateProps {
  children: ReactNode;
  /** Danh sách vai trò được phép truy cập. Nếu để trống, chỉ yêu cầu đã đăng nhập */
  allowedRoles?: readonly (Role | string)[];
  /** Bắt buộc phải đăng nhập (mặc định: true) */
  requireAuth?: boolean;
  /** Giao diện khung chờ (skeleton) hiển thị khi đang tải phiên. Mặc định dùng ShellSkeleton */
  fallback?: ReactNode;
}

/** Khung xương fallback hiển thị khi đang tải phiên để chống giật/nháy giao diện */
export function DefaultShellSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang kiểm tra quyền truy cập"
      className="min-h-dvh bg-canvas flex items-center justify-center p-4"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-ink-3">Đang xác thực phiên làm việc...</p>
        <span className="sr-only">Đang kiểm tra quyền truy cập hệ thống Thong Dong</span>
      </div>
    </div>
  );
}

/**
 * Client-side Route Guard cho Next.js Static Export.
 * - Khi status === "loading": Render skeleton (aria-busy=true), chặn tuyệt đối children không render.
 * - Khi chưa đăng nhập (anonymous): Chuyển hướng an toàn tới /login?next=... (đã chống open redirect).
 * - Khi đã đăng nhập nhưng không đủ vai trò: Chuyển hướng tới /forbidden?from=...
 * - Khi đủ quyền: Render children trọn vẹn.
 */
export function AuthGate({
  children,
  allowedRoles,
  requireAuth = true,
  fallback,
}: AuthGateProps) {
  const { user, status, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAnonymous = status === "anonymous";
  const isAuthenticated = status === "authenticated";
  const isAuthorized =
    isAuthenticated &&
    (!allowedRoles || allowedRoles.length === 0 || hasAnyRole(user?.roles, allowedRoles));

  useEffect(() => {
    // Không thực hiện chuyển hướng khi đang tải phiên
    if (isLoading) return;

    if (requireAuth && isAnonymous) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const current = pathname ? `${pathname}${search}` : "/";
      const safeNext = sanitizeNext(current, "/");
      router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
      return;
    }

    if (isAuthenticated && !isAuthorized) {
      const current = pathname || "/";
      router.replace(`/forbidden?from=${encodeURIComponent(current)}`);
      return;
    }
  }, [isLoading, requireAuth, isAnonymous, isAuthenticated, isAuthorized, pathname, router]);

  // Trong lúc chờ tải hoặc đang trong quá trình chuyển hướng, giữ nguyên skeleton (zero flicker)
  if (isLoading || (requireAuth && isAnonymous) || (isAuthenticated && !isAuthorized)) {
    return <>{fallback ?? <DefaultShellSkeleton />}</>;
  }

  return <>{children}</>;
}

export default AuthGate;
