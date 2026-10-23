"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Car,
  Clock,
  UserCheck,
  Check,
  ShieldAlert,
  Calendar,
  DollarSign,
  Navigation,
} from "lucide-react";
import {
  getOperationalRental,
  listOperationalRentals,
  changeRentalStatus,
  operationalError,
  rentalStatuses,
  rentalTransitionBlocker,
  canAssignRental,
  type OperationalRental,
} from "@/features/operations/api";
import { formatAdminDateTime } from "@/lib/date-time";
import TechnicianAssignmentForm from "@/features/operations/TechnicianAssignmentForm";
import DriverAssignmentForm from "@/features/operations/DriverAssignmentForm";
import CashReceiptPanel from "@/features/operations/CashReceiptPanel";
import RentalIdentifiers from "@/features/operations/RentalIdentifiers";
import { useRentalInvoice } from "@/features/operations/rental-invoice";
import RentalReturnStatus from "@/features/operations/RentalReturnStatus";
import RentalOperationalBadge from "@/features/operations/RentalOperationalBadge";
import RentalCancellationReason from "@/features/operations/RentalCancellationReason";
import RentalCancelDialog from "@/features/operations/RentalCancelDialog";
import RentalWorkflowChecklist, { useRentalWorkflowChecklist } from "@/features/operations/RentalWorkflowChecklist";
import SignedContractUpload from "@/features/rentals/components/SignedContractUpload";
import { signedContractDocumentHref } from "@/features/rentals/signed-contract";
import VehicleName from "@/features/admin/VehicleName";
import VehiclePhotos from "@/features/admin/VehiclePhotos";
import RentalTrackingPanel from "@/features/maps/RentalTrackingPanel";
import { useInlineValidation, ValidatedForm } from "@/components/forms/inline-validation";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOptionalSession } from "@/features/auth/AuthContext";
import styles from "./rental-workspace-v4.module.css";

export type RentalDetailState =
  | { status: "idle" }
  | { status: "loading"; id: string }
  | { status: "ready"; rental: OperationalRental }
  | { status: "not-found"; id: string; message: string }
  | { status: "forbidden"; id: string; message: string }
  | { status: "error"; id: string; message: string; httpStatus?: number }
  | { status: "invalid-data"; id: string; message: string };

export function formatCurrencySafe(value?: number | null): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Chưa có dữ liệu";
  }
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function rentalTypeLabel(value?: string | null): string {
  if (value === "hourly") return "Thuê giờ";
  if (value === "longterm") return "Dài hạn";
  return "Chưa rõ loại thuê";
}

function isValidRental(data: unknown): data is OperationalRental {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const r = data as Record<string, unknown>;
  return (
    typeof r.id === "number" &&
    Number.isInteger(r.id) &&
    r.id > 0 &&
    typeof r.status === "string" &&
    Boolean(r.status)
  );
}

const OPERATIONAL_STEPS = [
  {
    key: "pending",
    num: "01",
    shortLabel: "Nhận đơn",
    label: "Tiếp nhận & Xác nhận",
    sub: "Xác nhận đặt cọc & gán tài xế",
  },
  {
    key: "pre_inspection",
    num: "02",
    shortLabel: "KT trước",
    label: "Kiểm tra trước thuê",
    sub: "Lập biên bản pin/xăng & ngoại quan",
    actionLink: "/admin/inspections",
    actionText: "Mở phiếu kiểm tra",
  },
  {
    key: "renting",
    num: "03",
    shortLabel: "Đang thuê",
    label: "Bàn giao & Đang thuê",
    sub: "Khách nhận phương tiện lưu thông",
  },
  {
    key: "post_inspection",
    num: "04",
    shortLabel: "KT trả",
    label: "Nhận xe & Kiểm tra trả",
    sub: "Đối chiếu hao mòn & phụ phí",
    actionLink: "/admin/inspections",
    actionText: "Lập biên bản trả xe",
  },
  {
    key: "completed",
    num: "05",
    shortLabel: "Hoàn tất",
    label: "Hoàn tất & Quyết toán",
    sub: "Thanh lý hợp đồng & hoàn cọc",
  },
];

export function RentalWorkspaceV4() {
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const initialRentalId = params.get("rentalId") ?? "";

  const [idInput, setIdInput] = useState(initialRentalId);
  const [lookupId, setLookupId] = useState(initialRentalId);
  const [queueFilter, setQueueFilter] = useState<string>("all");
  const [queueSearch, setQueueSearch] = useState<string>("");

  // Sync with URL query parameter.
  useEffect(() => {
    const q = params.get("rentalId");
    if (q && q !== lookupId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- form phải theo ?rentalId= khi điều hướng từ trang khác; tách thành state dẫn xuất sẽ mất khả năng tra cứu thủ công.
      setIdInput(q);
      setLookupId(q);
    }
  }, [params, lookupId]);

  const validation = useInlineValidation();
  const session = useOptionalSession();
  // P1-C (Security / Authorization): Fail-closed. If session is absent, deny privileged actions.
  const canMutate = Boolean(session?.isAuthenticated && session.hasAnyRole(["Admin", "Manager", "CustomerService"]));

  // Query rental data
  const {
    data: rental,
    isFetching,
    error: rentalError,
    refetch: refetchRental,
  } = useQuery({
    queryKey: ["operational-rental", lookupId],
    queryFn: () => getOperationalRental(Number(lookupId)),
    enabled: canMutate && /^[1-9]\d*$/.test(lookupId),
  });

  // Discriminated async state machine (P0-B)
  const detailState: RentalDetailState = useMemo(() => {
    if (!lookupId || !/^[1-9]\d*$/.test(lookupId)) {
      return { status: "idle" };
    }
    if (isFetching && !rental) {
      return { status: "loading", id: lookupId };
    }
    if (rentalError) {
      const err = rentalError as { status?: number; response?: { status?: number } } | null;
      const httpStatus = err?.status ?? err?.response?.status;
      const msg = operationalError(rentalError);
      if (httpStatus === 404 || msg.includes("không tìm thấy") || msg.toLowerCase().includes("not found")) {
        return {
          status: "not-found",
          id: lookupId,
          message: `Không tìm thấy hồ sơ đơn thuê #${lookupId} trong cơ sở dữ liệu.`,
        };
      }
      if (httpStatus === 403 || msg.includes("không có quyền") || msg.toLowerCase().includes("forbidden")) {
        return {
          status: "forbidden",
          id: lookupId,
          message: `Bạn không có quyền truy cập thông tin đơn thuê #${lookupId}.`,
        };
      }
      return {
        status: "error",
        id: lookupId,
        message: msg || `Lỗi kết nối máy chủ khi tải đơn thuê #${lookupId}.`,
        httpStatus: typeof httpStatus === "number" ? httpStatus : undefined,
      };
    }
    if (rental) {
      if (!isValidRental(rental)) {
        return {
          status: "invalid-data",
          id: lookupId,
          message: `Dữ liệu đơn thuê #${lookupId} trả về từ máy chủ không hợp lệ hoặc bị khiếm khuyết.`,
        };
      }
      return { status: "ready", rental };
    }
    return { status: "idle" };
  }, [lookupId, isFetching, rentalError, rental]);

  const activeRental = detailState.status === "ready" ? detailState.rental : null;
  const rentalInvoice = useRentalInvoice(activeRental, canMutate);
  const paymentBlocker = activeRental?.status === "pre_inspection" && !activeRental.isSubscription && rentalInvoice.data?.status !== "paid"
    ? rentalInvoice.isPending ? "Đang kiểm tra thanh toán trước khi bàn giao xe."
      : rentalInvoice.isError ? "Chưa kiểm tra được thanh toán. Vui lòng tải lại hóa đơn ở mục Thanh toán đơn thuê."
        : "Cần thanh toán đủ hóa đơn trước khi bàn giao xe. Thao tác tại điều kiện Thanh toán đơn thuê."
    : null;
  const checklist = useRentalWorkflowChecklist(activeRental, paymentBlocker);

  // Query real operational queue
  const { data: queueData, isFetching: isQueueFetching, error: queueError } = useQuery({
    queryKey: ["operational-rentals-queue", queueFilter],
    queryFn: () => listOperationalRentals({ status: queueFilter === "all" ? undefined : queueFilter, page: 1, pageSize: 30 }),
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: canMutate,
  });

  // Status transition state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const statusLock = useRef(false);
  const statusValidation = useInlineValidation();

  // Terminal confirmation modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<string | null>(null);

  // Remember recently opened dossiers.
  useEffect(() => {
    if (activeRental) {
      // Save to recent rentals in localStorage safely
      try {
        const raw = localStorage.getItem("thongdong_v4_recent_rentals");
        const list: number[] = raw ? JSON.parse(raw) : [];
        const nextList = [activeRental.id, ...list.filter((x) => x !== activeRental.id)].slice(0, 5);
        localStorage.setItem("thongdong_v4_recent_rentals", JSON.stringify(nextList));
      } catch {
        // Safe fallback
      }
    }
  }, [activeRental]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- phản hồi thuộc hồ sơ đang mở, chỉ xóa khi đổi đơn.
    setStatusMessage(null);
    setStatusFailed(false);
  }, [lookupId]);

  // Handle direct lookup submission
  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = idInput.trim();
    if (!trimmed) {
      validation.setField("lookupId", "Vui lòng nhập mã đơn thuê cần tra cứu.");
      return;
    }
    if (!/^[1-9]\d*$/.test(trimmed)) {
      validation.setField("lookupId", "Mã đơn thuê phải là số nguyên dương hợp lệ.");
      return;
    }
    validation.clear("lookupId");
    setLookupId(trimmed);

    // Update URL query parameter cleanly without reloading page
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("rentalId", trimmed);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Select rental from queue
  const selectRentalFromQueue = (id: number) => {
    validation.clear("lookupId");
    setIdInput(String(id));
    setLookupId(String(id));
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("rentalId", String(id));
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Status transition trigger
  const handleInitiateStatusChange = (nextStatus: string) => {
    if (!activeRental || !canMutate || statusLock.current) return;
    if (!nextStatus || nextStatus === activeRental.status) {
      setStatusMessage("Vui lòng chọn trạng thái mới khác trạng thái hiện tại.");
      return;
    }
    const blocker = rentalTransitionBlocker(activeRental, nextStatus);
    if (blocker) {
      setStatusMessage(blocker);
      return;
    }

    if (nextStatus === "renting" && paymentBlocker) { setStatusMessage(paymentBlocker); return; }
    if (nextStatus !== "cancelled" && (nextStatus !== checklist.nextStatus || !checklist.ready)) return;

    if (nextStatus === "completed" || nextStatus === "cancelled") {
      setPendingTargetStatus(nextStatus);
      setIsConfirmOpen(true);
      return;
    }

    executeStatusChange(nextStatus);
  };

  // Execute status change
  const executeStatusChange = async (targetStatus: string) => {
    if (!activeRental || !canMutate || statusLock.current || targetStatus !== checklist.nextStatus || !checklist.ready) return;
    const blocker = rentalTransitionBlocker(activeRental, targetStatus);
    if (blocker) {
      setStatusMessage(blocker);
      return;
    }
    if (targetStatus === "renting" && paymentBlocker) { setStatusMessage(paymentBlocker); return; }
    statusLock.current = true;
    setIsUpdatingStatus(true);
    setStatusFailed(false);
    setStatusMessage(null);
    try {
      const updated = await changeRentalStatus(Number(activeRental.id), targetStatus);
      void queryClient.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY });
      if (isValidRental(updated)) {
        queryClient.setQueryData(["operational-rental", lookupId], updated);
      }
      await refetchRental();
      await queryClient.invalidateQueries({ queryKey: ["operational-rentals-queue"] });
      const message = `Đã cập nhật đơn thuê sang trạng thái: ${rentalStatuses[targetStatus] || targetStatus}`;
      setStatusMessage(message);
      notifySuccess(message);
      setIsConfirmOpen(false);
      setPendingTargetStatus(null);
    } catch (err: unknown) {
      const generalError = operationalError(err);
      setStatusMessage(generalError);
      setStatusFailed(true);
      notifyError(generalError);
    } finally {
      statusLock.current = false;
      setIsUpdatingStatus(false);
    }
  };

  // Current active step index
  const currentStepIndex = useMemo(() => {
    if (!activeRental) return -1;
    return OPERATIONAL_STEPS.findIndex((s) => s.key === activeRental.status);
  }, [activeRental]);

  // Filtered queue items
  const queueItems = useMemo(() => {
    const items = queueData?.items ?? [];
    if (!queueSearch.trim()) return items;
    const lower = queueSearch.toLowerCase();
    return items.filter(
      (item) =>
        String(item.id).includes(lower) ||
        (item.vehicleName && item.vehicleName.toLowerCase().includes(lower)) ||
        (item.status && (rentalStatuses[item.status] || item.status).toLowerCase().includes(lower))
    );
  }, [queueData, queueSearch]);

  // Next recommended contextual action
  const nextRecommendedAction = useMemo(() => {
    if (!activeRental) return null;
    switch (activeRental.status) {
      case "pending":
        return {
          targetStatus: "pre_inspection",
          label: activeRental.hasPassingPreInspection ? "Duyệt yêu cầu đã kiểm tra" : "Xác nhận & Chuyển sang kiểm tra trước",
          buttonLabel: "Xác nhận đơn thuê",
          description: activeRental.hasPassingPreInspection ? "Kiểm tra đã đạt; cần duyệt yêu cầu trước khi thanh toán và bàn giao." : "Duyệt yêu cầu và chuẩn bị kiểm tra trước thuê",
          consequential: false,
        };
      case "pre_inspection":
        return {
          targetStatus: "renting",
          label: "Bàn giao xe & Bắt đầu chuyến",
          buttonLabel: "Bàn giao xe",
          description: activeRental.hasPassingPreInspection === true
            ? activeRental.isSubscription ? "Kiểm tra trước thuê đã đạt. Xác nhận khách nhận xe để bắt đầu chuyến." : "Kiểm tra trước thuê đã đạt. Hoàn tất thanh toán rồi xác nhận khách nhận xe."
            : "Cần hoàn tất kiểm tra trước thuê với kết quả đạt để bàn giao xe.",
          consequential: false,
        };
      case "renting":
        return {
          targetStatus: "post_inspection",
          label: "Xác nhận đã nhận lại xe",
          buttonLabel: "Đã trả xe",
          description: "Tiếp nhận xe trả tại trạm và kiểm tra hiện trạng",
          consequential: false,
        };
      case "post_inspection":
        return {
          targetStatus: "completed",
          label: "Quyết toán & Hoàn tất hợp đồng",
          buttonLabel: "Hoàn tất",
          description: "Đối soát phụ phí, hoàn cọc và đóng hồ sơ",
          consequential: true,
        };
      default:
        return null;
    }
  }, [activeRental]);

  return (
    <div className={styles.workspaceRoot} id="rentalWorkspaceRoot">
      <div
        className={styles.stageWrapper}
      >
        {/* 3-COLUMN COCKPIT LAYOUT */}
        <div className={styles.cockpitGrid}>
        {/* ========================================================================= */}
        {/* LEFT COLUMN: WORK QUEUE (~294px)                                          */}
        {/* ========================================================================= */}
        <aside className={styles.queuePanel} aria-label="Hàng đợi vận hành">
          <div className={styles.queueHeader}>
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-[var(--v4-mineral)]" />
              <span className="font-bold text-xs text-[var(--v4-ink)]">
                Hàng đợi vận hành
              </span>
            </div>
            {queueItems.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[var(--v4-surface-muted)] text-[var(--v4-marine)]">
                {queueItems.length}
              </span>
            )}
          </div>

          <Link href={`/admin/rentals?view=list${activeRental ? `&rentalId=${activeRental.id}` : ""}`} className="mx-3 my-2 text-xs font-semibold text-[var(--v4-marine)] underline">Danh sách, sửa yêu cầu và thanh toán</Link>
          {/* Quick Search & Filter */}
          <div className={styles.queueSearch}>
            <form onSubmit={handleLookup} className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--v4-mineral)]" />
                <input
                  type="text"
                  placeholder="Nhập mã đơn thuê..."
                  value={idInput}
                  onChange={(e) => {
                    setIdInput(e.target.value);
                    setQueueSearch(e.target.value);
                  }}
                  className={`${styles.inputField} pl-8 text-xs font-mono`}
                  aria-label="Nhập mã đơn thuê"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={queueFilter}
                  onChange={(e) => setQueueFilter(e.target.value)}
                  className={`${styles.inputField} text-xs py-1`}
                  aria-label="Lọc trạng thái hàng đợi"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="pre_inspection">Kiểm tra trước</option>
                  <option value="renting">Đang thuê</option>
                  <option value="overdue">Quá hạn</option>
                  <option value="post_inspection">Kiểm tra trả</option>
                  <option value="completed">Đã hoàn tất</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold bg-[var(--v4-marine)] text-white rounded hover:opacity-90 transition shrink-0"
                >
                  Tra cứu đơn
                </button>
              </div>
              {validation.errors.lookupId && (
                <span className="text-[11px] text-[var(--v4-coral)] font-medium">
                  {validation.errors.lookupId}
                </span>
              )}
            </form>
          </div>

          {/* Queue List / Ledger Items */}
          <div className={styles.queueList}>
            {/* Pinned Card when active lookup is not in current queue page */}
            {activeRental && !queueItems.some((item) => String(item.id) === String(activeRental.id)) && (
              <div className={styles.pinnedCard} data-testid="pinned-lookup-card">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--v4-coral)]">
                    Đơn đang mở (Tra cứu trực tiếp)
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--v4-marine)]">
                    #{activeRental.id}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[var(--v4-ink)] truncate">
                  <VehicleName vehicleId={activeRental.vehicleId} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--v4-mineral)]">
                  <RentalOperationalBadge rental={activeRental} />
                  <span>{activeRental.hasDriver ? "Có tài xế" : "Tự lái"}</span>
                </div>
              </div>
            )}

            {isQueueFetching && queueItems.length === 0 ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-14 w-full rounded" />
                <Skeleton className="h-14 w-full rounded" />
                <Skeleton className="h-14 w-full rounded" />
              </div>
            ) : queueError ? (
              <div className="p-6 text-center text-xs text-[var(--v4-coral)] space-y-2">
                <p className="font-bold">Không thể tải danh sách hàng đợi.</p>
                <p className="text-[11px] text-[var(--v4-mineral)]">Lỗi kết nối máy chủ hoặc mất mạng.</p>
              </div>
            ) : queueItems.length > 0 ? (
              queueItems.map((item) => {
                const isSelected = String(item.id) === String(lookupId);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectRentalFromQueue(Number(item.id))}
                    className={`${styles.queueItem} ${isSelected ? styles.queueItemActive : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-bold text-xs ${isSelected ? "text-[var(--td-vv-peach)]" : "text-[var(--td-vv-violet)]"} ${styles.queueId}`}>
                        #{item.id}
                      </span>
                      <RentalOperationalBadge rental={item} />
                    </div>
                    <div className="text-xs font-semibold text-[var(--v4-ink)] truncate">
                      {item.vehicleName || "Phương tiện #" + item.vehicleId}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--v4-mineral)]">
                      <span>{rentalTypeLabel(isSelected ? activeRental?.rentalType ?? item.rentalType : item.rentalType)}</span>
                      {item.endTime && (
                        <span>Hạn: {formatAdminDateTime(item.endTime).slice(0, 10)}</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[var(--v4-mineral)] space-y-2">
                {queueSearch ? (
                  <p>Không có đơn nào khớp với bộ lọc &quot;{queueSearch}&quot;.</p>
                ) : (
                  <p>Hàng đợi trạm hiện không có đơn cần xử lý.</p>
                )}
                <p className="text-[11px] text-[var(--v4-ink)] opacity-75">
                  Nhập mã hợp đồng vào ô tra cứu ở trên để mở trực tiếp hồ sơ đơn.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: RENTAL DOSSIER (FLUID)                                     */}
        {/* ========================================================================= */}
        <div className={styles.detailWorkspace}>
        <main
          className={styles.dossierPanel}
          aria-label="Hồ sơ chi tiết đơn thuê"
        >
          {/* Masthead Wayfinding Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--v4-rule)]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-[var(--v4-ink)]">
                  Hành trình vận hành đơn thuê
                </h1>
                {activeRental && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-marine)] font-bold">
                    #{activeRental.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--v4-mineral)]">
                Bảng điều phối hồ sơ, tình trạng kỹ thuật và vòng đời phương tiện
              </p>
              {activeRental && <RentalIdentifiers rentalId={activeRental.id} orderId={activeRental.orderId} />}
            </div>

            {activeRental && (
              <div className="flex items-center gap-2">
                <RentalOperationalBadge rental={activeRental} />
                {signedContractDocumentHref(activeRental) && (
                  <a
                    href={signedContractDocumentHref(activeRental)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--v4-marine)] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{activeRental.hasUploadedContract ? "Hợp đồng đã ký" : "Tài liệu hợp đồng"}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Fallback & Discriminated Async State Views (P0-B) */}
          {detailState.status === "loading" ? (
            <div className="p-8 space-y-4" data-testid="rental-loading-state">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : detailState.status === "not-found" ? (
            <div
              className="p-8 border border-[var(--v4-coral)] bg-[rgba(166,94,72,0.06)] rounded text-center space-y-3"
              role="alert"
              data-testid="rental-not-found-state"
            >
              <AlertTriangle className="h-8 w-8 text-[var(--v4-coral)] mx-auto" />
              <h2 className="text-sm font-bold text-[var(--v4-coral)]">
                Không tìm thấy hồ sơ đơn thuê #{detailState.id}
              </h2>
              <p className="text-xs text-[var(--v4-ink)] max-w-md mx-auto">
                {detailState.message}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => refetchRental()}
                  className="px-3.5 py-1.5 text-xs font-bold rounded bg-[var(--v4-marine)] text-white hover:opacity-90 transition"
                >
                  Thử tải lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdInput("");
                    setLookupId("");
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("rentalId");
                      window.history.replaceState({}, "", url.toString());
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold rounded bg-[var(--v4-surface-muted)] text-[var(--v4-ink)] border border-[var(--v4-rule)] hover:opacity-90 transition"
                >
                  Xóa tra cứu
                </button>
              </div>
            </div>
          ) : detailState.status === "forbidden" ? (
            <div
              className="p-8 border border-[var(--v4-coral)] bg-[rgba(166,94,72,0.06)] rounded text-center space-y-3"
              role="alert"
              data-testid="rental-forbidden-state"
            >
              <ShieldAlert className="h-8 w-8 text-[var(--v4-coral)] mx-auto" />
              <h2 className="text-sm font-bold text-[var(--v4-coral)]">
                Từ chối quyền truy cập đơn thuê #{detailState.id}
              </h2>
              <p className="text-xs text-[var(--v4-ink)] max-w-md mx-auto">
                {detailState.message}
              </p>
            </div>
          ) : detailState.status === "error" ? (
            <div
              className="p-8 border border-[var(--v4-coral)] bg-[rgba(166,94,72,0.06)] rounded text-center space-y-3"
              role="alert"
              data-testid="rental-error-state"
            >
              <AlertTriangle className="h-8 w-8 text-[var(--v4-coral)] mx-auto" />
              <h2 className="text-sm font-bold text-[var(--v4-coral)]">
                Không thể tải thông tin đơn thuê #{detailState.id}
              </h2>
              <p className="text-xs text-[var(--v4-ink)] max-w-md mx-auto">
                {detailState.message}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => refetchRental()}
                  className="px-3.5 py-1.5 text-xs font-bold rounded bg-[var(--v4-marine)] text-white hover:opacity-90 transition"
                >
                  Thử tải lại
                </button>
              </div>
            </div>
          ) : detailState.status === "invalid-data" ? (
            <div
              className="p-8 border border-[var(--v4-coral)] bg-[rgba(166,94,72,0.06)] rounded text-center space-y-3"
              role="alert"
              data-testid="rental-invalid-data-state"
            >
              <AlertTriangle className="h-8 w-8 text-[var(--v4-coral)] mx-auto" />
              <h2 className="text-sm font-bold text-[var(--v4-coral)]">
                Dữ liệu không hợp lệ cho đơn thuê #{detailState.id}
              </h2>
              <p className="text-xs text-[var(--v4-ink)] max-w-md mx-auto">
                {detailState.message}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => refetchRental()}
                  className="px-3.5 py-1.5 text-xs font-bold rounded bg-[var(--v4-marine)] text-white hover:opacity-90 transition"
                >
                  Thử tải lại
                </button>
              </div>
            </div>
          ) : !activeRental ? (
            <div className="p-12 text-center space-y-4 border border-dashed border-[var(--v4-rule)] rounded" data-testid="rental-idle-state">
              <Car className="h-10 w-10 text-[var(--v4-mineral)] mx-auto opacity-60" />
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[var(--v4-ink)]">
                  Chưa chọn đơn thuê
                </h2>
                <p className="text-xs text-[var(--v4-mineral)] max-w-sm mx-auto">
                  Chọn một hợp đồng từ hàng đợi bên trái hoặc nhập mã đơn cụ thể để mở toàn bộ hồ sơ kỹ thuật, hành trình và lệnh phân công.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ADAPTIVE HORIZONTAL STEPPER RAIL (ZERO COLLISION) */}
              <RentalCancellationReason key={`cancel-reason-${activeRental.id}`} rental={activeRental} />
              <div className={styles.stepperContainer} aria-label="Tiến trình vòng đời hợp đồng">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--v4-mineral)]">
                    Tiến trình hợp đồng
                  </span>
                  <span className="text-xs font-mono text-[var(--v4-ink)] font-bold">
                    Giai đoạn {currentStepIndex >= 0 ? currentStepIndex + 1 : 1}/5
                  </span>
                </div>

                <div className={styles.stepperTrack} role="list">
                  {OPERATIONAL_STEPS.map((step, idx) => {
                    const isPassed = currentStepIndex > idx;
                    const isActive = currentStepIndex === idx;

                    return (
                      <React.Fragment key={step.key}>
                        <div
                          className={styles.stepperItem}
                          role="listitem"
                          aria-current={isActive ? "step" : undefined}
                        >
                          <div
                            className={`${styles.stepperGlyph} ${
                              isPassed
                                ? styles.stepperGlyphPassed
                                : isActive
                                ? styles.stepperGlyphActive
                                : ""
                            }`}
                            title={step.label}
                          >
                            {isPassed ? (
                              <Check className="h-3 w-3 stroke-[3]" />
                            ) : (
                              step.num
                            )}
                          </div>
                          <span
                            className={`${styles.stepperLabel} ${
                              isPassed
                                ? styles.stepperLabelPassed
                                : isActive
                                ? styles.stepperLabelActive
                                : ""
                            }`}
                            title={step.label}
                          >
                            <span className="sr-only">{step.label}</span>
                            <span aria-hidden="true">{step.shortLabel}</span>
                          </span>
                        </div>
                        {idx < OPERATIONAL_STEPS.length - 1 && (
                          <div
                            className={`${styles.stepperLine} ${
                              currentStepIndex > idx ? styles.stepperLinePassed : ""
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* ACTIVE STEP CALLOUT BANNER */}
                {currentStepIndex >= 0 && (
                  <div className={styles.activeStepBanner}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--v4-marine)]">
                        {OPERATIONAL_STEPS[currentStepIndex].label}:
                      </span>
                      <span className="text-[var(--v4-ink)]">
                        {activeRental.status === "pending" && activeRental.hasPassingPreInspection
                          ? "Kiểm tra trước thuê đã đạt. Yêu cầu đang chờ duyệt, chưa bàn giao xe."
                          : activeRental.status === "pre_inspection" && activeRental.hasPassingPreInspection
                          ? "Kiểm tra trước thuê đã đạt. Hoàn tất thanh toán, phân xe/tài xế và xác nhận bàn giao để bắt đầu thuê."
                          : OPERATIONAL_STEPS[currentStepIndex].sub}
                      </span>
                    </div>
                    {OPERATIONAL_STEPS[currentStepIndex].actionLink && (
                      <Link
                        href={OPERATIONAL_STEPS[currentStepIndex].actionLink}
                        className="inline-flex items-center gap-1 font-bold text-[var(--v4-marine)] hover:underline ml-auto"
                      >
                        <span>{OPERATIONAL_STEPS[currentStepIndex].actionText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* DOSSIER CONTRACT INFORMATION */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-[var(--v4-ink)]">
                  Thông số hợp đồng thuê #{activeRental.id}
                </h2>

                {/* VEHICLE & JOURNEY IDENTITY ROW */}
                <div className={styles.vehicleIdentityCard}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-marine)]">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[var(--v4-mineral)]">
                        Phương tiện lưu thông
                      </div>
                      <div className="text-sm font-bold text-[var(--v4-ink)]">
                        <VehicleName vehicleId={activeRental.vehicleId} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--v4-mineral)] block">Hình thức</span>
                      <span className="text-xs font-semibold text-[var(--v4-ink)]">
                        {activeRental.hasDriver ? "Có tài xế" : "Khách tự lái"} · {rentalTypeLabel(activeRental.rentalType)}
                      </span>
                    </div>
                    <div className="text-right pl-4 border-l border-[var(--v4-rule)]">
                      <span className="text-[11px] text-[var(--v4-mineral)] block">Tổng hợp đồng</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-[var(--v4-marine)]">
                        {formatCurrencySafe(activeRental.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <VehiclePhotos vehicleId={activeRental.vehicleId} />

                {/* FINANCIAL & SCHEDULE GRID */}
                <div className={styles.financialGrid}>
                  <div className={styles.metricTile}>
                    <span className="text-[11px] text-[var(--v4-mineral)] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[var(--v4-marine)]" /> Khởi hành thực tế / dự kiến
                    </span>
                    <div className="font-bold text-xs font-mono tabular-nums text-[var(--v4-ink)]">
                      {formatAdminDateTime(activeRental.startTime)}
                    </div>
                  </div>

                  <div className={styles.metricTile}>
                    <span className="text-[11px] text-[var(--v4-mineral)] flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[var(--v4-marine)]" /> Hoàn trả dự kiến
                    </span>
                    <div className="font-bold text-xs font-mono tabular-nums text-[var(--v4-ink)]">
                      {formatAdminDateTime(activeRental.endTime)}
                    </div>
                  </div>

                  <div className={styles.metricTile}>
                    <span className="text-[11px] text-[var(--v4-mineral)] flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-[var(--v4-marine)]" /> Tiền cọc & VAT
                    </span>
                    <div className="font-bold text-xs font-mono tabular-nums text-[var(--v4-ink)]">
                      Cọc: {formatCurrencySafe(activeRental.depositPrice)} · VAT: {formatCurrencySafe(activeRental.vatPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* OPERATIONAL ACTIVITY & VERIFICATION LOG (TRUTHFUL DATA) */}
              <div className="p-3.5 border border-[var(--v4-rule)] rounded bg-[var(--v4-surface-card)] space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-[var(--v4-rule)]">
                  <span className="text-xs font-bold text-[var(--v4-ink)] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--v4-marine)]" />
                    Nhật ký mốc thời gian & Chứng từ hợp đồng
                  </span>
                  <span className="text-[11px] font-mono text-[var(--v4-mineral)]">
                    Hồ sơ hợp đồng #{activeRental.id}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="space-y-0.5 p-2 rounded bg-[var(--v4-surface-muted)]">
                    <span className="text-[10px] font-semibold text-[var(--v4-mineral)] block">
                      01. Ký kết hợp đồng
                    </span>
                    <div className="font-mono font-bold text-[var(--v4-ink)] text-[11px]">
                      {activeRental.signedAt ? formatAdminDateTime(activeRental.signedAt) : "Chưa ghi nhận ngày ký"}
                    </div>
                    <span className="text-[10px] text-[var(--v4-mineral)] block truncate">
                      {activeRental.rentalType === "longterm" ? activeRental.hasUploadedContract ? "Đã có file hợp đồng đã ký" : "Chưa tải hợp đồng đã ký" : "Không bắt buộc tải hợp đồng dài hạn"}
                    </span>
                  </div>

                  <div className="space-y-0.5 p-2 rounded bg-[var(--v4-surface-muted)]">
                    <span className="text-[10px] font-semibold text-[var(--v4-mineral)] block">
                      02. Bắt đầu lưu thông
                    </span>
                    <div className="font-mono font-bold text-[var(--v4-ink)] text-[11px]">
                      {formatAdminDateTime(activeRental.startTime)}
                    </div>
                    <span className="text-[10px] text-[var(--v4-mineral)] block truncate">
                      {activeRental.status === "pending" || activeRental.status === "pre_inspection"
                        ? "Thời điểm nhận xe theo kế hoạch"
                        : "Đã xuất phát từ trạm chi nhánh"}
                    </span>
                  </div>

                  <div className="space-y-0.5 p-2 rounded bg-[var(--v4-surface-muted)]">
                    <span className="text-[10px] font-semibold text-[var(--v4-mineral)] block">
                      03. Hạn trả phương tiện
                    </span>
                    <div className="font-mono font-bold text-[var(--v4-ink)] text-[11px]">
                      {formatAdminDateTime(activeRental.endTime)}
                    </div>
                    <span className="text-[10px] text-[var(--v4-mineral)] block truncate">
                      {activeRental.status === "completed"
                        ? "Đã hoàn tất trả xe"
                        : "Hạn trả xe dự kiến"}
                    </span>
                  </div>
                </div>
              </div>

              <RentalReturnStatus key={activeRental.id} rental={activeRental} returnActionHref="#rental-primary-action" />

              {/* LIVE GPS MONITORING PANEL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--v4-ink)]">
                      Giám sát vị trí trạm & Tín hiệu xe
                    </span>
                    <span className={styles.telemetryIllustrativeBadge}>
                      Dữ liệu minh họa vận hành
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--v4-mineral)]">
                    Tọa độ trạm điều phối và tín hiệu cập nhật từ thiết bị định vị
                  </span>
                </div>
                <div className={styles.gpsTrackingPanel}>
                  <RentalTrackingPanel rentalId={activeRental.id} />
                </div>
              </div>
            </>
          )}
        </main>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: COMMAND ZONE (~372px)                                       */}
        {/* ========================================================================= */}
        <aside className={styles.commandPanel} aria-label="Bảng lệnh điều phối">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--v4-rule)]">
            <span className="text-xs font-bold text-[var(--v4-ink)]">
              Khu vực lệnh điều phối
            </span>
            <span className="text-[11px] text-[var(--v4-mineral)]">
              {activeRental ? "Sẵn sàng thực thi" : "Chờ hồ sơ"}
            </span>
          </div>

          {/* COMMAND SHELVES OR EMPTY PROMPT */}
          {!activeRental ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-[var(--v4-rule)] rounded" data-testid="command-inactive-state">
              <UserCheck className="h-8 w-8 text-[var(--v4-mineral)] mx-auto opacity-60" />
              <h2 className="text-xs font-bold text-[var(--v4-ink)]">
                {detailState.status === "loading"
                  ? "Đang tải hồ sơ đơn..."
                  : detailState.status === "idle"
                  ? "Chờ chọn đơn thuê"
                  : "Hồ sơ chưa sẵn sàng"}
              </h2>
              <p className="text-[11px] text-[var(--v4-mineral)]">
                {detailState.status === "loading"
                  ? "Vui lòng đợi hệ thống nạp dữ liệu hợp đồng."
                  : detailState.status === "idle"
                  ? "Vui lòng chọn hoặc tra cứu một đơn thuê để kích hoạt bảng lệnh điều phối."
                  : "Không thể thực thi lệnh điều phối khi hồ sơ đơn thuê chưa tải thành công hoặc có lỗi dữ liệu."}
              </p>
            </div>
          ) : (
            <>
              {/* SHELF 1: PRIMARY GUIDED LEGAL ACTION (TOPMOST IN DOM & ERGONOMICS) */}
              <div className={`${styles.commandShelf} ${styles.primaryCommand}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-champagne)]" />
                  <span className="text-xs font-bold text-[var(--v4-ink)]">
                    Thao tác đơn thuê
                  </span>
                </div>

                {/* Contextual Primary Action Button */}
                {nextRecommendedAction ? (
                  <div className="p-3 rounded bg-[var(--v4-surface-muted)] space-y-2">
                    <p className="text-xs font-medium text-[var(--v4-ink)]">
                      {nextRecommendedAction.description}
                    </p>
                    <RentalWorkflowChecklist checklist={checklist} disabled={isUpdatingStatus || !canMutate} controls={{
                      contract: canMutate && <SignedContractUpload key={`contract-${activeRental.id}`} rental={activeRental} refresh={refetchRental} />,
                      inspection: <TechnicianAssignmentForm key={`${activeRental.id}-${activeRental.status}`} rental={activeRental} refresh={refetchRental} compact embedded showApprovalAction={false} />,
                      payment: <CashReceiptPanel key={`payment-${activeRental.id}`} rental={activeRental} refresh={refetchRental} compact embedded />,
                    }} />
                    <button
                      id="rental-primary-action"
                      aria-label={nextRecommendedAction.label}
                      type="button"
                      onClick={() => handleInitiateStatusChange(nextRecommendedAction.targetStatus)}
                      disabled={isUpdatingStatus || !canMutate || !checklist.ready}
                      className={nextRecommendedAction.consequential ? styles.consequentialActionButton : styles.primaryActionButton}
                    >
                      {isUpdatingStatus ? "Đang xử lý..." : nextRecommendedAction.buttonLabel}
                    </button>
                    {nextRecommendedAction.targetStatus === "renting" && paymentBlocker && <p className="text-xs text-td-muted">{paymentBlocker}</p>}
                    {rentalTransitionBlocker(activeRental, nextRecommendedAction.targetStatus) && (
                      <div className="space-y-2 text-xs text-[var(--v4-mineral)]">
                        <p>{rentalTransitionBlocker(activeRental, nextRecommendedAction.targetStatus)}</p>
                        <details><summary className="cursor-pointer font-semibold">Hướng dẫn kiểm tra</summary><Link href={`/admin/inspections?rentalId=${activeRental.id}`} className="block font-bold underline">
                          Mở phiếu kiểm tra đơn #{activeRental.id}
                        </Link>
                        <button type="button" onClick={() => void refetchRental()} className={styles.secondaryActionButton}>
                          Tải lại kết quả kiểm tra
                        </button>
                        </details>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs p-2 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-mineral)]">
                    Hồ sơ hợp đồng đã ở trạng thái kết thúc ({activeRental.status}).
                  </div>
                )}
                {["pending", "pre_inspection"].includes(activeRental.status) && <p className="text-xs text-td-muted">Xe chưa bắt đầu thuê. Nút “Đã trả xe” sẽ xuất hiện sau khi xác nhận bàn giao.</p>}

                {["pending", "pre_inspection"].includes(activeRental.status) && <button
                  type="button"
                  onClick={() => handleInitiateStatusChange("cancelled")}
                  disabled={isUpdatingStatus || !canMutate}
                  className={styles.secondaryActionButton}
                >Hủy đơn thuê</button>}

                {statusMessage && (
                  <div role={statusFailed ? "alert" : "status"} aria-live="polite" className="text-xs p-2 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-ink)] font-medium">
                    {statusMessage}
                  </div>
                )}
              </div>

              {!["pre_inspection", "post_inspection"].includes(activeRental.status) && <details className={styles.commandShelf}><summary className="cursor-pointer text-xs font-bold text-td-ink">Kiểm tra phương tiện</summary>
              <TechnicianAssignmentForm key={`${activeRental.id}-${activeRental.status === "post_inspection" || activeRental.status === "completed" ? "post" : "pre"}`} rental={activeRental} refresh={refetchRental} compact showApprovalAction={false} />
              </details>}
              {!activeRental.isSubscription && activeRental.status === "pending" && <details className={styles.commandShelf}><summary className="cursor-pointer text-xs font-bold text-td-ink">Thanh toán đơn thuê</summary>
              <CashReceiptPanel key={`payment-${activeRental.id}`} rental={activeRental} refresh={refetchRental} compact />
              </details>}

              {/* Driver assignment belongs to this rental and its selected vehicle. */}
              {activeRental.hasDriver === true && canAssignRental(activeRental.status) && <details key={`assignment-${activeRental.id}-${activeRental.status}`} className={styles.commandShelf}>
                <summary className="cursor-pointer text-xs font-bold text-td-ink">Phân xe và tài xế</summary>
                <DriverAssignmentForm key={activeRental.id} rental={activeRental} refresh={refetchRental} canMutate={canMutate} compact />
              </details>}

            </>
          )}
        </aside>
        </div>
      </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL FOR TERMINAL ACTIONS (BUSINESS-SAFE DISTINCT COPY)     */}
      {/* ========================================================================= */}
      {isConfirmOpen && activeRental && pendingTargetStatus === "cancelled" && <RentalCancelDialog
        key={activeRental.id}
        rental={activeRental}
        close={() => { setIsConfirmOpen(false); setPendingTargetStatus(null); }}
        refresh={refetchRental}
      />}
      {isConfirmOpen && activeRental && pendingTargetStatus === "completed" && (
        <FormDialog title="Xác nhận hoàn tất & quyết toán hợp đồng" busy={isUpdatingStatus} onClose={() => { setIsConfirmOpen(false); setPendingTargetStatus(null); }}>
          <ValidatedForm validation={statusValidation} onSubmit={() => executeStatusChange("completed")}>
            <p className="text-sm text-td-muted">Hoàn tất đơn thuê #{activeRental.id} sau khi đối chiếu biên bản trả xe và nghĩa vụ thanh toán. Hệ thống thực hiện quyết toán và xử lý tiền cọc {formatCurrencySafe(activeRental.depositPrice)} theo hồ sơ.</p>
            {statusFailed && statusMessage && <p role="alert" className="mt-3 text-sm text-danger">{statusMessage}</p>}
            <FormDialogFooter>
              <button type="button" disabled={isUpdatingStatus} onClick={() => { setIsConfirmOpen(false); setPendingTargetStatus(null); }} className={styles.secondaryActionButton}>Quay lại</button>
              <button type="submit" disabled={isUpdatingStatus || !checklist.ready} className={styles.primaryActionButton}>{isUpdatingStatus ? "Đang xử lý..." : "Xác nhận hoàn tất"}</button>
            </FormDialogFooter>
          </ValidatedForm>
        </FormDialog>
      )}
    </div>
  );
}

export default RentalWorkspaceV4;
