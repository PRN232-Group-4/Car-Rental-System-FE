"use client";

import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReport } from "@/features/admin/reports/hooks";
import { ReportDetailView } from "@/features/admin/reports/components/ReportDetailView";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";

export default function ReportDetailPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const reportId = idParam ? Number(idParam) : null;

  const { data: report, isLoading, isError, refetch } = useReport(reportId);

  return (
    <AuthGate allowedRoles={["Admin", "Manager", "Staff", "CustomerService", "Maintenance"]}>
        <div className="space-y-6">
          {/* Breadcrumb / Back button */}
          <div>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-td-muted transition hover:text-td-ink"
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

          <TransitFolio
            index="03"
            tag="TRI"
            kicker="CHĂM SÓC & SỰ CỐ · HỒ SƠ BÁO CÁO"
            title={<>Chi tiết <span className="text-td-teal">sự cố.</span></>}
            description="Hồ sơ tiếp nhận, bằng chứng và tiến trình xử lý báo cáo sự cố tại trạm."
          />

          {reportId && isLoading && (
            <div className="flex h-64 animate-pulse items-center justify-center rounded border border-td-rule bg-td-white font-mono text-xs text-td-muted">
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
            <div className="rounded border border-td-rule bg-td-white p-6">
              <ReportDetailView report={report} onRefresh={() => refetch()} />
            </div>
          )}
        </div>
    </AuthGate>
  );
}
