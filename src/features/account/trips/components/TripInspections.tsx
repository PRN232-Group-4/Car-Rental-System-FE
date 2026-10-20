"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Image as ImageIcon, X, Gauge, Fuel } from "lucide-react";
import { formatDateTime } from "@/lib/time";
import type { TripInspectionItem } from "../types";

interface TripInspectionsProps {
  inspections: TripInspectionItem[];
}

export function TripInspections({ inspections }: TripInspectionsProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const preInspection = inspections.find((i) => i.type === "pre_rental");
  const postInspection = inspections.find((i) => i.type === "post_rental");

  const renderCard = (
    title: string,
    subtitle: string,
    inspection?: TripInspectionItem
  ) => {
    if (!inspection) {
      return (
        <div className="bg-td-white rounded border border-td-rule p-5 shadow-sm space-y-2">
          <h4 className="font-bold text-td-ink text-sm">{title}</h4>
          <span className="text-xs text-td-muted block">{subtitle}</span>
          <div className="bg-td-chalk rounded p-4 text-center text-xs text-td-muted">
            Chưa có biên bản kiểm định. Biên bản sẽ được lập khi nhân viên trực tiếp kiểm tra phương tiện.
          </div>
        </div>
      );
    }

    const isOk = inspection.isOk ?? true;

    return (
      <div className="bg-td-white rounded border border-td-rule p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-td-ink text-sm">{title}</h4>
            <span className="text-xs text-td-muted block">
              {inspection.inspectedAt ? formatDateTime(inspection.inspectedAt) : subtitle}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              isOk
                ? "bg-success-bg text-success border border-success/30"
                : "bg-warning-bg text-warning border border-warning/30"
            }`}
          >
            {isOk ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đạt chuẩn giao nhận</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Có ghi nhận trầy xước</span>
              </>
            )}
          </span>
        </div>

        {/* Chỉ số km và nhiên liệu */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-td-chalk rounded p-3 font-mono">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-td-muted" aria-hidden="true" />
            <div>
              <span className="text-td-muted block text-[10px] font-sans">Odometer</span>
              <span className="font-bold text-td-ink">
                {inspection.odometerKm ? `${inspection.odometerKm.toLocaleString()} km` : "—"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-td-muted" aria-hidden="true" />
            <div>
              <span className="text-td-muted block text-[10px] font-sans">Mức nhiên liệu / Pin</span>
              <span className="font-bold text-td-ink">
                {typeof inspection.fuelBatteryLevel === "number"
                  ? `${inspection.fuelBatteryLevel}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Ghi chú hư hại */}
        {inspection.damageNotes && (
          <p className="text-xs text-td-ink bg-td-white border border-td-rule rounded p-3 leading-relaxed">
            <strong className="text-td-ink font-semibold">Ghi chú hiện trạng: </strong>
            {inspection.damageNotes}
          </p>
        )}

        {/* Thư viện ảnh chụp biên bản */}
        {inspection.imgUrls && inspection.imgUrls.length > 0 && (
          <div>
            <span className="text-xs font-medium text-td-muted block mb-2">
              Ảnh chụp hiện trạng ({inspection.imgUrls.length} ảnh)
            </span>
            <div className="flex flex-wrap gap-2">
              {inspection.imgUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className="h-16 w-20 rounded overflow-hidden border border-td-rule bg-td-chalk hover:border-primary transition-colors relative group focus:outline-none focus:ring-2 focus:ring-primary/20"
                  title="Nhấn để phóng to ảnh kiểm định"
                >
                  <div className="w-full h-full flex items-center justify-center text-td-muted bg-td-chalk text-xs font-mono">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-td-muted">
        Biên bản kiểm định xe (Minh bạch bàn giao)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCard("Kiểm định trước khi giao xe", "Biên bản xuất phát", preInspection)}
        {renderCard("Kiểm định sau khi nhận lại xe", "Biên bản kết thúc", postInspection)}
      </div>

      {/* Lightbox phóng to ảnh */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-td-white rounded overflow-hidden p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-td-chalk text-td-ink hover:bg-line-strong transition-colors"
              title="Đóng xem ảnh"
            >
              <X className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">Đóng</span>
            </button>
            <div className="h-96 flex items-center justify-center text-td-muted text-sm font-mono">
              [Ảnh chụp biên bản kiểm định chi tiết: {activeImage}]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
