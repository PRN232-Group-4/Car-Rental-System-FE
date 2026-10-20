import { useMemo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { ChartCard } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import type { TopVehicleRow } from "../types";

interface TopVehiclesTableProps {
  data?: TopVehicleRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TopVehiclesTable({
  data = [],
  isLoading,
  isError,
  onRetry,
}: TopVehiclesTableProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [data]);

  const columns: ColumnDef<TopVehicleRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Phương tiện",
        cell: ({ row }) => (
          <div className="flex flex-col py-0.5">
            <span className="font-semibold text-td-ink">{row.original.name}</span>
            <span className="text-[11px] text-td-muted">{row.original.category}</span>
          </div>
        ),
      },
      {
        accessorKey: "revenue",
        header: "Doanh thu",
        cell: ({ row }) => (
          <span className="font-mono font-medium tabular-nums text-td-ink">
            {row.original.revenue.toLocaleString("vi-VN")} đ
          </span>
        ),
      },
      {
        accessorKey: "rentals",
        header: "Lượt thuê",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-td-ink">
            {row.original.rentals} lượt
          </span>
        ),
      },
      {
        accessorKey: "hours",
        header: "Giờ lăn bánh",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-td-ink">
            {row.original.hours} giờ
          </span>
        ),
      },
      {
        accessorKey: "utilization",
        header: "Tỉ lệ khai thác",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-td-chalk">
              <div
                className="h-full bg-td-oxide"
                style={{ width: `${Math.min(row.original.utilization, 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums text-td-ink">
              {row.original.utilization}%
            </span>
          </div>
        ),
      },
    ],
    []
  );

  if (isError) {
    return (
      <ChartCard title="Top phương tiện theo hiệu quả" description="Xếp hạng xe sinh lời và khai thác cao nhất">
        <ErrorState message="Không thể tải bảng xếp hạng phương tiện." onRetry={onRetry} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Top phương tiện theo hiệu quả"
      description="Xếp hạng top 10 phương tiện sinh lời và có tỉ lệ khai thác dẫn đầu"
      className="col-span-1 lg:col-span-2"
    >
      <div className="overflow-hidden rounded border border-td-rule">
        <DataTable
          caption="Bảng xếp hạng top 10 xe theo doanh thu và tỉ lệ khai thác"
          columns={columns}
          data={sortedData}
          loading={isLoading}
          emptyTitle="Chưa có dữ liệu phương tiện"
          emptyDescription="Không có phương tiện nào phát sinh doanh thu trong kỳ lọc."
        />
      </div>
    </ChartCard>
  );
}
