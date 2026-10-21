import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReports, fetchReportDetail, updateReportStatus, createMaintenanceFromReport } from "./api";
import type { ReportFilterParams, ReportStatus, CreateMaintenancePayload } from "./types";

export const REPORT_QUERY_KEYS = {
  all: ["admin-reports"] as const,
  list: (params: ReportFilterParams) => ["admin-reports", "list", params] as const,
  detail: (id: number) => ["admin-reports", "detail", id] as const,
};

export function useReports(params: ReportFilterParams = {}) {
  return useQuery({ queryKey: REPORT_QUERY_KEYS.list(params), queryFn: () => fetchReports(params), staleTime: 15_000, refetchInterval: 30_000, refetchIntervalInBackground: false });
}
export function useReport(id: number | null | undefined) {
  return useQuery({ queryKey: REPORT_QUERY_KEYS.detail(id || 0), queryFn: () => fetchReportDetail(id!), enabled: Boolean(id && id > 0), staleTime: 10_000 });
}
export function useUpdateReportStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReportStatus; reason?: string }) => updateReportStatus(id, status),
    onSuccess: () => { void client.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.all }); },
  });
}
export function useCreateMaintenanceFromReport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) => createMaintenanceFromReport(payload),
    onSuccess: () => { void client.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.all }); },
  });
}
