"use client";

import { useState, useRef, useEffect, useId } from "react";
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
  const cardGradientId = useId();
  const [isLocked, setIsLocked] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const level = vehicle.batteryOrFuelLevel ?? 88;
  const odo = vehicle.odoKm ?? 14250;
  const isEV = vehicle.isElectric ?? true;

  // Gauge calculation: Arc from 135 deg to 405 deg (270 deg span)
  const radius = 38;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 deg arc
  const strokeDashoffset = circumference - (level / 100) * circumference;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 8;
    const ry = (x / (rect.width / 2)) * 8;
    setTilt({ rx, ry });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

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
        <div className="flex items-center gap-2 text-[11px] font-mono text-ink-3">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>BLE NFC CONNECTED</span>
        </div>
      </div>

      {/* Main Grid: Apple Wallet Digital Keycard + Live Telemetry Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Apple Wallet Style Keycard (7 cols) */}
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: isTransmitting ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
          }}
          className="md:col-span-7 rounded-3xl bg-stage-ink text-white p-6 sm:p-7 border border-white/15 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] select-none"
        >
          {/* Subtle Architectural Grid Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundColor: "var(--td-oxide, #c8a96b)",
            }}
          />

          {/* Transmitting Signal Wave Overlay */}
          {isTransmitting && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-stage-ink/60">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-28 h-28 rounded-full border-2 border-primary animate-ping opacity-75" />
                <span className="absolute w-44 h-44 rounded-full border border-primary/50 animate-ping opacity-50" />
                <div className="relative px-4 py-2 rounded-full glass-ink border border-primary/50 text-xs font-mono font-bold text-primary-graphic flex items-center gap-2">
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
                <Car className="w-4 h-4 text-primary-graphic" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                  THONG DONG SMART PASS
                </span>
              </div>
              <h4 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
                Chìa khóa số: {vehicle.brand} {vehicle.model}
              </h4>
            </div>

            {vehicle.licensePlate && (
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white">
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
              className={`flex-1 py-3.5 px-4 rounded-2xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border ${
                isLocked
                  ? "bg-primary text-stage-ink border-primary shadow-lg ring-2 ring-primary/40 font-black"
                  : "bg-white/10 hover:bg-white/15 text-white/80 border-white/20"
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
              className={`flex-1 py-3.5 px-4 rounded-2xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border ${
                !isLocked
                  ? "bg-success text-white border-success shadow-lg ring-2 ring-success/40 font-black"
                  : "bg-white/10 hover:bg-white/15 text-white/80 border-white/20"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label="Mở khóa cửa xe"
            >
              <Unlock className="w-4 h-4" />
              <span>{!isLocked ? "ĐÃ MỞ KHÓA" : "MỞ KHÓA"}</span>
            </button>
          </div>

          {/* Card Bottom Row: NFC Chip & Encryption Badge */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-white/60 border-t border-white/10 pt-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-graphic" />
              <span>AES-256 ROLLING CODE</span>
            </div>
            <span className="uppercase text-primary-graphic font-bold">
              {rentalStatus === "renting" ? "ĐANG VẬN HÀNH" : "SẴN SÀNG"}
            </span>
          </div>
        </div>

        {/* Telemetry Gauge & Vehicle Vitals Card (5 cols) */}
        <div className="md:col-span-5 rounded-3xl bg-surface border border-line-strong p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
              <span className="text-xs font-bold text-ink-3 uppercase tracking-wider font-mono">
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
                  <defs>
                    <linearGradient id={cardGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--td-brand, #c8a96b)" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  {/* Background Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="var(--td-subtle, #e2e8f0)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                  />
                  {/* Dynamic Level Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={`url(#${cardGradientId})`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
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
            <span className="font-mono text-[10px]">VER: 4.8.2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DigitalSmartKeycard;
