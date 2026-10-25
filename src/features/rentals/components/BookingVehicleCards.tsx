"use client";

import { InlineError } from "@/components/forms/inline-validation";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import VehicleImage from "@/components/ui/VehicleImage";
import type { Vehicle } from "@/features/vehicles";
import { VehicleLicenseRequirement } from "@/features/vehicles/components/VehicleLicenseRequirement";

type Props = {
  vehicles: Vehicle[];
  value: string;
  onChange: (id: string) => void;
  rentalType: string;
  isPending: boolean;
  isFetching: boolean;
  error?: string;
  fieldError?: string;
  emptyMessage?: string;
  onRetry: () => void;
};

const money = (value: number) => `${value.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} đ`;

export default function BookingVehicleCards({ vehicles, value, onChange, rentalType, isPending, isFetching, error, fieldError, emptyMessage, onRetry }: Props) {
  return <fieldset className="min-w-0" aria-busy={isFetching} aria-describedby={`vehicleId-hint${fieldError ? " vehicleId-error" : ""}`} aria-invalid={!!fieldError}>
    <legend className="text-sm font-semibold">Phương tiện khả dụng</legend>
    <p id="vehicleId-hint" className="mt-1 text-sm text-td-muted">Chọn một thẻ xe để xem chi phí và điểm nhận xe.</p>
    {isPending ? <SkeletonBlock label="Đang kiểm tra xe khả dụng" className="mt-3 grid gap-3 sm:grid-cols-2">
      {[0, 1].map((item) => <div key={item} className="space-y-3 rounded border border-td-rule p-3"><Skeleton className="h-32 w-full rounded" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>)}
    </SkeletonBlock> : <>
      {isFetching && <p role="status" className="mt-3 text-sm text-td-muted">Đang cập nhật xe khả dụng...</p>}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error} <button type="button" onClick={onRetry} className="underline">Thử lại</button></p>}
      {!error && !vehicles.length && <p role="status" className="mt-3 rounded border border-td-rule bg-td-paper p-4 text-sm text-td-muted">{emptyMessage ?? "Không có xe khả dụng. Vui lòng chọn khoảng thời gian khác."}</p>}
      {!!vehicles.length && <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {vehicles.map((vehicle, index) => {
          const selected = String(vehicle.id) === value;
          const id = index === 0 ? "vehicleId" : `vehicleId-${vehicle.id}`;
          const detailsId = `${id}-details`;
          return <label key={vehicle.id} className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${isFetching ? "cursor-wait opacity-60" : "cursor-pointer hover:border-primary"} ${selected ? "border-primary bg-primary-tint ring-1 ring-primary" : fieldError ? "border-danger bg-td-white" : "border-td-rule bg-td-white"}`}>
            <VehicleImage src={vehicle.imageUrl} alt={vehicle.name} className="h-32 w-full" />
            <span className="relative flex flex-1 flex-col gap-2 p-3">
              <span className="flex items-start justify-between gap-3">
                <span id={`${id}-name`} className="min-w-0 text-sm font-semibold text-td-ink">{vehicle.name}</span>
                <input id={id} name="vehicleId" type="radio" required value={vehicle.id} checked={selected} disabled={isFetching} onChange={() => onChange(String(vehicle.id))} aria-labelledby={`${id}-name`} aria-describedby={`${detailsId}${fieldError ? " vehicleId-error" : ""}`} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
              </span>
              <span id={detailsId} className="flex flex-1 flex-col gap-2 text-xs text-td-muted">
                <span>{[vehicle.seats ? `${vehicle.seats} chỗ` : vehicle.categoryLabel, vehicle.transmission].filter(Boolean).join(" · ")}</span>
                <span>Nhận xe: {vehicle.facilityName || "Chưa có thông tin chi nhánh"}</span>
                <VehicleLicenseRequirement allowedLicenseTypes={vehicle.allowedLicenseTypes} />
                <span className="mt-auto text-sm font-semibold tabular-nums text-primary">{money(rentalType === "longterm" ? vehicle.monthlyPrice : vehicle.hourlyPrice)} <span className="font-normal text-td-muted">/ {rentalType === "longterm" ? "tháng" : "giờ"}</span></span>
              </span>
              {selected && <span className="text-xs font-semibold text-primary">Đã chọn</span>}
            </span>
          </label>;
        })}
      </div>}
    </>}
    <InlineError name="vehicleId" inputId="vehicleId" />
  </fieldset>;
}
