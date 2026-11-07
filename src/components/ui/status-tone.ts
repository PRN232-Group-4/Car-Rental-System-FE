import type { StatusTone } from "./StatusGlyph";

/**
 * Nguồn duy nhất ánh xạ tone trạng thái → cặp màu nền/chữ (pill badge).
 * Dùng chung cho `StatusBadge` (mọi cổng) và `AdminStatusBadge` (admin)
 * qua re-export `adminStatusToneClasses` trong `status-rules.ts`.
 * Token màu được định nghĩa trong `globals.css` (@theme), có cả light/dark.
 */
export const statusToneClasses: Record<StatusTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-sunken text-ink-2",
};

/** Class khung badge vuông dùng chung, padding nhỏ, chữ nhỏ. */
export const statusPillClasses =
  "inline-flex w-fit items-center gap-1.5 whitespace-nowrap px-2.5 py-0.5 font-mono uppercase tracking-wide";
