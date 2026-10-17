import { CircleCheck, CircleDashed, CircleX, Clock3, Info } from "lucide-react";
import type { ReactNode } from "react";
import { adminStatusToneClasses, getAdminStatusTone } from "./status-rules";
import type { AdminStatusDomain } from "./status-rules";

const icons = { success: CircleCheck, warning: Clock3, danger: CircleX, info: Info, neutral: CircleDashed };

export function AdminStatusBadge({ domain, status, children }: {
  domain: AdminStatusDomain;
  status: string | null | undefined;
  children: ReactNode;
}) {
  const tone = getAdminStatusTone(domain, status);
  const Icon = icons[tone];
  return (
    <span data-status-tone={tone} className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${adminStatusToneClasses[tone]}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}
