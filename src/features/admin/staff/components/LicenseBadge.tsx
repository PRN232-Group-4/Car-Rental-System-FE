import React from "react";
import { getLicenseState } from "../license-utils";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LicenseBadgeProps {
  expiryDate?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function LicenseBadge({
  expiryDate,
  className,
  showIcon = true,
}: LicenseBadgeProps) {
  const { state, label, daysRemaining } = getLicenseState(expiryDate);

  switch (state) {
    case "valid":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-bg/30 px-2.5 py-0.5 font-sans text-xs font-bold text-success",
            className
          )}
          title={`GPLX còn hạn (${daysRemaining} ngày)`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Còn hạn</span>
        </span>
      );

    case "expiring":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning-bg/40 px-2.5 py-0.5 font-sans text-xs font-bold text-warning",
            className
          )}
          title={label}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{label}</span>
        </span>
      );

    case "expired":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger-bg/30 px-2.5 py-0.5 font-sans text-xs font-bold text-danger",
            className
          )}
          title={label}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          <span>{label}</span>
        </span>
      );

    case "missing":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-line bg-sunken px-2.5 py-0.5 font-sans text-xs font-medium text-ink-3",
            className
          )}
          title="Chưa cập nhật giấy phép lái xe"
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5" />}
          <span>Chưa có</span>
        </span>
      );
  }
}
