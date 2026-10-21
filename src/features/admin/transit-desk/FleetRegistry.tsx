"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/features/auth";
import {
  deleteVehicle,
  getVehicles,
  type VehicleDto,
} from "@/features/admin/api";
import { notifyApiError, notifySuccess } from "@/components/ui/Toaster";
import TransitDeskStatus from "./TransitDeskStatus";
import { TransitFolio, TransitFolioMetric } from "./TransitFolio";
import { Skeleton } from "@/components/ui/Skeleton";
import VehiclePhotos from "@/features/admin/VehiclePhotos";
import { Search, ChevronLeft, ChevronRight, X, Edit, Trash2, Plus } from "lucide-react";

const NO_VEHICLES: VehicleDto[] = [];

export function FleetRegistry() {
  const { hasRole } = useAuth();
  const canManage = hasRole("admin") || hasRole("manager");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isFolioClosed, setIsFolioClosed] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Một query cho trang hiện tại: không setState trong effect, react-query giữ cache.
  const pageQuery = useQuery({
    queryKey: ["fleet-registry", page, pageSize, statusFilter],
    queryFn: async () => {
      const response = await getVehicles({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize,
      });
      return {
        items: response.items ?? NO_VEHICLES,
        totalCount: response.totalCount,
      };
    },
    retry: false,
  });

  const vehicles = pageQuery.data?.items ?? NO_VEHICLES;
  const totalCount = pageQuery.data?.totalCount ?? 0;
  const loading = pageQuery.isPending;

  const closeFolio = () => setIsFolioClosed(true);
  const selectVehicle = (vehicle: VehicleDto) => {
    setSelectedVehicleId(vehicle.id);
    setIsFolioClosed(false);
  };

  // Handle client-side search filter over current page
  const filteredVehicles = useMemo<VehicleDto[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const matchText = `${v.licensePlate ?? ""} ${v.brand ?? ""} ${v.model ?? ""} ${v.facility ?? ""}`.toLowerCase();
      return matchText.includes(q);
    });
  }, [vehicles, search]);

  // Hồ sơ đang mở suy ra từ danh sách đang hiển thị, không cần đồng bộ state.
  const selectedVehicle = useMemo<VehicleDto | null>(() => {
    if (isFolioClosed || filteredVehicles.length === 0) return null;
    return filteredVehicles.find((v) => v.id === selectedVehicleId) ?? filteredVehicles[0];
  }, [filteredVehicles, selectedVehicleId, isFolioClosed]);

  // Handle Escape key to close Context Folio (P1-04)
  useEffect(() => {
    if (!selectedVehicle) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFolioClosed(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVehicle]);

  // Handle delete
  const handleDelete = async (vehicle: VehicleDto) => {
    if (!canManage || deletingId !== null) return;
    const confirmName = `${vehicle.brand ?? ""} ${vehicle.model ?? ""} (${vehicle.licensePlate?.trim() || "Chưa có biển số"})`;
    if (!window.confirm(`Xác nhận xóa phương tiện ${confirmName}? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    setDeletingId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id);
      notifySuccess(`Đã xóa phương tiện ${confirmName}.`);
      if (vehicles.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await pageQuery.refetch();
      }
    } catch (err) {
      notifyApiError(err, "Không thể xóa phương tiện có lịch sử đơn thuê hoặc bảo dưỡng liên quan.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Folio */}
      <TransitFolio
        index="02"
        tag="FLT"
        kicker="TÀI SẢN · ĐỘI XE"
        title={<>Sổ <em className="italic text-td-teal">phương tiện.</em></>}
        description="Nhìn biển số trước, đọc thông số sau. Bảng tra cứu dữ liệu mở (Open Ledger), không đóng khung card rời cho từng bản ghi."
      >
        <TransitFolioMetric
          label="FLEET REGISTRY · TỔNG QUY MÔ"
          value={loading ? <Skeleton className="h-8 w-16" /> : String(totalCount).padStart(2, "0")}
        />
        {canManage && (
          <Link
            href="/admin/vehicles/new"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover"
          >
            <Plus className="h-4 w-4" />
            <span>Đăng ký xe mới</span>
          </Link>
        )}
      </TransitFolio>

      {/* Toolbar: Search + Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-td-ink pb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-td-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Biển số, hãng xe, cơ sở..."
              aria-label="Tìm phương tiện"
              className="w-full border-b border-td-rule bg-transparent py-1.5 pl-8 pr-3 font-mono text-xs text-td-ink placeholder-td-muted outline-none focus:border-td-ink"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {[
              { id: "all", label: "Tất cả" },
              { id: "available", label: "Sẵn sàng" },
              { id: "rented", label: "Đang thuê" },
              { id: "maintenance", label: "Bảo dưỡng" },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`border-b-2 px-3 py-1 font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "border-td-oxide text-td-oxide"
                      : "border-transparent text-td-muted hover:text-td-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <span className="font-mono text-xs text-td-muted">
          Trang {page} / {totalPages}
        </span>
      </div>

      {/* Main Layout: Ledger (Left) + Contextual Folio (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Open Ledger */}
        <div className="lg:col-span-8 overflow-x-auto">
          <div className="min-w-[620px]">
            {/* Ledger Head */}
            <div className="grid grid-cols-12 gap-4 border-b border-td-ink py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-td-muted">
              <span className="col-span-3">BIỂN SỐ</span>
              <span className="col-span-3">PHƯƠNG TIỆN</span>
              <span className="col-span-3">CƠ SỞ TRẠM</span>
              <span className="col-span-3 text-right">TRẠNG THÁI</span>
            </div>

            {/* Ledger Rows */}
            {loading ? (
              <div className="space-y-2 py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-td-muted border-b border-td-rule">
                Không tìm thấy phương tiện nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="divide-y divide-td-rule border-b border-td-rule">
                {filteredVehicles.map((v) => {
                  const isSelected = selectedVehicle?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => selectVehicle(v)}
                      aria-pressed={isSelected ? "true" : "false"}
                      className={`grid w-full grid-cols-12 items-center gap-4 py-3.5 px-2 text-left transition-colors cursor-pointer relative ${
                        isSelected
                          ? "bg-td-chalk/70"
                          : "hover:bg-td-chalk/30"
                      }`}
                    >
                      {/* Left marker line on selected row */}
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-td-oxide"
                        />
                      )}

                      {/* License plate */}
                      <div className="col-span-3 pl-2">
                        <span className="font-mono text-xs font-bold text-td-ink block tracking-tight">
                          {v.licensePlate?.trim() || "Chưa có biển số"}
                        </span>
                      </div>

                      {/* Vehicle Brand / Model */}
                      <div className="col-span-3 min-w-0">
                        <span className="text-xs font-semibold text-td-ink block truncate">
                          {v.brand} {v.model}
                        </span>
                        <span className="font-mono text-[10px] text-td-muted block">
                          {v.vehicleType || "Chưa phân loại"}
                        </span>
                      </div>

                      {/* Facility */}
                      <div className="col-span-3 min-w-0">
                        <span className="text-xs text-td-ink block truncate">
                          {v.facility || "Chưa gán trạm"}
                        </span>
                        <span className="font-mono text-[10px] text-td-muted block">
                          Năm SX: {v.yearOfManufacture || "—"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-3 text-right">
                        <TransitDeskStatus domain="vehicle" status={v.status}>
                          {v.status === "available"
                            ? "Sẵn sàng"
                            : v.status === "rented" || v.status === "renting"
                              ? "Đang thuê"
                              : v.status === "maintenance"
                                ? "Bảo dưỡng"
                                : v.status || "Chưa rõ"}
                        </TransitDeskStatus>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between py-4 font-mono text-xs text-td-muted">
              <span>{filteredVehicles.length} / {totalCount} xe trên hệ thống</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded border border-td-rule px-2.5 py-1 text-td-ink hover:bg-td-chalk disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Trước</span>
                </button>
                <span>{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded border border-td-rule px-2.5 py-1 text-td-ink hover:bg-td-chalk disabled:opacity-40 cursor-pointer"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contextual Folio - Theme-Aware Surface & Fidelity (P1-01 & P1-05) */}
        <aside
          aria-label="Hồ sơ chi tiết phương tiện"
          className="lg:col-span-4 rounded border border-td-rule bg-td-white p-6 text-td-ink flex flex-col justify-between transition-colors shadow-xs"
        >
          {selectedVehicle ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-td-rule pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-td-muted">
                    HỒ SƠ PHƯƠNG TIỆN
                  </span>
                  <div className="font-mono text-2xl font-bold tracking-tight text-td-ink mt-1">
                    {selectedVehicle.licensePlate?.trim() || "Chưa có biển số"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeFolio}
                  aria-label="Đóng hồ sơ (Esc)"
                  className="rounded p-1 text-td-muted hover:text-td-ink hover:bg-td-chalk transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="font-sans text-xl font-bold tracking-tight text-td-ink">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </h3>
                {selectedVehicle.description && (
                  <p className="mt-1 text-xs text-td-muted leading-relaxed">
                    {selectedVehicle.description}
                  </p>
                )}
              </div>

              <VehiclePhotos vehicleId={selectedVehicle.id} />

              {/* Data specifications - High fidelity (P1-05: no repetitive placeholder dash spam) */}
              <div className="divide-y divide-td-rule border-y border-td-rule text-xs font-mono">
                {selectedVehicle.facility && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-td-muted">Cơ sở hiện tại</span>
                    <span className="font-semibold text-td-ink">{selectedVehicle.facility}</span>
                  </div>
                )}
                {selectedVehicle.vehicleType && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-td-muted">Phân loại xe</span>
                    <span className="font-semibold text-td-ink">{selectedVehicle.vehicleType}</span>
                  </div>
                )}
                {(selectedVehicle.color || selectedVehicle.yearOfManufacture) && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-td-muted">Màu sơn / Năm SX</span>
                    <span className="font-semibold text-td-ink">
                      {[selectedVehicle.color, selectedVehicle.yearOfManufacture].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                )}
                {selectedVehicle.hourlyPrice != null && selectedVehicle.hourlyPrice > 0 && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-td-muted">Giá thuê theo giờ</span>
                    <span className="font-semibold text-td-ink">
                      {new Intl.NumberFormat("vi-VN").format(selectedVehicle.hourlyPrice)} ₫/h
                    </span>
                  </div>
                )}
                {selectedVehicle.longtermPrice != null && selectedVehicle.longtermPrice > 0 && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-td-muted">Giá thuê dài hạn</span>
                    <span className="font-semibold text-td-ink">
                      {new Intl.NumberFormat("vi-VN").format(selectedVehicle.longtermPrice)} ₫/ngày
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Shelf */}
              {canManage && (
                <div className="pt-2 space-y-2">
                  <Link
                    href={`/admin/vehicles/edit?id=${selectedVehicle.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded border border-td-rule bg-td-paper px-4 py-2.5 text-xs font-bold text-td-ink hover:bg-td-chalk hover:border-td-ink transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Chỉnh sửa thông số xe</span>
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId === selectedVehicle.id}
                    onClick={() => handleDelete(selectedVehicle)}
                    className="flex w-full items-center justify-center gap-2 rounded border border-td-oxide/40 bg-td-chalk px-4 py-2 text-xs font-bold text-td-oxide hover:bg-td-oxide hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{deletingId === selectedVehicle.id ? "Đang xóa..." : "Xóa phương tiện"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center">
              <span className="font-mono text-xs text-td-muted uppercase tracking-wider block font-semibold">
                CHƯA CHỌN PHƯƠNG TIỆN
              </span>
              <p className="mt-2 text-xs text-td-muted max-w-xs mx-auto">
                Nhấp vào bất kỳ dòng nào trong Sổ phương tiện bên trái để xem hồ sơ kỹ thuật chi tiết.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default FleetRegistry;
