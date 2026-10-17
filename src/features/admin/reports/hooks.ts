import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchReports,
  fetchReportDetail,
  updateReportStatus,
  createMaintenanceFromReport,
} from "./api";
import type {
  ReportFilterParams,
  ReportDetail,
  ReportStatus,
  CreateMaintenancePayload,
} from "./types";

export const REPORT_QUERY_KEYS = {
  all: ["admin-reports"] as const,
  list: (params: ReportFilterParams) => ["admin-reports", "list", params] as const,
  detail: (id: number) => ["admin-reports", "detail", id] as const,
};

export function useReports(params: ReportFilterParams = {}) {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.list(params),
    queryFn: () => fetchReports(params),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });
}

export function useReport(id: number | null | undefined) {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.detail(id || 0),
    queryFn: () => fetchReportDetail(id!),
    enabled: Boolean(id && id > 0),
    staleTime: 10 * 1000,
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: number;
      status: ReportStatus;
      reason?: string;
    }) => updateReportStatus(id, status, reason),

    // Optimistic Update + Rollback
    onMutate: async ({ id, status, reason }) => {
      await queryClient.cancelQueries({ queryKey: REPORT_QUERY_KEYS.detail(id) });
      const previousDetail = queryClient.getQueryData<ReportDetail>(
        REPORT_QUERY_KEYS.detail(id)
      );

      if (previousDetail) {
        queryClient.setQueryData<ReportDetail>(REPORT_QUERY_KEYS.detail(id), {
          ...previousDetail,
          status,
          resolvedAt: status === "resolved" ? new Date().toISOString() : previousDetail.resolvedAt,
          history: [
            ...(previousDetail.history || []),
            {
              at: new Date().toISOString(),
              from: previousDetail.status,
              to: status,
              reason: reason || `Chuyển trạng thái sang ${status}`,
            },
          ],
        });
      }

      return { previousDetail, id };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          REPORT_QUERY_KEYS.detail(context.id),
          context.previousDetail
        );
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.all });
    },
  });
}

export function useCreateMaintenanceFromReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) => createMaintenanceFromReport(payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.detail(vars.reportId) });
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.all });
    },
  });
}
