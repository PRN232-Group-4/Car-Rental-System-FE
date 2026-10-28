"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { MapPin, Clock, Phone, Car, ArrowUpRight } from "lucide-react";
import Link from "@/components/navigation/NavigationLink";
import { getFacilities, getInitialFacilities } from "../api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import MapboxMap from "@/components/maps/MapboxMap";
import { Flip } from "@/lib/motion/register";

interface FacilityExplorerProps {
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
}

export default function FacilityExplorer({ selectedFacilityId = "", onSelectFacility }: FacilityExplorerProps) {
  const [activeId, setActiveId] = useState(selectedFacilityId);
  const initial = getInitialFacilities();
  const query = useQuery({ queryKey: ["public-facilities"], queryFn: getFacilities, initialData: initial.length ? initial : undefined, retry: false });
  const facilities = query.data ?? [];
  const current = facilities.find((facility) => facility.id === activeId) ?? facilities[0];
  const address = current ? [current.address, current.district, current.city].filter(Boolean).join(", ") : "";

  // Phản hồi tức thì thay đổi trạng thái lọc của người dùng mà không bị giật khung hình.
  const handleSelectFacility = (facilityId: string) => {
    if (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const state = Flip.getState("[data-facility-card], [data-facility-preview]");
      setActiveId(facilityId);
      onSelectFacility?.(facilityId);
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.35,
          ease: "power2.out",
          fade: true,
        });
      });
    } else {
      setActiveId(facilityId);
      onSelectFacility?.(facilityId);
    }
  };

  return (
    <section id="chi-nhanh" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading title="Chi nhánh & điểm nhận xe" subtitle="Xem địa chỉ và chọn chỉ đường đến chi nhánh phù hợp với hành trình của bạn." />
      {query.isPending && (
        <SkeletonBlock label="Đang tải chi nhánh..." className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </SkeletonBlock>
      )}
      {query.error && (
        <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-bg p-5 text-sm text-danger">
          <p>Chưa tải được danh sách chi nhánh. Vui lòng thử lại.</p>
          <button type="button" onClick={() => void query.refetch()} className="min-h-11 rounded-xl border border-danger/30 bg-surface px-4 font-semibold hover:bg-sunken transition-colors">
            Tải lại chi nhánh
          </button>
        </div>
      )}
      {!query.isPending && !query.error && facilities.length === 0 && (
        <p role="status" className="rounded-2xl border border-line-strong bg-surface p-6 text-sm text-ink-3">
          Chưa có thông tin chi nhánh để hiển thị.
        </p>
      )}
      {current && (
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="flex min-w-0 flex-col gap-3" aria-label="Danh sách chi nhánh">
            {facilities.map((facility) => {
              const selected = facility.id === current.id;
              return (
                <button
                  key={facility.id}
                  data-facility-card
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectFacility(facility.id)}
                  className={`group flex w-full items-start justify-between gap-4 rounded-2xl border bg-surface p-5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${
                    selected ? "border-primary shadow-sm" : "border-line-strong hover:border-primary/50"
                  }`}
                >
                  <span className="min-w-0 space-y-2">
                    <span className={`block text-base font-bold ${selected ? "text-primary" : "text-ink"}`}>
                      {facility.shortName || facility.name}
                    </span>
                    <span className="flex items-start gap-1.5 text-xs leading-5 text-ink-3">
                      <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {facility.address || "Chưa cập nhật địa chỉ"}
                    </span>
                    {typeof facility.availableVehicles === "number" && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                        <Car aria-hidden="true" className="h-3.5 w-3.5" />
                        {facility.availableVehicles} xe sẵn sàng
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selected ? "bg-primary text-white" : "bg-sunken text-ink-3 group-hover:text-primary"
                    }`}
                  >
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>

          <article data-facility-preview className="min-w-0 overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-sm">
            {current.imageUrl && (
              <div className="relative h-52 w-full overflow-hidden bg-sunken sm:h-64">
                <Image src={current.imageUrl} alt={current.name} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
              </div>
            )}
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink font-display">{current.name}</h2>
                <p className="mt-2 text-sm text-ink-2">{address || "Chi nhánh chưa cập nhật địa chỉ."}</p>
              </div>
              {(current.openHours || current.phone) && (
                <dl className="flex flex-wrap gap-5 border-b border-line pb-5 text-sm">
                  {current.openHours && (
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs text-ink-3">
                        <Clock aria-hidden="true" className="h-4 w-4 text-primary" />
                        Giờ mở cửa
                      </dt>
                      <dd className="font-semibold text-ink">{current.openHours}</dd>
                    </div>
                  )}
                  {current.phone && (
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs text-ink-3">
                        <Phone aria-hidden="true" className="h-4 w-4 text-primary" />
                        Điện thoại
                      </dt>
                      <dd className="font-mono text-ink">{current.phone}</dd>
                    </div>
                  )}
                </dl>
              )}
              <MapboxMap title={`Vị trí ${current.name}`} location={{ address, latitude: current.latitude, longitude: current.longitude }} />
              <div className="pt-2">
                <Link
                  href={`/find?facilityId=${encodeURIComponent(current.id)}`}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <span>Xem xe khả dụng tại chi nhánh này</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
