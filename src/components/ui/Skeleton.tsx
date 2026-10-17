import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Skeleton.module.css";

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-skeleton
      className={cn("animate-pulse rounded-lg bg-sunken", styles?.skeleton, className)}
      {...props}
    />
  );
}

export function SkeletonBlock({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={className}
      data-skeleton-block
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function FormSkeleton({
  label = "Đang tải biểu mẫu...",
  fields = 6,
}: {
  label?: string;
  fields?: number;
}) {
  return (
    <SkeletonBlock label={label} className="space-y-5">
      <Skeleton className="h-6 w-48 max-w-full" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </SkeletonBlock>
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-line bg-surface p-5 shadow-e1",
        className,
      )}
    >
      <Skeleton className="h-11 w-11 rounded-xl" />
      <Skeleton className="mt-5 h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-32" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-e1",
        className,
      )}
    >
      <div className="flex border-b border-line bg-sunken px-4 py-3 sm:px-6">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center px-4 py-4 sm:px-6">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="flex-1 px-2">
                <Skeleton
                  className={cn("h-4", c === 0 ? "w-32" : "w-20")}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
