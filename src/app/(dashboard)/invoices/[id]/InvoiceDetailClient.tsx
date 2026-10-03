"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceById, checkoutInvoice, Invoice } from "@/features/invoices";

export default function HoaDonDetailClient({ id }: { id: string }) {
  const { data: invoice, isLoading } = useQuery<Invoice | null>({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id),
  });

  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!invoice) return;
    setPaying(true);
    setErrorMessage(null);
    try {
      const res = await checkoutInvoice(invoice.id);
      if (res && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Không nhận được liên kết thanh toán từ cổng PayOS.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo giao dịch thanh toán.";
      setErrorMessage(msg);
      setPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-neutral-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
        <span>Đang tải thông tin chi tiết hoá đơn...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 max-w-lg mx-auto bg-white rounded-3xl border border-neutral-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Không tìm thấy hoá đơn</h2>
        <p className="text-sm text-neutral-500">
          Hoá đơn này không tồn tại hoặc bạn không có quyền xem thông tin.
        </p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const depositAmount = 2000000;
  const rentalFee = Math.max(0, invoice.amount - invoice.vatAmount - depositAmount);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Danh sách hoá đơn</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã thanh toán
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Chờ thanh toán
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Áp dụng cho chuyến xe #{invoice.rentalId} · Ngày phát hành:{" "}
              {new Date(invoice.issuedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
              Tổng tiền
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {invoice.amount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Breakdown Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          <span>Bảng kê chi tiết thanh toán</span>
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <div>
              <div className="font-bold text-neutral-800">Tiền thuê phương tiện</div>
              <div className="text-xs text-neutral-500">Tính theo giờ thực tế trong đơn thuê xe</div>
            </div>
            <span className="font-bold text-neutral-900">
              {rentalFee.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <div>
              <div className="font-bold text-neutral-800">Thuế giá trị gia tăng (VAT 10%)</div>
              <div className="text-xs text-neutral-500">Hoá đơn điện tử hợp lệ</div>
            </div>
            <span className="font-bold text-neutral-900">
              {invoice.vatAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <div>
              <div className="font-bold text-neutral-800 flex items-center gap-2">
                <span>Tiền đặt cọc xe</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Hoàn lại 100%
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Tự động hoàn về tài khoản sau khi bàn giao xe và kiểm định đạt yêu cầu
              </div>
            </div>
            <span className="font-bold text-neutral-900">
              {depositAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="pt-2 flex justify-between items-baseline">
            <span className="text-base font-bold text-neutral-900">Tổng cộng cần thanh toán:</span>
            <span className="text-2xl font-black text-neutral-900">
              {invoice.amount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        {/* Security & Refund note */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-3 text-xs text-neutral-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-neutral-800">Cơ chế bảo đảm tiền cọc:</p>
            <p>
              Sau khi trả xe và nhân viên kiểm định ngoại quan không có hư hỏng phát sinh, hệ thống sẽ tự động kích hoạt lệnh hoàn trả số tiền đặt cọc {depositAmount.toLocaleString("vi-VN")} đ về tài khoản của bạn.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
          <Link
            href="/payment-history"
            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Xem lịch sử thanh toán
          </Link>

          {!isPaid ? (
            <button
              onClick={handleCheckout}
              disabled={paying}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kết nối cổng PayOS...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Thanh toán ngay qua PayOS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Hoá đơn đã được thanh toán</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
