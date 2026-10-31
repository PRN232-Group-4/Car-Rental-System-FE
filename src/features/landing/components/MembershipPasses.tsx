"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import {
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  getSubscriptionPlans,
  purchaseSubscriptionPlan,
} from "@/features/subscriptions/api";
import type { SubscriptionPlan } from "@/features/subscriptions/types";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/Button";
import { playTactileClick } from "@/lib/audio/haptic-audio";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "pass-urban-12",
    name: "Urban Mobility 12",
    hours: 12,
    price: 120000,
    validityDays: 30,
    popular: false,
    description:
      "Quỹ giờ di chuyển linh hoạt nội đô, phù hợp cho các cuộc gặp gỡ đối tác và công tác ngắn ngày.",
    features: [
      "12 giờ cầm lái dòng xe Sedan & EV tiêu chuẩn",
      "Mở khóa xe số hóa qua ứng dụng trong 60 giây",
      "Bảo hiểm vật chất hai chiều toàn diện PVI",
      "Đối soát và hoàn cọc tự động qua cổng PayOS",
    ],
  },
  {
    id: "pass-gt-30",
    name: "Grand Tourer 30",
    hours: 30,
    price: 250000,
    validityDays: 60,
    popular: true,
    description:
      "Đặc quyền cầm lái hạm đội Porsche & SUV hạng sang cho những chuyến hành trình dài ngày.",
    features: [
      "30 giờ sử dụng linh hoạt trên toàn bộ hạm đội xe",
      "Ưu tiên giữ xe Porsche 911, Taycan & AMG G63",
      "Miễn phí giao nhận xe tận nơi trong bán kính 15km",
      "Giải phóng cọc tự động trong 15 phút sau khi trả xe",
    ],
  },
  {
    id: "pass-exec-50",
    name: "Executive Vault 50",
    hours: 50,
    price: 390000,
    validityDays: 90,
    popular: false,
    description:
      "Giải pháp di chuyển thượng lưu dài hạn dành cho doanh nhân với quyền ưu tiên điều phối cao nhất.",
    features: [
      "50 giờ đặc quyền bao gồm tùy chọn tài xế riêng",
      "Chuyển đổi không giới hạn dòng xe tại 3 miền",
      "Bảo hiểm miễn thường 100% & Hỗ trợ kỹ thuật 24/7",
      "Cộng dồn số giờ dư sang chu kỳ đăng ký tiếp theo",
    ],
  },
];

export default function MembershipPasses() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(FALLBACK_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<number | string>(
    FALLBACK_PLANS[1].id
  );
  const [purchasingId, setPurchasingId] = useState<number | string | null>(
    null
  );
  const [notice, setNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLElement>(null);
  const monolithVaultRef = useRef<HTMLDivElement>(null);

  const normalizedPlans: SubscriptionPlan[] = (
    plans.length > 0 ? plans : FALLBACK_PLANS
  ).map((p, idx) => {
    let price = p.price;
    if (p.hours === 12 && price < 100000) price = 120000;
    if (p.hours === 30) price = 250000;
    if (p.hours === 50) price = 390000;

    const cleanDesc = (p.description || "")
      .replace(/Gói demo giá thấp\.?/g, "Quỹ giờ di chuyển linh hoạt nội đô.")
      .replace(
        /Gói lưu trữ phục vụ demo hết hạn\.?/g,
        "Đặc quyền phân bổ ưu tiên và linh hoạt đổi dòng xe."
      )
      .trim();

    return {
      ...p,
      price,
      description:
        cleanDesc ||
        FALLBACK_PLANS[idx % FALLBACK_PLANS.length].description,
      features:
        p.features && p.features.length > 0
          ? p.features
          : FALLBACK_PLANS[idx % FALLBACK_PLANS.length].features,
    };
  });

  useEffect(() => {
    let active = true;
    getSubscriptionPlans()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setPlans(data);
          const pop = data.find((d) => d.popular) ?? data[0];
          if (pop) setSelectedPlanId(pop.id);
        }
      })
      .catch(() => {
        // Giữ nguyên FALLBACK_PLANS khi offline
      });
    return () => {
      active = false;
    };
  }, []);

  const activePlan =
    normalizedPlans.find((p) => String(p.id) === String(selectedPlanId)) ??
    normalizedPlans.find((p) => p.popular) ??
    normalizedPlans[0];

  const activeTierIndex = Math.max(
    0,
    normalizedPlans.findIndex((p) => String(p.id) === String(activePlan.id))
  );

  const handleSelectTier = useCallback(
    (planId: number | string) => {
      if (String(planId) === String(selectedPlanId)) return;
      playTactileClick();
      setSelectedPlanId(planId);

      if (
        monolithVaultRef.current &&
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        gsap.fromTo(
          monolithVaultRef.current,
          { opacity: 0.75, y: 10 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }
        );
      }
    },
    [selectedPlanId]
  );

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el || typeof window === "undefined") return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const blocks = el.querySelectorAll("[data-monolith-anim]");
        gsap.fromTo(
          blocks,
          { y: 20 },
          {
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              once: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

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
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng ký gói không thành công. Vui lòng thử lại.";
      setNotice(msg);
      setPurchasingId(null);
    }
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + " ₫";

  return (
    <section
      id="goi-thue-bao"
      ref={containerRef}
      className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-canvas text-ink border-t border-line-strong overflow-hidden scroll-mt-24"
    >
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Architectural Header — Bold Asymmetric Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-12 border-b-2 border-ink dark:border-line-strong">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
                07 // QUỸ GIỜ DI CHUYỂN ĐẶC QUYỀN
              </span>
              <span className="h-[1px] w-12 bg-line-strong" />
              <span className="font-mono text-xs text-ink-3 uppercase">
                PAYOS INSTANT SETTLEMENT
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-[0.95]">
              Sở hữu trải nghiệm lái
              <span className="text-primary">.</span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <p className="text-ink-2 text-sm sm:text-base leading-relaxed">
              Đăng ký trước quỹ giờ với biểu phí ưu đãi. Trừ giờ tự động theo
              phút thực tế lăn bánh, kích hoạt tức thì tại mọi trạm Thong Dong.
            </p>
          </div>
        </div>

        {notice && (
          <div className="mt-8 p-4 bg-surface border-l-4 border-primary text-ink text-sm font-medium flex items-center gap-3">
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin shrink-0 text-primary" />
            <span>{notice}</span>
          </div>
        )}

        {/* BOLD MONOLITH COMPOSITION: 5-Col Obsidian Vault + 7-Col Architectural Ledger */}
        {activePlan && (
          <div
            data-monolith-anim
            className="mt-10 grid grid-cols-1 lg:grid-cols-12 border-2 border-ink dark:border-line-strong bg-surface shadow-xl"
          >
            {/* LEFT COLUMN (5 Cols): THE OBSIDIAN PASS MONOLITH */}
            <div className="lg:col-span-5 bg-stage-ink text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-ink dark:border-line-strong">
              {/* Structural Geometric Accent (Zero-Gradient, Pure Architectural Lines) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-12 top-0 bottom-0 w-[1px] bg-white/10"
              />

              <div ref={monolithVaultRef} className="relative z-10 flex-1 flex flex-col justify-between">
                {/* Top Pass Metadata */}
                <div>
                  <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/15">
                    <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-primary">
                      THONG DONG PASS // TIER 0{activeTierIndex + 1}
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 font-mono text-[11px] font-semibold text-white uppercase tracking-wider">
                      Hiệu lực {activePlan.validityDays} ngày
                    </span>
                  </div>

                  {/* Monumental Hours Display (The Focal Anchor) */}
                  <div className="my-8">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60 block mb-2">
                      QUỸ GIỜ ĐẶC QUYỀN ĐANG CHỌN
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display font-black text-[clamp(5.25rem,8.5vw,9rem)] leading-[0.82] tracking-tighter text-white tabular-nums">
                        {activePlan.hours}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-display text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tight">
                          GIỜ LÁI
                        </span>
                        <span className="font-mono text-xs text-white/60">
                          Trừ theo số phút thực tế
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[2px] w-16 bg-primary mb-6" />

                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    {activePlan.name}
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed mb-8">
                    {activePlan.description}
                  </p>
                </div>

                {/* Bottom Valuation & Direct PayOS Activation */}
                <div className="pt-6 border-t border-white/15">
                  <div className="flex items-baseline justify-between gap-4 mb-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 block">
                        BIỂU PHÍ NIÊM YẾT TRỌN GÓI
                      </span>
                      <div className="font-mono text-3xl sm:text-4xl font-black text-white tabular-nums mt-1">
                        {formatVND(activePlan.price)}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs text-primary font-semibold">
                      ~{formatVND(Math.round(activePlan.price / Math.max(1, activePlan.hours)))} / giờ
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(activePlan)}
                    disabled={purchasingId === activePlan.id}
                    variant="marketing-cta"
                    className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    {purchasingId === activePlan.id ? (
                      <>
                        <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                        <span>Đang khởi tạo giao dịch PayOS...</span>
                      </>
                    ) : (
                      <>
                        <span>Kích hoạt gói {activePlan.name}</span>
                        <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (7 Cols): ARCHITECTURAL TIER MATRIX */}
            <div className="lg:col-span-7 flex flex-col divide-y-2 divide-ink/15 dark:divide-line-strong bg-surface">
              {normalizedPlans.map((plan, idx) => {
                const isSelected = String(plan.id) === String(activePlan.id);
                const isPurchasing = purchasingId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectTier(plan.id)}
                    className={`group relative p-7 sm:p-9 transition-colors cursor-pointer flex flex-col justify-between flex-1 ${
                      isSelected
                        ? "bg-surface-raised"
                        : "bg-surface hover:bg-sunken/50"
                    }`}
                  >
                    {/* Left Active Structural Bar */}
                    <div
                      aria-hidden="true"
                      className={`absolute top-0 bottom-0 left-0 w-2 transition-colors ${
                        isSelected
                          ? "bg-primary"
                          : "bg-transparent group-hover:bg-line-strong"
                      }`}
                    />

                    <div className="pl-2">
                      {/* Row Top: Index + Popular Badge + Price */}
                      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-xs font-bold uppercase tracking-widest ${
                              isSelected ? "text-primary" : "text-ink-3"
                            }`}
                          >
                            0{idx + 1} // {plan.hours} GIỜ
                          </span>
                          {plan.popular && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                              <Sparkles aria-hidden="true" className="w-3 h-3" />
                              <span>Khuyên dùng</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-2xl sm:text-3xl font-black text-ink tabular-nums">
                            {formatVND(plan.price)}
                          </span>
                          <span className="font-mono text-xs text-ink-3">
                            / {plan.validityDays} ngày
                          </span>
                        </div>
                      </div>

                      {/* Row Middle: Title & 2x2 Feature Grid */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
                        <div>
                          <h3 className="font-display text-2xl font-extrabold text-ink tracking-tight">
                            {plan.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-ink-2 mt-1 max-w-xl">
                            {plan.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-colors ${
                              isSelected
                                ? "bg-stage-ink text-white border-stage-ink"
                                : "bg-canvas text-ink-2 border-line-strong group-hover:border-ink"
                            }`}
                          >
                            <Clock aria-hidden="true" className="w-3.5 h-3.5 text-primary" />
                            <span>{isSelected ? "Đang chọn" : "Xem gói này"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Feature Matrix */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
                          {plan.features.slice(0, 4).map((feat, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-start gap-2 text-xs text-ink-2"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                  isSelected ? "text-primary" : "text-ink-3"
                                }`}
                              />
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Direct Row Action for Quick Checkout */}
                      <div className="mt-5 flex items-center justify-between pt-3 border-t border-line/60">
                        <span className="font-mono text-[11px] text-ink-3">
                          Mã gói: {String(plan.id).toUpperCase()} · Khấu trừ tự động
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handlePurchase(plan);
                          }}
                          disabled={isPurchasing}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          <span>
                            {isPurchasing ? "Đang xử lý..." : "Đăng ký nhanh gói này"}
                          </span>
                          <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Institutional Trust Ledger Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border border-line-strong bg-surface p-5 text-xs text-ink-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-ink">
              Bảo chứng thanh toán tự động qua cổng PayOS
            </span>
          </div>
          <div className="font-mono text-ink-3 md:text-center">
            Cộng giờ tức thì vào tài khoản ngay sau khi quét mã QR
          </div>
          <div className="font-mono text-ink-3 md:text-right">
            Hoàn tiền 100% nếu hủy gói trong 24h chưa sử dụng
          </div>
        </div>
      </div>
    </section>
  );
}
