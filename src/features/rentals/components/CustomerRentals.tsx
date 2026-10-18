"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/navigation/NavigationLink";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { formatAdminDateTime } from "@/lib/date-time";
import { getCustomerRental, getCustomerRentals } from "../customer-rentals-api";
import RentalStatusTracker from "./RentalStatusTracker";
import { rentalProgressSteps } from "../rental-progress";

const panel = "space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:p-6";
const tabs = [{ value: "", label: "Tất cả" }, { value: "upcoming", label: "Sắp tới" }, { value: "ongoing", label: "Đang thuê" }, { value: "completed", label: "Đã trả xe" }, { value: "cancelled", label: "Đã hủy" }];
const errorText = (error: unknown) => error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không tải được đơn thuê. Vui lòng thử lại.";

export default function CustomerRentals() {
  const params = useSearchParams();
  const selected = Number(params.get("rentalId"));
  const validSelection = Number.isSafeInteger(selected) && selected > 0;
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const cache = useQueryClient();
  const list = useQuery({ queryKey: ["customer-rentals", page, tab], queryFn: () => getCustomerRentals(page, tab), retry: false, refetchInterval: (query) => query.state.data?.items?.some((item) => !["completed", "cancelled"].includes(item.status)) ? 15000 : false });
  const detail = useQuery({ queryKey: ["customer-rental", selected], queryFn: () => getCustomerRental(selected), enabled: validSelection, retry: false, refetchInterval: (query) => query.state.data && !["completed", "cancelled"].includes(query.state.data.status) ? 15000 : false });
  const refresh = () => Promise.all([detail.refetch(), cache.invalidateQueries({ queryKey: ["customer-rentals"] })]);
  const rental = detail.data;
  return <div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Đơn thuê của tôi</h1><p className="mt-2 text-sm text-ink-3">Theo dõi yêu cầu đặt xe và tiến trình thuê xe của bạn.</p></header>
    {params.has("rentalId") && !validSelection && <p role="alert" className="text-sm text-danger">Mã yêu cầu không hợp lệ. Vui lòng chọn một yêu cầu trong danh sách bên dưới.</p>}
    {validSelection && <section id="rental-progress" className={panel} aria-busy={detail.isFetching}>
      {detail.isPending ? <FormSkeleton label="Đang tải tiến trình thuê xe" fields={3} /> : detail.error ? <p role="alert" className="text-sm text-danger">{errorText(detail.error)} <button type="button" className="underline" onClick={() => void detail.refetch()}>Thử lại</button></p> : rental && <>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{rental.orderId ? `Đơn thuê chính thức #${rental.orderId}` : `Yêu cầu thuê #${rental.id}`}</h2><button type="button" onClick={() => void refresh()} disabled={detail.isFetching} className="text-sm font-semibold text-primary underline disabled:opacity-50">Cập nhật trạng thái</button></div>
        <RentalStatusTracker status={rental.status} />
        <p className="font-semibold">{rental.vehicle.brand} {rental.vehicle.model}</p>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-ink-3">Cơ sở</dt><dd>{rental.facility}</dd></div>
          <div><dt className="text-ink-3">Hình thức lái</dt><dd>{rental.hasDriver ? `Có tài xế${rental.driver ? ` · ${rental.driver.fullName}` : ""}` : "Tự lái"}</dd></div>
          <div><dt className="text-ink-3">Nhận xe</dt><dd>{formatAdminDateTime(rental.start)}</dd></div><div><dt className="text-ink-3">Trả xe dự kiến</dt><dd>{formatAdminDateTime(rental.end)}</dd></div>
        </dl>
        {rental.nextAction === "WAITING_CONFIRMATION" && <p className="text-sm text-ink-3">Yêu cầu đang chờ nhân viên duyệt.</p>}
        {rental.nextAction === "PAYMENT_REQUIRED" && <p className="text-sm text-ink-3">Yêu cầu đã được duyệt. Xem hóa đơn để thanh toán theo phương thức đã chọn.</p>}
        {rental.invoice && <Link href={`/invoices/${rental.invoice.id}`} className="inline-block text-sm font-semibold text-primary underline">Xem hóa đơn {rental.invoice.number}</Link>}
        {!!rental.timeline?.length && <details className="border-t border-line pt-4"><summary className="cursor-pointer text-sm font-semibold">Lịch sử trạng thái</summary><ol className="mt-3 space-y-2 text-sm text-ink-3">{rental.timeline.map((event, index) => <li key={`${event.to}-${event.at}-${index}`}><span>{rentalProgressSteps.find((step) => step.status === event.to)?.label ?? (event.to === "cancelled" ? "Đã hủy" : "Cập nhật trạng thái")}</span> · <time>{formatAdminDateTime(event.at)}</time>{event.reason ? ` · ${event.reason}` : ""}</li>)}</ol></details>}
      </>}
    </section>}
    <nav aria-label="Lọc đơn thuê" className="flex flex-wrap gap-2">{tabs.map((item) => <button key={item.value} type="button" aria-pressed={tab === item.value} onClick={() => { setTab(item.value); setPage(1); }} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${tab === item.value ? "border-primary bg-primary-tint text-primary" : "border-line-strong bg-surface text-ink-2"}`}>{item.label}</button>)}</nav>
    <div className="space-y-4" aria-busy={list.isFetching}>
      {list.isPending ? <FormSkeleton label="Đang tải danh sách đơn thuê" fields={4} /> : list.error ? <p role="alert" className="text-sm text-danger">{errorText(list.error)} <button type="button" className="underline" onClick={() => void list.refetch()}>Thử lại</button></p> : <>
        {!list.data?.items?.length && <p className={panel}>Chưa có đơn thuê trong mục này.</p>}
        {list.data?.items?.map((item) => <article key={item.id} className={panel}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{item.orderId ? `Đơn thuê #${item.orderId}` : `Yêu cầu #${item.id}`}</h2><Link href={`/my-rentals?rentalId=${item.id}#rental-progress`} className="text-sm font-semibold text-primary underline" aria-label={`Xem chi tiết yêu cầu ${item.id}`}>Xem chi tiết</Link></div>
          <p className="text-sm font-semibold">{item.vehicleBrand} {item.vehicleModel}</p>
          <p className="text-xs text-ink-3">{formatAdminDateTime(item.startTime)} → {formatAdminDateTime(item.endTime)}</p>
          <RentalStatusTracker status={item.status} />
        </article>)}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><p aria-live="polite">{list.data?.totalCount ?? 0} yêu cầu / đơn thuê · Trang {page}/{Math.max(1, Math.ceil((list.data?.totalCount ?? 0) / 20))}</p><div className="flex gap-2"><button type="button" disabled={page === 1 || list.isFetching} onClick={() => setPage((current) => current - 1)} className="min-h-11 rounded-xl border border-line-strong px-4 disabled:opacity-50">Trang trước</button><button type="button" disabled={page * 20 >= (list.data?.totalCount ?? 0) || list.isFetching} onClick={() => setPage((current) => current + 1)} className="min-h-11 rounded-xl border border-line-strong px-4 disabled:opacity-50">Trang sau</button></div></div>
      </>}
    </div>
  </div>;
}
