"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPayments, PaymentSummary } from "@/features/payments";

export default function LichSuThanhToanPage() {
  const { data: payments = [], isLoading } = useQuery<PaymentSummary[]>({
    queryKey: ["payments"],
    queryFn: () => getPayments(),
  });

  const [filterType, setFilterType] = useState<string>("all");

  const filteredPayments = payments.filter((p) => {
    if (filterType === "all") return true;
    return p.type === filterType;
  });

  // Calculate summary metrics
  const totalPaid = payments
    .filter((p) => p.status === "paid" && p.type !== "refund")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.type === "refund" && p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const depositHolding = payments
    .filter((p) => p.type === "deposit" && (p.status === "paid" || p.status === "requested"))
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Thành công
          </span>
        );
      case "requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
            <Clock className="w-3.5 h-3.5 text-primary-graphic" />
            Đang xử lý hoàn
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-info-bg text-info">
            <RotateCcw className="w-3.5 h-3.5 text-info" />
            Đã hoàn cọc
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-danger-bg text-danger">
            <XCircle className="w-3.5 h-3.5 text-danger" />
            Từ chối hoàn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sunken text-ink-3">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type?: string | null) => {
    switch (type?.toLowerCase()) {
      case "rental":
        return { label: "Tiền thuê xe", isCredit: false };
      case "deposit":
        return { label: "Tiền đặt cọc", isCredit: false };
      case "refund":
        return { label: "Hoàn tiền cọc", isCredit: true };
      case "overtime":
        return { label: "Phụ phí phát sinh", isCredit: false };
      default:
        return { label: "Giao dịch thanh toán", isCredit: false };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint border border-primary/30 text-warning text-xs font-bold mb-2">
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          <span>Sổ cái tài chính & Lịch sử giao dịch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Lịch sử thanh toán & Hoàn cọc
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          Minh bạch toàn bộ dòng tiền: tiền thuê, tiền cọc đã nộp và trạng thái hoàn cọc sau khi kết thúc chuyến xe.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-surface border border-line shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-1">
            Tổng tiền đã nộp
          </div>
          <div className="text-2xl font-black text-ink">
            {totalPaid.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-ink-3 mt-1">Bao gồm cọc và phí thuê</div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-line shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-info mb-1">
            Tiền cọc đã hoàn trả
          </div>
          <div className="text-2xl font-black text-info">
            {totalRefunded.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-ink-3 mt-1">Đã giải ngân về tài khoản</div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-line shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-primary-graphic mb-1">
            Tiền cọc đang giữ / chờ duyệt
          </div>
          <div className="text-2xl font-black text-primary-graphic">
            {depositHolding.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-ink-3 mt-1">Chờ biên bản hậu kiểm định</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Tất cả giao dịch" },
          { id: "rental", label: "Tiền thuê xe" },
          { id: "deposit", label: "Tiền đặt cọc" },
          { id: "refund", label: "Hoàn cọc (Refund)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterType === tab.id
                ? "bg-stage-ink text-white shadow-xs"
                : "bg-surface border border-line text-ink-3 hover:bg-sunken"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="rounded-3xl border border-line bg-surface overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-ink-3">Đang tải lịch sử giao dịch...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-10 h-10 text-ink-3 mx-auto" />
            <h3 className="font-bold text-ink">Chưa có giao dịch trong danh mục này</h3>
            <p className="text-xs text-ink-3">Các giao dịch thanh toán sẽ tự động ghi sổ tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sunken text-xs font-semibold text-ink-3 uppercase border-b border-line">
                <tr>
                  <th className="p-4 sm:p-5">Giao dịch</th>
                  <th className="p-4 sm:p-5">Mã đơn / Hoá đơn</th>
                  <th className="p-4 sm:p-5">Phương thức</th>
                  <th className="p-4 sm:p-5">Thời gian</th>
                  <th className="p-4 sm:p-5">Số tiền</th>
                  <th className="p-4 sm:p-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredPayments.map((p) => {
                  const meta = getTypeLabel(p.type);
                  return (
                    <tr key={p.id} className="hover:bg-sunken/60 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              meta.isCredit
                                ? "bg-info-bg text-info"
                                : "bg-primary-tint text-primary"
                            }`}
                          >
                            {meta.isCredit ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-ink">{meta.label}</div>
                            <div className="text-xs text-ink-3 font-mono">
                              Ref: {p.providerReference || "ThongDong Internal"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-ink">
                            {p.rentalId ? `Chuyến #${p.rentalId}` : "Gói thuê bao"}
                          </span>
                          {p.invoiceId && (
                            <Link
                              href={`/invoices/${p.invoiceId}`}
                              className="block text-xs text-primary hover:underline"
                            >
                              Hoá đơn #{p.invoiceId}
                            </Link>
                          )}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="text-xs font-semibold text-ink-3 uppercase">
                          {p.method || "PayOS"}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-xs text-ink-3">
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}{" "}
                        <span className="text-xs text-ink-3">
                          {new Date(p.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 font-black text-sm">
                        <span className={meta.isCredit ? "text-info" : "text-ink"}>
                          {meta.isCredit ? "+" : "-"}
                          {p.amount.toLocaleString("vi-VN")} đ
                        </span>
                      </td>

                      <td className="p-4 sm:p-5">{getStatusBadge(p.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
