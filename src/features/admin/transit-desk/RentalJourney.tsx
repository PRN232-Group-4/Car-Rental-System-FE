"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Check,
  ShieldAlert,
} from "lucide-react";
import {
  getOperationalRental,
  getOperationalDrivers,
  assignRental,
  changeRentalStatus,
  operationalError,
  rentalStatuses,
  rentalTransitionBlocker,
} from "@/features/operations/api";
import { formatAdminDateTime } from "@/lib/date-time";
import VehicleName from "@/features/admin/VehicleName";
import TechnicianAssignmentForm from "@/features/operations/TechnicianAssignmentForm";
import VehiclePhotos from "@/features/admin/VehiclePhotos";
import RentalTrackingPanel from "@/features/maps/RentalTrackingPanel";
import { useInlineValidation, InlineSelect, ValidatedForm } from "@/components/forms/inline-validation";
import TransitDeskStatus from "./TransitDeskStatus";
import { Skeleton } from "@/components/ui/Skeleton";

const OPERATIONAL_STEPS = [
  {
    key: "pending",
    num: "01",
    label: "Tiếp nhận & Xác nhận",
    sub: "Xác nhận đặt cọc & gán tài xế",
  },
  {
    key: "pre_inspection",
    num: "02",
    label: "Kiểm tra trước thuê",
    sub: "Lập biên bản pin/xăng & ngoại quan",
    actionLink: "/admin/inspections",
    actionText: "Mở phiếu kiểm tra",
  },
  {
    key: "renting",
    num: "03",
    label: "Bàn giao & Đang thuê",
    sub: "Khách nhận phương tiện lưu thông",
  },
  {
    key: "post_inspection",
    num: "04",
    label: "Nhận xe & Kiểm tra trả",
    sub: "Đối chiếu hao mòn & phụ phí",
    actionLink: "/admin/inspections",
    actionText: "Lập biên bản trả xe",
  },
  {
    key: "completed",
    num: "05",
    label: "Hoàn tất & Quyết toán",
    sub: "Thanh lý hợp đồng & hoàn cọc",
  },
];

export function RentalJourney() {
  const params = useSearchParams();
  const initialRentalId = params.get("rentalId") ?? "";

  const [idInput, setIdInput] = useState(initialRentalId);
  const [lookupId, setLookupId] = useState(initialRentalId);

  // Sync with URL query parameter.
  useEffect(() => {
    const q = params.get("rentalId");
    if (q && q !== lookupId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- giữ đồng bộ với ?rentalId= khi điều hướng; component chưa được route nào dùng (dead code chờ quyết định).
      setIdInput(q);
      setLookupId(q);
    }
  }, [params, lookupId]);

  const validation = useInlineValidation();

  // Query rental data
  const {
    data: rental,
    isFetching,
    error: rentalError,
    refetch: refetchRental,
  } = useQuery({
    queryKey: ["operational-rental", lookupId],
    queryFn: () => getOperationalRental(Number(lookupId)),
    enabled: /^[1-9]\d*$/.test(lookupId),
    retry: false,
  });

  // Query operational drivers
  const driversQuery = useQuery({
    queryKey: ["operational-drivers"],
    queryFn: getOperationalDrivers,
    retry: false,
  });

  // Assignment form state
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const assignValidation = useInlineValidation();

  // Status mutation state
  const [nextStatus, setNextStatus] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [confirmStatusModal, setConfirmStatusModal] = useState<string | null>(null);
  const statusValidation = useInlineValidation();

  // Determine active step index
  const currentStepIndex = useMemo(() => {
    if (!rental) return -1;
    if (rental.status === "cancelled") return -99;
    return OPERATIONAL_STEPS.findIndex((s) => s.key === rental.status);
  }, [rental]);

  // Handle Search submit
  const handleSearchSubmit = () => {
    if (!idInput) {
      setLookupId("");
      return;
    }
    if (lookupId === idInput) {
      void refetchRental();
    } else {
      setLookupId(idInput);
    }
  };

  // Reset form
  const handleReset = () => {
    setIdInput("");
    setLookupId("");
    validation.reset();
  };

  // Handle Driver Assignment
  const handleAssignSubmit = async () => {
    if (!rental || assignBusy) return;
    setAssignBusy(true);
    setAssignError("");
    setAssignSuccess("");
    try {
      await assignRental(Number(rental.id), selectedDriverId ? Number(selectedDriverId) : null);
      setAssignSuccess("Đã lưu phân công phương tiện và tài xế.");
      notifySuccess("Đã lưu phân công phương tiện và tài xế.");
      await refetchRental();
    } catch (failure) {
      const msg = assignValidation.report(failure);
      const generalError = failure instanceof TypeError ? operationalError(failure) : msg;
      setAssignError(generalError);
      notifyError(generalError);
    } finally {
      setAssignBusy(false);
    }
  };

  // Handle Status change execution
  const executeStatusChange = async (targetStatus: string) => {
    if (!rental || statusBusy) return;
    const blocker = rentalTransitionBlocker(rental, targetStatus);
    if (blocker) { statusValidation.setField("status", blocker); return; }
    setStatusBusy(true);
    setStatusError("");
    setStatusSuccess("");
    setConfirmStatusModal(null);
    try {
      await changeRentalStatus(Number(rental.id), targetStatus);
      const message = `Đã chuyển trạng thái: ${rentalStatuses[targetStatus] ?? targetStatus}.`;
      setStatusSuccess(message);
      notifySuccess(message);
      setNextStatus("");
      await refetchRental();
    } catch (failure) {
      const msg = statusValidation.report(failure);
      const generalError = failure instanceof TypeError ? operationalError(failure) : msg;
      setStatusError(generalError);
      notifyError(generalError);
    } finally {
      setStatusBusy(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!nextStatus || !rental) return;
    // Confirm on destructive/terminal status
    if (nextStatus === "cancelled" || nextStatus === "completed") {
      setConfirmStatusModal(nextStatus);
      return;
    }
    await executeStatusChange(nextStatus);
  };

  // Handle Escape key to close confirmation modal (P1-04)
  useEffect(() => {
    if (!confirmStatusModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmStatusModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmStatusModal]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Folio Top Header - Compact for 1366x768 Task-First Ergonomics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-td-rule pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-td-oxide border-l-2 border-td-oxide pl-2.5">
            04 / JNY
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-td-ink font-sans">
                Hành trình vận hành đơn thuê
              </h1>
              {rental && (
                <div className="hidden sm:inline-flex items-center gap-2 ml-2">
                  <span className="font-mono text-xs text-td-muted">Mã:</span>
                  <strong className="font-mono text-xs font-bold text-td-ink bg-td-white px-2 py-0.5 border border-td-rule rounded">
                    #{rental.id}
                  </strong>
                  <TransitDeskStatus domain="rental" status={rental.status}>
                    {rentalStatuses[rental.status] ?? rental.status}
                  </TransitDeskStatus>
                </div>
              )}
            </div>
            <p className="text-xs text-td-muted hidden md:block mt-0.5">
              Bàn kiểm soát tiến trình thực tế của đơn thuê, kiểm tra bàn giao xe và khóa phân công tài xế.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="border-l border-td-rule pl-3 text-right">
            <span className="block font-mono text-[9px] text-td-muted uppercase tracking-wider">
              OPERATIONAL DOSSIER
            </span>
            <strong className="block font-sans text-base font-bold tracking-tight text-td-ink">
              {rental ? `#${rental.id}` : "—"}
            </strong>
          </div>
        </div>
      </div>

      {/* Lookup Toolbar - Streamlined single row */}
      <div className="border-b border-td-rule pb-3">
        <ValidatedForm validation={validation} onSubmit={handleSearchSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-td-muted" />
                <input
                  id="operations-rental-id"
                  name="rentalId"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder="Nhập mã đơn thuê..."
                  aria-label="Mã đơn thuê"
                  className="w-full rounded border border-td-rule bg-td-white py-1.5 pl-8 pr-3 font-mono text-xs text-td-ink placeholder-td-muted outline-none focus:border-td-ink"
                />
              </div>

              <button
                type="submit"
                disabled={isFetching}
                className="rounded bg-td-ink px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-td-teal transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isFetching ? "Đang tìm..." : "Tra cứu đơn"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={!idInput && !lookupId}
                className="rounded border border-td-rule bg-transparent px-2.5 py-1.5 font-mono text-xs text-td-muted hover:text-td-ink transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                Đặt lại
              </button>
            </div>


          </div>
        </ValidatedForm>

        {/* Error notification */}
        {rentalError && (
          <div role="alert" className="mt-3 flex items-center gap-2 rounded border border-td-oxide/40 bg-td-chalk p-2.5 font-mono text-xs text-td-oxide">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{operationalError(rentalError)}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isFetching && !rental && (
        <div className="space-y-4">
          <div className="border border-td-rule bg-td-white p-4 rounded space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-56 w-full rounded" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <Skeleton className="h-36 w-full rounded" />
              <Skeleton className="h-36 w-full rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!lookupId && !isFetching && (
        <div className="border border-td-rule bg-td-white rounded p-12 text-center">
          <span className="font-mono text-xs font-bold text-td-oxide uppercase tracking-wider block">
            CHƯA CHỌN ĐƠN THUÊ
          </span>
          <p className="mt-2 text-xs sm:text-sm text-td-muted max-w-md mx-auto">
            Nhập mã đơn thuê do khách hàng hoặc trạm cung cấp để tải bảng điều phối hành trình và các nút lệnh chuyển tiếp.
          </p>
        </div>
      )}

      {/* Active Rental Workspace */}
      {rental && (
        <div className="space-y-5">
          {/* Surface Pattern: Time Track / State Rail - Compact Horizontal Lifecycle Track */}
          <section className="border border-td-rule bg-td-white rounded p-3.5 space-y-2.5" aria-label="Tiến trình vòng đời đơn thuê">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-td-rule pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
                  TIẾN TRÌNH VÒNG ĐỜI (STATE RAIL)
                </span>
                <span className="font-mono text-[10px] text-td-muted">·</span>
                <span className="text-xs font-mono text-td-muted">
                  Giai đoạn {currentStepIndex + 1}/5
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-td-muted">Trạng thái:</span>
                <TransitDeskStatus domain="rental" status={rental.status}>
                  {rentalStatuses[rental.status] ?? rental.status}
                </TransitDeskStatus>
              </div>
            </div>

            {/* Cancelled Alert Banner if cancelled */}
            {rental.status === "cancelled" ? (
              <div className="flex items-start gap-3 rounded border border-td-oxide bg-td-chalk p-3 text-td-oxide font-mono text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold uppercase tracking-wider">HỢP ĐỒNG ĐÃ BỊ HỦY BỎ</strong>
                  <p className="mt-0.5 text-td-muted">
                    Đơn thuê này đã kết thúc do hủy bỏ. Tất cả các hành động bàn giao hoặc chuyển trạng thái tiếp theo đã bị vô hiệu hóa.
                  </p>
                </div>
              </div>
            ) : (
              /* Linear Progression Step Sequence - Compact row */
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {OPERATIONAL_STEPS.map((step, idx) => {
                  const isPassed = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;
                  const isUpcoming = currentStepIndex < idx;

                  return (
                    <div
                      key={step.key}
                      className={`relative border p-2.5 rounded transition-colors flex flex-col justify-between ${
                        isCurrent
                          ? "border-td-oxide bg-td-chalk/50"
                          : isPassed
                          ? "border-td-rule bg-td-paper text-td-ink"
                          : "border-td-rule/60 bg-transparent text-td-muted opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                          <span className={isCurrent ? "font-bold text-td-oxide" : isPassed ? "font-bold text-td-ink" : "text-td-muted"}>
                            {step.num}
                          </span>
                          <span>
                            {isPassed && <Check className="h-3.5 w-3.5 text-td-ink" />}
                            {isCurrent && <span className="inline-block h-2 w-2 rounded-full bg-td-oxide animate-pulse" />}
                            {isUpcoming && <span className="inline-block h-2 w-2 rounded-full border border-td-rule" />}
                          </span>
                        </div>

                        <strong className={`block text-xs font-semibold truncate ${isCurrent ? "text-td-oxide" : isPassed ? "text-td-ink" : "text-td-muted"}`}>
                          {step.label}
                        </strong>
                        <p className="mt-0.5 text-[10px] text-td-muted truncate">
                          {step.sub}
                        </p>
                      </div>

                      {/* Action deep-link button if active on inspection steps */}
                      {step.actionLink && (isCurrent || isPassed) && (
                        <div className="mt-2 pt-1.5 border-t border-td-rule/60">
                          <Link
                            href={`${step.actionLink}?rentalId=${rental.id}`}
                            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-td-oxide hover:underline"
                          >
                            <span>{step.actionText}</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 2-Column Operational Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Dossier & Map Telemetry */}
            <div className="lg:col-span-7 space-y-6">
              {/* Surface Pattern: Instrument Plate / Order Dossier */}
              <div className="border border-td-rule bg-td-white rounded p-6 space-y-6">
                <div className="flex items-start justify-between border-b border-td-rule pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
                      THÔNG SỐ HỢP ĐỒNG THUÊ #{rental.id}
                    </span>
                    <h3 className="mt-1 font-sans text-xl font-bold tracking-tight text-td-ink">
                      {rental.vehicleName || "Phương tiện chưa đặt tên"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-td-oxide block">
                      {rental.totalPrice.toLocaleString("vi-VN")} đ
                    </span>
                    <span className="font-mono text-[10px] text-td-muted block uppercase">
                      TỔNG CHI PHÍ THUÊ
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs border-b border-td-rule pb-6">
                  <div>
                    <dt className="text-td-muted uppercase text-[10px]">Khách hàng</dt>
                    <dd className="text-td-ink font-semibold mt-0.5">#{rental.customerId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-td-muted uppercase text-[10px]">Phương tiện gán hợp đồng</dt>
                    <dd className="mt-1">
                      <VehicleName vehicleId={rental.vehicleId} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-td-muted uppercase text-[10px]">Thời gian bắt đầu (Nhận xe)</dt>
                    <dd className="text-td-ink mt-0.5">{formatAdminDateTime(rental.startTime)}</dd>
                  </div>
                  <div>
                    <dt className="text-td-muted uppercase text-[10px]">Thời gian kết thúc (Trả xe)</dt>
                    <dd className="text-td-ink mt-0.5">{formatAdminDateTime(rental.endTime)}</dd>
                  </div>
                  <div>
                    <dt className="text-td-muted uppercase text-[10px]">Hình thức thuê</dt>
                    <dd className="text-td-ink mt-0.5">
                      {rental.rentalType === "longterm" ? "Thuê dài hạn" : "Thuê theo giờ"} · {rental.hasDriver ? "Có tài xế" : "Tự lái"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-td-muted uppercase text-[10px]">Tiền đặt cọc / Thuế VAT</dt>
                    <dd className="text-td-ink mt-0.5">
                      Cọc: {(rental.depositPrice ?? 0).toLocaleString("vi-VN")} đ · VAT: {(rental.vatPrice ?? 0).toLocaleString("vi-VN")} đ
                    </dd>
                  </div>
                </dl>

                <VehiclePhotos vehicleId={rental.vehicleId} />

                {/* Fast Deep Links */}
                <div className="flex flex-wrap items-center gap-5 pt-1 font-mono text-xs">
                  <Link
                    href={`/admin/rentals?rentalId=${rental.id}`}
                    className="font-bold text-td-ink hover:text-td-oxide inline-flex items-center gap-1"
                  >
                    <span>Vận hành đơn thuê</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/admin/inspections?rentalId=${rental.id}`}
                    className="font-bold text-td-ink hover:text-td-oxide inline-flex items-center gap-1"
                  >
                    <span>Kiểm tra trước / sau thuê</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/report-incident?rentalId=${rental.id}`}
                    className="font-bold text-td-oxide hover:underline inline-flex items-center gap-1"
                  >
                    <span>Báo cáo sự cố khẩn cấp</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Surface Pattern: Telemetry (GPS Tracker) */}
              <RentalTrackingPanel key={`gps-${rental.id}`} rentalId={rental.id} />
            </div>

            {/* Right Column: Guarded Action Shelves */}
            <div className="lg:col-span-5 space-y-6">
              <TechnicianAssignmentForm key={rental.id} rental={rental} refresh={refetchRental} />
              {/* Action Shelf 1: Phân xe và tài xế */}
              <section className="border border-td-rule bg-td-white rounded p-6 space-y-4" aria-label="Bàn phân công tài xế">
                <div className="border-b border-td-rule pb-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
                    ACTION SHELF · PHÂN CÔNG
                  </span>
                  <h3 className="font-sans text-base font-bold text-td-ink">
                    Phân xe và tài xế
                  </h3>
                  <p className="mt-1 text-xs text-td-muted leading-relaxed">
                    Chỉ định tài xế trực thuộc chi nhánh phụ trách chuyến đi cho khách hàng.
                  </p>
                </div>

                <ValidatedForm validation={assignValidation} onSubmit={handleAssignSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="assignment-driver" className="block font-mono text-xs font-semibold text-td-ink mb-1">
                      Tài xế nhận lệnh
                    </label>
                    <InlineSelect
                      id="assignment-driver"
                      name="driverStaffId"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      disabled={assignBusy || driversQuery.isPending || rental.status === "cancelled"}
                      className="w-full rounded border border-td-rule bg-transparent px-3 py-2 font-mono text-xs text-td-ink outline-none focus:border-td-ink disabled:opacity-50"
                    >
                      <option value="">Không phân tài xế (Khách tự lái)</option>
                      {(driversQuery.data ?? [])
                        .filter((driver) => driver.isActive)
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.email?.trim() || "Chưa cập nhật email tài xế"}
                          </option>
                        ))}
                    </InlineSelect>
                  </div>

                  {/* Feedback notices */}
                  {driversQuery.error && (
                    <p role="alert" className="font-mono text-xs text-td-oxide">
                      {operationalError(driversQuery.error)}{" "}
                      <button type="button" className="underline font-bold" onClick={() => void driversQuery.refetch()}>
                        Tải lại tài xế
                      </button>
                    </p>
                  )}
                  {assignError && (
                    <p role="alert" className="font-mono text-xs text-td-oxide">
                      {assignError}
                    </p>
                  )}
                  {assignSuccess && (
                    <p role="status" className="font-mono text-xs text-td-teal">
                      {assignSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={assignBusy || driversQuery.isPending || rental.status === "cancelled"}
                    className="w-full rounded bg-td-ink px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-td-teal transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {assignBusy ? "Đang phân công..." : "Lưu phân công"}
                  </button>
                </ValidatedForm>
              </section>

              {/* Action Shelf 2: Bàn giao và chuyển trạng thái */}
              <section className="border border-td-rule bg-td-white rounded p-6 space-y-4" aria-label="Bàn giao và chuyển trạng thái">
                <div className="border-b border-td-rule pb-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
                    ACTION SHELF · CHUYỂN TRẠNG THÁI
                  </span>
                  <h3 className="font-sans text-base font-bold text-td-ink">
                    Bàn giao và nhận xe
                  </h3>
                  <p className="mt-1 text-xs text-td-muted leading-relaxed">
                    Hoàn thành kiểm tra xe trước khi bàn giao hoặc hoàn tất đơn. Máy chủ sẽ xác thực các điều kiện bắt buộc trước khi chuyển bước.
                  </p>
                </div>

                <ValidatedForm validation={statusValidation} onSubmit={handleStatusSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="rental-next-status" className="block font-mono text-xs font-semibold text-td-ink mb-1">
                      Thao tác chuyển bước
                    </label>
                    <InlineSelect
                      id="rental-next-status"
                      name="status"
                      required
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                      disabled={statusBusy || rental.status === "cancelled"}
                      className="w-full rounded border border-td-rule bg-transparent px-3 py-2 font-mono text-xs text-td-ink outline-none focus:border-td-ink disabled:opacity-50"
                    >
                      <option value="">Chọn thao tác vận hành...</option>
                      <option value="pre_inspection">Chuyển sang kiểm tra trước thuê</option>
                      <option value="renting">Bàn giao xe — bắt đầu thuê</option>
                      <option value="post_inspection">Nhận xe — kiểm tra sau thuê</option>
                      <option value="completed">Hoàn tất đơn thuê</option>
                      <option value="cancelled">Hủy đơn thuê</option>
                    </InlineSelect>
                  </div>

                  {/* Feedback notices */}
                  {statusError && (
                    <p role="alert" className="font-mono text-xs text-td-oxide">
                      {statusError}
                    </p>
                  )}
                  {statusSuccess && (
                    <p role="status" className="font-mono text-xs text-td-teal">
                      {statusSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={statusBusy || !nextStatus || rental.status === "cancelled"}
                    className="w-full rounded bg-td-ink px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-td-teal transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {statusBusy ? "Đang cập nhật..." : "Xác nhận cập nhật trạng thái"}
                  </button>
                </ValidatedForm>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive / Terminal Status Transitions */}
      {confirmStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded border border-td-rule bg-td-white p-6 shadow-e3 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-td-oxide border border-td-oxide p-1">
                LƯU Ý
              </span>
              <h3 id="confirmModalTitle" className="font-sans text-base font-bold text-td-ink">
                Xác nhận chuyển trạng thái cuối
              </h3>
            </div>
            <p className="text-xs text-td-muted leading-relaxed">
              Bạn đang yêu cầu chuyển đơn thuê <strong className="text-td-ink">#{rental?.id}</strong> sang trạng thái{" "}
              <strong className="text-td-oxide">{rentalStatuses[confirmStatusModal] ?? confirmStatusModal}</strong>. Thao tác này có tính ràng buộc pháp lý và không thể hoàn tác sau khi hệ thống ghi nhận.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-td-rule">
              <button
                type="button"
                onClick={() => setConfirmStatusModal(null)}
                disabled={statusBusy}
                className="rounded border border-td-rule px-4 py-2 font-mono text-xs text-td-muted hover:text-td-ink transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => void executeStatusChange(confirmStatusModal)}
                disabled={statusBusy}
                className="rounded bg-td-oxide px-4 py-2 font-mono text-xs font-bold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                {statusBusy ? "Đang xử lý..." : "Xác nhận thực hiện"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalJourney;
