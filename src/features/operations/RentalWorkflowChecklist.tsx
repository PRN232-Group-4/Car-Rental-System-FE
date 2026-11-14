"use client";

import { useId, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { rentalTransitionBlocker, type OperationalRental } from "./api";

const NEXT_STATUS: Record<string, string> = {
  pending: "pre_inspection",
  pre_inspection: "renting",
  renting: "post_inspection",
  post_inspection: "completed",
};

export function useRentalWorkflowChecklist(rental: OperationalRental | null, paymentBlocker: string | null) {
  // Confirmations belong to one rental, vehicle and stage; a refresh of the same
  // stage keeps them, while another stage or dossier starts unchecked.
  const scope = rental ? `${rental.id}:${rental.status}:${rental.vehicleId}:${rental.hasDriver}:${rental.isSubscription}` : "";
  const [confirmed, setConfirmed] = useState<{ scope: string; keys: string[] }>({ scope: "", keys: [] });
  const keys = confirmed.scope === scope ? confirmed.keys : [];
  const items: { key: string; label: string; checked: boolean; automatic?: boolean }[] = [];
  const addConfirmation = (key: string, label: string) => items.push({ key, label, checked: keys.includes(key) });
  switch (rental?.status) {
    case "pending":
      addConfirmation("request", "Đã đối chiếu yêu cầu, phương tiện và thời gian thuê");
      break;
    case "pre_inspection":
      items.push({ key: "inspection", label: "Kiểm tra trước thuê đã đạt", checked: rental.hasPassingPreInspection === true, automatic: true });
      if (rental.rentalType === "longterm") items.push({ key: "contract", label: "Đã tải hợp đồng dài hạn có chữ ký", checked: rental.hasUploadedContract === true, automatic: true });
      if (!rental.isSubscription) items.push({ key: "payment", label: "Hóa đơn đã thanh toán đủ", checked: !paymentBlocker, automatic: true });
      if (rental.hasDriver) addConfirmation("driver", "Đã đối chiếu phân công tài xế cho xe của đơn");
      addConfirmation("handover", "Đã đối chiếu hồ sơ khách và bàn giao xe, chìa khóa");
      break;
    case "renting":
      addConfirmation("returned", "Đã nhận lại xe và chìa khóa từ khách");
      addConfirmation("return-details", "Đã đối chiếu thời điểm trả và hiện trạng xe");
      break;
    case "post_inspection":
      items.push({ key: "inspection", label: "Đã có biên bản kiểm tra sau thuê", checked: rental.hasPostInspection === true, automatic: true });
      addConfirmation("settlement", "Đã đối soát phụ phí và nghĩa vụ thanh toán trong hồ sơ");
      break;
  }
  const nextStatus = rental ? NEXT_STATUS[rental.status] : undefined;
  const blocker = rental && nextStatus ? rentalTransitionBlocker(rental, nextStatus) || (nextStatus === "renting" ? paymentBlocker : null) : null;
  return {
    items,
    nextStatus,
    ready: items.length > 0 && items.every(item => item.checked) && !blocker,
    blocker,
    toggle: (key: string) => setConfirmed({ scope, keys: keys.includes(key) ? keys.filter(item => item !== key) : [...keys, key] }),
  };
}

/** Trạng thái hiển thị của điều kiện hệ thống tự xác minh (không phải checkbox bấm được). */
const STATUS_TEXT: Record<string, [string, string]> = {
  inspection: ["Đã đạt", "Chưa đạt"],
  payment: ["Đã thanh toán", "Chưa thanh toán"],
  contract: ["Đã tải", "Chưa tải"],
};
const STATUS_TITLE: Record<string, string> = {
  "Kiểm tra trước thuê đã đạt": "Kiểm tra trước thuê",
  "Hóa đơn đã thanh toán đủ": "Hóa đơn thuê xe",
  "Đã tải hợp đồng dài hạn có chữ ký": "Hợp đồng dài hạn có chữ ký",
};

export default function RentalWorkflowChecklist({ checklist, disabled = false, controls = {}, include, legend = "Điều kiện chuyển bước", showHint = true, statusLabels = false }: {
  checklist: ReturnType<typeof useRentalWorkflowChecklist>;
  disabled?: boolean;
  controls?: Partial<Record<"inspection" | "payment" | "contract", ReactNode>>;
  /** Chỉ hiển thị các điều kiện có key trong danh sách (dùng khi chia điều kiện theo khối). */
  include?: string[];
  legend?: string;
  showHint?: boolean;
  /** Điều kiện tự động hiển thị dạng nhãn trạng thái thay vì checkbox bị khóa. */
  statusLabels?: boolean;
}) {
  const id = useId();
  const items = include ? checklist.items.filter(item => include.includes(item.key)) : checklist.items;
  if (!items.length) return null;
  return <fieldset className="min-w-0 space-y-2" disabled={disabled} aria-describedby={showHint ? `${id}-hint` : undefined}>
    <legend className="mb-2 text-xs font-bold text-td-ink">{legend}</legend>
    {showHint && <p id={`${id}-hint`} className="text-xs text-td-muted">Đánh dấu các việc đã thực hiện. Kiểm tra, hợp đồng và thanh toán được cập nhật từ hệ thống.</p>}
    {items.map(item => <div key={item.key} data-workflow-condition={item.key} className="min-w-0 space-y-3 border-b border-td-rule py-2">
      {statusLabels && item.automatic ? <div role="status" className="flex min-h-10 items-center justify-between gap-3 text-[13px] text-td-ink">
        <span className="min-w-0 font-semibold">{STATUS_TITLE[item.label] ?? item.label}</span>
        <span className={`inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 text-xs font-bold ${item.checked ? "border-success/40 bg-success-bg text-success" : "border-danger/40 bg-danger-bg text-danger"}`}>
          {item.checked ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <XCircle className="h-3.5 w-3.5" aria-hidden="true" />}
          {(STATUS_TEXT[item.key] ?? ["Đã xác minh", "Chưa xác minh"])[item.checked ? 0 : 1]}
        </span>
      </div> : <label className="flex min-h-11 cursor-pointer items-start gap-2 text-[13px] text-td-ink">
        <input type="checkbox" checked={item.checked} disabled={disabled || item.automatic} onChange={() => checklist.toggle(item.key)} className="mt-0.5 h-4 w-4 shrink-0 accent-td-oxide" />
        <span className="min-w-0">{item.label}{item.automatic && <span className="mt-1 block text-xs text-td-muted">{item.checked ? "Đã xác minh từ hệ thống" : "Chờ dữ liệu hệ thống"}</span>}</span>
      </label>}
      {item.key === "inspection" || item.key === "payment" || item.key === "contract" ? controls[item.key] : null}
    </div>)}
  </fieldset>;
}
