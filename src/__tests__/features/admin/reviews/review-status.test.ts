import { describe, it, expect } from "vitest";
import {
  getReviewStatusMeta,
  calculateReviewImpact,
  STANDARD_HIDE_REASONS,
  REVIEW_STATUS_MAP,
} from "@/features/admin/reviews/review-status";

describe("Review Status & Helpers (FE-25)", () => {
  it("trả về metadata trạng thái chính xác cho visible, hidden và reported", () => {
    const visibleMeta = getReviewStatusMeta("visible");
    expect(visibleMeta.label).toBe("Hiển thị công khai");
    expect(visibleMeta.statusType).toBe("active");

    const hiddenMeta = getReviewStatusMeta("hidden");
    expect(hiddenMeta.label).toBe("Đã ẩn kiểm duyệt");
    expect(hiddenMeta.statusType).toBe("unavailable");

    const reportedMeta = getReviewStatusMeta("reported");
    expect(reportedMeta.label).toBe("Bị báo cáo");
    expect(reportedMeta.statusType).toBe("pending");

    expect(REVIEW_STATUS_MAP.visible.label).toBe("Hiển thị công khai");
  });

  it("danh sách lý do ẩn tiêu chuẩn phải có ít nhất 4 lý do cụ thể và 1 lý do Khác", () => {
    expect(STANDARD_HIDE_REASONS.length).toBeGreaterThanOrEqual(5);
    expect(STANDARD_HIDE_REASONS).toContain("Ngôn từ xúc phạm hoặc thiếu chuẩn mực");
    expect(STANDARD_HIDE_REASONS).toContain("Tiết lộ thông tin cá nhân (số điện thoại, căn cước, địa chỉ...)");
    expect(STANDARD_HIDE_REASONS).toContain("Khác (vui lòng nhập giải trình chi tiết)");
  });

  it("tính toán tác động điểm trung bình chính xác khi ẩn đánh giá thấp (1 sao)", () => {
    // Giả sử điểm TB đang là 4.5 trên 10 lượt đánh giá (tổng 45 điểm)
    // Ẩn 1 đánh giá 1 sao -> tổng điểm mới 44 trên 9 lượt -> 44/9 = 4.89
    const impact = calculateReviewImpact(4.5, 10, 1);
    expect(impact).not.toBeNull();
    expect(impact?.averageBefore).toBe(4.5);
    expect(impact?.averageAfter).toBe(4.89);
    expect(impact?.diff).toBe(0.39);
  });

  it("tính toán tác động điểm trung bình chính xác khi ẩn đánh giá cao (5 sao)", () => {
    // Điểm TB 4.5 trên 10 lượt đánh giá (tổng 45 điểm)
    // Ẩn 1 đánh giá 5 sao -> tổng mới 40 trên 9 lượt -> 40/9 = 4.44
    const impact = calculateReviewImpact(4.5, 10, 5);
    expect(impact).not.toBeNull();
    expect(impact?.averageBefore).toBe(4.5);
    expect(impact?.averageAfter).toBe(4.44);
    expect(impact?.diff).toBe(-0.06);
  });

  it("trả về null nếu điểm trung bình rỗng hoặc tổng số đánh giá <= 1", () => {
    expect(calculateReviewImpact(null, 10, 5)).toBeNull();
    expect(calculateReviewImpact(5.0, 1, 5)).toBeNull();
    expect(calculateReviewImpact(5.0, 0, 5)).toBeNull();
  });
});
