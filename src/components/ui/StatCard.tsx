import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface StatTrend {
  value: string | number;
  direction: "up" | "down" | "neutral";
  label?: string;
}

export interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  trend?: StatTrend;
  subtext?: ReactNode;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  subtext,
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "border-t border-td-rule pt-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded border border-td-rule text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums",
              trend.direction === "up" && "text-success",
              trend.direction === "down" && "text-danger",
              trend.direction === "neutral" && "text-td-muted",
            )}
          >
            {trend.direction === "up" && (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {trend.direction === "down" && (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="font-sans font-normal text-td-muted">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-td-muted">{label}</p>
      <p className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink tabular-nums">
        {value}
      </p>

      {subtext && <div className="mt-2 text-xs text-td-muted">{subtext}</div>}
    </article>
  );
}

export default StatCard;
