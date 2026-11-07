"use client";

import React from "react";
import Link from "@/components/navigation/NavigationLink";
import { Package, AlertTriangle, ArrowRight, PlusCircle, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMySubscriptions, CustomerSubscription } from "@/features/subscriptions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/time";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";

export default function MySubscriptionsPage() {
  const { data: subscriptions = [], isLoading, error, refetch } = useQuery<CustomerSubscription[]>({
    queryKey: ["my-subscriptions"],
    queryFn: getMySubscriptions,
  });

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const pastSubscriptions = subscriptions.filter((s) => s.status !== "active");

  return (
    <div className="space-y-8">
      <TransitFolio
        index="09"
        tag="KH"
        kicker="KHÁCH HÀNG · GÓI THUÊ BAO"
        title={<>Gói thuê bao <span className="text-td-teal">của tôi.</span></>}
        description="Theo dõi số giờ di chuyển khả dụng, thời hạn sử dụng và lịch sử trừ giờ theo từng chuyến đi."
      >
        <div className="border-l border-td-rule pl-4 text-right">
          <span className="block font-mono text-[10px] tracking-wider text-td-muted">GÓI ĐANG HOẠT ĐỘNG</span>
          <strong className="block text-3xl font-bold tracking-tight text-td-ink">
            {isLoading || error ? "—" : String(activeSubscriptions.length).padStart(2, "0")}
          </strong>
        </div>
        <Link
          href="/subscriptions"
          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded bg-primary px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>Mua thêm gói cước</span>
        </Link>
      </TransitFolio>

      {/* Active Subscriptions Grid */}
      {isLoading ? (
        <CardGridSkeleton
          label="Đang tải gói thuê bao"
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          count={2}
          mediaClassName="hidden"
          lines={3}
        />
      ) : error ? (
        <ErrorState
          message="Không thể tải danh sách gói thuê bao. Vui lòng kiểm tra kết nối và thử lại."
          onRetry={() => { void refetch(); }}
        />
      ) : activeSubscriptions.length === 0 ? (
        <div className="p-10 rounded bg-td-white border border-dashed border-td-rule text-center space-y-4">
          <div className="w-14 h-14 rounded bg-primary-tint text-primary flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-td-ink">Bạn chưa có gói thuê bao nào đang hoạt động</h3>
            <p className="text-sm text-td-muted mt-1">
              Đăng ký ngay gói theo giờ để tiết kiệm chi phí và đặt xe linh hoạt mà không cần thanh toán từng lượt lẻ.
            </p>
          </div>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-all"
          >
            <span>Khám phá các gói cước</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <section aria-label="Gói đang hoạt động" className="border-t border-td-ink">
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
                className="border-b border-td-rule py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold tracking-tight text-td-ink">{sub.planName}</h3>
                      <StatusBadge status="active">Đang hoạt động</StatusBadge>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-td-muted">
                      Mã gói #{sub.id} · {formatDate(sub.startDate)} → {formatDate(endDate)} ({daysRemaining} ngày)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-td-muted">Số giờ còn lại</span>
                    <span className="font-mono text-xl font-bold text-td-ink">
                      {sub.remainingHours}
                      <span className="ml-1 font-sans text-xs font-semibold text-td-muted">/ {sub.totalHours} giờ</span>
                    </span>
                  </div>
                </div>

                {/* Warning Alerts */}
                {(isLowHours || isExpiringSoon) && (
                  <div className="mt-3 flex items-start gap-2.5 border-l-2 border-warning pl-3 text-xs font-semibold text-td-muted">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                    <div className="space-y-0.5">
                      {isLowHours && (
                        <p>
                          Gói của bạn chỉ còn <strong>{sub.remainingHours} giờ</strong> (dưới 5 giờ).
                        </p>
                      )}
                      {isExpiringSoon && (
                        <p>
                          Gói sẽ hết hạn trong <strong>{daysRemaining} ngày</strong> tới (hạn: {formatDate(endDate)}).
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Thanh giờ còn lại */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden bg-td-chalk">
                    <div
                      className={`h-full transition-all duration-500 ${isLowHours ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/booking?subscriptionId=${sub.id}`}
                      className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-primary-hover"
                    >
                      <span>Dùng gói đặt xe</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/subscriptions"
                      className="inline-flex items-center rounded border border-td-rule px-3 py-1.5 text-[11px] font-bold text-td-ink transition-colors hover:bg-td-chalk"
                    >
                      Gia hạn
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* History of Expired/Past Subscriptions */}
      {pastSubscriptions.length > 0 && (
        <div className="pt-6">
          <h3 className="text-lg font-bold text-td-ink mb-4">Lịch sử gói thuê bao cũ</h3>
          <div className="rounded border border-td-rule bg-td-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-td-chalk text-xs font-semibold text-td-muted uppercase border-b border-td-rule">
                <tr>
                  <th className="p-4">Tên gói</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Tổng giờ</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-td-rule">
                {pastSubscriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-td-chalk/50">
                    <td className="p-4 font-bold text-td-ink">{item.planName}</td>
                    <td className="p-4 text-xs text-td-muted">
                      {formatDate(item.startDate)} -{" "}
                      {formatDate(item.endDate)}
                    </td>
                    <td className="p-4 font-semibold text-td-ink">{item.totalHours} giờ</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-bold bg-td-chalk text-td-muted">
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
      <div className="p-5 rounded bg-td-chalk/70 border border-td-rule flex items-start gap-3 text-xs text-td-muted">
        <HelpCircle className="w-4 h-4 text-td-muted shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-td-ink">Quy tắc quản lý số dư thuê bao:</p>
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
