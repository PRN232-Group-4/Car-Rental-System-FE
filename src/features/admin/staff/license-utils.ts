import { fromUtcIso, nowGmt7, parseGmt7Input } from "@/lib/time";
import type { LicenseState, IneligibleReasonCode } from "./types";

/** Ngưỡng cảnh báo bằng lái sắp hết hạn theo đặc tả: 30 ngày */
export const EXPIRING_THRESHOLD_DAYS = 30;

export interface LicenseCalculation {
  state: LicenseState;
  daysRemaining?: number;
  label: string;
}

/**
 * Tính toán trạng thái hiệu lực của giấy phép lái xe theo ngày lịch GMT+7.
 * - Missing: Không có ngày hết hạn hoặc chuỗi rỗng
 * - Expired: Ngày hết hạn đã qua so với hôm nay (diffDays < 0)
 * - Expiring: Còn hạn nhưng <= 30 ngày (0 <= diffDays <= 30)
 * - Valid: Còn hạn trên 30 ngày (diffDays > 30)
 */
export function getLicenseState(
  expiryDateStr?: string | null,
  referenceNow?: Date
): LicenseCalculation {
  if (!expiryDateStr || !expiryDateStr.trim()) {
    return {
      state: "missing",
      label: "Chưa có GPLX",
    };
  }

  try {
    const now = referenceNow ? fromUtcIso(referenceNow.toISOString()) : nowGmt7();
    const expiry = parseGmt7Input(expiryDateStr);

    // Tính mốc 00:00 của cả 2 ngày theo GMT+7
    const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const expiryMidnight = new Date(Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()));

    const diffMs = expiryMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        state: "expired",
        daysRemaining: diffDays,
        label: `Đã hết hạn (${daysAgo} ngày trước)`,
      };
    }

    if (diffDays <= EXPIRING_THRESHOLD_DAYS) {
      return {
        state: "expiring",
        daysRemaining: diffDays,
        label: diffDays === 0 ? "Hết hạn hôm nay" : `Sắp hết hạn (${diffDays} ngày)`,
      };
    }

    return {
      state: "valid",
      daysRemaining: diffDays,
      label: "Còn hạn",
    };
  } catch {
    return {
      state: "missing",
      label: "GPLX không hợp lệ",
    };
  }
}

/**
 * Ánh xạ mã lý do tài xế không đủ điều kiện sang tiếng Việt thân thiện (A9/FE-24)
 */
export function mapIneligibleReason(reason: IneligibleReasonCode): string {
  switch (reason) {
    case "BUSY":
      return "Đã có lịch trùng hoặc vi phạm thời gian đệm 60 phút";
    case "LICENSE_EXPIRING":
      return "GPLX sắp hết hạn trước hoặc trong khoảng thời gian thuê";
    case "LICENSE_EXPIRED":
      return "Giấy phép lái xe đã hết hạn";
    case "INACTIVE":
      return "Tài khoản nhân viên đang bị khóa hoặc ngừng hoạt động";
    case "NOT_DRIVER":
      return "Nhân viên chưa được đăng ký làm tài xế";
    default:
      return reason;
  }
}

/**
 * Danh sách hạng GPLX được cấu hình động theo luật giao thông
 * (Không hardcode đóng kín — cho phép mở rộng)
 */
export const PERMITTED_LICENSE_TYPES = [
  "B1",
  "B2",
  "C",
  "D",
  "E",
  "FB2",
  "FC",
  "FD",
  "FE",
] as const;

export type PermittedLicenseType = (typeof PERMITTED_LICENSE_TYPES)[number];
