import { Check } from "lucide-react";
import { getRentalProgress } from "../rental-progress";
import styles from "./RentalStatusTracker.module.css";

export default function RentalStatusTracker({ status }: { status: string | null | undefined }) {
  const progress = getRentalProgress(status);
  return <section aria-label="Tiến trình thuê xe" className={styles.tracker}>
    <p className="text-sm font-semibold text-ink">Tiến trình thuê xe</p>
    <ol aria-label="Các bước thuê xe" className={styles.steps}>
      {progress.steps.map((step) => <li key={step.status} className={styles.step} data-state={step.state} aria-current={step.state === "current" ? "step" : undefined}>
        <span aria-hidden="true" className={styles.dot}>{step.state === "complete" && <Check size={14} strokeWidth={3} />}</span>
        <span className={styles.label}>{step.label}</span>
        <span className="sr-only">{step.state === "complete" ? " — Đã qua" : step.state === "current" ? step.status === "completed" ? " — Đã hoàn tất" : " — Hiện tại" : step.state === "upcoming" ? " — Chưa đến" : step.state === "stopped" ? " — Đã dừng" : " — Chưa có dữ liệu"}</span>
      </li>)}
    </ol>
    {progress.cancelled ? <p className="text-sm text-danger">Yêu cầu / đơn thuê đã hủy. Tiến trình đã dừng.</p>
      : !progress.known ? <p className="text-sm text-ink-3">Chưa có thông tin tiến trình cho trạng thái này.</p>
        : <p className="text-xs text-ink-3">Tiến trình thể hiện tình trạng thuê xe. Thông tin thanh toán và mã đơn chính thức được hiển thị riêng.</p>}
  </section>;
}
