"use client";

import { useEffect, useState } from "react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { rentalStatuses } from "./api";
import { rentalDisplayStatus, type RentalTiming } from "./rental-overdue";

export default function RentalOperationalBadge({ rental }: { rental: RentalTiming }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const status = rentalDisplayStatus(rental, now);
  return <AdminStatusBadge domain="rental" status={status}>{rentalStatuses[status] ?? status}</AdminStatusBadge>;
}
