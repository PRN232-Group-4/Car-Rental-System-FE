"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Clock, Phone, Car, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { getFacilities, getInitialFacilities } from "../api";
import type { Facility } from "../types";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface FacilityExplorerProps {
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
}

export default function FacilityExplorer({
  selectedFacilityId = "fac-q1",
  onSelectFacility,
}: FacilityExplorerProps) {
  const [facilities, setFacilities] = useState<Facility[]>(getInitialFacilities());
  const [activeId, setActiveId] = useState<string>(selectedFacilityId);

  useEffect(() => {
    getFacilities()
      .then((data) => {
        setFacilities(data);
      })
      .catch(() => setFacilities([]));
  }, []);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (onSelectFacility) {
      onSelectFacility(id);
    }
  };

  const currentFacility =
    facilities.find((f) => f.id === activeId) || facilities[0];

  return (
    <section id="chi-nhanh" className="scroll-mt-28 py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <SectionHeading
          title="Điểm nhận xe & trung tâm điều phối"
          subtitle="Toàn bộ chi nhánh thuộc quyền quản lý trực tiếp của hệ thống, trang bị phòng kỹ thuật kiểm định xe tiêu chuẩn và hỗ trợ giao xe tận nơi."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Interactive Facility List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {facilities.map((facility) => {
            const isSelected = facility.id === activeId;
            return (
              <button
                key={facility.id}
                onClick={() => handleSelect(facility.id)}
                type="button"
                className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  isSelected
                    ? "glass-lite border-primary ring-1 ring-primary/30 shadow-elevation-1"
                    : "glass-lite hover:border-primary/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-bold transition-colors ${
                        isSelected ? "text-primary" : "text-ink group-hover:text-primary"
                      }`}
                    >
                      {facility.shortName}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-primary">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted line-clamp-1 flex items-center gap-1.5 font-normal">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{facility.address}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs font-semibold text-ink-muted pt-1">
                    <span className="flex items-center gap-1 text-primary">
                      <Car className="w-3.5 h-3.5" />
                      <span>{facility.availableVehicles} xe khả dụng</span>
                    </span>
                    <span className="text-border">|</span>
                    <span className="text-ink-muted font-normal">{facility.city}</span>
                  </div>
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-canvas text-ink-muted group-hover:text-ink"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Card of Selected Facility */}
        {currentFacility && (
          <div className="lg:col-span-7">
            <div className="glass-lite rounded-3xl overflow-hidden shadow-elevation-2 group border border-border">
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stage-ink">
                <Image
                  src={currentFacility.imageUrl}
                  alt={currentFacility.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Flat Scrim Overlay per A4.1 & A2 */}
                <div className="absolute inset-0 bg-[var(--scrim)]" />

                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 bg-stage-ink/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-border-dim">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Trạm điều phối trực tiếp</span>
                  </span>
                </div>

                <div className="absolute bottom-5 left-6 right-6 text-white">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-1 block">
                    {currentFacility.city}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight mb-1">
                    {currentFacility.name}
                  </h3>
                  <p className="text-sm text-white/90 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{currentFacility.address}</span>
                  </p>
                </div>
              </div>

              {/* Information Panel - Solid Surface, No blur per A4.4 */}
              <div className="p-6 sm:p-8 bg-surface grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted font-semibold uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Giờ mở cửa</span>
                  </div>
                  <p className="text-sm font-bold text-ink">
                    {currentFacility.openHours}
                  </p>
                  <p className="text-xs text-ink-subtle">Giao nhận linh hoạt</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted font-semibold uppercase tracking-wider">
                    <Car className="w-4 h-4 text-primary" />
                    <span>Số lượng xe</span>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    {currentFacility.availableVehicles} xe sẵn sàng
                  </p>
                  <p className="text-xs text-ink-subtle">Đầy đủ 4 phân khúc</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted font-semibold uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Đường dây nóng</span>
                  </div>
                  <p className="text-sm font-bold text-ink">
                    {currentFacility.phone}
                  </p>
                  <p className="text-xs text-ink-subtle">Hỗ trợ khẩn cấp 24/7</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
