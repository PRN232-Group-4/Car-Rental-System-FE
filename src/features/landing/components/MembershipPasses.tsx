"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  QrCode,
  Loader2
} from "lucide-react";
import { getSubscriptionPlans, getInitialSubscriptionPlans, purchaseSubscriptionPlan } from "@/features/subscriptions/api";
import type { SubscriptionPlan } from "@/features/subscriptions/types";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/Button";

export default function MembershipPasses() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(getInitialSubscriptionPlans());
  const [purchasingId, setPurchasingId] = useState<number | string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionPlans()
      .then((data) => {
        if (data && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(() => {
        // Fallback to initial plans
      });
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
      setNotice(`Đang kết nối cổng PayOS cho gói thẻ [${plan.name}]...`);
      window.location.assign(checkout.checkoutUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng ký gói thẻ không thành công. Vui lòng thử lại.";
      setNotice(msg);
      setPurchasingId(null);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  return (
    <section 
      id="goi-thue-bao" 
      className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#f7f7f4] text-ink border-t border-line overflow-hidden scroll-mt-24"
    >
      {/* Structural Ambient Grid & Tech Accents */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="member-grid-light" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0f172a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#member-grid-light)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-600/20 text-[#b45309] text-xs font-mono font-bold tracking-widest uppercase mb-4">
              <CreditCard className="w-3.5 h-3.5 text-[#b45309]" />
              <span>DIGITAL WALLET MEMBERSHIP PASSES</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-ink max-w-2xl leading-[1.15]">
              Thẻ Hội Viên Số — Dùng Bao Nhiêu, Trừ Bấy Nhiêu
            </h2>
          </div>
          <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed">
            Trả trước một lần với định danh NFC số, tích hợp vào tài khoản điện tử. Không phí ẩn phát sinh, không thủ tục giấy tờ rườm rà.
          </p>
        </div>

        {notice && (
          <div className="mb-10 p-4 rounded-2xl bg-amber-50 border border-amber-600/30 text-[#b45309] text-sm font-medium flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#b45309]" />
            <span>{notice}</span>
          </div>
        )}

        {/* 3 Apple Wallet / Digital Passes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const isFeatured = plan.popular || index === 1;
            const isPurchasing = purchasingId === plan.id;
            const isCorporate = index === 2;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isCorporate
                    ? "bg-[#0f172a] text-white border border-white/20 shadow-2xl"
                    : isFeatured
                    ? "bg-surface border-2 border-[#b45309] shadow-[0_16px_36px_rgba(180,83,9,0.15)] scale-[1.02] text-ink"
                    : "bg-surface border border-line-strong hover:border-ink-2 shadow-sm text-ink"
                }`}
              >
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full bg-[#b45309] text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PRIORITY SELECTION</span>
                  </div>
                )}

                {/* Card Top / Digital Chip & Brand */}
                <div>
                  <div className={`flex items-center justify-between pb-5 mb-6 border-b ${isCorporate ? "border-white/10" : "border-line"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-7 rounded-md flex items-center justify-center border ${
                        isCorporate 
                          ? "bg-white/10 border-white/20" 
                          : "bg-amber-50 border-amber-500/30"
                      }`}>
                        <div className={`w-4 h-3 rounded-sm border ${
                          isCorporate ? "border-white/50" : "border-amber-600/50"
                        }`} />
                      </div>
                      <span className={`font-mono text-xs tracking-wider ${isCorporate ? "text-white/50" : "text-ink-3"}`}>
                        TD-PASS: {plan.id}
                      </span>
                    </div>
                    <QrCode className={`w-6 h-6 ${isCorporate ? "text-white/40" : "text-ink-3"}`} />
                  </div>

                  <h3 className={`font-display text-2xl font-black mb-2 ${isCorporate ? "text-white" : "text-ink"}`}>
                    {plan.name}
                  </h3>
                  
                  {plan.description && (
                    <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${isCorporate ? "text-white/60" : "text-ink-2"}`}>
                      {plan.description}
                    </p>
                  )}

                  {/* Price & Quota Box */}
                  <div className={`mb-6 p-4 rounded-2xl border ${
                    isCorporate 
                      ? "bg-white/5 border-white/10" 
                      : "bg-[#f7f7f4] border-line"
                  }`}>
                    <div className={`font-mono text-3xl font-black tracking-tight ${isCorporate ? "text-white" : "text-ink"}`}>
                      {formatVND(plan.price)}
                    </div>
                    <div className={`mt-2 flex items-center gap-4 text-xs font-mono ${isCorporate ? "text-white/60" : "text-ink-3"}`}>
                      <span className={`flex items-center gap-1 font-semibold ${isCorporate ? "text-emerald-400" : "text-[#b45309]"}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{plan.hours} giờ thuê</span>
                      </span>
                      <span>·</span>
                      <span>Hạn dùng {plan.validityDays} ngày</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <div className={`text-[11px] font-mono uppercase tracking-widest ${isCorporate ? "text-white/40" : "text-ink-3"}`}>
                      ĐẶC QUYỀN ĐI KÈM
                    </div>
                    {plan.features?.map((feat, fIdx) => (
                      <div key={fIdx} className={`flex items-start gap-2.5 text-xs sm:text-sm ${isCorporate ? "text-white/80" : "text-ink-2"}`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isCorporate ? "text-emerald-400" : "text-[#b45309]"}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className={`pt-6 border-t ${isCorporate ? "border-white/10" : "border-line"}`}>
                  <Button
                    onClick={() => handlePurchase(plan)}
                    disabled={isPurchasing}
                    variant={isFeatured ? "amber-hero" : isCorporate ? "secondary-stage" : "secondary"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span>Sở hữu thẻ</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Guarantee */}
        <div className="mt-16 p-6 rounded-2xl bg-surface border border-line-strong flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-ink-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#b45309]" />
            <span>Thanh toán an toàn qua cổng bảo mật PayOS (chuẩn PCI DSS cấp cao nhất)</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#b45309]" />
            <span>Hỗ trợ VietQR, Thẻ Nội địa (NAPAS) & Thẻ Quốc tế (Visa / Mastercard)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
