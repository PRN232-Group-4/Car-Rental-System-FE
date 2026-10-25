"use client";

import { useEffect, useState } from "react";
import { CarFront, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { vehicleQueryOptions } from "@/features/admin/vehicle-query";
import VehicleImage from "@/components/ui/VehicleImage";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import type { VehicleDto } from "@/features/admin/api";
import { useDriverPortalAccount } from "./DriverPortalShell";
import { getDriverSchedule } from "./api";

const statusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  rented: "Đang thuê",
  maintenance: "Bảo dưỡng",
  unavailable: "Tạm ngưng",
};

export default function DriverVehicles() {
  const account = useDriverPortalAccount();
  const queryClient = useQueryClient();
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const now = new Date();
          const from = new Date(now);
          from.setFullYear(from.getFullYear() - 1);
          const to = new Date(now);
          to.setFullYear(to.getFullYear() + 1);
          const assignments = await getDriverSchedule(
            account.staffId,
            from.toISOString(),
            to.toISOString(),
          );
          const vehicleIds = [...new Set(
            assignments
              .map((assignment) => assignment.vehicleId)
              .filter(
                (id): id is number =>
                  typeof id === "number" && Number.isInteger(id) && id > 0,
              ),
          )];
          const assignedVehicles = await Promise.all(vehicleIds.map((id) => queryClient.fetchQuery(vehicleQueryOptions(id))));
          if (active) setVehicles(assignedVehicles);
        } catch (loadError) {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Không thể tải danh sách phương tiện được phân công.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [account.staffId, queryClient]);

  return (
    <div className="space-y-6">
      <TransitFolio
        index="10"
        tag="NV"
        kicker="NHÂN VIÊN · PHƯƠNG TIỆN PHÂN CÔNG"
        title={<>Phương tiện <span className="text-td-teal">của tôi.</span></>}
        description="Danh sách xe có lịch phân công cho bạn trong khoảng một năm trước và sau ngày hiện tại."
      >
        <div className="border-l border-td-rule pl-4 text-right">
          <span className="block font-mono text-[10px] tracking-wider text-td-muted">ĐƯỢC PHÂN CÔNG</span>
          <strong className="block text-3xl font-bold tracking-tight text-td-ink">
            {loading ? "—" : String(vehicles.length).padStart(2, "0")}
          </strong>
        </div>
      </TransitFolio>

      {error && (
        <p role="alert" className="border-l-2 border-danger pl-3 text-sm text-danger">
          {error}
        </p>
      )}
      {loading && (
        <SkeletonBlock label="Đang tải phương tiện được phân công" className="space-y-2">
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-16 w-full rounded" />)}
        </SkeletonBlock>
      )}
      {!loading && !error && vehicles.length === 0 && (
        <div className="border-t border-td-ink py-12 text-center">
          <CarFront className="mx-auto h-8 w-8 text-td-muted" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-td-ink">Chưa có phương tiện được phân công</p>
          <p className="mt-1 text-xs text-td-muted">Trong khoảng thời gian này bạn chưa được giao xe nào.</p>
        </div>
      )}

      {vehicles.length > 0 && (
        <section aria-label="Phương tiện được phân công" className="border-t border-td-ink">
          <div className="grid grid-cols-12 gap-4 border-b border-td-ink py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-td-muted">
            <span className="col-span-5">Phương tiện</span>
            <span className="col-span-3">Vị trí</span>
            <span className="col-span-2">Giá thuê</span>
            <span className="col-span-2 text-right">Trạng thái</span>
          </div>
          <div className="divide-y divide-td-rule border-b border-td-rule">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="grid grid-cols-12 items-center gap-4 py-3">
                <div className="col-span-5 flex min-w-0 items-center gap-3">
                  <VehicleImage
                    src={vehicle.mainImageUrl}
                    alt={[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Phương tiện"}
                    className="h-11 w-16 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-td-ink">
                      {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || `Phương tiện #${vehicle.id}`}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-td-muted">
                      {vehicle.licensePlate ?? "Chưa có biển số"} · {vehicle.vehicleType ?? "Chưa phân loại"}
                      {vehicle.yearOfManufacture ? ` · ${vehicle.yearOfManufacture}` : ""}
                    </span>
                  </div>
                </div>
                <span className="col-span-3 flex min-w-0 items-center gap-1.5 text-xs text-td-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{vehicle.location || vehicle.facility || "Chưa có vị trí"}</span>
                </span>
                <span className="col-span-2 font-mono text-[11px] text-td-ink">
                  {vehicle.hourlyPrice === null
                    ? "Chưa cập nhật"
                    : `${vehicle.hourlyPrice.toLocaleString("vi-VN")} ₫/h`}
                </span>
                <div className="col-span-2 flex justify-end">
                  <AdminStatusBadge domain="vehicle" status={vehicle.status}>
                    {statusLabels[vehicle.status?.toLowerCase() ?? ""] ?? vehicle.status ?? "Chưa rõ"}
                  </AdminStatusBadge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
