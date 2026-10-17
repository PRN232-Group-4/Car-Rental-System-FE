"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { VehicleDetailView } from "@/features/vehicles/components/VehicleDetailView";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  getVehicleById,
  getActiveRentalPolicy,
  getVehicleBusySlots,
  getVehicles,
} from "@/features/vehicles/api";
import { Vehicle, RentalPolicy, BusySlot } from "@/features/vehicles/types";
import { ArrowLeft, Car } from "lucide-react";

function VehicleDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id") || "";
  const initialFrom = searchParams.get("from") || undefined;
  const initialTo = searchParams.get("to") || undefined;
  const initialMode = (searchParams.get("mode") as "self" | "driver" | "subscription") || "self";

  const [loading, setLoading] = useState(!id ? false : true);
  const [error, setError] = useState<string | null>(!id ? "Mã phương tiện không hợp lệ" : null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [policy, setPolicy] = useState<RentalPolicy | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    if (!id) {
      setError("Mã phương tiện không hợp lệ");
      setLoading(false);
    } else {
      setError(null);
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchVehicleData = async () => {
      try {
        const found = await getVehicleById(id);
        if (!isMounted) return;

        if (!found) {
          setVehicle(null);
          return;
        }

        setVehicle(found);

        // Fetch policy, busy slots & similar vehicles in parallel
        const [activePol, slots, similar] = await Promise.all([
          getActiveRentalPolicy(found.vehicleTypeId || 1),
          getVehicleBusySlots(found.id),
          getVehicles({ facilityId: found.facilityId }),
        ]);

        if (isMounted) {
          setPolicy(activePol);
          setBusySlots(slots);
          setSimilarVehicles(similar.filter((v) => String(v.id) !== String(found.id)));
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Không thể tải chi tiết xe");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchVehicleData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title="Lỗi tải dữ liệu xe"
          message={error}
          onRetry={() => window.location.reload()}
          action={
            <Button variant="secondary" onClick={() => router.push("/find")}>
              Quay về trang tìm xe
            </Button>
          }
        />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={Car}
          title="Không tìm thấy phương tiện"
          description="Phương tiện bạn đang tìm kiếm không tồn tại hoặc đã ngừng cung cấp dịch vụ."
          action={
            <Button variant="primary" onClick={() => router.push("/find")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Xem danh mục xe có sẵn</span>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <VehicleDetailView
      vehicle={vehicle}
      policy={policy}
      busySlots={busySlots}
      similarVehicles={similarVehicles}
      initialFrom={initialFrom}
      initialTo={initialTo}
      initialMode={initialMode}
    />
  );
}

function VehicleDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 rounded bg-sunken" />

      {/* Title skeleton */}
      <div className="space-y-3 border-b border-line pb-6">
        <div className="h-4 w-32 rounded bg-sunken" />
        <div className="h-8 w-80 rounded-xl bg-sunken" />
        <div className="h-4 w-48 rounded bg-sunken/60" />
      </div>

      {/* 2-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6">
          <div className="aspect-[16/10] w-full rounded-3xl bg-sunken" />
          <div className="h-32 rounded-2xl bg-sunken" />
          <div className="h-48 rounded-2xl bg-sunken" />
        </div>
        <div className="h-[460px] rounded-3xl bg-sunken" />
      </div>
    </div>
  );
}

export default function VehicleDetailPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-canvas text-ink">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<VehicleDetailSkeleton />}>
          <VehicleDetailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
