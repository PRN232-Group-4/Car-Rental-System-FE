import { formatAdminDateTime } from "@/lib/date-time";

export default function CancellationReason({ reason, cancelledAt }: { reason?: string | null; cancelledAt?: string | null }) {
  return <section aria-label="Lý do hủy đơn" className="space-y-2 border-l-2 border-td-oxide pl-4 text-sm">
    <h3 className="font-bold text-td-ink">Lý do hủy đơn</h3>
    <p className="whitespace-pre-wrap break-words text-td-ink">{reason?.trim() || "Chưa có lý do hủy được ghi nhận."}</p>
    {cancelledAt && <p className="text-xs text-td-muted">Thời gian hủy: {formatAdminDateTime(cancelledAt)}</p>}
  </section>;
}
