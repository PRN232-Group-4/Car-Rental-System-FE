import type { ReactNode } from "react";
import { getAdminStatusTone } from "./status-rules";
import type { AdminStatusDomain } from "./status-rules";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { statusPillClasses, statusToneClasses } from "@/components/ui/status-tone";

/**
 * Badge trạng thái pill màu nền dùng chung bảng ánh xạ `status-rules.ts`
 * để mọi trang admin đọc trạng thái giống nhau.
 */
export function AdminStatusBadge({
  domain,
  status,
  children,
}: {
  domain: AdminStatusDomain;
  status: string | null | undefined;
  children: ReactNode;
}) {
  const tone = getAdminStatusTone(domain, status);
  return (
    <span
      data-status-tone={tone}
      className={`${statusPillClasses} text-[11px] ${statusToneClasses[tone]}`}
    >
      <StatusGlyph tone={tone} />
      {children}
    </span>
  );
}
