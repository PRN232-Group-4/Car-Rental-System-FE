"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { getCustomerLicense } from "@/features/licenses";
import { bookingLicenseHref, hasCustomerLicense } from "@/features/licenses/booking-license";
import { useNavigationRouter } from "@/components/navigation/NavigationProvider";
import { FormSkeleton } from "@/components/ui/Skeleton";

export default function BookingLicenseGate({ children }: { children: ReactNode }) {
  const router = useNavigationRouter();
  const params = useSearchParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const query = params.toString();
  const bookingPath = `/booking${query ? `?${query}` : ""}`;
  const license = useQuery({
    queryKey: ["customer-license"],
    queryFn: getCustomerLicense,
    enabled: !authLoading && isAuthenticated,
    retry: false,
    refetchOnMount: "always",
  });
  const checked = license.isFetchedAfterMount && !license.isPending;
  const needsLicense = checked && !license.isError && !hasCustomerLicense(license.data);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(bookingPath)}`);
    } else if (needsLicense) {
      router.replace(bookingLicenseHref(bookingPath));
    }
  }, [authLoading, isAuthenticated, needsLicense, bookingPath, router]);

  if (authLoading || !isAuthenticated || !checked) {
    return <FormSkeleton label="Đang kiểm tra giấy phép lái xe trước khi đặt xe..." />;
  }
  if (license.isError) {
    return <section className="mx-auto max-w-3xl space-y-4 rounded border border-td-rule bg-td-white p-6">
      <h1 className="text-2xl font-bold text-td-ink">Kiểm tra giấy phép lái xe</h1>
      <p role="alert" className="text-sm text-danger">Không thể kiểm tra GPLX. Vui lòng kiểm tra kết nối và thử lại để tiếp tục đặt xe.</p>
      <button type="button" onClick={() => void license.refetch()} disabled={license.isFetching} className="rounded bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50">{license.isFetching ? "Đang kiểm tra..." : "Thử lại"}</button>
    </section>;
  }
  if (needsLicense) {
    return <p role="status" className="p-6 text-center text-sm text-td-muted">Bạn chưa cập nhật GPLX. Đang chuyển đến trang cập nhật giấy phép...</p>;
  }
  return children;
}
