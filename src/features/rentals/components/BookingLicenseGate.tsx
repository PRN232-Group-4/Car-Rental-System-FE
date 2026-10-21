"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { getCustomerLicense } from "@/features/licenses";
import { bookingLicenseHref, hasCustomerLicense } from "@/features/licenses/booking-license";
import { useNavigationRouter } from "@/components/navigation/NavigationProvider";
import { ShieldCheck, ScanLine, Loader2, User } from "lucide-react";

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
    return (
      <div 
        role="status"
        aria-label="Đang kiểm tra giấy phép lái xe trước khi đặt xe..."
        className="mx-auto max-w-xl my-12 p-8 rounded-3xl bg-surface border border-line-strong shadow-e2 flex flex-col items-center text-center space-y-6"
      >
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary-tint px-3 py-1 rounded-full border border-primary/20">
          <ScanLine className="w-4 h-4" />
          <span>Xác Thực Số Hóa GPLX</span>
        </div>

        {/* Holographic Driver License Card Preview */}
        <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-stage-ink/90 border border-white/20 p-5 overflow-hidden shadow-2xl flex flex-col justify-between text-left select-none">
          {/* Microprint Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none font-mono text-[7px] text-white leading-tight overflow-hidden p-2">
            CONG HOA XA HOI CHU NGHIA VIET NAM GIAY PHEP LAI XE DRIVER LICENSE VN-GPLX-SYSTEM-SECURE
          </div>

          {/* Animated Holographic Laser Beam */}
          <div 
            className="absolute left-0 right-0 h-0.5 bg-primary opacity-80 animate-pulse pointer-events-none"
            style={{
              top: "45%",
            }}
          />

          {/* Card Header */}
          <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-2">
            <div>
              <span className="font-display text-[10px] font-bold text-white/60 tracking-wider block">
                GIẤY PHÉP LÁI XE / DRIVER LICENSE
              </span>
              <span className="font-mono text-xs font-black text-primary-graphic">
                HẠNG B2 · SỐ HÓA
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-graphic">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card Body */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-16 rounded-lg bg-surface/10 border border-white/10 flex items-center justify-center text-white/40">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="h-2 w-28 bg-white/20 rounded animate-pulse" />
              <div className="h-2 w-20 bg-white/15 rounded animate-pulse" />
              <div className="h-2 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Card Footer Chip & Barcode */}
          <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-white/50 border-t border-white/10 pt-2">
            <span>SECURE NFC CHIP</span>
            <span>THONG DONG VERIFIED</span>
          </div>
        </div>

        {/* Verification Status Feedback */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-ink font-display font-bold text-base">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span>Đang đối soát quang học Giấy Phép Lái Xe...</span>
          </div>
          <p className="text-xs text-ink-3 max-w-sm">
            Hệ thống đang kết nối bảo mật với hồ sơ điện tử để đảm bảo an toàn tối đa cho chuyến đi của bạn.
          </p>
        </div>
      </div>
    );
  }

  if (license.isError) {
    return (
      <section className="mx-auto max-w-xl my-12 space-y-4 rounded-3xl border border-line-strong bg-surface p-8 text-center shadow-e2">
        <h1 className="text-2xl font-bold text-ink">Kiểm tra giấy phép lái xe</h1>
        <p role="alert" className="text-sm text-danger">
          Không thể kiểm tra GPLX. Vui lòng kiểm tra kết nối và thử lại để tiếp tục đặt xe.
        </p>
        <button
          type="button"
          onClick={() => void license.refetch()}
          disabled={license.isFetching}
          className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 cursor-pointer"
        >
          {license.isFetching ? "Đang kiểm tra..." : "Thử lại"}
        </button>
      </section>
    );
  }

  if (needsLicense) {
    return (
      <p role="status" className="p-12 text-center text-sm text-ink-2">
        Bạn chưa cập nhật GPLX. Đang chuyển đến trang cập nhật giấy phép...
      </p>
    );
  }

  return children;
}
