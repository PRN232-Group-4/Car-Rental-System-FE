"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { getFacilities, getInitialFacilities } from "@/features/facilities";
import type { Facility } from "@/features/facilities";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";

export type RentalMode = "hourly" | "longterm";

function toDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function defaultRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { startDate: toDateInput(today), endDate: toDateInput(tomorrow) };
}

interface BookingDockProps {
  initialMode?: RentalMode;
  initialFacilityId?: string;
  initialStartDate?: string;
  initialStartTime?: string;
  initialEndDate?: string;
  initialEndTime?: string;
  isExpanded?: boolean;
  isExpandedInFooter?: boolean;
}

export default function BookingDock({
  initialMode = "hourly",
  initialFacilityId = "all",
  initialStartDate,
  initialStartTime = "21:00",
  initialEndDate,
  initialEndTime = "20:00",
  isExpanded: isExpandedProp = false,
  isExpandedInFooter,
}: BookingDockProps) {
  const isExpanded = isExpandedInFooter ?? isExpandedProp;
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>(getInitialFacilities());
  const [mode] = useState<RentalMode>(initialMode);
  const [facilityId, setFacilityId] = useState<string>(initialFacilityId);
  const defaultDates = useMemo(() => defaultRange(), []);
  const [startDate, setStartDate] = useState<string>(initialStartDate || defaultDates.startDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endDate, setEndDate] = useState<string>(initialEndDate || defaultDates.endDate);
  const [endTime, setEndTime] = useState<string>(initialEndTime);

  const [showStationPicker, setShowStationPicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const dockRef = useRef<HTMLDivElement>(null);

  // Appearance delay 1.6s
  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]));

    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  // Click outside to close pickers
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
      setShowStationPicker(false);
      setShowTimePicker(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const getSelectedFacilityLabel = () => {
    if (facilityId === "all") return "TP. Hồ Chí Minh (Tất cả chi nhánh)";
    if (facilityId === "delivery") return "Giao tận nơi nội thành TP.HCM";
    const found = facilities.find((f) => f.id === facilityId);
    return found ? found.name : "TP. Hồ Chí Minh (Tất cả chi nhánh)";
  };

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
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (facilityId && facilityId !== "all") params.set("facilityId", facilityId);
    if (startDate) params.set("startDate", startDate);
    if (startTime) params.set("startTime", startTime);
    if (endDate) params.set("endDate", endDate);
    if (endTime) params.set("endTime", endTime);

    router.push(`/find?${params.toString()}`);
  };

  return (
    <div
      ref={dockRef}
      id="tim-xe"
      className={`fixed bottom-0 sm:bottom-6 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div className="w-full max-w-4xl mx-auto bg-ink-950 text-bone-100 border border-bone-100/20 rounded-none shadow-2xl pointer-events-auto relative">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4"
        >
          {/* Station selector button */}
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={showStationPicker}
              onClick={() => {
                setShowStationPicker((prev) => !prev);
                setShowTimePicker(false);
              }}
              className="w-full text-left px-3 py-2 border-b sm:border-b-0 sm:border-r border-bone-100/15 hover:border-sun-400 transition-colors cursor-pointer group rounded-none"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-bone-100/50 block group-hover:text-sun-400">
                01 · Điểm nhận xe
              </span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-display uppercase tracking-tight text-bone-100 truncate">
                  {getSelectedFacilityLabel()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-bone-100/40 group-hover:text-sun-400 shrink-0" />
              </div>
            </button>

            {/* Station dropdown panel */}
            {showStationPicker && (
              <div
                role="listbox"
                aria-label="Chọn trạm nhận xe"
                className="absolute bottom-full left-0 mb-2 w-full sm:w-80 bg-ink-950 border border-bone-100/20 text-bone-100 shadow-2xl p-2 z-50 rounded-none max-h-72 overflow-y-auto"
              >
                <div className="p-2 border-b border-bone-100/10 mb-1">
                  <span className="text-xs font-mono uppercase text-sun-400">Trạm tiếp nhận</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFacilityId("all");
                    setShowStationPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-sans uppercase tracking-tight flex items-center justify-between cursor-pointer rounded-none ${
                    facilityId === "all" ? "bg-sun-600 text-white" : "hover:bg-ink-800 text-bone-100"
                  }`}
                >
                  <span>Tất cả chi nhánh TP.HCM</span>
                  {facilityId === "all" && <Check className="w-3.5 h-3.5" />}
                </button>
                {facilities.map((fac) => (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => {
                      setFacilityId(fac.id);
                      setShowStationPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-sans uppercase tracking-tight flex items-center justify-between cursor-pointer rounded-none ${
                      facilityId === fac.id ? "bg-sun-600 text-white" : "hover:bg-ink-800 text-bone-100"
                    }`}
                  >
                    <span className="truncate">{fac.name}</span>
                    {facilityId === fac.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFacilityId("delivery");
                    setShowStationPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-sans uppercase tracking-tight flex items-center justify-between cursor-pointer rounded-none ${
                    facilityId === "delivery" ? "bg-sun-600 text-white" : "hover:bg-ink-800 text-bone-100"
                  }`}
                >
                  <span>Giao tận nơi nội thành</span>
                  {facilityId === "delivery" && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Time & schedule selector button */}
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={showTimePicker}
              onClick={() => {
                setShowTimePicker((prev) => !prev);
                setShowStationPicker(false);
              }}
              className="w-full text-left px-3 py-2 hover:border-sun-400 transition-colors cursor-pointer group rounded-none"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-bone-100/50 block group-hover:text-sun-400">
                02 · Lịch trình khởi hành
              </span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-display uppercase tracking-tight text-bone-100 truncate">
                  {formatVietnameseDateSummary()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-bone-100/40 group-hover:text-sun-400 shrink-0" />
              </div>
            </button>

            {/* Time dropdown panel */}
            {showTimePicker && (
              <div
                role="dialog"
                aria-label="Chọn thời gian nhận và trả xe"
                className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 w-full sm:w-96 bg-ink-950 border border-bone-100/20 text-bone-100 shadow-2xl p-4 z-50 rounded-none space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-bone-100/10">
                  <span className="text-xs font-mono uppercase text-sun-400">Thời gian nhận và trả xe</span>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(false)}
                    className="text-bone-100/40 hover:text-bone-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2 border border-bone-100/15 space-y-2 rounded-none bg-ink-800">
                    <span className="text-[10px] font-mono uppercase text-sun-400 block">
                      Thời gian nhận xe
                    </span>
                    <div>
                      <label htmlFor="dock-start-date" className="text-[10px] text-bone-100/60 block mb-1">
                        Ngày nhận
                      </label>
                      <input
                        id="dock-start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate < e.target.value) setEndDate(e.target.value);
                        }}
                        className="w-full bg-ink-950 text-bone-100 border border-bone-100/20 px-2 py-1 text-xs rounded-none outline-none focus:border-sun-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="dock-start-time" className="text-[10px] text-bone-100/60 block mb-1">
                        Giờ nhận
                      </label>
                      <input
                        id="dock-start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-ink-950 text-bone-100 border border-bone-100/20 px-2 py-1 text-xs rounded-none outline-none focus:border-sun-400"
                      />
                    </div>
                  </div>

                  <div className="p-2 border border-bone-100/15 space-y-2 rounded-none bg-ink-800">
                    <span className="text-[10px] font-mono uppercase text-bone-100/80 block">
                      Thời gian trả xe
                    </span>
                    <div>
                      <label htmlFor="dock-end-date" className="text-[10px] text-bone-100/60 block mb-1">
                        Ngày trả
                      </label>
                      <input
                        id="dock-end-date"
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-ink-950 text-bone-100 border border-bone-100/20 px-2 py-1 text-xs rounded-none outline-none focus:border-sun-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="dock-end-time" className="text-[10px] text-bone-100/60 block mb-1">
                        Giờ trả
                      </label>
                      <input
                        id="dock-end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-ink-950 text-bone-100 border border-bone-100/20 px-2 py-1 text-xs rounded-none outline-none focus:border-sun-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-bone-100/10">
                  <span className="text-[10px] font-mono text-bone-100/50">GMT+7</span>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(false)}
                    className="px-4 py-1.5 bg-sun-600 hover:bg-sun-400 text-white font-mono text-xs uppercase tracking-wider cursor-pointer rounded-none transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Single Action Button: 72px sun-600 circular disc */}
          <div className="flex items-center justify-center shrink-0 pt-2 sm:pt-0 sm:pl-2">
            <button
              type="submit"
              className="w-[72px] h-[72px] rounded-full bg-sun-600 hover:bg-sun-400 text-white font-display uppercase tracking-wider text-xs font-bold flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg select-none border-none outline-none shrink-0"
              aria-label="Đặt xe"
            >
              <span>Đặt xe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
