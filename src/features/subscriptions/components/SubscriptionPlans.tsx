"use client";

import { useState, useEffect } from "react";
import { Check, Clock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { getSubscriptionPlans, getInitialSubscriptionPlans } from "../api";
import type { SubscriptionPlan } from "../types";
import RevealText from "@/components/ui/RevealText";

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(getInitialSubscriptionPlans());

  useEffect(() => {
    getSubscriptionPlans().then(setPlans);
  }, []);

  return (
    <section id="goi-thue-bao" className="scroll-mt-28 py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header matching DESIGN.md Section 29 headline */}
      <div className="reveal text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-2 block">
          Luồng chuyển đổi đặc quyền
        </span>
        <RevealText
          as="h2"
          text="Mua gói thuê bao, thuê xe không cần trả từng lượt"
          className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4"
        />
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          Trả trước một lần, dùng dần theo số giờ thực tế và theo dõi số dư giờ di chuyển trực tiếp trong tài khoản người dùng mà không cần lập hoá đơn lẻ từng lần thuê.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
              plan.popular
                ? "glass-card-elevated glass-hover specular-border specular-emerald md:-translate-y-2 pt-11"
                : "glass-card glass-hover specular-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#059669] text-white text-[11px] uppercase tracking-wider font-extrabold px-4 py-1 rounded-full shadow-lg shadow-[#059669]/30 flex items-center gap-1.5 border border-emerald-400/40 z-20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>Lựa chọn phổ biến nhất</span>
              </div>
            )}

            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1 text-[#059669] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{plan.hours} giờ thuê</span>
                  </span>
                  <span>·</span>
                  <span>Hạn dùng {plan.validityDays} ngày</span>
                </div>
              </div>

              <div className="mb-8 pb-6 border-b border-white/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-neutral-900">
                    {plan.price.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-sm font-bold text-neutral-600">đ / gói</span>
                </div>
                <span className="text-xs text-neutral-500 block mt-1 font-normal">
                  Khoảng {Math.round(plan.price / plan.hours).toLocaleString("vi-VN")} đ / giờ sử dụng
                </span>
              </div>

              <div className="space-y-3.5 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Quyền lợi bao gồm:
                </span>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                    <div className="w-4 h-4 rounded-full glass-pill text-[#059669] border-emerald-400/50 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  plan.popular
                    ? "bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-[#059669]/30 hover:shadow-xl hover:shadow-[#059669]/40 border border-emerald-400/30"
                    : "bg-neutral-900 hover:bg-[#059669] text-white shadow-sm"
                }`}
              >
                <span>Đăng ký mua gói</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Trust Banner */}
      <div className="reveal mt-12 glass-card specular-border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-700">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Bảo lưu số giờ còn lại:</strong> Không phát sinh phụ phí khi đặt xe trong hạn gói. Số giờ được tự động trừ chính xác sau khi hoàn thành đơn.
          </span>
        </div>
        <a
          href="#tim-xe"
          className="text-[#059669] font-bold hover:underline shrink-0"
        >
          Tìm hiểu thêm về chính sách gói
        </a>
      </div>
    </section>
  );
}
