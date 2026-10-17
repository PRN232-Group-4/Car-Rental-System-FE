import { describe, it, expect } from "vitest";
import {
  getReportStatusMeta,
  getReportTypeLabel,
  isSlaBreached,
  getWaitTimeText,
  getAllowedNextStatuses,
} from "@/features/admin/reports/report-status";

describe("Admin Reports (FE-19) - Status & SLA Logic", () => {
  describe("getReportStatusMeta", () => {
    it("ánh xạ chính xác các trạng thái tiêu chuẩn", () => {
      expect(getReportStatusMeta("new").label).toBe("Mới tiếp nhận");
      expect(getReportStatusMeta("new").statusType).toBe("pending");

      expect(getReportStatusMeta("in_progress").label).toBe("Đang xử lý");
      expect(getReportStatusMeta("in_progress").statusType).toBe("rented");

      expect(getReportStatusMeta("resolved").label).toBe("Đã giải quyết");
      expect(getReportStatusMeta("resolved").statusType).toBe("completed");

      expect(getReportStatusMeta("rejected").label).toBe("Đã từ chối");
      expect(getReportStatusMeta("rejected").statusType).toBe("cancelled");
    });

    it("xử lý an toàn trạng thái lạ từ Backend mà không crash", () => {
      const strange = getReportStatusMeta("unknown_custom_status");
      expect(strange.label).toBe("unknown_custom_status");
      expect(strange.statusType).toBe("unavailable");
    });
  });

  describe("getReportTypeLabel", () => {
    it("ánh xạ đúng các loại sự cố tiêu chuẩn", () => {
      expect(getReportTypeLabel("vehicle_issue")).toBe("Sự cố kỹ thuật xe");
      expect(getReportTypeLabel("accident")).toBe("Tai nạn / Va quẹt");
      expect(getReportTypeLabel("billing")).toBe("Thanh toán & Hóa đơn");
      expect(getReportTypeLabel("staff_attitude")).toBe("Dịch vụ & Nhân viên");
    });

    it("trả về nguyên văn nếu gặp loại chưa biết", () => {
      expect(getReportTypeLabel("custom_incident")).toBe("custom_incident");
    });
  });

  describe("isSlaBreached - Quy tắc kiểm tra quá hạn SLA 24h", () => {
    const NOW = 1700000000000;
    const HOUR = 3600 * 1000;

    it("chưa quá 24h -> không vi phạm SLA", () => {
      const created10hAgo = new Date(NOW - 10 * HOUR).toISOString();
      expect(isSlaBreached(created10hAgo, "new", 24, NOW)).toBe(false);
    });

    it("đã quá 24h và đang ở trạng thái 'new' hoặc 'in_progress' -> vi phạm SLA", () => {
      const created30hAgo = new Date(NOW - 30 * HOUR).toISOString();
      expect(isSlaBreached(created30hAgo, "new", 24, NOW)).toBe(true);
      expect(isSlaBreached(created30hAgo, "in_progress", 24, NOW)).toBe(true);
    });

    it("đã giải quyết ('resolved') hoặc đã từ chối ('rejected') -> không tính vi phạm SLA", () => {
      const created50hAgo = new Date(NOW - 50 * HOUR).toISOString();
      expect(isSlaBreached(created50hAgo, "resolved", 24, NOW)).toBe(false);
      expect(isSlaBreached(created50hAgo, "rejected", 24, NOW)).toBe(false);
    });
  });

  describe("getWaitTimeText", () => {
    const NOW = 1700000000000;
    const MIN = 60 * 1000;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;

    it("định dạng đúng phút", () => {
      const t = new Date(NOW - 35 * MIN).toISOString();
      expect(getWaitTimeText(t, null, NOW)).toBe("35 phút");
    });

    it("định dạng đúng giờ và phút", () => {
      const t = new Date(NOW - (2 * HOUR + 15 * MIN)).toISOString();
      expect(getWaitTimeText(t, null, NOW)).toBe("2 giờ 15 phút");
    });

    it("định dạng đúng ngày", () => {
      const t = new Date(NOW - (3 * DAY + 4 * HOUR)).toISOString();
      expect(getWaitTimeText(t, null, NOW)).toBe("3 ngày 4 giờ");
    });
  });

  describe("getAllowedNextStatuses", () => {
    it("từ 'new' chỉ được chuyển sang 'in_progress' hoặc 'rejected'", () => {
      expect(getAllowedNextStatuses("new")).toEqual(["in_progress", "rejected"]);
    });

    it("từ 'in_progress' chỉ được chuyển sang 'resolved' hoặc 'rejected'", () => {
      expect(getAllowedNextStatuses("in_progress")).toEqual(["resolved", "rejected"]);
    });

    it("từ 'resolved' hoặc 'rejected' là trạng thái cuối, không được chuyển tiếp", () => {
      expect(getAllowedNextStatuses("resolved")).toEqual([]);
      expect(getAllowedNextStatuses("rejected")).toEqual([]);
    });
  });
});
