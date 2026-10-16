"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "@/components/navigation/NavigationLink";
import { CarFront, Pencil, Search, Trash2 } from "lucide-react";
import { deleteVehicle, getFacilities, getVehicleTypes, getVehicles } from "./api";
import type { OrganizationUnitDto, VehicleDto, VehicleTypeDto } from "./api";
import { useAuth } from "@/features/auth";
import { notifyApiError, notifySuccess } from "@/components/ui/Toaster";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import CreateVehicleButton from "./CreateVehicleButton";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";

const statusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  rented: "Đang thuê",
  maintenance: "Bảo dưỡng",
  unavailable: "Tạm ngưng",
};

export default function VehicleManagement() {
  const { hasRole } = useAuth();
  const canManage = hasRole("admin") || hasRole("manager");

  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [facilities, setFacilities] = useState<OrganizationUnitDto[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleDto | null>(null);

  const loadPage = useCallback(
    async (currentPage: number, currentPageSize: number, typeFilter: string, statusFilter: string) => {
      setLoading(true);
      try {
        const [response, types, facilityData] = await Promise.all([
          getVehicles({
            vehicleTypeId: typeFilter === "all" ? undefined : Number(typeFilter),
            status: statusFilter === "all" ? undefined : statusFilter,
            page: currentPage,
            pageSize: currentPageSize,
          }),
          getVehicleTypes(),
          getFacilities(),
        ]);
        setVehicles(response.items ?? []);
        setTotalCount(response.totalCount);
        setVehicleTypes(types);
        setFacilities(facilityData);
      } catch (loadError) {
        notifyApiError(loadError, "Không thể tải dữ liệu phương tiện.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage(page, pageSize, category, status);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [category, loadPage, page, pageSize, status]);

  const executeDeleteVehicle = async (vehicle: VehicleDto) => {
    if (!canManage || deletingId !== null) return;
    setDeletingId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id);
      notifySuccess(`Đã xóa xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() + ".");
      setVehicleToDelete(null);
      if (vehicles.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadPage(page, pageSize, category, status);
      }
    } catch (deleteError) {
      notifyApiError(deleteError, "Không thể xóa xe có lịch sử nghiệp vụ liên quan.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        query.length === 0 ||
        [`${vehicle.brand ?? ""} ${vehicle.model ?? ""}`, vehicle.licensePlate ?? "", vehicle.facility ?? ""]
          .some((value) => value.toLocaleLowerCase().includes(query));
      return matchesSearch;
    });
  }, [search, vehicles]);

  const columns = useMemo<ColumnDef<VehicleDto>[]>(() => {
    const cols: ColumnDef<VehicleDto>[] = [
      {
        id: "vehicle",
        header: "Phương tiện",
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                role={vehicle.mainImageUrl ? "img" : undefined}
                aria-label={vehicle.mainImageUrl ? `Ảnh ${vehicle.brand} ${vehicle.model}` : undefined}
                className="flex h-12 w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sunken bg-cover bg-center text-ink-3"
                style={vehicle.mainImageUrl ? { backgroundImage: `url("${vehicle.mainImageUrl}")` } : undefined}
              >
                {!vehicle.mainImageUrl && <CarFront className="h-5 w-5" />}
              </div>
              <span>
                <span className="block font-semibold text-ink">
                  {vehicle.brand} {vehicle.model}
                </span>
                {vehicle.licensePlate && (
                  <span className="mt-1 block text-xs text-ink-3">{vehicle.licensePlate}</span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        id: "typeAndYear",
        header: "Loại / Năm",
        cell: ({ row }) => {
          const vehicle = row.original;
          const typeName =
            vehicle.vehicleType?.trim() ||
            vehicleTypes.find((type) => type.id === vehicle.vehicleTypeId)?.name ||
            "Chưa có loại xe";
          return (
            <div className="text-ink-3">
              <span>{typeName}</span>
              <span className="mt-1 block text-xs text-ink-3">{vehicle.yearOfManufacture ?? "—"}</span>
            </div>
          );
        },
      },
      {
        id: "facility",
        header: "Chi nhánh",
        cell: ({ row }) => {
          const vehicle = row.original;
          const facilityName =
            vehicle.facility ?? facilities.find((item) => item.id === vehicle.facilityId)?.name ?? "—";
          return <span className="text-ink-3">{facilityName}</span>;
        },
      },
      {
        id: "price",
        header: "Giá thuê / giờ",
        cell: ({ row }) => {
          const price = row.original.hourlyPrice ?? 0;
          return (
            <span className="font-mono font-medium text-ink tabular-nums">
              {price.toLocaleString("vi-VN")} ₫
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const st = row.original.status ?? "";
          return <StatusBadge status={st} label={statusLabels[st]} />;
        },
      },
    ];

    if (canManage) {
      cols.push({
        id: "actions",
        header: () => <span className="block text-right">Thao tác</span>,
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Link
                href={`/admin/vehicles/edit?vehicleId=${vehicle.id}`}
                aria-label={`Chỉnh sửa ${vehicle.brand} ${vehicle.model}`}
                className="rounded-lg p-2 text-ink-3 transition hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setVehicleToDelete(vehicle)}
                disabled={loading || deletingId !== null}
                aria-label={`Xóa xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""}${vehicle.licensePlate ? ` (${vehicle.licensePlate})` : ""}`}
                className="rounded-lg p-2 text-danger transition hover:bg-danger-bg disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      });
    }

    return cols;
  }, [canManage, deletingId, facilities, loading, vehicleTypes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Phương tiện</h2>
          <p className="mt-2 text-sm text-ink-3">Quản lý thông tin, hình ảnh, giá thuê và tình trạng phương tiện.</p>
        </div>
        {canManage && (
          <CreateVehicleButton
            onSaved={() => {
              void loadPage(page, pageSize, category, status);
            }}
          />
        )}
      </div>

      <AdminFilterBar
        description="Tìm theo tên, biển số hoặc chi nhánh trên trang hiện tại."
        actions={
          <AdminFilterButton
            variant="secondary"
            disabled={!search && category === "all" && status === "all"}
            onClick={() => {
              setSearch("");
              setCategory("all");
              setStatus("all");
              setPage(1);
            }}
          >
            Đặt lại
          </AdminFilterButton>
        }
      >
        <AdminFilterField label="Tìm phương tiện" htmlFor="vehicle-filter-search" icon={Search}>
          <input
            id="vehicle-filter-search"
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, biển số hoặc chi nhánh..."
          />
        </AdminFilterField>
        <AdminFilterField label="Loại phương tiện" htmlFor="vehicle-filter-type" select>
          <select
            id="vehicle-filter-type"
            value={category}
            onChange={(event) => {
              setCategory(event.currentTarget.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả loại xe</option>
            {vehicleTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Trạng thái" htmlFor="vehicle-filter-status" select>
          <select
            id="vehicle-filter-status"
            value={status}
            onChange={(event) => {
              setStatus(event.currentTarget.value);
              setPage(1);
            }}
          >
            <option value="all">Mọi trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </AdminFilterField>
      </AdminFilterBar>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        <DataTable
          columns={columns}
          data={filteredVehicles}
          caption="Danh sách phương tiện"
          loading={loading}
          emptyTitle="Không tìm thấy phương tiện phù hợp."
          emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."
          className="border-0 rounded-none shadow-none"
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
          itemName="phương tiện"
          loading={loading}
        />
      </div>

      <ConfirmDialog
        open={vehicleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(null);
        }}
        title="Xác nhận xóa phương tiện"
        description={`Bạn có chắc chắn muốn xóa xe ${vehicleToDelete?.brand ?? ""} ${vehicleToDelete?.model ?? ""}${
          vehicleToDelete?.licensePlate ? ` (${vehicleToDelete.licensePlate})` : ""
        }? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa phương tiện"
        cancelLabel="Hủy"
        variant="danger"
        isPending={deletingId !== null}
        onConfirm={async () => {
          if (vehicleToDelete) await executeDeleteVehicle(vehicleToDelete);
        }}
      />
    </div>
  );
}
