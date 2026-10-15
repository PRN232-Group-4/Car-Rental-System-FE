/**
 * Định dạng số tiền Việt Nam Đồng (VND).
 * Quy chuẩn: 900.000đ (dùng dấu chấm phân cách hàng nghìn, kết thúc bằng chữ 'đ' thường, không khoảng trắng thừa).
 */
export function formatVnd(amount: number): string {
  if (isNaN(amount)) return "0đ";
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted}đ`;
}

/**
 * Định dạng tỷ lệ phần trăm (%).
 * Tự động chuyển đổi nếu giá trị truyền vào dạng thập phân (0.15 -> 15%).
 */
export function formatPercent(rate: number, decimals: number = 0): string {
  if (isNaN(rate)) return "0%";
  const normalized = Math.abs(rate) <= 1 && rate !== 0 ? rate * 100 : rate;
  return `${normalized.toFixed(decimals)}%`;
}

/**
 * Định dạng khoảng cách theo Kilomet (km).
 * Ví dụ: 1250 -> "1.250 km".
 */
export function formatKm(distance: number): string {
  if (isNaN(distance)) return "0 km";
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Math.round(distance));
  return `${formatted} km`;
}

/**
 * Định dạng thời lượng tính bằng phút thành chuỗi ngày / giờ / phút trực quan.
 * Ví dụ: 45 -> "45 phút", 90 -> "1 giờ 30 phút", 1500 -> "1 ngày 1 giờ".
 */
export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return "0 phút";

  const days = Math.floor(minutes / (24 * 60));
  const remainingMinutesAfterDays = minutes % (24 * 60);
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const mins = remainingMinutesAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours} giờ`);
  if (mins > 0 && days === 0) parts.push(`${mins} phút`);

  return parts.length > 0 ? parts.join(" ") : "0 phút";
}
