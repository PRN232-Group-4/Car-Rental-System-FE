import { format, parse, isSameDay } from "date-fns";
import { TZDate } from "@date-fns/tz";

/**
 * Múi giờ chính thức duy nhất của hệ thống: GMT+7 (Asia/Ho_Chi_Minh).
 * Quy tắc: Toàn bộ dữ liệu gửi và nhận qua API/DB đều là UTC ISO-8601.
 * Mọi thao tác hiển thị và nhập liệu lịch/giờ tại frontend đều đi qua time.ts.
 */
export const GMT7_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Trả về thời điểm hiện tại theo múi giờ GMT+7.
 */
export function nowGmt7(): TZDate {
  return new TZDate(new Date(), GMT7_TIMEZONE);
}

/**
 * Chuyển đổi bất kỳ đầu vào thời gian nào (Date, chuỗi ISO, timestamp) về chuỗi UTC ISO-8601 chuẩn.
 */
export function toUtcIso(dateInput: Date | string | number): string {
  if (dateInput instanceof Date) {
    return dateInput.toISOString();
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error(`Giá trị ngày giờ không hợp lệ: ${dateInput}`);
  }
  return date.toISOString();
}

/**
 * Parse chuỗi UTC ISO từ backend thành đối tượng TZDate gắn múi giờ Asia/Ho_Chi_Minh.
 */
export function fromUtcIso(isoString: string): TZDate {
  return new TZDate(isoString, GMT7_TIMEZONE);
}

/**
 * Parse chuỗi ngày giờ người dùng nhập tại client thành đối tượng TZDate GMT+7.
 * Hỗ trợ các định dạng phổ biến: 'yyyy-MM-dd HH:mm', 'dd/MM/yyyy HH:mm', 'yyyy-MM-dd', 'dd/MM/yyyy'.
 */
export function parseGmt7Input(input: string, patternStr?: string): TZDate {
  const trimmed = input.trim();
  if (patternStr) {
    const parsed = parse(trimmed, patternStr, new Date());
    return new TZDate(parsed, GMT7_TIMEZONE);
  }

  // Thử lần lượt các định dạng phổ biến
  const candidateFormats = [
    "yyyy-MM-dd'T'HH:mm:ss.SSSX",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss",
    "yyyy-MM-dd HH:mm",
    "dd/MM/yyyy HH:mm",
    "yyyy-MM-dd",
    "dd/MM/yyyy",
  ];

  for (const fmt of candidateFormats) {
    try {
      const parsed = parse(trimmed, fmt, new Date());
      if (!isNaN(parsed.getTime())) {
        return new TZDate(parsed, GMT7_TIMEZONE);
      }
    } catch {
      // Tiếp tục thử định dạng khác
    }
  }

  const fallbackDate = new Date(trimmed);
  if (!isNaN(fallbackDate.getTime())) {
    return new TZDate(fallbackDate, GMT7_TIMEZONE);
  }

  throw new Error(`Không thể nhận diện định dạng ngày giờ GMT+7 từ: "${input}"`);
}

/**
 * Định dạng ngày và giờ theo múi giờ GMT+7. Mặc định: 'HH:mm dd/MM/yyyy'.
 */
export function formatDateTime(
  isoOrDate: string | Date | number,
  patternStr: string = "HH:mm dd/MM/yyyy",
): string {
  try {
    const tzDate =
      isoOrDate instanceof TZDate
        ? isoOrDate
        : new TZDate(new Date(isoOrDate), GMT7_TIMEZONE);
    return format(tzDate, patternStr);
  } catch {
    return "";
  }
}

/**
 * Định dạng chỉ ngày theo múi giờ GMT+7. Mặc định: 'dd/MM/yyyy'.
 */
export function formatDate(
  isoOrDate: string | Date | number,
  patternStr: string = "dd/MM/yyyy",
): string {
  return formatDateTime(isoOrDate, patternStr);
}

/**
 * Định dạng chỉ giờ theo múi giờ GMT+7. Mặc định: 'HH:mm'.
 */
export function formatTime(
  isoOrDate: string | Date | number,
  patternStr: string = "HH:mm",
): string {
  return formatDateTime(isoOrDate, patternStr);
}

/**
 * Định dạng khoảng thời gian thuê theo chuẩn editorial.
 * - Cùng ngày: '08:00 – 17:00 15/10/2026'
 * - Khác ngày: '08:00 15/10/2026 – 17:00 18/10/2026'
 */
export function formatRange(
  startIsoOrDate: string | Date,
  endIsoOrDate: string | Date,
): string {
  try {
    const start =
      startIsoOrDate instanceof TZDate
        ? startIsoOrDate
        : new TZDate(new Date(startIsoOrDate), GMT7_TIMEZONE);
    const end =
      endIsoOrDate instanceof TZDate
        ? endIsoOrDate
        : new TZDate(new Date(endIsoOrDate), GMT7_TIMEZONE);

    if (isSameDay(start, end)) {
      return `${format(start, "HH:mm")} – ${format(end, "HH:mm")} ${format(start, "dd/MM/yyyy")}`;
    }

    return `${format(start, "HH:mm dd/MM/yyyy")} – ${format(end, "HH:mm dd/MM/yyyy")}`;
  } catch {
    return "";
  }
}
