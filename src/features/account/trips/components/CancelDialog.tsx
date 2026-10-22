"use client";

import RentalCancelDialog from "@/features/operations/RentalCancelDialog";
import type { TripDetail } from "../types";

export function CancelDialog({ open, onClose, trip, onSuccess }: {
  open: boolean;
  onClose: () => void;
  trip: TripDetail;
  onSuccess?: () => unknown;
}) {
  if (!open) return null;
  return <RentalCancelDialog rental={trip} audience="customer" close={onClose} refresh={async () => { await onSuccess?.(); }} />;
}
