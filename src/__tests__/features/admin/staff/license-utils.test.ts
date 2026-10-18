import { describe, it, expect } from "vitest";
import {
  getLicenseState,
  mapIneligibleReason,
} from "@/features/admin/staff/license-utils";
import { parseGmt7Input } from "@/lib/time";

describe("FE-24 Admin Staff — License Utils & GMT+7 Boundary Rules", () => {
  // Giả định ngày tham chiếu cố định: 2026-10-17 10:00 GMT+7
  const fixedNow = parseGmt7Input("2026-10-17 10:00");

  it("trả về missing khi không có chuỗi ngày hoặc rỗng", () => {
    expect(getLicenseState(null, fixedNow)).toEqual({
      state: "missing",
      label: "Chưa có GPLX",
    });
    expect(getLicenseState("", fixedNow)).toEqual({
      state: "missing",
      label: "Chưa có GPLX",
    });
    expect(getLicenseState("   ", fixedNow)).toEqual({
      state: "missing",
      label: "Chưa có GPLX",
    });
  });

  it("xác định expired khi ngày hết hạn là hôm qua (2026-10-16)", () => {
    const res = getLicenseState("2026-10-16", fixedNow);
    expect(res.state).toBe("expired");
    expect(res.daysRemaining).toBe(-1);
    expect(res.label).toBe("Đã hết hạn (1 ngày trước)");
  });

  it("xác định expiring khi hết hạn đúng hôm nay (2026-10-17)", () => {
    const res = getLicenseState("2026-10-17", fixedNow);
    expect(res.state).toBe("expiring");
    expect(res.daysRemaining).toBe(0);
    expect(res.label).toBe("Hết hạn hôm nay");
  });

  it("xác định expiring ở đúng ngưỡng biên 30 ngày (2026-11-16)", () => {
    // 17/10 + 30 ngày = 16/11 (tháng 10 có 31 ngày: 31-17 = 14 ngày còn lại của tháng 10 + 16 ngày tháng 11 = 30 ngày)
    const res = getLicenseState("2026-11-16", fixedNow);
    expect(res.state).toBe("expiring");
    expect(res.daysRemaining).toBe(30);
    expect(res.label).toBe("Sắp hết hạn (30 ngày)");
  });

  it("xác định valid ở đúng ngưỡng biên 31 ngày (2026-11-17)", () => {
    // 17/10 + 31 ngày = 17/11
    const res = getLicenseState("2026-11-17", fixedNow);
    expect(res.state).toBe("valid");
    expect(res.daysRemaining).toBe(31);
    expect(res.label).toBe("Còn hạn");
  });

  it("hoạt động chuẩn xác quanh nửa đêm GMT+7 (23:59 vs 00:01)", () => {
    const lateNight = parseGmt7Input("2026-10-17 23:59");
    const earlyMorning = parseGmt7Input("2026-10-18 00:01");

    const resLate = getLicenseState("2026-10-17", lateNight);
    expect(resLate.state).toBe("expiring");
    expect(resLate.daysRemaining).toBe(0);

    const resEarly = getLicenseState("2026-10-17", earlyMorning);
    expect(resEarly.state).toBe("expired");
    expect(resEarly.daysRemaining).toBe(-1);
  });

  it("ánh xạ chính xác các lý do không đủ điều kiện sang tiếng Việt", () => {
    expect(mapIneligibleReason("BUSY")).toContain("Đã có lịch trùng hoặc vi phạm thời gian đệm 60 phút");
    expect(mapIneligibleReason("LICENSE_EXPIRING")).toContain("GPLX sắp hết hạn");
    expect(mapIneligibleReason("LICENSE_EXPIRED")).toContain("đã hết hạn");
    expect(mapIneligibleReason("INACTIVE")).toContain("bị khóa hoặc ngừng hoạt động");
    expect(mapIneligibleReason("NOT_DRIVER")).toContain("chưa được đăng ký làm tài xế");
    expect(mapIneligibleReason("CUSTOM_REASON")).toBe("CUSTOM_REASON");
  });
});
