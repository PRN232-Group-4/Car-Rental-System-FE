"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Đang kiểm tra kết quả thanh toán...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const searchParams = useSearchParams();

  const orderCode = searchParams.get("orderCode") || searchParams.get("invoiceId") || "";
  const hasOrderCode = orderCode.length > 0;
  const urlStatus = (searchParams.get("status") || "").toUpperCase();
  const isCancelled = searchParams.get("cancel") === "true" || urlStatus === "CANCELLED";
  // Plan purchases reuse this page: PayOS returns their orderCode in a high range, and the BE
  // also marks the return URL with type=subscription.
  const isPlanPurchase = searchParams.get("type") === "subscription" || Number(orderCode) >= 1_000_000_000;

  const [pollCount, setPollCount] = useState(0);

  // Poll every 2.5s up to 15 times until the PayOS webhook confirms the payment server-side.
  const invoiceQuery = useQuery<Invoice | null>({
    queryKey: ["invoice-poll", orderCode],
    queryFn: () => getInvoiceById(orderCode),
    enabled: !isPlanPurchase && hasOrderCode,
    refetchInterval: (query) => (query.state.data?.status === "paid" || isCancelled || pollCount >= 15 ? false : 2500),
  });

  const planQuery = useQuery<PlanPurchaseStatus>({
    queryKey: ["plan-purchase-poll", orderCode],
    queryFn: () => getPlanPurchaseStatus(orderCode),
    enabled: isPlanPurchase && hasOrderCode,
    refetchInterval: (query) => (query.state.data?.status === "paid" || isCancelled || pollCount >= 15 ? false : 2500),
  });

  const invoice = invoiceQuery.data;
  const isPaid = isPlanPurchase ? planQuery.data?.status === "paid" : invoice?.status === "paid";
  const refetch = isPlanPurchase ? planQuery.refetch : invoiceQuery.refetch;
  const isFetching = isPlanPurchase ? planQuery.isFetching : invoiceQuery.isFetching;

  useEffect(() => {
    if (!isCancelled && !isPaid && pollCount < 15) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pollCount, isPaid, isCancelled]);

  const isSuccess = isPaid || urlStatus === "PAID";

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center space-y-6">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {isPlanPurchase ? "Thanh toán gói thành công!" : "Thanh toán thành công!"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                {isPlanPurchase
                  ? "Giao dịch mua gói thuê bao đã được xác nhận qua cổng PayOS và số giờ đã được cộng vào tài khoản."
                  : "Giao dịch của bạn đã được xác nhận qua cổng PayOS và ghi nhận vào hệ thống Thong Dong."}
              </p>
            </div>

            {!isPlanPurchase && invoice && (
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between text-neutral-600">
                  <span>Số hoá đơn:</span>
                  <span className="font-bold text-neutral-900">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Mã đơn thuê:</span>
                  <span className="font-bold text-neutral-900">#{invoice.rentalId}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Số tiền đã thanh toán:</span>
                  <span className="font-black text-emerald-600 text-sm">
                    {invoice.amount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isPlanPurchase
                  ? "Gói thuê bao đã được kích hoạt. Bạn có thể dùng ngay khi đặt xe."
                  : "Xe đã sẵn sàng bàn giao theo lịch hẹn. Nhân viên chi nhánh sẽ liên hệ hỗ trợ bạn."}
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {isPlanPurchase ? (
                <Link
                  href="/my-subscriptions"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Xem gói thuê của tôi</span>
                </Link>
              ) : (
                <>
                  <Link
                    href={hasOrderCode ? `/invoices/${orderCode}` : "/invoices"}
                    className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Xem chi tiết hoá đơn</span>
                  </Link>
                  <Link
                    href="/booking"
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
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
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Giao dịch đã bị huỷ
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
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
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Thử thanh toán lại
              </Link>
              <Link
                href={isPlanPurchase ? "/subscriptions" : "/invoices"}
                className="px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs sm:text-sm"
              >
                {isPlanPurchase ? "Về trang gói cước" : "Về danh sách hoá đơn"}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Đang đối soát giao dịch...
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Hệ thống đang chờ tín hiệu xác nhận từ cổng ngân hàng / PayOS (lần thử {pollCount}/15).
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>Kiểm tra lại ngay</span>
              </button>

              <Link
                href={isPlanPurchase ? "/subscriptions" : "/invoices"}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                {isPlanPurchase ? "Về trang gói cước" : "Về trang hoá đơn"}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
