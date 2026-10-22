"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/features/auth/AuthGate";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { InlineInput, InlineSelect } from "@/components/forms/inline-validation";
import { formatAdminDateTime } from "@/lib/date-time";
import { getAuditLogs } from "@/features/admin/audit-logs/api";
import { Button } from "@/components/ui/Button";
import ResultPagination from "@/components/ui/ResultPagination";
import { AlertCircle, RefreshCw } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  role_assigned: "Gán vai trò",
  role_removed: "Gỡ vai trò",
  account_locked: "Khóa tài khoản",
  account_unlocked: "Mở khóa tài khoản",
  session_revoked: "Thu hồi phiên",
  profile_created: "Tạo hồ sơ nhân viên",
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin", "audit-logs", search, actionFilter, page],
    queryFn: () => getAuditLogs({ search, action: actionFilter, page, pageSize: 20 }),
    retry: false,
  });

  const records = query.data?.items ?? [];
  const isBackendMissing = Boolean(
    query.error &&
      (query.error instanceof Error
        ? query.error.message.includes("404") || query.error.message.includes("501") || query.error.message.includes("Failed to fetch")
        : false),
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <div className="space-y-6">
        <TransitFolio
          index="07"
          tag="ORG"
          kicker="TỔ CHỨC · TRUY VẾT QUẢN TRỊ"
          title={<>Nhật ký <em className="italic text-td-teal">kiểm toán hệ thống.</em></>}
          description="Truy vết bất biến các can thiệp phân quyền vai trò, khóa tài khoản, thu hồi phiên và thao tác bảo mật theo múi giờ GMT+7."
        />

        <AdminFilterBar
          title="Bộ lọc nhật ký kiểm toán"
          actions={
            <AdminFilterButton
              variant="secondary"
              onClick={() => {
                setSearch("");
                setActionFilter("all");
                setPage(1);
              }}
            >
              Đặt lại
            </AdminFilterButton>
          }
        >
          <AdminFilterField label="Tìm kiếm" htmlFor="audit-search">
            <InlineInput
              id="audit-search"
              name="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Mã nhật ký, email, đối tượng..."
            />
          </AdminFilterField>

          <AdminFilterField label="Loại hành động" htmlFor="audit-action" select>
            <InlineSelect
              id="audit-action"
              name="action"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả hành động</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </InlineSelect>
          </AdminFilterField>
        </AdminFilterBar>

        {query.error && (
          <div role="alert" className="rounded border border-warning/40 bg-warning/10 p-4 text-xs text-td-ink space-y-2">
            <div className="flex items-center gap-2 font-bold text-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {isBackendMissing
                  ? "Backend hiện chưa triển khai endpoint truy vấn nhật ký (GET /api/audit-logs)"
                  : "Không thể tải dữ liệu nhật ký kiểm toán từ máy chủ"}
              </span>
            </div>
            <p className="text-td-muted leading-relaxed">
              {isBackendMissing
                ? "Backend ASP.NET Core hiện chỉ lưu vết kiểm toán trong database nội bộ khi thay đổi vai trò hoặc trạng thái tài khoản, nhưng chưa mở route GET /api/audit-logs. Giao diện đã sẵn sàng tiếp nhận dữ liệu thật ngay khi backend cập nhật."
                : query.error instanceof Error
                ? query.error.message
                : "Vui lòng kiểm tra kết nối mạng và thử lại."}
            </p>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void query.refetch()}
                className="inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Thử tải lại</span>
              </Button>
            </div>
          </div>
        )}

        <AdminTableCard>
          <AdminTable aria-busy={query.isFetching} className="min-w-[980px]">
            <caption className="sr-only">Bảng nhật ký kiểm toán quản trị hệ thống</caption>
            <thead>
              <tr>
                <th scope="col">Mã & Thời điểm</th>
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
                records.map((log) => (
                  <tr key={String(log.id)}>
                    <td>
                      <span className="font-mono text-xs font-bold text-td-ink block">{log.id}</span>
                      <span className="font-mono text-[11px] text-td-muted block">
                        {formatAdminDateTime(log.timestamp)}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-xs text-td-ink block">{log.actorName || "—"}</span>
                      <span className="font-mono text-[11px] text-td-muted block">{log.actorEmail || "—"}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center rounded border border-td-rule bg-td-paper px-2 py-0.5 font-mono text-[11px] font-bold text-td-ink">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-td-ink">{log.targetUser || "—"}</span>
                    </td>
                    <td className="max-w-xs">
                      <p className="text-xs text-td-ink leading-relaxed">{log.details || "—"}</p>
                    </td>
                    <td>
                      <span className="font-mono text-[11px] text-td-muted">{log.ipAddress || "—"}</span>
                    </td>
                    <td>
                      <AdminStatusBadge
                        domain="activity"
                        status={
                          log.status === "success"
                            ? "active"
                            : log.status === "blocked"
                            ? "inactive"
                            : "pending"
                        }
                      >
                        {log.status === "success" ? "Thành công" : log.status === "blocked" ? "Bị chặn" : "Cảnh báo"}
                      </AdminStatusBadge>
                    </td>
                  </tr>
                ))
              ) : (
                <AdminTableEmptyRow colSpan={7}>
                  {query.error
                    ? "Chưa kết nối được với endpoint kiểm toán từ backend."
                    : "Chưa có bản ghi nhật ký kiểm toán nào."}
                </AdminTableEmptyRow>
              )}
            </tbody>
          </AdminTable>
          <ResultPagination
            page={query.data?.page ?? page}
            pageSize={query.data?.pageSize ?? 20}
            totalCount={query.data?.totalCount ?? 0}
            busy={query.isFetching || !!query.error}
            onPage={setPage}
          />
        </AdminTableCard>
      </div>
    </AuthGate>
  );
}
