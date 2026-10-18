"use client";

import type { ReactNode } from "react";
import { useSession } from "./AuthContext";
import type { Role } from "./roles";
import { hasAnyRole } from "./access";

export interface RequireRoleProps {
  /** Các vai trò được phép hiển thị component này */
  roles: readonly (Role | string)[];
  /** Nội dung hiển thị khi có quyền */
  children: ReactNode;
  /** Nội dung thay thế khi không đủ quyền (mặc định: null) */
  fallback?: ReactNode;
}

/**
 * Component-level Guard: Ẩn/hiển thị các phần tử giao diện (nút bấm, tab, widget)
 * dựa trên vai trò của người dùng trong phiên hiện tại.
 */
export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { user, isAuthenticated } = useSession();

  if (!isAuthenticated || !hasAnyRole(user?.roles, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RequireRole;
