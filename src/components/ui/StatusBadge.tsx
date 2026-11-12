import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StatusGlyph, type StatusTone } from "./StatusGlyph";
import { statusPillClasses, statusToneClasses } from "./status-tone";

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

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  icon?: React.ElementType;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
}

/**
 * Badge trạng thái pill màu nền (cặp màu theo A2), glyph + nhãn, ánh xạ tone
 * tập trung ở `status-tone.ts`. `icon` chỉ giữ để tương thích call site cũ.
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
        statusPillClasses,
        size === "md" ? "text-xs" : "text-[11px]",
        statusToneClasses[config.tone],
        className,
      )}
    >
      <StatusGlyph tone={config.tone} className={size === "md" ? "h-2 w-2" : "h-1.5 w-1.5"} />
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
