const adminTimeZone = "Asia/Ho_Chi_Minh";
const emptyDate = "—";
const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: adminTimeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Display API timestamps in the operations team's time zone, at minute precision. */
export function formatAdminDateTime(value?: string | Date | null): string {
  if (!value) return emptyDate;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return emptyDate;
  const parts = dateTimeFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("day")}/${part("month")}/${part("year")} ${part("hour")}:${part("minute")}`;
}

/** Calendar dates have no time zone; keep the date supplied by the API unchanged. */
export function formatAdminDate(value?: string | null): string {
  if (!value) return emptyDate;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!match) return emptyDate;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) return emptyDate;
  return `${day}/${month}/${year}`;
}

/** Preview a native datetime-local value without reinterpreting its wall-clock time. */
export function formatLocalDateTime(value?: string | null): string {
  if (!value) return emptyDate;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value);
  if (!match || Number(match[2]) > 23 || Number(match[3]) > 59) return emptyDate;
  const date = formatAdminDate(match[1]);
  return date === emptyDate ? emptyDate : `${date} ${match[2]}:${match[3]}`;
}
