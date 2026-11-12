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
  return <div aria-hidden="true" className={`border-t border-td-rule pt-4 ${className}`}>
    <Skeleton className="h-9 w-9" />
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

/**
 * Khung xương một card phương tiện/dịch vụ: ảnh, dòng tiêu đề, dòng phụ và vùng hành động.
 * Dùng bên trong `CardGridSkeleton` hoặc khi cần một card đơn lẻ.
 */
export function CardSkeleton({
  mediaClassName = "h-56 w-full rounded-none",
  lines = 3,
  containerClassName = "border border-td-rule bg-td-white",
}: { mediaClassName?: string; lines?: number; containerClassName?: string }) {
  return <div aria-hidden="true" data-skeleton-card className={`overflow-hidden ${containerClassName}`}>
    <Skeleton className={mediaClassName} />
    <div className="space-y-3 p-5">
      {Array.from({ length: Math.max(1, lines) }, (_, index) => <Skeleton key={index} className={index === 0 ? "h-5 w-2/3" : index === 1 ? "h-4 w-full" : "h-4 w-5/6"} />)}
    </div>
  </div>;
}

/**
 * Lưới card đang tải, giữ đúng số cột của lưới thật để không giật layout khi dữ liệu về.
 * `label` được đọc bởi trình đọc màn hình (role=status), phần xương là trang trí.
 */
export function CardGridSkeleton({
  label = "Đang tải danh sách...",
  count = 3,
  className = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  mediaClassName,
  lines,
  containerClassName,
}: {
  label?: string;
  count?: number;
  className?: string;
  mediaClassName?: string;
  lines?: number;
  containerClassName?: string;
}) {
  return <SkeletonBlock label={label} className={className}>
    {Array.from({ length: Math.max(1, count) }, (_, index) => (
      <CardSkeleton key={index} mediaClassName={mediaClassName} lines={lines} containerClassName={containerClassName} />
    ))}
  </SkeletonBlock>;
}

/**
 * Khung xương bảng dữ liệu dùng ngoài `tbody` (ví dụ khi cả khối bảng đang tải).
 * Bên trong `tbody` dùng `AdminTableSkeleton` để giữ tiêu đề cột.
 */
export function TableSkeleton({
  label = "Đang tải bảng dữ liệu...",
  columns = 4,
  rows = 5,
  className = "space-y-3",
}: { label?: string; columns?: number; rows?: number; className?: string }) {
  return <SkeletonBlock label={label} className={className}>
    <div className="flex items-center gap-4">
      {Array.from({ length: Math.max(1, columns) }, (_, index) => <Skeleton key={index} className="h-3 flex-1" />)}
    </div>
    {Array.from({ length: Math.max(1, rows) }, (_, row) => <div key={row} className="flex items-center gap-4 border-t border-td-rule pt-3">
      {Array.from({ length: Math.max(1, columns) }, (_, column) => <Skeleton key={column} className={column === 0 ? "h-4 w-40 max-w-full" : "h-4 flex-1"} />)}
    </div>)}
  </SkeletonBlock>;
}
