"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import { useState } from "react";
import Image from "next/image";
import { InlineError, InlineInput, InlineSelect, InlineTextarea, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import RentalLookup from "./RentalLookup";
import { saveInspection, uploadInspectionImage, operationalError, operationsButton, operationsInput, operationsPanel } from "./api";
import type { OperationalRental } from "./api";
import TechnicianAssignmentForm from "./TechnicianAssignmentForm";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import InspectionDirectory, { InspectionWorkQueue } from "./InspectionDirectory";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";

const checkItems = ["Ngoại thất và hư hỏng", "Lốp, phanh và vận hành", "Đèn, còi và phụ kiện", "Nhiên liệu / pin"];

export default function RentalInspections() {
  const params = useSearchParams();
  return (
    <div className="space-y-6">
      <TransitFolio index="04" tag="INS" kicker="VẬN HÀNH · BIÊN BẢN TRẠM"
        title={<>Kiểm tra xe <em className="italic text-td-teal">trước / sau thuê.</em></>}
        description="Xem toàn bộ biên bản đã lập, các đơn cần kiểm tra và mở đơn để phân công kỹ thuật viên." />
      <InspectionDirectory />
      <InspectionWorkQueue />
      <section id="inspection-editor" className="scroll-mt-60" aria-label="Lập biên bản theo đơn thuê">
        <RentalLookup key={params.get("rentalId") ?? "lookup"} title="Mở đơn để lập biên bản">{(rental, refresh) => <div className="space-y-6"><TechnicianAssignmentForm rental={rental} refresh={refresh} /><InspectionForm rental={rental} refresh={refresh} /></div>}</RentalLookup>
      </section>
    </div>
  );
}

function InspectionForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [type, setType] = useState<"pre" | "post">(rental.status === "post_inspection" ? "post" : "pre");
  const cache = useQueryClient();
  const session = useOptionalSession();
  const [isOk, setIsOk] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [fuelBatteryLevel, setFuelBatteryLevel] = useState("");
  const [damageNotes, setDamageNotes] = useState("");
  const [checks, setChecks] = useState<Record<string, string>>({});
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploadError(""); validation.clear("imageUrls"); setUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) throw new Error(`Tệp ${file.name} không phải ảnh. Vui lòng chọn tệp ảnh.`);
        const url = await uploadInspectionImage(file);
        setImages((current) => [...current, { url, name: file.name }]);
      }
    } catch (failure) {
      const message = `Chưa tải được ảnh. ${operationalError(failure)}`;
      setUploadError(message); validation.setField("imageUrls", message);
    } finally { setUploading(false); }
  };
  const submit = async () => {
    if (busy || uploading) return;
    setBusy(true); setError(""); setSuccess("");
    const checklist = checkItems.filter((item) => checks[item]).map((item) => `${item}: ${checks[item] === "pass" ? "Đạt" : "Không đạt"}`).join("\n");
    const notes = [checklist, damageNotes.trim()].filter(Boolean).join("\n\n");
    try {
      await saveInspection(Number(rental.id), type, {
        staffId: null,
        isOk: isOk === "true",
        odometerKm: odometerKm ? Number(odometerKm) : null,
        fuelBatteryLevel: fuelBatteryLevel ? Number(fuelBatteryLevel) : null,
        damageNotes: notes || null,
        imageUrls: images.length ? JSON.stringify(images.map((image) => image.url)) : null,
      });
      void cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY });
      const message = `Đã lưu biên bản ${type === "pre" ? "trước" : "sau"} thuê cho đơn #${rental.id}.`;
      setSuccess(message);
      notifySuccess(message);
      await refresh();
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["inspection-directory"] }),
        cache.invalidateQueries({ queryKey: ["inspection-work-queue"] }),
        cache.invalidateQueries({ queryKey: ["operational-rentals-queue"] }),
      ]);
    } catch (failure) {
      const message = validation.report(failure, { file: "imageUrls", imageurl: "imageUrls" });
      const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError);
    } finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} validate={() => ({ imageUrls: uploadError || undefined })} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Lập biên bản kiểm tra · Đơn #{rental.id}</h2>
    <fieldset disabled={busy || uploading} className="space-y-5">
      <legend className="sr-only">Thông tin kiểm tra xe</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="inspection-type" className="text-sm font-semibold">Loại kiểm tra</label><InlineSelect id="inspection-type" name="inspectionType" className={operationsInput} value={type} onChange={(event) => { setType(event.target.value as "pre" | "post"); setSuccess(""); }}><option value="pre">Trước khi giao xe</option><option value="post">Sau khi nhận xe</option></InlineSelect></div>
        <div><label htmlFor="inspection-staff" className="text-sm font-semibold">Email nhân viên lập biên bản</label><InlineInput id="inspection-staff" name="inspectorEmail" readOnly className={operationsInput} value={session?.user?.email ?? ""} /><p className="mt-1 text-xs text-td-muted">Biên bản ghi nhận tài khoản đang đăng nhập. Phân công kỹ thuật viên tại mục phía trên.</p></div>
        <div><label htmlFor="inspection-odometer" className="text-sm font-semibold">Số km trên đồng hồ</label><InlineInput id="inspection-odometer" name="odometerKm" type="number" step="any" className={operationsInput} value={odometerKm} onChange={(event) => setOdometerKm(event.target.value)} /></div>
        <div><label htmlFor="inspection-fuel" className="text-sm font-semibold">Mức nhiên liệu / pin</label><InlineInput id="inspection-fuel" name="fuelBatteryLevel" type="number" step="any" className={operationsInput} value={fuelBatteryLevel} onChange={(event) => setFuelBatteryLevel(event.target.value)} /></div>
      </div>
      <div className="space-y-3"><h3 className="font-semibold">Checklist kiểm tra</h3>{checkItems.map((item, index) => <div key={item} className="grid items-start gap-2 sm:grid-cols-2"><label htmlFor={`inspection-check-${index}`} className="pt-4 text-sm">{item}</label><InlineSelect id={`inspection-check-${index}`} name={`check${index}`} className={operationsInput} value={checks[item] ?? ""} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.value }))}><option value="">Chưa ghi nhận</option><option value="pass">Đạt</option><option value="fail">Không đạt</option></InlineSelect></div>)}</div>
      <div><label htmlFor="inspection-notes" className="text-sm font-semibold">Mô tả hư hỏng / ghi chú</label><InlineTextarea id="inspection-notes" name="damageNotes" rows={4} className={operationsInput} value={damageNotes} onChange={(event) => setDamageNotes(event.target.value)} /></div>
      <div className="space-y-3"><h3 className="font-semibold">Ảnh kiểm tra và hư hỏng</h3>
        <button type="button" data-validation-field="imageUrls" aria-describedby={validation.errors.imageUrls ? "inspection-images-error" : undefined} onClick={() => document.getElementById("inspection-images")?.click()} className={`rounded border px-4 py-3 text-sm ${validation.errors.imageUrls ? "border-danger" : "border-td-rule"}`}>Chọn ảnh kiểm tra</button>
        <InlineInput id="inspection-images" name="imageUrls" type="file" accept="image/*" multiple showError={false} className="hidden" onChange={upload} />
        <InlineError name="imageUrls" inputId="inspection-images" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={`${image.url}-${index}`} className="space-y-2 rounded border border-td-rule p-2"><Image src={image.url} alt={image.name} width={240} height={160} unoptimized className="h-28 w-full rounded object-cover" /><p className="truncate text-xs">{image.name}</p><button type="button" className="text-xs text-danger underline" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Bỏ khỏi biên bản</button></div>)}</div>
      </div>
      <div><label htmlFor="inspection-result" className="text-sm font-semibold">Kết luận kiểm tra *</label><InlineSelect id="inspection-result" name="isOk" required className={operationsInput} value={isOk} onChange={(event) => setIsOk(event.target.value)}><option value="">Chọn kết luận</option><option value="true">Đạt</option><option value="false">Không đạt</option></InlineSelect></div>
    </fieldset>
    {uploading && <p role="status" className="text-sm">Đang tải ảnh lên máy chủ...</p>}{error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
    <button type="submit" disabled={busy || uploading} className={operationsButton}>{busy ? "Đang lưu biên bản..." : "Lưu biên bản kiểm tra"}</button>
  </ValidatedForm>;
}
