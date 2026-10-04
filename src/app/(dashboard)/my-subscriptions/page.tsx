"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMySubscriptions, CustomerSubscription } from "@/features/subscriptions";

export default function MySubscriptionsPage() {
  const { data: subscriptions = [], isLoading } = useQuery<CustomerSubscription[]>({
    queryKey: ["my-subscriptions"],
    queryFn: getMySubscriptions,
  });

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const pastSubscriptions = subscriptions.filter((s) => s.status !== "active");

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gói thuê bao xe trả trước</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Gói thuê bao của tôi
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Theo dõi số giờ di chuyển khả dụng, thời hạn sử dụng và lịch sử trừ giờ theo từng chuyến đi.
          </p>
        </div>

        <Link
          href="/subscriptions"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mua thêm gói cước</span>
        </Link>
      </div>

      {/* Active Subscriptions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : activeSubscriptions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-neutral-900">Bạn chưa có gói thuê bao nào đang hoạt động</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Đăng ký ngay gói theo giờ để tiết kiệm chi phí và đặt xe linh hoạt mà không cần thanh toán từng lượt lẻ.
            </p>
          </div>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition-all"
          >
            <span>Khám phá các gói cước</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeSubscriptions.map((sub) => {
            const endDate = new Date(sub.endDate);
            const now = new Date();
            const daysRemaining = Math.max(
              0,
              Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            );

            // Warnings according to FR-025: < 5 hours or < 3 days
            const isLowHours = sub.remainingHours < 5;
            const isExpiringSoon = daysRemaining <= 3;
            const percentage = Math.min(100, Math.max(0, (sub.remainingHours / sub.totalHours) * 100));

            return (
              <div
                key={sub.id}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                {/* Background accent decor */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full pointer-events-none" />

                <div>
                  {/* Status Banner / Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Đang hoạt động
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      Mã gói: #{sub.id}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-2">
                    {sub.planName}
                  </h3>

                  {/* Warning Alerts */}
                  {(isLowHours || isExpiringSoon) && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        {isLowHours && (
                          <p>
                            Gói của bạn chỉ còn <strong>{sub.remainingHours} giờ</strong> (dưới 5 giờ).
                          </p>
                        )}
                        {isExpiringSoon && (
                          <p>
                            Gói sẽ hết hạn trong <strong>{daysRemaining} ngày</strong> tới (hạn: {endDate.toLocaleDateString("vi-VN")}).
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remaining Hours Gauge */}
                  <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-100 mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Số giờ còn lại
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-emerald-600">
                          {sub.remainingHours}
                        </span>
                        <span className="text-sm font-bold text-neutral-500 ml-1">
                          / {sub.totalHours} giờ
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLowHours
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <div>
                        <div className="text-neutral-400">Bắt đầu</div>
                        <div className="font-semibold text-neutral-800">
                          {new Date(sub.startDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <div>
                        <div className="text-neutral-400">Hết hạn</div>
                        <div className="font-semibold text-neutral-800">
                          {endDate.toLocaleDateString("vi-VN")} ({daysRemaining} ngày)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/booking?subscriptionId=${sub.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    <span>Dùng gói đặt xe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Gia hạn gói</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History of Expired/Past Subscriptions */}
      {pastSubscriptions.length > 0 && (
        <div className="pt-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Lịch sử gói thuê bao cũ</h3>
          <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-200">
                <tr>
                  <th className="p-4">Tên gói</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Tổng giờ</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pastSubscriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-bold text-neutral-900">{item.planName}</td>
                    <td className="p-4 text-xs text-neutral-500">
                      {new Date(item.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(item.endDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 font-semibold text-neutral-700">{item.totalHours} giờ</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                        {item.status === "expired" ? "Hết hạn" : "Đã dùng hết"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Information note */}
      <div className="p-5 rounded-2xl bg-neutral-100/70 border border-neutral-200 flex items-start gap-3 text-xs text-neutral-600">
        <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-neutral-800">Quy tắc quản lý số dư thuê bao:</p>
          <p>
            Mỗi lần đặt xe bằng gói, hệ thống sẽ tạm giữ số giờ tương ứng với thời lượng thuê dự kiến. 
            Sau khi bạn hoàn thành chuyến đi và trả xe, số giờ thực tế sẽ được trừ chính xác vào gói của bạn.
            Không có phí VAT hay phí cọc phát sinh thêm khi sử dụng gói thuê bao.
          </p>
        </div>
      </div>
    </div>
  );
}
