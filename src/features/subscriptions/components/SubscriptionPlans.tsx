"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { getSubscriptionPlans, purchaseSubscriptionPlan } from "../api";
import type { SubscriptionPlan } from "../types";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/Button";
import { formatVnd } from "@/lib/format";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { endRouteTransition, holdRouteTransition, isRouteTransitionPending } from "@/lib/route-transition";

export default function SubscriptionPlans() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [purchasingId, setPurchasingId] = useState<number | string | null>(null);
  const [notice, setNotice] = useState<{ type: "info" | "error"; text: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadPlans = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    return getSubscriptionPlans()
      .then(setPlans)
      .catch(() => { setLoadError("Không tải được các gói thuê bao. Vui lòng thử lại."); })
      .finally(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    let active = true;
    // Trạng thái ban đầu đã là `loading = true` (useState(true)) nên không setState đồng bộ ở đây.
    getSubscriptionPlans()
      .then(data => { if (active) setPlans(data); })
      .catch(() => { if (active) setLoadError("Không tải được các gói thuê bao. Vui lòng thử lại."); })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isRouteTransitionPending()) holdRouteTransition();
  }, []);

  // Nhả loader chuyển trang sau khi danh sách gói đã render.
  useEffect(() => {
    if (!loading) endRouteTransition();
  }, [loading]);

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
      setNotice({ type: "info", text: `Đang chuyển đến cổng thanh toán PayOS cho gói ${plan.name}...` });
      window.location.assign(checkout.checkoutUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng ký gói không thành công. Vui lòng thử lại.";
      setNotice({ type: "error", text: msg });
      setPurchasingId(null);
    }
  };

  return (
    <section id="goi-thue-bao" className="relative bg-td-chalk pt-8 pb-12 px-4 text-td-ink sm:px-6 md:pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          {notice && (
            <div
              role={notice.type === "error" ? "alert" : "status"}
              aria-live={notice.type === "error" ? "assertive" : "polite"}
              className={`mt-4 p-3.5 text-sm font-semibold max-w-lg mx-auto border ${notice.type === "error" ? "border-danger/30 bg-danger-bg text-danger" : "border-td-rule bg-td-white text-td-ink"}`}
            >
              {notice.text}
            </div>
          )}
        </div>

        {loading && <CardGridSkeleton label="Đang tải các gói thuê bao" className="mb-6 grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-3" count={3} mediaClassName="hidden" lines={4} />}
        {loadError && <div className="mb-6 space-y-3"><p role="alert" className="text-sm text-danger">{loadError}</p><Button type="button" variant="secondary" onClick={() => { void loadPlans(); }}>Tải lại gói</Button></div>}
        {!loading && !loadError && plans.length === 0 && <p role="status" className="mb-6 text-sm text-td-muted">Hiện chưa có gói thuê bao đang mở bán.</p>}
        {/* Lưới card gói — cùng ngôn ngữ thiết kế với 3 card gói ở landing page */}
        <div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => {
            const hourlyRate = Math.round(plan.price / Math.max(1, plan.hours));
            const isPurchasing = purchasingId === plan.id;

            return (
              <article
                key={plan.id}
                className="relative flex flex-col border border-td-rule bg-td-white text-td-ink"
              >
                {/* Thanh nhấn trái như card tier bên landing */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-1.5 ${plan.popular ? "bg-primary" : "bg-td-rule"}`}
                />

                <div className="flex flex-1 flex-col gap-4 p-6 pl-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-td-muted">
                      {String(idx + 1).padStart(2, "0")} · {plan.hours} giờ
                    </span>
                    {plan.popular && (
                      <span className="inline-flex items-center gap-1 bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                        <Sparkles aria-hidden="true" className="h-3 w-3" />
                        <span>Khuyên dùng</span>
                      </span>
                    )}
                  </div>

                  <div className="border-b border-td-rule pb-4">
                    <h3 className="font-display text-2xl font-extrabold tracking-tight text-td-ink">
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-black tabular-nums text-td-ink">
                        {formatVnd(plan.price)}
                      </span>
                      <span className="font-mono text-xs text-td-muted">/ {plan.validityDays} ngày</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-td-ink">{plan.description}</p>

                  <div className="grid flex-1 gap-2">
                    {plan.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-start gap-2 text-xs text-td-ink">
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-td-rule pt-4">
                    <Button
                      onClick={() => handlePurchase(plan)}
                      disabled={isPurchasing}
                      variant={plan.popular ? "primary" : "secondary"}
                      size="md"
                      className="w-full justify-center group"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <span>Chọn gói {plan.name}</span>
                          <ArrowRight
                            aria-hidden="true"
                            className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </Button>
                    <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[11px] text-td-muted">
                      <span>~{formatVnd(hourlyRate)} / giờ</span>
                      <span aria-hidden="true">·</span>
                      <span>Kích hoạt tự động sau thanh toán</span>
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
