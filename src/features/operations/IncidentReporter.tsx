"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { InlineError, InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import RentalLookup from "./RentalLookup";
import OperationFields from "./OperationFields";
import { getReports, sendReport, uploadReportImage } from "./extended-api";
import { operationalError, operationsButton, operationsPanel } from "./api";

export default function IncidentReporter() {
  return <RentalLookup title="Báo cáo sự cố" staffLinks={false}>{(rental) => <ReportForm rentalId={Number(rental.id)} />}</RentalLookup>;
}
function ReportForm({ rentalId }: { rentalId: number }) {
  const [values, setValues] = useState({ type: "", description: "" });
  const [images, setImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const reports = useQuery({ queryKey: ["rental-reports", rentalId], queryFn: () => getReports(rentalId), retry: false });
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []); event.target.value = "";
    if (!files.length) return; setUploading(true); setUploadError(""); validation.clear("imageUrls");
    try { for (const file of files) { if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn tệp ảnh."); const url = await uploadReportImage(file); setImages((current) => [...current, url]); } }
    catch (failure) { const message = `Chưa tải được ảnh. ${operationalError(failure)}`; setUploadError(message); validation.setField("imageUrls", message); }
    finally { setUploading(false); }
  };
  const submit = async () => {
    if (busy || uploading) return; setBusy(true); setError(""); setSuccess("");
    try { await sendReport(rentalId, { type: values.type.trim() || null, description: values.description.trim() || null, imageUrls: images.length ? JSON.stringify(images) : null }); setSuccess("Đã gửi báo cáo sự cố. Nhân viên sẽ tiếp nhận xử lý."); setValues({ type: "", description: "" }); setImages([]); void reports.refetch(); }
    catch (failure) { const message = validation.report(failure, { file: "imageUrls", imageurl: "imageUrls" }); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6"><ValidatedForm validation={validation} validate={() => ({ imageUrls: uploadError || undefined })} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Gửi sự cố cho đơn #{rentalId}</h2>
    <fieldset disabled={busy || uploading} className="space-y-4"><OperationFields prefix="incident" fields={[{ name: "type", label: "Loại sự cố" }, { name: "description", label: "Mô tả sự cố", type: "textarea" }]} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
      <div><button type="button" data-validation-field="imageUrls" aria-describedby={validation.errors.imageUrls ? "incident-images-error" : undefined} onClick={() => document.getElementById("incident-images")?.click()} className={`rounded-xl border px-4 py-3 text-sm ${validation.errors.imageUrls ? "border-red-500" : "border-border"}`}>Thêm ảnh sự cố</button><InlineInput type="file" id="incident-images" name="imageUrls" accept="image/*" multiple showError={false} onChange={upload} className="hidden" /><InlineError name="imageUrls" inputId="incident-images" /></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((url, index) => <div key={`${url}-${index}`}><Image src={url} alt={`Ảnh sự cố ${index + 1}`} width={240} height={160} unoptimized className="h-28 w-full rounded-lg object-cover" /><button type="button" className="mt-2 text-sm text-red-700 underline" onClick={() => setImages((current) => current.filter((_, i) => i !== index))}>Bỏ ảnh</button></div>)}</div>
    </fieldset>
    {uploading && <p role="status">Đang tải ảnh...</p>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}<button type="submit" disabled={busy || uploading} className={operationsButton}>{busy ? "Đang gửi..." : "Gửi báo cáo sự cố"}</button>
  </ValidatedForm>
    <section className={operationsPanel}><h2 className="text-lg font-bold">Báo cáo của đơn thuê</h2>{reports.isPending && <p role="status">Đang tải báo cáo...</p>}{reports.error && <p role="alert" className="text-sm text-red-700">{operationalError(reports.error)}</p>}{reports.data?.map((item) => <article key={item.id} className="space-y-2 border-t border-border pt-4"><p className="text-sm font-semibold">#{item.id} — {item.type ?? "Sự cố"} — {item.status ?? "Chưa cập nhật trạng thái"}</p><p className="whitespace-pre-wrap text-sm">{item.description}</p></article>)}{reports.data?.length === 0 && <p className="text-sm text-ink-muted">Chưa có báo cáo cho đơn này.</p>}</section>
  </div>;
}
