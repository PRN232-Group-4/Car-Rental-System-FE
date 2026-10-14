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
      <div className="p-12 text-center text-sm text-ink-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
        <span>Đang tải thông tin chi tiết hoá đơn...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 max-w-lg mx-auto bg-surface rounded-3xl border border-line text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-primary-graphic mx-auto" />
        <h2 className="text-xl font-bold text-ink">Không tìm thấy hoá đơn</h2>
        <p className="text-sm text-ink-3">
          Hoá đơn này không tồn tại hoặc bạn không có quyền xem thông tin.
        </p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stage-ink text-white text-xs font-bold"
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-3 hover:text-ink transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Danh sách hoá đơn</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Đã thanh toán
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
                  <Clock className="w-3.5 h-3.5 text-primary-graphic" />
                  Chờ thanh toán
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-ink-3 mt-1">
              Áp dụng cho chuyến xe #{invoice.rentalId} · Ngày phát hành:{" "}
              {new Date(invoice.issuedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-ink-3 font-semibold uppercase tracking-wider block">
              Tổng tiền
            </span>
            <span className="text-2xl sm:text-3xl font-black text-primary">
              {invoice.amount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Breakdown Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6">
        <h2 className="text-base font-bold text-ink border-b border-line pb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <span>Bảng kê chi tiết thanh toán</span>
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-line">
            <div>
              <div className="font-bold text-ink">Tiền thuê phương tiện</div>
              <div className="text-xs text-ink-3">Tính theo giờ thực tế trong đơn thuê xe</div>
            </div>
            <span className="font-bold text-ink">
              {rentalFee.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-line">
            <div>
              <div className="font-bold text-ink">Thuế giá trị gia tăng (VAT 10%)</div>
              <div className="text-xs text-ink-3">Hoá đơn điện tử hợp lệ</div>
            </div>
            <span className="font-bold text-ink">
              {invoice.vatAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-line">
            <div>
              <div className="font-bold text-ink flex items-center gap-2">
                <span>Tiền đặt cọc xe</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-info-bg text-info">
                  Hoàn lại 100%
                </span>
              </div>
              <div className="text-xs text-ink-3">
                Tự động hoàn về tài khoản sau khi bàn giao xe và kiểm định đạt yêu cầu
              </div>
            </div>
            <span className="font-bold text-ink">
              {depositAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="pt-2 flex justify-between items-baseline">
            <span className="text-base font-bold text-ink">Tổng cộng cần thanh toán:</span>
            <span className="text-2xl font-black text-ink">
              {invoice.amount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        {/* Security & Refund note */}
        <div className="p-4 rounded-2xl bg-sunken border border-line flex items-start gap-3 text-xs text-ink-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-ink">Cơ chế bảo đảm tiền cọc:</p>
            <p>
              Sau khi trả xe và nhân viên kiểm định ngoại quan không có hư hỏng phát sinh, hệ thống sẽ tự động kích hoạt lệnh hoàn trả số tiền đặt cọc {depositAmount.toLocaleString("vi-VN")} đ về tài khoản của bạn.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-danger-bg border border-danger/30 text-danger text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-line flex items-center justify-between gap-4">
          <Link
            href="/payment-history"
            className="text-xs font-bold text-ink-3 hover:text-ink transition-colors"
          >
            Xem lịch sử thanh toán
          </Link>

          {!isPaid ? (
            <button
              onClick={handleCheckout}
              disabled={paying}
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Hoá đơn đã được thanh toán</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
