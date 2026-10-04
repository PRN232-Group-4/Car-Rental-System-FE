"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CarFront,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Info,
  Pencil,
  Search,
} from "lucide-react";
import { getFacilities, getVehicleTypes, getVehicles } from "./api";
import type { OrganizationUnitDto, VehicleDto, VehicleTypeDto } from "./api";

const statusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  rented: "Đang thuê",
  maintenance: "Bảo dưỡng",
  unavailable: "Tạm ngưng",
};

const statusStyles: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700",
  rented: "bg-blue-50 text-blue-700",
  maintenance: "bg-amber-50 text-amber-700",
  unavailable: "bg-slate-100 text-slate-600",
};

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [facilities, setFacilities] = useState<OrganizationUnitDto[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (currentPage: number, currentPageSize: number, typeFilter: string, statusFilter: string) => {
    setLoading(true);
    setError("");
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
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu phương tiện.");
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Quản lý đội xe</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Phương tiện</h2>
          <p className="mt-2 text-sm text-slate-500">Quản lý thông tin, hình ảnh, giá thuê và tình trạng phương tiện.</p>
        </div>
        <Link href="/admin/vehicles/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800">
          <CirclePlus className="h-4 w-4" /> Thêm phương tiện
        </Link>
      </div>

      <p className="text-xs text-slate-500">Tìm kiếm theo tên, ID hoặc chi nhánh đang lọc các phương tiện trên trang hiện tại.</p>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        API hiện hỗ trợ xem, thêm và cập nhật phương tiện; chưa có endpoint xóa.
      </p>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tìm phương tiện</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Phương tiện</th>
                <th className="px-4 py-3">Loại / Năm</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Giá thuê / giờ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="text-sm hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        role={vehicle.mainImageUrl ? "img" : undefined}
                        aria-label={vehicle.mainImageUrl ? `Ảnh ${vehicle.brand} ${vehicle.model}` : undefined}
                        className="flex h-12 w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 bg-cover bg-center text-slate-400"
                        style={vehicle.mainImageUrl ? { backgroundImage: `url("${vehicle.mainImageUrl}")` } : undefined}
                      >
                        {!vehicle.mainImageUrl && <CarFront className="h-5 w-5" />}
                      </div>
                      <span>
                        <span className="block font-semibold text-slate-800">{vehicle.brand} {vehicle.model}</span>
                        <span className="mt-1 block text-xs text-slate-400">ID #{vehicle.id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{vehicle.vehicleType ?? `Loại #${vehicle.vehicleTypeId}`}<span className="mt-1 block text-xs text-slate-400">{vehicle.yearOfManufacture ?? "—"}</span></td>
                  <td className="px-4 py-3.5 text-slate-600">{vehicle.facility ?? facilities.find((item) => item.id === vehicle.facilityId)?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{(vehicle.hourlyPrice ?? 0).toLocaleString("vi-VN")} ₫</td>
                  <td className="px-4 py-3.5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[vehicle.status ?? ""] ?? "bg-slate-100 text-slate-600"}`}>{statusLabels[vehicle.status ?? ""] ?? vehicle.status ?? "—"}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/vehicles/edit?vehicleId=${vehicle.id}`} aria-label={`Chỉnh sửa ${vehicle.brand} ${vehicle.model}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredVehicles.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">Không tìm thấy phương tiện phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>Hiển thị {firstResult}–{lastResult} trong {totalCount} phương tiện</span>
            <label className="flex items-center gap-2">
              <span>Số dòng:</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.currentTarget.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-emerald-500"
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
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}
