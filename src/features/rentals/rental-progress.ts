export const rentalProgressSteps = [
  { status: "pending", label: "Chờ duyệt" },
  { status: "pre_inspection", label: "Chuẩn bị xe" },
  { status: "renting", label: "Đang thuê" },
  { status: "post_inspection", label: "Kiểm tra trả xe" },
  { status: "completed", label: "Hoàn tất" },
] as const;

export type RentalStepState = "complete" | "current" | "upcoming" | "stopped" | "unknown";

export function getRentalProgress(status: string | null | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  const currentIndex = rentalProgressSteps.findIndex((step) => step.status === normalizedStatus);
  const cancelled = normalizedStatus === "cancelled";
  return {
    cancelled,
    known: currentIndex >= 0 || cancelled,
    steps: rentalProgressSteps.map((step, index) => ({
      ...step,
      state: (cancelled ? "stopped" : currentIndex < 0 ? "unknown" : index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming") as RentalStepState,
    })),
  };
}
