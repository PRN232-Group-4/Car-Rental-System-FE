"use client";

import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReport } from "@/features/admin/reports/hooks";
import { ReportDetailView } from "@/features/admin/reports/components/ReportDetailView";

export default function ReportDetailPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const reportId = idParam ? Number(idParam) : null;

  const { data: report, isLoading, isError, refetch } = useReport(reportId);

  return (
    <AuthGate allowedRoles={["Admin", "Manager", "Staff", "CustomerService"]}>
        <div className="space-y-6">
          {/* Breadcrumb / Back button */}
          <div>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 transition hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại danh sách báo cáo</span>
            </Link>
          </div>

          {!reportId && (
            <EmptyState
              title="Không có mã báo cáo"
              description="Vui lòng cung cấp tham số ?id= để xem chi tiết báo cáo sự cố."
            />
          )}

          {reportId && isLoading && (
            <div className="flex h-64 animate-pulse items-center justify-center rounded-2xl border border-line bg-surface text-xs text-ink-3">
              Đang tải chi tiết báo cáo #{reportId}...
            </div>
          )}

          {reportId && isError && (
            <ErrorState
              message={`Không thể tìm thấy hoặc tải thông tin báo cáo #${reportId}.`}
              onRetry={() => refetch()}
            />
          )}

          {reportId && report && (
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
              <ReportDetailView report={report} onRefresh={() => refetch()} />
            </div>
          )}
        </div>
    </AuthGate>
  );
}
