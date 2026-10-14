"use client";

import React from "react";
import Link from "@/components/navigation/NavigationLink";
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint border border-primary/30 text-warning text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span>Gói thuê bao xe trả trước</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Gói thuê bao của tôi
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Theo dõi số giờ di chuyển khả dụng, thời hạn sử dụng và lịch sử trừ giờ theo từng chuyến đi.
          </p>
        </div>

        <Link
          href="/subscriptions"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mua thêm gói cước</span>
        </Link>
      </div>

      {/* Active Subscriptions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-surface border border-line animate-pulse" />
          ))}
        </div>
      ) : activeSubscriptions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-surface border border-dashed border-line-strong text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-ink">Bạn chưa có gói thuê bao nào đang hoạt động</h3>
            <p className="text-sm text-ink-3 mt-1">
              Đăng ký ngay gói theo giờ để tiết kiệm chi phí và đặt xe linh hoạt mà không cần thanh toán từng lượt lẻ.
            </p>
          </div>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover transition-all"
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
                className="p-6 sm:p-7 rounded-3xl bg-surface border border-line shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                {/* Status Banner / Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-primary-tint text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Đang hoạt động
                  </span>
                  <span className="text-xs font-semibold text-ink-3">
                    Mã gói: #{sub.id}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mb-2">
                  {sub.planName}
                </h3>

                {/* Warning Alerts */}
                {(isLowHours || isExpiringSoon) && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-primary-tint border border-primary/30 text-warning text-xs font-semibold flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-primary-graphic shrink-0 mt-0.5" />
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
                <div className="p-5 rounded-2xl bg-canvas border border-line mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                      Số giờ còn lại
                    </span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">
                        {sub.remainingHours}
                      </span>
                      <span className="text-sm font-bold text-ink-3 ml-1">
                        / {sub.totalHours} giờ
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-sunken overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLowHours
                          ? "bg-primary-hover"
                          : "bg-primary"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                  {/* Dates metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div className="flex items-center gap-2 text-ink-3">
                      <Calendar className="w-4 h-4 text-ink-3" />
                      <div>
                        <div className="text-ink-3">Bắt đầu</div>
                        <div className="font-semibold text-ink">
                          {new Date(sub.startDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-ink-3">
                      <Clock className="w-4 h-4 text-ink-3" />
                      <div>
                        <div className="text-ink-3">Hết hạn</div>
                        <div className="font-semibold text-ink">
                          {endDate.toLocaleDateString("vi-VN")} ({daysRemaining} ngày)
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Card Bottom CTA */}
                <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                  <Link
                    href={`/booking?subscriptionId=${sub.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    <span>Dùng gói đặt xe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-line hover:bg-sunken text-ink-2 text-xs sm:text-sm font-semibold transition-colors"
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
          <h3 className="text-lg font-bold text-ink mb-4">Lịch sử gói thuê bao cũ</h3>
          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-sunken text-xs font-semibold text-ink-3 uppercase border-b border-line">
                <tr>
                  <th className="p-4">Tên gói</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Tổng giờ</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pastSubscriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-sunken/50">
                    <td className="p-4 font-bold text-ink">{item.planName}</td>
                    <td className="p-4 text-xs text-ink-3">
                      {new Date(item.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(item.endDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 font-semibold text-ink-2">{item.totalHours} giờ</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sunken text-ink-3">
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
      <div className="p-5 rounded-2xl bg-sunken/70 border border-line flex items-start gap-3 text-xs text-ink-3">
        <HelpCircle className="w-4 h-4 text-ink-3 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-ink">Quy tắc quản lý số dư thuê bao:</p>
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
