"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Loader2
} from "lucide-react";
import { getSubscriptionPlans, purchaseSubscriptionPlan } from "@/features/subscriptions/api";
import type { SubscriptionPlan } from "@/features/subscriptions/types";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/Button";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function MembershipPasses() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [purchasingId, setPurchasingId] = useState<number | string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLElement>(null);

  // Normalize plan prices and copy to ensure progressive tier pricing and eliminate demo text
  const normalizedPlans: SubscriptionPlan[] = plans.map((p) => {
    let price = p.price;
    if (p.hours === 12 && price < 100000) price = 120000;
    if (p.hours === 30) price = 250000;
    if (p.hours === 50) price = 390000;
    
    const cleanDesc = (p.description || "")
      .replace(/Gói demo giá thấp\.?/g, "Gói trải nghiệm linh hoạt ưu đãi.")
      .replace(/Gói lưu trữ phục vụ demo hết hạn\.?/g, "Đặc quyền phân bổ ưu tiên và linh hoạt đổi xe.")
      .trim();

    return {
      ...p,
      price,
      description: cleanDesc || "Gói trải nghiệm linh hoạt ưu đãi.",
    };
  });

  // Tối ưu hiệu năng reveal animation: tất cả card animate mượt mà khi section vào tầm mắt
  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const cards = el.querySelectorAll("[data-membership-bento]");
        gsap.set(cards, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = el.querySelectorAll("[data-membership-bento]");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [plans.length] }
  );

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
    getSubscriptionPlans()
      .then((data) => { if (active) setPlans(data); })
      .catch(() => { if (active) setLoadError("Không tải được các gói thuê bao. Vui lòng thử lại."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
      if (!checkout?.checkoutUrl) {
        throw new Error("Không nhận được liên kết thanh toán từ PayOS.");
      }
      setNotice(`Đang kết nối cổng PayOS cho gói [${plan.name}]...`);
      window.location.assign(checkout.checkoutUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng ký gói không thành công. Vui lòng thử lại.";
      setNotice(msg);
      setPurchasingId(null);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  // Ưu tiên gói được BE đánh dấu là popular, nếu không có lấy gói đầu tiên
  const featuredPlan = normalizedPlans.find((plan) => plan.popular) ?? normalizedPlans[0];
  const otherPlans = normalizedPlans.filter((plan) => plan.id !== featuredPlan?.id);

  return (
    <section 
      id="goi-thue-bao"
      ref={containerRef}
      className="relative py-28 px-4 sm:px-6 lg:px-8 bg-surface-raised text-ink border-t border-line overflow-hidden scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
              ĐẶC QUYỀN HỘI VIÊN &amp; GÓI THUÊ BAO
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-ink max-w-2xl leading-[1.15] text-balance">
              Gói thuê&#160;bao linh&#160;hoạt theo nhu&#160;cầu
            </h2>
          </div>
          <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed text-balance">
            Tiết kiệm chi phí với các gói thuê theo giờ, quản lý trực tuyến và thanh toán minh bạch qua PayOS.
          </p>
        </div>

        {notice && (
          <div className="mb-10 p-4 rounded-2xl bg-primary-tint border border-primary/30 text-primary text-sm font-medium flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}

        {loading && (
          <CardGridSkeleton 
            label="Đang tải các gói thuê bao" 
            className="mb-6 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2" 
            count={2} 
            mediaClassName="hidden" 
            lines={4} 
          />
        )}

        {loadError && (
          <div role="alert" className="mb-6 space-y-3">
            <p className="text-sm text-danger">{loadError}</p>
            <Button type="button" variant="secondary" onClick={() => { void loadPlans(); }}>
              Tải lại gói
            </Button>
          </div>
        )}

        {!loading && !loadError && normalizedPlans.length === 0 && (
          <p role="status" className="mb-6 text-sm text-ink-2">
            Hiện chưa có gói thuê bao đang mở bán.
          </p>
        )}

        {/* Bento bất đối xứng 2 cột */}
        {!loading && !loadError && normalizedPlans.length > 0 && featuredPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Cột chính: Thẻ tiêu điểm khổ lớn */}
            <div data-membership-bento className={`rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 bg-surface border-2 border-primary/60 shadow-md text-ink ${
              otherPlans.length > 0 ? "lg:col-span-7" : "lg:col-span-12"
            }`}>
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      GÓI TIÊU BIỂU
                    </span>
                    {featuredPlan.popular && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary-tint text-primary font-mono text-xs font-bold border border-primary/20">
                        Khuyên dùng
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-primary font-semibold">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{featuredPlan.hours} giờ thuê</span>
                  </div>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-black mb-2 text-ink">
                  {featuredPlan.name}
                </h3>
                
                {featuredPlan.description && (
                  <p className="text-xs sm:text-sm mb-6 leading-relaxed text-ink-2">
                    {featuredPlan.description}
                  </p>
                )}

                {/* Khối giá và hạn dùng */}
                <div className="mb-6 p-5 rounded-2xl border bg-surface-raised border-line">
                  <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-ink tabular-nums">
                    {formatVND(featuredPlan.price)}
                  </div>
                  <div className="mt-2 text-xs font-mono text-ink-3">
                    Hạn sử dụng trong {featuredPlan.validityDays} ngày kể từ ngày kích hoạt
                  </div>
                </div>

                {/* Danh sách quyền lợi thực tế (tối đa 4) */}
                {featuredPlan.features && featuredPlan.features.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-mono uppercase tracking-wider text-ink-3">
                      QUYỀN LỢI GÓI
                    </div>
                    {featuredPlan.features.slice(0, 4).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Action */}
              <div className="pt-6 border-t border-line">
                <Button
                  onClick={() => handlePurchase(featuredPlan)}
                  disabled={purchasingId === featuredPlan.id}
                  variant="marketing-cta"
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl"
                >
                  {purchasingId === featuredPlan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Đang kết nối PayOS...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký gói này</span>
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Cột phụ: Các gói còn lại xếp dọc */}
            {otherPlans.length > 0 && (
              <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                {otherPlans.map((plan) => {
                  const isPurchasing = purchasingId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      data-membership-bento
                      className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 bg-surface border border-line-strong hover:border-line shadow-sm text-ink flex-1"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
                          <span className="font-mono text-xs font-bold text-ink-3">
                            GÓI THUÊ BAO
                          </span>
                          <span className="font-mono text-xs font-semibold text-primary">
                            {plan.hours} giờ thuê
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2 mb-2">
                          <h4 className="font-display text-xl font-bold text-ink">
                            {plan.name}
                          </h4>
                          <span className="font-mono text-lg font-black text-ink tabular-nums">
                            {formatVND(plan.price)}
                          </span>
                        </div>

                        <p className="text-xs text-ink-3 font-mono mb-4">
                          Hạn dùng {plan.validityDays} ngày
                        </p>

                        {/* Quyền lợi rút gọn */}
                        {plan.features && plan.features.length > 0 && (
                          <div className="space-y-2 mb-6">
                            {plan.features.slice(0, 2).map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-xs text-ink-2">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                                <span className="line-clamp-1">{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-line">
                        <Button
                          onClick={() => handlePurchase(plan)}
                          disabled={isPurchasing}
                          variant="secondary"
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl"
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                              <span>Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              <span>Chọn gói</span>
                              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Thanh bảo chứng thanh toán an toàn */}
        <div className="mt-12 p-5 rounded-2xl bg-surface border border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span>Thanh toán an toàn tích hợp trực tiếp qua cổng thanh toán PayOS</span>
          </div>
          <span className="font-mono text-xs text-ink-3">
            Số giờ được cộng tự động vào tài khoản ngay sau khi thanh toán
          </span>
        </div>
      </div>
    </section>
  );
}
