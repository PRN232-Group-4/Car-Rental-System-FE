"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { MapPin, Clock, Phone, Car, ArrowUpRight, Compass, ShieldCheck } from "lucide-react";
import Link from "@/components/navigation/NavigationLink";
import { getFacilities, getInitialFacilities } from "../api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Flip } from "@/lib/motion/register";

interface FacilityExplorerProps {
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
}

// Map facility coordinate offsets onto SVG 600x320 CAD Blueprint Canvas
const PINS_CONFIG: Record<string, { x: number; y: number; label: string; coords: string }> = {
  "fac-saigon-atelier": { x: 230, y: 155, label: "QUẬN 1 · SAIGON ATELIER", coords: "10.7769° N, 106.7009° E" },
  "fac-riverside-gallery": { x: 410, y: 105, label: "THẢO ĐIỀN · RIVERSIDE GALLERY", coords: "10.8035° N, 106.7325° E" },
  "fac-southside-lounge": { x: 310, y: 260, label: "PHÚ MỸ HƯNG · SOUTHSIDE LOUNGE", coords: "10.7295° N, 106.7218° E" },
};

export default function FacilityExplorer({ selectedFacilityId = "", onSelectFacility }: FacilityExplorerProps) {
  const initial = getInitialFacilities();
  const [activeId, setActiveId] = useState(selectedFacilityId || initial[0]?.id || "fac-saigon-atelier");
  const query = useQuery({ 
    queryKey: ["public-facilities"], 
    queryFn: getFacilities, 
    initialData: initial.length ? initial : undefined, 
    retry: false 
  });

  const facilities = query.data ?? initial;
  const current = facilities.find((facility) => facility.id === activeId) ?? facilities[0] ?? initial[0];
  const address = current ? [current.address, current.district, current.city].filter(Boolean).join(", ") : "";

  const handleSelectFacility = (facilityId: string) => {
    if (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const state = Flip.getState("[data-facility-card], [data-facility-preview]");
      setActiveId(facilityId);
      onSelectFacility?.(facilityId);
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.35,
          ease: "power2.out",
          fade: true,
        });
      });
    } else {
      setActiveId(facilityId);
      onSelectFacility?.(facilityId);
    }
  };

  const currentPin = PINS_CONFIG[current?.id] || {
    x: 300,
    y: 160,
    label: current?.name || "TRẠM TRUNG TÂM",
    coords: `${current?.latitude?.toFixed(4) || "10.7769"}° N, ${current?.longitude?.toFixed(4) || "10.7009"}° E`,
  };

  return (
    <section id="chi-nhanh" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading 
        title="Chi nhánh & điểm nhận xe" 
        subtitle="Mạng lưới trạm bàn giao kỹ thuật số 24/7 tại các vị trí trọng điểm TP. Hồ Chí Minh." 
      />

      {current && (
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
          {/* Facility List Selector */}
          <div className="flex min-w-0 flex-col gap-3" aria-label="Danh sách chi nhánh">
            {facilities.map((facility) => {
              const selected = facility.id === current.id;
              return (
                <button
                  key={facility.id}
                  data-facility-card
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectFacility(facility.id)}
                  className={`group flex w-full items-start justify-between gap-4 rounded-2xl border p-5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${
                    selected 
                      ? "border-primary bg-surface shadow-sm ring-1 ring-primary/20" 
                      : "border-line-strong bg-surface hover:border-primary/50"
                  }`}
                >
                  <span className="min-w-0 space-y-2">
                    <span className={`block text-base font-bold tracking-tight font-display ${selected ? "text-primary" : "text-ink"}`}>
                      {facility.shortName || facility.name}
                    </span>
                    <span className="flex items-start gap-1.5 text-xs leading-5 text-ink-3">
                      <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {facility.address || "Chưa cập nhật địa chỉ"}
                    </span>
                    {typeof facility.availableVehicles === "number" && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-success font-mono">
                        <Car aria-hidden="true" className="h-3.5 w-3.5" />
                        {facility.availableVehicles} xe sẵn sàng lăn bánh
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selected ? "bg-primary text-white" : "bg-sunken text-ink-3 group-hover:text-primary"
                    }`}
                  >
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Preview Card & Architectural Blueprint Map */}
          <article data-facility-preview className="min-w-0 overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-sm">
            {/* Top Facility Image */}
            {current.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden bg-sunken sm:h-56">
                <Image 
                  src={current.imageUrl} 
                  alt={current.name} 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 60vw" 
                  className="object-cover" 
                  priority
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-mono font-semibold .glass-1 border border-line text-ink flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Trạm bàn giao tự động</span>
                </div>
              </div>
            )}

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink font-display">{current.name}</h2>
                <p className="mt-1 text-sm text-ink-2">{address || "Chi nhánh chưa cập nhật địa chỉ."}</p>
              </div>

              {(current.openHours || current.phone) && (
                <dl className="flex flex-wrap gap-5 border-b border-line pb-4 text-sm">
                  {current.openHours && (
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs text-ink-3">
                        <Clock aria-hidden="true" className="h-4 w-4 text-primary" />
                        Giờ mở cửa
                      </dt>
                      <dd className="font-semibold text-ink text-xs">{current.openHours}</dd>
                    </div>
                  )}
                  {current.phone && (
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs text-ink-3">
                        <Phone aria-hidden="true" className="h-4 w-4 text-primary" />
                        Hotline điều phối
                      </dt>
                      <dd className="font-mono text-ink text-xs">{current.phone}</dd>
                    </div>
                  )}
                </dl>
              )}

              {/* Architectural SVG Blueprint Map of HCMC */}
              <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-canvas">
                <div className="absolute top-2.5 left-3 z-10 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-mono tracking-widest text-ink-3 uppercase bg-surface/80 px-2 py-0.5 rounded border border-line">
                    <Compass className="w-3 h-3 text-primary" />
                    <span>HCMC ARCHITECTURAL GRID</span>
                  </span>
                </div>

                <svg
                  viewBox="0 0 600 320"
                  className="w-full h-64 sm:h-72 select-none"
                  aria-label="Bản đồ kiến trúc điểm đón TP. Hồ Chí Minh"
                >
                  <defs>
                    <pattern id="facility-cad-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-line/40" />
                      <circle cx="30" cy="30" r="0.8" fill="currentColor" className="text-line-strong" />
                    </pattern>
                  </defs>

                  {/* CAD Grid */}
                  <rect width="100%" height="100%" fill="url(#facility-cad-grid)" />

                  {/* Saigon River Winding Path */}
                  <path
                    d="M 120 0 C 180 50, 220 90, 240 130 C 270 180, 360 170, 420 200 C 470 230, 500 280, 520 320"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="28"
                    strokeLinecap="round"
                    className="text-sunken/90"
                  />
                  <path
                    d="M 120 0 C 180 50, 220 90, 240 130 C 270 180, 360 170, 420 200 C 470 230, 500 280, 520 320"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="text-line-strong"
                  />

                  {/* Secondary River Flow */}
                  <path
                    d="M 240 130 C 290 120, 350 80, 410 70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="text-sunken/60"
                  />

                  {/* District Regional Typography */}
                  <text x="160" y="145" className="fill-ink-3 font-mono text-[10px] tracking-widest font-semibold">
                    QUẬN 1
                  </text>
                  <text x="350" y="85" className="fill-ink-3 font-mono text-[10px] tracking-widest font-semibold">
                    THẢO ĐIỀN · TP. THỦ ĐỨC
                  </text>
                  <text x="250" y="295" className="fill-ink-3 font-mono text-[10px] tracking-widest font-semibold">
                    PHÚ MỸ HƯNG · QUẬN 7
                  </text>

                  {/* Facility Pins */}
                  {Object.entries(PINS_CONFIG).map(([id, cfg]) => {
                    const isPinActive = id === current.id;
                    return (
                      <g
                        key={id}
                        tabIndex={0}
                        role="button"
                        aria-label={cfg.label}
                        onClick={() => handleSelectFacility(id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectFacility(id);
                          }
                        }}
                        className="cursor-pointer group focus:outline-none"
                      >
                        {/* Radar Pulse on Active Pin */}
                        {isPinActive && (
                          <circle
                            cx={cfg.x}
                            cy={cfg.y}
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-primary animate-ping opacity-75 origin-center"
                          />
                        )}

                        {/* Outer Glow Ring */}
                        <circle
                          cx={cfg.x}
                          cy={cfg.y}
                          r={isPinActive ? "11" : "8"}
                          fill="currentColor"
                          className={isPinActive ? "text-primary/20" : "text-line-strong group-hover:text-primary/30"}
                        />

                        {/* Pin Dot */}
                        <circle
                          cx={cfg.x}
                          cy={cfg.y}
                          r={isPinActive ? "6" : "4.5"}
                          fill="currentColor"
                          className={isPinActive ? "text-primary" : "text-ink-2 group-hover:text-primary"}
                        />

                        {/* Center Eye */}
                        <circle
                          cx={cfg.x}
                          cy={cfg.y}
                          r="2"
                          fill="currentColor"
                          className="text-canvas"
                        />

                        {/* Label Badge on Hover or Active */}
                        {isPinActive && (
                          <g transform={`translate(${cfg.x + 12}, ${cfg.y - 8})`}>
                            <rect
                              width="135"
                              height="22"
                              rx="6"
                              className="fill-surface stroke-primary"
                              strokeWidth="1"
                            />
                            <text
                              x="8"
                              y="14"
                              className="fill-primary font-mono text-[9px] font-bold tracking-tight"
                            >
                              {cfg.coords}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* HUD Telemetry Bar at bottom of map */}
                <div className="border-t border-line bg-surface/95 px-4 py-2.5 flex items-center justify-between text-xs font-mono text-ink-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-ink font-semibold">{currentPin.coords}</span>
                  </div>
                  <span className="text-[11px] text-ink-3 hidden sm:inline">
                    ĐỐI SOÁT TELEMATICS TỰ ĐỘNG
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2">
                <Link
                  href={`/find?facilityId=${encodeURIComponent(current.id)}`}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span>Xem xe khả dụng tại chi nhánh này</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
