"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CarFront,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Trash2,
  Pencil,
  Search,
} from "lucide-react";
import { deleteVehicle, getFacilities, getVehicleTypes, getVehicles } from "./api";
import type { OrganizationUnitDto, VehicleDto, VehicleTypeDto } from "./api";
import { useAuth } from "@/features/auth";
import { notifyApiError, notifySuccess } from "@/components/ui/Toaster";

const statusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  rented: "Đang thuê",
  maintenance: "Bảo dưỡng",
  unavailable: "Tạm ngưng",
};

const statusStyles: Record<string, string> = {
  available: "bg-primary/10 text-primary",
  rented: "bg-info-bg text-info",
  maintenance: "bg-primary-tint text-warning",
  unavailable: "bg-sunken text-ink-3",
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
    if (!canManage || deletingId !== null || !window.confirm(`Xóa xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""} (#${vehicle.id})?`)) return;
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
        [`${vehicle.brand ?? ""} ${vehicle.model ?? ""}`, String(vehicle.id), vehicle.facility ?? ""]
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
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Phương tiện</h2>
          <p className="mt-2 text-sm text-ink-3">Quản lý thông tin, hình ảnh, giá thuê và tình trạng phương tiện.</p>
        </div>
        {canManage && (
          <Link href="/admin/vehicles/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover">
            <CirclePlus className="h-4 w-4" /> Thêm phương tiện
          </Link>
        )}
      </div>

      <p className="text-xs text-ink-3">Tìm kiếm theo tên, ID hoặc chi nhánh đang lọc các phương tiện trên trang hiện tại.</p>
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:p-5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tìm phương tiện</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input value={search} onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }} placeholder="Tìm theo tên, ID hoặc chi nhánh..." className="admin-input admin-search-input" />
          </label>
          <label className="relative">
            <span className="sr-only">Lọc theo loại phương tiện</span>
            <select value={category} onChange={(event) => {
              setCategory(event.currentTarget.value);
              setPage(1);
            }} className="admin-input min-w-[175px] appearance-none pr-9">
              <option value="all">Tất cả loại xe</option>
              {vehicleTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          </label>
          <label className="relative">
            <span className="sr-only">Lọc theo trạng thái</span>
            <select value={status} onChange={(event) => {
              setStatus(event.currentTarget.value);
              setPage(1);
            }} className="admin-input min-w-[150px] appearance-none pr-9">
              <option value="all">Mọi trạng thái</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-sunken text-xs font-bold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-5 py-3">Phương tiện</th>
                <th className="px-4 py-3">Loại / Năm</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Giá thuê / giờ</th>
                <th className="px-4 py-3">Trạng thái</th>
                {canManage && <th className="px-5 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="text-sm hover:bg-canvas/60">
                  <td className="px-5 py-3.5">
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
                        <span className="block font-semibold text-ink">{vehicle.brand} {vehicle.model}</span>
                        <span className="mt-1 block text-xs text-ink-3">ID #{vehicle.id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-ink-3">{vehicle.vehicleType ?? `Loại #${vehicle.vehicleTypeId}`}<span className="mt-1 block text-xs text-ink-3">{vehicle.yearOfManufacture ?? "—"}</span></td>
                  <td className="px-4 py-3.5 text-ink-3">{vehicle.facility ?? facilities.find((item) => item.id === vehicle.facilityId)?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 font-medium text-ink">{(vehicle.hourlyPrice ?? 0).toLocaleString("vi-VN")} ₫</td>
                  <td className="px-4 py-3.5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[vehicle.status ?? ""] ?? "bg-sunken text-ink-3"}`}>{statusLabels[vehicle.status ?? ""] ?? vehicle.status ?? "—"}</span></td>
                  {canManage && (
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/vehicles/edit?vehicleId=${vehicle.id}`} aria-label={`Chỉnh sửa ${vehicle.brand} ${vehicle.model}`} className="rounded-lg p-2 text-ink-3 transition hover:bg-primary/10 hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button type="button" onClick={() => void removeVehicle(vehicle)} disabled={loading || deletingId !== null} aria-label={`Xóa xe #${vehicle.id}`} className="rounded-lg p-2 text-danger transition hover:bg-danger-bg disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && filteredVehicles.length === 0 && (
                <tr><td colSpan={canManage ? 6 : 5} className="px-5 py-14 text-center text-sm text-ink-3">Không tìm thấy phương tiện phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
            <span>Hiển thị {firstResult}–{lastResult} trong {totalCount} phương tiện</span>
            <label className="flex items-center gap-2">
              <span>Số dòng:</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.currentTarget.value));
                  setPage(1);
                }}
                className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs text-ink outline-none focus:border-primary"
                aria-label="Số phương tiện mỗi trang"
              >
                {[5, 10, 20].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>
          <nav aria-label="Phân trang phương tiện" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1 || loading}
              aria-label="Trang trước"
              className="rounded-lg border border-line p-2 text-ink-3 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
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
                className={`h-9 min-w-9 rounded-lg px-2 text-xs font-semibold transition ${
                  currentPage === pageNumber
                    ? "bg-primary text-white"
                    : "border border-line text-ink-3 hover:bg-canvas"
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
              className="rounded-lg border border-line p-2 text-ink-3 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}
