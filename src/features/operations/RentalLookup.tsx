"use client";
import { formatAdminDateTime } from "@/lib/date-time";
import RentalOperationalBadge from "./RentalOperationalBadge";
import VehicleName from "@/features/admin/VehicleName";
import VehiclePhotos from "@/features/admin/VehiclePhotos";
import { FormSkeleton } from "@/components/ui/Skeleton";

import { useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/navigation/NavigationLink";
import { Search } from "lucide-react";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { getOperationalRental, operationalError, operationsPanel } from "./api";
import type { OperationalRental } from "./api";
import RentalTrackingPanel from "@/features/maps/RentalTrackingPanel";
import RentalStatusTracker from "@/features/rentals/components/RentalStatusTracker";
import RentalCancellationReason from "./RentalCancellationReason";

export default function RentalLookup({ title, children, staffLinks = true }: { title: string; staffLinks?: boolean; children: (rental: OperationalRental, refresh: () => Promise<unknown>) => ReactNode }) {
  const params = useSearchParams();
  const [id, setId] = useState(params.get("rentalId") ?? "");
  const [lookup, setLookup] = useState(params.get("rentalId") ?? "");
  const validation = useInlineValidation();
  const cache = useQueryClient();
  const query = useQuery({ queryKey: ["operational-rental", lookup], queryFn: () => getOperationalRental(Number(lookup)), enabled: /^[1-9]\d*$/.test(lookup), retry: false });
  const refresh = () => Promise.all([query.refetch(), cache.invalidateQueries({ queryKey: ["admin-rentals"] })]);
  return <div className="space-y-6">
    <ValidatedForm validation={validation} onSubmit={() => { if (lookup === id) void query.refetch(); else setLookup(id); }}>
      <AdminFilterBar title={title} actions={<>
        <AdminFilterButton type="submit" disabled={query.isFetching}>{query.isFetching ? "Đang tải..." : "Tra cứu đơn thuê"}</AdminFilterButton>
        <AdminFilterButton variant="secondary" disabled={!id && !lookup && Object.keys(validation.errors).length === 0} onClick={() => { setId(""); setLookup(""); validation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Mã yêu cầu đặt xe" htmlFor="operations-rental-id" icon={Search}>
          <InlineInput id="operations-rental-id" name="rentalId" required type="number" min="1" step="1" value={id} onChange={(event) => setId(event.target.value)} placeholder="Nhập mã yêu cầu đặt xe" />
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {query.error && <p role="alert" className="text-sm text-danger">{operationalError(query.error)}</p>}
    {query.isFetching && !query.data && <FormSkeleton label="Đang tải thông tin đơn thuê" fields={4} />}
    {query.data && <>
      <section className={operationsPanel}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{query.data.orderId ? `Đơn thuê chính thức #${query.data.orderId}` : `Yêu cầu thuê #${query.data.id}`}</h2><RentalOperationalBadge rental={query.data} /></div>
        <RentalStatusTracker status={query.data.status} />
        {staffLinks && <RentalCancellationReason key={`cancel-reason-${query.data.id}`} rental={query.data} />}
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-td-muted">Khách hàng</dt><dd>#{query.data.customerId ?? "—"}</dd></div><div className="sm:col-span-2 lg:col-span-1"><dt className="mb-2 text-td-muted">Phương tiện</dt><dd><VehicleName vehicleId={query.data.vehicleId} /></dd></div>
          <div><dt className="text-td-muted">Nhận xe</dt><dd>{formatAdminDateTime(query.data.startTime)}</dd></div><div><dt className="text-td-muted">Trả xe</dt><dd>{formatAdminDateTime(query.data.endTime)}</dd></div>
        </dl>
        <p className="text-sm">{query.data.rentalType === "longterm" ? "Thuê dài hạn" : "Thuê theo giờ"} · {query.data.hasDriver ? "Có tài xế" : "Tự lái"} · Tổng tiền thuê: {query.data.totalPrice.toLocaleString("vi-VN")} đ</p>
        {staffLinks && <VehiclePhotos vehicleId={query.data.vehicleId} />}
        {staffLinks && <div className="flex flex-wrap gap-4 text-sm text-td-oxide"><Link href={`/admin/rentals?rentalId=${query.data.id}`}>Vận hành đơn thuê</Link><Link href={`/admin/inspections?rentalId=${query.data.id}`}>Kiểm tra trước / sau thuê</Link><Link href={`/report-incident?rentalId=${query.data.id}`}>Báo cáo sự cố</Link></div>}
      </section>
      {staffLinks && <RentalTrackingPanel key={`gps-${query.data.id}`} rentalId={query.data.id} />}
      <div key={query.data.id}>{children(query.data, refresh)}</div>
    </>}
    {!lookup && <p className="text-sm text-td-muted">Chưa chọn yêu cầu / đơn thuê. Nhập mã yêu cầu đặt xe do khách hàng cung cấp để bắt đầu.</p>}
  </div>;
}
