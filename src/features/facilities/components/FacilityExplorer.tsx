"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, Phone, Car, ArrowUpRight } from "lucide-react";
import Link from "@/components/navigation/NavigationLink";
import { getFacilities, getInitialFacilities } from "../api";
import { Flip } from "@/lib/motion/register";

export interface FacilityExplorerProps {
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  onSelectFacilityForRental?: (facilityId: string, facilityName: string) => void;
}

// Map facility coordinate offsets onto SVG 600x340 CAD Blueprint Canvas
const PINS_CONFIG: Record<string, { x: number; y: number; label: string; coords: string }> = {
  "fac-saigon-atelier": { x: 230, y: 165, label: "QUẬN 1 · SAIGON ATELIER", coords: "10.7769° N, 106.7009° E" },
  "fac-riverside-gallery": { x: 410, y: 110, label: "THẢO ĐIỀN · RIVERSIDE GALLERY", coords: "10.8035° N, 106.7325° E" },
  "fac-southside-lounge": { x: 310, y: 275, label: "PHÚ MỸ HƯNG · SOUTHSIDE LOUNGE", coords: "10.7295° N, 106.7218° E" },
};

function formatFacilityAddress(facility?: { address?: string; district?: string; city?: string }): string {
  if (!facility) return "";
  const parts: string[] = [];
  const rawAddr = facility.address?.trim() || "";
  const district = facility.district?.trim() || "";
  const city = facility.city?.trim() || "";

  if (rawAddr) parts.push(rawAddr);
  if (district && !rawAddr.toLowerCase().includes(district.toLowerCase())) {
    parts.push(district);
  }
  if (city && !rawAddr.toLowerCase().includes(city.toLowerCase())) {
    parts.push(city);
  }
  return parts.filter(Boolean).join(", ");
}

export default function FacilityExplorer({
  selectedFacilityId = "",
  onSelectFacility,
  onSelectFacilityForRental,
}: FacilityExplorerProps = {}) {
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
  const formattedAddress = formatFacilityAddress(current);

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
    y: 170,
    label: current?.name || "TRẠM TRUNG TÂM",
    coords: `${current?.latitude?.toFixed(4) || "10.7769"}° N, ${current?.longitude?.toFixed(4) || "10.7009"}° E`,
  };

  return (
    <section id="chi-nhanh" className="mx-auto w-full max-w-[1480px] xl:max-w-[1600px] scroll-mt-28 px-4 sm:px-6 lg:px-12 pt-6 pb-14 sm:pb-16 relative overflow-hidden">

      <h1 className="sr-only">Chi nhánh và điểm nhận xe</h1>

      {current && (
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
          {/* Facility List Selector */}
          <div className="flex min-w-0 flex-col gap-3" aria-label="Danh sách chi nhánh">
            {facilities.map((facility) => {
              const selected = facility.id === current.id;
              const cardAddr = formatFacilityAddress(facility);
              return (
                <button
                  key={facility.id}
                  data-facility-card
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectFacility(facility.id)}
                  className={`group flex w-full items-start justify-between gap-4 border p-5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${
                    selected 
                      ? "border-primary bg-surface ring-1 ring-primary/20" 
                      : "border-line-strong bg-surface hover:border-primary/50"
                  }`}
                >
                  <span className="min-w-0 space-y-2">
                    <span className={`block text-base font-bold tracking-tight font-display ${selected ? "text-primary" : "text-ink"}`}>
                      {facility.shortName || facility.name}
                    </span>
                    <span className="flex items-start gap-1.5 text-xs leading-5 text-ink-3">
                      <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {cardAddr || "Chưa cập nhật địa chỉ"}
                    </span>
                    {typeof facility.availableVehicles === "number" && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-success tabular-nums">
                        <Car aria-hidden="true" className="h-3.5 w-3.5" />
                        {facility.availableVehicles} xe sẵn sàng lăn bánh
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center transition-colors ${
                      selected ? "bg-primary text-white" : "bg-sunken text-ink-3 group-hover:text-primary"
                    }`}
                  >
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Preview Card with Architectural Blueprint Map as Main Hero */}
          <article data-facility-preview className="min-w-0 overflow-hidden border border-line-strong bg-surface">
            <div className="space-y-5 p-6 sm:p-7">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink font-display">{current.name}</h2>
                  <p className="mt-1 text-sm text-ink-2">{formattedAddress || "Chi nhánh chưa cập nhật địa chỉ."}</p>
                </div>
              </div>

              {(current.openHours || current.phone) && (
                <dl className="flex flex-wrap gap-6 border-b border-line pb-4 text-sm">
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

              {/* Architectural SVG Blueprint Map of HCMC (Expanded as Panel Hero) */}
              <div className="relative w-full overflow-hidden border border-line bg-canvas">

                <svg
                  viewBox="0 0 600 340"
                  className="w-full h-[320px] sm:h-[360px] select-none"
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
                    d="M 120 0 C 180 50, 220 90, 240 140 C 270 190, 360 180, 420 210 C 470 240, 500 290, 520 340"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="32"
                    strokeLinecap="round"
                    className="text-sunken/90"
                  />
                  <path
                    d="M 120 0 C 180 50, 220 90, 240 140 C 270 190, 360 180, 420 210 C 470 240, 500 290, 520 340"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="text-line-strong"
                  />

                  {/* Secondary River Flow */}
                  <path
                    d="M 240 140 C 290 130, 350 85, 410 75"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="text-sunken/60"
                  />

                  {/* District Regional Typography */}
                  <text x="160" y="150" className="fill-ink-3 font-mono text-[10px] tracking-widest font-semibold">
                    QUẬN 1
                  </text>
                  <text x="350" y="90" className="fill-ink-3 font-mono text-[10px] tracking-widest font-semibold">
                    THẢO ĐIỀN · TP. THỦ ĐỨC
                  </text>
                  <text x="250" y="310" className="fill-ink-3 font-mono text-[10px] tracking-widest font-semibold">
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
                            r="18"
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
                          r={isPinActive ? "12" : "8"}
                          fill="currentColor"
                          className={isPinActive ? "text-primary/20" : "text-line-strong group-hover:text-primary/30"}
                        />

                        {/* Pin Dot */}
                        <circle
                          cx={cfg.x}
                          cy={cfg.y}
                          r={isPinActive ? "6.5" : "4.5"}
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

                        {/* Label Badge on Active Pin */}
                        {isPinActive && (
                          <g transform={`translate(${cfg.x + 12}, ${cfg.y - 10})`}>
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
                <div className="border-t border-line bg-surface/95 px-4 py-2.5 flex items-center gap-2 text-xs text-ink-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-mono text-ink font-semibold">{currentPin.coords}</span>
                </div>
              </div>

              {/* Prominent Bottom Action Bar */}
              <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="hidden sm:block">
                  <span className="text-xs text-ink-3">Bàn giao xe tại {current.name} · Hỗ trợ 24/7</span>
                </div>
                {onSelectFacilityForRental ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFacilityForRental(current.id, current.name);
                      const cat = document.getElementById("danh-muc-xe");
                      if (cat) cat.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-primary text-white font-bold text-sm hover:bg-primary-hover active:bg-primary-press transition-colors cursor-pointer"
                  >
                    <span>Chọn nhận xe tại trạm này</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={`/find?facilityId=${encodeURIComponent(current.id)}`}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-primary text-white font-bold text-sm hover:bg-primary-hover active:bg-primary-press transition-colors"
                  >
                    <span>Xem xe khả dụng tại chi nhánh này</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
