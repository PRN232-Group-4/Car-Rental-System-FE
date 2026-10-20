import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StatusGlyph, type StatusTone } from "./StatusGlyph";

export type StatusType =
  | "available"
  | "rented"
  | "maintenance"
  | "unavailable"
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "cancelled"
  | "reserved"
  | string;

interface StatusConfig {
  label: string;
  tone: StatusTone;
}

const statusDictionary: Record<string, StatusConfig> = {
  // Vehicle / Catalog statuses
  available: { label: "Sẵn sàng", tone: "success" },
  rented: { label: "Đang thuê", tone: "info" },
  maintenance: { label: "Bảo dưỡng", tone: "warning" },
  unavailable: { label: "Tạm ngưng", tone: "neutral" },

  // Directory / Account / Generic statuses
  active: { label: "Đang hoạt động", tone: "success" },
  inactive: { label: "Tạm ngưng", tone: "neutral" },
  pending: { label: "Chờ duyệt", tone: "warning" },
  reserved: { label: "Đã đặt", tone: "info" },
  completed: { label: "Hoàn thành", tone: "success" },
  cancelled: { label: "Đã hủy", tone: "danger" },
  draft: { label: "Nháp", tone: "neutral" },
  published: { label: "Công khai", tone: "success" },
  expired: { label: "Hết hạn", tone: "danger" },
  approved: { label: "Đã duyệt", tone: "success" },
  rejected: { label: "Từ chối", tone: "danger" },
};

const toneClass: Record<StatusTone, string> = {
  success: "text-td-ink font-semibold",
  info: "text-td-ink font-semibold",
  warning: "text-td-oxide font-bold",
  danger: "text-td-oxide font-bold",
  neutral: "text-td-muted",
};

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  icon?: React.ElementType;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
}

/**
 * Trạng thái hiển thị kiểu Transit Desk: glyph + nhãn mono viết hoa.
 * `icon` chỉ giữ để tương thích call site cũ, không render nữa.
 */
export function StatusBadge({
  status,
  label,
  size = "sm",
  className,
  children,
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase();
  const config = statusDictionary[normalizedKey] ?? { label: status, tone: "neutral" as StatusTone };
  const displayLabel = children ?? label ?? config.label;

  return (
    <span
      data-status-tone={config.tone}
      className={cn(
        "inline-flex w-fit items-center gap-2 whitespace-nowrap font-mono uppercase tracking-wide",
        size === "md" ? "text-[11px]" : "text-[10px]",
        toneClass[config.tone],
        className,
      )}
    >
      <StatusGlyph tone={config.tone} className={size === "md" ? "h-2 w-2" : "h-1.5 w-1.5"} />
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
