"use client";

import { useState, useEffect } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  QrCode,
  Loader2
} from "lucide-react";
import { getSubscriptionPlans, purchaseSubscriptionPlan } from "@/features/subscriptions/api";
import type { SubscriptionPlan } from "@/features/subscriptions/types";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/Button";

export default function MembershipPasses() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [purchasingId, setPurchasingId] = useState<number | string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSubscriptionPlans()
      .then((data) => { if (active) setPlans(data); })
      .catch(() => { if (active) setLoadError("Không tải được các gói thuê bao. Vui lòng tải lại trang."); })
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

  // Chỉ một thẻ được nhấn: gói do BE đánh dấu, nếu không có thì lấy thẻ giữa.
  const featuredId = plans.find((plan) => plan.popular)?.id;

  return (
    <section 
      /* id do wrapper ở (marketing)/page.tsx giữ — tránh id trùng */
      className="relative py-28 px-4 sm:px-6 lg:px-8 bg-surface-raised text-ink border-t border-line overflow-hidden scroll-mt-24"
    >
      {/* Structural Ambient Grid & Secure Enclave NFC Circuit Blueprint */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg 
          className="w-full h-full opacity-[0.06]" 
          viewBox="0 0 1280 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          {/* Engineering Boundary Marks */}
          <line x1="0" y1="40" x2="1280" y2="40" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="6 6" />
          <line x1="0" y1="90" x2="1280" y2="90" stroke="#b45309" strokeWidth="0.8" />
          
          <g stroke="#0f172a" strokeWidth="0.8">
            <line x1="40" y1="80" x2="40" y2="100" />
            <line x1="320" y1="80" x2="320" y2="100" />
            <text x="180" y="86" fill="#0f172a" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
              SECURE ENCLAVE NFC // PKPASS ISO-7810
            </text>
          </g>

          {/* NFC Antenna Loop Array & Smartcard Geometry */}
          <g transform="translate(640, 480)">
            {/* ISO-7810 Smartcard Perimeter Blueprint Frame */}
            <rect x="-420" y="-260" width="840" height="520" rx="32" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="8 6" />
            <rect x="-390" y="-230" width="780" height="460" rx="20" stroke="#b45309" strokeWidth="0.8" />
            
            {/* NFC Concentric Induction Antenna Coils */}
            <rect x="-370" y="-210" width="740" height="420" rx="16" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
            <rect x="-350" y="-190" width="700" height="380" rx="12" stroke="#b45309" strokeWidth="0.6" strokeDasharray="6 4" />
            
            {/* Center Microchip Package & PCB Gold Contacts */}
            <rect x="-80" y="-80" width="160" height="160" rx="12" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="28" stroke="#b45309" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="5" fill="#b45309" />

            {/* Chip Contact Baffles (8-pin Smartcard standard) */}
            <line x1="-80" y1="-26" x2="80" y2="-26" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="-80" y1="26" x2="80" y2="26" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="0" y1="-80" x2="0" y2="-26" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="0" y1="26" x2="0" y2="80" stroke="#0f172a" strokeWidth="0.8" />

            {/* Circuit Traces Extending from Chip to Edge */}
            <path d="M -80 -40 L -240 -40 L -280 -80 M 80 -40 L 240 -40 L 280 -80" stroke="#0f172a" strokeWidth="0.8" />
            <path d="M -80 40 L -240 40 L -280 80 M 80 40 L 240 40 L 280 80" stroke="#b45309" strokeWidth="0.8" strokeDasharray="4 4" />

            {/* Security Telemetry Labels */}
            <text x="0" y="-110" fill="#0f172a" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">
              EAL 6+ HARDWARE ROOT-OF-TRUST // ECC P-256
            </text>
            <text x="0" y="125" fill="#b45309" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
              CONTACTLESS MIFARE DESFIRE EV3 COMPATIBLE
            </text>
          </g>

          {/* Corner Precision Measurement Crosshairs */}
          <g stroke="#0f172a" strokeWidth="0.8">
            <line x1="80" y1="460" x2="100" y2="460" /><line x1="90" y1="450" x2="90" y2="470" />
            <text x="110" y="464" fill="#0f172a" fontSize="9" fontFamily="monospace">ISO/IEC 14443-A</text>

            <line x1="1180" y1="460" x2="1200" y2="460" /><line x1="1190" y1="450" x2="1190" y2="470" />
            <text x="1080" y="464" fill="#0f172a" fontSize="9" fontFamily="monospace">13.56 MHZ RF</text>
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-ink max-w-2xl leading-[1.15]">
              Thẻ Hội Viên Số — Dùng Bao Nhiêu, Trừ Bấy Nhiêu
            </h2>
          </div>
          <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed">
            Xem giá, số giờ và thời hạn của các gói đang được mở bán. Thanh toán qua PayOS để kích hoạt gói trong tài khoản.
          </p>
        </div>

        {notice && (
          <div className="mb-10 p-4 rounded-2xl bg-primary-tint border border-primary/30 text-primary text-sm font-medium flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />
            <span>{notice}</span>
          </div>
        )}

        {loading && <p role="status" className="mb-6 text-sm text-ink-2">Đang tải các gói thuê bao...</p>}
        {loadError && <p role="alert" className="mb-6 text-sm text-danger">{loadError}</p>}
        {!loading && !loadError && plans.length === 0 && <p role="status" className="mb-6 text-sm text-ink-2">Hiện chưa có gói thuê bao đang mở bán.</p>}

        {/* 3 Apple Wallet / Digital Passes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isFeatured = plan.id === featuredId;
            const isPurchasing = purchasingId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? "bg-surface border-2 border-primary shadow-e2 scale-[1.02] text-ink"
                    : "bg-surface border border-line-strong hover:border-ink-2 shadow-e1 text-ink"
                }`}
              >
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-e1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Khuyên dùng</span>
                  </div>
                )}

                {/* Card Top / Digital Chip & Brand */}
                <div>
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-line">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-7 rounded-md flex items-center justify-center border bg-primary-tint border-primary/40">
                        <div className="w-4 h-3 rounded-sm border border-primary/50" />
                      </div>
                      <span className="font-mono text-xs tracking-wider text-ink-3">
                        TD-PASS: {plan.id}
                      </span>
                    </div>
                    <QrCode className="w-6 h-6 text-ink-3" />
                  </div>

                  <h3 className="font-display text-2xl font-black mb-2 text-ink">
                    {plan.name}
                  </h3>
                  
                  {plan.description && (
                    <p className="text-xs sm:text-sm mb-6 leading-relaxed text-ink-2">
                      {plan.description}
                    </p>
                  )}

                  {/* Price & Quota Box */}
                  <div className="mb-6 p-4 rounded-2xl border bg-surface-raised border-line">
                    <div className="font-mono text-3xl font-black tracking-tight text-ink tabular-nums">
                      {formatVND(plan.price)}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs font-mono text-ink-3">
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{plan.hours} giờ thuê</span>
                      </span>
                      <span>·</span>
                      <span>Hạn dùng {plan.validityDays} ngày</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-mono uppercase tracking-widest text-ink-3">
                      ĐẶC QUYỀN ĐI KÈM
                    </div>
                    {plan.features?.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-6 border-t border-line">
                  <Button
                    onClick={() => handlePurchase(plan)}
                    disabled={isPurchasing}
                    variant="amber-hero"
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
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Thanh toán gói thuê bao qua PayOS</span>
          </div>

        </div>
      </div>
    </section>
  );
}
