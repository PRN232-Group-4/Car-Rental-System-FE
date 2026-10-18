"use client";

import { Drawer } from "@/components/ui/Drawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { useReport } from "../hooks";
import { ReportDetailView } from "./ReportDetailView";

interface ReportDrawerProps {
  reportId: number | null;
  onClose: () => void;
}

export function ReportDrawer({ reportId, onClose }: ReportDrawerProps) {
  const { data: report, isLoading, isError, refetch } = useReport(reportId);

  return (
    <Drawer
      open={Boolean(reportId)}
      onOpenChange={(open) => !open && onClose()}
      side="right"
      className="w-[min(95vw,680px)]"
      title={`Xử lý Báo cáo sự cố #${reportId ?? ""}`}
    >
      <div className="p-5">
        {isLoading && (
          <div className="flex h-64 animate-pulse items-center justify-center rounded-2xl bg-sunken text-xs text-ink-3">
            Đang tải dữ liệu chi tiết báo cáo...
          </div>
        )}

        {isError && (
          <ErrorState
            message="Không thể tải thông tin báo cáo sự cố."
            onRetry={() => refetch()}
          />
        )}

        {report && (
          <ReportDetailView report={report} onRefresh={() => refetch()} />
        )}
      </div>
    </Drawer>
  );
}
