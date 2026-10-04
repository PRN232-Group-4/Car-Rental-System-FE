"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ArrowUpRight, 
  ShieldCheck, 
  QrCode,
  Sparkles,
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
      setNotice(`Đang kết nối PayOS Gateway cho gói thẻ [${plan.name}]...`);
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
      id="membership-passes" 
      className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#0B1411] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Structural Ambient Grid & Tech Accents */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="member-grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#ffffff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#member-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-4">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>DIGITAL WALLET MEMBERSHIP PASSES</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl leading-[1.15]">
              Thẻ Hội Viên Số — Dùng Bao Nhiêu, Trừ Bấy Nhiêu
            </h2>
          </div>
          <p className="text-white/60 text-sm sm:text-base max-w-md leading-relaxed">
            Trả trước một lần với định danh NFC số, tích hợp vào tài khoản điện tử. Không phí ẩn phát sinh, không thủ tục giấy tờ rườm rà.
          </p>
        </div>

        {notice && (
          <div className="mb-10 p-4 rounded-2xl bg-primary-dark/40 border border-primary/30 text-emerald-300 text-sm font-medium flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />
            <span>{notice}</span>
          </div>
        )}

        {/* 3 Apple Wallet / Digital Passes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const isFeatured = plan.popular || index === 1;
            const isPurchasing = purchasingId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? "bg-[#12231E] border-2 border-emerald-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02]"
                    : "bg-[#0E1B17] border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full bg-primary text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PRIORITY SELECTION</span>
                  </div>
                )}

                {/* Card Top / Digital Chip & Brand */}
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-7 rounded-md bg-[#1B352D] border border-emerald-400/30 flex items-center justify-center">
                        <div className="w-4 h-3 border border-emerald-400/50 rounded-sm" />
                      </div>
                      <span className="font-mono text-xs text-white/50 tracking-wider">
                        TD-PASS: {plan.id}
                      </span>
                    </div>
                    <QrCode className="w-6 h-6 text-white/40" />
                  </div>

                  <h3 className="font-display text-2xl font-black text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  {plan.description && (
                    <p className="text-white/60 text-xs sm:text-sm mb-6 leading-relaxed">
                      {plan.description}
                    </p>
                  )}

                  {/* Price & Quota */}
                  <div className="mb-6 p-4 rounded-2xl bg-[#09110E] border border-white/5">
                    <div className="font-mono text-3xl font-black text-white tracking-tight">
                      {formatVND(plan.price)}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs font-mono text-white/60">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{plan.hours} giờ thuê</span>
                      </span>
                      <span>•</span>
                      <span>Hạn dùng {plan.validityDays} ngày</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                      ĐẶC QUYỀN ĐI KÈM
                    </div>
                    {plan.features?.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-6 border-t border-white/10">
                  <Button
                    onClick={() => handlePurchase(plan)}
                    disabled={isPurchasing}
                    variant={isFeatured ? "primary" : "secondary"}
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
        <div className="mt-16 p-6 rounded-2xl bg-[#0E1A16] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Thanh toán an toàn qua cổng bảo mật PayOS (chuẩn PCI DSS cấp cao nhất)</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Hỗ trợ VietQR, Thẻ Nội địa (NAPAS) & Thẻ Quốc tế (Visa / Mastercard)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
