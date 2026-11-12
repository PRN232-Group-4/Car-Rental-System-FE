"use client";

import React, { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { getPayments, PaymentSummary } from "@/features/payments";
import { formatDateTime } from "@/lib/time";
import { formatVnd } from "@/lib/format";

export default function LichSuThanhToanPage() {
  const { data: payments = [], isLoading, error, refetch } = useQuery<PaymentSummary[]>({
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

  const STATUS_LABELS: Record<string, string> = {
    paid: "Thành công",
    requested: "Đang xử lý hoàn",
    refunded: "Đã hoàn cọc",
    rejected: "Từ chối hoàn",
  };
  const STATUS_TONE: Record<string, string> = {
    paid: "approved",
    requested: "pending",
    refunded: "reserved",
    rejected: "rejected",
  };

  const getStatusBadge = (status: string) => {
    const key = status.toLowerCase();
    return <StatusBadge status={STATUS_TONE[key] ?? key}>{STATUS_LABELS[key] ?? status}</StatusBadge>;
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
    <div className="space-y-8">
      <TransitFolio
        title="Lịch sử thanh toán & hoàn cọc"
        description="Minh bạch toàn bộ dòng tiền: tiền thuê, tiền cọc đã nộp và trạng thái hoàn cọc sau khi kết thúc chuyến xe."
      >
      </TransitFolio>

      {/* Tổng dòng tiền: ba con số đọc như dữ liệu, cùng một hàng */}
      <dl className="grid grid-cols-1 border-y border-td-rule sm:grid-cols-3 sm:divide-x sm:divide-td-rule">
        <div className="py-3 sm:px-5 sm:first:pl-0">
          <dt className="text-xs text-td-muted">Tổng tiền đã nộp</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-td-ink">{formatVnd(totalPaid)}</dd>
          <dd className="text-xs text-td-muted">Bao gồm cọc và phí thuê</dd>
        </div>
        <div className="py-3 sm:px-5 sm:first:pl-0">
          <dt className="text-xs text-td-muted">Tiền cọc đã hoàn trả</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-td-ink">{formatVnd(totalRefunded)}</dd>
          <dd className="text-xs text-td-muted">Đã giải ngân về tài khoản</dd>
        </div>
        <div className="py-3 sm:px-5 sm:first:pl-0">
          <dt className="text-xs text-td-muted">Tiền cọc đang giữ / chờ duyệt</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-td-ink">{formatVnd(depositHolding)}</dd>
          <dd className="text-xs text-td-muted">Chờ biên bản hậu kiểm định</dd>
        </div>
      </dl>

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
            className={`px-4 py-2 rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterType === tab.id
                ? "bg-stage-ink text-white"
                : "bg-td-white border border-td-rule text-td-muted hover:bg-td-chalk"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="rounded border border-td-rule bg-td-white overflow-hidden">
        {isLoading ? (
          <div className="p-6"><TableSkeleton label="Đang tải lịch sử giao dịch" rows={5} columns={5} /></div>
        ) : error ? (
          <div className="p-6">
            <ErrorState
              message="Không thể tải lịch sử giao dịch. Vui lòng kiểm tra kết nối và thử lại."
              onRetry={() => { void refetch(); }}
            />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <h3 className="font-bold text-td-ink">Chưa có giao dịch trong danh mục này</h3>
            <p className="text-xs text-td-muted">Các giao dịch thanh toán sẽ tự động ghi sổ tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-td-chalk text-xs font-semibold text-td-muted border-b border-td-rule">
                <tr>
                  <th className="p-4 sm:p-5">Giao dịch</th>
                  <th className="p-4 sm:p-5">Mã đơn / Hóa đơn</th>
                  <th className="p-4 sm:p-5">Phương thức</th>
                  <th className="p-4 sm:p-5">Thời gian</th>
                  <th className="p-4 sm:p-5">Số tiền</th>
                  <th className="p-4 sm:p-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-td-rule">
                {filteredPayments.map((p) => {
                  const meta = getTypeLabel(p.type);
                  return (
                    <tr key={p.id} className="hover:bg-td-chalk/60 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
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
                            <div className="font-bold text-td-ink">{meta.label}</div>
                            <div className="text-xs text-td-muted font-mono">
                              Ref: {p.providerReference || "ThongDong Internal"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-td-ink">
                            {p.rentalId ? `Chuyến #${p.rentalId}` : "Gói thuê bao"}
                          </span>
                          {p.invoiceId && (
                            <Link
                              href={`/invoices/${p.invoiceId}`}
                              className="block text-xs text-primary hover:underline"
                            >
                              Hóa đơn #{p.invoiceId}
                            </Link>
                          )}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="text-xs font-semibold text-td-muted">
                          {p.method || "PayOS"}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-xs text-td-muted">
                        {formatDateTime(p.createdAt)}{" "}
                        <span className="text-xs text-td-muted">
                          {new Date(p.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 font-bold text-sm">
                        <span className={meta.isCredit ? "text-info" : "text-td-ink"}>
                          {meta.isCredit ? "+" : "-"}
                          {formatVnd(p.amount)}
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
