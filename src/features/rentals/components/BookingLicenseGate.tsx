"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useNavigationRouter } from "@/components/navigation/NavigationProvider";
import { FormSkeleton } from "@/components/ui/Skeleton";

export default function BookingLicenseGate({ children, requireLicense = false }: { children: ReactNode; requireLicense?: boolean }) {
  const router = useNavigationRouter();
  const params = useSearchParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const query = params.toString();
  const bookingPath = `/booking${query ? `?${query}` : ""}`;

  useEffect(() => {
    if (!requireLicense) return;
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(bookingPath)}`);
    }
  }, [authLoading, isAuthenticated, bookingPath, router]);

  if (authLoading || !isAuthenticated) {
    return <FormSkeleton label="Đang kiểm tra tài khoản trước khi đặt xe..." />;
  }
  // GPLX is checked only after the customer chooses self-drive in BookingForm.
  return children;
}
