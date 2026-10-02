"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  UserCheck,
  Clock3,
  CalendarRange,
} from "lucide-react";
import { getFacilities, getInitialFacilities } from "@/features/facilities";
import type { Facility } from "@/features/facilities";

interface SearchWidgetProps {
  onSearch?: (criteria: {
    mode: "with_driver" | "long_term";
    facilityId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function SearchWidget({ onSearch }: SearchWidgetProps) {
  const [facilities, setFacilities] = useState<Facility[]>(getInitialFacilities());
  const [mode, setMode] = useState<"with_driver" | "long_term">("with_driver");
  const [facilityId, setFacilityId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("2026-10-02");
  const [startTime, setStartTime] = useState<string>("09:00");

  useEffect(() => {
    getFacilities().then(setFacilities);
  }, []);
  const [endDate, setEndDate] = useState<string>("2026-10-04");
  const [endTime, setEndTime] = useState<string>("18:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        mode,
        facilityId,
        startDate,
        startTime,
        endDate,
        endTime,
      });
    }
    const element = document.getElementById("danh-sach-xe");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Subtle back-glow for glass depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-300/10 to-emerald-500/20 rounded-3xl blur-2xl -z-10 opacity-70" />

      <div className="glass-search specular-border rounded-3xl p-5 sm:p-8">
        {/* Rental Mode Tabs with Glass Pill styling */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/50 pb-4">
          <button
            type="button"
            onClick={() => setMode("with_driver")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              mode === "with_driver"
                ? "bg-[#059669] text-white shadow-lg shadow-[#059669]/30 border border-emerald-400/30"
                : "glass-pill text-neutral-700 hover:text-neutral-900 hover:bg-white/60"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Thuê theo giờ (kèm tài xế)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("long_term")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              mode === "long_term"
                ? "bg-[#059669] text-white shadow-lg shadow-[#059669]/30 border border-emerald-400/30"
                : "glass-pill text-neutral-700 hover:text-neutral-900 hover:bg-white/60"
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Thuê dài hạn (Tháng)</span>
          </button>

          <div className="ml-auto hidden lg:flex items-center gap-1.5 text-xs text-neutral-600 font-medium glass-pill px-3 py-1 rounded-full">
            <Clock3 className="w-3.5 h-3.5 text-[#059669]" />
            <span>Thuê linh hoạt từ 1 giờ</span>
          </div>
        </div>

        {/* Search Form Fields with Frosted Glass Panels */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Facility picker */}
            <div className="md:col-span-4 glass-pill rounded-2xl p-3.5 hover:bg-white/70 transition-all focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[#059669]/40 focus-within:border-[#059669]">
              <label htmlFor="search-facility" className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 mb-1.5 cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                <span>Chi nhánh nhận xe</span>
              </label>
              <select
                id="search-facility"
                name="facility"
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full min-h-[40px] bg-transparent text-sm font-semibold text-neutral-900 outline-none cursor-pointer"
              >
                <option value="all">Tất cả chi nhánh hệ thống</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.shortName} ({fac.availableVehicles} xe)
                  </option>
                ))}
                <option value="delivery">Giao xe tận nơi (TP.HCM / Hà Nội)</option>
              </select>
            </div>

            {/* Start Date & Time */}
            <div className="md:col-span-4 glass-pill rounded-2xl p-3.5 hover:bg-white/70 transition-all focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[#059669]/40 focus-within:border-[#059669]">
              <label htmlFor="start-date" className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 mb-1.5 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                <span>Thời gian nhận xe</span>
              </label>
              <div className="flex items-center gap-2 min-h-[40px]">
                <input
                  id="start-date"
                  name="startDate"
                  type="date"
                  value={startDate}
                  aria-label="Ngày nhận xe"
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className="bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full cursor-pointer min-h-[40px]"
                />
                <span className="text-neutral-400">|</span>
                <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <input
                    id="start-time"
                    name="startTime"
                    type="time"
                    aria-label="Giờ nhận xe"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-neutral-900 outline-none w-18 cursor-pointer min-h-[40px]"
                  />
                </div>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="md:col-span-4 glass-pill rounded-2xl p-3.5 hover:bg-white/70 transition-all focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[#059669]/40 focus-within:border-[#059669]">
              <label htmlFor="end-date" className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 mb-1.5 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                <span>Thời gian trả xe</span>
              </label>
              <div className="flex items-center gap-2 min-h-[40px]">
                <input
                  id="end-date"
                  name="endDate"
                  type="date"
                  value={endDate}
                  aria-label="Ngày trả xe"
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full cursor-pointer min-h-[40px]"
                />
                <span className="text-neutral-400">|</span>
                <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <input
                    id="end-time"
                    name="endTime"
                    type="time"
                    aria-label="Giờ trả xe"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-neutral-900 outline-none w-18 cursor-pointer min-h-[40px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-4 text-xs text-neutral-600 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Bảo dưỡng chính hãng định kỳ
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                Kiểm định 2 chiều trước khi giao
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#059669]/30 hover:shadow-2xl hover:shadow-[#059669]/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-400/30"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
              <span>Tìm xe ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
