"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useAuth } from "./context/AuthContext";
import { getAccountProfile } from "@/features/profile/api";
import type { AccountProfile } from "@/features/profile/api";

/**
 * Gate dùng chung cho các portal (/admin, /staff): chưa đăng nhập → /login,
 * không đủ quyền → /. `isAllowed` phải ổn định (khai báo ở module, không tạo arrow inline)
 * và có thể thu hẹp kiểu: usePortalAccess<DriverPortalAccount>(isDriverStaffAccount).
 */
export function usePortalAccess<A extends AccountProfile = AccountProfile>(
  isAllowed: (account: AccountProfile) => boolean,
) {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const identity = user?.email.toLowerCase() ?? "";
  const [result, setResult] = useState<{ identity: string; account: A | null; error: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let active = true;
    void getAccountProfile()
      .then((profile) => {
        if (!active) return;
        if (!isAllowed(profile)) {
          setResult({ identity, account: null, error: "" });
          router.replace("/");
          return;
        }
        setResult({ identity, account: profile as A, error: "" });
      })
      .catch((error: unknown) => {
        if (active) {
          setResult({ identity, account: null, error: error instanceof Error
              ? error.message
              : "Không thể xác thực quyền truy cập." });
        }
      });

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, router, isAllowed, identity, user]);

  const current = result?.identity === identity && isAuthenticated ? result : null;
  return {
    account: current?.account ?? null,
    checkingAccess: authLoading || !isAuthenticated || current == null || (!current.account && !current.error),
    accessError: current?.error ?? "",
  };
}
