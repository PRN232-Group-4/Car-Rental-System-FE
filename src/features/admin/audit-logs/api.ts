import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

export interface AuditLogDto {
  id: string | number;
  timestamp: string;
  actorEmail?: string | null;
  actorName?: string | null;
  action: string;
  targetUser?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  status?: "success" | "blocked" | "warning" | string | null;
}

export interface AuditLogFilterParams {
  search?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}

export async function getAuditLogs(params: AuditLogFilterParams = {}): Promise<PagedResult<AuditLogDto>> {
  return backendApiClient.get<PagedResult<AuditLogDto>>("audit-logs", {
    search: params.search?.trim() || undefined,
    action: params.action && params.action !== "all" ? params.action : undefined,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  });
}
