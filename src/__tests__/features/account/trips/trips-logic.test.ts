import { describe, it, expect } from "vitest";
import { getTripRemainingTime } from "@/features/account/trips/hooks";
import { fetchCancellationPreview } from "@/features/account/trips/api";

describe("FE-07 My Trips — Unit Logic Tests", () => {
  describe("getTripRemainingTime — Tính toán đếm ngược và cảnh báo quá giờ", () => {
    it("tính chính xác thời gian còn lại khi chưa đến giờ trả xe", () => {
      const now = 1767225600000; // Mốc giả lập
      const end = new Date(now + (2 * 3600 + 15 * 60) * 1000).toISOString(); // Còn 2h 15m

      const result = getTripRemainingTime(end, now);
      expect(result.isOverdue).toBe(false);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(15);
      expect(result.displayText).toBe("Còn 2 giờ 15 phút");
    });

    it("phát hiện trạng thái quá giờ và trả về thông điệp cảnh báo", () => {
      const now = 1767225600000;
      const end = new Date(now - (1 * 3600 + 30 * 60) * 1000).toISOString(); // Quá 1h 30m

      const result = getTripRemainingTime(end, now);
      expect(result.isOverdue).toBe(true);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
      expect(result.displayText).toBe("Đã quá giờ trả 1 giờ 30 phút");
    });
  });

  describe("Cancellation Preview Rules", () => {
    it("hủy trước 24 giờ nhận xe được miễn phí 100%", async () => {
      // Đơn id 101 là đơn pending cách 48 giờ
      const preview = await fetchCancellationPreview(101);
      expect(preview.canCancel).toBe(true);
      expect(preview.cancellationFee).toBe(0);
      expect(preview.refundPercentage).toBe(100);
      expect(preview.refundAmount).toBe(2700000);
    });
  });
});
