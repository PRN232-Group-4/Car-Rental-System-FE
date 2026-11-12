"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { AuthGate } from "@/features/auth/AuthGate";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { InlineInput, InlineSelect, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import { formatAdminDateTime } from "@/lib/date-time";
import {
  AUDIT_ACTIONS,
  auditActionLabel,
  auditStatusLabel,
  getAuditLogs,
} from "@/features/admin/audit-logs/api";
import { Button } from "@/components/ui/Button";
import ResultPagination from "@/components/ui/ResultPagination";
import { AlertCircle, RefreshCw } from "lucide-react";

const PAGE_SIZE = 20;

/**
 * Nhãn trạng thái của backend: `success` là mặc định, `blocked` khi thao tác bị chặn.
 * Giá trị lạ dùng tone trung tính và hiển thị nguyên văn (không tự gọi là "cảnh báo").
 */
function statusPresentation(status: string | null | undefined) {
  const key = status?.trim().toLowerCase() ?? "";
  if (key === "success") return { domainStatus: "active", label: auditStatusLabel(status) };
  if (key === "blocked") return { domainStatus: "inactive", label: auditStatusLabel(status) };
  return { domainStatus: "", label: auditStatusLabel(status) };
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const suffix = error.status ? ` (HTTP ${error.status})` : "";
    return `${error.detail?.trim() || error.title?.trim() || "Máy chủ từ chối yêu cầu."}${suffix}`;
  }
  if (error instanceof TypeError) return "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  return error instanceof Error && error.message ? error.message : "Không thể tải nhật ký kiểm toán.";
}

export default function AuditLogsPage() {
  const [draft, setDraft] = useState({ search: "", action: "all" });
  const [filter, setFilter] = useState(draft);
  const [page, setPage] = useState(1);
  const validation = useInlineValidation();

  const query = useQuery({
    queryKey: ["admin", "audit-logs", filter.search, filter.action, page],
    queryFn: () => getAuditLogs({ ...filter, page, pageSize: PAGE_SIZE }),
    retry: false,
  });

  const records = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const currentPage = query.data?.page ?? page;

  // Lỗi validation 400 từ backend được gắn vào đúng trường lọc (AGENTS.md: lỗi dưới trường tương ứng).
  const mapped = mapValidationErrors(
    query.error instanceof ApiClientError ? { error: { errors: query.error.errors } } : null,
    ["search", "action"],
  );
  const backendErrors = Object.fromEntries(
    Object.entries(mapped.errors).filter(([key]) => draft[key as keyof typeof draft] === filter[key as keyof typeof filter]),
  );

  useEffect(() => {
    if (!(query.error instanceof ApiClientError)) return;
    const first = Object.keys(mapValidationErrors({ error: { errors: query.error.errors } }, ["search", "action"]).errors)[0];
    if (first) document.getElementById(`audit-${first}`)?.focus();
  }, [query.error]);

  const apply = () => {
    setFilter(draft);
    setPage(1);
  };

  const reset = () => {
    setDraft({ search: "", action: "all" });
    setFilter({ search: "", action: "all" });
    setPage(1);
    validation.reset();
  };

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <div className="space-y-6">
        <TransitFolio
          title="Nhật ký kiểm toán hệ thống"
          description="Truy vết bất biến các can thiệp phân quyền vai trò, khóa tài khoản, thu hồi phiên và thao tác bảo mật theo múi giờ GMT+7."
        />

        <ValidatedForm
          validation={{ ...validation, errors: { ...backendErrors, ...validation.errors } }}
          onSubmit={apply}
        >
          <AdminFilterBar
            title="Bộ lọc nhật ký kiểm toán"
            actions={
              <>
                <AdminFilterButton type="submit">Áp dụng</AdminFilterButton>
                <AdminFilterButton variant="secondary" onClick={reset}>
                  Đặt lại
                </AdminFilterButton>
              </>
            }
          >
            <AdminFilterField label="Tìm kiếm" htmlFor="audit-search">
              <InlineInput
                id="audit-search"
                name="search"
                maxLength={255}
                value={draft.search}
                onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
                placeholder="Mã AUD-, email hoặc tên người thực hiện/đối tượng"
              />
            </AdminFilterField>

            <AdminFilterField label="Loại hành động" htmlFor="audit-action" select>
              <InlineSelect
                id="audit-action"
                name="action"
                value={draft.action}
                onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))}
              >
                <option value="all">Tất cả hành động</option>
                {AUDIT_ACTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </InlineSelect>
            </AdminFilterField>
          </AdminFilterBar>
        </ValidatedForm>

        {query.error && (
          <div role="alert" className="space-y-2 rounded border border-danger/30 bg-danger-bg p-4 text-xs text-td-ink">
            <div className="flex items-center gap-2 font-bold text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Không thể tải nhật ký kiểm toán</span>
            </div>
            <p className="leading-relaxed text-td-muted">{errorMessage(query.error)}</p>
            <p className="leading-relaxed text-td-muted">
              Endpoint yêu cầu quyền Admin hoặc Manager. Nếu bạn đang đăng nhập bằng vai trò khác, hãy đăng nhập lại bằng
              tài khoản có quyền truy vết.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void query.refetch()}
              className="inline-flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              <span>Thử tải lại</span>
            </Button>
          </div>
        )}

        <AdminTableCard>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-bold">Danh sách bản ghi kiểm toán</h2>
            <p className="mt-1 text-xs text-ink-3">
              {query.isFetching ? "Đang tải nhật ký..." : `${totalCount} bản ghi, mới nhất trước`}
            </p>
          </div>
          <AdminTable aria-busy={query.isFetching} className="min-w-[980px]">
            <caption className="sr-only">Bảng nhật ký kiểm toán quản trị hệ thống</caption>
            <thead>
              <tr>
                <th scope="col">Mã &amp; Thời điểm</th>
                <th scope="col">Người thực hiện</th>
                <th scope="col">Hành động</th>
                <th scope="col">Đối tượng tác động</th>
                <th scope="col">Chi tiết nghiệp vụ</th>
                <th scope="col">Địa chỉ IP</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {query.isFetching ? (
                <AdminTableSkeleton columns={7} label="Đang tải nhật ký kiểm toán..." />
              ) : records.length > 0 ? (
                records.map((log) => {
                  const status = statusPresentation(log.status);
                  return (
                    <tr key={String(log.id)}>
                      <td>
                        <span className="block font-mono text-xs font-bold text-td-ink">{log.id}</span>
                        <span className="block font-mono text-[11px] text-td-muted">
                          {formatAdminDateTime(log.timestamp)}
                        </span>
                      </td>
                      <td>
                        <span className="block text-xs font-semibold text-td-ink">{log.actorName || "—"}</span>
                        <span className="block font-mono text-[11px] text-td-muted">{log.actorEmail || "—"}</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center rounded border border-td-rule bg-td-paper px-2 py-0.5 font-mono text-[11px] font-bold text-td-ink">
                          {auditActionLabel(log.action)}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-td-ink">{log.targetUser || "—"}</span>
                        {typeof log.targetUserId === "number" && (
                          <span className="block font-mono text-[11px] text-td-muted">#{log.targetUserId}</span>
                        )}
                      </td>
                      <td className="max-w-xs">
                        <p className="text-xs leading-relaxed text-td-ink">{log.details || "—"}</p>
                      </td>
                      <td>
                        <span className="font-mono text-[11px] text-td-muted">{log.ipAddress || "—"}</span>
                      </td>
                      <td>
                        {status.domainStatus ? (
                          <AdminStatusBadge domain="activity" status={status.domainStatus}>
                            {status.label}
                          </AdminStatusBadge>
                        ) : (
                          <span className="font-mono text-[11px] text-td-muted">{status.label}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <AdminTableEmptyRow colSpan={7}>
                  {query.error
                    ? "Chưa tải được nhật ký. Vui lòng thử lại bằng nút phía trên."
                    : filter.search || filter.action !== "all"
                      ? "Không có bản ghi khớp bộ lọc hiện tại. Hãy nới điều kiện tìm kiếm."
                      : "Chưa có bản ghi kiểm toán nào. Nhật ký được ghi khi vai trò, trạng thái tài khoản hoặc phiên đăng nhập bị thay đổi."}
                </AdminTableEmptyRow>
              )}
            </tbody>
          </AdminTable>
          <ResultPagination
            page={currentPage}
            pageSize={query.data?.pageSize ?? PAGE_SIZE}
            totalCount={totalCount}
            busy={query.isFetching}
            onPage={setPage}
          />
        </AdminTableCard>
      </div>
    </AuthGate>
  );
}
