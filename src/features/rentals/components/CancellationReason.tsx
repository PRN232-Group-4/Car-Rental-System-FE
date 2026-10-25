import { formatAdminDateTime } from "@/lib/date-time";

export interface CancellationReasonProps {
  reason?: string | null;
  cancelledAt?: string | null;
  /** Tiêu đề khối; mặc định dành cho đơn bị hủy. */
  title?: string;
  /** Nhãn thời gian; mặc định dành cho đơn bị hủy. */
  timestampLabel?: string;
  /** Nội dung hiển thị khi chưa có lý do. */
  emptyMessage?: string;
}

export default function CancellationReason({
  reason,
  cancelledAt,
  title = "Lý do hủy đơn",
  timestampLabel = "Thời gian hủy",
  emptyMessage = "Chưa có lý do hủy được ghi nhận.",
}: CancellationReasonProps) {
  return <section aria-label={title} className="space-y-2 border-l-2 border-td-oxide pl-4 text-sm">
    <h3 className="font-bold text-td-ink">{title}</h3>
    <p className="whitespace-pre-wrap break-words text-td-ink">{reason?.trim() || emptyMessage}</p>
    {cancelledAt && <p className="text-xs text-td-muted">{timestampLabel}: {formatAdminDateTime(cancelledAt)}</p>}
  </section>;
}
