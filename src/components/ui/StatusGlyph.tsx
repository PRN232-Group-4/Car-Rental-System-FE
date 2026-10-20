import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

/**
 * Glyph trạng thái dùng chung cho mọi cổng — cùng ngôn ngữ với Transit Desk (admin):
 * hình học đơn sắc thay cho pill màu.
 */
export function StatusGlyph({ tone, className = "" }: { tone: StatusTone; className?: string }) {
  if (tone === "success") {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block h-2 w-2 rotate-45 border border-td-ink bg-td-teal", className)}
      />
    );
  }
  if (tone === "info") {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block h-2 w-2 rotate-45 border border-td-ink bg-td-ink", className)}
      />
    );
  }
  if (tone === "warning") {
    return <span aria-hidden="true" className={cn("inline-block h-2 w-2 rounded-full bg-td-oxide", className)} />;
  }
  if (tone === "danger") {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block h-2 w-2 rotate-45 border border-td-oxide bg-td-oxide", className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-1.5 w-1.5 rounded-full border border-td-muted", className)}
    />
  );
}

export default StatusGlyph;
