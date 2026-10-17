import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TripStatus } from "../types";

interface TripStatusBadgeProps {
  status: TripStatus;
  className?: string;
}

export function TripStatusBadge({ status, className }: TripStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <StatusBadge
          status="pending"
          label="Chờ nhận xe"
          className={className}
        />
      );
    case "pre_inspection":
      return (
        <StatusBadge
          status="draft"
          label="Kiểm tra giao xe"
          className={className}
        />
      );
    case "renting":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-primary-tint/40 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary ${
            className ?? ""
          }`}
          role="status"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span>Đang thuê</span>
        </span>
      );
    case "post_inspection":
      return (
        <StatusBadge
          status="draft"
          label="Kiểm tra trả xe"
          className={className}
        />
      );
    case "completed":
      return (
        <StatusBadge
          status="approved"
          label="Đã hoàn tất"
          className={className}
        />
      );
    case "cancelled":
      return (
        <StatusBadge
          status="rejected"
          label="Đã hủy"
          className={className}
        />
      );
    default:
      return <StatusBadge status="draft" label={status} className={className} />;
  }
}
