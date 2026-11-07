"use client";

import React from "react";

/** Nền giấy với lưới hairline mực, cùng ngôn ngữ với landing. */
export default function AuthBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none text-ink"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="auth-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>
      <div className="absolute inset-x-0 top-0 h-1 bg-sun-600" />
    </div>
  );
}
