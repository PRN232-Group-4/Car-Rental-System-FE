"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  RotateCcw,
  Check,
  ShieldAlert,
  Calendar,
  DollarSign,
  FileText,
  Navigation,
  XCircle,
  Eye,
} from "lucide-react";
import {
  getOperationalRental,
  getOperationalDrivers,
  listOperationalRentals,
  assignRental,
  changeRentalStatus,
  operationalError,
  rentalStatuses,
  type OperationalRental,
} from "@/features/operations/api";
import { formatAdminDateTime } from "@/lib/date-time";
import VehicleName from "@/features/admin/VehicleName";
import RentalTrackingPanel from "@/features/maps/RentalTrackingPanel";
import { useInlineValidation, InlineInput, InlineSelect, ValidatedForm } from "@/components/forms/inline-validation";
import TransitDeskStatus from "./TransitDeskStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { gsap } from "@/lib/motion/register";
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

  // Sync with URL query parameter
  useEffect(() => {
    const q = params.get("rentalId");
    if (q && q !== lookupId) {
      setIdInput(q);
      setLookupId(q);
    }
  }, [params, lookupId]);

  // Audit 3: Central Dossier Stage 3D Micro-Tilt & Specular Sheen
  const stageRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLElement>(null);
  const quickToX = useRef<gsap.QuickToFunc | null>(null);
  const quickToY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!stageRef.current) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) return;

    gsap.set(stageRef.current, {
      transformPerspective: 1200,
      transformStyle: "preserve-3d",
    });

    quickToX.current = gsap.quickTo(stageRef.current, "rotationX", {
      duration: 0.5,
      ease: "power2.out",
    });
    quickToY.current = gsap.quickTo(stageRef.current, "rotationY", {
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle micro-tilt capped at +/-0.75 deg
    const targetRotY = relX * 1.5;
    const targetRotX = -relY * 1.5;

    quickToX.current?.(targetRotX);
    quickToY.current?.(targetRotY);

    if (dossierRef.current) {
      const dRect = dossierRef.current.getBoundingClientRect();
      const dx = e.clientX - dRect.left;
      const dy = e.clientY - dRect.top;
      dossierRef.current.style.setProperty("--dossier-mouse-x", `${dx}px`);
      dossierRef.current.style.setProperty("--dossier-mouse-y", `${dy}px`);
      dossierRef.current.style.setProperty("--dossier-sheen-opacity", "1");
    }
  };

  const handleStagePointerLeave = () => {
    quickToX.current?.(0);
    quickToY.current?.(0);
    if (dossierRef.current) {
      dossierRef.current.style.setProperty("--dossier-sheen-opacity", "0");
    }
  };

  const validation = useInlineValidation();
  const session = useOptionalSession();
  // P1-C (Security / Authorization): Fail-closed. If session is absent, deny privileged actions.
  const canOverrideStatus = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const canMutate = Boolean(session?.hasAnyRole(["Admin", "Manager", "Staff", "CustomerService"]));

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
  });

  // Discriminated async state machine (P0-B)
  const detailState: RentalDetailState = useMemo(() => {
    if (!lookupId || !/^[1-9]\d*$/.test(lookupId)) {
      return { status: "idle" };
    }
    if (isFetching) {
      return { status: "loading", id: lookupId };
    }
    if (rentalError) {
      const err = rentalError as any;
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

  // Query driver options
  const { data: drivers = [] } = useQuery({
    queryKey: ["operational-drivers"],
    queryFn: getOperationalDrivers,
  });

  // Query real operational queue
  const { data: queueData, isFetching: isQueueFetching, error: queueError } = useQuery({
    queryKey: ["operational-rentals-queue", queueFilter],
    queryFn: () => listOperationalRentals({ status: queueFilter === "all" ? undefined : queueFilter, page: 1, pageSize: 30 }),
    staleTime: 30000,
  });

  // Driver assignment form state
  const [driverStaffId, setDriverStaffId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);

  // Status transition state
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Terminal confirmation modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<string | null>(null);
  const confirmModalRef = useRef<HTMLDivElement>(null);

  // Pre-fill fields when active rental loads
  useEffect(() => {
    if (activeRental) {
      setSelectedStatus(activeRental.status);
      setAssignMessage(null);
      setStatusMessage(null);
      validation.clear("lookupId");

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
    setIdInput(String(id));
    setLookupId(String(id));
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("rentalId", String(id));
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Handle driver assignment
  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRental || !canMutate) return;

    setIsAssigning(true);
    setAssignMessage(null);
    validation.reset();

    try {
      const staffIdVal = driverStaffId === "" ? null : Number(driverStaffId);
      await assignRental(Number(activeRental.id), staffIdVal);
      setAssignMessage("Đã lưu phân công phương tiện và tài xế.");
      await refetchRental();
      queryClient.invalidateQueries({ queryKey: ["operational-rentals-queue"] });
    } catch (err: unknown) {
      setAssignMessage(operationalError(err));
    } finally {
      setIsAssigning(false);
    }
  };

  // Status transition trigger
  const handleInitiateStatusChange = (targetStatus?: string) => {
    if (!activeRental || !canMutate) return;
    const nextStatus = targetStatus || selectedStatus;
    if (!nextStatus || nextStatus === activeRental.status) {
      setStatusMessage("Vui lòng chọn trạng thái mới khác trạng thái hiện tại.");
      return;
    }

    if (nextStatus === "completed" || nextStatus === "cancelled") {
      setPendingTargetStatus(nextStatus);
      setIsConfirmOpen(true);
      return;
    }

    executeStatusChange(nextStatus);
  };

  // Execute status change
  const executeStatusChange = async (targetStatus: string) => {
    if (!activeRental || !canMutate) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      await changeRentalStatus(Number(activeRental.id), targetStatus);
      setStatusMessage(`Đã cập nhật đơn thuê sang trạng thái: ${rentalStatuses[targetStatus] || targetStatus}`);
      await refetchRental();
      queryClient.invalidateQueries({ queryKey: ["operational-rentals-queue"] });
    } catch (err: unknown) {
      setStatusMessage(operationalError(err));
    } finally {
      setIsUpdatingStatus(false);
      setIsConfirmOpen(false);
      setPendingTargetStatus(null);
    }
  };

  // Close modal on Escape key and trap/restore focus
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isConfirmOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus modal dialog button
      const timer = setTimeout(() => {
        confirmModalRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isConfirmOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConfirmOpen) {
        setIsConfirmOpen(false);
        setPendingTargetStatus(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmOpen]);

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
          label: "Xác nhận & Chuyển sang kiểm tra trước",
          description: "Xác nhận đặt cọc và chuẩn bị bàn giao xe",
          consequential: false,
        };
      case "pre_inspection":
        return {
          targetStatus: "renting",
          label: "Bàn giao xe & Bắt đầu chuyến",
          description: "Khách đã ký nhận biên bản bàn giao",
          consequential: false,
        };
      case "renting":
        return {
          targetStatus: "post_inspection",
          label: "Thu hồi xe & Kiểm tra trả",
          description: "Tiếp nhận xe trả tại trạm và kiểm tra hiện trạng",
          consequential: false,
        };
      case "post_inspection":
        return {
          targetStatus: "completed",
          label: "Quyết toán & Hoàn tất hợp đồng",
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
        ref={stageRef}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
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
                  <TransitDeskStatus domain="rental" status={activeRental.status} className="scale-90 origin-left">
                    {rentalStatuses[activeRental.status] || activeRental.status}
                  </TransitDeskStatus>
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
                      <TransitDeskStatus domain="rental" status={item.status} className="scale-90 origin-right">
                        {rentalStatuses[item.status || ""] || item.status}
                      </TransitDeskStatus>
                    </div>
                    <div className="text-xs font-semibold text-[var(--v4-ink)] truncate">
                      {item.vehicleName || "Phương tiện #" + item.vehicleId}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--v4-mineral)]">
                      <span>{item.rentalType === "hourly" ? "Thuê giờ" : "Dài hạn"}</span>
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
        <main
          ref={dossierRef}
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
            </div>

            {activeRental && (
              <div className="flex items-center gap-2">
                <TransitDeskStatus domain="rental" status={activeRental.status}>
                  {rentalStatuses[activeRental.status] || activeRental.status}
                </TransitDeskStatus>
                {activeRental.contractLink && (
                  <a
                    href={activeRental.contractLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--v4-marine)] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Hợp đồng số</span>
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
                        {OPERATIONAL_STEPS[currentStepIndex].sub}
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
                        {activeRental.hasDriver ? "Có tài xế" : "Khách tự lái"} · {activeRental.rentalType === "hourly" ? "Thuê giờ" : "Dài hạn"}
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
                    Hợp đồng điện tử #{activeRental.id}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="space-y-0.5 p-2 rounded bg-[var(--v4-surface-muted)]">
                    <span className="text-[10px] font-semibold text-[var(--v4-mineral)] block">
                      01. Ký kết hợp đồng
                    </span>
                    <div className="font-mono font-bold text-[var(--v4-ink)] text-[11px]">
                      {activeRental.signedAt ? formatAdminDateTime(activeRental.signedAt) : "Chưa hoàn tất ký số"}
                    </div>
                    <span className="text-[10px] text-[var(--v4-mineral)] block truncate">
                      {activeRental.signedAt ? "Đã xác thực chữ ký điện tử" : "Đang chờ khách hàng ký"}
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
                        ? "Đã tất toán & bàn giao xe"
                        : "Hạn trả xe dự kiến"}
                    </span>
                  </div>
                </div>
              </div>

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
              <div className={styles.commandShelf}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-champagne)]" />
                  <span className="text-xs font-bold text-[var(--v4-ink)]">
                    Lệnh khuyến nghị hợp lệ
                  </span>
                </div>

                {/* Contextual Primary Action Button */}
                {nextRecommendedAction ? (
                  <div className="p-3 rounded bg-[var(--v4-surface-muted)] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--v4-mineral)] block">
                      Hành động tiếp theo hợp lệ
                    </span>
                    <p className="text-xs font-medium text-[var(--v4-ink)]">
                      {nextRecommendedAction.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleInitiateStatusChange(nextRecommendedAction.targetStatus)}
                      disabled={isUpdatingStatus || !canMutate}
                      className={nextRecommendedAction.consequential ? styles.consequentialActionButton : styles.primaryActionButton}
                    >
                      {isUpdatingStatus ? "Đang xử lý..." : nextRecommendedAction.label}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs p-2 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-mineral)]">
                    Hồ sơ hợp đồng đã ở trạng thái kết thúc ({activeRental.status}).
                  </div>
                )}

                {statusMessage && (
                  <div className="text-xs p-2 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-ink)] font-medium">
                    {statusMessage}
                  </div>
                )}
              </div>

              {/* SHELF 2: VEHICLE & DRIVER ASSIGNMENT (MIDDLE SHELF) */}
              <div className={styles.commandShelf}>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[var(--color-champagne)]" />
                  <span className="text-xs font-bold text-[var(--v4-ink)]">
                    Phân xe và tài xế
                  </span>
                </div>

                <form onSubmit={handleAssignDriver} className="space-y-3">
                  <div>
                    <label
                      htmlFor="driver-select"
                      className="block text-xs font-medium text-[var(--v4-mineral)] mb-1"
                    >
                      Tài xế nhận lệnh
                    </label>
                    <select
                      id="driver-select"
                      aria-label="Tài xế nhận lệnh"
                      value={driverStaffId}
                      onChange={(e) => setDriverStaffId(e.target.value)}
                      className={styles.inputField}
                      disabled={isAssigning || !canMutate}
                    >
                      <option value="">-- Không chỉ định (Khách tự lái) --</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} ({d.facilityName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    onClick={handleAssignDriver}
                    disabled={isAssigning || !canMutate}
                    className={styles.primaryActionButton}
                  >
                    {isAssigning ? "Đang lưu..." : "Lưu phân công"}
                  </button>

                  {!canMutate && (
                    <div className="text-[11px] p-2 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-mineral)] font-medium">
                      Tài khoản chỉ có quyền tra cứu, không thể phân công tài xế.
                    </div>
                  )}

                  {assignMessage && (
                    <div className="text-xs p-2 rounded bg-[var(--v4-surface-muted)] text-[var(--v4-ink)] font-medium">
                      {assignMessage}
                    </div>
                  )}
                </form>
              </div>

              {/* SHELF 3: COLLAPSED MANUAL OVERRIDE (BOTTOM SHELF) */}
              {canOverrideStatus && (
                <div className={styles.commandShelf}>
                  <details className={styles.overrideDisclosure}>
                    <summary className={styles.overrideSummary}>
                      <span>Ghi đè trạng thái thủ công</span>
                      <span className={styles.overrideBadge}>
                        Quản trị
                      </span>
                    </summary>

                    <div className="space-y-2 pt-2 mt-1">
                      <label
                        htmlFor="rental-next-status"
                        className="block text-[11px] font-medium text-[var(--v4-mineral)]"
                      >
                        Thao tác chuyển bước
                      </label>
                      <select
                        id="rental-next-status"
                        aria-label="Thao tác chuyển bước"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className={styles.inputField}
                        disabled={isUpdatingStatus || !canMutate}
                      >
                        <option value="pending">Tiếp nhận & Xác nhận (pending)</option>
                        <option value="pre_inspection">Kiểm tra trước thuê (pre_inspection)</option>
                        <option value="renting">Bàn giao & Đang thuê (renting)</option>
                        <option value="post_inspection">Nhận xe & Kiểm tra trả (post_inspection)</option>
                        <option value="completed">Hoàn tất & Quyết toán (completed)</option>
                        <option value="cancelled">Hủy hợp đồng thuê (cancelled)</option>
                      </select>

                      <button
                        type="button"
                        aria-label="Xác nhận cập nhật trạng thái"
                        onClick={() => handleInitiateStatusChange()}
                        disabled={isUpdatingStatus || !canMutate || !selectedStatus || selectedStatus === activeRental.status}
                        className={styles.secondaryActionButton}
                      >
                        {isUpdatingStatus ? "Đang cập nhật..." : "Xác nhận cập nhật trạng thái"}
                      </button>
                    </div>
                  </details>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL FOR TERMINAL ACTIONS (BUSINESS-SAFE DISTINCT COPY)     */}
      {/* ========================================================================= */}
      {isConfirmOpen && activeRental && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          ref={confirmModalRef}
        >
          <div className={styles.modalDialog}>
            <div className="flex items-start gap-3">
              <div
                className={
                  pendingTargetStatus === "completed"
                    ? styles.modalIconCompleted
                    : styles.modalIconCancelled
                }
              >
                {pendingTargetStatus === "completed" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 id="confirm-modal-title" className="text-base font-bold text-[var(--v4-ink)]">
                  {pendingTargetStatus === "completed"
                    ? "Xác nhận hoàn tất & quyết toán hợp đồng"
                    : "Xác nhận hủy hợp đồng thuê"}
                </h3>
                <p className="text-xs text-[var(--v4-mineral)] mt-1.5 leading-relaxed">
                  {pendingTargetStatus === "completed" ? (
                    <>
                      Hợp đồng #{activeRental.id} sẽ được xác nhận <span className="font-bold text-[var(--v4-marine)]">Hoàn tất</span>. Hệ thống sẽ khóa biên bản đối chiếu kiểm tra trả xe, tiến hành đối soát tính toán hoàn tiền cọc ({formatCurrencySafe(activeRental.depositPrice)}) và hoàn thành đơn lưu thông. Thao tác này có tính quyết toán quy trình.
                    </>
                  ) : (
                    <>
                      Hợp đồng #{activeRental.id} sẽ bị <span className={styles.modalHighlightCancelled}>Hủy bỏ ngay lập tức</span>. Toàn bộ lịch đặt xe và phân công tài xế liên quan sẽ bị hủy hiệu lực. Thao tác này không thể hoàn tác.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--v4-rule)]">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setPendingTargetStatus(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[var(--v4-mineral)] hover:text-[var(--v4-ink)] transition"
              >
                Hủy bỏ (Esc)
              </button>
              <button
                type="button"
                onClick={() => pendingTargetStatus && executeStatusChange(pendingTargetStatus)}
                className={
                  pendingTargetStatus === "completed"
                    ? styles.modalConfirmCompletedBtn
                    : styles.modalConfirmCancelledBtn
                }
              >
                {pendingTargetStatus === "completed" ? "Xác nhận hoàn tất" : "Xác nhận hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalWorkspaceV4;
