"use client";

import React from "react";

/**
 * Nền kiến trúc kỹ thuật ô tô toàn hệ thống (Global Automotive CAD Blueprint)
 * Đồng bộ hậu cảnh thống nhất cho toàn bộ các trang từ Landing page, Catalog,
 * Chi tiết xe, Dashboard khách hàng cho đến Cổng quản trị Admin & Tài xế.
 * Tuân thủ 100% DESIGN.md Phần A: Zero-Gradient, Warm Canvas, Hairline CAD Grid.
 */
export default function GlobalBlueprintBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Lưới toạ độ kỹ thuật CAD liên tục (80x80px Metric Coordinate Grid) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] text-ink"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="global-cad-blueprint-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M 40 0 L 40 80 M 0 40 L 80 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2,4"
            />
            <circle cx="40" cy="40" r="1.2" fill="#b45309" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#global-cad-blueprint-grid)" />
      </svg>

      {/* 2. Đường nét khí động học Aero Streamlines mờ nhẹ ở phần trên viewport */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1440px] h-[720px] max-w-none opacity-[0.06] text-ink"
        viewBox="0 0 1440 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 40 160 C 360 120, 680 80, 1000 150 C 1200 200, 1340 230, 1420 250"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="8 6"
        />
        <path
          d="M 70 210 C 400 170, 720 120, 1040 190 C 1220 230, 1310 270, 1390 300"
          stroke="#b45309"
          strokeWidth="1.2"
        />
        <path
          d="M 100 260 C 440 230, 760 170, 1080 240 C 1250 280, 1350 330, 1380 360"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="4 4"
        />

        {/* CAD Precision Crosshairs & Alignment Coordinate Marks */}
        <g stroke="currentColor" strokeWidth="0.8">
          <line x1="120" y1="80" x2="140" y2="80" />
          <line x1="130" y1="70" x2="130" y2="90" />
          <text x="148" y="84" fill="#b45309" fontSize="9" fontFamily="monospace">
            REF: VN-SGN-SYS
          </text>

          <line x1="1300" y1="80" x2="1320" y2="80" />
          <line x1="1310" y1="70" x2="1310" y2="90" />
          <text x="1220" y="84" fill="currentColor" fontSize="9" fontFamily="monospace">
            SCALE 1:1 METRIC
          </text>
        </g>
      </svg>

      {/* 3. Thước đo toạ độ dọc bên trái (Left Vertical Datum Axis) */}
      <div className="hidden xl:flex flex-col justify-between absolute left-3 2xl:left-6 top-36 bottom-36 w-12 border-l border-ink/10 pl-2 font-mono text-[11px] text-ink-3 opacity-35">
        <div>
          <span className="block font-bold text-primary">0000 MM</span>
          <span className="text-[10px] text-ink-3">SYS-INIT</span>
        </div>
        <div>
          <span className="block font-bold text-ink">1200 MM</span>
          <span className="text-[10px] text-ink-3">CATALOG</span>
        </div>
        <div>
          <span className="block font-bold text-ink">2400 MM</span>
          <span className="text-[10px] text-ink-3">TELEMETRY</span>
        </div>
        <div>
          <span className="block font-bold text-ink">3600 MM</span>
          <span className="text-[10px] text-ink-3">INSPECTION</span>
        </div>
        <div>
          <span className="block font-bold text-primary">4800 MM</span>
          <span className="text-[10px] text-ink-3">STATION</span>
        </div>
      </div>

      {/* 4. Thước đo toạ độ dọc bên phải (Right Vertical Technical Datum Axis) */}
      <div className="hidden xl:flex flex-col justify-between absolute right-3 2xl:right-6 top-36 bottom-36 w-24 border-r border-ink/10 pr-2 text-right font-mono text-[11px] text-ink-3 opacity-35">
        <div>
          <span className="block font-bold text-ink">10.7626° N</span>
          <span className="text-[10px] text-ink-3">106.6602° E</span>
        </div>
        <div>
          <span className="block font-bold text-ink">ISO-26262</span>
          <span className="text-[10px] text-ink-3">ROAD SAFETY</span>
        </div>
        <div>
          <span className="block font-bold text-ink">PAYOS-API</span>
          <span className="text-[10px] text-ink-3">VERIFIED</span>
        </div>
        <div>
          <span className="block font-bold text-primary">OBD-II</span>
          <span className="text-[10px] text-ink-3">DIAGNOSTIC</span>
        </div>
      </div>
    </div>
  );
}
