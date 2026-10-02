"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Clock, Phone, Car, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { getFacilities, getInitialFacilities } from "../api";
import type { Facility } from "../types";
import RevealText from "@/components/ui/RevealText";

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
    getFacilities().then((data) => {
      setFacilities(data);
    });
  }, []);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (onSelectFacility) {
      onSelectFacility(id);
    }
  };

  const currentFacility =
    facilities.find((f) => f.id === activeId) || facilities[0] || getInitialFacilities()[0];

  return (
    <section id="chi-nhanh" className="scroll-mt-28 py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-2 block">
            Mạng lưới trạm xe chính thức
          </span>
          <RevealText
            as="h2"
            text="Điểm nhận xe & trung tâm điều phối"
            className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight"
          />
        </div>
        <p className="max-w-md text-sm sm:text-base text-neutral-600 leading-relaxed">
          Toàn bộ chi nhánh thuộc quyền quản lý trực tiếp của hệ thống, trang bị phòng kỹ thuật kiểm định xe tiêu chuẩn và hỗ trợ giao xe tận nơi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Interactive Facility List */}
        <div className="reveal-group lg:col-span-5 flex flex-col gap-3.5">
          {facilities.map((facility) => {
            const isSelected = facility.id === activeId;
            return (
              <button
                key={facility.id}
                onClick={() => handleSelect(facility.id)}
                type="button"
                className={`w-full text-left p-5 rounded-2xl specular-border transition-all duration-300 cursor-pointer flex items-start justify-between gap-4 group ${
                  isSelected
                    ? "glass-card-elevated specular-emerald shadow-lg shadow-[#059669]/15"
                    : "glass-card glass-hover hover:border-emerald-300/60"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-bold transition-colors ${
                        isSelected ? "text-[#059669]" : "text-neutral-900 group-hover:text-[#059669]"
                      }`}
                    >
                      {facility.shortName}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#059669] text-white shadow-xs">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-1 flex items-center gap-1.5 font-normal">
                    <MapPin className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>{facility.address}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs font-semibold text-neutral-700 pt-1">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Car className="w-3.5 h-3.5" />
                      <span>{facility.availableVehicles} xe khả dụng</span>
                    </span>
                    <span className="text-neutral-300">|</span>
                    <span className="text-neutral-600 font-normal">{facility.city}</span>
                  </div>
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    isSelected
                      ? "bg-[#059669] text-white shadow-md shadow-[#059669]/30"
                      : "glass-pill text-neutral-600 group-hover:text-neutral-900 group-hover:bg-white"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Card of Selected Facility */}
        <div className="reveal lg:col-span-7">
          <div className="glass-card specular-border rounded-3xl overflow-hidden shadow-xl group">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <Image
                src={currentFacility.imageUrl}
                alt={currentFacility.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-xl text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trạm điều phối trực tiếp</span>
                </span>
              </div>

              <div className="absolute bottom-5 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-300 mb-1 block">
                  {currentFacility.city}
                </span>
                <h3 className="text-2xl font-bold tracking-tight mb-1">
                  {currentFacility.name}
                </h3>
                <p className="text-sm text-neutral-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{currentFacility.address}</span>
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 glass-sub backdrop-blur-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/60">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#059669]" />
                  <span>Giờ mở cửa</span>
                </div>
                <p className="text-sm font-bold text-neutral-900">
                  {currentFacility.openHours}
                </p>
                <p className="text-xs text-neutral-500">Giao nhận linh hoạt</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  <Car className="w-4 h-4 text-[#059669]" />
                  <span>Số lượng xe</span>
                </div>
                <p className="text-sm font-bold text-emerald-700">
                  {currentFacility.availableVehicles} xe sẵn sàng
                </p>
                <p className="text-xs text-neutral-500">Đầy đủ 4 phân khúc</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  <Phone className="w-4 h-4 text-[#059669]" />
                  <span>Đường dây nóng</span>
                </div>
                <p className="text-sm font-bold text-neutral-900">
                  {currentFacility.phone}
                </p>
                <p className="text-xs text-neutral-500">Hỗ trợ khẩn cấp 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
