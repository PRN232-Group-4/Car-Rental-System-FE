import type { ReportStatus, ReportType } from "./types";

export const REPORT_SLA_HOURS = 24;

export interface StatusMeta {
  label: string;
  statusType: string;
  description: string;
}

export const REPORT_STATUS_MAP: Record<string, StatusMeta> = {
  new: {
    label: "Mới tiếp nhận",
    statusType: "pending",
    description: "Khách vừa gửi, đang chờ nhân viên kiểm tra",
  },
  in_progress: {
    label: "Đang xử lý",
    statusType: "rented",
    description: "Nhân viên đang phối hợp kỹ thuật hoặc khách hàng",
  },
  resolved: {
    label: "Đã giải quyết",
    statusType: "completed",
    description: "Sự cố đã được khắc phục hoàn tất",
  },
  rejected: {
    label: "Đã từ chối",
    statusType: "cancelled",
    description: "Báo cáo không hợp lệ hoặc ngoài phạm vi hỗ trợ",
  },
};

export const REPORT_TYPE_MAP: Record<string, string> = {
  vehicle_issue: "Sự cố kỹ thuật xe",
  accident: "Tai nạn / Va quẹt",
  billing: "Thanh toán & Hóa đơn",
  staff_attitude: "Dịch vụ & Nhân viên",
  cleanliness: "Vệ sinh phương tiện",
  other: "Phản ánh khác",
};

/**
 * Lấy metadata trạng thái báo cáo an toàn. Nếu giá trị lạ từ BE thì hiển thị nguyên văn trung tính, không crash.
 */
export function getReportStatusMeta(status: ReportStatus): StatusMeta {
  if (!status) {
    return { label: "Không xác định", statusType: "unavailable", description: "" };
  }
  const key = String(status).toLowerCase();
  return (
    REPORT_STATUS_MAP[key] ?? {
      label: status,
      statusType: "unavailable",
      description: "",
    }
  );
}

/**
 * Lấy nhãn tiếng Việt cho loại báo cáo an toàn.
 */
export function getReportTypeLabel(type: ReportType): string {
  if (!type) return "Chung";
  const key = String(type).toLowerCase();
  return REPORT_TYPE_MAP[key] ?? type;
}

/**
 * Kiểm tra xem báo cáo có bị trễ hạn SLA nội bộ hay không (mặc định 24h).
 * Chỉ áp dụng cho các báo cáo chưa đóng ("new", "in_progress").
 */
export function isSlaBreached(
  createdAtIso: string,
  status: ReportStatus,
  slaHours = REPORT_SLA_HOURS,
  currentTimestamp = Date.now()
): boolean {
  const normStatus = String(status).toLowerCase();
  if (normStatus === "resolved" || normStatus === "rejected") {
    return false;
  }

  const createdTime = new Date(createdAtIso).getTime();
  if (isNaN(createdTime)) return false;

  const diffMs = currentTimestamp - createdTime;
  const slaMs = slaHours * 60 * 60 * 1000;
  return diffMs > slaMs;
}

/**
 * Chuyển khoảng thời gian chờ/xử lý thành chuỗi tiếng Việt dễ hiểu
 * Ví dụ: "chờ 2 giờ", "chờ 3 ngày", "chờ 45 phút".
 */
export function getWaitTimeText(
  createdAtIso: string,
  endTimeIso?: string | null,
  currentTimestamp = Date.now()
): string {
  const startTime = new Date(createdAtIso).getTime();
  if (isNaN(startTime)) return "—";

  const endTime = endTimeIso ? new Date(endTimeIso).getTime() : currentTimestamp;
  const diffMs = Math.max(0, endTime - startTime);

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)} phút`;
  }
  if (diffHours < 24) {
    const remainMins = diffMinutes % 60;
    return remainMins > 0 ? `${diffHours} giờ ${remainMins} phút` : `${diffHours} giờ`;
  }
  const remainHours = diffHours % 24;
  return remainHours > 0 ? `${diffDays} ngày ${remainHours} giờ` : `${diffDays} ngày`;
}

/**
 * Các trạng thái hợp lệ tiếp theo theo quy tắc luồng xử lý:
 * - "new" -> ["in_progress", "rejected"]
 * - "in_progress" -> ["resolved", "rejected"]
 * - "resolved" -> []
 * - "rejected" -> []
 */
export function getAllowedNextStatuses(currentStatus: ReportStatus): ReportStatus[] {
  const norm = String(currentStatus).toLowerCase();
  switch (norm) {
    case "new":
      return ["in_progress", "rejected"];
    case "in_progress":
      return ["resolved", "rejected"];
    default:
      return [];
  }
}
