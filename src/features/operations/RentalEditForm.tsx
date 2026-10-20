"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVehicles, type VehicleDto } from "@/features/admin/api";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/Button";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { operationalError, operationsInput, operationsPanel, updateRental, type OperationalRental } from "./api";

const localTime = (value?: string | null) => {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
async function loadVehicles() {
  const vehicles: VehicleDto[] = [];
  for (let page = 1; ; page++) {
    const result = await getVehicles({ page, pageSize: 100 });
    vehicles.push(...(result.items ?? []));
    if (!result.items?.length || vehicles.length >= result.totalCount) return vehicles;
  }
}
export default function RentalEditForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  return <section className={operationsPanel}>
    <h2 className="text-lg font-bold">Sửa yêu cầu thuê</h2>
    <p className="text-sm text-ink-3">Đổi xe, thời gian hoặc hình thức lái. Máy chủ kiểm tra điều kiện được sửa và tính lại giá.</p>
    <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Sửa yêu cầu</Button>
    {open && <EditDialog rental={rental} refresh={refresh} close={() => setOpen(false)} />}
  </section>;
}
function EditDialog({ rental, refresh, close }: { rental: OperationalRental; refresh: () => Promise<unknown>; close: () => void }) {
  const [draft, setDraft] = useState({ vehicleId: String(rental.vehicleId), startTime: localTime(rental.startTime), endTime: localTime(rental.endTime), hasDriver: rental.hasDriver ? "true" : "false" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const cache = useQueryClient();
  const validation = useInlineValidation();
  const vehicles = useQuery({ queryKey: ["rental-edit-vehicles"], queryFn: loadVehicles, retry: false });
  const save = async () => {
    if (lock.current || vehicles.error || !vehicles.data) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await updateRental(rental.id, { vehicleId: Number(draft.vehicleId), startTime: new Date(draft.startTime).toISOString(), endTime: new Date(draft.endTime).toISOString(), hasDriver: draft.hasDriver === "true" });
      await Promise.all([refresh(), cache.invalidateQueries({ queryKey: ["invoices"] }), cache.invalidateQueries({ queryKey: ["operational-invoice"] }), cache.invalidateQueries({ queryKey: ["invoice"] }), cache.invalidateQueries({ queryKey: ["assignable-drivers", rental.id] }), cache.invalidateQueries({ queryKey: ["handover", rental.id] })]);
      close();
    } catch (failure) { setError(validation.report(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <FormDialog title="Sửa yêu cầu thuê" busy={busy} onClose={close}>
    <ValidatedForm validation={validation} onSubmit={() => void save()} validate={() => draft.startTime && draft.endTime && new Date(draft.endTime) <= new Date(draft.startTime) ? { endTime: "Thời gian trả phải sau thời gian nhận xe." } : {}}>
      {vehicles.isPending ? <FormSkeleton label="Đang tải phương tiện..." /> : vehicles.error ? <p role="alert" className="text-sm text-danger">{operationalError(vehicles.error)} <button type="button" className="underline" onClick={() => void vehicles.refetch()}>Thử lại</button></p> : <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="rental-edit-vehicle" className="text-sm font-semibold">Phương tiện *</label><InlineSelect id="rental-edit-vehicle" name="vehicleId" required className={operationsInput} value={draft.vehicleId} onChange={(event) => setDraft({ ...draft, vehicleId: event.target.value })}><option value="">Chọn phương tiện</option>{vehicles.data?.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{[vehicle.brand, vehicle.model, vehicle.licensePlate].filter(Boolean).join(" · ") || "Phương tiện chưa có tên"}</option>)}</InlineSelect></div>
        <div><label htmlFor="rental-edit-start" className="text-sm font-semibold">Nhận xe *</label><InlineInput id="rental-edit-start" name="startTime" type="datetime-local" required className={operationsInput} value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} /></div>
        <div><label htmlFor="rental-edit-end" className="text-sm font-semibold">Trả xe *</label><InlineInput id="rental-edit-end" name="endTime" type="datetime-local" required className={operationsInput} value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} /></div>
        <div><label htmlFor="rental-edit-driver" className="text-sm font-semibold">Hình thức lái *</label><InlineSelect id="rental-edit-driver" name="hasDriver" required className={operationsInput} value={draft.hasDriver} onChange={(event) => setDraft({ ...draft, hasDriver: event.target.value })}><option value="false">Tự lái</option><option value="true">Có tài xế</option></InlineSelect></div>
      </fieldset>}
      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
      <FormDialogFooter><Button type="button" variant="secondary" disabled={busy} onClick={close}>Hủy</Button><Button type="submit" isLoading={busy} disabled={busy || vehicles.isPending || !!vehicles.error}>Lưu yêu cầu</Button></FormDialogFooter>
    </ValidatedForm>
  </FormDialog>;
}
