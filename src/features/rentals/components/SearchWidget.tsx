"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  CalendarRange,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import { getFacilities, getInitialFacilities } from "@/features/facilities";
import type { Facility } from "@/features/facilities";
import { Button } from "@/components/ui/Button";

export type RentalMode = "hourly" | "longterm";

interface SearchWidgetProps {
  onSearch?: (criteria: {
    mode: RentalMode;
    facilityId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function SearchWidget({ onSearch }: SearchWidgetProps) {
  const [facilities, setFacilities] = useState<Facility[]>(getInitialFacilities());
  const [mode, setMode] = useState<RentalMode>("hourly");
  const [facilityId, setFacilityId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("2026-10-03");
  const [startTime, setStartTime] = useState<string>("21:00");
  const [endDate, setEndDate] = useState<string>("2026-10-04");
  const [endTime, setEndTime] = useState<string>("20:00");
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]));
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    }
    if (showTimePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimePicker]);

  const formatVietnameseDateSummary = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const startDay = days[start.getDay()] || "T7";
      const endDay = days[end.getDay()] || "CN";

      const startMonth = String(start.getMonth() + 1).padStart(2, "0");
      const startD = String(start.getDate()).padStart(2, "0");
      const endMonth = String(end.getMonth() + 1).padStart(2, "0");
      const endD = String(end.getDate()).padStart(2, "0");

      return `${startTime} ${startDay}, ${startD}/${startMonth} — ${endTime} ${endDay}, ${endD}/${endMonth}`;
    } catch {
      return `${startTime} — ${endTime}`;
    }
  };

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
    const element = document.getElementById("trien-lam-xe");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      {/* 2 Rental Mode Segmented Switchers */}
      <div className="flex items-center gap-2 mb-2.5 pl-1">
        <button
          type="button"
          onClick={() => setMode("hourly")}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer select-none active:scale-[0.98] ${
            mode === "hourly"
              ? "bg-[#0f172a] text-white shadow-e2 border border-white/20"
              : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line"
          }`}
        >
          <Clock className="w-4 h-4 text-inherit" />
          <span>Thuê theo giờ</span>
          <span className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${
            mode === "hourly" ? "bg-white/20 text-white" : "bg-sunken text-ink"
          }`}>
            HOURLY
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode("longterm")}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer select-none active:scale-[0.98] ${
            mode === "longterm"
              ? "bg-[#0f172a] text-white shadow-e2 border border-white/20"
              : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line"
          }`}
        >
          <CalendarRange className="w-4 h-4 text-inherit" />
          <span>Thuê dài hạn</span>
          <span className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${
            mode === "longterm" ? "bg-white/20 text-white" : "bg-sunken text-ink"
          }`}>
            FLEX
          </span>
        </button>
      </div>

      {/* Main Single-Deck Floating Console with .glass-2 */}
      <div className="glass-2 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-e3 border border-white/80">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Column 1: Trạm nhận xe */}
          <div className="flex-1 relative group px-4 py-3 rounded-2xl hover:bg-white/60 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0 shadow-e1">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="facility-select"
                  className="block text-[11px] font-bold text-ink-3 uppercase tracking-wider cursor-pointer mb-0.5"
                >
                  Trạm nhận xe (Smart EV Hub)
                </label>
                <div className="relative flex items-center">
                  <select
                    id="facility-select"
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm sm:text-base text-ink outline-none cursor-pointer appearance-none pr-6 truncate"
                  >
                    <option value="all">TP. Hồ Chí Minh (Tất cả chi nhánh)</option>
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.shortName} ({fac.availableVehicles} xe sẵn sàng)
                      </option>
                    ))}
                    <option value="delivery">Giao tận nơi nội thành TP.HCM</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-ink-3 absolute right-0 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-px h-10 bg-line" />

          {/* Column 2: Thời gian di chuyển (Mở Dedicated Popover) */}
          <div className="flex-1 relative group px-4 py-3 rounded-2xl hover:bg-white/60 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0 shadow-e1">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-0.5">
                  Lịch trình di chuyển
                </span>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className="w-full text-left font-bold text-sm sm:text-base text-ink truncate flex items-center justify-between cursor-pointer"
                  aria-expanded={showTimePicker}
                  aria-haspopup="dialog"
                >
                  <span className="truncate">{formatVietnameseDateSummary()}</span>
                  <ChevronDown className={`w-4 h-4 text-ink-3 shrink-0 ml-1 transition-transform ${showTimePicker ? "rotate-180 text-primary" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Nút Tìm Xe */}
          <div className="shrink-0 pt-1 md:pt-0">
            <Button
              type="submit"
              variant="amber-hero"
              size="lg"
              className="w-full md:w-auto px-9 py-4 font-bold shadow-e2"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Tìm Xe</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Dedicated Floating Glass Popover for Date & Time Selection (.glass-3) */}
      {showTimePicker && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Chọn thời gian nhận và trả xe"
          className="absolute z-50 top-full mt-3 right-0 left-0 sm:left-auto sm:right-28 w-full sm:w-[480px] glass-3 rounded-3xl p-6 shadow-e3 border border-white/90 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-line mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-ink">Thiết lập thời gian nhận & trả xe</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowTimePicker(false)}
              className="w-7 h-7 rounded-full bg-sunken hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Start Datetime */}
            <div className="p-3.5 bg-surface rounded-2xl border border-line shadow-e1 space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Thời gian nhận xe
              </span>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-3 block">Ngày nhận</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className="w-full bg-sunken px-3 py-2 rounded-xl text-xs font-bold text-ink border border-line outline-none focus:border-primary focus:bg-surface transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-3 block">Giờ nhận</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-sunken px-3 py-2 rounded-xl text-xs font-bold text-ink border border-line outline-none focus:border-primary focus:bg-surface transition-all"
                />
              </div>
            </div>

            {/* End Datetime */}
            <div className="p-3.5 bg-surface rounded-2xl border border-line shadow-e1 space-y-2">
              <span className="text-xs font-bold text-ink-2 uppercase tracking-wider block">
                Thời gian trả xe
              </span>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-3 block">Ngày trả</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-sunken px-3 py-2 rounded-xl text-xs font-bold text-ink border border-line outline-none focus:border-primary focus:bg-surface transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-3 block">Giờ trả</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-sunken px-3 py-2 rounded-xl text-xs font-bold text-ink border border-line outline-none focus:border-primary focus:bg-surface transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-ink-3 font-medium">
              Chính xác theo múi giờ Việt Nam (GMT+7)
            </span>
            <Button
              type="button"
              onClick={() => setShowTimePicker(false)}
              variant="primary"
              size="sm"
              className="px-5 shadow-e1"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Xác nhận</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
