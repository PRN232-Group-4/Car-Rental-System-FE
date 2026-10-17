"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StaffShell from "@/features/admin/StaffShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { useSession } from "@/features/auth/context/AuthContext";
import { useAdminUsers, useSetUserActive, useRevokeUserSessions } from "@/features/admin/users/hooks";
import { UserFilters } from "@/features/admin/users/components/UserFilters";
import { UserLockDialog } from "@/features/admin/users/components/UserLockDialog";
import { AdminUserListItem, UserFilterParams } from "@/features/admin/users/types";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/time";
import {
  Users,
  Eye,
  Lock,
  Unlock,
  LogOut,
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
        await revokeSessionsMutation.mutateAsync(targetUser.id);
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface font-mono text-xs font-black text-primary shadow-xs">
                {initials || <User className="w-4 h-4 text-ink-3" />}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/admin/users/detail?id=${u.id}`}
                  className="font-bold text-sm text-ink hover:text-primary transition-colors block truncate"
                >
                  {u.fullName}
                </Link>
                <span className="font-mono text-xs text-ink-3 block truncate">{u.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: "Điện thoại",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ink-2">
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
                    className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                      isAdmin
                        ? "bg-primary-tint text-primary border border-primary/20"
                        : "bg-sunken text-ink-2 border border-line"
                    }`}
                  >
                    {r}
                  </span>
                );
              })}
              {remainder > 0 && (
                <span className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-3">
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
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              {u.hasCustomerProfile && (
                <span
                  title="Có hồ sơ khách hàng"
                  className="flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 border border-line text-[11px] text-ink"
                >
                  <UserCheck className="w-3.5 h-3.5 text-success" />
                  <span>Khách</span>
                </span>
              )}
              {u.hasStaffProfile && (
                <span
                  title="Có hồ sơ nhân viên"
                  className="flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 border border-line text-[11px] text-ink"
                >
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>NV</span>
                </span>
              )}
              {!u.hasCustomerProfile && !u.hasStaffProfile && (
                <span className="text-ink-3 text-[11px]">—</span>
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
            <StatusBadge
              status={active ? "approved" : "rejected"}
              label={active ? "Hoạt động" : "Đã khóa"}
            />
          );
        },
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ink-3">
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
              <Link
                href={`/admin/users/detail?id=${u.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye className="w-4 h-4" />
              </Link>

              {/* Chỉ Admin mới có quyền thao tác ghi */}
              {!isManagerOnly && (
                <>
                  <button
                    type="button"
                    onClick={() => setLockTarget(u)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                      u.isActive
                        ? "border-line bg-surface text-ink-2 hover:border-danger hover:text-danger"
                        : "border-success/30 bg-success-bg/30 text-success hover:border-success"
                    }`}
                    title={u.isActive ? "Khóa tài khoản" : "Mở khóa"}
                  >
                    {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRevokeSessions(u)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:border-warning hover:text-warning transition-colors cursor-pointer"
                    title="Thu hồi phiên đăng nhập"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ];
  }, [isManagerOnly, handleRevokeSessions]);

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Users className="w-4 h-4" />
            <span>Phân Hệ Quản Trị</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-ink tracking-tight">
            Quản Lý Người Dùng & Phân Quyền
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-3">
            Tra cứu tài khoản người dùng, phân quyền vai trò và kiểm soát an toàn bảo mật hệ thống.
          </p>
        </div>

        {isManagerOnly && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs text-ink-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-ink-3" />
            <span>Chế độ xem: <strong>Chỉ đọc (Manager)</strong></span>
          </div>
        )}
      </div>

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
            <div className="border-t border-line pt-4">
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
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <StaffShell>
        <Suspense fallback={<div className="h-40 rounded-2xl bg-surface animate-pulse" />}>
          <AdminUsersContent />
        </Suspense>
      </StaffShell>
    </AuthGate>
  );
}
