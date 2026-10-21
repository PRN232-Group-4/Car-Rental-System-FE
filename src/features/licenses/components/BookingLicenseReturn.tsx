"use client";

import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import type { CustomerLicense } from "../types";
import { getBookingReturnPath, hasCustomerLicense } from "../booking-license";

export default function BookingLicenseReturn({ license }: { license: CustomerLicense | null | undefined }) {
  const params = useSearchParams();
  const returnTo = getBookingReturnPath(params.get("returnTo"));
  if (!returnTo) return null;
  const canReturn = hasCustomerLicense(license);

  return <div className="space-y-3 rounded border border-primary/30 bg-primary-tint p-4 text-sm text-td-ink" role="status">
    <p>{!canReturn
      ? "Vui lòng cập nhật GPLX trước khi đặt xe. Lựa chọn xe và thời gian trong liên kết đặt xe của bạn được giữ lại."
      : license?.status === "pending"
        ? "Hồ sơ GPLX đang chờ duyệt. Đơn thuê thanh toán trực tiếp cần GPLX được phê duyệt trước khi xác nhận."
        : "Bạn có thể quay lại đặt xe với lựa chọn trước đó. Hệ thống sẽ kiểm tra điều kiện GPLX khi xác nhận đơn thuê."}</p>
    {canReturn && <Link href={returnTo} className="inline-flex rounded bg-primary px-4 py-3 font-semibold text-white">Quay lại đặt xe</Link>}
  </div>;
}
