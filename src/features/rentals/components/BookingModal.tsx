"use client";

import { useEffect, useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import type { Vehicle } from "@/features/vehicles";
import VehicleImage from "@/components/ui/VehicleImage";

export default function BookingModal({ vehicle, onClose }: { vehicle: Vehicle | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !vehicle) return;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, [vehicle]);
  if (!vehicle) return null;
  // Landing showcase cards can have editorial IDs. Only real numeric IDs preselect a vehicle.
  const query = (Number.isInteger(Number(vehicle.id)) && Number(vehicle.id) > 0 ? `&vehicleId=${vehicle.id}` : "")
    + (Number.isInteger(Number(vehicle.facilityId)) && Number(vehicle.facilityId) > 0 ? `&facilityId=${vehicle.facilityId}` : "");
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="booking-modal-title" className="m-auto w-[calc(100%-2rem)] max-w-lg rounded border border-td-rule bg-td-white p-6 text-td-ink shadow-xl backdrop:bg-scrim">
    <div className="flex items-start justify-between gap-4"><h2 id="booking-modal-title" className="text-xl font-bold">Đặt xe {vehicle.name}</h2><button type="button" onClick={onClose} aria-label="Đóng hộp thoại đặt xe" className="rounded border border-td-rule px-3 py-2">×</button></div>
    <VehicleImage src={vehicle.imageUrl} alt={vehicle.name} className="mt-5 h-48 w-full rounded" />
    <p className="my-5 text-sm text-td-muted">Chọn thời gian, xe khả dụng và kiểm tra chi phí trước khi xác nhận đơn thuê.</p>
    <div className="flex flex-wrap gap-3"><Link onClick={onClose} href={`/booking?mode=hourly${query}`} className="rounded bg-primary px-4 py-3 text-white">Thuê theo giờ</Link><Link onClick={onClose} href={`/booking?mode=longterm${query}`} className="rounded border border-td-rule px-4 py-3">Thuê dài hạn</Link></div>
  </dialog>;
}
