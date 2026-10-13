"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Vehicle } from "@/features/vehicles";

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
  const query = Number.isInteger(Number(vehicle.id)) && Number(vehicle.id) > 0 ? `&vehicleId=${vehicle.id}` : "";
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="booking-modal-title" className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-surface p-6 text-ink shadow-xl backdrop:bg-scrim">
    <div className="flex items-start justify-between gap-4"><h2 id="booking-modal-title" className="text-xl font-bold">Đặt xe {vehicle.name}</h2><button type="button" onClick={onClose} aria-label="Đóng hộp thoại đặt xe" className="rounded-lg border border-border px-3 py-2">×</button></div>
    <p className="my-5 text-sm text-ink-muted">Chọn thời gian, xe khả dụng và kiểm tra chi phí trước khi xác nhận đơn thuê.</p>
    <div className="flex flex-wrap gap-3"><Link onClick={onClose} href={`/booking?mode=hourly${query}`} className="rounded-xl bg-primary px-4 py-3 text-white">Thuê theo giờ</Link><Link onClick={onClose} href={`/booking?mode=longterm${query}`} className="rounded-xl border border-border px-4 py-3">Thuê dài hạn</Link></div>
  </dialog>;
}
