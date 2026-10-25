"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { useQuery } from "@tanstack/react-query";
import { InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { getRentalById } from "../api";
import VehicleName from "@/features/admin/VehicleName";
import { FormSkeleton } from "@/components/ui/Skeleton";
import RentalStatusTracker from "./RentalStatusTracker";
import SignedContractUpload from "./SignedContractUpload";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";

const inputClass = "mt-2 w-full rounded border border-td-rule bg-td-white px-3 py-3 text-sm";

export default function RentalContractManager() {
  const params = useSearchParams();
  const [rentalId, setRentalId] = useState(params.get("rentalId") ?? "");
  const [lookupId, setLookupId] = useState(params.get("rentalId") ?? "");
  const validation = useInlineValidation();
  const query = useQuery({ queryKey: ["rental-contract", lookupId], queryFn: () => getRentalById(lookupId), enabled: /^[1-9]\d*$/.test(lookupId), retry: false });
  return <section className="space-y-6">
    <TransitFolio
      index="09"
      tag="KH"
      kicker="KHÁCH HÀNG · HỢP ĐỒNG DÀI HẠN"
      title={<>Hợp đồng <span className="text-td-teal">thuê dài hạn.</span></>}
      description="Tra cứu đơn thuê và tải file hoặc ảnh hợp đồng đã ký trước khi nhận xe dài hạn."
    />
    <ValidatedForm validation={validation} onSubmit={() => setLookupId(rentalId)} className="space-y-3 border-y border-td-rule py-4">
      <label htmlFor="rentalId" className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">Mã đơn thuê</label><InlineInput id="rentalId" name="rentalId" type="number" min="1" step="1" required value={rentalId} onChange={(event) => setRentalId(event.target.value)} className={inputClass} />
      <button type="submit" className="rounded bg-primary px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover">Tra cứu hợp đồng</button>
    </ValidatedForm>
    {query.isFetching && !query.data && <FormSkeleton label="Đang tải hợp đồng" fields={4} />}
    {query.error && <p role="alert" className="text-danger">{query.error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : query.error.message} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    {query.data && (query.data.rentalType === "longterm" ? <div className="space-y-5 border-t border-td-ink pt-4"><h2 className="text-lg font-bold">{query.data.orderId ? `Đơn thuê chính thức #${query.data.orderId}` : `Yêu cầu thuê #${query.data.id}`}</h2><RentalStatusTracker status={query.data.status} /><VehicleName vehicleId={query.data.vehicleId} /><SignedContractUpload key={lookupId} rental={query.data} /></div> : <p role="alert">Đơn thuê này không phải thuê dài hạn. Vui lòng kiểm tra lại mã đơn.</p>)}
    <Link href="/booking?mode=longterm" className="inline-block text-primary underline">Đặt xe dài hạn</Link>
  </section>;
}
