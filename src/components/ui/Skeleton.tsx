import type { ReactNode } from "react";
import styles from "./Skeleton.module.css";

/** Decorative placeholder. Put a named SkeletonBlock around standalone groups. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" data-skeleton className={`${styles.skeleton} ${className}`} />;
}

export function SkeletonBlock({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <div role="status" aria-live="polite" aria-label={label} className={className} data-skeleton-block>
    <span className="sr-only">{label}</span>
    {children}
  </div>;
}

export function SkeletonStat({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded-2xl border border-line bg-surface p-5 shadow-e1 ${className}`}>
    <Skeleton className="h-11 w-11 rounded-xl" />
    <Skeleton className="mt-5 h-4 w-24" />
    <Skeleton className="mt-2 h-7 w-32" />
  </div>;
}

export function FormSkeleton({ label = "Đang tải biểu mẫu...", fields = 6 }: { label?: string; fields?: number }) {
  return <SkeletonBlock label={label} className="space-y-5">
    <Skeleton className="h-6 w-48 max-w-full" />
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: fields }, (_, index) => <div key={index} className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>)}
    </div>
  </SkeletonBlock>;
}
