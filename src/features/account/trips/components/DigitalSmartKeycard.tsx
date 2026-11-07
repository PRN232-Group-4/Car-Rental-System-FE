"use client";

import { useState } from "react";
import { 
  Key, 
  Lock, 
  Unlock, 
  Wifi, 
  BatteryCharging, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  Car
} from "lucide-react";
import { playRemoteLock, playRemoteUnlock, playTactileClick } from "@/lib/audio/haptic-audio";

export interface DigitalSmartKeycardProps {
  vehicle: {
    brand: string;
    model: string;
    licensePlate?: string;
    isElectric?: boolean;
    batteryOrFuelLevel?: number;
    odoKm?: number;
  };
  rentalStatus: string;
}

export function DigitalSmartKeycard({ vehicle, rentalStatus }: DigitalSmartKeycardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const level = vehicle.batteryOrFuelLevel ?? 88;
  const odo = vehicle.odoKm ?? 14250;
  const isEV = vehicle.isElectric ?? true;

  // Gauge calculation: Arc from 135 deg to 405 deg (270 deg span)
  const radius = 38;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 deg arc
  const strokeDashoffset = circumference - (level / 100) * circumference;

  const handleToggleLock = (targetState: boolean) => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    playTactileClick();

    if (targetState) {
      playRemoteLock();
    } else {
      playRemoteUnlock();
    }

    setTimeout(() => {
      setIsLocked(targetState);
      setIsTransmitting(false);
    }, 450);
  };

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink font-display">
            Chìa Khóa Số & Telemetry Vận Hành
          </h3>
        </div>
      </div>

      {/* Main Grid: Apple Wallet Digital Keycard + Live Telemetry Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Apple Wallet Style Keycard (7 cols) */}
        <div
          className="md:col-span-7 bg-ink-950 text-bone-100 p-6 sm:p-7 border border-ink-800 relative overflow-hidden flex flex-col justify-between min-h-[260px] select-none"
        >
          {/* Transmitting Signal Wave Overlay */}
          {isTransmitting && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-ink-950/80">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-28 h-28 rounded-full border-2 border-primary animate-ping opacity-75" />
                <span className="absolute w-44 h-44 rounded-full border border-primary/50 animate-ping opacity-50" />
                <div className="relative px-4 py-2 bg-ink-800 border border-sun-400 text-xs font-mono font-bold text-sun-400 flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 animate-bounce" />
                  <span>ĐANG PHÁT TÍN HIỆU...</span>
                </div>
              </div>
            </div>
          )}

          {/* Card Top Row: Brand & Status Chip */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-sun-400" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-bone-100/70">
                  THONG DONG SMART PASS
                </span>
              </div>
              <h4 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
                Chìa khóa số: {vehicle.brand} {vehicle.model}
              </h4>
            </div>

            {vehicle.licensePlate && (
              <span className="font-mono text-xs font-bold px-3 py-1 bg-ink-800 border border-bone-100/20 text-bone-100">
                {vehicle.licensePlate}
              </span>
            )}
          </div>

          {/* Card Center: Remote Lock / Unlock Operational Controls */}
          <div className="relative z-10 my-4 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={isTransmitting || rentalStatus === "completed" || rentalStatus === "cancelled"}
              onClick={() => handleToggleLock(true)}
              className={`flex-1 py-3.5 px-4 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border ${
                isLocked
                  ? "bg-sun-600 text-bone-100 border-sun-600 ring-2 ring-sun-400/40 font-black"
                  : "bg-ink-800 hover:bg-ink-800/80 text-bone-100/80 border-bone-100/20"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label="Khóa cửa xe"
            >
              <Lock className="w-4 h-4" />
              <span>{isLocked ? "ĐÃ KHÓA XE" : "KHÓA XE"}</span>
            </button>

            <button
              type="button"
              disabled={isTransmitting || rentalStatus === "completed" || rentalStatus === "cancelled"}
              onClick={() => handleToggleLock(false)}
              className={`flex-1 py-3.5 px-4 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border ${
                !isLocked
                  ? "bg-success text-white border-success ring-2 ring-success/40 font-black"
                  : "bg-ink-800 hover:bg-ink-800/80 text-bone-100/80 border-bone-100/20"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label="Mở khóa cửa xe"
            >
              <Unlock className="w-4 h-4" />
              <span>{!isLocked ? "ĐÃ MỞ KHÓA" : "MỞ KHÓA"}</span>
            </button>
          </div>

          {/* Card Bottom Row: NFC Chip & Encryption Badge */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-bone-100/70 border-t border-ink-800 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-sun-400" />
            <span className="uppercase text-sun-400 font-bold">
              {rentalStatus === "renting" ? "ĐANG VẬN HÀNH" : "SẴN SÀNG"}
            </span>
          </div>
        </div>

        {/* Telemetry Gauge & Vehicle Vitals Card (5 cols) */}
        <div className="md:col-span-5 bg-surface border border-line-strong p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
              <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">
                CHỈ SỐ XE THỜI GIAN THỰC
              </span>
              <span className="text-xs font-mono font-bold text-primary flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                LIVE
              </span>
            </div>

            {/* Circular Gauge Display */}
            <div className="flex items-center gap-5 my-2">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="var(--line-strong)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeLinecap="butt"
                  />
                  {/* Dynamic Level Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Inner Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-base font-black text-ink leading-none">
                    {level}%
                  </span>
                  <span className="text-[9px] font-mono text-ink-3 mt-0.5">
                    {isEV ? "PIN" : "XĂNG"}
                  </span>
                </div>
              </div>

              {/* Specs Readout Matrix */}
              <div className="space-y-2 flex-1">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-3">
                    {isEV ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>Tầm hoạt động còn lại:</span>
                  </div>
                  <span className="font-mono text-sm font-black text-ink">
                    ~{Math.round((level / 100) * 420)} KM
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-3">
                    <Gauge className="w-3.5 h-3.5 text-primary" />
                    <span>Odometer hành trình:</span>
                  </div>
                  <span className="font-mono text-sm font-black text-ink">
                    {odo.toLocaleString("vi-VN")} KM
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-line text-xs flex items-center justify-between text-ink-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Động cơ sẵn sàng vận hành
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DigitalSmartKeycard;
