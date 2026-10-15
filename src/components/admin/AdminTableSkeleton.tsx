import { Skeleton } from "@/components/ui/Skeleton";

/** Render inside tbody while loading; retain table headings and column structure. */
export function AdminTableSkeleton({ columns, rows = 5, label = "Đang tải danh sách..." }: { columns: number; rows?: number; label?: string }) {
  return <>
    <tr className="sr-only"><td colSpan={columns}><span role="status" aria-live="polite">{label}</span></td></tr>
    {Array.from({ length: rows }, (_, row) => <tr key={row} aria-hidden="true" data-skeleton-row>
      {Array.from({ length: columns }, (_, column) => <td key={column}>
        <Skeleton className={column === 0 ? "h-4 w-28 max-w-full" : "h-4 w-20 max-w-full"} />
      </td>)}
    </tr>)}
  </>;
}
