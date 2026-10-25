"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthGate } from "@/features/auth/AuthGate";
import { useSession } from "@/features/auth/context/AuthContext";
import { useAdminUsers, useSetUserActive, useRevokeUserSessions } from "@/features/admin/users/hooks";
import { UserFilters } from "@/features/admin/users/components/UserFilters";
import { UserLockDialog } from "@/features/admin/users/components/UserLockDialog";
import { AdminUserListItem, UserFilterParams } from "@/features/admin/users/types";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
import { formatDate } from "@/lib/time";
import {
  UserCheck,
  Briefcase,
  User,
  ShieldCheck,
} from "lucide-react";

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, hasRole } = useSession();

  const isManagerOnly = useMemo(() => {
    return hasRole("Manager") && !hasRole("Admin");
  }, [hasRole]);

  // Phân tích filters từ URL
  const filters: UserFilterParams = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      role: searchParams.get("role") || "all",
      isActive: searchParams.get("isActive") || "all",
      profile: searchParams.get("profile") || "all",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 10,
    };
  }, [searchParams]);

  const { data, isLoading, error, refetch } = useAdminUsers(filters);
  const setUserActiveMutation = useSetUserActive();
  const revokeSessionsMutation = useRevokeUserSessions();

  // Dialog khóa tài khoản
  const [lockTarget, setLockTarget] = useState<AdminUserListItem | null>(null);
  const [actionError, setActionError] = useState("");

  const updateFilters = (patch: Partial<UserFilterParams>) => {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams();
    if (next.search) sp.set("search", next.search);
    if (next.role && next.role !== "all") sp.set("role", next.role);
    if (next.isActive && next.isActive !== "all") sp.set("isActive", next.isActive);
    if (next.profile && next.profile !== "all") sp.set("profile", next.profile);
    if (next.page && next.page > 1) sp.set("page", String(next.page));
    if (next.pageSize && next.pageSize !== 10) sp.set("pageSize", String(next.pageSize));

    const qs = sp.toString();
    router.push(`/admin/users${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleResetFilters = () => {
    router.push("/admin/users", { scroll: false });
  };

  const handleLockConfirm = async (reason?: string) => {
    if (!lockTarget) return;
    await setUserActiveMutation.mutateAsync({
      userId: lockTarget.id,
      isActive: !lockTarget.isActive,
      reason,
      currentActorEmail: currentUser?.email || "Admin",
    });
    setLockTarget(null);
  };

  const handleRevokeSessions = useCallback(
    async (targetUser: AdminUserListItem) => {
      if (window.confirm(`Thu hồi mọi phiên đăng nhập của người dùng ${targetUser.fullName}?`)) {
        setActionError("");
        try { await revokeSessionsMutation.mutateAsync(targetUser.id); }
        catch (failure) { setActionError(failure instanceof Error ? failure.message : "Không thể thu hồi phiên. Vui lòng thử lại."); }
      }
    },
    [revokeSessionsMutation]
  );

  // Cột cho DataTable
  const columns = useMemo<ColumnDef<AdminUserListItem>[]>(() => {
    return [
      {
        id: "user",
        header: "Người dùng",
        cell: ({ row }) => {
          const u = row.original;
          const initials = u.fullName
            .split(" ")
            .map((n) => n[0])
            .slice(-2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-td-rule bg-td-chalk font-mono text-xs font-bold text-td-oxide">
                {initials || <User className="w-4 h-4 text-td-muted" />}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/admin/users/detail?id=${u.id}`}
                  className="font-bold text-sm text-td-ink hover:text-td-oxide transition-colors block truncate"
                >
                  {u.fullName}
                </Link>
                <span className="font-mono text-[11px] text-td-muted block truncate">{u.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: "Điện thoại",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-td-muted">
            {row.original.phone || "—"}
          </span>
        ),
      },
      {
        id: "roles",
        header: "Vai trò",
        cell: ({ row }) => {
          const roles = row.original.roles;
          const visible = roles.slice(0, 2);
          const remainder = roles.length - visible.length;

          return (
            <div className="flex flex-wrap items-center gap-1">
              {visible.map((r) => {
                const isAdmin = r === "Admin";
                return (
                  <span
                    key={r}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold border ${
                      isAdmin
                        ? "bg-td-chalk text-td-oxide border-td-oxide/30"
                        : "bg-td-chalk/60 text-td-ink border-td-rule"
                    }`}
                  >
                    {r}
                  </span>
                );
              })}
              {remainder > 0 && (
                <span className="rounded bg-td-chalk px-1.5 py-0.5 font-mono text-[10px] font-semibold text-td-muted">
                  +{remainder}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "profile",
        header: "Hồ sơ",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-1.5 text-xs text-td-muted">
              {u.hasCustomerProfile && (
                <span
                  title="Có hồ sơ khách hàng"
                  className="flex items-center gap-1 rounded border border-td-rule bg-td-chalk px-1.5 py-0.5 text-[11px] text-td-ink"
                >
                  <UserCheck className="w-3.5 h-3.5 text-success" />
                  <span>Khách</span>
                </span>
              )}
              {u.hasStaffProfile && (
                <span
                  title="Có hồ sơ nhân viên"
                  className="flex items-center gap-1 rounded border border-td-rule bg-td-chalk px-1.5 py-0.5 text-[11px] text-td-ink"
                >
                  <Briefcase className="w-3.5 h-3.5 text-td-oxide" />
                  <span>NV</span>
                </span>
              )}
              {!u.hasCustomerProfile && !u.hasStaffProfile && (
                <span className="text-td-muted text-[11px]">—</span>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const active = row.original.isActive;
          return (
            <AdminStatusBadge domain="activity" status={active ? "active" : "inactive"}>
              {active ? "Hoạt động" : "Đã khóa"}
            </AdminStatusBadge>
          );
        },
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-td-muted">
            {formatDate(row.original.createdAt, "dd/MM/yyyy")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <AdminRowAction action="view" href={`/admin/users/detail?id=${u.id}`} label={`Xem chi tiết ${u.email}`} />
              {!isManagerOnly && <>
                <AdminRowAction action={u.isActive ? "deactivate" : "activate"} label={`${u.isActive ? "Khóa tài khoản" : "Mở khóa"} ${u.email}`}
                  onClick={() => setLockTarget(u)} disabled={setUserActiveMutation.isPending || (u.isActive && u.email.toLowerCase() === currentUser?.email?.toLowerCase())} />
                <AdminRowAction action="revokeSessions" label={`Thu hồi phiên đăng nhập ${u.email}`} onClick={() => handleRevokeSessions(u)}
                  disabled={revokeSessionsMutation.isPending} isLoading={revokeSessionsMutation.isPending} />
              </>}
            </div>
          );
        },
      },
    ];
  }, [isManagerOnly, handleRevokeSessions, setUserActiveMutation.isPending, revokeSessionsMutation.isPending, currentUser?.email]);

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <TransitFolio
        index="07"
        tag="ORG"
        kicker="TỔ CHỨC · TÀI KHOẢN & PHÂN QUYỀN"
        title={<>Người dùng & <span className="text-td-teal">phân quyền.</span></>}
        description="Tra cứu tài khoản người dùng, phân quyền vai trò và kiểm soát an toàn bảo mật hệ thống."
      >
        <TransitFolioMetric
          label="HỆ THỐNG · TỔNG TÀI KHOẢN"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : String(data?.totalCount ?? 0).padStart(2, "0")}
        />
        {isManagerOnly && (
          <div className="inline-flex items-center gap-2 border-l border-td-rule pl-4 text-[11px] text-td-muted">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Chế độ xem: <strong className="font-bold text-td-ink">Chỉ đọc (Manager)</strong></span>
          </div>
        )}
      </TransitFolio>

      {actionError && <p role="alert" className="border-l-2 border-danger pl-3 text-sm text-danger">{actionError}</p>}
      {/* Bộ lọc */}
      <UserFilters
        filters={filters}
        onChange={updateFilters}
        onReset={handleResetFilters}
      />

      {/* Bảng dữ liệu */}
      {error ? (
        <ErrorState
          title="Không thể tải danh sách người dùng"
          message={error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            data={data?.items || []}
            columns={columns}
            loading={isLoading}
            emptyTitle="Không tìm thấy người dùng"
            emptyDescription="Thử nới lỏng bộ lọc hoặc tìm kiếm theo từ khóa khác."
            caption="Danh sách tài khoản người dùng hệ thống Thong Dong"
          />

          {data && data.totalCount > 0 && (
            <div className="border-t border-td-rule pt-3">
              <Pagination
                page={data.page}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                itemName="người dùng"
                onPageChange={(page) => updateFilters({ page })}
                onPageSizeChange={(pageSize) => updateFilters({ pageSize, page: 1 })}
              />
            </div>
          )}
        </div>
      )}

      {/* Dialog Khóa / Mở Khóa */}
      {lockTarget && (
        <UserLockDialog
          open={Boolean(lockTarget)}
          onOpenChange={(open) => !open && setLockTarget(null)}
          userId={lockTarget.id}
          userName={lockTarget.fullName}
          isCurrentlyActive={lockTarget.isActive}
          isLoading={setUserActiveMutation.isPending}
          onConfirm={handleLockConfirm}
        />
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AuthGate allowedRoles={["Admin"]}>
        <Suspense fallback={<div className="h-40 rounded bg-td-white animate-pulse" />}>
          <AdminUsersContent />
        </Suspense>
    </AuthGate>
  );
}
