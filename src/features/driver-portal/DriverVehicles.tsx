"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { vehicleQueryOptions } from "@/features/admin/vehicle-query";
import VehicleImage from "@/components/ui/VehicleImage";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Phương tiện của tôi
        </h2>
        <p className="mt-2 text-sm text-ink-3">
          Danh sách xe có lịch phân công cho bạn trong khoảng một năm trước và sau ngày hiện tại.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {loading && (
        <SkeletonBlock label="Đang tải phương tiện được phân công" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-line bg-surface"><Skeleton className="h-44 w-full rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3" /></div></div>)}
        </SkeletonBlock>
      )}
      {!loading && !error && vehicles.length === 0 && (
        <p className="rounded-xl border border-line bg-surface px-4 py-5 text-sm text-ink-3">
          Chưa có phương tiện nào được phân công trong khoảng thời gian này.
        </p>
      )}

      {vehicles.length > 0 && (
        <section aria-label="Phương tiện được phân công" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1"
            >
              <VehicleImage src={vehicle.mainImageUrl} alt={[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Phương tiện"} className="h-44 w-full" />
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">
                      {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || `Phương tiện #${vehicle.id}`}
                    </h3>
                    <p className="mt-1 text-sm text-ink-3">
                      {vehicle.vehicleType ?? "Chưa phân loại"}{vehicle.yearOfManufacture ? ` · ${vehicle.yearOfManufacture}` : ""}
                    </p>
                  </div>
                  <AdminStatusBadge domain="vehicle" status={vehicle.status}>
                    {statusLabels[vehicle.status?.toLowerCase() ?? ""] ?? vehicle.status ?? "Chưa rõ"}
                  </AdminStatusBadge>
                </div>
                <p className="flex items-center gap-2 text-sm text-ink-3">
                  <MapPin className="h-4 w-4 shrink-0 text-ink-3" />
                  {vehicle.location || vehicle.facility || "Chưa có vị trí"}
                </p>
                <p className="border-t border-line pt-3 text-sm font-semibold text-ink">
                  {vehicle.hourlyPrice === null
                    ? "Giá thuê chưa được cập nhật"
                    : `${vehicle.hourlyPrice.toLocaleString("vi-VN")} ₫ / giờ`}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
