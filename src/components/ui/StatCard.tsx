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
        "rounded-2xl border border-line bg-surface p-5 shadow-e1",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold font-mono tabular-nums",
              trend.direction === "up" && "bg-success-bg text-success",
              trend.direction === "down" && "bg-danger-bg text-danger",
              trend.direction === "neutral" && "bg-sunken text-ink-3",
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
              <span className="font-sans font-normal text-ink-3">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-ink-3">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-ink tabular-nums">
        {value}
      </p>

      {subtext && <div className="mt-2 text-xs text-ink-3">{subtext}</div>}
    </article>
  );
}

export default StatCard;
