"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Sparkles, ArrowRight, ShieldCheck, Loader2, Zap } from "lucide-react";
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

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  return (
    <Stage variant="emerald" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-white/20 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>FLEXIBLE MOBILITY PACKAGES</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Gói Thuê Bao Linh Hoạt — Tối Ưu Chi Phí
          </h2>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
            Trả trước một lần, dùng dần theo số giờ thực tế và theo dõi số dư giờ di chuyển trực tiếp trong tài khoản mà không cần thanh toán hoá đơn lẻ từng lần thuê.
          </p>

          {notice && (
            <div className="mt-4 p-3.5 rounded-2xl bg-white/20 border border-white/30 text-white text-sm font-semibold max-w-lg mx-auto shadow-e2">
              {notice}
            </div>
          )}
        </div>

        {/* Asymmetrical Grid: 7 cols (Hero/Popular card) + 5 cols (Other plans) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
          {/* Main Popular Plan (Asymmetric Large Card: 7 cols) */}
          {popularPlan && (
            <div className="lg:col-span-7 bg-surface rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative shadow-e3 text-ink border border-white">
              <div className="absolute -top-3.5 left-8 whitespace-nowrap bg-primary text-white text-xs uppercase tracking-wider font-extrabold px-4 py-1.5 rounded-full shadow-e2 flex items-center gap-1.5 z-20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>LỰA CHỌN PHỔ BIẾN NHẤT</span>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pt-2">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-black text-ink mb-1">
                      {popularPlan.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-ink-3 font-medium">
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
                      <span className="font-mono text-3xl sm:text-4xl font-black text-primary tracking-tight">
                        {formatVND(popularPlan.price)}
                      </span>
                    </div>
                    <span className="text-xs text-ink-3 block">
                      Khoảng {formatVND(Math.round(popularPlan.price / popularPlan.hours))} / giờ
                    </span>
                  </div>
                </div>

                <p className="text-sm text-ink-2 mb-6 font-normal leading-relaxed">
                  {popularPlan.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8 pt-4 border-t border-line">
                  {popularPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-ink-2">
                      <div className="w-5 h-5 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 text-sm text-ink-2">
                    <div className="w-5 h-5 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Ưu tiên giữ xe trong các dịp cao điểm & cuối tuần</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-line">
                <Button
                  onClick={() => handlePurchase(popularPlan)}
                  disabled={purchasingId === popularPlan.id}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center group"
                >
                  {purchasingId === popularPlan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Đang kết nối PayOS...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký gói {popularPlan.name}</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-ink-3 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Kích hoạt tự động ngay sau khi hoàn tất thanh toán</span>
                </p>
              </div>
            </div>
          )}

          {/* Regular Plans Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {regularPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-surface rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-e2 text-ink border border-line flex-1 group"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink">
                        {plan.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-ink-3">
                        <span className="font-bold text-primary">{plan.hours} giờ</span>
                        <span>·</span>
                        <span>{plan.validityDays} ngày</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-2xl font-black text-ink tracking-tight">
                        {formatVND(plan.price)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-2 mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="space-y-2 mb-6 pt-3 border-t border-line">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-ink-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 stroke-[2.5]" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasingId === plan.id}
                  variant="secondary"
                  size="md"
                  className="w-full justify-center group"
                >
                  {purchasingId === plan.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>Chọn gói {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
}
