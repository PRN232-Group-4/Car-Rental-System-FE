"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { FormSkeleton } from "@/components/ui/Skeleton";
import Link from "@/components/navigation/NavigationLink";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { formatAdminDateTime } from "@/lib/date-time";
import { getHandover } from "./handover-api";
import { confirmHandover, operationalError, operationsButton, operationsPanel } from "./api";

export default function HandoverPanel({ rentalId, refresh }: { rentalId: number | string; refresh?: () => Promise<unknown> }) {
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
  const canConfirm = detail?.rental.hasPassingPreInspection === true;
  const confirm = async () => {
    if (lock.current || !detail || query.error || !canConfirm) return;
    if (!window.confirm("Xác nhận đã giao phương tiện và chìa khóa cho khách hàng?")) return;
    lock.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      await confirmHandover(rentalId);
      setSuccess("Đã xác nhận bàn giao xe. Đơn chuyển sang đang thuê.");
      notifySuccess("Đã xác nhận bàn giao xe. Đơn chuyển sang đang thuê.");
      void cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY });
      await Promise.all([query.refetch(), refresh?.(), cache.invalidateQueries({ queryKey: ["handovers"] }), cache.invalidateQueries({ queryKey: ["admin-rentals"] }), cache.invalidateQueries({ queryKey: ["operational-rental"] })]);
    } catch (failure) { const message = operationalError(failure); setError(message); notifyError(message); }
    finally { lock.current = false; setBusy(false); }
  };
  return <section className={operationsPanel} aria-busy={query.isFetching || busy}>
    <h2 className="text-lg font-bold">Bàn giao phương tiện</h2>
    {query.isPending ? <FormSkeleton label="Đang tải hồ sơ bàn giao..." fields={3} /> : query.error ? <p role="alert" className="text-sm text-danger">{operationalError(query.error)} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p> : detail && <>
      <p className="text-sm">Mã yêu cầu: #{entity?.id} · {detail.rental.orderId ? `Mã đơn chính thức: #${detail.rental.orderId}` : "Chưa có mã đơn chính thức"}</p>
      <p className="text-sm">{detail.rental.customerName || detail.rental.customerEmail || "Khách hàng chưa có tên"} · {[detail.rental.vehicleBrand, detail.rental.vehicleModel, detail.rental.licensePlate].filter(Boolean).join(" · ")}</p>
      <p className="text-sm text-td-muted">Nhận: {formatAdminDateTime(entity?.scheduledStart)} · Trả: {formatAdminDateTime(entity?.scheduledEnd)}</p>
      <p className="text-sm">{detail.status === "completed" ? "Đã bàn giao" : "Chờ bàn giao"}</p>
      <p className="text-sm text-td-muted">Máy chủ kiểm tra thanh toán, biên bản trước thuê, phân công và GPLX trước khi xác nhận.</p>
      {detail.status !== "completed" && <>
        {!canConfirm && <p className="text-sm text-td-muted">Cần hoàn tất phiếu kiểm tra trước thuê với kết quả đạt trước khi bàn giao xe. <Link className="underline" href={`/admin/inspections?rentalId=${rentalId}`}>Mở phiếu kiểm tra</Link></p>}
        <button type="button" className={operationsButton} disabled={busy || query.isFetching || !canConfirm} onClick={() => void confirm()}>{busy ? "Đang xác nhận..." : "Xác nhận đã bàn giao xe"}</button>
        {!canConfirm && <button type="button" className="text-sm underline" disabled={query.isFetching} onClick={() => void query.refetch()}>Tải lại kết quả kiểm tra</button>}
      </>}
    </>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
  </section>;
}
