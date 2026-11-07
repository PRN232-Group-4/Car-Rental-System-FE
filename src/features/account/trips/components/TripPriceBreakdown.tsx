import { Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatVnd } from "@/lib/format";
import type { TripDetail } from "../types";

interface TripPriceBreakdownProps {
  trip: TripDetail;
}

export function TripPriceBreakdown({ trip }: TripPriceBreakdownProps) {
  if (trip.isSubscription) {
    return (
      <div className="bg-td-white rounded border border-td-rule p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Package className="w-4 h-4" aria-hidden="true" />
          <span>Hình thức thanh toán theo gói</span>
        </div>

        <div className="bg-primary-tint/20 border border-primary/20 rounded p-4">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-bold text-td-ink">Số giờ gói đã sử dụng</span>
            <span className="font-mono text-xl font-black text-primary">
              {trip.subscriptionHoursUsed == null ? "Chưa có dữ liệu" : `${trip.subscriptionHoursUsed} giờ`}
            </span>
          </div>
          <p className="text-xs text-td-muted leading-relaxed">
            Chuyến đi được trừ trực tiếp vào số dư thời gian của gói thuê bao đang hoạt động. Bạn không cần thanh toán tiền thuê hoặc tiền cọc cho đơn này.
          </p>
        </div>
      </div>
    );
  }

  const { price, settlement } = trip;

  const renderRefundStatus = (status?: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đã hoàn vào tài khoản</span>
          </span>
        );
      case "requested":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-warning">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đang đối soát hoàn cọc</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-danger">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Khấu trừ toàn bộ / Từ chối</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-td-white rounded border border-td-rule p-5 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-td-muted">
        Chi tiết thanh toán & Đặt cọc
      </h3>

      <div className="space-y-2 text-sm font-mono">
        <div className="flex justify-between text-td-ink">
          <span>Tiền thuê xe</span>
          <span>{formatVnd(price.rent)}</span>
        </div>
        <div className="flex justify-between text-td-ink">
          <span>Thuế VAT</span>
          <span>+{formatVnd(price.vat)}</span>
        </div>
        <div className="flex justify-between text-td-ink">
          <span>Tiền đặt cọc</span>
          <span>+{formatVnd(price.deposit)}</span>
        </div>
        {price.overtime > 0 && (
          <div className="flex justify-between text-danger font-semibold">
            <span>Phí quá giờ</span>
            <span>+{formatVnd(price.overtime)}</span>
          </div>
        )}

        <div className="border-t border-td-rule pt-2.5 flex justify-between font-bold text-td-ink text-base">
          <span>Tổng giá trị đơn</span>
          <span className="text-primary">{formatVnd(price.total)}</span>
        </div>
      </div>

      {/* Khối quyết toán & hoàn tiền cọc */}
      {settlement && (
        <div className="mt-4 pt-4 border-t border-td-rule space-y-3 bg-td-chalk rounded p-4 text-xs font-mono">
          <div className="flex items-center justify-between font-bold text-td-ink text-sm">
            <span>Quyết toán tiền cọc</span>
            {renderRefundStatus(settlement.refundStatus)}
          </div>

          <div className="space-y-1.5 text-td-ink">
            <div className="flex justify-between">
              <span>Tiền cọc ban đầu đã giữ:</span>
              <span>{formatVnd(settlement.depositHeld)}</span>
            </div>
            {settlement.depositDeducted > 0 && (
              <div className="flex justify-between text-danger">
                <span>Khấu trừ phí phát sinh:</span>
                <span>-{formatVnd(settlement.depositDeducted)}</span>
              </div>
            )}
            <div className="border-t border-td-rule pt-1.5 flex justify-between font-bold text-td-ink text-sm">
              <span>Số tiền hoàn cọc thực nhận:</span>
              <span className="text-success">{settlement.refundAmount == null ? "Chưa có dữ liệu" : formatVnd(settlement.refundAmount)}</span>
            </div>
          </div>

          <p className="text-[11px] text-td-muted font-sans leading-relaxed pt-1">
            Quy tắc: Phí trả trễ hoặc phát sinh được khấu trừ trực tiếp vào tiền đặt cọc. Phần dư được hoàn trả tự động vào phương thức thanh toán ban đầu của quý khách.
          </p>
        </div>
      )}
    </div>
  );
}
