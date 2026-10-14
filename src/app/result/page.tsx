"use client";

import { useEffect } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";

/**
 * PayOS `CancelUrl` (cấu hình ở BE) đang trỏ về `/result` — thiếu `/payment` — nên khách
 * huỷ thanh toán sẽ rơi vào trang 404. Trang này chuyển tiếp sang trang kết quả thật và
 * giữ nguyên query PayOS trả về (?orderCode=...&cancel=true&status=CANCELLED).
 */
export default function LegacyPaymentResultRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/payment/result${window.location.search}`);
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 text-sm text-ink-3">
      Đang chuyển tới trang kết quả thanh toán...
    </div>
  );
}
