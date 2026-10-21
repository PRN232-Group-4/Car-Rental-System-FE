import type { ReviewStatus } from "./types";

export interface ReviewStatusMeta {
  label: string;
  statusType: string;
  description: string;
}

export const REVIEW_STATUS_MAP: Record<ReviewStatus, ReviewStatusMeta> = {
  unavailable: { label: "Chưa có dữ liệu kiểm duyệt", statusType: "unavailable", description: "API chỉ cung cấp nội dung và điểm đánh giá." },
  visible: {
    label: "Hiển thị công khai",
    statusType: "active",
    description: "Đánh giá hiển thị bình thường và tính vào điểm trung bình nhân sự",
  },
  hidden: {
    label: "Đã ẩn kiểm duyệt",
    statusType: "unavailable",
    description: "Đánh giá bị ẩn khỏi giao diện và không tính vào điểm số",
  },
  reported: {
    label: "Bị báo cáo",
    statusType: "pending",
    description: "Nhân viên hoặc hệ thống gắn cờ cần quản lý kiểm tra nội dung",
  },
};

export const STANDARD_HIDE_REASONS = [
  "Ngôn từ xúc phạm hoặc thiếu chuẩn mực",
  "Tiết lộ thông tin cá nhân (số điện thoại, căn cước, địa chỉ...)",
  "Spam, quảng cáo hoặc nội dung không liên quan đến chuyến đi",
  "Thông tin sai sự thật đã được đối chiếu camera/hành trình",
  "Khác (vui lòng nhập giải trình chi tiết)",
] as const;

export function getReviewStatusMeta(status: ReviewStatus): ReviewStatusMeta {
  return (
    REVIEW_STATUS_MAP[status] ?? {
      label: status,
      statusType: "unavailable",
      description: "",
    }
  );
}

/**
 * Tính toán tác động của việc ẩn một đánh giá tới điểm trung bình của nhân sự.
 * Nếu ẩn đánh giá (xóa khỏi tập visible), điểm mới sẽ thay đổi như thế nào.
 */
export function calculateReviewImpact(
  currentAvg: number | null,
  totalCount: number,
  rating: number
): { averageBefore: number; averageAfter: number; diff: number } | null {
  if (currentAvg === null || totalCount <= 1) {
    return null;
  }

  const currentTotalScore = currentAvg * totalCount;
  const newTotalScore = currentTotalScore - rating;
  const newCount = totalCount - 1;
  const newAvg = Number((newTotalScore / newCount).toFixed(2));
  const diff = Number((newAvg - currentAvg).toFixed(2));

  return {
    averageBefore: currentAvg,
    averageAfter: newAvg,
    diff,
  };
}
