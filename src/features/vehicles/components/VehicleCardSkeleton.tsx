"use client";

import React from "react";

export function VehicleCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-testid="vehicle-card-skeleton"
      className={`flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface shadow-e1 animate-pulse ${className}`}
    >
      {/* Khung ảnh 4:3 */}
      <div className="aspect-[4/3] w-full bg-sunken" />

      {/* Thông tin */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="h-5 w-3/4 rounded-md bg-sunken" />
          <div className="mt-2 h-3.5 w-1/2 rounded-md bg-sunken/60" />

          {/* Lưới 4 chip */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-canvas p-2.5 border border-line">
            <div className="h-4 rounded bg-sunken" />
            <div className="h-4 rounded bg-sunken" />
            <div className="h-4 rounded bg-sunken" />
            <div className="h-4 rounded bg-sunken" />
          </div>
        </div>

        {/* Giá và nút */}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
          <div className="h-6 w-24 rounded bg-sunken" />
          <div className="h-8 w-20 rounded-xl bg-sunken" />
        </div>
      </div>
    </div>
  );
}
