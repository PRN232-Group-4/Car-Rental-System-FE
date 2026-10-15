"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { getRentalById, updateRentalContract } from "../api";
import { isSafeContractLink, localDateTime } from "../booking-rules";
import type { RentalContract } from "../types";
import VehicleName from "@/features/admin/VehicleName";
import { FormSkeleton } from "@/components/ui/Skeleton";

const inputClass = "mt-2 w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm";

export default function RentalContractManager() {
  const params = useSearchParams();
  const [rentalId, setRentalId] = useState(params.get("rentalId") ?? "");
  const [lookupId, setLookupId] = useState(params.get("rentalId") ?? "");
  const validation = useInlineValidation();
  const query = useQuery({ queryKey: ["rental-contract", lookupId], queryFn: () => getRentalById(lookupId), enabled: /^[1-9]\d*$/.test(lookupId), retry: false });
  return <section className="mx-auto max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Hợp đồng thuê dài hạn</h1><p className="mt-2 text-sm text-ink-3">Tra cứu đơn thuê, xem tài liệu và ghi nhận thông tin hợp đồng đã ký.</p></div>
    <ValidatedForm validation={validation} onSubmit={() => setLookupId(rentalId)} className="rounded-2xl border border-line bg-surface p-5">
      <label htmlFor="rentalId" className="text-sm font-semibold">Mã đơn thuê</label><InlineInput id="rentalId" name="rentalId" type="number" min="1" step="1" required value={rentalId} onChange={(event) => setRentalId(event.target.value)} className={inputClass} />
      <button type="submit" className="mt-4 rounded-xl bg-primary px-4 py-3 text-white">Tra cứu hợp đồng</button>
    </ValidatedForm>
    {query.isFetching && !query.data && <FormSkeleton label="Đang tải hợp đồng" fields={4} />}
    {query.error && <p role="alert" className="text-danger">{query.error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : query.error.message} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    {query.data && (query.data.rentalType === "longterm" ? <ContractForm key={lookupId} rental={query.data} /> : <p role="alert">Đơn thuê này không phải thuê dài hạn. Vui lòng kiểm tra lại mã đơn.</p>)}
    <Link href="/booking?mode=longterm" className="inline-block text-primary underline">Đặt xe dài hạn</Link>
  </section>;
}

function ContractForm({ rental }: { rental: RentalContract }) {
  const queryClient = useQueryClient();
  const [contractLink, setContractLink] = useState(rental.contractLink ?? "");
  const [signedAt, setSignedAt] = useState(rental.signedAt ? localDateTime(new Date(rental.signedAt)) : "");
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [saved, setSaved] = useState(false);
  const validation = useInlineValidation();
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true); setGeneralError(""); setSaved(false);
    try {
      const updated = await updateRentalContract(rental.id, contractLink.trim() || null, new Date(signedAt).toISOString());
      queryClient.setQueryData(["rental-contract", String(rental.id)], updated);
      setSaved(true);
    } catch (error) {
      const message = validation.report(error);
      setGeneralError(error instanceof TypeError ? "Không thể kết nối máy chủ. Thông tin chưa được lưu, vui lòng thử lại." : message);
    } finally { setSubmitting(false); }
  };
  return <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 className="text-lg font-bold">Đơn thuê #{rental.id}</h2>
    <VehicleName vehicleId={rental.vehicleId} />
    <p className="text-sm">Trạng thái: {rental.status} · Tổng tiền thuê: {rental.totalPrice.toLocaleString("vi-VN")} đ</p>
    {rental.contractLink && isSafeContractLink(rental.contractLink) ? <a href={rental.contractLink} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl border border-line-strong px-4 py-3 text-primary">Mở tài liệu hợp đồng</a> : <p className="text-sm text-ink-3">Chưa có đường dẫn hợp đồng hợp lệ. Vui lòng liên hệ chi nhánh để nhận tài liệu.</p>}
    {rental.signedAt && <p className="text-sm">Đã ghi nhận ký lúc: {new Date(rental.signedAt).toLocaleString("vi-VN")}</p>}
    <ValidatedForm validation={validation} validate={() => ({ contractLink: contractLink.trim() && !isSafeContractLink(contractLink.trim()) ? "Vui lòng nhập đường dẫn hợp đồng bắt đầu bằng https:// hoặc http://." : undefined, signedAt: !Number.isFinite(new Date(signedAt).getTime()) ? "Vui lòng chọn ngày giờ ký hợp đồng hợp lệ." : undefined })} onSubmit={submit} className="space-y-4">
      <fieldset disabled={submitting} className="space-y-4"><legend className="font-semibold">Ghi nhận hợp đồng đã ký</legend>
        <p className="text-sm text-ink-3">Sau khi ký tài liệu với chi nhánh, cập nhật đường dẫn và thời điểm ký bên dưới.</p>
        <div><label htmlFor="contractLink" className="text-sm font-semibold">Đường dẫn tài liệu hợp đồng</label><InlineInput id="contractLink" name="contractLink" type="url" className={inputClass} value={contractLink} onChange={(event) => setContractLink(event.target.value)} placeholder="https://..." /></div>
        <div><label htmlFor="signedAt" className="text-sm font-semibold">Ngày giờ ký</label><InlineInput id="signedAt" name="signedAt" type="datetime-local" required className={inputClass} value={signedAt} onChange={(event) => setSignedAt(event.target.value)} /></div>
        {generalError && <p role="alert" className="text-sm text-danger">{generalError}</p>}
        {saved && <p role="status" className="text-sm text-success">Đã lưu thông tin hợp đồng.</p>}
        <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-white disabled:opacity-50">{submitting ? "Đang lưu..." : "Lưu thông tin ký hợp đồng"}</button>
      </fieldset>
    </ValidatedForm>
  </div>;
}
