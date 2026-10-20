import React from "react";
import { getLicenseState } from "../license-utils";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { cn } from "@/lib/cn";

export interface LicenseBadgeProps {
  expiryDate?: string | null;
  className?: string;
  /** Giữ prop để không phá call site; glyph do AdminStatusBadge quyết định. */
  showIcon?: boolean;
}

export function LicenseBadge({ expiryDate, className }: LicenseBadgeProps) {
  const { state, label } = getLicenseState(expiryDate);
  const status = state === "valid" ? "approved" : state === "expiring" ? "expiring" : state === "expired" ? "expired" : "incomplete";
  const text = state === "valid" ? "Còn hạn" : state === "missing" ? "Chưa có" : label;

  return (
    <AdminStatusBadge domain="license" status={status}>
      <span className={cn(className)}>{text}</span>
    </AdminStatusBadge>
  );
}

export default LicenseBadge;
