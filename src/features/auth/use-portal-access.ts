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
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [account, setAccount] = useState<A | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState("");

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
          router.replace("/");
          return;
        }
        setAccount(profile as A);
      })
      .catch((error: unknown) => {
        if (active) {
          setAccessError(
            error instanceof Error
              ? error.message
              : "Không thể xác thực quyền truy cập.",
          );
        }
      })
      .finally(() => {
        if (active) setCheckingAccess(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, router, isAllowed]);

  return { account, checkingAccess, accessError };
}
