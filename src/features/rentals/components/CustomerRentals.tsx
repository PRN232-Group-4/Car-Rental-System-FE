"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/navigation/NavigationLink";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { formatAdminDateTime } from "@/lib/date-time";
import { getCustomerRental, getCustomerRentals } from "../customer-rentals-api";
import RentalStatusTracker from "./RentalStatusTracker";
import CancellationReason from "./CancellationReason";
import { rentalProgressSteps, rentalStatusLabel } from "../rental-progress";
import RentalCountdown from "./RentalCountdown";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import RentalCancelDialog from "@/features/operations/RentalCancelDialog";

const panel = "space-y-4 border-t border-td-ink pt-4 scroll-mt-32";
const tabs = [{ value: "", label: "Tất cả" }, { value: "upcoming", label: "Sắp tới" }, { value: "ongoing", label: "Đang thuê" }, { value: "completed", label: "Đã trả xe" }, { value: "cancelled", label: "Đã hủy" }, { value: "expired", label: "Đã hết hạn" }];
const errorText = (error: unknown) => error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không tải được đơn thuê. Vui lòng thử lại.";
/** Trạng thái kết thúc: không cần hỏi lại máy chủ theo chu kỳ để chờ chuyển trạng thái. */
const POLLED_STATUSES = ["completed", "cancelled", "expired"];

export default function CustomerRentals() {
  const params = useSearchParams();
  const selected = Number(params.get("rentalId"));
  const validSelection = Number.isSafeInteger(selected) && selected > 0;
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<{id:number;status:string} | null>(null);
  const cache = useQueryClient();

  const list = useQuery({ queryKey: ["customer-rentals", page, tab], queryFn: () => getCustomerRentals(page, tab), retry: false, refetchInterval: (query) => query.state.data?.items?.some((item) => !POLLED_STATUSES.includes(item.status)) ? 15000 : false });
  const detail = useQuery({ queryKey: ["customer-rental", selected], queryFn: () => getCustomerRental(selected), enabled: validSelection, retry: false, refetchInterval: (query) => query.state.data && !POLLED_STATUSES.includes(query.state.data.status) ? 15000 : false });
  const refresh = () => Promise.all([detail.refetch(), cache.invalidateQueries({ queryKey: ["customer-rentals"] })]);
  const rental = detail.data;
  const cancellationEvent = [...(rental?.timeline ?? [])].reverse().find(event => event.to === "cancelled");
  const expiryEvent = [...(rental?.timeline ?? [])].reverse().find(event => event.to === "expired");
  const awaitingDecision = rental ? ["pending", "pre_inspection"].includes(rental.status) : false;
  return <div className="space-y-6">
    <TransitFolio
      index="09"
      tag="KH"
      kicker="KHÁCH HÀNG · ĐƠN THUÊ"
      title={<>Đơn thuê <em className="italic text-td-teal">của tôi.</em></>}
      description="Theo dõi yêu cầu đặt xe và tiến trình thuê xe của bạn."
    >
      <div className="border-l border-td-rule pl-4 text-right">
        <span className="block font-mono text-[10px] tracking-wider text-td-muted">TỔNG YÊU CẦU</span>
        <strong className="block text-3xl font-bold tracking-tight text-td-ink">
          {list.isPending ? "—" : String(list.data?.totalCount ?? 0).padStart(2, "0")}
        </strong>
      </div>
    </TransitFolio>
    {params.has("rentalId") && !validSelection && <p role="alert" className="text-sm text-danger">Mã yêu cầu không hợp lệ. Vui lòng chọn một yêu cầu trong danh sách bên dưới.</p>}
    {validSelection && <section id="rental-progress" className={panel} aria-busy={detail.isFetching}>
      {detail.isPending ? <FormSkeleton label="Đang tải tiến trình thuê xe" fields={3} /> : detail.error ? <p role="alert" className="text-sm text-danger">{errorText(detail.error)} <button type="button" className="underline" onClick={() => void detail.refetch()}>Thử lại</button></p> : rental && !detail.error && <>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{rental.orderId ? `Đơn thuê chính thức #${rental.orderId}` : `Yêu cầu thuê #${rental.id}`}</h2><button type="button" onClick={() => void refresh()} disabled={detail.isFetching} className="text-sm font-semibold text-primary underline disabled:opacity-50">Cập nhật trạng thái</button></div>
        <RentalStatusTracker status={rental.status} />
        {awaitingDecision && rental.expireAt && <RentalCountdown expireAt={rental.expireAt} onExpire={() => void refresh()} />}
        {rental.status === "cancelled" && <CancellationReason reason={cancellationEvent?.reason} cancelledAt={cancellationEvent?.at} />}
        {rental.status === "expired" && <CancellationReason title="Lý do hết hạn" timestampLabel="Thời điểm hết hạn" emptyMessage="Đơn hết hạn vì chưa được duyệt hoặc chưa thanh toán trong thời hạn." reason={expiryEvent?.reason} cancelledAt={expiryEvent?.at} />}
        <p className="font-semibold">{rental.vehicle.brand} {rental.vehicle.model}</p>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-td-muted">Cơ sở</dt><dd>{rental.facility?.name?.trim() || "Chưa có thông tin cơ sở"}</dd></div>
          <div><dt className="text-td-muted">Hình thức lái</dt><dd>{rental.hasDriver ? (rental.driver?.fullName?.trim() ? `Có tài xế · ${rental.driver.fullName}` : "Yêu cầu có tài xế · Chưa phân công") : "Tự lái"}</dd></div>
          <div><dt className="text-td-muted">Nhận xe</dt><dd>{formatAdminDateTime(rental.start)}</dd></div><div><dt className="text-td-muted">Trả xe dự kiến</dt><dd>{formatAdminDateTime(rental.end)}</dd></div>
        </dl>
        {rental.nextAction === "WAITING_CONFIRMATION" && <p className="text-sm text-td-muted">Yêu cầu đang chờ nhân viên duyệt.</p>}
        {rental.nextAction === "PAYMENT_REQUIRED" && <p className="text-sm text-td-muted">Yêu cầu đã được duyệt. Xem hóa đơn để thanh toán theo phương thức đã chọn.</p>}
        {rental.rentalType === "longterm" && <Link href={`/rental-contract?rentalId=${rental.id}`} className="block text-sm font-semibold text-primary underline">Tải / xem hợp đồng đã ký</Link>}
        {rental.invoice && <Link href={`/invoices/${rental.invoice.id}`} className="inline-block text-sm font-semibold text-primary underline">Xem hóa đơn {rental.invoice.number}</Link>}
        {["pending", "pre_inspection"].includes(rental.status) && <button type="button" onClick={() => setCancelTarget(rental)} className="block rounded border border-td-rule px-4 py-2 text-sm font-semibold text-danger">Hủy đơn thuê</button>}
        {!!rental.timeline?.length && <details className="border-t border-td-rule pt-4"><summary className="cursor-pointer text-sm font-semibold">Lịch sử trạng thái</summary><ol className="mt-3 space-y-2 text-sm text-td-muted">{rental.timeline.map((event, index) => <li key={`${event.to}-${event.at}-${index}`}><span>{rentalProgressSteps.find((step) => step.status === event.to)?.label ?? rentalStatusLabel(event.to)}</span> · <time>{formatAdminDateTime(event.at)}</time>{event.reason ? ` · ${event.reason}` : ""}</li>)}</ol></details>}
      </>}
    </section>}
    <nav aria-label="Lọc đơn thuê" className="flex flex-wrap items-center gap-2 border-b border-td-ink pb-3 font-mono text-xs">{tabs.map((item) => <button key={item.value} type="button" aria-pressed={tab === item.value} onClick={() => { setTab(item.value); setPage(1); }} className={`cursor-pointer border-b-2 px-3 py-1 font-bold transition-colors ${tab === item.value ? "border-primary text-primary" : "border-transparent text-td-muted hover:text-td-ink"}`}>{item.label}</button>)}</nav>
    <div className="space-y-4" aria-busy={list.isFetching}>
      {list.isPending ? <FormSkeleton label="Đang tải danh sách đơn thuê" fields={4} /> : list.error ? <p role="alert" className="text-sm text-danger">{errorText(list.error)} <button type="button" className="underline" onClick={() => void list.refetch()}>Thử lại</button></p> : <>
        {!list.data?.items?.length && <p className={panel}>Chưa có đơn thuê trong mục này.</p>}
        {!!list.data?.items?.length && <div className="border-t border-td-ink divide-y divide-td-rule border-b border-td-rule">{list.data.items.map((item) => <article key={item.id} className="py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{item.orderId ? `Đơn thuê #${item.orderId}` : `Yêu cầu #${item.id}`}</h2><Link href={`/my-rentals?rentalId=${item.id}#rental-progress`} className="text-sm font-semibold text-primary underline" aria-label={`Xem chi tiết yêu cầu ${item.id}`}>Xem chi tiết</Link></div>
          <p className="text-sm font-semibold text-td-ink">{item.vehicleBrand} {item.vehicleModel}</p>
          <p className="font-mono text-[11px] text-td-muted">{formatAdminDateTime(item.startTime)} → {formatAdminDateTime(item.endTime)}</p>
          <RentalStatusTracker status={item.status} />
          {["pending", "pre_inspection"].includes(item.status) && item.expireAt && <RentalCountdown expireAt={item.expireAt} className="mt-2" />}
          {item.rentalType === "longterm" && <Link href={`/rental-contract?rentalId=${item.id}`} className="mt-2 block text-sm font-semibold text-primary underline">Tải / xem hợp đồng đã ký</Link>}
          {["pending", "pre_inspection"].includes(item.status) && <button type="button" onClick={() => setCancelTarget(item)} className="mt-3 rounded border border-td-rule px-3 py-2 text-sm font-semibold text-danger" aria-label={`Hủy đơn thuê #${item.id}`}>Hủy đơn thuê</button>}
        </article>)}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-td-muted"><p aria-live="polite">{list.data?.totalCount ?? 0} yêu cầu / đơn thuê · Trang {page}/{Math.max(1, Math.ceil((list.data?.totalCount ?? 0) / 20))}</p><div className="flex gap-2"><button type="button" disabled={page === 1 || list.isFetching} onClick={() => setPage((current) => current - 1)} className="rounded border border-td-rule px-3 py-1 font-bold text-td-ink disabled:opacity-50">Trang trước</button><button type="button" disabled={page * 20 >= (list.data?.totalCount ?? 0) || list.isFetching} onClick={() => setPage((current) => current + 1)} className="rounded border border-td-rule px-3 py-1 font-bold text-td-ink disabled:opacity-50">Trang sau</button></div></div>
      </>}
    </div>
    {cancelTarget && <RentalCancelDialog key={cancelTarget.id} rental={cancelTarget} audience="customer" close={() => setCancelTarget(null)} refresh={async () => { await list.refetch(); if (validSelection) await detail.refetch(); }} />}
  </div>;
}
