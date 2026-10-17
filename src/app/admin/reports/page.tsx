"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Clock, MessageSquareWarning, ArrowRight } from "lucide-react";
import StaffShell from "@/features/admin/StaffShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/time";
import {
  getReportStatusMeta,
  getReportTypeLabel,
  getWaitTimeText,
  isSlaBreached,
} from "@/features/admin/reports/report-status";
import { useReports } from "@/features/admin/reports/hooks";
import { ReportStatusChips } from "@/features/admin/reports/components/ReportStatusChips";
import { ReportFilterBar } from "@/features/admin/reports/components/ReportFilterBar";
import { ReportDrawer } from "@/features/admin/reports/components/ReportDrawer";
import type { ReportListItem, ReportFilterParams } from "@/features/admin/reports/types";

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilterParams>({});
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const { data, isLoading } = useReports(filters);

  const columns: ColumnDef<ReportListItem>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Mã",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-ink">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "customer",
        header: "Khách hàng & Phân loại",
        cell: ({ row }) => (
          <div className="flex flex-col py-0.5">
            <span className="font-semibold text-ink">{row.original.customer.fullName}</span>
            <span className="text-[11px] text-ink-3">
              {getReportTypeLabel(row.original.type)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "descriptionPreview",
        header: "Tóm tắt nội dung",
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-sm text-xs text-ink-2">
            {row.original.descriptionPreview}
          </p>
        ),
      },
      {
        accessorKey: "rentalId",
        header: "Liên kết",
        cell: ({ row }) => {
          if (row.original.rental) {
            return (
              <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-sunken px-2 py-0.5 text-xs text-ink-2">
                Đơn #{row.original.rental.id} ({row.original.rental.vehicleName})
              </span>
            );
          }
          if (row.original.maintenance) {
            return (
              <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-sunken px-2 py-0.5 text-xs text-ink-2">
                Bảo dưỡng #{row.original.maintenance.id}
              </span>
            );
          }
          return <span className="text-xs text-ink-3">Chung</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const meta = getReportStatusMeta(row.original.status);
          return <StatusBadge status={meta.statusType}>{meta.label}</StatusBadge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Thời gian & SLA",
        cell: ({ row }) => {
          const isOverdue = isSlaBreached(row.original.createdAt, row.original.status);
          const waitStr = getWaitTimeText(row.original.createdAt, row.original.resolvedAt);

          return (
            <div className="flex flex-col gap-0.5 py-0.5">
              <span className="font-mono text-[11px] text-ink-3">
                {formatDateTime(row.original.createdAt, "dd/MM/yyyy HH:mm")}
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3 text-ink-3" />
                <span className="text-ink-2">Chờ: {waitStr}</span>
                {isOverdue && (
                  <span className="inline-flex items-center gap-0.5 rounded px-1 text-[10px] font-bold text-danger">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Quá hạn
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReportId(row.original.id);
            }}
            className="text-xs text-primary hover:text-primary-hover"
          >
            <span>Xử lý</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager", "Staff", "CustomerService"]}>
      <StaffShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquareWarning className="h-5 w-5" aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Xử lý khiếu nại & Báo cáo sự cố
                </h1>
              </div>
              <p className="mt-1 text-sm text-ink-3">
                Tiếp nhận phản ánh từ khách hàng và điều phối xử lý khắc phục sự cố (FR-027).
              </p>
            </div>
          </div>

          {/* Filter Status Chips */}
          <ReportStatusChips
            currentStatus={filters.status}
            onSelectStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
            counts={{
              total: data?.totalCount ?? 0,
              new: data?.newCount ?? 0,
              inProgress: data?.inProgressCount ?? 0,
              resolved: data?.resolvedCount ?? 0,
            }}
          />

          {/* Filter Bar */}
          <ReportFilterBar filters={filters} onChange={setFilters} />

          {/* Data Table */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
            <DataTable
              caption="Danh sách báo cáo sự cố và khiếu nại từ khách hàng"
              columns={columns}
              data={data?.items ?? []}
              loading={isLoading}
              onRowClick={(row) => setSelectedReportId(row.id)}
              emptyTitle="Chưa có báo cáo nào"
              emptyDescription="Hiện không có phản ánh sự cố hoặc khiếu nại nào theo điều kiện lọc này."
            />
          </div>

          {/* Drawer chi tiết báo cáo */}
          <ReportDrawer
            reportId={selectedReportId}
            onClose={() => setSelectedReportId(null)}
          />
        </div>
      </StaffShell>
    </AuthGate>
  );
}
