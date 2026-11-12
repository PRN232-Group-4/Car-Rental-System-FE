import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  suggestions?: string[];
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  suggestions,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center sm:p-12",
        className,
      )}
    >
      <Icon className="h-6 w-6 text-td-muted" strokeWidth={1.5} aria-hidden="true" />
      <h3 className="mt-3 text-sm font-bold text-td-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-td-muted">{description}</p>
      )}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 border border-td-rule p-3.5 text-left text-xs text-td-ink">
          <p className="font-semibold">Hãy thử:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-td-muted">
            {suggestions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
