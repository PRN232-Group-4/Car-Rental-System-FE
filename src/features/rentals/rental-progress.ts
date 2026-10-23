export const rentalProgressSteps = [
  { status: "pending", label: "Chờ duyệt" },
  { status: "pre_inspection", label: "Chuẩn bị xe" },
  { status: "renting", label: "Đang thuê" },
  { status: "post_inspection", label: "Kiểm tra trả xe" },
  { status: "completed", label: "Hoàn tất" },
] as const;

export type RentalStepState = "complete" | "current" | "upcoming" | "stopped" | "unknown";

/** FR-042: trạng thái dừng tiến trình nhưng không phải khách/staff hủy đơn. */
export const RENTAL_STOPPED_STATUSES = ["cancelled", "expired"] as const;

/** Nhãn tiếng Việt cho mọi trạng thái đơn thuê, kể cả trạng thái không nằm trong tiến trình. */
export const rentalStatusLabels: Record<string, string> = {
  pending: "Chờ duyệt",
  pre_inspection: "Chuẩn bị xe",
  renting: "Đang thuê",
  post_inspection: "Kiểm tra trả xe",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
};

export function rentalStatusLabel(status: string | null | undefined): string {
  const normalized = status?.trim().toLowerCase() ?? "";
  return rentalStatusLabels[normalized] ?? "Cập nhật trạng thái";
}

export function getRentalProgress(status: string | null | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  const currentIndex = rentalProgressSteps.findIndex((step) => step.status === normalizedStatus);
  const cancelled = normalizedStatus === "cancelled";
  const expired = normalizedStatus === "expired";
  const stopped = cancelled || expired;
  return {
    cancelled,
    expired,
    known: currentIndex >= 0 || stopped,
    steps: rentalProgressSteps.map((step, index) => ({
      ...step,
      state: (stopped ? "stopped" : currentIndex < 0 ? "unknown" : index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming") as RentalStepState,
    })),
  };
}
