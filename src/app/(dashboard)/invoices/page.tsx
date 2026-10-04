"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã thanh toán
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ thanh toán
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Quá hạn
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
            <XCircle className="w-3.5 h-3.5 text-neutral-400" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quản lý tài chính & Hoá đơn</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Danh sách hoá đơn
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Tra cứu hoá đơn tiền thuê xe trực tiếp, tiền đặt cọc và thanh toán trực tuyến qua cổng PayOS.
          </p>
        </div>

        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          <span>Tạo đơn thuê mới</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ thanh toán" },
            { id: "paid", label: "Đã thanh toán" },
            { id: "overdue", label: "Quá hạn" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số hoá đơn, mã đơn..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Không tìm thấy hoá đơn phù hợp</h3>
          <p className="text-xs text-neutral-500">
            {searchQuery
              ? "Hãy thử tìm kiếm với từ khoá khác hoặc xoá bộ lọc."
              : "Bạn chưa có hoá đơn thuê xe trực tiếp nào trong mục này."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((inv) => {
            const isPending = inv.status === "pending";
            return (
              <div
                key={inv.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-base text-neutral-900">
                        {inv.invoiceNumber}
                      </span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-3">
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

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="text-left md:text-right">
                    <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                      Tổng thanh toán
                    </div>
                    <div className="text-lg font-black text-neutral-900">
                      {inv.amount.toLocaleString("vi-VN")} đ
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors"
                    >
                      Chi tiết
                    </Link>

                    {isPending && (
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh toán</span>
                      </Link>
                    )}
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
