"use client";

import React, { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import { FileText, ArrowRight, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getInvoices, Invoice } from "@/features/invoices";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/time";
import { formatVnd } from "@/lib/format";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";

export default function HoaDonPage() {
  const { data: invoices = [], isLoading, error, refetch } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter !== "all" && inv.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        String(inv.rentalId).includes(q) || (inv.orderId != null && String(inv.orderId).includes(q))
      );
    }
    return true;
  });

  const statusLabel: Record<string, string> = {
    paid: "Đã thanh toán",
    pending: "Chưa thanh toán",
    overdue: "Quá hạn",
    cancelled: "Đã huỷ",
  };

  const getStatusBadge = (status: string) => (
    <StatusBadge status={status.toLowerCase()} label={statusLabel[status.toLowerCase()]} />
  );

  return (
    <div className="space-y-8">
      <TransitFolio
        index="09"
        tag="KH"
        kicker="KHÁCH HÀNG · TÀI CHÍNH & HOÁ ĐƠN"
        title={<>Danh sách <em className="italic text-td-teal">hóa đơn.</em></>}
        description="Tra cứu hóa đơn tiền thuê xe trực tiếp, tiền đặt cọc và thanh toán trực tuyến qua cổng PayOS."
      >
        <div className="border-l border-td-rule pl-4 text-right">
          <span className="block font-mono text-[10px] tracking-wider text-td-muted">TỔNG HOÁ ĐƠN</span>
          <strong className="block text-3xl font-bold tracking-tight text-td-ink">
            {isLoading ? "—" : String(invoices.length).padStart(2, "0")}
          </strong>
        </div>
        <Link
          href="/booking"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded bg-primary px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
        >
          <span>Tạo đơn thuê mới</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </TransitFolio>

      {/* Filters and Search Bar */}
      <div className="flex flex-col items-start justify-between gap-4 border-y border-td-rule py-3 sm:flex-row sm:items-center">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chưa thanh toán" },
            { id: "paid", label: "Đã thanh toán" },
            { id: "cancelled", label: "Đã huỷ" },
            { id: "overdue", label: "Quá hạn" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`cursor-pointer border-b-2 px-3 py-1 font-bold transition-colors ${
                activeFilter === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-td-muted hover:text-td-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-td-muted" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số hóa đơn, mã đơn..."
            aria-label="Tìm hóa đơn"
            className="w-full border-b border-td-rule bg-transparent py-1.5 pl-8 pr-3 font-mono text-xs text-td-ink placeholder-td-muted outline-none focus:border-td-ink"
          />
        </div>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded bg-td-white border border-td-rule animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="text-sm text-danger">{error instanceof Error ? error.message : "Không tải được hóa đơn."} <button type="button" className="underline" onClick={() => void refetch()}>Thử lại</button></p>
      ) : filteredInvoices.length === 0 ? (
        <div className="border-t border-td-ink py-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-td-muted" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-bold text-td-ink">Không tìm thấy hóa đơn phù hợp</h3>
          <p className="mt-1 text-xs text-td-muted">
            {searchQuery
              ? "Hãy thử tìm kiếm với từ khóa khác hoặc xoá bộ lọc."
              : "Bạn chưa có hóa đơn thuê xe trực tiếp nào trong mục này."}
          </p>
        </div>
      ) : (
        <section aria-label="Danh sách hóa đơn" className="border-t border-td-ink">
          {/* Trên màn hình hẹp, sổ cái cuộn ngang thay vì bóp méo từng cột. */}
          <div className="overflow-x-auto">
          <div className="min-w-[720px]">
          <div className="grid grid-cols-12 gap-4 border-b border-td-ink py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-td-muted">
            <span className="col-span-5">Hóa đơn</span>
            <span className="col-span-3">Mốc thời gian</span>
            <span className="col-span-2 text-right">Tổng thanh toán</span>
            <span className="col-span-2 text-right">Trạng thái</span>
          </div>
          <div className="divide-y divide-td-rule border-b border-td-rule">
            {filteredInvoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-12 items-center gap-4 py-3.5">
                <div className="col-span-5 min-w-0">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="block truncate font-mono text-xs font-bold text-td-ink hover:text-primary"
                  >
                    {inv.invoiceNumber}
                  </Link>
                  <span className="mt-0.5 block truncate text-xs text-td-muted">
                    Mã yêu cầu #{inv.rentalId}{inv.orderId ? ` · Mã đơn chính thức #${inv.orderId}` : ""}
                  </span>
                </div>
                <div className="col-span-3 font-mono text-[11px] text-td-muted">
                  <span className="block">Lập {formatDate(inv.issuedAt)}</span>
                  {inv.dueAt && <span className="block">Hạn {formatDate(inv.dueAt)}</span>}
                </div>
                <span className="col-span-2 text-right font-mono text-xs font-bold text-td-ink">
                  {formatVnd(inv.amount)}
                </span>
                <div className="col-span-2 flex items-center justify-end gap-3">
                  {getStatusBadge(inv.status)}
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="rounded border border-td-rule px-2 py-1 text-[11px] font-bold text-td-ink transition-colors hover:bg-td-chalk"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </div>
          </div>
        </section>
      )}
    </div>
  );
}
