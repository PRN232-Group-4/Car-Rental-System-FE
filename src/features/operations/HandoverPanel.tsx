"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { formatAdminDateTime } from "@/lib/date-time";
import { getHandover } from "./handover-api";
import VehiclePhotos from "@/features/admin/VehiclePhotos";
import { confirmHandover, operationalError, operationsButton, operationsPanel } from "./api";

export default function HandoverPanel({ rentalId, refresh, showVehiclePhotos = true }: { rentalId: number | string; refresh?: () => Promise<unknown>; showVehiclePhotos?: boolean }) {
  const { hasAnyRole } = useAuth();
  const allowed = hasAnyRole(["Admin", "Manager", "CustomerService"]);
  const query = useQuery({ queryKey: ["handover", rentalId], queryFn: () => getHandover(rentalId), enabled: allowed, retry: false });
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const lock = useRef(false);
  if (!allowed) return null;
  const detail = query.data;
  const entity = detail?.rental.rental;
  const confirm = async () => {
    if (lock.current || !detail || query.error) return;
    if (!window.confirm("Xác nhận đã giao phương tiện và chìa khóa cho khách hàng?")) return;
    lock.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      await confirmHandover(rentalId);
      setSuccess("Đã xác nhận bàn giao xe. Đơn chuyển sang đang thuê.");
      await Promise.all([query.refetch(), refresh?.(), cache.invalidateQueries({ queryKey: ["handovers"] }), cache.invalidateQueries({ queryKey: ["admin-rentals"] }), cache.invalidateQueries({ queryKey: ["operational-rental"] })]);
    } catch (failure) { setError(operationalError(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <section className={operationsPanel} aria-busy={query.isFetching || busy}>
    <h2 className="text-lg font-bold">Bàn giao phương tiện</h2>
    {query.isPending ? <FormSkeleton label="Đang tải hồ sơ bàn giao..." fields={3} /> : query.error ? <p role="alert" className="text-sm text-danger">{operationalError(query.error)} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p> : detail && <>
      <p className="text-sm">Mã yêu cầu: #{entity?.id} · {detail.rental.orderId ? `Mã đơn chính thức: #${detail.rental.orderId}` : "Chưa có mã đơn chính thức"}</p>
      <p className="text-sm">{detail.rental.customerName || detail.rental.customerEmail || "Khách hàng chưa có tên"} · {[detail.rental.vehicleBrand, detail.rental.vehicleModel, detail.rental.licensePlate].filter(Boolean).join(" · ")}</p>
      <p className="text-sm text-ink-3">Nhận: {formatAdminDateTime(entity?.scheduledStart)} · Trả: {formatAdminDateTime(entity?.scheduledEnd)}</p>
      <p className="text-sm">{detail.status === "completed" ? "Đã bàn giao" : "Chờ bàn giao"}</p>
      {showVehiclePhotos && entity && <VehiclePhotos vehicleId={entity.vehicleId} />}
      <p className="text-sm text-ink-3">Máy chủ kiểm tra thanh toán, biên bản trước thuê, phân công và GPLX trước khi xác nhận.</p>
      {detail.status !== "completed" && <button type="button" className={operationsButton} disabled={busy || query.isFetching} onClick={() => void confirm()}>{busy ? "Đang xác nhận..." : "Xác nhận đã bàn giao xe"}</button>}
    </>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
  </section>;
}
