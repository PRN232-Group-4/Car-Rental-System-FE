"use client";

import { useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { localInputToUtcIso, toLocalInputValue } from "@/lib/time";
import { formatAdminDateTime } from "@/lib/date-time";
import { uploadRentalContract } from "../api";
import { SIGNED_CONTRACT_ACCEPT, signedContractDocumentHref, signedContractFileError } from "../signed-contract";
import type { RentalContract } from "../types";

export default function SignedContractUpload({ rental, refresh }: { rental: RentalContract; refresh?: () => Promise<unknown> }) {
  const cache = useQueryClient();
  const id = useId();
  const lock = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [signedAt, setSignedAt] = useState(rental.signedAt ? toLocalInputValue(rental.signedAt) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const validation = useInlineValidation();
  const href = signedContractDocumentHref(rental);
  const canUpload = ["pending", "pre_inspection"].includes(rental.status);
  const submit = async () => {
    if (lock.current || !file || !canUpload) return;
    lock.current = true;
    setBusy(true); setError(""); setSaved(false);
    try {
      const updated = await uploadRentalContract(rental.id, file, localInputToUtcIso(signedAt));
      cache.setQueryData(["rental-contract", String(rental.id)], updated);
      setSaved(true);
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["operational-rental"] }),
        cache.invalidateQueries({ queryKey: ["operational-rental-detail"] }),
        cache.invalidateQueries({ queryKey: ["customer-rental"] }),
        cache.invalidateQueries({ queryKey: ["admin-rentals"] }),
        refresh?.(),
      ]);
    } catch (failure) {
      const message = validation.report(failure, { contractfile: "file", signedat: "signedAt" });
      setError(failure instanceof TypeError ? "Không thể kết nối máy chủ. File và ngày giờ ký vẫn được giữ, vui lòng thử lại." : message);
    } finally { lock.current = false; setBusy(false); }
  };
  return <section className="min-w-0 space-y-3" aria-label="Hợp đồng đã ký">
    {href && <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-primary underline">{rental.hasUploadedContract ? "Tải hợp đồng đã ký" : "Mở tài liệu hợp đồng"}</a>}
    {rental.hasUploadedContract ? <p className="text-sm text-td-muted">Đã tải hợp đồng đã ký lên hệ thống{rental.signedAt ? ` · Ký lúc ${formatAdminDateTime(rental.signedAt)}` : ""}.</p> : <p className="text-sm text-td-muted">Thuê dài hạn cần tải file hoặc ảnh hợp đồng đã ký trước khi bàn giao xe.</p>}
    {canUpload ? <ValidatedForm validation={validation} validate={() => ({ file: signedContractFileError(file), signedAt: !Number.isFinite(new Date(signedAt).getTime()) ? "Vui lòng chọn ngày giờ ký hợp đồng hợp lệ." : undefined })} onSubmit={submit} className="space-y-3">
      <fieldset disabled={busy} className="min-w-0 space-y-3">
        <legend className="text-sm font-semibold">{rental.hasUploadedContract ? "Thay file hợp đồng đã ký" : "Tải hợp đồng đã ký"}</legend>
        <div><label htmlFor={`${id}-file`} className="text-sm font-semibold">File hoặc ảnh hợp đồng đã ký (bắt buộc)</label><InlineInput id={`${id}-file`} name="file" type="file" accept={SIGNED_CONTRACT_ACCEPT} aria-describedby={`${id}-file-help`} className="admin-input mt-2 min-w-0 w-full" onChange={event => { const selected = event.target.files?.[0] ?? null; setFile(selected); setSaved(false); validation.setField("file", selected ? signedContractFileError(selected) ?? "" : ""); }} /><p id={`${id}-file-help`} className="mt-1 text-xs text-td-muted">PDF, JPEG, PNG hoặc WebP · Tối đa 10 MB. Chụp rõ nội dung và chữ ký.</p>{file && <p className="mt-1 break-words text-xs text-td-muted">Đã chọn: {file.name}</p>}</div>
        <div><label htmlFor={`${id}-signed-at`} className="text-sm font-semibold">Ngày giờ ký (bắt buộc)</label><InlineInput id={`${id}-signed-at`} name="signedAt" type="datetime-local" required className="admin-input mt-2 w-full" value={signedAt} onChange={event => { setSignedAt(event.target.value); setSaved(false); }} /></div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {saved && <p role="status" className="text-sm text-success">Đã lưu hợp đồng đã ký.</p>}
        <button type="submit" disabled={busy} className="min-h-11 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang tải hợp đồng..." : "Lưu hợp đồng đã ký"}</button>
      </fieldset>
    </ValidatedForm> : <p className="text-sm text-td-muted">Hồ sơ đã khóa chỉnh sửa hợp đồng khi bắt đầu thuê hoặc kết thúc đơn.</p>}
  </section>;
}
