"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/navigation/NavigationLink";
import { Search } from "lucide-react";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { getOperationalRental, operationalError, operationsPanel, rentalStatuses } from "./api";
import type { OperationalRental } from "./api";

export default function RentalLookup({ title, children, staffLinks = true }: { title: string; staffLinks?: boolean; children: (rental: OperationalRental, refresh: () => Promise<unknown>) => ReactNode }) {
  const params = useSearchParams();
  const [id, setId] = useState(params.get("rentalId") ?? "");
  const [lookup, setLookup] = useState(params.get("rentalId") ?? "");
  const validation = useInlineValidation();
  const query = useQuery({ queryKey: ["operational-rental", lookup], queryFn: () => getOperationalRental(Number(lookup)), enabled: /^[1-9]\d*$/.test(lookup), retry: false });
  return <div className="mx-auto max-w-6xl space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-ink-3">Nhập mã đơn thuê để tải thông tin từ hệ thống.</p></div>
    <ValidatedForm validation={validation} onSubmit={() => { if (lookup === id) void query.refetch(); else setLookup(id); }}>
      <AdminFilterBar title="Tra cứu đơn thuê" actions={<>
        <AdminFilterButton type="submit" disabled={query.isFetching}>{query.isFetching ? "Đang tải..." : "Tra cứu đơn thuê"}</AdminFilterButton>
        <AdminFilterButton variant="secondary" disabled={!id && !lookup && Object.keys(validation.errors).length === 0} onClick={() => { setId(""); setLookup(""); validation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Mã đơn thuê" htmlFor="operations-rental-id" icon={Search}>
          <InlineInput id="operations-rental-id" name="rentalId" required type="number" min="1" step="1" value={id} onChange={(event) => setId(event.target.value)} placeholder="Nhập mã đơn thuê" />
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {query.error && <p role="alert" className="text-sm text-danger">{operationalError(query.error)}</p>}
    {query.data && <>
      <section className={operationsPanel}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Đơn thuê #{query.data.id}</h2><span className="rounded-lg bg-canvas px-3 py-2 text-sm font-semibold">{rentalStatuses[query.data.status] ?? query.data.status}</span></div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-ink-3">Khách hàng</dt><dd>#{query.data.customerId ?? "—"}</dd></div><div><dt className="text-ink-3">Phương tiện</dt><dd>#{query.data.vehicleId}</dd></div>
          <div><dt className="text-ink-3">Nhận xe</dt><dd>{query.data.startTime ? new Date(query.data.startTime).toLocaleString("vi-VN") : "—"}</dd></div><div><dt className="text-ink-3">Trả xe</dt><dd>{query.data.endTime ? new Date(query.data.endTime).toLocaleString("vi-VN") : "—"}</dd></div>
        </dl>
        <p className="text-sm">{query.data.rentalType === "longterm" ? "Thuê dài hạn" : "Thuê theo giờ"} · {query.data.hasDriver ? "Có tài xế" : "Tự lái"} · Tổng tiền thuê: {query.data.totalPrice.toLocaleString("vi-VN")} đ</p>
        {staffLinks && <div className="flex flex-wrap gap-4 text-sm text-primary"><Link href={`/admin/rentals?rentalId=${query.data.id}`}>Vận hành đơn thuê</Link><Link href={`/admin/inspections?rentalId=${query.data.id}`}>Kiểm tra trước / sau thuê</Link><Link href={`/report-incident?rentalId=${query.data.id}`}>Báo cáo sự cố</Link></div>}
      </section>
      <div key={query.data.id}>{children(query.data, query.refetch)}</div>
    </>}
    {!lookup && <p className="text-sm text-ink-3">Chưa chọn đơn thuê. Nhập mã đơn do khách hàng cung cấp để bắt đầu.</p>}
  </div>;
}
