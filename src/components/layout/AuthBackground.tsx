"use client";

import React from "react";

/**
 * Nền họa tiết lưới toạ độ kỹ thuật ô tô (CAD Engineering Grid)
 * tương tự như trang chủ/Landing, tạo cảm giác kiến trúc sang trọng đồng bộ.
 */
export default function AuthBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Lưới toạ độ CAD (Metric Coordinate Grid Pattern) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="auth-cad-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <path
              d="M 32 0 L 32 64 M 0 32 L 64 32"
              fill="none"
              stroke="#0f172a"
              strokeWidth="0.5"
              strokeDasharray="2,4"
            />
            <circle cx="32" cy="32" r="1" fill="#b45309" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-cad-grid)" />
      </svg>

      {/* 2. Đường nét khí động học & khung xe ô tô mờ nhẹ ở hậu cảnh */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[700px] max-w-none opacity-[0.08]"
        viewBox="0 0 1300 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Đường cong luồng khí */}
        <path
          d="M 50 180 C 350 140, 650 90, 950 160 C 1150 210, 1250 240, 1280 260"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
        <path
          d="M 80 230 C 400 190, 700 130, 1000 200 C 1180 240, 1220 280, 1260 310"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        {/* Khung trục bánh & chiều dài cơ sở */}
        <circle cx="340" cy="460" r="40" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="340" cy="460" r="3" fill="#b45309" />
        <circle cx="960" cy="460" r="40" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="960" cy="460" r="3" fill="#b45309" />
        <line x1="340" y1="510" x2="960" y2="510" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
        <text
          x="650"
          y="525"
          fill="#0f172a"
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          AXLE BASE // 2,900 MM
        </text>
      </svg>
    </div>
  );
}
