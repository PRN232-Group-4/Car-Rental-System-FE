"use client";

import React, { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getInvoices, Invoice } from "@/features/invoices";

export default function HoaDonPage() {
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
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
        String(inv.rentalId).includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Đã thanh toán
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
            <Clock className="w-3.5 h-3.5 text-primary-graphic" />
            Chưa thanh toán
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-danger-bg text-danger">
            <AlertCircle className="w-3.5 h-3.5 text-danger" />
            Quá hạn
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-td-chalk text-td-muted">
            <XCircle className="w-3.5 h-3.5 text-td-muted" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-td-chalk text-td-ink">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint border border-primary/30 text-warning text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Quản lý tài chính & Hoá đơn</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-td-ink tracking-tight">
            Danh sách hoá đơn
          </h1>
          <p className="text-sm text-td-muted mt-1">
            Tra cứu hoá đơn tiền thuê xe trực tiếp, tiền đặt cọc và thanh toán trực tuyến qua cổng PayOS.
          </p>
        </div>

        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all shrink-0"
        >
          <span>Tạo đơn thuê mới</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-td-white p-4 rounded border border-td-rule shadow-xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
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
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-td-muted hover:bg-td-chalk"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-td-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số hoá đơn, mã đơn..."
            className="w-full pl-9 pr-4 py-2 rounded border border-td-rule text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
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
      ) : filteredInvoices.length === 0 ? (
        <div className="p-12 rounded bg-td-white border border-dashed border-td-rule text-center space-y-3">
          <div className="w-12 h-12 rounded bg-td-chalk text-td-muted flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-td-ink">Không tìm thấy hoá đơn phù hợp</h3>
          <p className="text-xs text-td-muted">
            {searchQuery
              ? "Hãy thử tìm kiếm với từ khoá khác hoặc xoá bộ lọc."
              : "Bạn chưa có hoá đơn thuê xe trực tiếp nào trong mục này."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((inv) => {
            return (
              <div
                key={inv.id}
                className="p-5 sm:p-6 rounded bg-td-white border border-td-rule shadow-xs hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded bg-primary-tint text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-base text-td-ink">
                        {inv.invoiceNumber}
                      </span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="text-xs text-td-muted flex flex-wrap items-center gap-3">
                      <span>Mã chuyến xe: #{inv.rentalId}</span>
                      <span>·</span>
                      <span>Ngày lập: {new Date(inv.issuedAt).toLocaleDateString("vi-VN")}</span>
                      {inv.dueAt && (
                        <>
                          <span>·</span>
                          <span>Hạn nộp: {new Date(inv.dueAt).toLocaleDateString("vi-VN")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-td-rule">
                  <div className="text-left md:text-right">
                    <div className="text-xs text-td-muted font-semibold uppercase tracking-wider">
                      Tổng thanh toán
                    </div>
                    <div className="text-lg font-bold text-td-ink">
                      {inv.amount.toLocaleString("vi-VN")} đ
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="px-4 py-2 rounded border border-td-rule hover:bg-td-chalk text-td-ink text-xs font-bold transition-colors"
                    >
                      Chi tiết
                    </Link>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
