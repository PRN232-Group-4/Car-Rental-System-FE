"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  caption: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  caption,
  loading = false,
  emptyTitle = "Không có dữ liệu",
  emptyDescription,
  emptyAction,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  manualSorting = false,
  onRowClick,
  className,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting = externalSorting ?? internalSorting;
  const onSortingChange = externalOnSortingChange ?? setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange,
    manualSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
  });

  return (
    <div
      className={cn(
        "w-full border-t border-td-ink",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px] text-td-ink">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-td-ink text-xs font-semibold text-td-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  const ariaSort =
                    isSorted === "asc"
                      ? "ascending"
                      : isSorted === "desc"
                        ? "descending"
                        : canSort
                          ? "none"
                          : undefined;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cn(
                        "px-4 py-2.5 whitespace-nowrap first:pl-2 last:pr-2",
                        canSort && "select-none",
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-td-muted transition hover:text-td-ink focus:outline-none"
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          <span className="text-td-muted transition group-hover:text-td-ink">
                            {isSorted === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-td-oxide" />
                            ) : isSorted === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5 text-td-oxide" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                            )}
                          </span>
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-td-rule">
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`loading-row-${rowIndex}`}>
                  {columns.map((_, colIndex) => (
                    <td
                      key={`loading-cell-${colIndex}`}
                      className="px-4 py-3 first:pl-2 last:pr-2"
                    >
                      <Skeleton
                        className={cn(
                          "h-4",
                          colIndex === 0 ? "w-32" : "w-20",
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    "transition-colors hover:bg-td-chalk/50",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 align-middle first:pl-2 last:pr-2"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-2 py-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
