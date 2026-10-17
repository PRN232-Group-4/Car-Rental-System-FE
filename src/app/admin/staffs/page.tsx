"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StaffShell from "@/features/admin/StaffShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { useStaffs, useDepartments, useFacilities } from "@/features/admin/staff/hooks";
import { StaffFilters } from "@/features/admin/staff/components/StaffFilters";
import { LicenseBadge } from "@/features/admin/staff/components/LicenseBadge";
import { StaffListItem, StaffFilterParams } from "@/features/admin/staff/types";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Eye,
  Plus,
  Car,
  Briefcase,
  Star,
  User,
} from "lucide-react";

function StaffsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: departments = [] } = useDepartments();
  const { data: facilities = [] } = useFacilities();

  // Phân tích bộ lọc từ URL
  const filters: StaffFilterParams = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      departmentId: searchParams.get("departmentId") || "all",
      facilityId: searchParams.get("facilityId") || "all",
      isDriver: searchParams.get("isDriver") || "all",
      isActive: searchParams.get("isActive") || "all",
      licenseStatus: searchParams.get("licenseStatus") || "all",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 10,
    };
  }, [searchParams]);

  const { data, isLoading, error, refetch } = useStaffs(filters);

  const updateFilters = (patch: Partial<StaffFilterParams>) => {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams();
    if (next.search) sp.set("search", next.search);
    if (next.departmentId && next.departmentId !== "all") sp.set("departmentId", next.departmentId);
    if (next.facilityId && next.facilityId !== "all") sp.set("facilityId", next.facilityId);
    if (next.isDriver && next.isDriver !== "all") sp.set("isDriver", next.isDriver);
    if (next.isActive && next.isActive !== "all") sp.set("isActive", next.isActive);
    if (next.licenseStatus && next.licenseStatus !== "all") sp.set("licenseStatus", next.licenseStatus);
    if (next.page && next.page > 1) sp.set("page", String(next.page));
    if (next.pageSize && next.pageSize !== 10) sp.set("pageSize", String(next.pageSize));

    const qs = sp.toString();
    router.push(`/admin/staffs${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleResetFilters = () => {
    router.push("/admin/staffs", { scroll: false });
  };

  // Cột cho DataTable
  const columns = useMemo<ColumnDef<StaffListItem>[]>(() => {
    return [
      {
        id: "staff",
        header: "Nhân viên",
        cell: ({ row }) => {
          const s = row.original;
          const initials = s.fullName
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
                  href={`/admin/staffs/detail?id=${s.id}`}
                  className="font-bold text-sm text-ink hover:text-primary transition-colors block truncate"
                >
                  {s.fullName}
                </Link>
                <span className="font-mono text-xs text-ink-3 block truncate">{s.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "department",
        header: "Phòng ban",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-ink-2">
            {row.original.department?.name || "Chưa phân bổ"}
          </span>
        ),
      },
      {
        id: "facility",
        header: "Cơ sở trực",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-ink-2 truncate block max-w-[180px]">
            {row.original.facility?.name || "Chưa phân bổ"}
          </span>
        ),
      },
      {
        id: "isDriver",
        header: "Tài xế",
        cell: ({ row }) => {
          const isDriver = row.original.isDriver;
          return isDriver ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-primary-tint/30 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary"
              title="Nhân viên thuộc đội ngũ tài xế"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Tài xế</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-3"
              title="Nhân viên văn phòng / vận hành"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Nội bộ</span>
            </span>
          );
        },
      },
      {
        id: "license",
        header: "Giấy phép lái xe",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="space-y-0.5">
              <LicenseBadge expiryDate={s.license?.expiryDate} />
              {s.license?.type && (
                <span className="block font-mono text-[10px] text-ink-3">
                  Hạng {s.license.type}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "rating",
        header: "Đánh giá",
        cell: ({ row }) => {
          const rating = row.original.rating;
          return rating ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-sunken px-2 py-1 text-xs font-bold text-ink">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>{rating.toFixed(2)}</span>
            </span>
          ) : (
            <span className="font-mono text-xs text-ink-3">—</span>
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
              label={active ? "Đang làm việc" : "Tạm ngừng"}
            />
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link
                href={`/admin/staffs/detail?id=${s.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                title="Xem chi tiết hồ sơ"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Users className="w-4 h-4" />
            <span>Đội Ngũ & Nhân Sự</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-ink tracking-tight">
            Quản Lý Nhân Viên & Tài Xế
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Theo dõi phân bổ phòng ban, trạm trực, tình trạng giấy phép lái xe và lịch công tác.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/staffs/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Thêm nhân viên</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Bộ lọc */}
      <StaffFilters
        filters={filters}
        departments={departments}
        facilities={facilities}
        onChange={updateFilters}
        onReset={handleResetFilters}
      />

      {/* Bảng dữ liệu */}
      {error ? (
        <ErrorState
          title="Không thể tải danh sách nhân sự"
          message={error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            data={data?.items || []}
            columns={columns}
            loading={isLoading}
            emptyTitle="Không tìm thấy nhân viên"
            emptyDescription="Thử nới lỏng bộ lọc hoặc tìm kiếm theo từ khóa khác."
            caption="Danh sách nhân viên và tài xế hệ thống Thong Dong"
          />

          {data && data.totalCount > 0 && (
            <div className="border-t border-line pt-4">
              <Pagination
                page={data.page}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                itemName="nhân sự"
                onPageChange={(page) => updateFilters({ page })}
                onPageSizeChange={(pageSize) => updateFilters({ pageSize, page: 1 })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StaffsPage() {
  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <StaffShell>
        <Suspense fallback={<div className="h-40 rounded-2xl bg-surface animate-pulse" />}>
          <StaffsListContent />
        </Suspense>
      </StaffShell>
    </AuthGate>
  );
}
