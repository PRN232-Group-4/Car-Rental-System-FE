import type { ReactNode } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  Wrench,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

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
  className: string;
  icon: LucideIcon;
}

const statusDictionary: Record<string, StatusConfig> = {
  // Vehicle / Catalog statuses
  available: {
    label: "Sẵn sàng",
    className: "bg-success-bg text-success",
    icon: CheckCircle2,
  },
  rented: {
    label: "Đang thuê",
    className: "bg-info-bg text-info",
    icon: Clock,
  },
  maintenance: {
    label: "Bảo dưỡng",
    className: "bg-warning-bg text-warning",
    icon: Wrench,
  },
  unavailable: {
    label: "Tạm ngưng",
    className: "bg-sunken text-ink-3",
    icon: XCircle,
  },

  // Directory / Account / Generic statuses
  active: {
    label: "Đang hoạt động",
    className: "bg-success-bg text-success",
    icon: CheckCircle2,
  },
  inactive: {
    label: "Tạm ngưng",
    className: "bg-sunken text-ink-3",
    icon: XCircle,
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-warning-bg text-warning",
    icon: Hourglass,
  },
  reserved: {
    label: "Đã đặt",
    className: "bg-primary-tint text-primary",
    icon: CalendarCheck,
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-success-bg text-success",
    icon: Check,
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-danger-bg text-danger",
    icon: AlertTriangle,
  },
};

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
}

export function StatusBadge({
  status,
  label,
  icon: CustomIcon,
  size = "sm",
  className,
  children,
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase();
  const config = statusDictionary[normalizedKey] ?? {
    label: status,
    className: "bg-sunken text-ink-3",
    icon: Clock,
  };

  const IconComponent = CustomIcon ?? config.icon;
  const displayLabel = children ?? label ?? config.label;

  const sizeClasses =
    size === "md"
      ? "px-3 py-1 text-xs gap-1.5"
      : "px-2.5 py-0.5 text-xs gap-1";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold whitespace-nowrap",
        config.className,
        sizeClasses,
        className,
      )}
    >
      <IconComponent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
