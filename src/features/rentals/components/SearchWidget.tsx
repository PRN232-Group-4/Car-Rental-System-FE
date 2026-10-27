"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  CalendarRange,
  ChevronDown,
  X,
  Check,
  Car
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Drawer } from "@/components/ui/Drawer";
import { getFacilities, getInitialFacilities } from "@/features/facilities";
import type { Facility } from "@/features/facilities";
import { Button } from "@/components/ui/Button";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";

export type RentalMode = "hourly" | "longterm";

/** Ngày hôm nay theo giờ địa phương, dạng yyyy-mm-dd cho <input type="date">. */
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

interface SearchWidgetProps {
  initialMode?: RentalMode;
  initialFacilityId?: string;
  initialStartDate?: string;
  initialStartTime?: string;
  initialEndDate?: string;
  initialEndTime?: string;
  onSearch?: (criteria: {
    mode: RentalMode;
    facilityId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function SearchWidget({
  initialMode = "hourly",
  initialFacilityId = "all",
  initialStartDate,
  initialStartTime = "21:00",
  initialEndDate,
  initialEndTime = "20:00",
  onSearch,
}: SearchWidgetProps) {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>(getInitialFacilities());
  const [mode, setMode] = useState<RentalMode>(initialMode);
  const [facilityId, setFacilityId] = useState<string>(initialFacilityId);
  const defaultDates = useMemo(() => defaultRange(), []);
  const [startDate, setStartDate] = useState<string>(initialStartDate || defaultDates.startDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endDate, setEndDate] = useState<string>(initialEndDate || defaultDates.endDate);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showStationPicker, setShowStationPicker] = useState<boolean>(false);

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]));

    const mql = window.matchMedia("(max-width: 639px)");
    const syncState = () => {
      const container = document.querySelector('[data-surface="marketing"]') as HTMLElement | null;
      setPortalContainer(container || (typeof document !== "undefined" ? document.body : null));
      setIsMobile(mql.matches);
    };
    const rafId = requestAnimationFrame(syncState);
    mql.addEventListener("change", syncState);
    return () => {
      cancelAnimationFrame(rafId);
      mql.removeEventListener("change", syncState);
    };
  }, []);

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
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (facilityId && facilityId !== "all") params.set("facilityId", facilityId);
    if (startDate) params.set("startDate", startDate);
    if (startTime) params.set("startTime", startTime);
    if (endDate) params.set("endDate", endDate);
    if (endTime) params.set("endTime", endTime);

    router.push(`/find?${params.toString()}`);
  };

  /* Station list items */
  const stationListContent = (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-mono font-bold text-ink-3 uppercase tracking-wider border-b border-line mb-1">
        Hệ thống trạm nhận xe
      </div>
      <div className="max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain space-y-1 pr-1">
        <button
          type="button"
          onClick={() => {
            setFacilityId("all");
            setShowStationPicker(false);
          }}
          className={`w-full text-left px-3.5 py-2.5 rounded text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
            facilityId === "all"
              ? "bg-stage-ink text-white"
              : "hover:bg-sunken text-ink"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MapPin className={`w-4 h-4 ${facilityId === "all" ? "text-primary-tint" : "text-primary"}`} />
            <span>TP. Hồ Chí Minh (Tất cả chi nhánh)</span>
          </div>
          {facilityId === "all" && <Check className="w-4 h-4 text-primary-tint" />}
        </button>

        {facilities.map((fac) => (
          <button
            key={fac.id}
            type="button"
            onClick={() => {
              setFacilityId(fac.id);
              setShowStationPicker(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
              facilityId === fac.id
                ? "bg-stage-ink text-white"
                : "hover:bg-sunken text-ink"
            }`}
          >
            <div className="min-w-0 pr-2">
              <div className="font-bold truncate">{fac.name}</div>
              {fac.address && (
                <div className={`text-xs font-mono truncate ${facilityId === fac.id ? "text-white/70" : "text-td-muted"}`}>
                  {fac.address}
                </div>
              )}
            </div>
            {typeof fac.availableVehicles === "number" && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                facilityId === fac.id ? "bg-white/20 text-white" : "bg-sunken text-primary font-bold"
              }`}>
                {fac.availableVehicles} xe
              </span>
            )}
            {facilityId === fac.id && <Check className="w-4 h-4 text-primary-tint shrink-0" />}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setFacilityId("delivery");
            setShowStationPicker(false);
          }}
          className={`w-full text-left px-3.5 py-2.5 rounded text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
            facilityId === "delivery"
              ? "bg-stage-ink text-white"
              : "hover:bg-sunken text-ink"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Car className={`w-4 h-4 ${facilityId === "delivery" ? "text-primary-tint" : "text-primary"}`} />
            <div>
              <span>Giao tận nơi nội thành TP.HCM</span>
              <span className={`text-xs font-mono block ${facilityId === "delivery" ? "text-white/70" : "text-td-muted"}`}>
                Giao xe trong vòng 45 phút
              </span>
            </div>
          </div>
          {facilityId === "delivery" && <Check className="w-4 h-4 text-primary-tint" />}
        </button>
      </div>
    </div>
  );

  /* Time picker form content */
  const timePickerContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-bold text-ink">Thiết lập thời gian nhận &amp; trả xe</h4>
        </div>
        <button
          type="button"
          aria-label="Đóng bảng chọn giờ"
          onClick={() => setShowTimePicker(false)}
          className="w-7 h-7 rounded-full bg-sunken hover:bg-surface-raised text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Start Datetime */}
        <div className="p-3 bg-sunken/50 rounded-lg border border-line space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block">
            Thời gian nhận xe
          </span>
          <div className="space-y-1">
            <label htmlFor="widget-start-date" className="text-xs font-semibold text-ink-3 block">Ngày nhận</label>
            <input
              id="widget-start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate < e.target.value) setEndDate(e.target.value);
              }}
              className="w-full bg-surface px-3 py-2 rounded text-sm sm:text-xs font-bold text-ink border border-line outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="widget-start-time" className="text-xs font-semibold text-ink-3 block">Giờ nhận</label>
            <input
              id="widget-start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-surface px-3 py-2 rounded text-sm sm:text-xs font-bold text-ink border border-line outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* End Datetime */}
        <div className="p-3 bg-sunken/50 rounded-lg border border-line space-y-2">
          <span className="text-xs font-bold text-ink uppercase tracking-wider block">
            Thời gian trả xe
          </span>
          <div className="space-y-1">
            <label htmlFor="widget-end-date" className="text-xs font-semibold text-ink-3 block">Ngày trả</label>
            <input
              id="widget-end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-surface px-3 py-2 rounded text-sm sm:text-xs font-bold text-ink border border-line outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="widget-end-time" className="text-xs font-semibold text-ink-3 block">Giờ trả</label>
            <input
              id="widget-end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-surface px-3 py-2 rounded text-sm sm:text-xs font-bold text-ink border border-line outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <span className="text-xs text-ink-3 font-medium">
          Múi giờ Việt Nam (GMT+7)
        </span>
        <Button
          id="btn-confirm-time"
          type="button"
          onClick={() => setShowTimePicker(false)}
          variant="marketing-cta"
          size="sm"
          className="px-5 font-bold"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          <span>Xác nhận</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      {/* 2 Rental Mode Segmented Switchers */}
      <div className="flex items-center gap-2 mb-2.5 pl-1">
        <button
          type="button"
          onClick={() => setMode("hourly")}
          className={`px-4 sm:px-5 py-2.5 rounded text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer select-none active:scale-[0.98] ${
            mode === "hourly"
              ? "bg-stage-ink text-white border border-white/20"
              : "bg-td-white hover:bg-td-chalk text-td-ink hover:text-td-ink border border-td-rule"
          }`}
        >
          <Clock className="w-4 h-4 text-inherit" />
          <span>Thuê theo giờ</span>
          
        </button>

        <button
          type="button"
          onClick={() => setMode("longterm")}
          className={`px-4 sm:px-5 py-2.5 rounded text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer select-none active:scale-[0.98] ${
            mode === "longterm"
              ? "bg-stage-ink text-white border border-white/20"
              : "bg-td-white hover:bg-td-chalk text-td-ink hover:text-td-ink border border-td-rule"
          }`}
        >
          <CalendarRange className="w-4 h-4 text-inherit" />
          <span>Thuê dài hạn</span>
          
        </button>
      </div>

      {/* Main Single-Deck Floating Console with .glass-2 */}
      <div className="glass-2 rounded sm:rounded p-2 sm:p-4 border border-white/80 relative max-w-full overflow-hidden sm:overflow-visible">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Column 1: Trạm nhận xe */}
          <div className="flex-1 min-w-0 relative px-4 py-3 rounded hover:bg-td-white/60 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded bg-primary-tint text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-td-muted uppercase tracking-wider mb-0.5">
                  Trạm nhận xe
                </span>

                {isMobile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowStationPicker(true)}
                      className="w-full text-left font-bold text-sm sm:text-base text-td-ink truncate flex items-center justify-between cursor-pointer"
                      aria-expanded={showStationPicker}
                      aria-haspopup="dialog"
                    >
                      <span className="truncate">{getSelectedFacilityLabel()}</span>
                      <ChevronDown className={`w-4 h-4 text-td-muted shrink-0 ml-1 transition-transform duration-200 ${showStationPicker ? "rotate-180 text-primary" : ""}`} />
                    </button>
                    <Drawer
                      open={showStationPicker}
                      onOpenChange={setShowStationPicker}
                      container={portalContainer}
                      title="Chọn trạm nhận xe"
                    >
                      {stationListContent}
                    </Drawer>
                  </>
                ) : (
                  <Popover.Root open={showStationPicker} onOpenChange={setShowStationPicker}>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        onClick={() => setShowStationPicker((prev) => !prev)}
                        className="w-full text-left font-bold text-sm sm:text-base text-td-ink truncate flex items-center justify-between cursor-pointer"
                        aria-expanded={showStationPicker}
                      >
                        <span className="truncate">{getSelectedFacilityLabel()}</span>
                        <ChevronDown className={`w-4 h-4 text-td-muted shrink-0 ml-1 transition-transform duration-200 ${showStationPicker ? "rotate-180 text-primary" : ""}`} />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal container={portalContainer || undefined}>
                      <Popover.Content
                        role="dialog"
                        aria-label="Chọn trạm nhận xe"
                        side="top"
                        sideOffset={12}
                        align="start"
                        avoidCollisions
                        collisionPadding={16}
                        className="z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-surface text-ink rounded-xl p-3 border border-line-strong shadow-2xl focus:outline-none max-h-[min(85vh,560px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                      >
                        {stationListContent}
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                )}
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-px h-10 bg-line" />

          {/* Column 2: Thời gian di chuyển */}
          <div className="flex-1 min-w-0 relative px-4 py-3 rounded hover:bg-td-white/60 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded bg-primary-tint text-primary flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-td-muted uppercase tracking-wider mb-0.5">
                  Lịch trình di chuyển
                </span>

                {isMobile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(true)}
                      className="w-full text-left font-bold text-sm sm:text-base text-td-ink truncate flex items-center justify-between cursor-pointer"
                      aria-expanded={showTimePicker}
                      aria-haspopup="dialog"
                    >
                      <span className="truncate">{formatVietnameseDateSummary()}</span>
                      <ChevronDown className={`w-4 h-4 text-td-muted shrink-0 ml-1 transition-transform duration-200 ${showTimePicker ? "rotate-180 text-primary" : ""}`} />
                    </button>
                    <Drawer
                      open={showTimePicker}
                      onOpenChange={setShowTimePicker}
                      container={portalContainer}
                      title="Lịch trình di chuyển"
                    >
                      {timePickerContent}
                    </Drawer>
                  </>
                ) : (
                  <Popover.Root open={showTimePicker} onOpenChange={setShowTimePicker}>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        onClick={() => setShowTimePicker((prev) => !prev)}
                        className="w-full text-left font-bold text-sm sm:text-base text-td-ink truncate flex items-center justify-between cursor-pointer"
                        aria-expanded={showTimePicker}
                      >
                        <span className="truncate">{formatVietnameseDateSummary()}</span>
                        <ChevronDown className={`w-4 h-4 text-td-muted shrink-0 ml-1 transition-transform duration-200 ${showTimePicker ? "rotate-180 text-primary" : ""}`} />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal container={portalContainer || undefined}>
                      <Popover.Content
                        role="dialog"
                        aria-label="Thiết lập thời gian nhận và trả xe"
                        side="top"
                        sideOffset={12}
                        align="end"
                        avoidCollisions
                        collisionPadding={16}
                        className="z-50 w-[460px] max-w-[calc(100vw-2rem)] bg-surface text-ink rounded-xl p-5 sm:p-6 border border-line-strong shadow-2xl focus:outline-none max-h-[min(85vh,560px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                      >
                        {timePickerContent}
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Nút Tìm Xe */}
          <div className="shrink-0 pt-1 md:pt-0">
            <Button
              id="btn-tim-xe"
              data-testid="btn-tim-xe"
              type="submit"
              variant="marketing-cta"
              size="lg"
              className="w-full md:w-auto px-9 py-4 font-bold cursor-pointer"
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
