"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Sparkles, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { getSubscriptionPlans, getInitialSubscriptionPlans, purchaseSubscriptionPlan } from "../api";
import type { SubscriptionPlan } from "../types";
import { useAuth } from "@/features/auth";
import { Stage } from "@/components/ui/Stage";
import { Button } from "@/components/ui/Button";

export default function SubscriptionPlans() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(getInitialSubscriptionPlans());
  const [purchasingId, setPurchasingId] = useState<number | string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const handlePurchase = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent("/my-subscriptions")}`);
      return;
    }

    setPurchasingId(plan.id);
    setNotice(null);
    try {
      const checkout = await purchaseSubscriptionPlan(plan.id);
      if (!checkout?.checkoutUrl) throw new Error("Không nhận được liên kết thanh toán từ PayOS.");
      setNotice(`Đang chuyển đến cổng thanh toán PayOS cho gói ${plan.name}...`);
      window.location.assign(checkout.checkoutUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng ký gói không thành công. Vui lòng thử lại.";
      setNotice(msg);
      setPurchasingId(null);
    }
  };

  const popularPlan = plans.find((p) => p.popular) || plans[1] || plans[0];
  const regularPlans = plans.filter((p) => p.id !== popularPlan?.id);

  return (
    <Stage variant="emerald" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 text-white">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2 block">
            Luồng chuyển đổi đặc quyền
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Mua gói thuê bao, thuê xe không cần trả từng lượt
          </h2>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
            Trả trước một lần, dùng dần theo số giờ thực tế và theo dõi số dư giờ di chuyển trực tiếp trong tài khoản người dùng mà không cần lập hoá đơn lẻ từng lần thuê.
          </p>

          {notice && (
            <div className="mt-4 p-3 rounded-2xl bg-white/20 border border-white/30 text-white text-sm font-semibold max-w-lg mx-auto">
              {notice}
            </div>
          )}
        </div>

        {/* Asymmetrical Grid: 7 cols (Hero/Popular card) + 5 cols (Other plans) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
          {/* Main Popular Plan (Asymmetric Large Card: 7 cols) */}
          {popularPlan && (
            <div className="lg:col-span-7 bg-surface rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative shadow-elevation-2 text-ink border-2 border-white">
              <div className="absolute -top-3.5 left-8 whitespace-nowrap bg-primary text-white text-xs uppercase tracking-wider font-extrabold px-4 py-1 rounded-full shadow-elevation-1 flex items-center gap-1.5 z-20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>Lựa chọn phổ biến nhất</span>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pt-2">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-ink mb-1">
                      {popularPlan.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-ink-muted font-medium">
                      <span className="flex items-center gap-1 text-primary font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{popularPlan.hours} giờ thuê</span>
                      </span>
                      <span>·</span>
                      <span>Hạn dùng {popularPlan.validityDays} ngày</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-primary">
                        {popularPlan.price.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-sm font-bold text-ink-muted">đ</span>
                    </div>
                    <span className="text-xs text-ink-subtle block font-normal">
                      Khoảng {popularPlan.hours > 0 ? Math.round(popularPlan.price / popularPlan.hours).toLocaleString("vi-VN") : 0} đ / giờ
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8 border-t border-border pt-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                    Quyền lợi cao cấp đi kèm:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {popularPlan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={() => handlePurchase(popularPlan)}
                  disabled={purchasingId !== null}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                >
                  {purchasingId === popularPlan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kích hoạt...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký gói này ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Regular Plans Stacked (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {regularPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-surface/95 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-elevation-1 text-ink border border-border flex-1"
              >
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-ink">
                        {plan.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-ink-muted">
                        <span className="text-primary font-bold">{plan.hours} giờ thuê</span>
                        <span>·</span>
                        <span>Hạn {plan.validityDays} ngày</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-ink">
                        {plan.price.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 border-t border-border pt-4">
                    {plan.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-ink-muted">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasingId !== null}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                >
                  {purchasingId === plan.id ? "Đang xử lý..." : "Chọn gói"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Trust Banner */}
        <div className="mt-12 bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>
              <strong>Bảo lưu số giờ còn lại:</strong> Không phát sinh phụ phí khi đặt xe trong hạn gói. Số giờ được tự động trừ chính xác sau khi hoàn thành đơn.
            </span>
          </div>
          <a
            href="/subscriptions"
            className="text-white font-bold hover:underline shrink-0"
          >
            Tìm hiểu thêm về chính sách gói
          </a>
        </div>
      </div>
    </Stage>
  );
}
