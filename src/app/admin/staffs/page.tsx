"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthGate } from "@/features/auth/AuthGate";
import { useStaffs, useDepartments, useFacilities } from "@/features/admin/staff/hooks";
import { StaffFilters } from "@/features/admin/staff/components/StaffFilters";
import { LicenseBadge } from "@/features/admin/staff/components/LicenseBadge";
import { StaffListItem, StaffFilterParams } from "@/features/admin/staff/types";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
import {
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-td-rule bg-td-chalk font-mono text-xs font-bold text-td-oxide">
                {initials || <User className="w-4 h-4 text-td-muted" />}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/admin/staffs/detail?id=${s.id}`}
                  className="font-bold text-sm text-td-ink hover:text-td-oxide transition-colors block truncate"
                >
                  {s.fullName}
                </Link>
                <span className="font-mono text-[11px] text-td-muted block truncate">{s.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "department",
        header: "Phòng ban",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-td-muted">
            {row.original.department?.name || "Chưa phân bổ"}
          </span>
        ),
      },
      {
        id: "facility",
        header: "Cơ sở trực",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-td-muted truncate block max-w-[180px]">
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
              className="inline-flex items-center gap-1 rounded border border-td-oxide/30 bg-td-chalk px-2 py-0.5 text-[11px] font-bold text-td-oxide"
              title="Nhân viên thuộc đội ngũ tài xế"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Tài xế</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded border border-td-rule px-2 py-0.5 text-[11px] font-medium text-td-muted"
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
                <span className="block font-mono text-[10px] text-td-muted">
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
            <span className="inline-flex items-center gap-1 rounded border border-td-rule bg-td-chalk px-2 py-1 font-mono text-xs font-bold text-td-ink">
              <Star className="w-3.5 h-3.5 text-td-oxide fill-td-oxide" />
              <span>{rating.toFixed(2)}</span>
            </span>
          ) : (
            <span className="font-mono text-xs text-td-muted">—</span>
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
              {active ? "Đang làm việc" : "Tạm ngừng"}
            </AdminStatusBadge>
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
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-td-rule text-td-ink hover:border-td-oxide hover:text-td-oxide transition-colors cursor-pointer"
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
      <TransitFolio
        index="07"
        tag="ORG"
        kicker="TỔ CHỨC · ĐỘI NGŨ & NHÂN SỰ"
        title={<>Nhân viên & <span className="text-td-teal">tài xế.</span></>}
        description="Theo dõi phân bổ phòng ban, trạm trực, tình trạng giấy phép lái xe và lịch công tác."
      >
        <TransitFolioMetric
          label="ĐỘI NGŨ · TỔNG NHÂN SỰ"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : String(data?.totalCount ?? 0).padStart(2, "0")}
        />
        <Link
          href="/admin/staffs/new"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </Link>
      </TransitFolio>

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
            <div className="border-t border-td-rule pt-3">
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
        <Suspense fallback={<div className="h-40 rounded bg-td-white animate-pulse" />}>
          <StaffsListContent />
        </Suspense>
    </AuthGate>
  );
}
