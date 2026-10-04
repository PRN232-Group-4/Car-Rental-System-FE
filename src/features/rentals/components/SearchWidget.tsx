"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  CalendarRange,
  ChevronDown,
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

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]));
  }, []);

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

      return `${startTime} ${startDay}, ${startD}/${startMonth} - ${endTime} ${endDay}, ${endD}/${endMonth}`;
    } catch {
      return `${startTime} - ${endTime}`;
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
    const element = document.getElementById("danh-sach-xe");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* 2 Rental Mode Tabs */}
      <div className="flex items-center gap-2 mb-2 pl-1">
        <button
          type="button"
          onClick={() => setMode("hourly")}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mode === "hourly"
              ? "bg-primary text-white shadow-elevation-1"
              : "bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Thuê theo giờ</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("longterm")}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mode === "longterm"
              ? "bg-primary text-white shadow-elevation-1"
              : "bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border"
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>Thuê xe dài hạn</span>
        </button>
      </div>

      {/* Main Single-Bar Search Console with .glass-2 */}
      <div className="glass-2 rounded-2xl sm:rounded-3xl p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Column 1: Địa điểm / Chi nhánh */}
          <div className="flex-1 relative group px-3.5 py-2.5 rounded-xl hover:bg-canvas transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="facility-select"
                  className="block text-xs font-semibold text-ink-muted uppercase tracking-wider cursor-pointer"
                >
                  Địa điểm nhận xe
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
                        {fac.shortName} ({fac.availableVehicles} xe)
                      </option>
                    ))}
                    <option value="delivery">Giao tận nơi TP.HCM</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-ink-subtle absolute right-0 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-px h-10 bg-border" />

          {/* Column 2: Thời gian thuê */}
          <div className="flex-1 relative group px-3.5 py-2.5 rounded-xl hover:bg-canvas transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Thời gian thuê
                </span>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className="w-full text-left font-bold text-sm sm:text-base text-ink truncate flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{formatVietnameseDateSummary()}</span>
                  <ChevronDown className="w-4 h-4 text-ink-subtle shrink-0 ml-1" />
                </button>
              </div>
            </div>

            {/* Quick Inline Datetime Editor Popover */}
            {showTimePicker && (
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <div className="text-xs font-semibold text-ink-muted mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>Bắt đầu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate < e.target.value) setEndDate(e.target.value);
                      }}
                      className="bg-canvas px-2 py-1 rounded-md text-xs font-medium border border-border outline-none w-full text-ink"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-canvas px-1.5 py-1 rounded-md text-xs font-medium border border-border outline-none w-18 text-ink"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <div className="text-xs font-semibold text-ink-muted mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>Kết thúc</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-canvas px-2 py-1 rounded-md text-xs font-medium border border-border outline-none w-full text-ink"
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-canvas px-1.5 py-1 rounded-md text-xs font-medium border border-border outline-none w-18 text-ink"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Nút Tìm Xe */}
          <div className="shrink-0 pt-1 md:pt-0">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full md:w-auto px-7"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Tìm Xe</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
