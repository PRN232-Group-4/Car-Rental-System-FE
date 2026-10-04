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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Thành công
          </span>
        );
      case "requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Đang xử lý hoàn
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            Đã hoàn cọc
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Từ chối hoàn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sổ cái tài chính & Lịch sử giao dịch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Lịch sử thanh toán & Hoàn cọc
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Minh bạch toàn bộ dòng tiền: tiền thuê, tiền cọc đã nộp và trạng thái hoàn cọc sau khi kết thúc chuyến xe.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Tổng tiền đã nộp
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {totalPaid.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-neutral-500 mt-1">Bao gồm cọc và phí thuê</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Tiền cọc đã hoàn trả
          </div>
          <div className="text-2xl font-black text-blue-600">
            {totalRefunded.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-neutral-500 mt-1">Đã giải ngân về tài khoản</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Tiền cọc đang giữ / chờ duyệt
          </div>
          <div className="text-2xl font-black text-amber-600">
            {depositHolding.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-neutral-500 mt-1">Chờ biên bản hậu kiểm định</div>
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
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Đang tải lịch sử giao dịch...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-bold text-neutral-900">Chưa có giao dịch trong danh mục này</h3>
            <p className="text-xs text-neutral-500">Các giao dịch thanh toán sẽ tự động ghi sổ tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-200">
                <tr>
                  <th className="p-4 sm:p-5">Giao dịch</th>
                  <th className="p-4 sm:p-5">Mã đơn / Hoá đơn</th>
                  <th className="p-4 sm:p-5">Phương thức</th>
                  <th className="p-4 sm:p-5">Thời gian</th>
                  <th className="p-4 sm:p-5">Số tiền</th>
                  <th className="p-4 sm:p-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPayments.map((p) => {
                  const meta = getTypeLabel(p.type);
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              meta.isCredit
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {meta.isCredit ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{meta.label}</div>
                            <div className="text-xs text-neutral-400 font-mono">
                              Ref: {p.providerReference || "ThongDong Internal"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-neutral-800">
                            {p.rentalId ? `Chuyến #${p.rentalId}` : "Gói thuê bao"}
                          </span>
                          {p.invoiceId && (
                            <Link
                              href={`/invoices/${p.invoiceId}`}
                              className="block text-xs text-emerald-600 hover:underline"
                            >
                              Hoá đơn #{p.invoiceId}
                            </Link>
                          )}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="text-xs font-semibold text-neutral-600 uppercase">
                          {p.method || "PayOS"}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-xs text-neutral-500">
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}{" "}
                        <span className="text-xs text-neutral-400">
                          {new Date(p.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 font-black text-sm">
                        <span className={meta.isCredit ? "text-blue-600" : "text-neutral-900"}>
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
