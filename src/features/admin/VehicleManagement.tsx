"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { deleteVehicle, getFacilities, getVehicleTypes, getVehicles } from "./api";
import type { OrganizationUnitDto, VehicleDto, VehicleTypeDto } from "./api";
import { useAuth } from "@/features/auth";
import { notifyApiError, notifySuccess } from "@/components/ui/Toaster";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import CreateVehicleButton from "./CreateVehicleButton";
import VehicleForm from "./VehicleForm";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { VehicleIdentity } from "./VehicleName";
import { InlineSelect } from "@/components/forms/inline-validation";

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
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const closeEdit = useCallback(() => setEditingVehicleId(null), []);

  const loadPage = useCallback(async (currentPage: number, currentPageSize: number, typeFilter: string, statusFilter: string) => {
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
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage(page, pageSize, category, status);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [category, loadPage, page, pageSize, status]);

  const removeVehicle = async (vehicle: VehicleDto) => {
    if (!canManage || deletingId !== null || !window.confirm(`Xóa xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""}${vehicle.licensePlate ? ` (${vehicle.licensePlate})` : ""}?`)) return;
    setDeletingId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id);
      notifySuccess(`Đã xóa xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() + ".");
      if (vehicles.length === 1 && page > 1) setPage(page - 1);
      else await loadPage(page, pageSize, category, status);
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

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, pageCount);
  const firstResult = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, totalCount);
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => Math.max(1, Math.min(pageCount - 4, currentPage - 2)) + index,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-td-ink sm:text-3xl">Phương tiện</h2>
          <p className="mt-2 text-sm text-td-muted">Quản lý thông tin, hình ảnh, giá thuê và tình trạng phương tiện.</p>
        </div>
        {canManage && (
          <CreateVehicleButton onSaved={() => { void loadPage(page, pageSize, category, status); }} />
        )}
      </div>

      <AdminFilterBar description="Tìm theo tên, biển số hoặc chi nhánh trên trang hiện tại." actions={
        <AdminFilterButton variant="secondary" disabled={!search && category === "all" && status === "all"} onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); setPage(1); }}>Đặt lại</AdminFilterButton>
      }>
        <AdminFilterField label="Tìm phương tiện" htmlFor="vehicle-filter-search" icon={Search}>
          <input id="vehicle-filter-search" value={search} onChange={(event) => { setSearch(event.currentTarget.value); setPage(1); }} placeholder="Tìm theo tên, biển số hoặc chi nhánh..." />
        </AdminFilterField>
        <AdminFilterField label="Loại phương tiện" htmlFor="vehicle-filter-type" select>
          <InlineSelect id="vehicle-filter-type" value={category} onChange={(event) => { setCategory(event.currentTarget.value); setPage(1); }}>
            <option value="all">Tất cả loại xe</option>{vehicleTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </InlineSelect>
        </AdminFilterField>
        <AdminFilterField label="Trạng thái" htmlFor="vehicle-filter-status" select>
          <InlineSelect id="vehicle-filter-status" value={status} onChange={(event) => { setStatus(event.currentTarget.value); setPage(1); }}>
            <option value="all">Mọi trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </InlineSelect>
        </AdminFilterField>
      </AdminFilterBar>
      <AdminTableCard>
        <AdminTable className="min-w-[760px]" aria-busy={loading}>
          <caption className="sr-only">Danh sách phương tiện</caption>
          <thead>
            <tr>
              <th scope="col">Phương tiện</th>
              <th scope="col">Loại / Năm</th>
              <th scope="col">Chi nhánh</th>
              <th scope="col">Giá thuê / giờ</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Hạng bằng lái</th>
              {canManage && <th scope="col" data-actions>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <AdminTableSkeleton columns={canManage ? 7 : 6} rows={pageSize} label="Đang tải danh sách phương tiện" /> : filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>
                  <VehicleIdentity vehicle={vehicle} />
                </td>
                <td className="text-td-muted">{vehicle.vehicleType?.trim() || vehicleTypes.find((type) => type.id === vehicle.vehicleTypeId)?.name || "Chưa có loại xe"}<span className="mt-1 block text-xs text-td-muted">{vehicle.yearOfManufacture ?? "—"}</span></td>
                <td className="text-td-muted">{vehicle.facility ?? facilities.find((item) => item.id === vehicle.facilityId)?.name ?? "—"}</td>
                <td className="font-medium text-td-ink">{(vehicle.hourlyPrice ?? 0).toLocaleString("vi-VN")} ₫</td>
                <td><AdminStatusBadge domain="vehicle" status={vehicle.status}>{statusLabels[vehicle.status ?? ""] ?? vehicle.status ?? "—"}</AdminStatusBadge></td>
                <td className="text-td-muted">{vehicle.allowedLicenseTypes?.length ? vehicle.allowedLicenseTypes.join(", ") : "Mọi hạng hợp lệ"}</td>
                {canManage && (
                  <td data-actions>
                    <div className="flex justify-end gap-1">
                      <AdminRowAction action="edit" label={`Chỉnh sửa ${vehicle.brand} ${vehicle.model}`} onClick={() => setEditingVehicleId(vehicle.id)} />
                      <AdminRowAction action="delete" label={`Xóa xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""}${vehicle.licensePlate ? ` (${vehicle.licensePlate})` : ""}`} onClick={() => void removeVehicle(vehicle)} disabled={loading || deletingId !== null} isLoading={deletingId === vehicle.id} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!loading && filteredVehicles.length === 0 && (
              <AdminTableEmptyRow colSpan={canManage ? 7 : 6}>Không tìm thấy phương tiện phù hợp.</AdminTableEmptyRow>
            )}
          </tbody>
        </AdminTable>
        <div className="flex flex-col gap-4 border-t border-td-rule px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-td-muted">
            <span>Hiển thị {firstResult}–{lastResult} trong {totalCount} phương tiện</span>
            <label className="flex items-center gap-2">
              <span>Số dòng:</span>
              <InlineSelect
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.currentTarget.value));
                  setPage(1);
                }}
                className="rounded border border-td-rule bg-td-white px-2 py-1.5 text-xs text-td-ink outline-none focus:border-td-oxide"
                aria-label="Số phương tiện mỗi trang"
              >
                {[5, 10, 20].map((size) => <option key={size} value={size}>{size}</option>)}
              </InlineSelect>
            </label>
          </div>
          <nav aria-label="Phân trang phương tiện" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1 || loading}
              aria-label="Trang trước"
              className="rounded border border-td-rule p-2 text-td-muted transition hover:bg-td-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                disabled={loading}
                aria-label={`Trang ${pageNumber}`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                className={`h-9 min-w-9 rounded px-2 text-xs font-semibold transition ${
                  currentPage === pageNumber
                    ? "bg-td-oxide text-white"
                    : "border border-td-rule text-td-muted hover:bg-td-paper"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={currentPage === pageCount || loading}
              aria-label="Trang tiếp theo"
              className="rounded border border-td-rule p-2 text-td-muted transition hover:bg-td-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </AdminTableCard>
      {editingVehicleId !== null && <VehicleForm key={editingVehicleId} editingVehicleId={editingVehicleId} onClose={closeEdit} onSaved={() => { closeEdit(); void loadPage(page, pageSize, category, status); }} />}
    </div>
  );
}
