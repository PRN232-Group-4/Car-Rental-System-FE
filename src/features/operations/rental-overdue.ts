export type RentalTiming = { status: string; endTime?: string | null; returnedAt?: string | null; isOverdue?: boolean };

// PostgreSQL timestamp values are UTC; older API responses omit the trailing zone.
export function rentalTimestamp(value?: string | null): number {
  if (!value) return NaN;
  return Date.parse(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value) ? `${value}Z` : value);
}

export function rentalDisplayStatus(rental: RentalTiming, now = Date.now()): string {
  if (rental.status !== "renting" || rental.returnedAt) return rental.status;
  const due = rentalTimestamp(rental.endTime);
  return (Number.isFinite(due) ? due < now : rental.isOverdue === true) ? "overdue" : rental.status;
}
