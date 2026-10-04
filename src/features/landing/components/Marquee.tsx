"use client";

import { ShieldCheck, Zap, Award, CheckCircle2, Car, RefreshCw } from "lucide-react";

export default function Marquee() {
  const items = [
    { text: "TOYOTA MOTORS", icon: Car },
    { text: "VINFAST EV ECOSYSTEM", icon: Zap },
    { text: "HYUNDAI MOTORS", icon: Car },
    { text: "HONDA VIETNAM", icon: Car },
    { text: "100% XE DO ĐƠN VỊ VẬN HÀNH TRỰC TIẾP", icon: ShieldCheck },
    { text: "KIỂM ĐỊNH HAI CHIỀU MINH BẠCH", icon: Award },
    { text: "HOÀN CỌC TỰ ĐỘNG QUA PAYOS", icon: RefreshCw },
    { text: "MAZDA PREMIUM LINE", icon: Car },
    { text: "HỖ TRỢ ĐIỀU PHỐI & KỸ THUẬT 24/7", icon: CheckCircle2 },
  ];

  return (
    <div className="w-full py-5 border-y border-border bg-surface overflow-hidden select-none">
      <div className="flex animate-marquee items-center gap-12 whitespace-nowrap text-xs sm:text-sm font-bold tracking-wider text-ink-muted uppercase group-hover:[animation-play-state:paused]">
        {/* First set */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`item-1-${idx}`} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span>{item.text}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border-dim ml-6"></span>
            </div>
          );
        })}

        {/* Duplicate set for seamless continuous marquee */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`item-2-${idx}`} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span>{item.text}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border-dim ml-6"></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
