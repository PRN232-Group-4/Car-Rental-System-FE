"use client";

import { Activity, ShieldCheck, Clock, RefreshCw } from "lucide-react";

/**
 * TelemetryBridgeBar: Dải điều phối đo lường kỹ thuật nối giữa Showroom 3D và Danh mục xe.
 * Xóa bỏ hoàn toàn khoảng trắng chết giữa các khoang kiến trúc theo chuẩn Swiss Grid.
 * Tuân thủ nghiêm ngặt Safeguard 1: KHÔNG dùng inline backdrop-blur-*, dùng token bg-sunken vững chắc.
 */
export default function TelemetryBridgeBar() {
  const telemetryItems = [
    {
      id: "01",
      code: "FLEET_READY",
      label: "10 Siêu Xe Sẵn Sàng",
      icon: Activity,
    },
    {
      id: "02",
      code: "AI_AUDIT",
      label: "Đối Soát AI 8 Góc",
      icon: ShieldCheck,
    },
    {
      id: "03",
      code: "HANDOVER_24_7",
      label: "Bàn Giao 24/7 TP.HCM",
      icon: Clock,
    },
    {
      id: "04",
      code: "PAYOS_REFUND",
      label: "Hoàn Cọc PayOS 15 Phút",
      icon: RefreshCw,
    },
  ];

  return (
    <div 
      data-telemetry-bridge="true"
      className="w-full bg-sunken border-y border-line-strong py-3.5 px-4 sm:px-6 lg:px-12 relative z-20 select-none"
    >
      <div className="max-w-[1480px] xl:max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {telemetryItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id}
              className="flex items-center gap-3 font-mono text-xs text-ink-2"
            >
              <span className="text-primary font-bold tracking-widest text-[11px]">
                {item.id} //
              </span>
              <Icon className="w-3.5 h-3.5 text-primary stroke-[2.2] shrink-0" aria-hidden="true" />
              <span className="uppercase tracking-widest font-semibold text-ink">
                {item.label}
              </span>
              {index < telemetryItems.length - 1 && (
                <span className="hidden lg:inline text-line-strong ml-4" aria-hidden="true">
                  ·
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
