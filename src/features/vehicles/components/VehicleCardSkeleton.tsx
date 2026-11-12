"use client";

import React from "react";

export function VehicleCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-testid="vehicle-card-skeleton"
      className={`flex flex-col justify-between overflow-hidden border border-td-rule bg-td-white animate-pulse ${className}`}
    >
      {/* Khung ảnh 4:3 */}
      <div className="aspect-[4/3] w-full bg-td-chalk" />

      {/* Thông tin */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="h-5 w-3/4 bg-td-chalk" />
          <div className="mt-2 h-3.5 w-1/2 bg-td-chalk/60" />

          {/* Lưới 4 chip */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 bg-td-paper p-2.5 border border-td-rule">
            <div className="h-4 bg-td-chalk" />
            <div className="h-4 bg-td-chalk" />
            <div className="h-4 bg-td-chalk" />
            <div className="h-4 bg-td-chalk" />
          </div>
          <div className="mt-3.5 h-4 w-3/4 bg-td-chalk" />
        </div>

        {/* Giá và nút */}
        <div className="mt-4 flex items-center justify-between border-t border-td-rule pt-3.5">
          <div className="h-6 w-24 bg-td-chalk" />
          <div className="h-8 w-20 bg-td-chalk" />
        </div>
      </div>
    </div>
  );
}
