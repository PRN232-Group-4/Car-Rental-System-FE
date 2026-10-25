"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Car,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceById, Invoice } from "@/features/invoices";
import { getPlanPurchaseStatus, PlanPurchaseStatus } from "@/features/subscriptions";
import { cancelCheckout } from "@/features/payments";
import { formatVnd } from "@/lib/format";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-td-muted">Đang kiểm tra kết quả thanh toán...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const searchParams = useSearchParams();

  const orderCode = searchParams.get("orderCode") || searchParams.get("invoiceId") || "";
  const hasOrderCode = orderCode.length > 0;
  const urlStatus = (searchParams.get("status") || "").toUpperCase();
  const urlCancelled = searchParams.get("cancel") === "true" || urlStatus === "CANCELLED";
  // Plan purchases reuse this page: PayOS returns their orderCode in a high range, and the BE
  // also marks the return URL with type=subscription.
  const isPlanPurchase = searchParams.get("type") === "subscription" || Number(orderCode) >= 1_000_000_000;

  const [pollCount, setPollCount] = useState(0);

  // Poll every 2.5s up to 15 times until the PayOS webhook confirms the payment server-side.
  const invoiceQuery = useQuery<Invoice | null>({
    queryKey: ["invoice-poll", orderCode],
    queryFn: () => getInvoiceById(orderCode),
    enabled: !isPlanPurchase && hasOrderCode,
    refetchInterval: (query) =>
      (query.state.data?.status === "paid" && !!query.state.data?.orderId) ||
      query.state.data?.status === "cancelled" ||
      urlCancelled ||
      pollCount >= 15
        ? false
        : 2500,
  });

  const planQuery = useQuery<PlanPurchaseStatus>({
    queryKey: ["plan-purchase-poll", orderCode],
    queryFn: () => getPlanPurchaseStatus(orderCode),
    enabled: isPlanPurchase && hasOrderCode,
    refetchInterval: (query) =>
      query.state.data?.status === "paid" ||
      query.state.data?.status === "cancelled" ||
      urlCancelled ||
      pollCount >= 15
        ? false
        : 2500,
  });

  const invoice = invoiceQuery.data;
  const planPurchase = planQuery.data;
  const serverStatus = isPlanPurchase ? planPurchase?.status : invoice?.status;
  const isCancelled = urlCancelled || serverStatus === "cancelled";
  const isPaid = serverStatus === "paid";
  const waitingOrder = isPaid && !isPlanPurchase && !invoice?.orderId;
  const refetch = isPlanPurchase ? planQuery.refetch : invoiceQuery.refetch;
  const isFetching = isPlanPurchase ? planQuery.isFetching : invoiceQuery.isFetching;

  // payOS không gửi webhook khi khách huỷ link → báo BE xác minh với payOS rồi chuyển giao dịch
  // sang 'cancelled' (BE không tin query param của FE).
  const cancelSyncedRef = useRef(false);
  const refetchInvoice = invoiceQuery.refetch;
  const refetchPlan = planQuery.refetch;
  useEffect(() => {
    if (!urlCancelled || !hasOrderCode || cancelSyncedRef.current) return;
    cancelSyncedRef.current = true;
    void (async () => {
      await cancelCheckout(orderCode);
      await (isPlanPurchase ? refetchPlan() : refetchInvoice());
    })();
  }, [urlCancelled, hasOrderCode, orderCode, isPlanPurchase, refetchInvoice, refetchPlan]);

  useEffect(() => {
    if (!isCancelled && (!isPaid || waitingOrder) && pollCount < 15) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pollCount, isPaid, isCancelled, waitingOrder]);

  const isSuccess = isPaid && (isPlanPurchase || !!invoice?.orderId);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      <div className="p-8 sm:p-10 rounded bg-td-white border border-td-rule shadow-sm text-center space-y-6">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-tint text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-td-ink tracking-tight">
                {isPlanPurchase ? "Thanh toán gói thành công!" : "Thanh toán thành công!"}
              </h1>
              <p className="text-xs sm:text-sm text-td-muted">
                {isPlanPurchase
                  ? "Giao dịch mua gói thuê bao đã được xác nhận qua cổng PayOS và số giờ đã được cộng vào tài khoản."
                  : "Giao dịch của bạn đã được xác nhận qua cổng PayOS và ghi nhận vào hệ thống Thong Dong."}
              </p>
            </div>

            {!isPlanPurchase && invoice && (
              <div className="p-5 rounded bg-td-chalk border border-td-rule text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between text-td-muted">
                  <span>Số hóa đơn:</span>
                  <span className="font-bold text-td-ink">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-td-muted">
                  <span>Mã đơn thuê chính thức:</span>
                  <span className="font-bold text-td-ink">#{invoice.orderId}</span>
                </div>
                <div className="flex justify-between text-td-muted">
                  <span>Số tiền đã thanh toán:</span>
                  <span className="font-bold text-primary text-sm">
                    {formatVnd(invoice.amount)}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 rounded bg-primary-tint border border-primary/30 text-warning text-xs font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>
                {isPlanPurchase
                  ? "Gói thuê bao đã được kích hoạt. Bạn có thể dùng ngay khi đặt xe."
                  : "Đơn thuê đã được phát hành. Nhân viên sẽ chuẩn bị, kiểm định và bàn giao xe theo lịch hẹn."}
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {isPlanPurchase ? (
                <Link
                  href="/my-subscriptions"
                  className="px-6 py-3 rounded bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Xem gói thuê của tôi</span>
                </Link>
              ) : (
                <>
                  <Link
                    href={hasOrderCode ? `/invoices/${orderCode}` : "/invoices"}
                    className="px-6 py-3 rounded bg-stage-ink hover:bg-stage-ink text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Xem chi tiết hóa đơn</span>
                  </Link>
                  <Link
                    href="/booking"
                    className="px-6 py-3 rounded bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2"
                  >
                    <Car className="w-4 h-4" />
                    <span>Đặt thêm xe</span>
                  </Link>
                </>
              )}
            </div>
          </>
        ) : isCancelled ? (
          <>
            <div className="w-16 h-16 rounded-full bg-danger-bg text-danger flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-td-ink tracking-tight">
                Giao dịch đã bị huỷ
              </h1>
              <p className="text-xs sm:text-sm text-td-muted">
                Bạn đã huỷ giao dịch hoặc hết thời gian thanh toán trên cổng PayOS.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={
                  isPlanPurchase
                    ? "/subscriptions"
                    : hasOrderCode
                      ? `/invoices/${orderCode}`
                      : "/invoices"
                }
                className="px-6 py-3 rounded bg-primary text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Thử thanh toán lại
              </Link>
              <Link
                href={isPlanPurchase ? "/subscriptions" : "/invoices"}
                className="px-6 py-3 rounded border border-td-rule text-td-ink font-semibold text-xs sm:text-sm"
              >
                {isPlanPurchase ? "Về trang gói cước" : "Về danh sách hóa đơn"}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-tint text-primary-graphic flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-td-ink tracking-tight">
                {waitingOrder ? "Đã nhận thanh toán, đang hoàn tất đơn thuê..." : "Đang đối soát giao dịch..."}
              </h1>
              <p className="text-xs sm:text-sm text-td-muted">
                Hệ thống đang chờ tín hiệu xác nhận từ cổng ngân hàng / PayOS (lần thử {pollCount}/15).
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="px-5 py-2.5 rounded border border-td-rule hover:bg-td-chalk text-td-ink text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>Kiểm tra lại ngay</span>
              </button>

              <Link
                href={isPlanPurchase ? "/subscriptions" : "/invoices"}
                className="px-5 py-2.5 rounded bg-primary text-white text-xs font-bold"
              >
                {isPlanPurchase ? "Về trang gói cước" : "Về trang hóa đơn"}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
